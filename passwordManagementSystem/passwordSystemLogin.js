document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    errorMsg.textContent = "";

    if (!username || !password) {
      errorMsg.textContent = "Username and password are required.";
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Login failed");
      }

      const user = {
      userId: response.userId,
      username: response.username,
      email: response.email || "No email"
};

// Save user profile to localStorage
localStorage.setItem("user", JSON.stringify(user));


    
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("authHeader", `Bearer ${data.token}`);
      localStorage.setItem("userId", data.userId);

      window.location.href = "passwordSystemDashboard.html";
    } catch (error) {
      console.error("Login error:", error);
      errorMsg.textContent = error.message || "Login failed. Please try again.";
    }
  });
});