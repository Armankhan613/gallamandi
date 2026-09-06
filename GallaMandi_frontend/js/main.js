const BASE_URL = API_BASE_URL;
const API_URL = `${BASE_URL}/api/products`;
const productList = document.getElementById("product-list");

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

function showSkeletons(count = 8) {
  productList.innerHTML = Array.from(
    { length: count },
    () =>
      `<div class="skeleton-card"><div class="skeleton skeleton-img"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text" style="width:65%"></div><div class="skeleton skeleton-btn"></div></div>`,
  ).join("");
}

async function loadProducts() {
  try {
    showSkeletons();
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Unable to load products");
    displayProducts(await response.json());
  } catch (error) {
    console.error(error);
    productList.innerHTML = `<div class="empty-state"><h3>We couldn't load the products.</h3><p>Please refresh and try again.</p></div>`;
  }
}

function displayProducts(products) {
  productList.innerHTML = "";
  if (!products.length) {
    productList.innerHTML = `<div class="empty-state"><h3>No products found</h3><p>Try a different search term.</p></div>`;
    return;
  }
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const img = getImageUrl(product.image_url);
    card.innerHTML = `<div class="product-media"><img src="${img}" alt="${product.name}" loading="lazy"></div><div class="product-info"><span class="category">${product.category || "Agriculture"}</span><h3>${product.name}</h3><p class="price">₹${Number(product.price).toLocaleString("en-IN")}</p><button type="button">Add to cart</button></div>`;
    card.querySelector(".product-media").onclick = () =>
      (location.href = `product.html?id=${product.id}`);
    card.querySelector("h3").onclick = () =>
      (location.href = `product.html?id=${product.id}`);
    card.querySelector("button").onclick = () => addToCart(product.id);
    productList.appendChild(card);
  });
}

async function addToCart(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    location.href = "login.html";
    return;
  }
  try {
    const response = await fetch(`${BASE_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to add item");
    loadCartCount();
    showToast("Added to cart");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Something went wrong", true);
  }
}

function showToast(message, error = false) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText =
      "position:fixed;right:22px;bottom:22px;z-index:3000;padding:13px 17px;border-radius:12px;background:#12351f;color:#fff;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.2);transition:opacity .2s";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = error ? "#8e3030" : "#12351f";
  toast.style.opacity = "1";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (toast.style.opacity = "0"), 1800);
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role")
  location.href = "index.html";
}


function updateNavbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = document.getElementById("user-section");

  if (!user) return;

  // Not logged in
  if (!token) {
    user.innerHTML = `
      <a href="login.html">Login</a>
      <span>/</span>
      <a href="register.html">Register</a>
    `;
    return;
  }

  // Logged in
  user.innerHTML = `
    <a href="#" id="logout-link">Logout</a>
    ${
      role === "admin"
        ? `<a class="admin-nav-link" href="admin/index.html">Admin Dashboard</a>`
        : ""
    }
  `;

  document.getElementById("logout-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  loadCartCount();
}

async function loadCartCount() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const response = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      document.getElementById("cart-count").textContent = data.reduce(
        (sum, item) => sum + Number(item.quantity),
        0,
      );
    }
  } catch (e) {
    console.error(e);
  }
}
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
async function searchProducts(term) {
  try {
    showSkeletons();
    const response = await fetch(
      `${API_URL}/search?q=${encodeURIComponent(term)}`,
    );
    if (!response.ok) throw new Error("Search failed");
    displayProducts(await response.json());
  } catch (e) {
    console.error(e);
    productList.innerHTML = `<div class="empty-state"><h3>Search unavailable</h3><p>Please try again.</p></div>`;
  }
}
const searchInput = document.getElementById("searchInput"),
  searchBtn = document.getElementById("searchBtn");
searchInput?.addEventListener(
  "input",
  debounce(() => {
    const value = searchInput.value.trim();
    value ? searchProducts(value) : loadProducts();
  }, 400),
);
searchBtn?.addEventListener("click", () => {
  const value = searchInput.value.trim();
  value && searchProducts(value);
});
searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
updateNavbar();
loadProducts();
