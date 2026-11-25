(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var en = {}, shots = document.querySelectorAll("img[data-shot]");
  var bEn = document.getElementById("lang-en"), bFr = document.getElementById("lang-fr");
  function set(lang) {
    root.lang = lang;
    document.querySelectorAll("[data-fr]").forEach(function (el, i) {
      if (!(i in en)) en[i] = el.textContent;
      el.textContent = lang === "fr" ? el.getAttribute("data-fr") : en[i];
    });
    document.querySelectorAll("[data-fr-html]").forEach(function (el) {
      if (!el.dataset.enHtml) el.dataset.enHtml = el.innerHTML;
      el.innerHTML = lang === "fr" ? el.getAttribute("data-fr-html") : el.dataset.enHtml;
    });
    document.querySelectorAll("[data-fr-alt]").forEach(function (el) {
      if (!el.dataset.enAlt) el.dataset.enAlt = el.alt;
      el.alt = lang === "fr" ? el.getAttribute("data-fr-alt") : el.dataset.enAlt;
    });
    document.querySelectorAll("[data-fr-aria]").forEach(function (el) {
      if (!el.dataset.enAria) el.dataset.enAria = el.getAttribute("aria-label");
      el.setAttribute("aria-label", lang === "fr" ? el.getAttribute("data-fr-aria") : el.dataset.enAria);
    });
    document.querySelectorAll("[data-fr-href]").forEach(function (el) {
      if (!el.dataset.enHref) el.dataset.enHref = el.getAttribute("href");
      el.setAttribute("href", lang === "fr" ? el.getAttribute("data-fr-href") : el.dataset.enHref);
    });
    shots.forEach(function (im) { im.src = "img/" + im.dataset.shot + "_" + lang + ".jpg"; });
    bEn.setAttribute("aria-pressed", String(lang === "en"));
    bFr.setAttribute("aria-pressed", String(lang === "fr"));
    try { localStorage.setItem("rws-lang", lang); } catch (e) {}
  }
  bEn.addEventListener("click", function () { set("en"); });
  bFr.addEventListener("click", function () { set("fr"); });
  var start = "en";
  try { start = localStorage.getItem("rws-lang") || ((navigator.language || "").slice(0, 2) === "fr" ? "fr" : "en"); } catch (e) {}
  if (start === "fr") set("fr");

  /* the tour: four tabs, one panel shown at a time */
  var tabs = [].slice.call(document.querySelectorAll(".tabs [role=tab]"));
  if (tabs.length) {
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var count = document.getElementById("tour-count"), cur = 0;
    function show(i, focus) {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        t.setAttribute("aria-selected", String(k === cur));
        t.tabIndex = k === cur ? 0 : -1;
        panels[k].hidden = k !== cur;
      });
      if (count) count.textContent = (cur + 1) + " / " + tabs.length;
      if (focus) tabs[cur].focus();
    }
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { show(k); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1, true); }
      });
    });
    document.getElementById("tour-prev").addEventListener("click", function () { show(cur - 1); });
    document.getElementById("tour-next").addEventListener("click", function () { show(cur + 1); });
    show(0);
  }

  /* enlarge a picture */
  var lb = document.getElementById("lb");
  if (lb && lb.showModal) {
    var big = lb.querySelector("img"), cap = lb.querySelector("p");
    document.querySelectorAll(".zoom").forEach(function (z) {
      z.addEventListener("click", function () {
        var im = z.querySelector("img");
        big.src = im.currentSrc || im.src; big.alt = im.alt; cap.textContent = im.alt;
        lb.showModal();
      });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "BUTTON") lb.close(); });
  }
})();
