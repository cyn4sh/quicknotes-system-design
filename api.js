const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "";
  if (type) {
    statusEl.classList.add(type);
  }
}

function renderNotes(notes) {
  notesList.textContent = "";

  if (notes.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No notes to show.";
    notesList.appendChild(li);
    return;
  }

  notes.forEach(note => {
    const li = document.createElement("li");
    li.className = "note-card";
    li.dataset.id = note.id;

    const titleEl = document.createElement("h3");
    titleEl.textContent = note.title;

    const bodyEl = document.createElement("p");
    bodyEl.textContent = note.body;

    li.appendChild(titleEl);
    li.appendChild(bodyEl);
    notesList.appendChild(li);
  });
}

async function loadNotes() {
  loadBtn.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    const notes = await request(`${API_URL}?_limit=10`);
    renderNotes(notes);
    setStatus("Loaded 10 notes from the server.", "success");
  } catch (error) {
    setStatus("Failed to load notes. Please try again.", "error");
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadNotes);