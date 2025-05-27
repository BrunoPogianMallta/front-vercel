import { apiUrl } from "./config.js";
import { showToast } from "./toast.js";

export function initAuthForms() {
  // Handler do login
  document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = JSON.stringify(Object.fromEntries(formData));

    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user?.name || "Usuário");
        localStorage.setItem("userId", String(data.user?.id || ""));

        showToast("Login realizado com sucesso!", "success");

        // Feedback tátil ao logar com sucesso
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }

        setTimeout(() => {
          window.location.href = '/front-vercel/frontend/pages/dashboard.html';
        }, 1000);
      } else {
        showToast(data.error || "Erro ao logar", "error");
      }
    } catch (err) {
      console.error("Erro ao logar:", err);
      showToast("Erro de conexão", "error");
    }
  });

  // Handler do cadastro
  document.getElementById("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = JSON.stringify(Object.fromEntries(formData));

    try {
      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Cadastro realizado com sucesso!", "success");

        // Vibrar no celular para feedback
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }

        e.target.reset();

        // Alternar para aba de login após cadastro
        document.getElementById("btn-login").click();

      } else {
        showToast(data.error || "Erro ao cadastrar", "error");
      }
    } catch (err) {
      console.error("Erro no registro:", err);
      showToast("Erro de conexão", "error");
    }
  });
}
