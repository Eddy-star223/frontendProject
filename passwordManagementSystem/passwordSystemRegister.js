document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  try {
    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();
    alert("✅ Registration successful! You can now log in.");
    window.location.href = "passwordSystemLogin.html";
  } catch (error) {
    document.getElementById("regErrorMsg").textContent = error.message;
  }
});