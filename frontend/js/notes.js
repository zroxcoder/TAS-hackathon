import { initDB, putItem, getAll, deleteItem } from "./db.js";

/* UI elements */
const notesContainer = document.getElementById("notesContainer");
const searchInput = document.getElementById("searchInput");
const modalEl = document.getElementById("noteModal");
const modal = new bootstrap.Modal(modalEl);

let currentNote = null;
let selectedColor = "#ffe0c2";

/* Color selector setup */
document.querySelectorAll(".color-dot").forEach(dot => {
    dot.style.background = dot.dataset.color;
    dot.addEventListener("click", () => {
        selectedColor = dot.dataset.color;
        document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("selected"));
        dot.classList.add("selected");
    });
});

/* Open add modal */
document.getElementById("addNoteBtn").addEventListener("click", () => {
    currentNote = null;
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    document.getElementById("noteTags").value = "";
    selectedColor = "#ffe0c2";
    document.getElementById("deleteNoteBtn").style.display = "none";
    modal.show();
});

/* Open edit */
function openEditModal(note) {
    currentNote = note;
    document.getElementById("noteTitle").value = note.title || "";
    document.getElementById("noteContent").value = note.content || "";
    document.getElementById("noteTags").value = (note.tags || []).join(", ");
    selectedColor = note.color || "#ffe0c2";
    document.getElementById("deleteNoteBtn").style.display = "inline-block";
    modal.show();
}

/* Save note (create or update) */
document.getElementById("saveNoteBtn").addEventListener("click", async () => {
    const rawTags = document.getElementById("noteTags").value.trim();
    const noteData = {
        // if editing keep id, otherwise let DB autoIncrement
        id: currentNote?.id,
        title: document.getElementById("noteTitle").value.trim() || "Untitled",
        content: document.getElementById("noteContent").value.trim(),
        tags: rawTags ? rawTags.split(",").map(t => t.trim()).filter(Boolean) : [],
        color: selectedColor,
        favorite: currentNote?.favorite || false,
        pinned: currentNote?.pinned || false,
        bookmarked: currentNote?.bookmarked || false,
        createdAt: currentNote?.createdAt || Date.now()
    };

    await putItem("notes", noteData); // put handles add or update
    modal.hide();
    loadNotes();
});

/* Delete note */
document.getElementById("deleteNoteBtn").addEventListener("click", async () => {
    if (!currentNote || !currentNote.id) return;
    await deleteItem("notes", currentNote.id);
    modal.hide();
    loadNotes();
});

/* Toggles */
async function toggleField(note, field) {
    note[field] = !note[field];
    await putItem("notes", note);
    loadNotes();
}

/* load notes UI */
searchInput.addEventListener("input", loadNotes);

async function loadNotes() {
    const notes = await getAll("notes");
    const query = (searchInput?.value || "").toLowerCase();

    const filtered = notes.filter(n =>
        (n.title || "").toLowerCase().includes(query) ||
        (n.content || "").toLowerCase().includes(query) ||
        (n.tags || []).join(" ").toLowerCase().includes(query)
    );

    // pinned first
    const sorted = [
        ...filtered.filter(n => n.pinned),
        ...filtered.filter(n => !n.pinned)
    ];

    notesContainer.innerHTML = "";

    sorted.forEach(note => {
        const div = document.createElement("div");
        div.className = "col-md-4 mb-3";

        div.innerHTML = `
            <div class="note-card" style="background:${note.color};" data-id="${note.id}">
                <div class="note-top-icons">
                    <button class="btn-pin btn-sm">${note.pinned ? "📌" : "📍"}</button>
                    <button class="btn-fav btn-sm">${note.favorite ? "⭐" : "☆"}</button>
                    <button class="btn-book btn-sm">${note.bookmarked ? "🔖" : "📑"}</button>
                </div>
                <h5 class="note-title">${escapeHtml(note.title || "")}</h5>
                <p class="note-content">${escapeHtml(note.content || "")}</p>
                <small class="text-muted">${(note.tags || []).join(", ")}</small>
            </div>
        `;

        const card = div.querySelector(".note-card");

        div.querySelector(".btn-pin").addEventListener("click", (e) => { e.stopPropagation(); toggleField(note, "pinned"); });
        div.querySelector(".btn-fav").addEventListener("click", (e) => { e.stopPropagation(); toggleField(note, "favorite"); });
        div.querySelector(".btn-book").addEventListener("click", (e) => { e.stopPropagation(); toggleField(note, "bookmarked"); });

        card.addEventListener("click", () => openEditModal(note));
        notesContainer.appendChild(div);
    });
}

/* simple escaping to avoid accidental HTML injection */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* init */
loadNotes();
