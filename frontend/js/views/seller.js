import { h } from "../dom.js";

// TODO: implementar la vista "seller"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "seller"), h("p", {}, "En construccion"));
}