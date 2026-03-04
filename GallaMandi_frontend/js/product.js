const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct() {
  const response = await fetch(
    `https://gallamandi.onrender.com/api/products/${productId}`
  );

  const product = await response.json();

  const container = document.getElementById("product-container");

  container.innerHTML = `
    <div class="product-image">
      <img src="https://gallamandi.onrender.com${product.image_url}" alt="${product.name}">
    </div>

    <div class="product-details">
      <h1 class="product-title">${product.name}</h1>
      <p class="product-price">₹${product.price}</p>
      <p class="product-description">
        ${product.description || "Fresh quality agricultural product available at best market price."}
      </p>
    </div>
  `;

}

loadProduct();