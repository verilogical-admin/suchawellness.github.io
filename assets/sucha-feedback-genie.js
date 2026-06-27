(function () {
  if (window.SuchaFeedbackGenie) return;
  window.SuchaFeedbackGenie = true;

  var API = /(^|\.)suchawellness\.com$/i.test(location.hostname)
    ? location.origin
    : "https://www.suchawellness.com";
  var FEEDBACK_MAMA_API = "https://feedbackmama.com/api";
  var FEEDBACK_MAMA_HANDLE = "chand";
  var page = location.pathname.split("/").pop() || "index.html";

  var style = document.createElement("style");
  style.textContent =
    "#sucha-genie{position:fixed;right:18px;bottom:18px;z-index:1200;font-family:'Jost',system-ui,sans-serif}" +
    "#sucha-genie:before{content:'\\1F9DE';position:absolute;right:2px;top:-20px;width:28px;height:28px;border-radius:50%;background:#fff;border:1px solid rgba(45,122,107,.22);box-shadow:0 8px 20px rgba(45,122,107,.22);display:grid;place-items:center;font-size:17px;line-height:1;z-index:1}" +
    "#sucha-genie-button{width:58px;height:58px;border:0;border-radius:50%;cursor:pointer;background:radial-gradient(circle at 34% 24%,#fff 0 10%,#BEE7DC 12% 34%,#2D7A6B 62%,#15493F 100%);box-shadow:0 16px 38px rgba(45,122,107,.34);color:white;font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:500;display:grid;place-items:center;transition:transform .16s,box-shadow .16s}" +
    "#sucha-genie-button:hover,#sucha-genie-button:focus-visible{transform:translateY(-2px) scale(1.04);box-shadow:0 18px 44px rgba(45,122,107,.42)}" +
    "#sucha-genie-panel{position:absolute;right:0;bottom:72px;width:min(360px,calc(100vw - 28px));background:#fff;border:1px solid rgba(45,122,107,.22);box-shadow:0 24px 70px rgba(23,23,23,.18);display:none;overflow:hidden}" +
    "#sucha-genie-panel.on{display:block}" +
    "#sucha-genie-head{background:#2D7A6B;color:#fff;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px}" +
    "#sucha-genie-head b{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500}#sucha-genie-head span{color:#E6F4EF;font-size:12px}" +
    "#sucha-genie-close{border:0;background:transparent;color:#fff;cursor:pointer;font-size:22px;line-height:1;padding:0 2px}" +
    "#sucha-genie-form{display:grid;gap:10px;padding:14px}" +
    ".sucha-genie-row{display:grid;gap:5px}.sucha-genie-row label{color:#2D7A6B;font-size:12px;font-weight:600}" +
    ".sucha-genie-row input,.sucha-genie-row select,.sucha-genie-row textarea{width:100%;border:1px solid rgba(45,122,107,.22);background:#F9F7F1;color:#171717;font:inherit;font-size:14px;min-height:42px;padding:9px 10px}" +
    ".sucha-genie-row textarea{min-height:104px;resize:vertical}" +
    "#sucha-genie-send{border:0;background:#15493F;color:#fff;cursor:pointer;font:inherit;font-size:12px;font-weight:600;letter-spacing:.12em;min-height:42px;text-transform:uppercase}" +
    "#sucha-genie-send:disabled{cursor:not-allowed;opacity:.62}" +
    "#sucha-genie-status{display:none;border:1px solid rgba(45,122,107,.22);background:#E9F6F1;color:#15493F;font-size:12px;line-height:1.45;padding:9px 10px}" +
    "#sucha-genie-status.err{display:block;background:#FFF1F0;color:#9b2c2c;border-color:#f4b4ad}#sucha-genie-status.ok{display:block}" +
    "#sucha-genie-note,#sucha-genie-brand{color:#4E534A;font-size:12px;line-height:1.45;margin:0}" +
    "#sucha-genie-brand{border-top:1px solid rgba(45,122,107,.18);padding-top:10px}" +
    "#sucha-genie-brand button{background:transparent;border:0;color:#2D7A6B;cursor:pointer;font:inherit;font-weight:600;padding:0;text-align:left}" +
    "#sucha-genie-toast{position:absolute;right:0;bottom:72px;width:min(360px,calc(100vw - 28px));background:#15493F;color:#fff;display:none;font-size:13px;line-height:1.45;padding:12px 14px;box-shadow:0 18px 44px rgba(23,23,23,.2)}" +
    "@media (max-width:900px){#sucha-genie{right:16px;bottom:16px}}" +
    "@media (max-width:640px){#sucha-genie{right:14px;bottom:14px}#sucha-genie-button{width:54px;height:54px;font-size:28px}#sucha-genie-panel,#sucha-genie-toast{position:fixed;left:12px!important;right:12px!important;bottom:82px!important;width:auto!important;max-height:calc(100vh - 104px);overflow:auto}#sucha-genie-form{padding:12px}.sucha-genie-row textarea{min-height:96px}}" +
    "@media (min-width:641px) and (max-width:1024px){#sucha-genie-panel,#sucha-genie-toast{width:min(390px,calc(100vw - 36px))}}";
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "sucha-genie";
  root.innerHTML =
    '<div id="sucha-genie-toast"></div>' +
    '<div id="sucha-genie-panel" aria-hidden="true">' +
      '<div id="sucha-genie-head"><div><b>Sucha Mama</b><br><span>Site feedback, feature requests, experience issues</span></div><button id="sucha-genie-close" type="button" aria-label="Close feedback panel">x</button></div>' +
      '<form id="sucha-genie-form">' +
        '<div class="sucha-genie-row"><label for="sucha-genie-type">Type</label><select id="sucha-genie-type"><option>Feedback</option><option>Feature request</option><option>Issue</option><option>Care platform feedback</option><option>Brand widget request</option></select></div>' +
        '<div class="sucha-genie-row"><label for="sucha-genie-message">Message</label><textarea id="sucha-genie-message" required placeholder="Tell us about the site or product experience. Please do not include medical details here."></textarea></div>' +
        '<div class="sucha-genie-row"><label for="sucha-genie-contact">Contact for reply (optional)</label><input id="sucha-genie-contact" placeholder="Email, phone, or leave blank"></div>' +
        '<button id="sucha-genie-send" type="submit">Send feedback</button>' +
        '<div id="sucha-genie-status" role="status" aria-live="polite"></div>' +
        '<p id="sucha-genie-note">For care matching or clinical support, use the care forms. This feedback widget is for Sucha site and product feedback.</p>' +
        '<p id="sucha-genie-brand">Want a widget like this for your brand? <button type="button" id="sucha-genie-brand-request">Ask FeedbackMama™</button></p>' +
      '</form>' +
    '</div>' +
    '<button id="sucha-genie-button" type="button" aria-label="Open Sucha feedback genie">S</button>';
  document.body.appendChild(root);

  var panel = document.getElementById("sucha-genie-panel");
  var toast = document.getElementById("sucha-genie-toast");
  var bubble = document.getElementById("sucha-genie-button");
  var close = document.getElementById("sucha-genie-close");
  var form = document.getElementById("sucha-genie-form");
  var send = document.getElementById("sucha-genie-send");
  var status = document.getElementById("sucha-genie-status");
  var type = document.getElementById("sucha-genie-type");
  var message = document.getElementById("sucha-genie-message");
  var contact = document.getElementById("sucha-genie-contact");
  var brandRequest = document.getElementById("sucha-genie-brand-request");

  function showToast(text) {
    toast.textContent = text;
    toast.style.display = "block";
    setTimeout(function () { toast.style.display = "none"; }, 4500);
  }

  function togglePanel(force) {
    var on = typeof force === "boolean" ? force : !panel.classList.contains("on");
    panel.classList.toggle("on", on);
    panel.setAttribute("aria-hidden", on ? "false" : "true");
    if (on) message.focus();
  }

  function showStatus(text, tone) {
    status.textContent = text;
    status.className = tone === "err" ? "err" : "ok";
    status.style.display = "block";
  }

  function clearStatus() {
    status.textContent = "";
    status.className = "";
    status.style.display = "none";
  }

  function bytesToBase64(bytes) {
    var binary = "";
    new Uint8Array(bytes).forEach(function (byte) {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function randomBytes(length) {
    var bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  async function encryptForMama(publicKeyJwk, payload) {
    var publicKey = await crypto.subtle.importKey(
      "jwk",
      publicKeyJwk,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
    var contentKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
    var iv = randomBytes(12);
    var ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      contentKey,
      new TextEncoder().encode(JSON.stringify(payload))
    );
    var rawContentKey = await crypto.subtle.exportKey("raw", contentKey);
    var encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawContentKey);
    return {
      ciphertext: bytesToBase64(ciphertext),
      encryptedKey: bytesToBase64(encryptedKey),
      iv: bytesToBase64(iv)
    };
  }

  async function sendBrandRequestToChandMama(text) {
    var profileResponse = await fetch(FEEDBACK_MAMA_API + "/mamas/" + encodeURIComponent(FEEDBACK_MAMA_HANDLE));
    var profile = await profileResponse.json().catch(function () { return {}; });
    if (!profileResponse.ok || !profile.publicKeyJwk) {
      throw new Error(profile.error || "Chand Mama dashboard is not ready for widget requests yet.");
    }
    var encrypted = await encryptForMama(profile.publicKeyJwk, {
      text: text,
      tag: "Brand widget request",
      authorName: contact.value.trim(),
      temporaryHandle: "Sucha Mama widget",
      anonymous: !contact.value.trim(),
      submittedAt: new Date().toISOString(),
      source: "Sucha Wellness feedback widget",
      url: location.href
    });
    var response = await fetch(FEEDBACK_MAMA_API + "/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: FEEDBACK_MAMA_HANDLE,
        ...encrypted,
        tag: "Brand widget request",
        anonymous: !contact.value.trim()
      })
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || data.ok === false) throw new Error(data.error || "Could not send to Chand Mama.");
    return data;
  }

  bubble.addEventListener("click", function () {
    clearStatus();
    togglePanel();
  });

  close.addEventListener("click", function () {
    togglePanel(false);
  });

  brandRequest.addEventListener("click", function () {
    type.value = "Brand widget request";
    message.value = "I want a FeedbackMama™ widget and dashboard for my brand. Please contact me.";
    togglePanel(true);
    contact.focus();
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var text = message.value.trim();
    if (!text) return;
    send.disabled = true;
    send.textContent = "Sending...";
    var isBrandWidgetRequest = type.value === "Brand widget request";
    showStatus(isBrandWidgetRequest ? "Sending to Chand Mama..." : "Sending to Sucha Mama...", "ok");
    try {
      if (isBrandWidgetRequest) {
        var chandData = await sendBrandRequestToChandMama(text);
        form.reset();
        showStatus("Thanks. Chand Mama received your widget request. Ref: " + chandData.id, "ok");
        togglePanel(false);
        showToast("Thanks. Chand Mama received your widget request. Ref: " + chandData.id);
        return;
      }
      var response = await fetch(API + "/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type.value,
          message: text,
          contact: contact.value.trim(),
          product: "Sucha Mama",
          brand: "Sucha Wellness",
          page: page,
          url: location.href,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ""
        })
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok || data.ok === false) throw new Error(data.error || "Could not send feedback.");
      form.reset();
      showStatus("Thanks. Sucha Mama received your note. Ref: " + data.id, "ok");
      togglePanel(false);
      showToast("Thanks. Sucha Mama received your note. Ref: " + data.id);
    } catch (error) {
      showStatus(error.message || "Feedback service is not ready yet. Please try again.", "err");
      showToast(error.message || "Feedback service is not ready yet.");
    } finally {
      send.disabled = false;
      send.textContent = "Send feedback";
    }
  });
})();
