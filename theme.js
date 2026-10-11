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
}());
