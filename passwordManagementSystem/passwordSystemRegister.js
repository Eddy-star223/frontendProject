document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const errorMsg = document.getElementById("regErrorMsg");

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    errorMsg.textContent = "";

    if (!username || !email || !password) {
      errorMsg.textContent = "All fields are required.";
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Registration failed");
      }

      alert("✅ Registration successful! You can now log in.");
      window.location.href = "passwordSystemLogin.html";
    } catch (error) {
      console.error("Registration error:", error);
      errorMsg.textContent = error.message || "Registration failed. Please try again.";
    }
  });
});



// document.getElementById("registerForm").addEventListener("submit", async function (e) {
//   e.preventDefault();

//   const username = document.getElementById("regUsername").value;
//   const email = document.getElementById("regEmail").value;
//   const password = document.getElementById("regPassword").value;

//   try {
//     const response = await fetch("http://localhost:8080/auth/register", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ username, email, password })
//     });

//     if (!response.ok) {
//       throw new Error("Registration failed");
//     }

//     const data = await response.json();
//     alert("✅ Registration successful! You can now log in.");
//     window.location.href = "passwordSystemLogin.html";
//   } catch (error) {
//     document.getElementById("regErrorMsg").textContent = error.message;
//   }
// });