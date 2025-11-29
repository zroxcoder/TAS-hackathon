import { initDB, addItem, getAll, putItem, deleteItem } from "./db.js";

let projects = [];
const projectList = document.getElementById("projectList");

window.addEventListener("DOMContentLoaded", async () => {
    await initDB();
    loadProjects();
});

/* open modal */
document.getElementById("addProjectBtn")?.addEventListener("click", () => {
    document.getElementById("modalTitle").innerText = "New Project";
    document.getElementById("editId").value = "";
    document.getElementById("projectTitle").value = "";
    document.getElementById("projectDesc").value = "";
    document.getElementById("projectDeadline").value = "";
    document.getElementById("projectStartDate").value = "";
    document.getElementById("projectEndDate").value = "";
    new bootstrap.Modal(document.getElementById("projectModal")).show();
});

/* save project */
document.getElementById("saveProjectBtn")?.addEventListener("click", async () => {
    const id = document.getElementById("editId").value;
    const title = document.getElementById("projectTitle").value.trim();
    const desc = document.getElementById("projectDesc").value.trim();
    const deadline = document.getElementById("projectDeadline").value || null;
    const startDate = document.getElementById("projectStartDate").value || null;
    const endDate = document.getElementById("projectEndDate").value || null;
    const tag = document.getElementById("projectTag").value || "";

    if (!title) return alert("Please enter a title");

    if (id) {
        const p = await getAll("projects").then(list => list.find(x => x.id == Number(id)));
        if (!p) return;
        p.title = title; p.desc = desc; p.deadline = deadline; p.tag = tag; p.startDate = startDate; p.endDate = endDate;
        await putItem("projects", p);
    } else {
        const newProject = {
            title, desc, deadline, tag, pinned: false, fav: false, startDate, endDate, createdAt: Date.now()
        };
        await addItem("projects", newProject);
    }

    new bootstrap.Modal(document.getElementById("projectModal")).hide();
    loadProjects();
});

/* load */
async function loadProjects() {
    projects = await getAll("projects");
    renderProjects(projects);
}

/* render */
function renderProjects(list) {
    projectList.innerHTML = "";
    let filtered = [...list];

    const q = document.getElementById("searchProject")?.value.toLowerCase() || "";
    if (q) filtered = filtered.filter(p => p.title.toLowerCase().includes(q));

    const tagFilter = document.getElementById("filterTag")?.value || "";
    if (tagFilter) filtered = filtered.filter(p => p.tag === tagFilter);

    const fav = document.getElementById("filterFav")?.value || "";
    if (fav === "fav") filtered = filtered.filter(p => p.fav);
    if (fav === "pinned") filtered = filtered.filter(p => p.pinned);

    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    filtered.forEach(p => {
        const el = document.createElement("div");
        el.className = "col-md-4 mb-3";
        el.innerHTML = `
            <div class="project-card p-3">
                <h5>${escapeHtml(p.title)}</h5>
                <p>${escapeHtml(p.desc || "")}</p>
                <small class="project-tag">${escapeHtml(p.tag || "")}</small>
                <p class="mt-2"><strong>Start:</strong> ${p.startDate || "—"} <strong>End:</strong> ${p.endDate || "—"}</p>
                <p><strong>Deadline:</strong> ${p.deadline || "None"}</p>
                <div class="project-actions mt-3 d-flex gap-2">
                    <button class="btn-edit btn btn-sm btn-outline-primary">Edit</button>
                    <button class="btn-delete btn btn-sm btn-outline-danger">Delete</button>
                    <button class="btn-pin btn btn-sm">${p.pinned ? "📌" : "📍"}</button>
                    <button class="btn-fav btn btn-sm">${p.fav ? "❤️" : "🤍"}</button>
                </div>
            </div>
        `;
        el.querySelector(".btn-edit").addEventListener("click", () => editProject(p.id));
        el.querySelector(".btn-delete").addEventListener("click", async () => { if (confirm("Delete project?")) { await deleteItem("projects", p.id); loadProjects(); }});
        el.querySelector(".btn-pin").addEventListener("click", async () => toggleField(p.id, "pinned"));
        el.querySelector(".btn-fav").addEventListener("click", async () => toggleField(p.id, "fav"));
        projectList.appendChild(el);
    });
}

function escapeHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* edit */
async function editProject(id) {
    const p = (await getAll("projects")).find(x => x.id == id);
    if (!p) return;
    document.getElementById("modalTitle").innerText = "Edit Project";
    document.getElementById("editId").value = id;
    document.getElementById("projectTitle").value = p.title;
    document.getElementById("projectDesc").value = p.desc;
    document.getElementById("projectDeadline").value = p.deadline || "";
    document.getElementById("projectStartDate").value = p.startDate || "";
    document.getElementById("projectEndDate").value = p.endDate || "";
    document.getElementById("projectTag").value = p.tag || "";
    new bootstrap.Modal(document.getElementById("projectModal")).show();
}

/* toggle fields */
async function toggleField(id, field) {
    const list = await getAll("projects");
    const p = list.find(x => x.id == id);
    if (!p) return;
    p[field] = !p[field];
    await putItem("projects", p);
    loadProjects();
}

/* filters */
document.getElementById("searchProject")?.addEventListener("input", loadProjects);
document.getElementById("filterTag")?.addEventListener("change", loadProjects);
document.getElementById("filterFav")?.addEventListener("change", loadProjects);
