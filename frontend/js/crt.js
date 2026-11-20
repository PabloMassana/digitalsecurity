for (const button of document.querySelectorAll(".crt-toggle, .auth-crt-toggle")) {
  button.addEventListener("click", () => {
    const app = document.querySelector(".app");
    const on = app.classList.toggle("crt-on");
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", String(on));
    button.querySelector(".toggle-label").textContent = `CRT ${on ? "ON" : "OFF"}`;
  });
}
