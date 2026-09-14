(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     PRELOADER
  --------------------------------------------------------- */
  const preloader = document.getElementById("preloader");
  const preloaderFill = document.getElementById("preloaderFill");
  const preloaderCount = document.getElementById("preloaderCount");

  (function runPreloader() {
    let progress = 0;
    const target = 100;
    const tick = () => {
      progress += Math.random() * 18 + 6;
      if (progress >= target) progress = target;
      preloaderFill.style.width = progress + "%";
      preloaderCount.textContent = Math.floor(progress) + "%";
      if (progress < target) {
        setTimeout(tick, 120);
      } else {
        setTimeout(() => preloader.classList.add("is-done"), 250);
      }
    };
    tick();
    // Safety net: never trap the user behind the preloader.
    window.addEventListener("load", () => {
      setTimeout(() => preloader.classList.add("is-done"), 900);
    });
  })();

  /* ---------------------------------------------------------
     NAV: scroll state + mobile menu
  --------------------------------------------------------- */
  const nav = document.getElementById("siteNav");
  const navBurger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  const onScrollNav = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 30);
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  navBurger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navBurger.classList.toggle("is-open", isOpen);
    navBurger.setAttribute("aria-expanded", String(isOpen));
    // backdrop-filter on .nav creates a containing block for the fixed
    // full-screen overlay, shrinking it to the header's own box once scrolled.
    nav.classList.toggle("nav--menu-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navBurger.classList.remove("is-open");
      navBurger.setAttribute("aria-expanded", "false");
      nav.classList.remove("nav--menu-open");
      document.body.style.overflow = "";
    });
  });

  /* ---------------------------------------------------------
     SCROLL PROGRESS BAR
  --------------------------------------------------------- */
  const scrollProgress = document.getElementById("scrollProgress");
  const updateScrollProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    scrollProgress.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ---------------------------------------------------------
     BACK TO TOP
  --------------------------------------------------------- */
  const backToTop = document.getElementById("backToTop");
  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 700);
  }, { passive: true });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  /* ---------------------------------------------------------
     REVEAL ON SCROLL
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach((els) => {
      els.forEach((el, i) => {
        el.style.transitionDelay = Math.min(i * 90, 450) + "ms";
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     COUNTER STATS
  --------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length && "IntersectionObserver" in window) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.target || "0");
          const duration = 1400;
          const start = performance.now();
          const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
          };
          requestAnimationFrame(step);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterIO.observe(el));
  }

  /* ---------------------------------------------------------
     MENU TABS
  --------------------------------------------------------- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".menu-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      const key = tab.dataset.tab;
      panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === key));
    });
  });

  /* ---------------------------------------------------------
     SIZE / VARIANT TOGGLE ON MENU CARDS
  --------------------------------------------------------- */
  document.querySelectorAll("[data-size-toggle]").forEach((toggle) => {
    const card = toggle.closest(".menu-card");
    const priceEl = card.querySelector("[data-price]");
    const descEl = card.querySelector("[data-desc]");
    const opts = toggle.querySelectorAll(".size-toggle__opt");

    opts.forEach((opt) => {
      opt.addEventListener("click", () => {
        opts.forEach((o) => o.classList.remove("is-active"));
        opt.classList.add("is-active");
        const size = opt.dataset.size;
        const price = size === "simple" ? card.dataset.simple : card.dataset.double;
        const desc = size === "simple" ? card.dataset.descSimple : card.dataset.descDouble;
        if (priceEl && price) priceEl.textContent = price;
        if (descEl && desc) descEl.textContent = desc;
      });
    });
  });

  /* ---------------------------------------------------------
     OPEN / CLOSED STATUS
  --------------------------------------------------------- */
  (function statusCheck() {
    const pill = document.getElementById("statusPill");
    const text = document.getElementById("statusText");
    const rows = document.querySelectorAll("#hoursTable li");
    if (!pill || !text) return;

    const now = new Date();
    const day = now.getDay(); // 0 = domingo
    const minutes = now.getHours() * 60 + now.getMinutes();

    rows.forEach((row) => {
      if (parseInt(row.dataset.day, 10) === day) row.classList.add("is-today");
    });

    const ranges = {
      0: [],
      1: [[720, 860], [1020, 1340]],
      2: [[720, 860], [1020, 1340]],
      3: [[720, 860], [1020, 1340]],
      4: [[720, 860], [1020, 1340]],
      5: [[720, 860], [1020, 1360]],
      6: [[720, 1360]],
    };

    const todaysRanges = ranges[day] || [];
    const isOpen = todaysRanges.some(([start, end]) => minutes >= start && minutes <= end);

    pill.classList.add(isOpen ? "is-open" : "is-closed");
    text.textContent = isOpen ? "Aberto agora" : "Fechado no momento";
  })();

  /* ---------------------------------------------------------
     FOOTER YEAR
  --------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     CUSTOM CURSOR (desktop / fine pointer only)
  --------------------------------------------------------- */
  if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll("a, button, .menu-card, .tab").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
  } else {
    document.getElementById("cursorDot")?.remove();
    document.getElementById("cursorRing")?.remove();
  }

  /* ---------------------------------------------------------
     MAGNETIC BUTTONS (desktop only)
  --------------------------------------------------------- */
  if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.28}px, ${y * 0.5}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     HERO PARALLAX
  --------------------------------------------------------- */
  if (!reducedMotion) {
    const heroContent = document.querySelector(".hero__content");
    const fadeDistance = 520; // fully faded well before the hero section ends
    window.addEventListener("scroll", () => {
      if (!heroContent) return;
      const y = window.scrollY;
      if (y < fadeDistance) {
        const p = y / fadeDistance;
        heroContent.style.transform = `translateY(${y * -0.2}px)`;
        heroContent.style.opacity = String(Math.max(1 - p, 0));
        heroContent.style.pointerEvents = "auto";
      } else {
        heroContent.style.opacity = "0";
        heroContent.style.pointerEvents = "none";
      }
    }, { passive: true });
  }

})();
