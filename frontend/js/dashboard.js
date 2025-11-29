import { initDB, getAll, getById } from "./db.js";

async function loadNotifications() {
    const notifList = document.getElementById("notifications");
    if (!notifList) return;
    notifList.innerHTML = "<li class='list-group-item'>Loading...</li>";

    await initDB();

    const tasks = await getAll("tasks");
    const projects = await getAll("projects");
    const courses = await getAll("courses");

    const all = [...(tasks || []), ...(projects || []), ...(courses || [])];

    const upcoming = all.filter(i => i.deadline).map(i => ({ title: i.title || i.name || "Untitled", deadline: i.deadline }));

    upcoming.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    notifList.innerHTML = "";

    if (upcoming.length === 0) {
        notifList.innerHTML = "<li class='list-group-item'>No upcoming deadlines 🎉</li>";
        return;
    }

    upcoming.slice(0, 5).forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `${item.title} → Due: ${item.deadline}`;
        notifList.appendChild(li);
    });
}

const localQuotes = [ /* ... same array as before ... */ ];
const localNews = [ /* ... same array as before ... */ ];

function loadQuote() {
    const random = Math.floor(Math.random() * localQuotes.length);
    const q = localQuotes[random];
    document.getElementById("quote").textContent = q.q;
    document.getElementById("author").textContent = q.a;
}

function loadNews() {
    const container = document.getElementById("newscontainer");
    if (!container) return;
    container.innerHTML = "";
    const shuffled = [...localNews].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    selected.forEach(article => {
        const div = document.createElement("div");
        div.className = "p-2 rounded mb-2 bg-light border";
        div.innerHTML = `<strong>${article.title}</strong><br><small>${article.source}</small>`;
        container.appendChild(div);
    });
}

async function setGreeting() {
    const h2 = document.getElementById("Greeting");
    if (!h2) return;
    const profile = await getById("profile", 1);
    const hour = new Date().getHours();
    let msg = "Welcome";
    if (hour < 12) msg = "Good Morning";
    else if (hour < 18) msg = "Good Afternoon";
    else msg = "Good Evening";
    h2.textContent = `${msg}, ${profile?.username || "User"}!`;
}

function loadDashboardCards() {
    document.getElementById("dashboardcards").innerHTML = "";
}

window.onload = () => {
    loadQuote();
    loadNews();
    loadNotifications();
    setGreeting();
    loadDashboardCards();
};
