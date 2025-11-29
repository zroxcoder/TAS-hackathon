import { initDB, putItem, getById, getAll } from "./db.js";

let progressChartInstance = null;

async function loadProfile() {
    await initDB();
    const profile = (await getById("profile", 1)) || { id:1, username: "Student", certificates: [], progress: 0, pic: "", notifications: true };

    const nameEl = document.getElementById("profileName");
    const bioEl = document.getElementById("profileBio");
    const picPrev = document.getElementById("profilePicPreview");
    const notifyToggle = document.getElementById("notifyToggle");

    if (nameEl) nameEl.value = profile.username || "";
    if (bioEl) bioEl.value = profile.bio || "";
    if (picPrev && profile.pic) picPrev.src = profile.pic;
    if (notifyToggle) notifyToggle.checked = profile.notifications ?? true;

    loadCertificates(profile);
    loadActivity();
    renderChart();
    updateDashboardGreeting();
}

document.getElementById("saveProfile")?.addEventListener("click", async () => {
    const name = document.getElementById("profileName")?.value || "";
    const bio = document.getElementById("profileBio")?.value || "";
    const notifications = document.getElementById("notifyToggle")?.checked ?? true;

    const file = document.getElementById("profilePic")?.files?.[0];

    const profile = (await getById("profile", 1)) || { id:1, certificates: [], progress: 0 };

    profile.username = name;
    profile.bio = bio;
    profile.notifications = notifications;

    if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
            profile.pic = reader.result;
            await putItem("profile", profile);
            await loadProfile();
        };
        reader.readAsDataURL(file);
    } else {
        await putItem("profile", profile);
        await loadProfile();
    }
});

function updateDashboardGreeting() {
    getById("profile", 1).then(profile => {
        const h = document.getElementById("Greeting");
        if (!h) return;
        h.textContent = `Welcome, ${profile?.username || "User"}!`;
    });
}

/* Certificates */
function loadCertificates(profile) {
    const container = document.getElementById("certificateContainer");
    if (!container) return;
    const certs = profile?.certificates || [];
    container.innerHTML = "";

    certs.forEach((c, i) => {
        const div = document.createElement("div");
        div.className = "col-md-4 mb-3";
        div.innerHTML = `
            <div class="certificate-thumb p-2 border rounded">
                ${c.type === "pdf" ? `<embed src="${c.data}" width="100%" height="180px" />` : `<img src="${c.data}" class="img-fluid rounded" />`}
                <button class="btn btn-sm btn-danger mt-2 w-100" data-index="${i}">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll("button[data-index]").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const idx = Number(e.currentTarget.dataset.index);
            const profile = await getById("profile", 1);
            profile.certificates.splice(idx, 1);
            await putItem("profile", profile);
            loadProfile();
        });
    });
}

document.getElementById("uploadCertificate")?.addEventListener("click", async () => {
    const input = document.getElementById("certificateInput");
    if (!input || !input.files.length) return alert("Select file(s) first.");

    const profile = (await getById("profile", 1)) || { id:1, certificates: [], progress:0 };

    [...input.files].forEach(file => {
        const reader = new FileReader();
        reader.onload = async () => {
            profile.certificates.push({
                name: file.name,
                type: file.name.endsWith(".pdf") ? "pdf" : "img",
                data: reader.result
            });
            await putItem("profile", profile);
            loadProfile();
        };
        reader.readAsDataURL(file);
    });
});

/* Activity */
async function loadActivity() {
    const container = document.getElementById("activityList");
    if (!container) return;
    const logs = await getAll("activityLog");
    container.innerHTML = (logs.slice(-10).reverse().map(a => `<li class="list-group-item">${a.message}</li>`)).join("");
}

/* Chart */
async function renderChart() {
    const ctx = document.getElementById("progressChart");
    if (!ctx) return;

    const time = await getAll("engageTime").catch(()=>[]); // if no store exists

    if (progressChartInstance) progressChartInstance.destroy();

    const labels = (time || []).map(t => t.date);
    const data = (time || []).map(t => t.minutes);

    progressChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{ label: "Minutes spent in EduMate", data, borderWidth: 3 }]
        }
    });
}

/* Export / Import / Clear */
document.getElementById("exportData")?.addEventListener("click", async () => {
    const profile = await getById("profile", 1);
    const certificates = profile?.certificates || [];
    const activity = await getAll("activityLog");
    const time = await getAll("engageTime").catch(()=>[]);
    const payload = { profile, certificates, activity, time };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edumate_backup.json";
    a.click();
});

document.getElementById("importData")?.addEventListener("click", () => {
    const file = document.getElementById("importDataFile")?.files?.[0];
    if (!file) return alert("Select a JSON file");
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const data = JSON.parse(reader.result);
            if (data.profile) await putItem("profile", data.profile);
            if (data.activity) {
                // write activity items
                for (const a of data.activity) await putItem("activityLog", a);
            }
            if (data.time) {
                for (const t of data.time) await putItem("engageTime", t);
            }
            loadProfile();
        } catch (e) {
            alert("Invalid JSON");
        }
    };
    reader.readAsText(file);
});

document.getElementById("clearData")?.addEventListener("click", async () => {
    if (!confirm("Delete ALL data? This cannot be undone.")) return;
    // clear all known stores by overwriting or deleting DB
    indexedDB.deleteDatabase("EduMateDB");
    setTimeout(() => location.reload(), 300);
});

/* init */
loadProfile();
