const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct() {
  const response = await fetch(
    `https://gallamandi.onrender.com/api/products/${productId}`
  );

  const product = await response.json();

  const container = document.getElementById("product-container");

  container.innerHTML = `
    <h1>${product.name}</h1>
    <img src="${product.image_url}" width="300"/>
    <p><strong>Price:</strong> ₹${product.price}</p>
    <p>${product.description || "No description available"}</p>
    <button onclick="addToCart(${product.id})">Add to Cart</button>
  `;
}

loadProduct();