const API_URL = 'http://localhost:8080/api/notes';
const authHeader = localStorage.getItem('authHeader');

if (!authHeader) {
  window.location.href = 'noteSystemLogin.html'; 
}

document.getElementById('noteForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  if (!title || !content) return;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify({ title, content })
  });

  if (response.ok) {
    const newNote = await response.json();
    addNoteToDOM(newNote);
    document.getElementById('noteForm').reset();
  }
});

async function loadNotes() {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': authHeader }
  });
  const notes = await response.json();
  renderNotes(notes);
}

function renderNotes(notes) {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const noteList = document.getElementById('noteList');
  noteList.innerHTML = '';

  notes
    .filter(note =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    )
    .forEach(addNoteToDOM);
}

function addNoteToDOM(note) {
  const li = document.createElement('li');
  li.setAttribute('data-id', note.id);
  li.innerHTML = `
    <strong>${note.title}</strong><br>${note.content}
    <button onclick="deleteNote(${note.id})">Delete</button>
  `;
  document.getElementById('noteList').prepend(li);
}

async function deleteNote(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': authHeader }
  });

  if (response.ok) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) li.remove();
  }
}

document.getElementById('searchInput').addEventListener('input', loadNotes);
loadNotes();