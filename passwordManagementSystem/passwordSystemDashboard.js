// passwordSystemDashboard.js

// ✅ Get user from localStorage
const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.userId;

// ✅ Redirect if user not found
if (!userId) {
  console.error("User not found in localStorage");
  alert("Please login first");
  window.location.href = "passwordSystemLogin.html"; 
}

// ✅ DOM elements
const passwordList = document.getElementById("passwordList");
const form = document.getElementById("addPasswordForm");

// ✅ Fetch and display passwords
async function fetchPasswords() {
  try {
    const res = await fetch(`http://localhost:8080/api/passwordSystem/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch passwords");

    const data = await res.json();
    passwordList.innerHTML = "";

    data.forEach(entry => {
      const div = document.createElement("div");
      div.className = "password-entry";
      div.innerHTML = `
        <span><strong>${entry.siteName}</strong>: ${entry.encryptedPassword}</span>
        <button onclick="deletePassword(${entry.id})"><i class="fas fa-trash-alt"></i></button>
      `;
      passwordList.appendChild(div);
    });
  } catch (err) {
    console.error("Error fetching passwords:", err);
  }
}

// ✅ Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const siteName = document.getElementById("siteName").value;
  const encryptedPassword = document.getElementById("encryptedPassword").value;

  try {
    const res = await fetch("http://localhost:8080/api/passwordSystem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName,
        encryptedPassword,
        user: { userId }
      })
    });

    if (!res.ok) throw new Error("Failed to add password");

    form.reset();
    fetchPasswords();
  } catch (err) {
    console.error("Error adding password:", err);
  }
});

// ✅ Delete password entry
async function deletePassword(id) {
  try {
    const res = await fetch(`http://localhost:8080/api/passwordSystem/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete password");

    fetchPasswords();
  } catch (err) {
    console.error("Error deleting password:", err);
  }
}

// ✅ Initial load
fetchPasswords();