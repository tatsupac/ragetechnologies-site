const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = menuToggle ? document.getElementById(menuToggle.getAttribute("aria-controls")) : null;
const header = menuToggle?.closest(".site-header");
const mobileMenuQuery = window.matchMedia("(max-width: 560px)");

function setMenuOpen(open) {
  if (!menuToggle || !header) return;

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  header.classList.toggle("menu-open", open);
}

function resetMenuForBreakpoint() {
  if (!header) return;

  header.classList.add("menu-breakpoint-reset");
  setMenuOpen(false);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      header.classList.remove("menu-breakpoint-reset");
    });
  });
}

menuToggle?.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("click", (event) => {
  if (!menuToggle || !primaryNav || menuToggle.getAttribute("aria-expanded") !== "true") return;
  if (!(event.target instanceof Node)) return;
  if (menuToggle.contains(event.target) || primaryNav.contains(event.target)) return;

  setMenuOpen(false);
});

primaryNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

mobileMenuQuery.addEventListener("change", resetMenuForBreakpoint);

const revealGroups = [
  [".vision-copy", ".section-label, h2, p:not(.section-label)"],
  [".business-section", ":scope > .section-label, .service-overview h2, .service-overview p"],
  [".company-section", ":scope > .section-label, h2, .company-details"],
  [".contact-card", ":scope > .section-label, h2, p:not(.section-label), a"],
  [".legal-page", ":scope > h1, :scope > p, :scope > h2, :scope > ul, :scope > ol, :scope > .support-box, :scope > .note"],
  ["footer", ".footer-nav"],
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!prefersReducedMotion.matches) {
  const revealItems = [];

  revealGroups.forEach(([groupSelector, itemSelector]) => {
    const group = document.querySelector(groupSelector);
    if (!group) return;

    group.querySelectorAll(itemSelector).forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 70}ms`);
      revealItems.push(item);
    });
  });

  document.documentElement.classList.add("reveal-enabled");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px",
        threshold: 0.12,
      },
    );

    requestAnimationFrame(() => {
      revealItems.forEach((item) => revealObserver.observe(item));
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

const glitchTextContainers = [...document.querySelectorAll(
  ".brand-name, .site-header nav a, .section-label, h2, .vision-copy p:not(.section-label), .service-overview p, .company-detail dt, .company-detail dd, .contact-card p:not(.section-label), .contact-card a, .footer-nav-label, .footer-nav-links a, footer small",
)];
const glitchMediaTargets = [...document.querySelectorAll(".business-logo img")];

if (!prefersReducedMotion.matches && glitchTextContainers.length + glitchMediaTargets.length > 0) {
  let glitchTimer;
  let glitchCleanupTimer;
  let previousGlitchSource = null;

  function isVisibleGlitchSource(target) {
    const bounds = target.getBoundingClientRect();
    const styles = window.getComputedStyle(target);
    return bounds.bottom > 0 && bounds.top < window.innerHeight && styles.visibility !== "hidden" && styles.opacity !== "0";
  }

  function createGlitchFragment(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return /\S{2,}/u.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const textSegments = [];
    let textNode;

    while ((textNode = walker.nextNode())) {
      const value = textNode.nodeValue || "";
      [...value.matchAll(/\S{2,}/gu)].forEach((match) => {
        textSegments.push({ node: textNode, start: match.index, text: match[0] });
      });
    }

    if (textSegments.length === 0) return null;

    for (let attempt = 0; attempt < 16; attempt += 1) {
      const segment = textSegments[Math.floor(Math.random() * textSegments.length)];
      const maxLength = Math.min(10, segment.text.length);
      const fragmentLength = 2 + Math.floor(Math.random() * Math.max(1, maxLength - 1));
      const offset = Math.floor(Math.random() * (segment.text.length - fragmentLength + 1));
      const start = segment.start + offset;
      const range = document.createRange();

      range.setStart(segment.node, start);
      range.setEnd(segment.node, start + fragmentLength);

      const rectangles = [...range.getClientRects()].filter((rectangle) => rectangle.width > 0 && rectangle.height > 0);
      if (rectangles.length !== 1) continue;

      const rectangle = rectangles[0];
      const sourceStyles = window.getComputedStyle(segment.node.parentElement || container);
      const fragment = document.createElement("span");

      fragment.className = "glitch-fragment";
      fragment.dataset.glitchText = range.toString();
      fragment.textContent = range.toString();
      fragment.style.left = `${rectangle.left + window.scrollX}px`;
      fragment.style.top = `${rectangle.top + window.scrollY}px`;
      fragment.style.width = `${rectangle.width}px`;
      fragment.style.height = `${rectangle.height}px`;
      fragment.style.color = sourceStyles.color;
      fragment.style.fontFamily = sourceStyles.fontFamily;
      fragment.style.fontSize = sourceStyles.fontSize;
      fragment.style.fontStyle = sourceStyles.fontStyle;
      fragment.style.fontWeight = sourceStyles.fontWeight;
      fragment.style.letterSpacing = sourceStyles.letterSpacing;
      fragment.style.lineHeight = `${rectangle.height}px`;
      fragment.style.textTransform = sourceStyles.textTransform;
      fragment.style.wordSpacing = sourceStyles.wordSpacing;
      document.body.append(fragment);
      return fragment;
    }

    return null;
  }

  function createGlitchMediaFragment(image) {
    const bounds = image.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return null;

    const width = bounds.width * (0.2 + Math.random() * 0.38);
    const height = bounds.height * (0.16 + Math.random() * 0.36);
    const offsetX = Math.random() * (bounds.width - width);
    const offsetY = Math.random() * (bounds.height - height);
    const sourceUrl = image.currentSrc || image.src;
    const fragment = document.createElement("span");

    fragment.className = "glitch-media-fragment";
    fragment.style.left = `${bounds.left + window.scrollX + offsetX}px`;
    fragment.style.top = `${bounds.top + window.scrollY + offsetY}px`;
    fragment.style.width = `${width}px`;
    fragment.style.height = `${height}px`;
    fragment.style.backgroundImage = `url("${sourceUrl.replaceAll('"', '\\"')}")`;
    fragment.style.backgroundPosition = `${-offsetX}px ${-offsetY}px`;
    fragment.style.backgroundSize = `${bounds.width}px ${bounds.height}px`;
    document.body.append(fragment);
    return fragment;
  }

  function setRandomGlitchClips(target) {
    ["a", "b", "c"].forEach((name) => {
      const top = Math.round(Math.random() * 52);
      const bottom = Math.round(Math.random() * Math.max(4, 74 - top));
      const left = Math.round(Math.random() * 30);
      const right = Math.round(Math.random() * Math.max(4, 52 - left));

      target.style.setProperty(`--glitch-clip-${name}-top`, `${top}%`);
      target.style.setProperty(`--glitch-clip-${name}-right`, `${right}%`);
      target.style.setProperty(`--glitch-clip-${name}-bottom`, `${bottom}%`);
      target.style.setProperty(`--glitch-clip-${name}-left`, `${left}%`);
    });
  }

  function scheduleGlitch(initial = false) {
    window.clearTimeout(glitchTimer);
    if (document.hidden) return;

    const delay = initial ? 2000 + Math.random() * 2000 : 5500 + Math.random() * 6000;
    glitchTimer = window.setTimeout(triggerGlitch, delay);
  }

  function triggerGlitch() {
    const visibleTextContainers = glitchTextContainers.filter(isVisibleGlitchSource);
    const visibleMediaTargets = glitchMediaTargets.filter(isVisibleGlitchSource);
    const freshTextContainers = visibleTextContainers.filter((target) => target !== previousGlitchSource);
    const textPool = freshTextContainers.length > 0 ? freshTextContainers : visibleTextContainers;
    const useMediaTarget = visibleMediaTargets.length > 0 && (textPool.length === 0 || Math.random() < 0.16);
    const source = useMediaTarget
      ? visibleMediaTargets[Math.floor(Math.random() * visibleMediaTargets.length)]
      : textPool[Math.floor(Math.random() * textPool.length)];
    const target = source ? (useMediaTarget ? createGlitchMediaFragment(source) : createGlitchFragment(source)) : null;

    if (target) {
      const horizontalOffset = Math.round(2 + Math.random() * 3) * (Math.random() < 0.5 ? -1 : 1);
      const skew = (Math.random() * 0.8 - 0.4).toFixed(2);

      target.style.setProperty("--glitch-x", `${horizontalOffset}px`);
      target.style.setProperty("--glitch-x-reverse", `${-horizontalOffset}px`);
      target.style.setProperty("--glitch-y", `${(Math.random() * 2 - 1).toFixed(1)}px`);
      target.style.setProperty("--glitch-skew", `${skew}deg`);
      target.style.setProperty("--glitch-skew-reverse", `${-Number(skew)}deg`);
      setRandomGlitchClips(target);
      target.classList.remove("site-glitch-hit");
      void target.offsetWidth;
      target.classList.add("site-glitch-hit");

      window.clearTimeout(glitchCleanupTimer);
      glitchCleanupTimer = window.setTimeout(() => {
        target.classList.remove("site-glitch-hit");
        target.remove();
      }, 940);

      previousGlitchSource = source;
    }

    scheduleGlitch();
  }

  document.addEventListener("visibilitychange", () => scheduleGlitch(true));
  window.addEventListener("pagehide", () => {
    window.clearTimeout(glitchTimer);
    window.clearTimeout(glitchCleanupTimer);
  });
  scheduleGlitch(true);
}
