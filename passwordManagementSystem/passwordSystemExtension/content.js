const currentSite = window.location.hostname.replace(/^www\./, "");

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#00bfa5";
  toast.style.color = "#fff";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "5px";
  toast.style.zIndex = "9999";
  toast.style.fontFamily = "Segoe UI";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

chrome.storage.local.get(["vault"], data => {
  const vault = data.vault || [];

  const demoVaultEntry = {
    siteName: "facebook.com",
    username: "wyser123",
    password: "myPassword" 
  };

  const alreadyExists = vault.some(entry =>
    entry.siteName === demoVaultEntry.siteName &&
    entry.username === demoVaultEntry.username
  );

  if (!alreadyExists) {
    vault.push(demoVaultEntry);
    chrome.storage.local.set({ vault }, () => {
      console.log("Demo credentials injected into vault");
    });
  }
});

const observer = new MutationObserver(() => {
  const form = document.querySelector("form") || document.querySelector("input[type='password']")?.closest("form");
  if (form) {
    observer.disconnect();
    runVaultAutofill(form);
    showToast(`Autofilled credentials for ${currentSite}`);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

function runVaultAutofill(form) {

  chrome.storage.local.get(["vault"], data => {
    const vault = data.vault || [];
    const match = vault.find(entry => currentSite === entry.siteName.replace(/^www\./, ""));

    const usernameInput = form.querySelector("input[type='text'], input[type='email']");
    const passwordInput = form.querySelector("input[type='password']");

    if (!usernameInput || !passwordInput) {
      console.warn("Inputs not found");
      return;
    }

    usernameInput.setAttribute("autocomplete", "username");
    passwordInput.setAttribute("autocomplete", "current-password");

    if (match && match.password) {
      usernameInput.value = match.username;
      passwordInput.value = match.password;
      console.log(`Autofilled credentials for ${currentSite}`);
    } else {
      console.warn("No matching credentials found");
    }

    form.addEventListener("submit", () => {
      const payload = {
        siteName: currentSite,
        username: usernameInput.value,
        password: passwordInput.value, 
        userId: JSON.parse(localStorage.getItem("user"))?.userId || "wyser001"
      };

      fetch("http://localhost:8080/api/passwordSystem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("authHeader")
        },
        body: JSON.stringify(payload)
      }).then(res => {
        if (res.ok) {
          console.log("Synced credentials to backend");
        } else {
          console.warn("Backend rejected credentials");
        }
      }).catch(err => {
        console.error("Sync failed:", err);
      });
    });
  });
}