/* ------------------------------
   IndexedDB – Fetch Deadlines
--------------------------------*/
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("EduMateDB", 1);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getDeadlines(storeName) {
    return openDB().then(db => {
        return new Promise(resolve => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const items = [];

            store.openCursor().onsuccess = e => {
                const cursor = e.target.result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(items);
                }
            };
        });
    });
}

/* ------------------------------
   Load Notifications
--------------------------------*/
async function loadNotifications() {
    const notifList = document.getElementById("notifications");
    notifList.innerHTML = "<li class='list-group-item'>Loading...</li>";

    const tasks = await getDeadlines("tasks");
    const projects = await getDeadlines("projects");
    const courses = await getDeadlines("courses");

    const all = [...tasks, ...projects, ...courses];
    const upcoming = all.filter(i => i.deadline);

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

/* ------------------------------
   Local Quotes (30 Total)
--------------------------------*/
const localQuotes = [
    { q: "Education is the most powerful weapon you can use to change the world.", a: "Nelson Mandela" },
    { q: "The future belongs to those who prepare for it today.", a: "Malcolm X" },
    { q: "Learning never exhausts the mind.", a: "Leonardo da Vinci" },
    { q: "The expert in anything was once a beginner.", a: "Helen Hayes" },
    { q: "Don’t watch the clock; do what it does. Keep going.", a: "Sam Levenson" },
    { q: "Success is the sum of small efforts repeated day in and day out.", a: "Robert Collier" },
    { q: "The beautiful thing about learning is nobody can take it away from you.", a: "B.B. King" },
    { q: "Small steps every day lead to big results.", a: "Unknown" },
    { q: "Your only limit is your mind.", a: "Unknown" },
    { q: "Today a reader, tomorrow a leader.", a: "Margaret Fuller" },
    { q: "It always seems impossible until it's done.", a: "Nelson Mandela" },
    { q: "What we learn becomes part of who we are.", a: "Unknown" },
    { q: "Focus on progress, not perfection.", a: "Unknown" },
    { q: "Work hard in silence, let success make the noise.", a: "Frank Ocean" },
    { q: "Dreams don’t work unless you do.", a: "John Maxwell" },
    { q: "Push yourself, because no one else is going to do it for you.", a: "Unknown" },
    { q: "Mistakes are proof that you are trying.", a: "Unknown" },
    { q: "Success doesn’t come from what you do occasionally. It comes from what you do consistently.", a: "Marie Forleo" },
    { q: "A little progress each day adds up to big results.", a: "Unknown" },
    { q: "Believe you can and you’re halfway there.", a: "Theodore Roosevelt" },
    { q: "The secret to getting ahead is getting started.", a: "Mark Twain" },
    { q: "Education is the key to unlocking the world.", a: "Oprah Winfrey" },
    { q: "You don’t have to be great to start, but you have to start to be great.", a: "Zig Ziglar" },
    { q: "There is no substitute for hard work.", a: "Thomas Edison" },
    { q: "Discipline is choosing what you want most over what you want now.", a: "Abraham Lincoln" },
    { q: "The best way to predict the future is to create it.", a: "Peter Drucker" },
    { q: "Success is not final; failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
    { q: "Learning is a treasure that will follow its owner everywhere.", a: "Chinese Proverb" },
    { q: "A goal without a plan is just a wish.", a: "Antoine de Saint-Exupéry" },
    { q: "If you get tired, learn to rest—not to quit.", a: "Unknown" }
];

/* ------------------------------
   Local Offline Education News
--------------------------------*/
const localNews = [
    { title: "New Study Shows AI Helping Students Learn Faster", source: "EduTech Daily" },
    { title: "Government Announces New Education Reforms for 2025", source: "Global Education Times" },
    { title: "Online Learning Platforms Reach Record Growth", source: "Digital Learning Hub" },
    { title: "Experts Say Soft Skills Are Becoming More Important", source: "Academic Journal" },
    { title: "Top Universities Introduce New Tech-Driven Courses", source: "Campus World" },
    { title: "Students Prefer Hybrid Learning Models, Survey Finds", source: "Edu Research Lab" },
    { title: "AI Tutors Becoming Common in Classrooms", source: "Education Today" },
    { title: "Internship Programs Expected to Increase in 2025", source: "Career Builders News" },
    { title: "New Math Techniques Improve Problem-Solving Skills", source: "Science Daily" },
    { title: "Schools Encouraged to Add Coding in Curriculum", source: "STEM World" },
    { title: "Digital Notes Replace Paper in Many Institutes", source: "Smart Campus News" },
    { title: "Scholarship Programs Expanding Globally", source: "Edu Global Network" },
    { title: "Study Reveals Benefits of Short Study Sessions", source: "Research Weekly" },
    { title: "More Students Choosing Remote Project Collaboration", source: "Tech Students Hub" },
    { title: "Universities Modernize Libraries With AI Search", source: "Library Future Times" },
    { title: "Education Apps See High Engagement Among Teens", source: "App Insights" },
    { title: "Hybrid Exams Could Become the New Standard", source: "Exam Watch" },
    { title: "More Schools Adopt Mental Health Support Programs", source: "Student Life News" },
    { title: "2025 Expected to Be a Big Year for EdTech Growth", source: "FutureEd" },
    { title: "New Coding Challenges Encourage Student Creativity", source: "Coder Campus" },
    { title: "Robotics Competitions Attract Record Participation", source: "STEM Times" },
    { title: "Study Shows Students Learn Faster With Gamification", source: "Learning Science" },
    { title: "More Students Choose Self-Paced Online Courses", source: "Open Learning News" },
    { title: "AI Can Help Teachers Save Time On Grading", source: "Teacher Weekly" },
    { title: "Science Fairs Introduce Virtual Experiments", source: "SciTech News" },
    { title: "Students Turn to Digital Planners for Productivity", source: "Productivity Hub" },
    { title: "Group Study Still Proven to Boost Retention Rates", source: "Academic Review" },
    { title: "Digital Libraries Becoming More Accessible", source: "Global Academy News" },
    { title: "Experts Encourage Project-Based Learning Models", source: "Education Insights" },
    { title: "Tech Institutes Introduce AI-Powered Labs", source: "AI Campus News" }
];

/* ------------------------------
   Quotes Loader
--------------------------------*/
function loadQuote() {
    const random = Math.floor(Math.random() * localQuotes.length);
    const q = localQuotes[random];

    document.getElementById("quote").textContent = q.q;
    document.getElementById("author").textContent = q.a;
}

/* ------------------------------
   Load Offline News
--------------------------------*/
function loadNews() {
    const container = document.getElementById("newscontainer");
    container.innerHTML = "";

    const shuffled = [...localNews].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    selected.forEach(article => {
        const div = document.createElement("div");
        div.className = "p-2 rounded mb-2 bg-light border";
        div.innerHTML = `
            <strong>${article.title}</strong><br>
            <small>${article.source}</small>
        `;
        container.appendChild(div);
    });
}

/* ------------------------------
   Dashboard Greeting
--------------------------------*/
function setGreeting() {
    const h2 = document.getElementById("Greeting");
    const hour = new Date().getHours();

    let msg = "Welcome";

    if (hour < 12) msg = "Good Morning";
    else if (hour < 18) msg = "Good Afternoon";
    else msg = "Good Evening";

    h2.textContent = `${msg}, User!`;
}

/* ------------------------------
   Dashboard Cards Removed
--------------------------------*/
function loadDashboardCards() {
    document.getElementById("dashboardcards").innerHTML = "";
}

/* ------------------------------
   Initialize Dashboard
--------------------------------*/
window.onload = () => {
    setGreeting();
    loadDashboardCards();
    loadQuote();
    loadNews();
    loadNotifications();
};
