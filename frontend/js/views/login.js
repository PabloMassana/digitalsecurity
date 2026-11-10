import { h } from "../dom.js";

// TODO: implementar la vista "login"
export default async function view(params, session) {
  return h("section", { class: "wrap" }, h("h2", {}, "login"), h("p", {}, "En construccion"));
}