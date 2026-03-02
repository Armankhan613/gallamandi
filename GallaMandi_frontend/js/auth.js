const API_URL = "https://gallamandi.onrender.com/api/auth/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            document.getElementById("message").innerText = "Login successful!";
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } else {
            document.getElementById("message").innerText = data.message;
        }

    } catch (error) {
        console.error(error);
    }
});