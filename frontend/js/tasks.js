import { initDB, putItem, addItem, getAll, deleteItem } from "./db.js";

let allCustomTags = [];
let selectedTags = [];

const defaultTags = [
    { name: "General", color: "#9e9e9e" },
    { name: "Important", color: "#ff5252" },
    { name: "Urgent", color: "#d32f2f" },
    { name: "Study", color: "#42a5f5" },
    { name: "Homework", color: "#ab47bc" },
    { name: "Project", color: "#66bb6a" }
];

window.addEventListener("DOMContentLoaded", async () => {
    await initDB();
    loadCustomTagsFromDB();
    loadTasks();
});

/* TAG UI */
function loadTagUI() {
    const container = document.getElementById("tagContainer");
    if (!container) return;
    container.innerHTML = "";

    [...defaultTags, ...allCustomTags].forEach(tag => {
        const div = document.createElement("div");
        div.className = "tag";
        div.style.background = tag.color;
        div.textContent = tag.name;
        div.onclick = () => {
            div.classList.toggle("selected");
            if (selectedTags.includes(tag.name)) selectedTags = selectedTags.filter(t => t !== tag.name);
            else selectedTags.push(tag.name);
        };
        container.appendChild(div);
    });
}

document.getElementById("customTagInput").addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
        const name = e.target.value.trim();
        if (!name) return;
        const newTag = { name, color: pastel() };
        allCustomTags.push(newTag);
        await putItem("taskTags", newTag); // put so duplicates replace
        e.target.value = "";
        loadTagUI();
    }
});

function pastel() {
    const r = Math.floor(Math.random() * 150 + 100);
    const g = Math.floor(Math.random() * 150 + 100);
    const b = Math.floor(Math.random() * 150 + 100);
    return `rgb(${r},${g},${b})`;
}

/* DB tag helpers */
async function loadCustomTagsFromDB() {
    allCustomTags = await getAll("taskTags");
    loadTagUI();
}

/* ADD TASK */
document.getElementById("addTaskBtn")?.addEventListener("click", openAddTaskModal);

function openAddTaskModal() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskDeadline").value = "";
    selectedTags = [];
    loadTagUI();
    new bootstrap.Modal(document.getElementById("taskModal")).show();
}

document.getElementById("saveTaskBtn")?.addEventListener("click", async () => {
    const title = document.getElementById("taskTitle").value.trim();
    const desc = document.getElementById("taskDesc").value.trim();
    const deadline = document.getElementById("taskDeadline").value || null;
    if (!title) return alert("Enter task title");

    const task = {
        title,
        desc,
        deadline,
        pinned: false,
        favorite: false,
        tags: [...selectedTags],
        createdAt: Date.now()
    };

    await addItem("tasks", task);

    new bootstrap.Modal(document.getElementById("taskModal")).hide();
    loadTasks();
});

/* LOAD TASKS */
async function loadTasks() {
    const tasks = await getAll("tasks");

    tasks.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    renderTasks(tasks);
    // dashboard notifications are handled centrally in dashboard.js
}

/* RENDER */
function renderTasks(tasks) {
    const container = document.getElementById("taskList");
    if (!container) return;
    container.innerHTML = "";

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "task-item mb-2";
        div.innerHTML = `
            <h5>${escapeHtml(task.title)}</h5>
            <p>${escapeHtml(task.desc || "")}</p>
            <p class="text-muted small">Deadline: ${task.deadline || "None"}</p>
            <div>${(task.tags || []).map(t => renderTag(t)).join("")}</div>
            <div class="task-actions mt-2">
                <button class="btn-pin">📌</button>
                <button class="btn-fav">❤️</button>
                <button class="btn-edit">✏</button>
                <button class="btn-delete">🗑</button>
            </div>
        `;
        div.querySelector(".btn-pin").addEventListener("click", async () => toggleField(task.id, "pinned"));
        div.querySelector(".btn-fav").addEventListener("click", async () => toggleField(task.id, "favorite"));
        div.querySelector(".btn-delete").addEventListener("click", async () => { if (confirm("Delete task?")) { await deleteItem("tasks", task.id); loadTasks(); }});
        div.querySelector(".btn-edit").addEventListener("click", () => editTask(task));
        container.appendChild(div);
    });
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function renderTag(name) {
    const tag = [...defaultTags, ...allCustomTags].find(t => t.name === name);
    if (!tag) return `<span class="badge-tag">${escapeHtml(name)}</span>`;
    return `<span class="badge-tag" style="background:${tag.color}">${escapeHtml(name)}</span>`;
}

/* EDIT */
function editTask(task) {
    // open modal filled
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.desc || "";
    document.getElementById("taskDeadline").value = task.deadline || "";
    // store id temporarily
    document.getElementById("taskModal").dataset.editId = task.id;
    new bootstrap.Modal(document.getElementById("taskModal")).show();

    // change save handler to support edit (temporarily)
    const saveBtn = document.getElementById("saveTaskBtn");
    const handler = async () => {
        const id = Number(document.getElementById("taskModal").dataset.editId);
        const t = {
            id,
            title: document.getElementById("taskTitle").value.trim(),
            desc: document.getElementById("taskDesc").value.trim(),
            deadline: document.getElementById("taskDeadline").value || null,
            pinned: task.pinned || false,
            favorite: task.favorite || false,
            tags: task.tags || [],
            createdAt: task.createdAt
        };
        await putItem("tasks", t);
        document.getElementById("taskModal").removeAttribute("data-edit-id");
        saveBtn.removeEventListener("click", handler);
        loadTasks();
        bootstrap.Modal.getInstance(document.getElementById("taskModal")).hide();
    };
    saveBtn.addEventListener("click", handler);
}

/* toggle pin/fav */
async function toggleField(id, field) {
    const all = await getAll("tasks");
    const task = all.find(t => t.id === id);
    if (!task) return;
    task[field] = !task[field];
    await putItem("tasks", task);
    loadTasks();
}

/* search */
document.getElementById("searchBox")?.addEventListener("input", () => {
    const q = document.getElementById("searchBox").value.toLowerCase();
    document.querySelectorAll(".task-item").forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? "block" : "none";
    });
});
