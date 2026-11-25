(function () {
  var moved = { "#levels": "levels.html", "#norne": "decide.html", "#proof": "proof.html", "#key": "key.html" };
  if (/(\/|index\.html)$/.test(location.pathname) && moved[location.hash]) { location.replace(moved[location.hash]); return; }
  var root = document.documentElement;
  root.classList.add("js");
  var en = {}, shots = document.querySelectorAll("img[data-shot]");
  var AR = window.RWS_AR || {}, box = document.querySelector("details.lang"), curEl = document.getElementById("lang-cur");
  var codes = { en: "EN", fr: "FR", ar: "ع" };
  function pick(lang, enText, frText) {
    if (lang === "fr") return frText;
    if (lang === "ar") return AR[enText.trim()] || enText;
    return enText;
  }
  function set(lang) {
    root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-fr]").forEach(function (el, i) {
      if (!(i in en)) en[i] = el.textContent;
      el.textContent = pick(lang, en[i], el.getAttribute("data-fr"));
    });
    document.querySelectorAll("[data-fr-html]").forEach(function (el) {
      if (!el.dataset.enHtml) el.dataset.enHtml = el.innerHTML;
      el.innerHTML = pick(lang, el.dataset.enHtml, el.getAttribute("data-fr-html"));
    });
    document.querySelectorAll("[data-fr-alt]").forEach(function (el) {
      if (!el.dataset.enAlt) el.dataset.enAlt = el.alt;
      el.alt = pick(lang, el.dataset.enAlt, el.getAttribute("data-fr-alt"));
    });
    document.querySelectorAll("[data-fr-aria]").forEach(function (el) {
      if (!el.dataset.enAria) el.dataset.enAria = el.getAttribute("aria-label");
      el.setAttribute("aria-label", pick(lang, el.dataset.enAria, el.getAttribute("data-fr-aria")));
    });
    document.querySelectorAll("[data-fr-href]").forEach(function (el) {
      if (!el.dataset.enHref) el.dataset.enHref = el.getAttribute("href");
      el.setAttribute("href", lang === "fr" ? el.getAttribute("data-fr-href") : el.dataset.enHref);
    });
    shots.forEach(function (im) { im.src = "img/" + im.dataset.shot + "_" + (lang === "fr" ? "fr" : "en") + ".jpg"; });
    if (curEl) curEl.textContent = codes[lang];
    document.querySelectorAll("details.lang button").forEach(function (bt) { bt.setAttribute("aria-pressed", String(bt.dataset.l === lang)); });
    try { localStorage.setItem("rws-lang", lang); } catch (e) {}
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  document.querySelectorAll("details.lang button").forEach(function (bt) {
    bt.addEventListener("click", function () { set(bt.dataset.l); if (box) box.open = false; });
  });
  document.addEventListener("click", function (e) { if (box && box.open && !box.contains(e.target)) box.open = false; });
  var start = "en", nav2 = (navigator.language || "").slice(0, 2);
  try { start = localStorage.getItem("rws-lang") || (codes[nav2] ? nav2 : "en"); } catch (e) {}
  if (!codes[start]) start = "en";
  set(start);

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
      if (window.gsap && root.classList.contains("gsap") && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
        var pn = panels[cur];
        gsap.fromTo(pn.querySelector("figure"), { autoAlpha: 0, x: root.dir === "rtl" ? -28 : 28 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: "power3.out", overwrite: true });
        gsap.fromTo(pn.querySelectorAll("li"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out", overwrite: true });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
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
    function fromHash() { var m = /^#lv-(\d)$/.exec(location.hash); show(m ? +m[1] - 1 : cur); }
    window.addEventListener("hashchange", fromHash);
    show(0); fromHash();
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

  /* ---------- motion ----------
     With GSAP (js/vendor): an opening sequence, sections that rise in as they are reached, numbers that count up,
     a picture that drifts with the scroll and a reading bar. Only for visitors who have not asked for reduced motion.
     Without GSAP the simpler version further down runs instead. */
  var SEL = "h2, h1.page, .lede, .stand, .tabs, .cards > div, .stats > div, .price > div, .weeks li, .decisions li, .bars .row, .band, .pilot, .check, .section-fig, .film, ol.steps li";
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    root.classList.add("gsap");
    var mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      function countUp(b) {
        if (!b || !/^\d+$/.test(b.textContent)) return;
        var n = +b.textContent, o = { v: 0 };
        gsap.to(o, { v: n, duration: 1.2, ease: "power2.out", snap: { v: 1 }, onUpdate: function () { b.textContent = o.v; }, onComplete: function () { b.textContent = n; } });
      }
      /* opening sequence of the first screen */
      var hero = document.querySelector(".hero");
      if (hero) {
        var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        var h1 = hero.querySelector("h1"), split = null;
        tl.from(hero.querySelector(".eyebrow"), { autoAlpha: 0, y: 12, duration: 0.5 });
        if (window.SplitText && root.lang !== "ar") {
          split = SplitText.create(h1, { type: "words", mask: "words" });
          tl.from(split.words, { yPercent: 110, duration: 0.8, stagger: 0.07 }, "<0.1");
          tl.add(function () { split.revert(); });
        } else {
          tl.from(h1, { autoAlpha: 0, y: 24, duration: 0.8 }, "<0.1");
        }
        tl.from(hero.querySelector(".lede"), { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.45")
          .from(hero.querySelectorAll(".cta .btn"), { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.08 }, "-=0.35");
        var facts = hero.querySelectorAll(".facts li");
        if (facts.length) {
          tl.from(facts, { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.07 }, "-=0.3")
            .add(function () { facts.forEach(function (li) { countUp(li.querySelector("b")); }); }, "<");
        }
        tl.from(hero.querySelector("figure"), { autoAlpha: 0, scale: 0.96, duration: 0.9 }, 0.2);
        /* the picture drifts as the first screen scrolls away */
        var pics = hero.querySelectorAll("figure .pan img");
        if (pics.length) {
          gsap.fromTo(pics, { scale: 1.04, yPercent: 0 }, { scale: 1.14, yPercent: -5, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 } });
        }
      }
      /* sections rise in, in small groups, the first time they are reached */
      var items = gsap.utils.toArray(SEL).filter(function (el) { return !el.closest(".hero"); });
      gsap.set(items, { autoAlpha: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: "top 90%", once: true, interval: 0.12,
        onEnter: function (batch) {
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, overwrite: true });
          batch.forEach(function (el) {
            if (el.matches(".stats > div")) countUp(el.querySelector("b"));
            if (el.matches(".bars .row")) el.classList.add("grow");
          });
        }
      });
      /* reading bar under the header */
      var head = document.querySelector(".bar"), bar = document.createElement("div");
      bar.className = "progress"; bar.setAttribute("aria-hidden", "true"); head.appendChild(bar);
      gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
      return function () { bar.remove(); };
    });
  } else {
    var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm && "IntersectionObserver" in window) {
      var sel = "h2, h1.page, .lede, .stand, .tabs, .cards > div, .stats > div, .price > div, .weeks li, .decisions li, .bars .row, .band, .pilot, .check, .section-fig, .facts li, ol.steps li";
      var items = [].slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest(".hero") || el.matches(".facts li"); });
      function count(el) {
        var b = el.matches("b") ? el : el.querySelector("b"); if (!b || !/^\d+$/.test(b.textContent)) return;
        var n = +b.textContent, t0 = null;
        function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 900); b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else b.textContent = n; }
        requestAnimationFrame(step);
      }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("in"); io.unobserve(e.target);
          if (e.target.matches(".stats > div, .facts li")) count(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      items.forEach(function (el) {
        var sibs = el.parentNode.children, k = [].indexOf.call(sibs, el);
        if (el.matches(".cards > div, .stats > div, .price > div, .weeks li, .decisions li, .bars .row, .facts li, ol.steps li")) el.style.setProperty("--d", (k * 80) + "ms");
        el.classList.add("rv"); io.observe(el);
      });
    }
  }
})();
