(function () {
  var moved = { "#levels": "what.html#levels", "#norne": "decide.html", "#proof": "proof.html", "#key": "how.html#key", "#partner": "partner.html", "#different": "why.html" };
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
      el.setAttribute("href", lang === "fr" ? el.getAttribute("data-fr-href") : (lang === "ar" && el.getAttribute("data-ar-href")) || el.dataset.enHref);
    });
    /* the sketch is mirrored for a right-to-left reader: its labels move to the other side */
    document.querySelectorAll(".section-fig text").forEach(function (t) {
      if (!t.dataset.x) { t.dataset.x = t.getAttribute("x"); t.dataset.a = t.getAttribute("text-anchor") || "start"; }
      var ar = lang === "ar";
      t.setAttribute("x", ar ? 1100 - (+t.dataset.x) : t.dataset.x);
      t.setAttribute("text-anchor", ar ? (t.dataset.a === "end" ? "start" : "end") : t.dataset.a);
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
        gsap.fromTo(panels[cur], { autoAlpha: 0, filter: "blur(3px)", x: root.dir === "rtl" ? -10 : 10 }, { autoAlpha: 1, filter: "blur(0px)", x: 0, duration: 0.26, ease: "power4.out", overwrite: true, clearProps: "filter,transform" });
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

  /* the looping film of the first screen: still, with controls, for visitors who asked for less motion */
  var lp = document.querySelector("video.loop");
  if (lp && window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { lp.removeAttribute("autoplay"); lp.pause(); lp.controls = true; }

  /* the film plays silently by itself (browsers require it); this button turns its music on and off */
  if (lp && lp.closest(".intro-stage")) lp.addEventListener("click", function () { if (lp.paused) lp.play(); else lp.pause(); });
  var sb = document.querySelector(".snd");
  if (sb && lp) sb.addEventListener("click", function () {
    lp.muted = !lp.muted; sb.setAttribute("aria-pressed", String(!lp.muted));
    if (lp.paused) lp.play();
  });

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
  var SEL = "h2, h1.page, .lede, .stand, .tabs, .cards > div, .stats > div, .price > div, .weeks li, .decisions li, .bars .row, .band, .pilot, .check, .section-fig, .film, ol.steps li, .why-list li, .names-row, .marq, .values:not(.howto) li, .howto > li, .who";
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    root.classList.add("gsap");
    /* Easing after Emil Kowalski's standards: things that enter use a strong ease-out (power4.out is the
       curve cubic-bezier(.23, 1, .32, 1)); things that move on screen use a strong ease-in-out (power3.inOut). */
    var OUT = "power4.out", INOUT = "power3.inOut";
    var items = gsap.utils.toArray(SEL).filter(function (el) { return !el.closest(".hero"); });
    function countUp(b) {
      if (!b || !/^\d+$/.test(b.textContent)) return;
      var n = +b.textContent, o = { v: 0 };
      gsap.to(o, { v: n, duration: 1.2, ease: "power2.out", snap: { v: 1 }, onUpdate: function () { b.textContent = o.v; }, onComplete: function () { b.textContent = n; } });
    }
    function kind(el) {
      if (el.matches("h2, h1.page")) return "lead";
      if (el.matches(".section-fig")) return "wipe";
      if (el.matches(".band, .pilot, .check, .stand, .tabs")) return "still";
      return "support";
    }
    var mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var rtl = root.dir === "rtl";
      var shut = rtl ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)", openClip = "inset(0% 0% 0% 0%)";
      /* opening sequence of the first screen: seen once per visit, so it may take its time (steps of about 0.12 s) */
      var hero = document.querySelector(".hero");
      if (hero) {
        var tl = gsap.timeline({ defaults: { ease: OUT } });
        var h1 = hero.querySelector("h1");
        tl.from(hero.querySelector(".eyebrow"), { autoAlpha: 0, y: 10, duration: 0.5 });
        if (window.SplitText && root.lang !== "ar") {
          var split = SplitText.create(h1, { type: "words", mask: "words" });
          tl.from(split.words, { yPercent: 110, duration: 0.9, stagger: { each: 0.09, ease: "power1.out" } }, "<0.12");
          tl.add(function () { split.revert(); });
        } else {
          tl.from(h1, { autoAlpha: 0, y: 28, duration: 0.9 }, "<0.12");
        }
        tl.from(hero.querySelector(".lede"), { autoAlpha: 0, y: 14, duration: 0.6 }, "-=0.5")
          .from(hero.querySelectorAll(".cta .btn"), { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.1 }, "-=0.4");
        var facts = hero.querySelectorAll(".facts li");
        if (facts.length) {
          tl.from(facts, { autoAlpha: 0, duration: 0.5, stagger: { each: 0.08, ease: "power1.out" } }, "-=0.3")
            .add(function () { facts.forEach(function (li) { countUp(li.querySelector("b")); }); }, "<");
        }
        /* the picture is uncovered from the top, like a log being unrolled */
        var hf = hero.querySelector("figure");
        if (hf) tl.fromTo(hf, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: openClip, duration: 1.1, ease: INOUT, clearProps: "clipPath" }, 0.15);
        var pics = hero.querySelectorAll("figure .pan img");
        if (pics.length) {
          gsap.fromTo(pics, { scale: 1.04, yPercent: 0 }, { scale: 1.14, yPercent: -5, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 } });
        }
      }
      /* the journey of one drop, in a loop: logo, oil in the rock, the well, the surface, money, logo again.
         The drop stays in the middle of the frame and the world slides under it, as if a camera followed it. */
      var jw = document.getElementById("j-world");
      if (jw) {
        var veil = document.getElementById("j-veil"), dropG = document.getElementById("j-drop");
        var logo = document.getElementById("j-logo"), oil = document.getElementById("j-oil"), coin = document.getElementById("j-coin");
        var labs = gsap.utils.toArray(".j-lab"), cam = { x: 430, y: 850, s: 2.6 };
        function look() { jw.setAttribute("transform", "translate(" + (400 - cam.x * cam.s) + " " + (225 - cam.y * cam.s) + ") scale(" + cam.s + ")"); }
        dropG.setAttribute("transform", "translate(400 225)");
        gsap.set([logo, oil, coin], { svgOrigin: "0 0" });
        gsap.set(veil, { opacity: 1 }); gsap.set(logo, { scale: 1, opacity: 1 }); gsap.set(oil, { scale: 1, opacity: 0 }); gsap.set(coin, { scaleX: 0, opacity: 0 });
        look();
        var jt = gsap.timeline({ repeat: -1, repeatDelay: 0.2, defaults: { ease: "power2.inOut" }, onUpdate: look });
        function lab(i, at) { jt.to(labs, { opacity: 0, duration: 0.25, ease: "none" }, at); if (i >= 0) jt.to(labs[i], { opacity: 1, duration: 0.35, ease: "none" }, at + 0.15); }
        /* 1. the logo, then it becomes a drop of oil between the grains */
        jt.to(logo, { scale: 0.34, duration: 1, ease: INOUT }, 1.3)
          .to(logo, { opacity: 0, duration: 0.5, ease: "none" }, 1.8)
          .set(oil, { scale: 0.34 }, 1.3).to(oil, { opacity: 1, duration: 0.5, ease: "none" }, 1.7)
          .to(veil, { opacity: 0, duration: 0.9, ease: "none" }, 1.4);
        lab(0, 1.9);
        /* 2. through the pores to the well */
        jt.to(cam, { keyframes: [{ x: 560, y: 822 }, { x: 690, y: 878 }, { x: 820, y: 832 }, { x: 950, y: 868 }, { x: 1100, y: 846, s: 1.9 }], duration: 3.2, ease: "sine.inOut" }, 2.5);
        /* 3. up the well */
        lab(1, 5.6);
        jt.to(oil, { scale: 0.2, duration: 0.5 }, 5.4).to(oil, { scale: 0.3, duration: 0.5 }, 8.5);
        jt.to(cam, { y: 300, s: 1.35, duration: 2.6 }, 5.8)
          .to(cam, { y: 236, s: 1.5, duration: 0.6, ease: "power1.out" }, 8.4);
        /* 4. along the surface: separator, tank, sale */
        lab(2, 8.5);
        jt.to(cam, { x: 1740, duration: 2.6, ease: "power1.inOut" }, 9.0);
        /* 5. the drop becomes money */
        lab(3, 11.5);
        jt.to(oil, { scaleX: 0, duration: 0.3, ease: "power2.in" }, 11.6)
          .set(oil, { opacity: 0 }, 11.9).set(coin, { opacity: 1, scaleY: 0.5 }, 11.9)
          .to(coin, { scaleX: 0.5, duration: 0.35, ease: OUT }, 11.9)
          .to(coin, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "back.out(1.6)" }, 12.3)
          .to(veil, { opacity: 1, duration: 0.7, ease: "none" }, 12.4);
        /* 6. back to the logo */
        lab(-1, 13.3);
        jt.to(coin, { scaleX: 0, duration: 0.3, ease: "power2.in" }, 13.5)
          .set(coin, { opacity: 0 }, 13.8).set(logo, { opacity: 1, scaleX: 0, scaleY: 1 }, 13.8)
          .to(logo, { scaleX: 1, duration: 0.45, ease: OUT }, 13.8)
          .set(cam, { x: 430, y: 850, s: 2.6 }, 14.3)
          .to({}, { duration: 0.9 }, 14.3);
        /* it rests when it is out of sight */
        ScrollTrigger.create({ trigger: jw.ownerSVGElement, start: "top bottom", end: "bottom top", onToggle: function (self) { if (self.isActive) jt.play(); else jt.pause(); } });
      }
      /* sections arrive the first time they are reached. Not everything moves the same way:
         the heading travels furthest, supporting pieces less, boxed notices fade in place, the sketch is wiped open
         from the side the language reads from. Groups overlap with delays that shrink, never a metronome. */
      items.forEach(function (el) {
        var k = kind(el);
        if (k === "lead") gsap.set(el, { autoAlpha: 0, y: 36 });
        else if (k === "wipe") gsap.set(el, { clipPath: shut });
        else if (k === "still") gsap.set(el, { autoAlpha: 0, scale: 0.985 });
        else gsap.set(el, { autoAlpha: 0, y: 18 });
      });
      ScrollTrigger.batch(items, {
        start: "top 88%", once: true, interval: 0.12,
        onEnter: function (batch) {
          var support = [];
          batch.forEach(function (el) {
            var k = kind(el);
            if (k === "lead") gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.8, ease: OUT, overwrite: true });
            else if (k === "wipe") gsap.to(el, { clipPath: openClip, duration: 1.1, ease: INOUT, overwrite: true, clearProps: "clipPath" });
            else if (k === "still") gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.6, ease: OUT, overwrite: true, delay: 0.08 });
            else support.push(el);
            if (el.matches(".stats > div")) countUp(el.querySelector("b"));
            if (el.matches(".bars .row")) el.classList.add("grow");
          });
          if (support.length) gsap.to(support, { autoAlpha: 1, y: 0, duration: 0.6, ease: OUT, overwrite: true, delay: 0.06, stagger: { each: 0.07, ease: "power2.out" } });
        }
      });
      /* inner pages: the page title rises word by word, as on the home page */
      var pt = document.querySelector("h1.page");
      if (pt && window.SplitText && root.lang !== "ar") {
        gsap.killTweensOf(pt); gsap.set(pt, { autoAlpha: 1, y: 0 });
        var ps = SplitText.create(pt, { type: "words", mask: "words" });
        gsap.from(ps.words, { yPercent: 110, duration: 0.9, ease: OUT, stagger: { each: 0.08, ease: "power1.out" }, onComplete: function () { ps.revert(); } });
      }
      /* main buttons lean toward the pointer (mouse only); quickTo reuses one tween per axis */
      if (window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
        gsap.utils.toArray(".btn.fill").forEach(function (btn) {
          btn.classList.add("mag");
          var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" }), yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
          btn.addEventListener("mousemove", function (e) { var r = btn.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.22); yTo((e.clientY - r.top - r.height / 2) * 0.3); });
          btn.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
          btn.addEventListener("pointerdown", function () { gsap.to(btn, { scale: 0.97, duration: 0.12, ease: OUT }); });
          ["pointerup", "pointerleave"].forEach(function (ev) { btn.addEventListener(ev, function () { gsap.to(btn, { scale: 1, duration: 0.2, ease: OUT }); }); });
        });
      }
      why(true);
      /* the large statements (vision, mission) rise line by line when they are reached */
      gsap.utils.toArray(".say").forEach(function (el) {
        if (window.SplitText && root.lang !== "ar") {
          var sp = SplitText.create(el, { type: "lines", mask: "lines" });
          gsap.from(sp.lines, { yPercent: 110, duration: 1, ease: OUT, stagger: 0.12, scrollTrigger: { trigger: el, start: "top 85%", once: true }, onComplete: function () { sp.revert(); } });
        } else {
          gsap.from(el, { autoAlpha: 0, y: 30, duration: 0.9, ease: OUT, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        }
      });
      /* reading bar under the header */
      var head = document.querySelector(".bar"), bar = document.createElement("div");
      bar.className = "progress"; bar.setAttribute("aria-hidden", "true"); head.appendChild(bar);
      gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
      return function () { bar.remove(); };
    });
    /* the numbered walkthrough: a large figure stays in view and follows the point being read */
    function why(move) {
      var list = document.querySelector(".why-list"), num = document.getElementById("why-num");
      if (!list || !num) return;
      gsap.utils.toArray(".why-list li").forEach(function (li, i) {
        ScrollTrigger.create({
          trigger: li, start: "top 62%", end: "bottom 62%",
          onToggle: function (self) {
            li.classList.toggle("on", self.isActive);
            if (!self.isActive || num.textContent === String(i + 1)) return;
            num.textContent = i + 1;
            if (move) gsap.fromTo(num, { yPercent: 35, autoAlpha: 0, filter: "blur(4px)" }, { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.32, ease: OUT, overwrite: true });
          }
        });
      });
      var fill = document.querySelector(".why-line i");
      if (fill) gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 62%", end: "bottom 62%", scrub: move ? 0.3 : true } });
    }
    /* visitors who asked for less motion keep a short fade and no movement */
    mm.add("(prefers-reduced-motion: reduce)", function () {
      why(false);
      gsap.set(items, { autoAlpha: 0 });
      ScrollTrigger.batch(items, { start: "top 95%", once: true, onEnter: function (batch) { gsap.to(batch, { autoAlpha: 1, duration: 0.2, ease: "none", overwrite: true }); } });
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
