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
