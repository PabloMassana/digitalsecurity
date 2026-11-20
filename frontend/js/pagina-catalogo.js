import { api } from "./api.js";

const $ = (id) => document.getElementById(id);
const grid = $("movie-grid");
const template = $("movie-card-template");
const emptyMsg = $("empty-results");
const searchInput = $("movie-search");
const genreSelect = $("genre-filter");
const decadeButtons = document.querySelectorAll("[data-decade]");

let movies = [];
let activeDecade = null;

function fillGenres() {
  const genres = [...new Set(movies.map((m) => m.genre).filter(Boolean))].sort();
  genreSelect.innerHTML = '<option value="">Todos</option>' +
    genres.map((g) => `<option value="${g}">${g}</option>`).join("");
}

function matchesDecade(movie, decade) {
  if (!decade) return true;
  const start = Number(decade);
  return movie.year >= start && movie.year < start + 10;
}

function applyFilters() {
  const q = (searchInput?.value || "").toLowerCase().trim();
  const genre = genreSelect?.value || "";
  return movies.filter((m) => {
    const matchQ = !q || m.title.toLowerCase().includes(q) || (m.genre || "").toLowerCase().includes(q);
    const matchGenre = !genre || m.genre === genre;
    return matchQ && matchGenre && matchesDecade(m, activeDecade);
  });
}

function render() {
  const filtered = applyFilters();
  grid.querySelectorAll(".movie-card").forEach((el) => el.remove());

  emptyMsg.hidden = filtered.length > 0;

  for (const movie of filtered) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".movie-card");
    node.querySelector(".year-stamp").textContent = movie.year;
    node.querySelector(".card-art h2").textContent = movie.title;
    node.querySelector(".card-art").style.background = movie.color || "#222";
    node.querySelector(".card-tagline").textContent = movie.tagline || "";
    node.querySelector(".card-title").textContent = movie.title;
    node.querySelector(".movie-meta").textContent = [movie.genre, movie.runtime, movie.rating].filter(Boolean).join(" · ");
    node.querySelector(".card-synopsis").textContent = movie.synopsis || "";
    article.style.cursor = "pointer";
    article.addEventListener("click", () => { location.href = `/detalle?id=${movie.id}`; });
    grid.appendChild(article);
  }
}

searchInput?.addEventListener("input", render);
genreSelect?.addEventListener("change", render);
decadeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const decade = btn.dataset.decade;
    activeDecade = activeDecade === decade ? null : decade;
    decadeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.decade === activeDecade)));
    render();
  });
});

(async function init() {
  try {
    const data = await api("/movies");
    movies = (data.movies || data).map((m) => ({ ...m, id: m.id || m._id }));
    fillGenres();
    render();
  } catch (err) {
    emptyMsg.hidden = false;
    emptyMsg.textContent = "No se pudieron cargar las películas: " + err.message;
  }
})();