import { apiUrl, getToken, getUserId, getUserName, logout } from "./config.js";
import { showToast } from "./toast.js";

export async function fetchPublicPosts() {
  const res = await fetch(`${apiUrl}/posts`);
  if (!res.ok) throw new Error("Erro ao buscar posts públicos");
  const data = await res.json();
  return data.posts || data;
}

export function showLoggedUser() {
  const name = getUserName();
  const userInfo = document.getElementById("user-info");

  userInfo.innerHTML = `
    <p> <strong>${name}:</strong> está logado</p>
    <button id="logout-btn" style="margin-top: 10px;">Sair</button>
  `;

  document.getElementById("logout-btn").addEventListener("click", logout);
}

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
      setTimeout(() => {
        location.reload();
      }, 2000);
    } else {
      showToast("Erro ao criar post", "error");
    }
  });

  listDashboardPosts();
}

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

function renderPostCard(post) {
  const userId = getUserId();
  const isOwner = String(post.user_id) === userId;

  return `
    <div class="card">
      <h3>#${post.id} - ${post.title}</h3>
      <p><strong>Autor:</strong> ${post.user_name} (ID: ${post.user_id})</p>
      <p>${post.content}</p>
      <div class="card-actions">
        ${isOwner ? `
          <button onclick="editPost(${post.id})">✏️ Editar</button>
          <button onclick="deletePost(${post.id})">🗑️ Excluir</button>
        ` : ""}
      </div>
    </div>
  `;
}

// 🔧 Caminho relativo corrigido para GitHub Pages funcionar
window.editPost = function (id) {
  window.location.href = `post-edit.html?id=${id}`;
};

window.deletePost = async function (id) {
  if (!confirm("Tem certeza que deseja excluir?")) return;

  const token = getToken();

  await fetch(`${apiUrl}/posts/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });

  showToast("Post excluído", "error");

  setTimeout(() => {
    location.reload();
  }, 2000);
};

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
      window.location.href = 'dashboard.html'; // Caminho direto da mesma pasta
    });
  } catch (err) {
    alert("Erro ao carregar post para edição.");
    console.error(err);
  }
};

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
