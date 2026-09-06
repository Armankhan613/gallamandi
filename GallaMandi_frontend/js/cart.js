const BASE_URL = API_BASE_URL;
const token = localStorage.getItem("token");

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  // Supabase Storage / any absolute URL
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // Legacy local/Render image path
  return `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

if (!token) location.href = "login.html";
const cartContainer = document.getElementById("cart-items"),
  totalElement = document.getElementById("total-price"),
  checkoutBtn = document.getElementById("checkoutBtn"),
  modal = document.getElementById("checkoutModal"),
  closeModal = document.getElementById("closeModal"),
  checkoutForm = document.getElementById("checkoutForm");
async function loadCart() {
  try {
    const response = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Unable to load cart");
    const data = await response.json();
    cartContainer.innerHTML = "";
    if (!data.length) {
      cartContainer.innerHTML =
        '<div class="empty-state"><h3>Your cart is empty 🛒</h3><p>Browse the shop and add something fresh.</p></div>';
      totalElement.textContent = "₹0";
      checkoutBtn.disabled = true;
      return;
    }
    let total = 0;
    data.forEach((item) => {
      total += item.price * item.quantity;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `<div class="cart-product">
  <img src="${getImageUrl(item.image_url)}" alt="${item.name}">
  <strong>${item.name}</strong>
</div><span class="cart-price">₹${Number(item.price).toLocaleString("en-IN")}</span><div class="qty-control"><button type="button" aria-label="Decrease quantity">−</button><strong>${item.quantity}</strong><button type="button" aria-label="Increase quantity">+</button></div><button class="remove-btn" type="button">Remove</button>`;
      div.querySelectorAll(".qty-control button")[0].onclick = () =>
        updateQuantity(item.id, -1);
      div.querySelectorAll(".qty-control button")[1].onclick = () =>
        updateQuantity(item.id, 1);
      div.querySelector(".remove-btn").onclick = () => removeItem(item.id);
      cartContainer.appendChild(div);
    });
    totalElement.textContent = `₹${Number(total).toLocaleString("en-IN")}`;
    checkoutBtn.disabled = false;
  } catch (e) {
    console.error(e);
    cartContainer.innerHTML =
      '<div class="empty-state"><h3>Could not load your cart.</h3></div>';
  }
}
async function removeItem(id) {
  await fetch(`${BASE_URL}/api/cart/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadCart();
}
async function updateQuantity(id, change) {
  await fetch(`${BASE_URL}/api/cart/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ change }),
  });
  loadCart();
}
checkoutBtn.onclick = () => modal.classList.remove("hidden");
closeModal.onclick = () => modal.classList.add("hidden");
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
checkoutForm.onsubmit = async (e) => {
  e.preventDefault();
  const orderData = {
    fullName: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    pincode: document.getElementById("pincode").value,
  };
  try {
    const response = await fetch(`${BASE_URL}/api/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Checkout failed");
    // alert(`Order #${data.order_id} placed successfully!`);
    alert(`Order placed successfully!`);
    modal.classList.add("hidden");
    checkoutForm.reset();
    loadCart();
  } catch (e) {
    alert(e.message);
  }
};
loadCart();
