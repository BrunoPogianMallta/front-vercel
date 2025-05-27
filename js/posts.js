import {
  apiUrl,
  getToken,
  getUserId,
  getUserName,
  logout
} from "./config.js";
import { showToast } from "./toast.js";


//Busca todos os posts públicos.
export async function fetchPublicPosts() {
  try {
    const res = await fetch(`${apiUrl}/posts`);
    if (!res.ok) throw new Error("Erro ao buscar posts públicos");
    const data = await res.json();
    return data.posts || data;
  } catch (error) {
    showToast(error.message, "error");
    console.error(error);
  }
}


 //Envia um like para um post.

export async function likePost(postId) {
  const token = getToken();

  if (!token) {
    showToast("Você precisa estar logado para curtir.", "error");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao curtir post");

    return data; 
  } catch (error) {
    showToast(error.message, "error");
    console.error(error);
  }
}


 //Exibe nome do usuário logado no dashboard.

export function showLoggedUser() {
  const name = getUserName();
  const userInfo = document.getElementById("user-info");

  userInfo.innerHTML = `
    <p><strong>${name}:</strong> está logado</p>
    <button id="logout-btn" style="margin-top: 10px;">Sair</button>
  `;

  document.getElementById("logout-btn").addEventListener("click", logout);
}


// Carrega dashboard com formulário e lista de posts.

export function loadDashboard() {
  const token = getToken();
  if (!token) return (window.location.href = "index.html");

  showLoggedUser();
  initPostForm(token);
  listDashboardPosts();
}


 //Inicializa o formulário de criação de post.
 
function initPostForm(token) {
  const form = document.getElementById("post-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = JSON.stringify(Object.fromEntries(formData));

    try {
      const res = await fetch(`${apiUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!res.ok) throw new Error();

      showToast("Post criado com sucesso", "success");
      setTimeout(() => location.reload(), 2000);
    } catch {
      showToast("Erro ao criar post", "error");
    }
  });
}


 //Lista os posts do dashboard com filtro de busca.
 
export async function listDashboardPosts(searchTerm = "") {
  try {
    const res = await fetch(`${apiUrl}/posts`);
    const data = await res.json();
    const posts = data.posts || data;
    const filtered = filterPosts(posts, searchTerm);

    const container = document.getElementById("posts-container");
    container.innerHTML = filtered.length > 0
      ? filtered.map(renderPostCard).join("")
      : "<p>Nenhum post encontrado.</p>";
  } catch (error) {
    showToast("Erro ao carregar posts", "error");
    console.error(error);
  }
}

//Filtra posts por título, autor ou ID.
function filterPosts(posts, term) {
  const search = term.toLowerCase();
  return posts.filter(post =>
    post.title.toLowerCase().includes(search) ||
    post.user_name?.toLowerCase().includes(search) ||
    String(post.id).includes(search)
  );
}

//Renderiza o HTML de um post.
function renderPostCard(post) {
  const userId = getUserId();
  const isOwner = String(post.user_id) === userId;
  const hasLiked = post.likers?.includes(userId);

  return `
    <div class="card" id="post-${post.id}">
      <div class="card-header">
        <h3>#${post.id} - ${post.title}</h3>
        ${isOwner ? renderPostDropdown(post.id) : ""}
      </div>
      <p><strong>Autor:</strong> ${post.user_name}</p>
      <p>${post.content}</p>
      <div class="card-actions">
        <button 
          onclick="handleLike(${post.id})" 
          class="action-btn like-btn ${hasLiked ? 'liked' : ''}" 
          aria-label="Curtir">
          ❤️ Curtir
        </button>
        <span id="likes-count-${post.id}">${post.likes || 0} curtidas</span>
        ${renderLikers(post.likers)}
      </div>
    </div>
  `;
}

function renderPostDropdown(postId) {
  return `
    <div class="dropdown">
      <button class="dropdown-toggle" onclick="toggleDropdown(${postId})">⋯</button>
      <div class="dropdown-menu" id="dropdown-${postId}">
        <button onclick="editPost(${postId})">Editar</button>
        <button onclick="deletePost(${postId})">Excluir</button>
      </div>
    </div>
  `;
}

function renderLikers(likers) {
  return likers?.length
    ? `<p class="likers">Curtido por: ${likers.map(name => `<strong>${name}</strong>`).join(', ')}</p>`
    : '';
}

//Dropdown toggle global
window.toggleDropdown = function (postId) {
  const current = document.getElementById(`dropdown-${postId}`);
  current.style.display = current.style.display === "block" ? "none" : "block";

  document.querySelectorAll(".dropdown-menu").forEach(menu => {
    if (menu.id !== `dropdown-${postId}`) menu.style.display = "none";
  });
};

// Fecha dropdown ao clicar fora
document.addEventListener("click", (event) => {
  document.querySelectorAll(".dropdown-menu").forEach(menu => {
    if (!menu.contains(event.target) && !menu.previousElementSibling.contains(event.target)) {
      menu.style.display = "none";
    }
  });
});

//Evento de curtir post
window.handleLike = async function (postId) {
  const result = await likePost(postId);
  if (result) {
    const { likes, action } = result;
    const likesEl = document.getElementById(`likes-count-${postId}`);
    if (likesEl) likesEl.textContent = likes;
    const msg = action === "liked" ? "Você curtiu o post!" : "Você descurtiu o post!";
    showToast(msg, "success");
  }
};

//Redireciona para a página de edição do post
window.editPost = function (id) {
  window.location.href = `frontend/pages/post-edit.html?id=${id}`;
};

//Exclui um post do sistema
window.deletePost = async function (id) {
  if (!confirm("Tem certeza que deseja excluir?")) return;
  const token = getToken();

  try {
    await fetch(`${apiUrl}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    showToast("Post excluído", "error");
    setTimeout(() => location.reload(), 2000);
  } catch (err) {
    showToast("Erro ao excluir post", "error");
    console.error(err);
  }
};

//Carrega dados do post para edição
window.loadEditPost = async function () {
  const id = new URLSearchParams(window.location.search).get("id");
  const token = getToken();

  try {
    const res = await fetch(`${apiUrl}/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Post não encontrado");
    const post = await res.json();

    document.getElementById("title").value = post?.title || "";
    document.getElementById("content").value = post?.content || "";

    document.getElementById("edit-post")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const body = JSON.stringify(Object.fromEntries(formData));

      try {
        const updateRes = await fetch(`${apiUrl}/posts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        });

        if (!updateRes.ok) throw new Error();

        alert("Post atualizado");
        window.location.href = 'frontend/pages/dashboard.html';
      } catch {
        showToast("Erro ao atualizar post.", "error");
      }
    });
  } catch (err) {
    alert("Erro ao carregar post para edição.");
    console.error(err);
  }
};

//Lista todos os posts publicamente
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