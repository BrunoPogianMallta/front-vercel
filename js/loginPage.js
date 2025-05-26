import { initAuthForms } from "./auth.js";

function attachFormToggle() {
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");

  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");

  btnLogin.addEventListener("click", () => {
    btnLogin.classList.add("active");
    btnRegister.classList.remove("active");
    loginSection.classList.add("active");
    registerSection.classList.remove("active");
  });

  btnRegister.addEventListener("click", () => {
    btnRegister.classList.add("active");
    btnLogin.classList.remove("active");
    registerSection.classList.add("active");
    loginSection.classList.remove("active");
  });
}


attachFormToggle();
initAuthForms();
