const defaultTags = [
    { name: "General", color: "#9e9e9e" },
    { name: "Important", color: "#ff5252" },
    { name: "Urgent", color: "#d32f2f" },
    { name: "Study", color: "#42a5f5" },
    { name: "Homework", color: "#ab47bc" },
    { name: "Project", color: "#66bb6a" }
];

let selectedTags = [];
let allCustomTags = [];

function loadTagUI() {
    const container = document.getElementById("tagContainer");
    container.innerHTML = "";

    [...defaultTags, ...allCustomTags].forEach(tag => {
        const div = document.createElement("div");

        div.className = "tag";
        div.style.background = tag.color;
        div.textContent = tag.name;

        div.onclick = () => {
            div.classList.toggle("selected");

            if (selectedTags.includes(tag.name)) {
                selectedTags = selectedTags.filter(t => t !== tag.name);
            } else {
                selectedTags.push(tag.name);
            }
        };

        container.appendChild(div);
    });
}

document.getElementById("customTagInput").addEventListener("keypress", e => {
    if (e.key === "Enter") {
        const name = e.target.value.trim();
        if (!name) return;

        const newTag = {
            name,
            color: pastel()
        };

        allCustomTags.push(newTag);
        saveTagToDB(newTag);

        e.target.value = "";
        loadTagUI();
    }
});


function pastel() {
    const r = Math.random() * 150 + 100;
    const g = Math.random() * 150 + 100;
    const b = Math.random() * 150 + 100;
    return `rgb(${r},${g},${b})`;
}

async function saveTagToDB(tag) {
    const db = await openDB();
    const tx = db.transaction("taskTags", "readwrite");
    tx.objectStore("taskTags").add(tag);
}

async function loadCustomTagsFromDB() {
    const db = await openDB();
    const tx = db.transaction("taskTags", "readonly");
    const store = tx.objectStore("taskTags");

    const items = [];
    store.openCursor().onsuccess = e => {
        const cur = e.target.result;
        if (cur) {
            items.push(cur.value);
            cur.continue();
        } else {
            allCustomTags = items;
            loadTagUI();
        }
    };
}

async function addTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const desc = document.getElementById("taskDesc").value.trim();
    const deadline = document.getElementById("taskDeadline").value;

    if (!title) return alert("Enter task title");

    const task = {
        id: Date.now(),
        title,
        desc,
        deadline,
        pinned: false,
        favorite: false,
        tags: [...selectedTags]
    };

    const db = await openDB();
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").add(task);

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskDeadline").value = "";

    selectedTags = [];
    loadTagUI();

    loadTasks();
}

async function loadTasks() {
    const db = await openDB();
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");

    const items = [];
    store.openCursor().onsuccess = e => {
        const cur = e.target.result;
        if (cur) {
            items.push(cur.value);
            cur.continue();
        } else {
            renderTasks(items);
        }
    };
}

function renderTasks(tasks) {
    const container = document.getElementById("taskList");
    container.innerHTML = "";

    // PINNED FIRST
    tasks.sort((a,b)=> b.pinned - a.pinned);

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "task-item";

        div.innerHTML = `
            <h5>${task.title}</h5>
            <p>${task.desc || ""}</p>

            <p class="text-muted small">Deadline: ${task.deadline || "None"}</p>

            <div>
                ${task.tags.map(tag => renderTag(tag)).join("")}
            </div>

            <div class="task-actions mt-2">
                <i onclick="togglePin(${task.id})">📌</i>
                <i onclick="toggleFav(${task.id})">❤️</i>
                <i onclick="editTask(${task.id})">✏</i>
                <i onclick="deleteTask(${task.id})">🗑</i>
            </div>
        `;

        container.appendChild(div);
    });
}

function renderTag(name) {
    const tag = [...defaultTags, ...allCustomTags].find(t => t.name === name);
    return `<span class="badge-tag" style="background:${tag.color}">${name}</span>`;
}

function searchTasks() {
    const q = document.getElementById("searchBox").value.toLowerCase();
    loadTasks();

    setTimeout(() => {
        document.querySelectorAll(".task-item").forEach(item => {
            if (!item.textContent.toLowerCase().includes(q)) {
                item.style.display = "none";
            }
        });
    }, 100);
}

async function togglePin(id) {
    updateField(id, "pinned");
}

async function toggleFav(id) {
    updateField(id, "favorite");
}

async function updateField(id, field) {
    const db = await openDB();
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");

    store.openCursor().onsuccess = e => {
        const cur = e.target.result;
        if (cur) {
            if (cur.value.id === id) {
                cur.update({
                    ...cur.value,
                    [field]: !cur.value[field]
                });
            }
            cur.continue();
        } else {
            loadTasks();
        }
    };
}

async function deleteTask(id) {
    const db = await openDB();
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").delete(id);
    loadTasks();
}

/* EDIT (simple prompt for now) */
async function editTask(id) {
    const db = await openDB();
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");

    store.openCursor().onsuccess = e => {
        const cur = e.target.result;
        if (cur && cur.value.id === id) {
            const updated = {
                ...cur.value,
                title: prompt("Edit Title:", cur.value.title) || cur.value.title,
                desc: prompt("Edit Description:", cur.value.desc) || cur.value.desc
            };
            cur.update(updated);
        }
        if (cur) cur.continue();
        else loadTasks();
    };
}

window.onload = () => {
    loadCustomTagsFromDB();
    loadTasks();
};
