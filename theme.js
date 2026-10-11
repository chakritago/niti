/* NITI shared theme controller — no external dependencies */
(function () {
  "use strict";
  var KEY = "niti-theme-v1";
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  var icon = button ? button.querySelector(".theme-toggle-icon") : null;
  var label = button ? button.querySelector(".theme-toggle-label") : null;
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored() {
    try {
      var value = window.localStorage.getItem(KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch (_) { return null; }
  }
  function write(value) {
    try { window.localStorage.setItem(KEY, value); } catch (_) {}
  }
  function apply(value) {
    var dark = value === "dark";
    root.setAttribute("data-theme", dark ? "dark" : "light");
    if (button) {
      button.setAttribute("aria-label", dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด");
      button.setAttribute("title", dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด");
      button.setAttribute("aria-pressed", String(dark));
    }
    if (icon) icon.textContent = dark ? "☀" : "☾";
    if (label) label.textContent = dark ? "โหมดสว่าง" : "โหมดมืด";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#1b2027" : "#ffffff");
  }
  function preferred() {
    return stored() || (media && media.matches ? "dark" : "light");
  }
  apply(preferred());
  if (button) {
    button.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      write(next);
      apply(next);
    });
  }
  function systemChanged() {
    if (!stored()) apply(preferred());
  }
  if (media && media.addEventListener) media.addEventListener("change", systemChanged);
  else if (media && media.addListener) media.addListener(systemChanged);

  // Reading accessibility: comfortable 20px default (18 / 20 / 22 / 24px).
  // The choice is independent from light/dark theme and shared by all pages.
  var FONT_KEY = "niti-font-level-v1";
  var levels = [
    { id: "normal", px: 20 },
    { id: "comfortable", px: 22 },
    { id: "large", px: 24 },
    { id: "extra", px: 26 },
    { id: "max", px: 28 }
  ];
  var smaller = document.getElementById("font-decrease");
  var larger = document.getElementById("font-increase");
  var sizeLabel = document.getElementById("font-current");

  function fontPreference() {
    try {
      var choice = window.localStorage.getItem(FONT_KEY);
      return levels.some(function (level) { return level.id === choice; })
        ? choice : "normal";
    } catch (_) {
      return "normal";
    }
  }
  function saveFont(choice) {
    try { window.localStorage.setItem(FONT_KEY, choice); } catch (_) {}
  }
  function setFontLevel(choice, save) {
    var index = levels.findIndex(function (level) { return level.id === choice; });
    if (index < 0) index = 0;
    var active = levels[index];
    root.setAttribute("data-font-level", active.id);
    if (sizeLabel) {
      sizeLabel.value = active.px + " px";
      sizeLabel.textContent = active.px + " px";
      sizeLabel.setAttribute("aria-label", "ขนาดตัวอักษรปัจจุบัน " + active.px + " พิกเซล");
    }
    if (smaller) smaller.disabled = index === 0;
    if (larger) larger.disabled = index === levels.length - 1;
    if (save) saveFont(active.id);
  }
  function changeFont(by) {
    var current = root.getAttribute("data-font-level");
    var index = levels.findIndex(function (level) { return level.id === current; });
    if (index < 0) index = 0;
    setFontLevel(levels[Math.max(0, Math.min(levels.length - 1, index + by))].id, true);
  }
  setFontLevel(fontPreference(), false);
  if (smaller) smaller.addEventListener("click", function () { changeFont(-1); });
  if (larger) larger.addEventListener("click", function () { changeFont(1); });
}());
