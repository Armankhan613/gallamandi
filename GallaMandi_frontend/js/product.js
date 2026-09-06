const BASE_URL = API_BASE_URL;

const productId = new URLSearchParams(location.search).get("id");
const container = document.getElementById("product-container");

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  // Supabase Storage / any absolute URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Old local/Render image path
  return `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

async function loadProduct() {
  if (!productId) {
    container.innerHTML =
      '<div class="empty-state"><h2>Product not found</h2><a href="index.html">Return to shop</a></div>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/products/${productId}`);

    if (!response.ok) {
      throw new Error("Product unavailable");
    }

    const p = await response.json();

    const imageUrl = getImageUrl(p.image_url);

    container.innerHTML = `
      <div class="product-image">
        <img src="${imageUrl}" alt="${p.name}">
      </div>

      <div class="product-details">
        <span class="product-kicker">
          ${p.category || "Agricultural product"}
        </span>

        <h1 class="product-title">${p.name}</h1>

        <p class="product-price">
          ₹${Number(p.price).toLocaleString("en-IN")}
        </p>

        <p class="product-description">
          ${
            p.description ||
            "Fresh quality agricultural product available at a fair market price."
          }
        </p>

        <button class="add-to-cart-btn" type="button">
          Add to cart
        </button>

        <p class="stock-note">
          ${
            p.stock != null
              ? `${p.stock} units currently available.`
              : "Quality checked before listing."
          }
        </p>
      </div>
    `;

    container.querySelector(".add-to-cart-btn").onclick = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        location.href = "login.html";
        return;
      }

      try {
        const r = await fetch(`${BASE_URL}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: p.id,
            quantity: 1,
          }),
        });

        const d = await r.json();

        alert(r.ok ? "Added to cart!" : d.message || "Unable to add item");
      } catch (error) {
        console.error(error);
        alert("Unable to add item to cart.");
      }
    };
  } catch (e) {
    console.error(e);

    container.innerHTML =
      '<div class="empty-state"><h2>Unable to load this product.</h2><a href="index.html">Return to shop</a></div>';
  }
}

loadProduct();