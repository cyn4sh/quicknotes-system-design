const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitBtn = document.querySelector("#submit-btn");

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

// Note: JSONPlaceholder doesn't actually persist deletes (or creates) on its
// server — it simulates a successful response but the data isn't really
// removed. So here, a successful DELETE response removes the note from the
// page's own list (the UI), which is the correct, honest behavior for a
// practice API that doesn't have real persistence.
async function deleteNote(id, listItem, button) {
  button.disabled = true;
  setStatus("Deleting note...", "loading");

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    listItem.remove();
    setStatus("Note deleted.", "success");

    if (notesList.children.length === 0) {
      renderNotes([]);
    }
  } catch (error) {
    setStatus("Failed to delete note. Please try again.", "error");
    button.disabled = false;
  }
}

function createNoteElement(note) {
  const li = document.createElement("li");
  li.className = "note-card";
  li.dataset.id = note.id;

  const titleEl = document.createElement("h3");
  titleEl.textContent = note.title;

  const bodyEl = document.createElement("p");
  bodyEl.textContent = note.body;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteNote(note.id, li, deleteBtn));

  li.appendChild(titleEl);
  li.appendChild(bodyEl);
  li.appendChild(deleteBtn);
  return li;
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
    notesList.appendChild(createNoteElement(note));
  });
}

function addNoteToTop(note) {
  const emptyMsg = notesList.querySelector("li:not(.note-card)");
  if (emptyMsg) {
    notesList.textContent = "";
  }
  notesList.insertBefore(createNoteElement(note), notesList.firstChild);
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