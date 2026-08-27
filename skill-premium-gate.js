(function () {
  "use strict";

  const accessKey = "suchaEmpathyLabAccess.v1";

  function loadAccess() {
    try {
      return JSON.parse(localStorage.getItem(accessKey) || "null");
    } catch {
      localStorage.removeItem(accessKey);
      return null;
    }
  }

  function hasPremiumAccess() {
    const access = loadAccess();
    if (!access || access.active !== true) return false;
    if (!access.expiresAt) return true;
    return Date.parse(access.expiresAt) > Date.now();
  }

  function lockPremiumPage() {
    if (hasPremiumAccess()) return;

    const style = document.createElement("style");
    style.textContent = `
      .premium-gate-banner {
        background: #173f36;
        border-bottom: 1px solid rgba(255,255,255,.16);
        color: white;
        display: grid;
        gap: 10px;
        padding: 18px max(20px, calc((100vw - 1160px) / 2));
      }
      .premium-gate-banner strong {
        color: #efc84a;
        font-family: Georgia, serif;
        font-size: 1.35rem;
        font-weight: 400;
      }
      .premium-gate-banner span {
        color: rgba(255,255,255,.78);
        line-height: 1.5;
        max-width: 860px;
      }
      .premium-gate-banner a {
        background: white;
        color: #245e54;
        display: inline-flex;
        font-size: .78rem;
        font-weight: 950;
        justify-content: center;
        letter-spacing: .1em;
        min-height: 42px;
        padding: 10px 14px;
        text-decoration: none;
        text-transform: uppercase;
        width: fit-content;
      }
      .premium-content-locked {
        filter: blur(2.5px) grayscale(.2);
        max-height: 620px;
        overflow: hidden;
        pointer-events: none;
        user-select: none;
        -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 58%, transparent 100%);
        mask-image: linear-gradient(180deg, #000 0%, #000 58%, transparent 100%);
      }
    `;
    document.head.appendChild(style);

    const banner = document.createElement("section");
    banner.className = "premium-gate-banner";
    banner.innerHTML = `
      <strong>EQ Lab Premium module</strong>
      <span>This Sucha Skill Lab module is included with the Empathy + EQ Labs Premium bundle. Unlock from EQ Lab, then return here in the same browser.</span>
      <a href="/eq-lab#access">Unlock in EQ Lab</a>
    `;

    const header = document.querySelector(".header, nav");
    if (header && header.parentNode) {
      header.insertAdjacentElement("afterend", banner);
    } else {
      document.body.prepend(banner);
    }

    document.querySelectorAll("main > section:not(.hero)").forEach((section) => {
      section.classList.add("premium-content-locked");
    });
  }

  document.addEventListener("DOMContentLoaded", lockPremiumPage);
})();
