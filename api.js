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

const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitBtn = document.querySelector("#submit-btn");

function addNoteToTop(note) {
  if (notesList.children.length === 1 && notesList.children[0].tagName === "LI" && !notesList.children[0].dataset.id) {
    notesList.textContent = "";
  }

  const li = document.createElement("li");
  li.className = "note-card";
  li.dataset.id = note.id;

  const titleEl = document.createElement("h3");
  titleEl.textContent = note.title;

  const bodyEl = document.createElement("p");
  bodyEl.textContent = note.body;

  li.appendChild(titleEl);
  li.appendChild(bodyEl);
  notesList.insertBefore(li, notesList.firstChild);
}

noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (title === "") {
    setStatus("Title is required.", "error");
    return;
  }

  if (title.length > 100) {
    setStatus("Title must be 100 characters or fewer.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Creating note...", "loading");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const newNote = await response.json();
    addNoteToTop(newNote);
    setStatus(`Note created (status ${response.status}, id ${newNote.id}).`, "success");
    noteForm.reset();
  } catch (error) {
    setStatus("Failed to create note. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});