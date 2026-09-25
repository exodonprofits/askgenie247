import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY =
  Deno.env.get("OPENAI_API_KEY") ||
  Deno.env.get("OPEN_API_Key") ||
  Deno.env.get("OPEN_API_KEY") ||
  Deno.env.get("OpenAI_API_Key");

const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.6-luna";

// --- Usage limits (all optional secrets; defaults below) ---
// ALLOWED_ORIGINS: comma-separated site origins, e.g. "https://askgenie247.com,http://localhost:8080".
//   When unset, any origin is allowed (the daily limits still apply).
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
const DAILY_READING_LIMIT = Number(Deno.env.get("DAILY_READING_LIMIT") || 8);   // new readings per visitor per UTC day
const DAILY_CHAT_LIMIT = Number(Deno.env.get("DAILY_CHAT_LIMIT") || 15);        // follow-ups + Ask Genie messages per visitor per day
const DAILY_GLOBAL_LIMIT = Number(Deno.env.get("DAILY_GLOBAL_LIMIT") || 500);   // all visitors combined, per kind, per day
const RATE_LIMIT_SALT = Deno.env.get("RATE_LIMIT_SALT") || "askgenie247-v1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Request size caps (characters)
const MAX_IMAGE_CHARS = 6_000_000;   // ~4.5 MB image as a data URL
const MAX_PAYLOAD_CHARS = 30_000;    // everything except the image
const MAX_MESSAGE_CHARS = 4_000;     // one chat message / follow-up question

function corsFor(origin: string | null) {
  const allow = ALLOWED_ORIGINS.length === 0
    ? "*"
    : (origin && ALLOWED_ORIGINS.includes(origin) ? origin : "");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (allow) headers["Access-Control-Allow-Origin"] = allow;
  return headers;
}

function json(data: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown";
}

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function rpc(fn: string, args: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`${fn} failed (${res.status}): ${await res.text()}`);
  return await res.json();
}

// Returns { allowed, reason }. Fails open (allowed) if the database is unreachable,
// so an outage doesn't take the app down; the OpenAI budget cap is the backstop.
async function claimUsage(visitor: string, kind: "reading" | "chat") {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return { allowed: true, reason: "" };
  try {
    const rows = await rpc("askgenie_claim_usage", {
      p_visitor: visitor,
      p_kind: kind,
      p_limit: kind === "reading" ? DAILY_READING_LIMIT : DAILY_CHAT_LIMIT,
      p_global_limit: DAILY_GLOBAL_LIMIT,
    });
    const row = Array.isArray(rows) ? rows[0] : rows;
    return { allowed: !!row?.allowed, reason: String(row?.reason || "") };
  } catch (err) {
    console.error("usage claim failed", err);
    return { allowed: true, reason: "" };
  }
}

async function logRequest(entry: Record<string, unknown>) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/askgenie_request_log`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) console.error("request log failed", res.status, await res.text());
  } catch (err) {
    console.error("request log failed", err);
  }
}

function systemPrompt(type: string, language: string, isFollowup = false) {
  const langRule = language === "vi"
    ? "Write all user-facing content in natural Vietnamese."
    : "Write all user-facing content in natural English.";

  const common = `
You are AskGenie247, a warm entertainment and self-reflection guide.
${langRule}
Do not claim supernatural certainty, scientific prediction, guaranteed outcomes, or hidden knowledge.
Avoid fear-based language. Do not tell the user what they must do.
Keep the tone intriguing, specific, concise, and personalized.
Stay within AskGenie247's purpose: readings, reflection, relationships, and personal questions.
If the user asks for unrelated work (writing code, homework, essays, business documents, translations),
kindly decline in one sentence and invite them back to a reflective question.
Return valid JSON only, matching the requested schema exactly.
`;

  if (isFollowup) return common + `
This is a FOLLOW-UP question about a reading that has already been created.
Answer the user's exact question directly and specifically.
Use previous_reading as context and, for palm reading, use the palm image when relevant.
Do not restart the reading or repeat a generic disclaimer.
Do not claim certainty about future events or another person's private thoughts.
`;

  if (type === "tarot") return common + `
Interpret only the cards the user actually selected. Do not redraw cards.
Use traditional tarot symbolism as reflective storytelling, not factual prediction.
`;

  if (type === "future") return common + `
Create a playful future-themed reflection based on the selected timeframe and focus.
7 days, 30 days, 12 months, and next year must feel materially different in scope.
`;

  if (type === "compatibility") return common + `
Reflect on the interaction signals supplied by the user.
Do not claim to know another person's private feelings.
The local_romantic_signal_score is app-generated and must not be changed.
`;

  if (type === "palm") return common + `
Describe only visible, non-sensitive hand/palm features relevant to entertainment-style palmistry.
Clearly frame palmistry as non-scientific.
Do not infer identity, ethnicity, health, disability, personality disorders, or other sensitive traits.
`;

  if (type === "lucky") return common + `
Create a playful same-day reflection from the deterministic daily_pattern supplied by the app.
The numeric scores, lucky number, lucky color, and best-time window are APP DATA and must not be changed.
Interpret what the pattern suggests the user may want to lean into today.
Make Love, Money, Career, and Social meaningfully different.
Do not claim the numbers are scientifically predictive.
`;

  if (type === "dream") return common + `
Interpret the dream as subjective reflection, not prophecy.
Use the dream text, emotional tone, recurring flag, and standout detail together.
Do not use a rigid dream-dictionary approach. Explain symbols in context.
Do not diagnose mental health conditions, trauma, or disorders.
Do not claim the dream reveals another person's private thoughts or predicts future events.
Focus on emotional processing, current-life parallels, memory, imagination, and useful reflection prompts.
`;

  if (type === "love") return common + `
Interpret the supplied deterministic relationship score_map. Do not change any numeric scores.
The six dimensions are chemistry, communication, emotional connection, conflict compatibility,
shared values, and long-term direction.
Birthdays are only a light entertainment context and must not override the relationship answers.
Do not claim to know the partner's private thoughts or feelings.
Do not declare that the relationship will or will not succeed.
Explain where the couple is naturally strong, where more effort may help, and one practical best_move.
`;

  if (type === "chat") return common + `
You are the main conversational Genie for AskGenie247.
Answer the user's current message using the supplied recent conversation context.
Be warm, thoughtful, concise, and useful. Ask ONE clarifying question only when the missing detail would materially change the answer.
Otherwise answer directly.

Your job is not merely to answer the literal question. When useful, help the user identify the underlying decision,
signal, fear, tradeoff, assumption, or missing information behind the question.

Do not pretend to know another person's private thoughts or feelings.
Do not make guaranteed predictions about the future.
Do not give fear-based mystical claims.
For medical, legal, financial, or safety-critical issues, be clear about uncertainty and encourage appropriate professional help when needed.

When a specialized AskGenie247 experience would genuinely improve the user's experience, set related_experience to one of:
"palm", "dream", "love", "friend", "lucky", "tarot", "future".
Otherwise use an empty string.
Do not force routing; the conversational answer must still stand on its own.
`;

  return common;
}

function followupSchema() {
  return {
    name: "ask_genie_followup",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        answer: { type: "string" },
        followups: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 3 }
      },
      required: ["answer", "followups"]
    }
  };
}

function schemaFor(type: string) {
  if (type === "tarot") return {
    name: "tarot_reading",
    schema: {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        card_readings: {
          type: "array",
          items: {
            type: "object", additionalProperties: false,
            properties: {
              card: { type: "string" },
              position: { type: "string" },
              interpretation: { type: "string" }
            },
            required: ["card", "position", "interpretation"]
          }
        },
        reflection: { type: "string" },
        keywords: { type: "array", items: { type: "string" }, maxItems: 5 },
        followups: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }
      },
      required: ["title","subtitle","card_readings","reflection","keywords","followups"]
    }
  };

  if (type === "future") return {
    name: "future_reading",
    schema: {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" },
        traits: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
        summary: { type: "string" },
        primary: { type: "string" },
        direction: { type: "string" },
        surprise: { type: "string" },
        watch_for: { type: "string" },
        followups: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }
      },
      required: ["title","traits","summary","primary","direction","surprise","watch_for","followups"]
    }
  };

  if (type === "compatibility") return {
    name: "compatibility_reading",
    schema: {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        summary: { type: "string" },
        chemistry: { type: "string" },
        friendship: { type: "string" },
        romance_signal: { type: "string" },
        watch_for: { type: "string" },
        followups: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }
      },
      required: ["title","subtitle","summary","chemistry","friendship","romance_signal","watch_for","followups"]
    }
  };

  if (type === "palm") return {
    name: "palm_reading",
    schema: {
      type: "object", additionalProperties: false,
      properties: {
        archetype: { type: "string" },
        traits: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
        summary: { type: "string" },
        you: { type: "string" },
        love: { type: "string" },
        money_career: { type: "string" },
        future_vibe: { type: "string" },
        hidden_strength: { type: "string" },
        followups: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }
      },
      required: ["archetype","traits","summary","you","love","money_career","future_vibe","hidden_strength","followups"]
    }
  };

  if (type === "lucky") return {
    name: "lucky_today_reading",
    schema: {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" },
        traits: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
        summary: { type: "string" },
        love: { type: "string" },
        money: { type: "string" },
        career: { type: "string" },
        social: { type: "string" },
        best_move: { type: "string" },
        surprise: { type: "string" },
        watch_for: { type: "string" },
        followups: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }
      },
      required: ["title","traits","summary","love","money","career","social","best_move","surprise","watch_for","followups"]
    }
  };

  if (type === "dream") return {
    name: "dream_decoder_reading",
    schema: {
      type: "object", additionalProperties: false,
      properties: {
        title: { type: "string" },
        traits: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
        summary: { type: "string" },
        processing: { type: "string" },
        symbols: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
        symbol_interpretation: { type: "string" },
        emotional: { type: "string" },
        reflection: { type: "string" },
        recurring: { type: "string" },
        hidden: { type: "string" },
        not_overinterpret: { type: "string" },
        followups: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }
      },
      required: ["title","traits","summary","processing","symbols","symbol_interpretation","emotional","reflection","recurring","hidden","not_overinterpret","followups"]
    }
  };


  if (type === "love") return {
    name: "love_compatibility_reading",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        traits: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
        summary: { type: "string" },
        chemistry: { type: "string" },
        communication: { type: "string" },
        emotional: { type: "string" },
        conflict: { type: "string" },
        values: { type: "string" },
        future: { type: "string" },
        biggest_strength: { type: "string" },
        friction_point: { type: "string" },
        best_move: { type: "string" },
        followups: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 }
      },
      required: [
        "title","traits","summary","chemistry","communication","emotional",
        "conflict","values","future","biggest_strength","friction_point","best_move","followups"
      ]
    }
  };


  if (type === "chat") return {
    name: "ask_genie_chat",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        answer: { type: "string" },
        followups: {
          type: "array",
          items: { type: "string" },
          minItems: 0,
          maxItems: 3
        },
        related_experience: {
          type: "string",
          enum: ["", "palm", "dream", "love", "friend", "lucky", "tarot", "future"]
        },
        related_reason: { type: "string" }
      },
      required: ["answer", "followups", "related_experience", "related_reason"]
    }
  };

  throw new Error("Unsupported reading type");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsFor(origin);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
  if (ALLOWED_ORIGINS.length && !(origin && ALLOWED_ORIGINS.includes(origin))) {
    return json({ error: "Origin not allowed" }, 403, cors);
  }
  if (!OPENAI_API_KEY) return json({ error: "OpenAI API key secret is not configured" }, 500, cors);

  const started = Date.now();
  let logEntry: Record<string, unknown> | null = null;

  try {
    const rawBody = await req.text();
    if (rawBody.length > MAX_IMAGE_CHARS + MAX_PAYLOAD_CHARS) {
      return json({ error: "Request too large", code: "TOO_LARGE" }, 413, cors);
    }
    const body = JSON.parse(rawBody);
    const type = String(body.type || "");
    const language = body.language === "vi" ? "vi" : "en";
    const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
    const isFollowup =
      typeof payload.followup_question === "string" &&
      payload.followup_question.trim().length > 0;

    if (!["tarot","future","compatibility","palm","lucky","dream","love","chat"].includes(type)) {
      return json({ error: "Unsupported reading type" }, 400, cors);
    }

    // Keep chat history short so one request can't carry an essay's worth of input.
    if (Array.isArray(payload.conversation)) {
      payload.conversation = payload.conversation.slice(-10).map((m: any) => ({
        role: m?.role === "assistant" ? "assistant" : "user",
        content: String(m?.content || "").slice(0, 2000),
      }));
    }

    const payloadText = JSON.stringify(payload);
    const message = String(payload.message || payload.followup_question || "");
    if (payloadText.length > MAX_PAYLOAD_CHARS || message.length > MAX_MESSAGE_CHARS) {
      return json({ error: "Request too large", code: "TOO_LARGE" }, 413, cors);
    }

    const hasImage =
      type === "palm" &&
      typeof body.imageDataUrl === "string" &&
      body.imageDataUrl.startsWith("data:image/");
    if (hasImage && body.imageDataUrl.length > MAX_IMAGE_CHARS) {
      return json({ error: "Image too large", code: "TOO_LARGE" }, 413, cors);
    }

    // Daily free allowance: new readings and conversation are counted separately.
    const kind: "reading" | "chat" = type === "chat" || isFollowup ? "chat" : "reading";
    const visitor = await sha256Hex(RATE_LIMIT_SALT + "|" + clientIp(req));
    const claim = await claimUsage(visitor, kind);
    if (!claim.allowed) {
      await logRequest({ type, kind, is_followup: isFollowup, has_image: hasImage, model: MODEL,
        status: claim.reason === "global" ? "limited_global" : "limited", latency_ms: Date.now() - started });
      return json({
        ok: false,
        error: "Daily free limit reached",
        code: claim.reason === "global" ? "BUSY" : "DAILY_LIMIT",
        kind,
      }, 429, cors);
    }

    logEntry = { type, kind, is_followup: isFollowup, has_image: hasImage, model: MODEL };

    const content: any[] = [{
      type: "input_text",
      text: payloadText
    }];

    if (hasImage) {
      content.push({ type: "input_image", image_url: body.imageDataUrl });
    }

    const format = type === "chat" ? schemaFor(type) : (isFollowup ? followupSchema() : schemaFor(type));

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: systemPrompt(type, language, isFollowup),
        input: [{ role: "user", content }],
        text: {
          format: {
            type: "json_schema",
            name: format.name,
            strict: true,
            schema: format.schema
          }
        },
        max_output_tokens: 1800
      })
    });

    const raw = await openaiRes.json();
    const usage = {
      input_tokens: raw?.usage?.input_tokens ?? null,
      output_tokens: raw?.usage?.output_tokens ?? null,
    };

    if (!openaiRes.ok) {
      console.error("OpenAI error", raw);
      await logRequest({ ...logEntry, ...usage, status: "openai_error", latency_ms: Date.now() - started });
      return json({ error: "AI request failed" }, 502, cors);
    }

    const outputText =
      raw.output_text ||
      raw.output?.flatMap((item: any) => item.content || [])
        ?.find((c: any) => c.type === "output_text")?.text;

    if (!outputText) {
      await logRequest({ ...logEntry, ...usage, status: "no_text", latency_ms: Date.now() - started });
      return json({ error: "AI returned no text" }, 502, cors);
    }

    const reading = JSON.parse(outputText);
    await logRequest({ ...logEntry, ...usage, status: "ok", latency_ms: Date.now() - started });
    return json({ ok: true, reading }, 200, cors);
  } catch (err) {
    console.error(err);
    if (logEntry) await logRequest({ ...logEntry, status: "error", latency_ms: Date.now() - started });
    return json({ error: "Unexpected server error" }, 500, cors);
  }
});
