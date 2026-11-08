import { h } from "../dom.js";

// TODO: implementar la vista "favorites"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "favorites"), h("p", {}, "En construccion"));
}