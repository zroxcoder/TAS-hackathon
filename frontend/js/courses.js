import { initDB, addItem, getAll, putItem, deleteItem } from "./db.js";

let editId = null;

window.addEventListener("DOMContentLoaded", async () => {
    await initDB();
    loadCourses();
});

/* add button */
document.getElementById("addCourseBtn")?.addEventListener("click", () => {
    editId = null;
    document.getElementById("modalTitle").innerText = "Add Course / Assignment";
    document.getElementById("courseTitle").value = "";
    document.getElementById("courseDesc").value = "";
    document.getElementById("courseVideo").value = "";
    document.getElementById("courseTags").value = "";
    document.getElementById("courseType").value = "course";
    new bootstrap.Modal(document.getElementById("courseModal")).show();
});

document.getElementById("saveCourse")?.addEventListener("click", async () => {
    const title = document.getElementById("courseTitle").value.trim();
    const desc = document.getElementById("courseDesc").value.trim();
    const video = document.getElementById("courseVideo").value.trim();
    const tags = document.getElementById("courseTags").value.split(",").map(t => t.trim()).filter(Boolean);
    const type = document.getElementById("courseType").value;
    const deadline = document.getElementById("courseDeadline")?.value || null;

    if (!title) return alert("Please enter a title");

    const thumbnail = getThumbnail(video); // returns null if no video found

    const course = {
        id: editId ? Number(editId) : undefined,
        title, desc, video, tags, type, thumbnail, fav: false, pin: false, deadline
    };

    if (editId) {
        await putItem("courses", course);
    } else {
        await addItem("courses", course);
    }

    loadCourses();
    bootstrap.Modal.getInstance(document.getElementById("courseModal")).hide();
});

/* load courses */
async function loadCourses() {
    const container = document.getElementById("courseContainer");
    if (!container) return;
    container.innerHTML = "";

    let data = await getAll("courses");

    const q = document.getElementById("courseSearch")?.value.toLowerCase() || "";
    if (q) {
        data = data.filter(c =>
            c.title.toLowerCase().includes(q) ||
            (c.desc || "").toLowerCase().includes(q) ||
            (c.tags || []).join(" ").toLowerCase().includes(q)
        );
    }

    data.sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));

    data.forEach(c => {
        const div = document.createElement("div");
        div.className = "col-md-4 mb-4";

        const thumbHtml = c.thumbnail ? `<img src="${c.thumbnail}" class="course-thumb"/>` : `<div class="course-thumb-placeholder">No preview</div>`;

        div.innerHTML = `
            <div class="course-card">
                ${thumbHtml}
                <h5 class="mt-3">${escapeHtml(c.title)}</h5>
                <p class="text-muted">${escapeHtml(c.desc || "")}</p>
                <span class="course-type ${escapeHtml(c.type)}">${c.type === "assignment" ? "Assignment" : "Course"}</span>
                <div class="mt-2 mb-2">${(c.tags || []).map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join("")}</div>
                <div class="course-actions">
                    <button class="btn-pin">${c.pin ? "📌" : "📍"}</button>
                    <button class="btn-fav">${c.fav ? "❤️" : "🤍"}</button>
                    <button class="btn-edit">✏</button>
                    <button class="btn-delete">🗑</button>
                </div>
            </div>
        `;
        div.querySelector(".btn-pin").addEventListener("click", async () => togglePin(c.id));
        div.querySelector(".btn-fav").addEventListener("click", async () => toggleFav(c.id));
        div.querySelector(".btn-delete").addEventListener("click", async () => { if (confirm("Delete entry?")) { await deleteItem("courses", c.id); loadCourses(); }});
        div.querySelector(".btn-edit").addEventListener("click", () => editCourse(c.id));
        container.appendChild(div);
    });
}

function getThumbnail(link) {
    if (!link) return null;
    try {
        if (link.includes("youtube.com") || link.includes("youtu.be")) {
            let id = "";
            if (link.includes("watch?v=")) id = link.split("v=")[1].split("&")[0];
            else id = link.split("youtu.be/")[1].split("?")[0];
            if (!id) return null;
            return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
        }
    } catch (e) {
        return null;
    }
    return null;
}

function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* toggle helpers */
async function togglePin(id) {
    const list = await getAll("courses");
    const item = list.find(x => x.id === id);
    if (!item) return;
    item.pin = !item.pin;
    await putItem("courses", item);
    loadCourses();
}

async function toggleFav(id) {
    const list = await getAll("courses");
    const item = list.find(x => x.id === id);
    if (!item) return;
    item.fav = !item.fav;
    await putItem("courses", item);
    loadCourses();
}

/* edit */
async function editCourse(id) {
    const all = await getAll("courses");
    const c = all.find(x => x.id === id);
    if (!c) return;
    editId = id;
    document.getElementById("modalTitle").innerText = "Edit Entry";
    document.getElementById("courseTitle").value = c.title;
    document.getElementById("courseDesc").value = c.desc;
    document.getElementById("courseVideo").value = c.video;
    document.getElementById("courseTags").value = (c.tags || []).join(", ");
    document.getElementById("courseType").value = c.type;
    document.getElementById("courseDeadline").value = c.deadline || "";
    new bootstrap.Modal(document.getElementById("courseModal")).show();
}

/* search input */
document.getElementById("courseSearch")?.addEventListener("input", loadCourses);
