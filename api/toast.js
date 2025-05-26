export function showToast(message, type = "info", duration = 4000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  // Cria a msg que sera exibida 
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  // Conteúdo da msg 
  toast.textContent = message;

  // Btn fechar
  const btnClose = document.createElement("button");
  btnClose.className = "close-btn";
  btnClose.innerHTML = "&times;";
  btnClose.addEventListener("click", () => {
    container.removeChild(toast);
  });

  toast.appendChild(btnClose);
  container.appendChild(toast);

 
  setTimeout(() => {
    if (container.contains(toast)) {
      container.removeChild(toast);
    }
  }, duration);
}
