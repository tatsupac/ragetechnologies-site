const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = menuToggle ? document.getElementById(menuToggle.getAttribute("aria-controls")) : null;
const header = menuToggle?.closest(".site-header");

function setMenuOpen(open) {
  if (!menuToggle || !header) return;

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  header.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
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
