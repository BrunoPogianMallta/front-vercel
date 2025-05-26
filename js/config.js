export const apiUrl = "https://repositoriadamiseria.onrender.com";

export const getToken = () => localStorage.getItem("token");
export const getUserId = () => localStorage.getItem("userId");
export const getUserName = () => localStorage.getItem("userName") || "Usuário";

export const logout = () => {
  localStorage.clear();
  window.location.href = "index.html";
};
