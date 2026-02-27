const API_URL = "http://localhost:5000/api/cart";
const token = localStorage.getItem("token");
var my="";

if (!token) {
    window.location.href = "login.html";
}

async function loadCart() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        const data = await response.json();
        my=data;

        console.log("cart data fetched");
        const cartContainer = document.getElementById("cart-items");
        const totalElement = document.getElementById("total-price");

        cartContainer.innerHTML = "";

        if (data.length === 0) {
    cartContainer.innerHTML = "<h3>Your cart is empty 🛒</h3>";
    totalElement.innerText = "Total: ₹0";
    return;
}

        let total = 0;

        data.forEach(item => {
            total += item.price * item.quantity;

            const div = document.createElement("div");
            div.classList.add("cart-item");

            div.innerHTML = `
                <span>${item.name}</span>
    <span>₹${item.price}</span>

    <div class="qty-control">
        <button onclick="updateQuantity(${item.id}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)">+</button>
    </div>

    <button onclick="removeItem(${item.id})">Remove</button>
            `;

            cartContainer.appendChild(div);
        });

        totalElement.innerText = "Total: ₹" + total;

    } catch (error) {
        console.error(error);
    }
}

async function removeItem(id) {
    await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    loadCart();
}

async function updateQuantity(id, change) {
    await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ change })
    });

    loadCart();
}

    const checkoutBtn = document.getElementById("checkoutBtn");
const modal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const checkoutForm = document.getElementById("checkoutForm");

/* Open modal */
checkoutBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

/* Close modal */
closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
});

/* Submit order with shipping details */
checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const orderData = {
        fullName: document.getElementById("fullName").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        pincode: document.getElementById("pincode").value
    };

    try {
        const response = await fetch("http://localhost:5000/api/orders/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Order placed successfully!");
            modal.classList.add("hidden");
            checkoutForm.reset();
            loadCart();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong!");
    }
});



loadCart();