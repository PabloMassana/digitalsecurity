import { h } from "../dom.js";

// TODO: implementar la vista "admin"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "admin"), h("p", {}, "En construccion"));
}