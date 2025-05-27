import { apiUrl, getToken, getUserId, getUserName, logout } from "./config.js";
import { showToast } from "./toast.js";

// Busca posts públicos
export async function fetchPublicPosts() {
  const res = await fetch(`${apiUrl}/posts`);
  if (!res.ok) throw new Error("Erro ao buscar posts públicos");
  const data = await res.json();
  return data.posts || data;
}

// Curtir um post
export async function likePost(postId) {
  const token = getToken();
  if (!token) {
    showToast("Você precisa estar logado para curtir.", "error");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erro ao curtir post");
    }

    const data = await res.json();
    return data; // { likes, action }

  } catch (error) {
    showToast(error.message, "error");
    console.error(error);
  }
}

// Exibe o usuário logado
export function showLoggedUser() {
  const name = getUserName();
  const userInfo = document.getElementById("user-info");

  userInfo.innerHTML = `
    <p><strong>${name}:</strong> está logado</p>
    <button id="logout-btn" style="margin-top: 10px;">Sair</button>
  `;

  document.getElementById("logout-btn").addEventListener("click", logout);
}

// Carrega o dashboard (form + lista de posts)
export function loadDashboard() {
  const token = getToken();
  if (!token) return (window.location.href = "index.html");

  showLoggedUser();

  document.getElementById("post-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = JSON.stringify(Object.fromEntries(formData));

    const res = await fetch(`${apiUrl}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body,
    });

    if (res.ok) {
      showToast("Post criado com sucesso", "success");
      setTimeout(() => location.reload(), 2000);
    } else {
      showToast("Erro ao criar post", "error");
    }
  });

  listDashboardPosts();
}

// Lista os posts do dashboard com filtro
export async function listDashboardPosts(searchTerm = "") {
  try {
    const res = await fetch(`${apiUrl}/posts`);
    const data = await res.json();
    const posts = data.posts || data;

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = posts.filter(p =>
      p.title.toLowerCase().includes(lowerSearch) ||
      p.user_name?.toLowerCase().includes(lowerSearch) ||
      String(p.id).includes(lowerSearch)
    );

    const container = document.getElementById("posts-container");
    container.innerHTML = filtered.length > 0
      ? filtered.map(renderPostCard).join("")
      : "<p>Nenhum post encontrado.</p>";

  } catch (err) {
    showToast("Erro ao carregar posts", "error");
    console.error(err);
  }
}

// Renderiza o HTML de um post
function renderPostCard(post) {
  const userId = getUserId();
  const isOwner = String(post.user_id) === userId;

  return `
    <div class="card" id="post-${post.id}">
      <h3>#${post.id} - ${post.title}</h3>
      <p><strong>Autor:</strong> ${post.user_name} (ID: ${post.user_id})</p>
      <p>${post.content}</p>
      <div class="card-actions">
        <button onclick="handleLike(${post.id})">❤️ Curtir</button>
        <span id="likes-count-${post.id}">${post.likes || 0}</span> curtidas
        ${isOwner ? `
          <button onclick="editPost(${post.id})">✏️ Editar</button>
          <button onclick="deletePost(${post.id})">🗑️ Excluir</button>
        ` : ""}
      </div>
    </div>
  `;
}

// Funções globais para HTML acessar

// Curtir post
window.handleLike = async function (postId) {
  const result = await likePost(postId);
  if (result !== undefined) {
    const { likes, action } = result;
    const likesEl = document.getElementById(`likes-count-${postId}`);
    if (likesEl) likesEl.textContent = likes;
    const msg = action === "liked" ? "Você curtiu o post!" : "Você descurtiu o post!";
    showToast(msg, "success");
  }
};

// Editar post (vai para a tela de edição)
window.editPost = function (id) {
  window.location.href = `frontend/pages/post-edit.html?id=${id}`;
};

// Excluir post
window.deletePost = async function (id) {
  if (!confirm("Tem certeza que deseja excluir?")) return;

  const token = getToken();

  await fetch(`${apiUrl}/posts/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });

  showToast("Post excluído", "error");

  setTimeout(() => location.reload(), 2000);
};

// Carrega post para edição
window.loadEditPost = async function () {
  const id = new URLSearchParams(window.location.search).get("id");
  const token = getToken();

  try {
    const res = await fetch(`${apiUrl}/posts/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Post não encontrado");

    const post = await res.json();

    document.getElementById("title").value = post?.title || "";
    document.getElementById("content").value = post?.content || "";

    document.getElementById("edit-post")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const body = JSON.stringify(Object.fromEntries(formData));

      const updateRes = await fetch(`${apiUrl}/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body,
      });

      if (!updateRes.ok) {
        showToast("Erro ao atualizar post.", "error");
        return;
      }

      alert("Post atualizado");
      window.location.href = 'frontend/pages/dashboard.html';
    });
  } catch (err) {
    alert("Erro ao carregar post para edição.");
    console.error(err);
  }
};

// Lista todos os posts (público)
window.listAllPosts = async function () {
  try {
    const res = await fetch(`${apiUrl}/posts`);
    const posts = await res.json();

    const container = document.getElementById("posts-container");
    container.innerHTML = posts.map(post => `
      <div class="card">
        <h3>#${post.id} - ${post.title}</h3>
        <p><strong>Autor:</strong> ${post.user_name}</p>
        <p>${post.content}</p>
      </div>
    `).join("");
  } catch (err) {
    console.error("Erro ao carregar posts públicos:", err);
    alert("Erro ao carregar posts públicos");
  }
};
