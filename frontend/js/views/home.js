import { h } from "../dom.js";

// TODO: implementar la vista "home"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "home"), h("p", {}, "En construccion"));
}