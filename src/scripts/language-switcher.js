// Load all translation modules via Vite's import.meta.glob
const langModules = import.meta.glob("/src/i18n/lang/*.ts", { eager: true });

const translations = {};
for (const path in langModules) {
  if (Object.prototype.hasOwnProperty.call(langModules, path)) {
    const locale = path.replace(/^.*\/lang\//, "").replace(/\.ts$/, "");
    translations[locale] = langModules[path].default;
  }
}

// Map our locale codes to Google Translate language codes
var GT_LANG_MAP = {
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  en: "en",
};

function resolveKey(obj, key) {
  return key.split(".").reduce(function (acc, part) {
    if (acc && typeof acc === "object") return acc[part];
    return undefined;
  }, obj) ?? "";
}

function triggerGoogleTranslate(targetLang) {
  // Wait for Google Translate iframe to be ready
  var maxAttempts = 20;
  var attempt = 0;

  function tryTranslate() {
    var select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event("change"));
      return true;
    }
    return false;
  }

  // Try immediately
  if (!tryTranslate()) {
    // Retry a few times with interval
    var interval = setInterval(function () {
      attempt++;
      if (tryTranslate() || attempt >= maxAttempts) {
        clearInterval(interval);
      }
    }, 500);
  }
}

function revertGoogleTranslate() {
  // Restore original language by setting zh-CN
  triggerGoogleTranslate("zh-CN");

  // Remove the Google Translate overlay styles
  var topFrame = document.querySelector(".goog-te-banner-frame");
  if (topFrame) topFrame.style.display = "none";

  var body = document.body;
  body.style.top = "0";
  body.style.position = "static";

  // Restore any modified HTML attributes
  document.documentElement.lang = "zh";
}

function applyLocale(locale) {
  var t = translations[locale] || translations["zh"];
  if (!t) return;

  // ── UI translation (nav, buttons, etc.) ────────────────
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.dataset.i18n;
    var val = resolveKey(t, key);
    if (val) el.textContent = val;
  });

  document.querySelectorAll(".lang-option").forEach(function (btn) {
    var isActive = btn.dataset.lang === locale;
    btn.dataset.active = isActive ? "true" : "false";
  });

  document.querySelectorAll("[data-i18n-nav]").forEach(function (el) {
    var key = el.dataset.i18nNav;
    var val = resolveKey(t, key);
    if (val) el.textContent = val;
  });

  var skipLink = document.getElementById("skip-to-content");
  if (skipLink) {
    var val = resolveKey(t, "a11y.skipToContent");
    if (val) skipLink.textContent = val;
  }

  var themeBtn = document.getElementById("theme-btn");
  if (themeBtn) {
    var val = resolveKey(t, "a11y.toggleTheme");
    if (val) themeBtn.title = val;
  }

  var menuBtn = document.getElementById("menu-btn");
  if (menuBtn) {
    var openLabel = resolveKey(t, "a11y.openMenu");
    var closeLabel = resolveKey(t, "a11y.closeMenu");
    if (openLabel) menuBtn.dataset.labelOpen = openLabel;
    if (closeLabel) menuBtn.dataset.labelClose = closeLabel;
    var expanded = menuBtn.getAttribute("aria-expanded");
    menuBtn.setAttribute("aria-label", expanded === "true" ? closeLabel : openLabel);
  }

  document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    var key = el.dataset.i18nTitle;
    var val = resolveKey(t, key);
    if (val) el.title = val;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
    var key = el.dataset.i18nAria;
    var val = resolveKey(t, key);
    if (val) el.setAttribute("aria-label", val);
  });

  // Update the current language label on the button
  var currentLabel = document.getElementById("lang-current");
  if (currentLabel) {
    var langLabel = resolveKey(t, "language." + locale);
    if (langLabel) currentLabel.textContent = langLabel;
  }

  // ── Page content translation via Google Translate ──────
  // Only translate when Google Translate API is loaded
  if (typeof google !== "undefined" && google.translate) {
    var gtLang = GT_LANG_MAP[locale];
    if (gtLang === "zh-CN") {
      // Revert to original
      revertGoogleTranslate();
    } else {
      // Translate page content to target language
      triggerGoogleTranslate(gtLang);
    }
  }

  localStorage.setItem("locale", locale);
}

// ── Event delegation on document level ──────────────────────

document.addEventListener("click", function (e) {
  // Toggle menu: click on #lang-btn or its child
  var btn = e.target.closest("#lang-btn");
  if (btn) {
    var menu = document.getElementById("lang-menu");
    if (menu) {
      menu.classList.toggle("hidden");
    }
    return;
  }

  // Select language: click on .lang-option
  var option = e.target.closest(".lang-option");
  if (option && option.dataset.lang) {
    applyLocale(option.dataset.lang);
    var menu = document.getElementById("lang-menu");
    if (menu) menu.classList.add("hidden");
    return;
  }
});

// Close menu when clicking anywhere else
document.addEventListener("click", function (e) {
  var container = document.getElementById("language-switcher");
  if (container && !container.contains(e.target)) {
    var menu = document.getElementById("lang-menu");
    if (menu) menu.classList.add("hidden");
  }
});

// ── Initialize & re-initialize on page load/navigation ─────

function restoreLocale() {
  var saved = localStorage.getItem("locale");
  if (saved && saved !== "zh") {
    applyLocale(saved);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", restoreLocale);
} else {
  restoreLocale();
}

// Re-apply after Astro page transitions (ClientRouter)
document.addEventListener("astro:after-swap", restoreLocale);
