export function attachFormToggle() {
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");

  btnLogin.addEventListener("click", () => {
    loginSection.style.display = "block";
    registerSection.style.display = "none";

    btnLogin.classList.add("active");
    btnRegister.classList.remove("active");
  });

  btnRegister.addEventListener("click", () => {
    registerSection.style.display = "block";
    loginSection.style.display = "none";

    btnRegister.classList.add("active");
    btnLogin.classList.remove("active");
  });
}
