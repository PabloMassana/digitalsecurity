import { api } from "./api.js";

const pad = (n, l) => String(n).padStart(l, "0");
const id = new URLSearchParams(location.search).get("id");

function getFavs() {
  try { return JSON.parse(localStorage.getItem("ds-favs")) || []; } catch { return []; }
}
function toggleFav(movieId) {
  const favs = getFavs();
  const i = favs.indexOf(movieId);
  if (i >= 0) favs.splice(i, 1); else favs.push(movieId);
  localStorage.setItem("ds-favs", JSON.stringify(favs));
}

const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l7.8 7.8l1.1 1.1l1.1-1.1l7.8-7.8a5.5 5.5 0 0 0 .-1.7-7.8Z"/></svg>';

async function init() {
  let m;
  try {
    m = await api(`/movies/${id}`);
  } catch (err) {
    document.getElementById("layout").innerHTML = `<p>No se encontró la película.</p>`;
    return;
  }

  document.title = "Videoclub Nocturno — " + m.title;
  const imgUrl = m.image ? `${location.protocol}//${location.hostname}:5000/uploads/${m.image}` : "";

  document.getElementById("layout").innerHTML = `
    <div class="detail-poster" style="background-image:url(${imgUrl});--accent:${m.color || "#ff2e88"}">
      <span class="poster-rating">${m.rating || ""}</span>
      <div><small>UNA PELÍCULA DE</small><h1>${m.title}</h1><p>${m.tagline || ""}</p></div>
    </div>
    <div class="detail-content">
      <p class="eyebrow">Archivo nocturno</p>
      <h2>${m.title}</h2><p class="detail-tagline">"${m.tagline || ""}"</p>
      <div class="meta"><span>${m.year}</span><span>${m.genre}</span><span>${m.runtime}</span></div>
      <h3>Sinopsis</h3>
      <p class="synopsis">${m.synopsis}</p>
      <h3>Reparto principal</h3>
      <div class="cast">${(m.cast || []).map((p) => "<span>" + p + "</span>").join("")}</div>
      <button class="favorite-button" id="fav"></button>
    </div>
    <div class="ticket">
      <div class="ticket-top"><span>VIDEOCLUB NOCTURNO</span><b>ADMIT ONE</b></div>
      <div class="ticket-main"><small>SESIÓN ESPECIAL</small><h3>${m.title}</h3>
        <div><p>FECHA<br><b>HOY</b></p><p>HORA<br><b>23:45</b></p><p>SALA<br><b>03</b></p></div>
      </div>
      <div class="barcode">||| || |||| | ||| || ||||</div>
      <small class="ticket-id">VN-${m.year}</small>
    </div>`;

  const fav = document.getElementById("fav");
  function paintFav() {
    const saved = getFavs().includes(m.id);
    fav.className = "favorite-button" + (saved ? " saved" : "");
    fav.innerHTML = heart + (saved ? "Guardada en mi lista" : "Guardar en mi lista");
  }
  fav.onclick = () => { toggleFav(m.id); paintFav(); };
  paintFav();
}

init();