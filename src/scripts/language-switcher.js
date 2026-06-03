// Load all translation modules via Vite's import.meta.glob
const langModules = import.meta.glob("/src/i18n/lang/*.ts", { eager: true });

const translations = {};
for (const path in langModules) {
  if (Object.prototype.hasOwnProperty.call(langModules, path)) {
    const locale = path.replace(/^.*\/lang\//, "").replace(/\.ts$/, "");
    translations[locale] = langModules[path].default;
  }
}

function resolveKey(obj, key) {
  return key.split(".").reduce(function (acc, part) {
    if (acc && typeof acc === "object") return acc[part];
    return undefined;
  }, obj) ?? "";
}

function applyLocale(locale) {
  var t = translations[locale] || translations["zh"];
  if (!t) return;

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

  localStorage.setItem("locale", locale);
}

// ── Event delegation on document level ──────────────────────
// This survives page navigation because `document` never gets replaced.

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
