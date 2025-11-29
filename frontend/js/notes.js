/* ============================
   IndexedDB Helpers
============================ */
function openNotesDB() {
    return new Promise((res, rej) => {
        const req = indexedDB.open("EduMateDB", 1);

        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("notes")) {
                db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
            }
        };

        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
    });
}

async function getAllNotes() {
    const db = await openNotesDB();
    return new Promise(resolve => {
        const tx = db.transaction("notes", "readonly");
        const store = tx.objectStore("notes");
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
    });
}

async function saveNote(note) {
    const db = await openNotesDB();
    const tx = db.transaction("notes", "readwrite");
    tx.objectStore("notes").put(note);
}

async function deleteNote(id) {
    const db = await openNotesDB();
    const tx = db.transaction("notes", "readwrite");
    tx.objectStore("notes").delete(id);
}

/* ============================
   UI Logic
============================ */

const notesContainer = document.getElementById("notesContainer");
const searchInput = document.getElementById("searchInput");
const modal = new bootstrap.Modal(document.getElementById("noteModal"));

let currentNote = null;
let selectedColor = "#ffe0c2";

document.querySelectorAll(".color-dot").forEach(dot => {
    dot.style.background = dot.dataset.color;

    dot.onclick = () => {
        selectedColor = dot.dataset.color;
        document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("selected"));
        dot.classList.add("selected");
    };
});

document.getElementById("addNoteBtn").onclick = () => openAddModal();

function openAddModal() {
    currentNote = null;

    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    document.getElementById("noteTags").value = "";

    document.getElementById("deleteNoteBtn").style.display = "none";

    modal.show();
}

function openEditModal(note) {
    currentNote = note;

    document.getElementById("noteTitle").value = note.title;
    document.getElementById("noteContent").value = note.content;
    document.getElementById("noteTags").value = note.tags.join(",");
    selectedColor = note.color;

    document.getElementById("deleteNoteBtn").style.display = "inline-block";

    modal.show();
}

document.getElementById("saveNoteBtn").onclick = async () => {
    const noteData = {
        id: currentNote ? currentNote.id : undefined,
        title: document.getElementById("noteTitle").value,
        content: document.getElementById("noteContent").value,
        tags: document.getElementById("noteTags").value.split(",").map(t => t.trim()),
        color: selectedColor,
        favorite: currentNote?.favorite || false,
        pinned: currentNote?.pinned || false,
        bookmarked: currentNote?.bookmarked || false,
        createdAt: currentNote?.createdAt || Date.now()
    };

    await saveNote(noteData);
    modal.hide();
    loadNotes();
};

document.getElementById("deleteNoteBtn").onclick = async () => {
    if (currentNote) {
        await deleteNote(currentNote.id);
        modal.hide();
        loadNotes();
    }
};

searchInput.oninput = () => loadNotes();

async function loadNotes() {
    const notes = await getAllNotes();
    const query = searchInput.value.toLowerCase();

    const filtered = notes.filter(
        n =>
            n.title.toLowerCase().includes(query) ||
            n.content.toLowerCase().includes(query) ||
            n.tags.join(" ").toLowerCase().includes(query)
    );

    const sorted = [
        ...filtered.filter(n => n.pinned),
        ...filtered.filter(n => !n.pinned)
    ];

    notesContainer.innerHTML = "";

    sorted.forEach(note => {
        const div = document.createElement("div");
        div.className = "col-md-4";
        div.innerHTML = `
            <div class="note-card" style="background:${note.color};" data-id="${note.id}">
                
                <div class="note-top-icons">
                    <span class="pin-btn">${note.pinned ? "📌" : "📍"}</span>
                    <span class="fav-btn">${note.favorite ? "⭐" : "☆"}</span>
                    <span class="bookmark-btn">${note.bookmarked ? "🔖" : "📑"}</span>
                </div>

                <h5>${note.title}</h5>
                <p>${note.content}</p>

                <small class="text-muted">${note.tags.join(", ")}</small>
            </div>
        `;

        const card = div.querySelector(".note-card");

        card.onclick = e => {
            if (e.target.classList.contains("pin-btn")) return togglePin(note);
            if (e.target.classList.contains("fav-btn")) return toggleFav(note);
            if (e.target.classList.contains("bookmark-btn")) return toggleBookmark(note);
            openEditModal(note);
        };

        notesContainer.appendChild(div);
    });
}

async function togglePin(note) {
    note.pinned = !note.pinned;
    await saveNote(note);
    loadNotes();
}

async function toggleFav(note) {
    note.favorite = !note.favorite;
    await saveNote(note);
    loadNotes();
}

async function toggleBookmark(note) {
    note.bookmarked = !note.bookmarked;
    await saveNote(note);
    loadNotes();
}

loadNotes();
