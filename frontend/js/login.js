import { api } from "./api.js";
import { Session } from "./session.js";

const form = document.querySelector(".auth-form");
const errorEl = document.querySelector(".auth-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    Session.set({ token: data.token, user: data.user });
    location.href = "Catalogo.html";
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});