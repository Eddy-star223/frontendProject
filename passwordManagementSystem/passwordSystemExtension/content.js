const currentHost = window.location.hostname.replace(/^www\./, "");

let autofilled = false;

/** Simple Toast for status feedback */
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#00bfa5",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    zIndex: "99999",
    fontFamily: "Segoe UI, sans-serif",
    boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
    transition: "opacity 0.3s ease",
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/** Chrome-like save prompt */
function showSavePrompt(username, password) {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#fff",
    border: "1px solid #ccc",
    padding: "12px 16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    borderRadius: "8px",
    zIndex: "999999",
    fontFamily: "Segoe UI, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
  });

  overlay.innerHTML = `
    <div style="font-weight:600; font-size:14px;">Save password for ${currentHost}?</div>
    <div style="font-size:13px; color:#333;">
      <b>${username}</b><br/>••••••••
    </div>
    <div style="display:flex; gap:8px;">
      <button id="savePwdBtn" style="background:#00bfa5; color:white; border:none; padding:6px 10px; border-radius:5px; cursor:pointer;">Save</button>
      <button id="neverBtn" style="background:#ccc; border:none; padding:6px 10px; border-radius:5px; cursor:pointer;">Never</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const removePrompt = () => overlay.remove();

  overlay.querySelector("#savePwdBtn").addEventListener("click", () => {
    chrome.storage.local.get(["vault"], data => {
      const vault = data.vault || [];
      vault.push({ siteUrl: window.location.origin, username, password });
      chrome.storage.local.set({ vault }, () => {
        showToast(" Password saved!");
        removePrompt();
      });
    });
  });

  overlay.querySelector("#neverBtn").addEventListener("click", removePrompt);
}

/** Autofill main logic */
function runVaultAutofill(form) {
  setTimeout(() => {
    chrome.storage.local.get(["vault"], data => {
      const vault = data.vault || [];
      const match = vault.find(entry => {
        try {
          const entryHost = new URL(entry.siteUrl).hostname.replace(/^www\./, "");
          return currentHost === entryHost;
        } catch {
          return false;
        }
      });

      const usernameInput =
        form.querySelector("input[name*='user'], input[name*='email'], input[id*='email'], input[type='text'], input[type='email']");
      const passwordInput = form.querySelector("input[name*='pass'], input[id*='pass'], input[type='password']");

      console.log("Detected username input:", usernameInput);
      console.log("Detected password input:", passwordInput);

      if (!usernameInput || !passwordInput) {
        console.warn("Inputs not found");
        return;
      }

      usernameInput.setAttribute("autocomplete", "username");
      passwordInput.setAttribute("autocomplete", "current-password");

      if (match && match.password) {
        usernameInput.value = match.username;
        passwordInput.value = match.password;
        showToast(`Autofilled credentials for ${currentHost}`);
        console.log(`Autofilled credentials for ${currentHost}`);
      } else {
        console.warn("No matching credentials found");
      }

      const saveCredentials = () => {
        const payload = {
          siteUrl: window.location.origin,
          username: usernameInput.value,
          password: passwordInput.value,
          userId: JSON.parse(localStorage.getItem("user"))?.userId || "wyser001",
        };

        // (Optional) Sync with backend
        fetch("http://localhost:8080/api/passwordSystem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("authHeader"),
          },
          body: JSON.stringify(payload),
        })
          .then(res => {
            if (res.ok) {
              console.log("Synced credentials to backend");
              showToast("Credentials synced successfully");
            } else {
              console.warn("⚠ Backend rejected credentials");
              showToast("⚠ Failed to sync credentials");
            }
          })
          .catch(err => {
            console.error("Sync failed:", err);
            showToast("Error syncing credentials");
          });

        // Show popup prompt regardless of backend success
        showSavePrompt(usernameInput.value, passwordInput.value);
      };

      // Handle native or custom submits
      form.addEventListener("submit", saveCredentials);
      form.querySelectorAll("button, input[type='submit']").forEach(btn =>
        btn.addEventListener("click", saveCredentials)
      );
    });
  }, 500);
}

/** Persistent MutationObserver (detects dynamic login forms) */
const observer = new MutationObserver(() => {
  console.log("Mutation detected, checking for forms...");
  if(!autofilled) {
    const form =
    document.querySelector("form") ||
    document.querySelector("input[type='password']")?.closest("form");
    
    if (form) {
    console.log("Form detected on", form);
    autofilled = true;
    runVaultAutofill(form);}
  }

});

observer.observe(document.body, { childList: true, subtree: true });

/** Fallback for DOM ready */
document.addEventListener("DOMContentLoaded", () => {
  const form =
    document.querySelector("form") ||
    document.querySelector("input[type='password']")?.closest("form");
  if (form && !form.dataset.vaultBound) {
    form.dataset.vaultBound = "true";
    runVaultAutofill(form);
  }
});

/** Temporary seeded vault for testing */
chrome.storage.local.set(
  {
    vault: [
      {
        siteUrl: "https://github.com/login",
        username: "wyser@gmail.com",
        password: "myPassword",
      },
    ],
  },
  () => console.log(" Vault entry saved for test.")
);