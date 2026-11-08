import { $, h, say } from "./dom.js";
import { Session } from "./session.js";

const routes = [
  { re: /^\/$/,             mod: "home" },
  { re: /^\/catalog$/,      mod: "catalog" },
  { re: /^\/movie\/(\w+)$/, mod: "detail" },
  { re: /^\/favorites$/,    mod: "favorites" },
  { re: /^\/login$/,        mod: "login" },
  { re: /^\/register$/,     mod: "register" },
  { re: /^\/buyer$/,        mod: "buyer",  roles: ["buyer"] },
  { re: /^\/seller$/,       mod: "seller", roles: ["seller", "admin"] },
  { re: /^\/admin$/,        mod: "admin",  roles: ["admin"] }
];
const ETIQUETA = { buyer: "comprador", seller: "vendedor", admin: "administrador" };

function nav(s) {
  const links = [["#/", "Inicio"], ["#/catalog", "Catálogo"], ["#/favorites", "Mi lista"]];
  if (s) {
    const r = s.user.role;
    if (r === "buyer") links.push(["#/buyer", "Mi compra"]);
    if (r === "seller" || r === "admin") links.push(["#/seller", "Vender"]);
    if (r === "admin") links.push(["#/admin", "Administrar"]);
  } else {
    links.push(["#/login", "Entrar"], ["#/register", "Registrarse"]);
  }
  const n = h("nav", {},
    links.map(([href, t]) => h("a", { href }, t)),
    h("button", { class: "btn small alt", onclick: () => {
      document.body.classList.toggle("crt");
      localStorage.setItem("ds-crt", document.body.classList.contains("crt") ? "1" : "0");
    } }, "CRT"));
  if (s) n.append(
    h("span", { class: "who" }, s.user.username + " (" + ETIQUETA[s.user.role] + ")"),
    h("button", { class: "btn small", onclick: () => {
      Session.clear();
      if (location.hash === "#/") render(); else location.hash = "#/";
    } }, "Salir"));
  $("#topbar").replaceChildren(h("div", { class: "wrap" }, h("a", { class: "logo", href: "#/" }, "VIDEOCLUB NOCTURNO"), n));
}

function show(node) {
  const v = $("#view");
  v.classList.remove("glitch");
  void v.offsetWidth;
  v.classList.add("glitch");
  v.replaceChildren(node);
}

async function render() {
  const path = location.hash.slice(1) || "/";
  const s = Session.get();
  nav(s);
  say("");
  const route = routes.find(r => r.re.test(path));
  if (!route) return show(h("section", { class: "wrap" }, h("h2", {}, "404"), h("p", {}, "Esta cinta no existe."), h("a", { href: "#/" }, "Volver al inicio")));
  // Solo mejora la experiencia: la autorización real la aplica el backend en cada ruta
  if (route.roles && !(s && route.roles.includes(s.user.role))) { location.hash = "#/login"; return; }
  try {
    const mod = await import("./views/" + route.mod + ".js");
    show(await mod.default(path.match(route.re).slice(1), s));
  } catch (e) { say(e.message, "err"); }
}

if (localStorage.getItem("ds-crt") === "1") document.body.classList.add("crt");
addEventListener("hashchange", render);
render();