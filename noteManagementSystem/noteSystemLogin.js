const API_URL = 'http://localhost:8080/api/notes';
const API_REGISTER = 'http://localhost:8080/api/auth/register';

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('errorMsg');

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    errorMsg.textContent = 'Please enter both username and password.';
    return;
  }

  const authHeader = 'Basic ' + btoa(username + ':' + password);

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });

    if (response.ok) {
      localStorage.setItem('authHeader', authHeader);
      localStorage.setItem('username', username);

      window.location.href = 'noteSystem.html';
    } else if (response.status === 401) {
      errorMsg.textContent = 'Unauthorized. Invalid credentials.';
    } else {
      errorMsg.textContent = 'Login failed. Server error.';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMsg.textContent = 'Network error. Try again.';
  }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    errorMsg.textContent = 'Please enter both username and password.';
    return;
  }

  try {
    const response = await fetch(API_REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      errorMsg.textContent = 'Registration successful. You can now login.';
    } else if (response.status === 409) {
      errorMsg.textContent = 'Username already exists. Try another.';
    } else {
      errorMsg.textContent = 'Registration failed. Please try again.';
    }
  } catch (error) {
    console.error('Registration error:', error);
    errorMsg.textContent = 'Network error during registration.';
  }
});