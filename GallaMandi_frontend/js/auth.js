const API_URL = `${API_BASE_URL}/api/auth/login`;

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            document.getElementById("message").innerText =
                "Login successful!";

            setTimeout(() => {
                if (data.role === "admin") {
                    window.location.href = "admin/index.html";
                } else {
                    window.location.href = "index.html";
                }
            }, 1000);

        } else {
            document.getElementById("message").innerText =
                data.message || "Login failed.";
        }

    } catch (error) {
        console.error("Login error:", error);
        document.getElementById("message").innerText =
            "Unable to connect to the server.";
    }
});