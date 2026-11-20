const id = Number(new URLSearchParams(location.search).get("id")) || 1; //modificar en backend para que ya no muestre 1
const m = movies.find((x) => x.id === id) || movies[0];
const pad = (n, l) => String(n).padStart(l, "0");
const heart =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>';
document.title = "Videoclub Nocturno — " + m.title;
document.getElementById("layout").innerHTML = `
            <div class="detail-poster" style="background-image:url(${m.image});--accent:${m.color}">
                <span class="poster-rating">${m.rating}</span>
                <div><small>UNA PELÍCULA DE</small><h1>${m.title}</h1><p>${m.tagline}</p></div>
            </div>
            <div class="detail-content">
                <p class="eyebrow">Cinta Nº ${pad(m.id, 3)} — Archivo nocturno</p>
                <h2>${m.title}</h2><p class="detail-tagline">“${m.tagline}”</p>
                <div class="meta"><span>${m.year}</span><span>${m.genre}</span><span>${m.runtime}</span></div>
                <h3>Sinopsis</h3>
                <p class="synopsis">${m.synopsis}</p>
                <h3>Reparto principal</h3>
                <div class="cast">${m.cast.map((p) => "<span>" + p + "</span>").join("")}</div>
                <div class="detail-actions">
                  <button class="favorite-button" id="fav"></button>
                  <button class="action-button action-edit" type="button" data-id="${m.id}" data-titulo="${m.title}">Modificar</button>
                  <button class="action-button action-delete" type="button" data-id="${m.id}" data-titulo="${m.title}">Eliminar</button>
                </div>
            </div>`;
const fav = document.getElementById("fav");
function paintFav() {
  const s = getFavs().includes(m.id);
  fav.className = "favorite-button" + (s ? " saved" : "");
  fav.innerHTML = heart + (s ? "Guardada en mi lista" : "Guardar en mi lista");
  updateListCount();
}
fav.onclick = () => {
  toggleFav(m.id);
  paintFav();
};
paintFav();
