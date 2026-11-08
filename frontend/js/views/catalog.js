import { h } from "../dom.js";

// TODO: implementar la vista "catalog"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "catalog"), h("p", {}, "En construccion"));
}