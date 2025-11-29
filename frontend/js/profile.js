// ========== LOAD PROFILE ===========
function loadProfile() {
    const user = JSON.parse(localStorage.getItem("userProfile") || "{}");

    if (user.name) document.getElementById("profileName").value = user.name;
    if (user.bio) document.getElementById("profileBio").value = user.bio;
    if (user.pic) document.getElementById("profilePicPreview").src = user.pic;

    document.getElementById("notifyToggle").checked = user.notifications ?? true;

    loadCertificates();
    loadActivity();
    renderChart();
}

document.getElementById("saveProfile").onclick = () => {
    const reader = new FileReader();
    const file = document.getElementById("profilePic").files[0];

    const user = {
        name: document.getElementById("profileName").value,
        bio: document.getElementById("profileBio").value,
        notifications: document.getElementById("notifyToggle").checked,
    };

    // If new image selected
    if (file) {
        reader.onload = () => {
            user.pic = reader.result;
            localStorage.setItem("userProfile", JSON.stringify(user));
            loadProfile();
            updateDashboardGreeting();
        };
        reader.readAsDataURL(file);
    } else {
        const old = JSON.parse(localStorage.getItem("userProfile") || "{}");
        user.pic = old.pic || "";
        localStorage.setItem("userProfile", JSON.stringify(user));
        loadProfile();
        updateDashboardGreeting();
    }
};

// Update greeting on dashboard
function updateDashboardGreeting() {
    const user = JSON.parse(localStorage.getItem("userProfile") || "{}");
    if (user.name) localStorage.setItem("dashboardGreeting", user.name);
}

// ========== CERTIFICATES ===========
function loadCertificates() {
    const container = document.getElementById("certificateContainer");
    const certs = JSON.parse(localStorage.getItem("certificates") || "[]");
    container.innerHTML = "";

    certs.forEach((c, i) => {
        const div = document.createElement("div");
        div.className = "col-md-4 mb-3";
        div.innerHTML = `
            <div class="certificate-thumb">
                ${c.type === "pdf"
                ? `<embed src="${c.data}" width="100%" height="180px" />`
                : `<img src="${c.data}" class="img-fluid rounded" />`}

                <button class="btn btn-sm btn-danger mt-2" onclick="deleteCert(${i})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

document.getElementById("uploadCertificate").onclick = () => {
    const input = document.getElementById("certificateInput");
    const files = input.files;

    if (!files.length) return alert("Select a file first.");

    let certs = JSON.parse(localStorage.getItem("certificates") || "[]");

    [...files].forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            certs.push({
                name: file.name,
                type: file.name.endsWith(".pdf") ? "pdf" : "img",
                data: reader.result
            });
            localStorage.setItem("certificates", JSON.stringify(certs));
            loadCertificates();
        };
        reader.readAsDataURL(file);
    });
};

function deleteCert(index) {
    let certs = JSON.parse(localStorage.getItem("certificates"));
    certs.splice(index, 1);
    localStorage.setItem("certificates", JSON.stringify(certs));
    loadCertificates();
}

// ========== ACTIVITY ===========
function loadActivity() {
    const container = document.getElementById("activityList");
    const logs = JSON.parse(localStorage.getItem("activity") || "[]");

    container.innerHTML = logs
        .slice(-10)
        .reverse()
        .map(a => `<li class="list-group-item">${a}</li>`)
        .join("");
}

// ========== PROGRESS CHART ===========
function renderChart() {
    const ctx = document.getElementById("progressChart");
    const time = JSON.parse(localStorage.getItem("engageTime") || "[]");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: time.map(t => t.date),
            datasets: [{
                label: "Minutes spent in EduMate",
                data: time.map(t => t.minutes),
                borderWidth: 3
            }]
        }
    });
}

// ========== SETTINGS ===========
document.getElementById("exportData").onclick = () => {
    const data = {
        user: JSON.parse(localStorage.getItem("userProfile") || "{}"),
        certificates: JSON.parse(localStorage.getItem("certificates") || "[]"),
        activity: JSON.parse(localStorage.getItem("activity") || "[]"),
        time: JSON.parse(localStorage.getItem("engageTime") || "[]")
    };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "edumate_backup.json";
    a.click();
};

document.getElementById("importData").onclick = () => {
    const file = document.getElementById("importDataFile").files[0];
    if (!file) return alert("Select a JSON file");

    const reader = new FileReader();
    reader.onload = () => {
        const data = JSON.parse(reader.result);
        localStorage.setItem("userProfile", JSON.stringify(data.user));
        localStorage.setItem("certificates", JSON.stringify(data.certificates));
        localStorage.setItem("activity", JSON.stringify(data.activity));
        localStorage.setItem("engageTime", JSON.stringify(data.time));
        loadProfile();
    };
    reader.readAsText(file);
};

document.getElementById("clearData").onclick = () => {
    if (confirm("Delete all data?")) {
        localStorage.clear();
        loadProfile();
    }
};

loadProfile();
