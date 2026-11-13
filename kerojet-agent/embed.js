/**
 * PSSDC voice assistant embed.
 *
 * Usage:
 *   <script src="/agent/embed.js"
 *           data-config="default"
 *           data-base-url="/agent"
 *           defer></script>
 *
 * data-config may be "default", a URL/path to a JSON config, or inline JSON.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var config = script.getAttribute("data-config") || "default";
  var baseUrl =
    script.getAttribute("data-base-url") ||
    script.src.replace(/\/embed\.js(\?.*)?$/, "") ||
    "/agent";

  var lastOpen = false;

  var iframe = document.createElement("iframe");
  iframe.title = "Kerojet AI Voice Assistant";
  iframe.setAttribute("allow", "microphone; autoplay; clipboard-write");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("allowtransparency", "true");
  iframe.src = baseUrl + "/?config=" + encodeURIComponent(config);

  function isMobile() {
    return window.innerWidth <= 640 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  }

  function applySize(open, width, height) {
    if (!iframe) return;
    var s = iframe.style;
    s.position = "fixed";
    s.zIndex = "2147483000";
    s.border = "0";
    s.outline = "none";
    s.background = "transparent";
    s.overflow = "hidden";
    s.boxShadow = "none";
    s.transition =
      "width 0.28s cubic-bezier(0.19,1,0.22,1), height 0.28s cubic-bezier(0.19,1,0.22,1), border-radius 0.2s ease";

    if (open && isMobile()) {
      s.left = "0";
      s.top = "0";
      s.right = "0";
      s.bottom = "0";
      s.width = "100%";
      s.height = "100%";
      s.borderRadius = "0";
      document.documentElement.style.overflow = "hidden";
      return;
    }

    document.documentElement.style.overflow = "";
    s.left = "auto";
    s.top = "auto";
    s.right = "20px";
    s.bottom = "20px";
    s.width = (width || 80) + "px";
    s.height = (height || 80) + "px";
    s.borderRadius = open ? "18px" : "16px";
  }

  applySize(false, 80, 80);
  if (document.body) document.body.appendChild(iframe);
  else document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(iframe); }, { once: true });

  window.addEventListener("message", function (event) {
    if (!iframe || event.source !== iframe.contentWindow) return;
    var data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "agent-widget-resize") {
      lastOpen = !!data.isOpen;
      applySize(lastOpen, data.width, data.height);
    }

    if (data.type === "agent-navigate" && typeof data.url === "string") {
      window.location.href = data.url;
    }

    // The assistant asks this top window to open a link in a new tab so the
    // live call inside the iframe keeps running.
    if (data.type === "agent-open-tab" && typeof data.url === "string") {
      var opened = false;
      try {
        var win = window.open(data.url, "_blank");
        if (win) {
          try { win.opener = null; } catch (e) { /* ignore */ }
          opened = true;
        }
      } catch (err) {
        opened = false;
      }
      if (!opened) showOpenToast(data.url);
      if (data.token) {
        iframe.contentWindow.postMessage(
          { type: "agent-open-tab-result", ok: opened, token: data.token },
          "*"
        );
      }
    }
  });

  // Popup blocked: give the visitor a real link they can click themselves.
  function showOpenToast(url) {
    var host = document.body || document.documentElement;
    if (!host || host.querySelector("[data-agent-open-toast]")) return;
    var toast = document.createElement("div");
    toast.setAttribute("data-agent-open-toast", "1");
    toast.style.cssText =
      "position:fixed;left:20px;bottom:20px;z-index:2147483000;max-width:min(420px,calc(100vw - 40px));" +
      "background:#ffffff;color:#12241a;border:1px solid rgba(6,117,46,.35);border-radius:14px;" +
      "box-shadow:0 12px 32px rgba(7,40,22,.25);padding:14px 40px 14px 16px;font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;";
    var note = document.createElement("div");
    note.textContent = "The assistant opened a page for you. Tap to open it:";
    note.style.cssText = "margin-bottom:6px;font-weight:600;";
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    link.style.cssText = "color:#c8102e;word-break:break-all;text-decoration:underline;";
    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Dismiss");
    close.style.cssText =
      "position:absolute;top:6px;right:8px;border:0;background:transparent;color:#6b7f73;" +
      "font-size:16px;line-height:1;cursor:pointer;padding:4px;";
    close.addEventListener("click", function () { toast.remove(); });
    toast.style.position = "fixed";
    toast.appendChild(note);
    toast.appendChild(link);
    toast.appendChild(close);
    host.appendChild(toast);
    window.setTimeout(function () { toast.remove(); }, 45000);
  }

  window.addEventListener("resize", function () {
    if (!lastOpen) return;
    applySize(true, 420, 620);
  });
})();
