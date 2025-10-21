// Global Variables
let currentEntryId = null;
const encryptionKey = "wyser_super_secure_key_2025";

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const authHeader = localStorage.getItem("authHeader");
  const userId = user?.userId;
  const form = document.getElementById("addPasswordForm");

  if (!userId || !authHeader) {
    alert("Please login first");
    window.location.href = "passwordSystemLogin.html";
    return;
  }

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);

  // Add password
  form.addEventListener("submit", handleAddPassword);

  // Delete password
  window.deletePassword = handleDeletePassword;

  // Initial fetch
  fetchPasswords();
});

// Logout Handler
function handleLogout() {
  localStorage.removeItem("user");
  localStorage.removeItem("authHeader");
  localStorage.removeItem("vaultCache");
  window.location.href = "passwordSystemLogin.html";
}

// Fetch Passwords
async function fetchPasswords() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authHeader = localStorage.getItem("authHeader");

  try {
    const response = await fetch(`http://localhost:8080/api/passwordSystem/${user.userId}`, {
      method: "GET",
      headers: { Authorization: authHeader }
    });

    if (!response.ok) throw new Error("Failed to fetch passwords");

    const data = await response.json();
    renderPasswordList(data);
  } catch (err) {
    console.error("Error fetching passwords:", err);
    alert("Unable to load passwords. Try again later.");
  }
}

// Render Password List
function renderPasswordList(entries) {
  const list = document.getElementById("passwordList");
  list.innerHTML = "";

  entries.forEach(entry => {
    const decrypted = entry.password?.trim() || "Unavailable";

    const card = document.createElement("div");
    card.classList.add("vault-card");

    card.innerHTML = `
      <h3>${entry.siteName}</h3>
      <p><strong>Username:</strong> ${entry.username}</p>
      <p><strong>Password:</strong> ${decrypted}</p>
      <button onclick="openEditModal(${entry.entryId}, '${entry.siteName}', '${entry.username}', '${entry.decryptedPassword}')">✏️ Edit</button>
      <button onclick="deletePassword(${entry.entryId})"><i class="fa-solid fa-trash"></i> Delete</button>
    `;

    list.appendChild(card);
  });
}

// Add Password Handler
async function handleAddPassword(e) {
  e.preventDefault();

  const siteName = document.getElementById("siteName").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const userId = JSON.parse(localStorage.getItem("user")).userId;
  const authHeader = localStorage.getItem("authHeader");

  if (!siteName || !username || !password) {
    alert("All fields are required.");
    return;
  }

  const payload = { siteName, username, password, userId };

  try {
    const response = await fetch("http://localhost:8080/api/passwordSystem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to add password");

    e.target.reset();
    fetchPasswords();
  } catch (err) {
    console.error("Error adding password:", err);
    alert("Failed to save password. Try again.");
  }
}

// Delete Password Handler
async function handleDeletePassword(id) {
  const authHeader = localStorage.getItem("authHeader");

  if (!id || id === "null" || isNaN(id)) {
    alert("Invalid password ID");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/passwordSystem/${id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader }
    });

    if (!response.ok) throw new Error("Failed to delete password");

    console.log("Password deleted successfully");
    await fetchPasswords();
  } catch (error) {
    console.error("Error deleting password:", error);
    alert("Error deleting password: " + error.message);
  }
}

// Open Edit Modal
function openEditModal(entryId, siteName, username, decryptedPassword) {
  currentEntryId = entryId;
  document.getElementById("editSiteName").value = siteName;
  document.getElementById("editUsername").value = username;
  document.getElementById("editRawPassword").value = decryptedPassword;
  document.getElementById("editPasswordModal").style.display = "block";
}

// Close Edit Modal
function closeEditModal() {
  document.getElementById("editPasswordModal").style.display = "none";
}

// Submit Edit Form
document.getElementById("editPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const siteName = document.getElementById("editSiteName").value;
  const username = document.getElementById("editUsername").value;
  const rawPassword = document.getElementById("editRawPassword").value;

  await updatePassword(currentEntryId, siteName, username, rawPassword);
  closeEditModal();
});

// Update Password
async function updatePassword(entryId, siteName, username, rawPassword) {
  const authHeader = localStorage.getItem("authHeader");

  const payload = { siteName, username, rawPassword };

  try {
    const response = await fetch(`http://localhost:8080/api/passwordSystem/${entryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to update password");

    const updated = await response.json();
    console.log("Updated password:", updated);
    alert("Password updated successfully!");
    fetchPasswords();
  } catch (err) {
    console.error("Error updating password:", err);
    alert("Failed to update password. Try again.");
  }
}

//  Profile Modal Logic
document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editProfileBtn");
  const modal = document.getElementById("editProfileModal");
  const closeBtn = document.getElementById("closeModal");
  const preview = document.getElementById("profileImagePreview");
  const input = document.getElementById("profileImageInput");
  const headerAvatar = document.getElementById("headerAvatar");
  const user = JSON.parse(localStorage.getItem("user"));

  // Open modal
  if (editBtn && modal) {
    editBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });
  }

  // Close modal
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Preview image on change
  if (input && preview && headerAvatar) {
    input.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const imageData = event.target.result;
          preview.src = imageData;
          headerAvatar.src = imageData;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Load image from backend
  const token = localStorage.getItem("authToken");

if (token && token.includes(".")) {
  fetch(`http://localhost:8080/api/passwordSystem/profile/image/${user.userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.ok ? res.blob() : null)
  .then(blob => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      preview.src = url;
      headerAvatar.src = url;
    }
  });
} else {
  console.warn("Invalid or missing token:", token);
}

  // Submit profile form
  const form = document.getElementById("editProfileForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const notes = document.getElementById("editNotes").value;
      const imageFile = input.files[0];

      const formData = new FormData();
      formData.append("userId", user.userId);
      formData.append("notes", notes);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      try {
        const response = await fetch("http://localhost:8080/api/passwordSystem/profile/update", {
          method: "POST",
          headers: {
            Authorization: localStorage.getItem("authHeader")
          },
          body: formData
        });

        if (!response.ok) throw new Error("Failed to update profile");

        alert("Profile updated successfully!");
        modal.style.display = "none";
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to update profile. Try again.");
      }
    });
  }
});