import { h, money } from "./dom.js";

export function movieCard(m, extra) {
  return h("article", { class: "card" },
    m.image ? h("img", { src: m.image, alt: "Póster de " + m.title, class: "poster" })
            : h("div", { class: "poster ph" }, m.title.slice(0, 1)),
    h("div", { class: "body" },
      h("h3", {}, m.title),
      h("p", { class: "meta" }, [m.year, m.genre].filter(Boolean).join(" · ")),
      h("p", { class: "price" }, money(m.price), " ", h("small", {}, "stock: " + m.stock)),
      h("a", { href: "#/movie/" + m.id }, "Ver detalle"),
      extra || ""));
}