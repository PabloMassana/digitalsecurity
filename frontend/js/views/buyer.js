import { h } from "../dom.js";

// TODO: implementar la vista "buyer"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "buyer"), h("p", {}, "En construccion"));
}