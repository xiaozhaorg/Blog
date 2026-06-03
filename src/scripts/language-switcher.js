// Load all translation modules via Vite's import.meta.glob
var langModules = import.meta.glob("/src/i18n/lang/*.ts", { eager: true });

var translations = {};
for (var _path in langModules) {
  if (Object.prototype.hasOwnProperty.call(langModules, _path)) {
    var locale = _path.replace(/^.*\/lang\//, "").replace(/\.ts$/, "");
    translations[locale] = langModules[_path].default;
  }
}

// Google Translate language -> our locale mapping
var GT_REVERSE = {
  "zh-CN": "zh",
  "zh-TW": "zh-TW",
  en: "en",
};

function resolveKey(obj, key) {
  return key.split(".").reduce(function (acc, part) {
    if (acc && typeof acc === "object") return acc[part];
    return undefined;
  }, obj) ?? "";
}

// ── Google Translate cookie management ──────────────────
function getGTCookie() {
  var match = document.cookie.match(/googtrans=\/zh-CN\/([^;]+)/);
  return match ? match[1] : null;
}

function setGTCookie(gtLang) {
  var d = new Date();
  d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
  document.cookie = "googtrans=/zh-CN/" + gtLang + "; path=/; expires=" + d.toUTCString();
}

function clearGTCookie() {
  document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

// ── Apply UI text ──────────────────────────────────────
function applyLocale(locale) {
  var t = translations[locale] || translations["zh"];
  if (!t) return;

  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.dataset.i18n;
    var val = resolveKey(t, key);
    if (val) el.textContent = val;
  });

  document.querySelectorAll(".lang-option").forEach(function (btn) {
    btn.dataset.active = btn.dataset.lang === locale ? "true" : "false";
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

  var currentLabel = document.getElementById("lang-current");
  if (currentLabel) {
    var langLabel = resolveKey(t, "language." + locale);
    if (langLabel) currentLabel.textContent = langLabel;
  }

  localStorage.setItem("locale", locale);
}

// ── Switch language (set cookie + reload) ──────────────
function switchLocale(locale) {
  // Apply UI immediately (visible before reload)
  applyLocale(locale);

  if (locale === "zh") {
    clearGTCookie();
  } else {
    setGTCookie(GT_REVERSE[locale] || locale);
  }

  // Reload to let Google Translate handle content translation
  window.location.reload();
}

// ── Restore UI state from cookie on load ───────────────
function restoreFromCookie() {
  var gtLang = getGTCookie();
  var locale = gtLang ? GT_REVERSE[gtLang] || "zh" : "zh";
  var savedLocale = localStorage.getItem("locale");

  if (locale !== "zh") {
    applyLocale(locale);
    if (savedLocale !== locale) {
      localStorage.setItem("locale", locale);
    }
  }
}

// ── Event delegation ──────────────────────────────────
document.addEventListener("click", function (e) {
  var btn = e.target.closest("#lang-btn");
  if (btn) {
    var menu = document.getElementById("lang-menu");
    if (menu) menu.classList.toggle("hidden");
    return;
  }

  var option = e.target.closest(".lang-option");
  if (option && option.dataset.lang) {
    switchLocale(option.dataset.lang);
    var menu = document.getElementById("lang-menu");
    if (menu) menu.classList.add("hidden");
    return;
  }
});

document.addEventListener("click", function (e) {
  var container = document.getElementById("language-switcher");
  if (container && !container.contains(e.target)) {
    var menu = document.getElementById("lang-menu");
    if (menu) menu.classList.add("hidden");
  }
});

// ── Initialize ────────────────────────────────────────
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", restoreFromCookie);
} else {
  restoreFromCookie();
}

// Restore on Astro page transitions (without reload)
document.addEventListener("astro:after-swap", restoreFromCookie);
