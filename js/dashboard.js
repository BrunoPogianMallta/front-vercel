import { listDashboardPosts, loadDashboard } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.trim();
      listDashboardPosts(term);
    });
  }
});

