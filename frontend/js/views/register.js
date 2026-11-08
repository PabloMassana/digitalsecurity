import { h } from "../dom.js";

// TODO: implementar la vista "register"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "register"), h("p", {}, "En construccion"));
}