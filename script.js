document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  const newsToggle = document.querySelector(".news-toggle");
  const newsList = document.querySelector(".news-list");

  document.querySelectorAll('a[href^="http"], a[href^="//"]').forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  toggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open") ?? false;
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav?.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });

  if (newsToggle && newsList && !newsToggle.dataset.bound) {
    newsToggle.dataset.bound = "true";
    newsList.classList.add("is-collapsed");
    newsToggle.setAttribute("aria-expanded", "false");
    newsToggle.textContent = "Show all news";
  }
});
