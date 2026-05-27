gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.getElementById("header");
const html = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeLabel = themeToggle?.querySelector(".theme-toggle-label");

/* ─── Theme toggle ─── */
function getStoredTheme() {
  try {
    return localStorage.getItem("voyage-theme");
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme, animate = true) {
  if (animate) {
    document.body.classList.add("theme-transitioning");
    setTimeout(() => document.body.classList.remove("theme-transitioning"), 600);
  }
  html.setAttribute("data-theme", theme);
  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
  }
  try {
    localStorage.setItem("voyage-theme", theme);
  } catch {
    /* ignore */
  }
  ScrollTrigger.refresh();
}

const initialTheme = getStoredTheme() ?? "dark";
applyTheme(initialTheme, false);

themeToggle?.addEventListener("click", () => {
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  if (!prefersReducedMotion) {
    gsap.fromTo(
      "body",
      { filter: "brightness(1.08)" },
      { filter: "brightness(1)", duration: 0.5, ease: "power2.out" }
    );
  }
});

/* Keep user choice once saved; new visitors default to dark via initialTheme */

/* ─── Scroll progress ─── */
const progressBar = document.querySelector(".scroll-progress span");
if (progressBar) {
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      progressBar.style.width = `${self.progress * 100}%`;
    },
  });
}

/* ─── Header ─── */
ScrollTrigger.create({
  start: "top -80",
  onUpdate: (self) => header.classList.toggle("scrolled", self.scroll() > 60),
});

document.querySelector(".menu-toggle")?.addEventListener("click", () => {
  header.classList.toggle("menu-open");
});

/* ─── Cursor glow ─── */
const glow = document.querySelector(".cursor-glow");
if (glow && window.matchMedia("(pointer: fine)").matches) {
  document.body.classList.add("has-pointer");
  let gx = 0;
  let gy = 0;
  let tx = 0;
  let ty = 0;

  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  if (!prefersReducedMotion) {
    gsap.ticker.add(() => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.left = `${gx}px`;
      glow.style.top = `${gy}px`;
    });
  } else {
    window.addEventListener("mousemove", (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    });
  }
}

/* ─── Magnetic buttons ─── */
document.querySelectorAll(".magnetic").forEach((btn) => {
  if (prefersReducedMotion) return;
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.25,
      y: y * 0.25,
      duration: 0.35,
      ease: "power2.out",
    });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
  });
});

/* ─── Hero word reveal ─── */
const heroWords = document.querySelectorAll(".hero-title .word");
if (heroWords.length) {
  gsap.to(heroWords, {
    y: 0,
    opacity: 1,
    duration: 1.1,
    stagger: 0.08,
    ease: "power4.out",
    delay: 0.35,
  });
}

const heroTl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 });
heroTl
  .to(".hero-label", { opacity: 1, y: 0, duration: 0.9 }, 0.5)
  .to(".hero-sub", { opacity: 1, y: 0, duration: 0.9 }, 0.85)
  .to(".btn-hero", { opacity: 1, y: 0, duration: 0.8 }, 1)
  .to(".hero-scroll, .hero-social", { opacity: 1, y: 0, duration: 0.8 }, 1.15);

/* Floating hero graphics */
if (!prefersReducedMotion) {
  gsap.to(".float-shape--1", {
    y: 30,
    rotation: 5,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
  gsap.to(".float-shape--2", {
    y: -25,
    rotation: -8,
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
  gsap.to(".hero-svg--globe", {
    rotation: 360,
    duration: 40,
    repeat: -1,
    ease: "none",
  });
  gsap.to(".hero-svg--compass", {
    rotation: -360,
    duration: 28,
    repeat: -1,
    ease: "none",
  });

  gsap.to(".hero-img", {
    yPercent: 28,
    scale: 1.08,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.4,
    },
  });

  gsap.to(".hero-arch--left", {
    y: 90,
    rotation: -2,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.6 },
  });

  gsap.to(".hero-arch--right", {
    y: -70,
    rotation: 16,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.8 },
  });
}

/* Marquee */
const marquee = document.querySelector(".marquee");
if (marquee && !prefersReducedMotion) {
  const totalWidth = marquee.scrollWidth / 2;
  gsap.to(marquee, {
    x: -totalWidth,
    duration: 28,
    repeat: -1,
    ease: "none",
  });
}

/* Reveal helper */
function revealOnScroll(selector, options = {}) {
  const { y = 50, stagger = 0.12, start = "top 85%", scale = 1, duration = 1, rotation = 0 } = options;

  gsap.utils.toArray(selector).forEach((el, i) => {
    const parent = el.closest(".services-grid, .gallery-grid, .stats-grid");
    gsap.fromTo(
      el,
      { opacity: 0, y, scale: scale === 1 ? 1 : 0.9, rotation },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: prefersReducedMotion ? 0.01 : duration,
        delay: prefersReducedMotion ? 0 : parent ? i * stagger : 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

revealOnScroll(".stats .reveal", { y: 35, stagger: 0.1 });
revealOnScroll(".services .section-label, .services .section-title");
revealOnScroll(".service-card", { stagger: 0.14, y: 80, rotation: 2 });
revealOnScroll(".featured-text .reveal", { stagger: 0.1 });
revealOnScroll(".featured-visual", { y: 70, scale: 0.88, duration: 1.3 });
revealOnScroll(".experiences .section-label, .experiences .section-title");
revealOnScroll(".gallery .section-label, .gallery .section-title");
revealOnScroll(".gallery-item", { stagger: 0.1, y: 60 });
revealOnScroll(".cta-arch-shape", { y: 90, scale: 0.88, duration: 1.4 });
revealOnScroll(".cta-arch-inner .reveal", { stagger: 0.08, y: 30 });
revealOnScroll(".footer-brand, .footer-links", { y: 40 });

/* Stat hover: count up from 0 + confetti on complete */
function burstConfetti(anchor) {
  const host = anchor.querySelector(".stat-confetti");
  if (!host) return;

  const colors = ["#c9a96e", "#d4b87a", "#f5f0e8", "#9a8b7a", "#e8dfd0"];
  const count = 22;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    host.appendChild(piece);

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = 35 + Math.random() * 55;
    const w = 3 + Math.random() * 5;
    const h = 3 + Math.random() * 7;

    gsap.set(piece, {
      width: w,
      height: h,
      backgroundColor: colors[i % colors.length],
      borderRadius: Math.random() > 0.45 ? "50%" : "1px",
      rotation: Math.random() * 360,
      x: 0,
      y: 0,
      opacity: 1,
    });

    gsap.to(piece, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 25,
      rotation: "+=" + (120 + Math.random() * 240),
      opacity: 0,
      duration: 0.65 + Math.random() * 0.45,
      ease: "power2.out",
      onComplete: () => piece.remove(),
    });
  }
}

function runStatCount(stat) {
  const numEl = stat.querySelector(".stat-num");
  if (!numEl) return null;

  const target = parseInt(numEl.dataset.count, 10);
  const duration = target >= 500 ? 2.2 : target >= 100 ? 1.6 : 1.1;
  const state = { val: 0 };

  numEl.textContent = "0";

  return gsap.to(state, {
    val: target,
    duration: prefersReducedMotion ? 0.01 : duration,
    ease: "power2.out",
    onUpdate: () => {
      numEl.textContent = Math.round(state.val);
    },
    onComplete: () => {
      numEl.textContent = target;
      if (!prefersReducedMotion) burstConfetti(stat);
    },
  });
}

document.querySelectorAll(".stat").forEach((stat) => {
  const numEl = stat.querySelector(".stat-num");
  if (!numEl) return;

  const target = parseInt(numEl.dataset.count, 10);
  let activeTween = null;

  stat.addEventListener("mouseenter", () => {
    if (activeTween) activeTween.kill();
    activeTween = runStatCount(stat);
  });

  stat.addEventListener("mouseleave", () => {
    if (activeTween) {
      activeTween.kill();
      activeTween = null;
    }
    numEl.textContent = target;
  });
});

/* Featured parallax + pin text */
if (!prefersReducedMotion) {
  gsap.to(".featured-circle", {
    y: -50,
    ease: "none",
    scrollTrigger: {
      trigger: ".featured",
      start: "top bottom",
      end: "bottom top",
      scrub: 1.5,
    },
  });

  gsap.to(".featured-arch-deco", {
    scaleY: 1.1,
    ease: "none",
    scrollTrigger: {
      trigger: ".featured",
      start: "top 65%",
      end: "bottom 25%",
      scrub: 2,
    },
  });

  ScrollTrigger.create({
    trigger: ".featured-text",
    start: "top 30%",
    end: "bottom 50%",
    pin: ".featured-text",
    pinSpacing: false,
    invalidateOnRefresh: true,
    media: "(min-width: 993px)",
  });
}

/* Experiences horizontal scrub */
const expTrack = document.querySelector(".experiences-track");
const expWrap = document.querySelector(".experiences-track-wrap");
if (expTrack && expWrap && !prefersReducedMotion) {
  const getScroll = () => expTrack.scrollWidth - expWrap.offsetWidth;
  gsap.to(expTrack, {
    x: () => -getScroll(),
    ease: "none",
    scrollTrigger: {
      trigger: ".experiences",
      start: "top 80%",
      end: () => `+=${getScroll() + 400}`,
      scrub: 1.2,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  gsap.utils.toArray(".exp-card").forEach((card, i) => {
    gsap.from(card, {
      rotation: i % 2 === 0 ? -4 : 4,
      y: 40,
      opacity: 0.6,
      scrollTrigger: {
        trigger: ".experiences",
        start: "top 70%",
        end: "top 20%",
        scrub: 1,
      },
    });
  });
}

/* Gallery */
if (!prefersReducedMotion) {
  document.querySelectorAll(".gallery-img-wrap").forEach((wrap, i) => {
    gsap.fromTo(
      wrap,
      { scale: 0.85, rotation: i % 2 ? 3 : -3 },
      {
        scale: 1,
        rotation: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: wrap,
          start: "top 92%",
          end: "top 55%",
          scrub: 0.9,
        },
      }
    );
  });

  gsap.to(".gallery-grid", {
    x: -24,
    ease: "none",
    scrollTrigger: {
      trigger: ".gallery",
      start: "top 75%",
      end: "bottom 25%",
      scrub: 2,
      media: "(min-width: 993px)",
    },
  });
}

/* CTA path draw + arch scale */
const ctaPath = document.querySelector(".cta-path");
if (ctaPath && !prefersReducedMotion) {
  const len = ctaPath.getTotalLength?.() || 400;
  ctaPath.style.strokeDasharray = len;
  ctaPath.style.strokeDashoffset = len;
  gsap.to(ctaPath, {
    strokeDashoffset: 0,
    duration: 2,
    ease: "power2.inOut",
    scrollTrigger: {
      trigger: ".cta-arch",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.to(".cta-arch-shape", {
    scale: 1.03,
    ease: "none",
    scrollTrigger: {
      trigger: ".cta-arch",
      start: "top 85%",
      end: "top 35%",
      scrub: 1,
    },
  });

  gsap.to(".cta-glow", {
    scale: 1.2,
    opacity: 0.8,
    ease: "none",
    scrollTrigger: {
      trigger: ".cta-arch",
      start: "top 80%",
      end: "top 40%",
      scrub: 1.5,
    },
  });
}

/* Services border radius scrub */
if (!prefersReducedMotion) {
  gsap.to(".services", {
    borderRadius: "0 0 140px 140px",
    ease: "none",
    scrollTrigger: {
      trigger: ".services",
      start: "top 55%",
      end: "bottom 35%",
      scrub: 1,
    },
  });
}

/* Service card shine + tilt */
document.querySelectorAll(".service-card").forEach((card) => {
  if (prefersReducedMotion) return;
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    gsap.to(card, { rotateX: rx, rotateY: ry, transformPerspective: 800, duration: 0.4 });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power2.out" });
  });
});

/* Nav link color on hero when not scrolled — dark mode header fix */
ScrollTrigger.create({
  trigger: ".hero",
  start: "bottom top",
  end: "bottom top",
  onEnter: () => {},
  onLeaveBack: () => {},
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
});

/* Fallback when Unsplash URLs break (404) */
const IMG_FALLBACK = "assets/images/kyoto.jpg";

/* Image pan inside frame on hover (follows cursor) */
function initImagePan(containers, options = {}) {
  if (prefersReducedMotion) return;

  const { scale = 1.2, maxX = 10, maxY = 7 } = options;

  containers.forEach((wrap) => {
    const img = wrap.querySelector("img");
    if (!img) return;

    const reset = () => {
      wrap.classList.remove("is-panning");
      img.style.transform = "scale(1.12) translate3d(0, 0, 0)";
    };

    wrap.addEventListener("mouseenter", () => {
      wrap.classList.add("is-panning");
    });

    wrap.addEventListener("mousemove", (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `scale(${scale}) translate3d(${x * maxX}%, ${y * maxY}%, 0)`;
    });

    wrap.addEventListener("mouseleave", reset);
  });
}

initImagePan(document.querySelectorAll(".exp-card-media"), { scale: 1.22, maxX: 12, maxY: 8 });
initImagePan(document.querySelectorAll(".gallery-img-wrap"), { scale: 1.18, maxX: 10, maxY: 6 });

document.querySelectorAll(".service-arch img, .gallery-img-wrap img, .exp-card-media img").forEach((img) => {
  img.addEventListener("error", () => {
    if (!img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = IMG_FALLBACK;
    }
  }, { once: true });
});
