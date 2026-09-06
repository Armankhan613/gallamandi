const BASE_URL = API_BASE_URL;
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login.html";
}

const sections = [...document.querySelectorAll(".section")];
const navLinks = [...document.querySelectorAll(".nav-link")];
const pageTitle = document.getElementById("pageTitle");
const modal = document.getElementById("modal");
const productForm = document.getElementById("productForm");
const attributesList = document.getElementById("attributesList");
const toast = document.getElementById("toast");
const imageInput = document.getElementById("productImage");
const imagePreviewWrap = document.getElementById("imagePreviewWrap");
const imagePreview = document.getElementById("productImagePreview");

let allProducts = [];

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.className = `toast show${isError ? " error" : ""}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.className = "toast"; }, 2200);
}

function authFetch(path, options = {}) {
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

function switchSection(name) {
  sections.forEach(s => s.classList.toggle("active", s.id === name));
  navLinks.forEach(btn => btn.classList.toggle("active", btn.dataset.section === name));
  pageTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  if (name === "dashboard") loadStats();
  if (name === "products") loadProducts();
  if (name === "orders") loadOrders();
  if (name === "users") loadUsers();
}

navLinks.forEach(btn => btn.addEventListener("click", () => switchSection(btn.dataset.section)));
document.querySelectorAll("[data-section-jump]").forEach(btn => btn.addEventListener("click", () => switchSection(btn.dataset.sectionJump)));

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("token");
  window.location.href = "../login.html";
};

async function loadStats() {
  try {
    const r = await authFetch("/api/admin/stats");
    if (!r.ok) throw new Error((await r.json()).message || "Unable to load stats");
    const d = await r.json();
    document.getElementById("statProducts").textContent = d.active_products ?? d.products ?? 0;
    document.getElementById("statOrders").textContent = d.orders;
    document.getElementById("statUsers").textContent = d.users;
    document.getElementById("statRevenue").textContent = `₹${Number(d.revenue).toLocaleString("en-IN")}`;
  } catch (e) { showToast(e.message, true); }
}

function getImageUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function loadProducts() {
  const wrap = document.getElementById("productsTableWrap");
  wrap.innerHTML = "<div class='empty'>Loading products…</div>";
  try {
    const r = await authFetch("/api/admin/products");
    if (!r.ok) throw new Error((await r.json()).message || "Unable to load products");
    allProducts = await r.json();
    renderProducts();
  } catch (e) { wrap.innerHTML = `<div class='empty'>${e.message}</div>`; }
}

function renderProducts() {
  const wrap = document.getElementById("productsTableWrap");
  if (!allProducts.length) { wrap.innerHTML = "<div class='empty'>No products yet.</div>"; return; }
  wrap.innerHTML = `
    <table>
      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${allProducts.map(p => `
          <tr>
            <td><div class='product-row'>${p.image_url ? `<img src='${getImageUrl(p.image_url)}' alt=''>` : ""}<div><strong>${p.name}</strong><div class='muted'>#${p.id}</div></div></div></td>
            <td>${p.category || "—"}</td>
            <td>₹${Number(p.price).toLocaleString("en-IN")}</td>
            <td>${p.stock}</td>
            <td><span class='badge ${p.is_active ? "" : "inactive"}'>${p.is_active ? "Active" : "Inactive"}</span></td>
            <td><div class='actions'>
              <button class='secondary edit-product' data-id='${p.id}'>Edit</button>
              ${p.is_active ? `<button class='danger-btn deactivate-product' data-id='${p.id}'>Deactivate</button>` : `<button class='primary restore-product' data-id='${p.id}'>Restore</button>`}
            </div></td>
          </tr>`).join("")}
      </tbody>
    </table>`;
  wrap.querySelectorAll(".edit-product").forEach(b => b.onclick = () => openProductModal(Number(b.dataset.id)));
  wrap.querySelectorAll(".deactivate-product").forEach(b => b.onclick = () => deactivateProduct(Number(b.dataset.id)));
  wrap.querySelectorAll(".restore-product").forEach(b => b.onclick = () => restoreProduct(Number(b.dataset.id)));
}

async function deactivateProduct(id) {
  if (!confirm("Deactivate this product? It will disappear from the public catalog but remain in historical orders.")) return;
  try {
    const r = await authFetch(`/api/products/${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || "Unable to deactivate product");
    showToast(d.message);
    await loadProducts();
    loadStats();
  } catch (e) { showToast(e.message, true); }
}

async function restoreProduct(id) {
  try {
    const r = await authFetch(`/api/admin/products/${id}/restore`, { method: "PATCH" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || "Unable to restore product");
    showToast(d.message);
    loadProducts();
    loadStats();
  } catch (e) { showToast(e.message, true); }
}

function addAttributeRow(key = "", value = "") {
  const row = document.createElement("div");
  row.className = "attr-row";
  row.innerHTML = `<input class='attr-key' placeholder='Key' value='${escapeHtml(key)}'><input class='attr-value' placeholder='Value' value='${escapeHtml(value)}'><button type='button' class='remove-attr'>×</button>`;
  row.querySelector(".remove-attr").onclick = () => row.remove();
  attributesList.appendChild(row);
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

document.getElementById("addAttribute").onclick = () => addAttributeRow();

function openProductModal(id = null) {
  productForm.reset();
  attributesList.innerHTML = "";
  document.getElementById("productId").value = id || "";
  document.getElementById("modalTitle").textContent = id ? "Edit product" : "Add product";
  if (id) {
    const p = allProducts.find(x => String(x.id) === String(id));
    if (!p) return;
    document.getElementById("productName").value = p.name || "";
    document.getElementById("productCategory").value = p.category || "";
    document.getElementById("productPrice").value = p.price ?? "";
    document.getElementById("productStock").value = p.stock ?? "";
    document.getElementById("productDescription").value = p.description || "";
    if (p.image_url) {
      imagePreview.src = getImageUrl(p.image_url);
      imagePreviewWrap.classList.remove("hidden");
    }
    Object.entries(p.attributes || {}).forEach(([k,v]) => addAttributeRow(k, v));
  }
  imageInput.value = "";
  if (!id) {
    imagePreview.removeAttribute("src");
    imagePreviewWrap.classList.add("hidden");
  }

  if (!attributesList.children.length) addAttributeRow();
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast("Image must be 5 MB or smaller", true);
    imageInput.value = "";
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file", true);
    imageInput.value = "";
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  imagePreview.src = objectUrl;
  imagePreviewWrap.classList.remove("hidden");
  imagePreview.onload = () => URL.revokeObjectURL(objectUrl);
});

document.getElementById("addProductBtn").onclick = () => openProductModal();
document.getElementById("closeModal").onclick = () => closeModal();
document.getElementById("cancelModal").onclick = () => closeModal();
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
function closeModal() { modal.classList.add("hidden"); modal.setAttribute("aria-hidden", "true"); }

productForm.addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("productId").value;
  const attributes = {};

  attributesList.querySelectorAll(".attr-row").forEach(row => {
    const key = row.querySelector(".attr-key").value.trim();
    const value = row.querySelector(".attr-value").value.trim();
    if (key) attributes[key] = value;
  });

  const file = imageInput.files?.[0];

  if (file && file.size > 5 * 1024 * 1024) {
    showToast("Image must be 5 MB or smaller", true);
    return;
  }

  const formData = new FormData();
  formData.append("name", document.getElementById("productName").value.trim());
  formData.append("category", document.getElementById("productCategory").value.trim());
  formData.append("price", document.getElementById("productPrice").value);
  formData.append("stock", document.getElementById("productStock").value);
  formData.append("description", document.getElementById("productDescription").value.trim());
  formData.append("attributes", JSON.stringify(attributes));

  if (file) {
    formData.append("image", file);
  }

  const existing = id ? allProducts.find(x => String(x.id) === String(id)) : null;
  if (existing?.image_url) {
    formData.append("image_url", existing.image_url);
  }

  const saveButton = productForm.querySelector('button[type="submit"]');
  const originalText = saveButton.textContent;
  saveButton.disabled = true;
  saveButton.textContent = file ? "Uploading…" : "Saving…";

  try {
    const r = await authFetch(id ? `/api/admin/products/${id}` : "/api/admin/products", {
      method: id ? "PUT" : "POST",
      body: formData
    });

    const d = await r.json();
    if (!r.ok) throw new Error(d.message || "Unable to save product");

    showToast(d.message);
    closeModal();
    await loadProducts();
    loadStats();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = originalText;
  }
});

async function loadOrders() {
  const wrap = document.getElementById("ordersWrap");
  wrap.innerHTML = "<div class='empty'>Loading orders…</div>";
  try {
    const r = await authFetch("/api/admin/orders");
    if (!r.ok) throw new Error((await r.json()).message || "Unable to load orders");
    const orders = await r.json();
    if (!orders.length) { wrap.innerHTML = "<div class='empty'>No orders found.</div>"; return; }
    wrap.innerHTML = orders.map(order => `
      <article class='order-card'>
        <div class='order-head'>
          <div><p class='eyebrow'>Order #${order.id}</p><h3>${order.user_name || "Customer"}</h3><div class='order-meta'>${order.user_email || ""}<br>${new Date(order.created_at).toLocaleString()}</div></div>
          <div style='text-align:right'><strong>₹${Number(order.total_amount).toLocaleString("en-IN")}</strong><br><select class='status-select order-status' data-id='${order.id}'>${["placed","confirmed","processing","shipped","delivered","cancelled"].map(s => `<option value='${s}' ${s===order.status?"selected":""}>${s}</option>`).join("")}</select></div>
        </div>
        <div class='order-meta' style='margin-top:14px'>Ship to: ${order.recipient}, ${order.city} - ${order.pincode}<br>${order.address} · ${order.phone}</div>
        <div class='order-items'>${(order.items||[]).map(item => `<div class='order-item'>${item.image_url ? `<img src='${getImageUrl(item.image_url)}' alt=''>` : ""}<div><strong>${item.name || "Deleted product"}</strong><span>Qty ${item.quantity} · ₹${Number(item.price).toLocaleString("en-IN")}</span></div></div>`).join("")}</div>
      </article>`).join("");
    wrap.querySelectorAll(".order-status").forEach(sel => sel.onchange = () => updateOrderStatus(sel.dataset.id, sel.value));
  } catch (e) { wrap.innerHTML = `<div class='empty'>${e.message}</div>`; }
}

async function updateOrderStatus(id, status) {
  try {
    const r = await authFetch(`/api/admin/orders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || "Unable to update order");
    showToast("Order status updated");
    loadStats();
  } catch (e) { showToast(e.message, true); }
}

document.getElementById("refreshOrders").onclick = loadOrders;

document.getElementById("refreshUsers").onclick = loadUsers;
async function loadUsers() {
  const wrap = document.getElementById("usersTableWrap");
  wrap.innerHTML = "<div class='empty'>Loading users…</div>";
  try {
    const r = await authFetch("/api/admin/users");
    if (!r.ok) throw new Error((await r.json()).message || "Unable to load users");
    const users = await r.json();
    wrap.innerHTML = users.length ? `<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>${users.map(u => `<tr><td>#${u.id}</td><td>${u.name}</td><td>${u.email}</td><td><span class='badge'>${u.role}</span></td><td>${new Date(u.created_at).toLocaleDateString()}</td></tr>`).join("")}</tbody></table>` : "<div class='empty'>No users found.</div>";
  } catch (e) { wrap.innerHTML = `<div class='empty'>${e.message}</div>`; }
}

switchSection("dashboard");
