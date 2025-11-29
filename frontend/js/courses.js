let editId = null;

document.getElementById("addCourseBtn").onclick = () => {
    editId = null;
    document.getElementById("modalTitle").innerText = "Add Course / Assignment";
    document.getElementById("courseTitle").value = "";
    document.getElementById("courseDesc").value = "";
    document.getElementById("courseVideo").value = "";
    document.getElementById("courseTags").value = "";
    document.getElementById("courseType").value = "course";
    new bootstrap.Modal(document.getElementById("courseModal")).show();
};

document.getElementById("saveCourse").onclick = () => {
    const title = courseTitle.value.trim();
    const desc = courseDesc.value.trim();
    const video = courseVideo.value.trim();
    const tags = courseTags.value.split(",").map(t => t.trim()).filter(Boolean);
    const type = courseType.value;

    if (!title) return alert("Please enter a title");

    const id = editId || Date.now();

    const thumbnail = getThumbnail(video);

    const course = { id, title, desc, video, tags, type, thumbnail, fav: false, pin: false };

    let stored = JSON.parse(localStorage.getItem("courses") || "[]");

    if (editId) stored = stored.map(c => c.id === id ? course : c);
    else stored.push(course);

    localStorage.setItem("courses", JSON.stringify(stored));

    loadCourses();
    bootstrap.Modal.getInstance(document.getElementById("courseModal")).hide();
};

function loadCourses() {
    const container = document.getElementById("courseContainer");
    container.innerHTML = "";

    let data = JSON.parse(localStorage.getItem("courses") || "[]");

    // Search filtering
    const q = document.getElementById("courseSearch").value.toLowerCase();
    if (q) {
        data = data.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.desc.toLowerCase().includes(q) ||
            c.tags.join(" ").toLowerCase().includes(q)
        );
    }

    // Pin first
    data.sort((a, b) => b.pin - a.pin);

    data.forEach(c => {
        const div = document.createElement("div");
        div.className = "col-md-4 mb-4";
        div.innerHTML = `
        <div class="course-card">

            <img src="${c.thumbnail}" class="course-thumb"/>

            <h5 class="mt-3">${c.title}</h5>

            <p class="text-muted">${c.desc}</p>

            <span class="course-type ${c.type}">
                ${c.type === "assignment" ? "Assignment" : "Course"}
            </span>

            <div class="mt-2 mb-2">
                ${c.tags.map(t => `<span class="tag-badge">${t}</span>`).join("")}
            </div>

            <div class="course-actions">
                <i class="bi ${c.pin ? "bi-pin-fill" : "bi-pin"}" onclick="togglePin(${c.id})"></i>
                <i class="bi ${c.fav ? "bi-heart-fill text-danger" : "bi-heart"}" onclick="toggleFav(${c.id})"></i>
                <i class="bi bi-pencil" onclick="editCourse(${c.id})"></i>
                <i class="bi bi-trash" onclick="deleteCourse(${c.id})"></i>
            </div>
        </div>
        `;
        container.appendChild(div);
    });
}

function getThumbnail(link) {
    if (!link.includes("youtube.com") && !link.includes("youtu.be")) return "https://via.placeholder.com/300x200";

    let id = "";
    if (link.includes("watch?v=")) id = link.split("v=")[1].split("&")[0];
    else id = link.split("youtu.be/")[1];

    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function togglePin(id) {
    let data = JSON.parse(localStorage.getItem("courses") || "[]");
    data = data.map(c => c.id === id ? { ...c, pin: !c.pin } : c);
    localStorage.setItem("courses", JSON.stringify(data));
    loadCourses();
}

function toggleFav(id) {
    let data = JSON.parse(localStorage.getItem("courses") || "[]");
    data = data.map(c => c.id === id ? { ...c, fav: !c.fav } : c);
    localStorage.setItem("courses", JSON.stringify(data));
    loadCourses();
}

function editCourse(id) {
    const d = JSON.parse(localStorage.getItem("courses"));
    const c = d.find(x => x.id === id);

    editId = id;

    courseTitle.value = c.title;
    courseDesc.value = c.desc;
    courseVideo.value = c.video;
    courseTags.value = c.tags.join(", ");
    courseType.value = c.type;

    document.getElementById("modalTitle").innerText = "Edit Entry";

    new bootstrap.Modal(document.getElementById("courseModal")).show();
}

function deleteCourse(id) {
    if (!confirm("Delete this entry?")) return;

    let data = JSON.parse(localStorage.getItem("courses"));
    data = data.filter(c => c.id !== id);
    localStorage.setItem("courses", JSON.stringify(data));
    loadCourses();
}

courseSearch.oninput = loadCourses;

loadCourses();
