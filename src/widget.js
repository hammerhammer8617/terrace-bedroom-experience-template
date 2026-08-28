import { EXPERIENCE_CONFIG } from "./config.js";

export const WIDGET_URI = "ui://terrace-bedroom/doorway-v1.html";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const { invitation, terrace, bedroom } = EXPERIENCE_CONFIG.doorway;

export const WIDGET_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(EXPERIENCE_CONFIG.server.title)}</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --text: light-dark(#211d25, #f1edf3);
      --muted: light-dark(#746b79, #b1a8b4);
      --line: light-dark(rgba(82, 65, 88, .22), rgba(224, 211, 228, .2));
      --terrace: light-dark(#765785, #b691c7);
      --bedroom: light-dark(#9a712b, #d5ae62);
      --terrace-wash: light-dark(rgba(118, 87, 133, .09), rgba(150, 104, 169, .13));
      --bedroom-wash: light-dark(rgba(164, 123, 50, .08), rgba(178, 129, 50, .12));
    }

    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: transparent; }
    main {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      padding: 9px 2px 5px;
    }
    main::before {
      position: absolute;
      z-index: -1;
      inset: 0;
      content: "";
      background:
        radial-gradient(circle at 15% 80%, var(--terrace-wash), transparent 42%),
        radial-gradient(circle at 86% 25%, var(--bedroom-wash), transparent 40%);
      pointer-events: none;
    }
    .invitation {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 0 12px 11px;
      color: var(--muted);
      font-family: Georgia, "Times New Roman", "Songti SC", serif;
      font-size: 14px;
      font-style: italic;
      line-height: 1.45;
    }
    .invitation-mark {
      color: var(--bedroom);
      font-style: normal;
      font-size: 12px;
    }
    .doors {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }
    button {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;
      min-height: 86px;
      appearance: none;
      border: 0;
      padding: 14px 15px;
      color: var(--text);
      background: transparent;
      text-align: left;
      font: inherit;
      cursor: pointer;
      transition: background-color .18s ease, opacity .18s ease;
    }
    button + button { border-left: 1px solid var(--line); }
    #terrace:hover { background: var(--terrace-wash); }
    #bedroom:hover { background: var(--bedroom-wash); }
    button:active { opacity: .72; }
    button:disabled { cursor: wait; opacity: .55; }
    button:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
    .door-mark {
      width: 20px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 19px;
      text-align: center;
    }
    #terrace .door-mark { color: var(--terrace); }
    #bedroom .door-mark { color: var(--bedroom); }
    .door-title {
      display: block;
      font-family: Georgia, "Times New Roman", "Songti SC", serif;
      font-size: 19px;
      font-weight: 400;
      line-height: 1.2;
    }
    .door-copy {
      display: block;
      margin-top: 5px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.45;
    }
    .door-arrow { color: var(--muted); font-size: 14px; }
    #status { margin: 8px 12px 0; color: var(--muted); font-size: 12px; line-height: 1.4; }
    #status:empty { display: none; }
    @media (max-width: 420px) {
      main { padding-top: 7px; }
      .doors { grid-template-columns: 1fr; }
      button { min-height: 76px; padding: 12px 13px; }
      button + button { border-left: 0; border-top: 1px solid var(--line); }
    }
    @media (prefers-reduced-motion: reduce) {
      button { transition: none; }
    }
  </style>
</head>
<body>
  <main>
    <p class="invitation"><span class="invitation-mark" aria-hidden="true">✦</span><span>${escapeHtml(invitation)}</span></p>
    <div class="doors" role="group" aria-label="选择一种体验">
      <button id="terrace" type="button" data-prompt="${escapeHtml(terrace.prompt)}">
        <span class="door-mark" aria-hidden="true">⌁</span>
        <span><span class="door-title">${escapeHtml(terrace.label)}</span><span class="door-copy">${escapeHtml(terrace.copy)}</span></span>
        <span class="door-arrow" aria-hidden="true">↗</span>
      </button>
      <button id="bedroom" type="button" data-prompt="${escapeHtml(bedroom.prompt)}">
        <span class="door-mark" aria-hidden="true">✦</span>
        <span><span class="door-title">${escapeHtml(bedroom.label)}</span><span class="door-copy">${escapeHtml(bedroom.copy)}</span></span>
        <span class="door-arrow" aria-hidden="true">↗</span>
      </button>
    </div>
    <p id="status" role="status" aria-live="polite"></p>
  </main>
  <script>
    const buttons = [...document.querySelectorAll("button[data-prompt]")];
    const status = document.getElementById("status");
    const pending = new Map();
    let nextId = 1;

    function request(method, params) {
      const id = nextId++;
      window.parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        window.setTimeout(() => {
          if (!pending.has(id)) return;
          pending.delete(id);
          reject(new Error("Host did not answer in time"));
        }, 15000);
      });
    }

    window.addEventListener("message", (event) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== "2.0" || message.id === undefined) return;
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      if (message.error) waiter.reject(message.error);
      else waiter.resolve(message.result);
    }, { passive: true });

    async function sendPrompt(prompt) {
      if (window.openai?.sendFollowUpMessage) {
        return window.openai.sendFollowUpMessage({ prompt, scrollToBottom: true });
      }

      return request("ui/message", {
        role: "user",
        content: [{ type: "text", text: prompt }],
      });
    }

    for (const button of buttons) {
      button.addEventListener("click", async () => {
        buttons.forEach((item) => { item.disabled = true; });
        status.textContent = button.id === "terrace" ? "去乱捞一把…" : "让旧念头彼此靠近…";

        try {
          await sendPrompt(button.dataset.prompt);
          status.textContent = "";
        } catch (error) {
          status.textContent = "没有送达，请在对话框里再说一次。";
          buttons.forEach((item) => { item.disabled = false; });
        }
      });
    }
  </script>
</body>
</html>`;
