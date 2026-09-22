// js/askgenie-ai.js
// Loads public Supabase settings from config.json.
// Keep OPENAI_API_KEY only in Supabase Edge Function secrets.

window.AskGenieAI = (() => {
  let configPromise = null;

  async function loadConfig() {
    if (!configPromise) {
      configPromise = fetch("config.json", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Could not load config.json (${res.status})`);
          return await res.json();
        })
        .then((cfg) => {
          if (!cfg?.supabase?.url || !cfg?.supabase?.anonKey) {
            throw new Error("config.json is missing supabase.url or supabase.anonKey");
          }
          return cfg;
        });
    }
    return configPromise;
  }

  async function request(type, payload, options = {}) {
    const cfg = await loadConfig();
    const functionName = cfg?.ai?.function || "ask-genie-ai";
    const url = `${cfg.supabase.url}/functions/v1/${functionName}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": cfg.supabase.anonKey,
        "Authorization": `Bearer ${cfg.supabase.anonKey}`
      },
      body: JSON.stringify({
        type,
        language: options.language === "vi" ? "vi" : "en",
        payload,
        imageDataUrl: options.imageDataUrl || undefined
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || `AskGenie AI request failed (${res.status})`);
    }
    return data.reading;
  }

  return {
    loadConfig,
    tarot: (payload, options) => request("tarot", payload, options),
    future: (payload, options) => request("future", payload, options),
    compatibility: (payload, options) => request("compatibility", payload, options),
    palm: (payload, options) => request("palm", payload, options),
    lucky: (payload, options) => request("lucky", payload, options),
    dream: (payload, options) => request("dream", payload, options),
    love: (payload, options) => request("love", payload, options),
    chat: (payload, options) => request("chat", payload, options)
  };
})();
