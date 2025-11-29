let projects = JSON.parse(localStorage.getItem("projects") || "[]");
const projectList = document.getElementById("projectList");

// Open modal
document.getElementById("addProjectBtn").onclick = () => {
    document.getElementById("modalTitle").innerText = "New Project";
    document.getElementById("editId").value = "";
    document.getElementById("projectTitle").value = "";
    document.getElementById("projectDesc").value = "";
    document.getElementById("projectDeadline").value = "";
    new bootstrap.Modal(document.getElementById("projectModal")).show();
};

// Save project
document.getElementById("saveProjectBtn").onclick = () => {
    const id = document.getElementById("editId").value;
    const title = document.getElementById("projectTitle").value;
    const desc = document.getElementById("projectDesc").value;
    const deadline = document.getElementById("projectDeadline").value;
    const tag = document.getElementById("projectTag").value;

    if (id) {
        let p = projects.find(x => x.id == id);
        p.title = title;
        p.desc = desc;
        p.deadline = deadline;
        p.tag = tag;
    } else {
        projects.push({
            id: Date.now(),
            title,
            desc,
            deadline,
            tag,
            pinned: false,
            fav: false
        });
    }

    saveProjects();
    new bootstrap.Modal(document.getElementById("projectModal")).hide();
};

// Save to LS
function saveProjects() {
    localStorage.setItem("projects", JSON.stringify(projects));
    loadProjects();
}

// Render projects
function loadProjects() {
    projectList.innerHTML = "";

    let filtered = [...projects];

    // Search
    const q = document.getElementById("searchProject").value.toLowerCase();
    if (q) filtered = filtered.filter(p => p.title.toLowerCase().includes(q));

    // Tag filter
    const tag = document.getElementById("filterTag").value;
    if (tag) filtered = filtered.filter(p => p.tag === tag);

    // Favorite / pinned filter
    const fav = document.getElementById("filterFav").value;
    if (fav === "fav") filtered = filtered.filter(p => p.fav);
    if (fav === "pinned") filtered = filtered.filter(p => p.pinned);

    filtered.sort((a, b) => b.pinned - a.pinned);

    filtered.forEach(p => {
        projectList.innerHTML += `
            <div class="col-md-4">
                <div class="project-card">
                    <h5>${p.title}</h5>
                    <p>${p.desc}</p>
                    <small class="project-tag">${p.tag}</small>
                    <p class="mt-2"><strong>Deadline:</strong> ${p.deadline || "None"}</p>

                    <div class="project-actions mt-3 d-flex">

                        <button class="btn btn-sm btn-outline-primary" onclick="editProject(${p.id})">Edit</button>

                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProject(${p.id})">Delete</button>

                        <button class="btn btn-sm" onclick="togglePin(${p.id})">
                            📌
                        </button>

                        <button class="btn btn-sm" onclick="toggleFav(${p.id})">
                            ❤️
                        </button>

                    </div>
                </div>
            </div>
        `;
    });
}

// Edit
function editProject(id) {
    const p = projects.find(x => x.id == id);
    document.getElementById("modalTitle").innerText = "Edit Project";
    document.getElementById("editId").value = id;
    document.getElementById("projectTitle").value = p.title;
    document.getElementById("projectDesc").value = p.desc;
    document.getElementById("projectDeadline").value = p.deadline;
    document.getElementById("projectTag").value = p.tag;

    new bootstrap.Modal(document.getElementById("projectModal")).show();
}

// Delete
function deleteProject(id) {
    projects = projects.filter(p => p.id !== id);
    saveProjects();
}

// Pin
function togglePin(id) {
    const p = projects.find(x => x.id == id);
    p.pinned = !p.pinned;
    saveProjects();
}

// Favorite
function toggleFav(id) {
    const p = projects.find(x => x.id == id);
    p.fav = !p.fav;
    saveProjects();
}

loadProjects();

// Filters live update
document.getElementById("searchProject").oninput = loadProjects;
document.getElementById("filterTag").onchange = loadProjects;
document.getElementById("filterFav").onchange = loadProjects;
