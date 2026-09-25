// js/askgenie-ai.js
// Loads public Supabase settings from config.json.
// Keep OPENAI_API_KEY only in Supabase Edge Function secrets.
//
// Also owns two shared UI pieces so feature pages don't each need changes:
// - the "daily free limit reached" notice (shown when the Edge Function returns 429)
// - the optional tip row under each page's Share button (config.json → support.tipUrl)

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

  // ---------- shared UI: language + styles ----------

  const TEXT = {
    en: {
      limitReadingTitle: "You've used today's free readings ✨",
      limitChatTitle: "You've used today's free questions ✨",
      limitBody: "Free readings refresh every day. Come back tomorrow for more.",
      busyTitle: "Genie is resting 🌙",
      busyBody: "So many people visited today that Genie needs a break. Please come back tomorrow.",
      ok: "OK",
      tip: "☕ Enjoying Genie? Buy the Genie a coffee",
      tipShort: "☕ Support the Genie",
      tipNote: "Tips help cover Genie's AI costs."
    },
    vi: {
      limitReadingTitle: "Bạn đã dùng hết lượt xem miễn phí hôm nay ✨",
      limitChatTitle: "Bạn đã dùng hết lượt hỏi miễn phí hôm nay ✨",
      limitBody: "Lượt miễn phí được làm mới mỗi ngày. Hẹn gặp lại bạn ngày mai nhé.",
      busyTitle: "Genie đang nghỉ ngơi 🌙",
      busyBody: "Hôm nay có quá nhiều người ghé thăm nên Genie cần nghỉ một chút. Hẹn gặp lại bạn ngày mai nhé.",
      ok: "Đã hiểu",
      tip: "☕ Thích Genie? Mời Genie một ly cà phê",
      tipShort: "☕ Ủng hộ Genie",
      tipNote: "Tiền tip giúp Genie trang trải chi phí AI."
    }
  };

  function currentLang() {
    try {
      const saved = localStorage.getItem("askgenieLang");
      if (saved === "vi" || saved === "en") return saved;
    } catch (e) {}
    return (navigator.language || "").toLowerCase().startsWith("vi") ? "vi" : "en";
  }

  function t(key) {
    return TEXT[currentLang()][key] || TEXT.en[key];
  }

  function injectStyles() {
    if (document.getElementById("ag-shared-styles")) return;
    const style = document.createElement("style");
    style.id = "ag-shared-styles";
    style.textContent =
      ".ag-tip-row{margin-top:12px;text-align:center}" +
      ".ag-tip-link{display:block;padding:13px 14px;border-radius:16px;border:1px solid rgba(255,214,107,.35);" +
      "background:rgba(255,214,107,.08);color:#ffe08a;font-weight:800;font-size:14px;text-decoration:none;" +
      "-webkit-tap-highlight-color:transparent}" +
      ".ag-tip-link:active{transform:scale(.98)}" +
      ".ag-tip-note{margin-top:6px;font-size:11px;color:#cbbfd6}" +
      ".ag-limit-overlay{position:fixed;inset:0;z-index:100000;background:rgba(5,2,10,.72);display:flex;" +
      "align-items:flex-end;justify-content:center;padding:16px 16px calc(16px + env(safe-area-inset-bottom))}" +
      ".ag-limit-sheet{width:100%;max-width:420px;background:linear-gradient(180deg,#24143a,#140b22);" +
      "border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:22px 18px 18px;color:#fff7ff;" +
      "text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.5);font-family:inherit}" +
      ".ag-limit-sheet img{width:64px;height:64px;object-fit:contain;margin:0 auto 8px;display:block}" +
      ".ag-limit-sheet h3{margin:0 0 8px;font-size:18px;line-height:1.25}" +
      ".ag-limit-sheet p{margin:0 0 16px;font-size:14px;line-height:1.45;color:#cbbfd6}" +
      ".ag-limit-ok{width:100%;min-height:48px;margin-top:10px;border:1px solid rgba(255,255,255,.14);" +
      "border-radius:16px;background:#ffffff0d;color:#fff;font-weight:800;font-size:15px}";
    document.head.appendChild(style);
  }

  function tipLinkEl(url, label) {
    const a = document.createElement("a");
    a.className = "ag-tip-link";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = label;
    return a;
  }

  // ---------- daily limit notice ----------

  let limitOpen = false;

  async function showLimitNotice(code, kind) {
    if (limitOpen) return;
    limitOpen = true;
    injectStyles();

    let tipUrl = "";
    try { tipUrl = (await loadConfig())?.support?.tipUrl || ""; } catch (e) {}

    const overlay = document.createElement("div");
    overlay.className = "ag-limit-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const sheet = document.createElement("div");
    sheet.className = "ag-limit-sheet";

    const img = document.createElement("img");
    img.src = "images/genie-mark.png";
    img.alt = "";

    const title = document.createElement("h3");
    const body = document.createElement("p");
    if (code === "BUSY") {
      title.textContent = t("busyTitle");
      body.textContent = t("busyBody");
    } else {
      title.textContent = kind === "chat" ? t("limitChatTitle") : t("limitReadingTitle");
      body.textContent = t("limitBody");
    }

    sheet.appendChild(img);
    sheet.appendChild(title);
    sheet.appendChild(body);
    if (tipUrl) sheet.appendChild(tipLinkEl(tipUrl, t("tipShort")));

    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "ag-limit-ok";
    ok.textContent = t("ok");
    sheet.appendChild(ok);

    const close = () => { overlay.remove(); limitOpen = false; };
    ok.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    ok.focus();
  }

  // ---------- tip row under Share ----------

  async function mountTipRows() {
    let tipUrl = "";
    try { tipUrl = (await loadConfig())?.support?.tipUrl || ""; } catch (e) { return; }
    if (!tipUrl) return;

    const share = document.getElementById("shareBtn");
    if (!share) return;
    const anchor = share.closest(".bottom-actions") || share;
    if (anchor.nextElementSibling && anchor.nextElementSibling.classList.contains("ag-tip-row")) return;

    injectStyles();
    const row = document.createElement("div");
    row.className = "ag-tip-row";
    const link = tipLinkEl(tipUrl, t("tip"));
    const note = document.createElement("div");
    note.className = "ag-tip-note";
    note.textContent = t("tipNote");
    row.appendChild(link);
    row.appendChild(note);
    anchor.insertAdjacentElement("afterend", row);

    // Pages switch language in place; follow them.
    const toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.addEventListener("click", () => setTimeout(() => {
        link.textContent = t("tip");
        note.textContent = t("tipNote");
      }, 0));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountTipRows);
  } else {
    mountTipRows();
  }

  // ---------- requests ----------

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
      if (res.status === 429 && (data.code === "DAILY_LIMIT" || data.code === "BUSY")) {
        showLimitNotice(data.code, data.kind);
      }
      const err = new Error(data.error || `AskGenie AI request failed (${res.status})`);
      err.code = data.code || "";
      err.status = res.status;
      throw err;
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
