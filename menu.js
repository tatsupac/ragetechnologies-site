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
