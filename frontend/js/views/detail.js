import { h } from "../dom.js";

// TODO: implementar la vista "detail"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "detail"), h("p", {}, "En construccion"));
}