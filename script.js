const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const newsToggle = document.querySelector(".news-toggle");
const newsList = document.querySelector(".news-list");

toggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  }
});

newsToggle?.addEventListener("click", () => {
  const isCollapsed = newsList.classList.toggle("is-collapsed");
  newsToggle.setAttribute("aria-expanded", String(!isCollapsed));
  newsToggle.textContent = isCollapsed ? "Show all news" : "Show fewer news items";
});
