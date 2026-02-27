const token = localStorage.getItem("token");
const container = document.getElementById("orders-list");

function showOrderSkeletons(count = 3) {
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const div = document.createElement("div");
        div.classList.add("order-card");

        div.innerHTML = `
            <div class="skeleton skeleton-text" style="width:40%"></div>
            <div class="skeleton skeleton-text" style="width:60%"></div>
            <div class="skeleton skeleton-text" style="width:50%"></div>
        `;

        container.appendChild(div);
    }
}

if (!token) {
  window.location.href = "login.html";
}

async function loadOrders() {
  try {

    showOrderSkeletons();
    const response = await fetch("http://localhost:5000/api/orders", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const orders = await response.json();

    container.innerHTML="";

    console.log("Orders:", orders);

    container.innerHTML = "";

    if (orders.length === 0) {
      container.innerHTML = "<p>No orders found.</p>";
      return;
    }

    orders.forEach((order) => {
      const div = document.createElement("div");
      div.classList.add("order-card");
      console.log(order);

      const itemsHTML = order.items
        .map(
          (item) => `
        <div class="order-item">
            <img src="http://localhost:5000${item.image_url}" width="60">
            <div>
                <p><strong>${item.name}</strong></p>
                <p>Qty: ${item.quantity}</p>
                <p>₹${item.price}</p>
            </div>
        </div>
    `,
        )
        .join("");

      div.innerHTML = `
    <div class="order-header">
        <h3>Order #${order.id}</h3>
        <span class="status ${order.status.toLowerCase()}">
            ${order.status}
        </span>
    </div>

    <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
    <p><strong>Total: ₹${order.total_amount}</strong></p>

    <div class="order-items">
        ${itemsHTML}
    </div>
    <hr>
`;

      container.appendChild(div);
    });
  } catch (error) {
    console.error(error);
  }
}

loadOrders();
