let i = 0;
const pad = (n, length) => String(n).padStart(length, "0");
const $ = (id) => document.getElementById(id);

function renderFeaturedMovie() {
  const movie = movies[i];
  $("art").style.backgroundImage = `url("${movie.image}")`;
  $("year").textContent = movie.year;
  $("num").textContent = `Nº ${pad(movie.id, 3)} — NUEVO INGRESO`;
  $("title").textContent = movie.title;
  $("tagline").textContent = movie.tagline;
  $("meta").innerHTML = [movie.genre, movie.runtime, movie.rating]
    .map((item) => `<span>${item}</span>`)
    .join("");
  $("synopsis").textContent = movie.synopsis;
  $("link").href = `/detalle?id=${movie.id}`;
  $("counter").textContent = `${pad(i + 1, 2)} / ${pad(movies.length, 2)}`;
}

$("prev").addEventListener("click", () => {
  i = (i + movies.length - 1) % movies.length;
  renderFeaturedMovie();
});
$("next").addEventListener("click", () => {
  i = (i + 1) % movies.length;
  renderFeaturedMovie();
});

renderFeaturedMovie();
updateListCount();
