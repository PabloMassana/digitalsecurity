const movieGrid = document.getElementById("movie-grid");
const searchInput = document.getElementById("movie-search");
const genreFilter = document.getElementById("genre-filter");
const movieCount = document.getElementById("movie-count");
const emptyResults = document.getElementById("empty-results");
const movieCardTemplate = document.getElementById("movie-card-template");
const decadeButtons = [...document.querySelectorAll("[data-decade]")];
let selectedDecade = "all";

function normalizeText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function createMovieCard(movie) {
  const card = movieCardTemplate.content.firstElementChild.cloneNode(true);
  card.style.setProperty("--accent", movie.color);

  const art = card.querySelector(".card-art");
  art.style.backgroundImage = `url("${movie.image}")`;
  card.querySelector(".year-stamp").textContent = movie.year;
  card.querySelector(".card-art h2").textContent = movie.title;
  card.querySelector(".card-tagline").textContent = movie.tagline;
  card.querySelector(".card-title").textContent = movie.title;
  card.querySelector(".movie-meta").textContent =
    `${movie.genre} · ${movie.runtime} · ${movie.rating}`;
  card.querySelector(".card-synopsis").textContent = movie.synopsis;
  return card;
}

function renderMovies() {
  const query = normalizeText(searchInput.value.trim());
  const genre = genreFilter.value;
  const filteredMovies = movies.filter((movie) => {
    const matchesQuery =
      !query ||
      normalizeText(movie.title).includes(query) ||
      normalizeText(movie.genre).includes(query);
    const matchesGenre = !genre || movie.genre === genre;
    const matchesDecade =
      selectedDecade === "all" ||
      Math.floor(movie.year / 10) * 10 === Number(selectedDecade);
    return matchesQuery && matchesGenre && matchesDecade;
  });

  movieGrid.replaceChildren(...filteredMovies.map(createMovieCard));
  movieCount.textContent = `${filteredMovies.length} ${
    filteredMovies.length === 1 ? "cinta disponible" : "cintas disponibles"
  }`;
  emptyResults.hidden = filteredMovies.length > 0;
}

for (const genre of [...new Set(movies.map((movie) => movie.genre))].sort()) {
  const option = document.createElement("option");
  option.value = genre;
  option.textContent = genre;
  genreFilter.append(option);
}

searchInput.addEventListener("input", renderMovies);
genreFilter.addEventListener("change", renderMovies);
for (const button of decadeButtons) {
  button.addEventListener("click", () => {
    selectedDecade = button.dataset.decade;
    for (const decadeButton of decadeButtons) {
      decadeButton.setAttribute(
        "aria-pressed",
        String(decadeButton === button)
      );
    }
    renderMovies();
  });
}

renderMovies();
updateListCount();
