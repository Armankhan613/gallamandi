const BASE_URL="https://gallamandi.onrender.com";
const API_URL = `${BASE_URL}/api/products`;
const productList = document.getElementById("product-list");

function showSkeletons(count = 8) {
    productList.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const div = document.createElement("div");
        div.classList.add("skeleton-card");

        div.innerHTML = `
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-btn"></div>
        `;

        productList.appendChild(div);
    }
}
    async function loadProducts() {
    try {
        showSkeletons();

        const response = await fetch(API_URL);
        const products = await response.json();

        displayProducts(products);

    } catch (error) {
        console.error("Error loading products:", error);
    }
}


function displayProducts(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = "<h3>No products found 🔍</h3>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        const img_path = `${BASE_URL}${product.image_url}`;

        card.innerHTML = `
            <img src="${img_path}" />
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <button onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        `;
        const idt=product.id;
        card.addEventListener("click", () => {
            window.location.href = `product.html?id=${idt}`;
        });
        productList.appendChild(card);
    });
}

loadProducts();

async function addToCart(productId) {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        const data = await response.json();

        if (response.ok) {
          document.getElementById("cart-count").classList.add("highlight");
          setTimeout(() => {
            document.getElementById("cart-count").classList.remove("highlight");
          }, 500);
          loadCartCount();
        } else {
          alert(data.message);
        }

    } catch (error) {
        console.error(error);
    }
}

function updateNavbar() {
    const token = localStorage.getItem("token");
    const userSection = document.getElementById("user-section");

    if (token) {
        userSection.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
        loadCartCount();
    } else {
        userSection.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.reload();
}

async function loadCartCount() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/api/cart`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById("cart-count").innerText = `(${data.length})`;
    }
}

updateNavbar();


function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


async function searchProducts(searchTerm) {
    try {
        showSkeletons();

        const response = await fetch(
            `${BASE_URL}/api/products/search?q=${searchTerm}`
        );

        const products = await response.json();

        displayProducts(products);

    } catch (error) {
        console.error("Search failed:", error);
    }
}


const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

if (searchInput && productList) {

    searchInput.addEventListener(
        "input",
        debounce(function () {
            const value = this.value.trim();

            if (value === "") {
                loadProducts();
            } else {
                searchProducts(value);
            }
        }, 400)
    );

    searchBtn.addEventListener("click", () => {
        const value = searchInput.value.trim();
        if (value !== "") {
            searchProducts(value);
        }
    });

    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchBtn.click();
        }
    });
}


