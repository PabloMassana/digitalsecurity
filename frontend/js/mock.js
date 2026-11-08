const movies = [
  { id: "1", title: "Volver al Futuro", year: 1985, genre: "Aventura", description: "Un joven viaja al pasado en un auto muy especial.", price: 9.99, stock: 5, image: "", sellerId: "2" },
  { id: "2", title: "E.T. el extraterrestre", year: 1982, genre: "Familiar", description: "Una amistad inolvidable con un visitante de otro planeta.", price: 8.99, stock: 4, image: "", sellerId: "2" },
  { id: "3", title: "Los Goonies", year: 1985, genre: "Aventura", description: "Un grupo de amigos busca un tesoro pirata.", price: 7.99, stock: 6, image: "", sellerId: "2" },
  { id: "4", title: "La historia sin fin", year: 1984, genre: "Fantasía", description: "Un libro mágico abre las puertas a otro mundo.", price: 7.49, stock: 3, image: "", sellerId: "2" },
  { id: "5", title: "Tron", year: 1982, genre: "Ciencia ficción", description: "Un programador queda atrapado dentro de una computadora.", price: 6.99, stock: 8, image: "", sellerId: "2" }
];
let users = [
  { id: "1", username: "comprador1", email: "c1@mail.com", role: "buyer" },
  { id: "2", username: "vendedor1", email: "v1@mail.com", role: "seller" },
  { id: "3", username: "admin", email: "admin@mail.com", role: "admin" }
];
const purchases = [];
let seq = 100;
const fail = msg => { throw new Error(msg); };

export async function mock(path, method, body) {
  await new Promise(r => setTimeout(r, 120));
  const [p, qs = ""] = path.split("?");
  const q = new URLSearchParams(qs);
  const s = JSON.parse(sessionStorage.getItem("ds-session") || "null");
  let m;

  if (p === "/auth/login" && method === "POST") {
    const u = users.find(x => x.username === body.username) || fail("Credenciales inválidas");
    return { token: "mock-" + u.id, user: u };
  }
  if (p === "/auth/register" && method === "POST") {
    users.push({ id: String(seq++), username: body.username, email: body.email, role: "buyer" });
    return { ok: true };
  }
  if (p === "/movies" && method === "GET") {
    const text = (q.get("q") || "").toLowerCase();
    return movies.filter(x =>
      (!text || (x.title + " " + x.genre).toLowerCase().includes(text)) &&
      (!q.get("genre") || x.genre === q.get("genre")) &&
      (!q.get("decade") || Math.floor(x.year / 10) * 10 === Number(q.get("decade"))));
  }
  if (p === "/movies" && method === "POST") {
    const f = Object.fromEntries(body.entries());
    movies.push({ id: String(seq++), title: f.title, year: Number(f.year) || null, genre: f.genre || "", description: f.description, price: Number(f.price), stock: Number(f.stock), image: "", sellerId: s ? s.user.id : null });
    return { ok: true };
  }
  if ((m = p.match(/^\/movies\/(\w+)$/))) {
    const x = movies.find(v => v.id === m[1]) || fail("Película no encontrada");
    if (method === "GET") return x;
    if (method === "PUT") { Object.assign(x, body, { price: Number(body.price), stock: Number(body.stock) }); return { ok: true }; }
    if (method === "DELETE") { movies.splice(movies.indexOf(x), 1); return { ok: true }; }
  }
  if (p === "/purchases" && method === "POST") {
    const items = body.items.map(i => {
      const x = movies.find(v => v.id === i.movieId) || fail("Película no encontrada");
      if (i.quantity > x.stock) fail("Sin stock de " + x.title);
      x.stock -= i.quantity;
      return { title: x.title, quantity: i.quantity, price: x.price, subtotal: x.price * i.quantity };
    });
    const inv = { id: String(seq++), date: new Date().toISOString(), buyer: s ? s.user.username : "?", items, total: items.reduce((a, i) => a + i.subtotal, 0) };
    purchases.push(inv);
    return inv;
  }
  if (p === "/purchases/mine" && method === "GET") return purchases.filter(x => s && x.buyer === s.user.username);
  if (p === "/admin/users" && method === "GET") return users;
  if (p === "/admin/users" && method === "POST") { users.push({ id: String(seq++), username: body.username, email: body.email, role: body.role }); return { ok: true }; }
  if ((m = p.match(/^\/admin\/users\/(\w+)$/))) {
    const u = users.find(v => v.id === m[1]) || fail("Usuario no encontrado");
    if (method === "PUT") { Object.assign(u, body); return { ok: true }; }
    if (method === "DELETE") { users = users.filter(v => v !== u); return { ok: true }; }
  }
  throw new Error("Mock sin ruta: " + method + " " + p);
}