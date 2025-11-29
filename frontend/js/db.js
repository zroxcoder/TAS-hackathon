/* ================================
   MASTER DATABASE FILE
   db.js (EduMate DB)
   ================================ */

let db;
const DB_NAME = "EduMateDB";
const DB_VERSION = 3; // increment if you change structure

function initDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(new Error("Error opening EduMate database"));
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (e) => {
            db = e.target.result;

            // NOTES
            if (!db.objectStoreNames.contains("notes")) {
                const notes = db.createObjectStore("notes", {
                    keyPath: "id",
                    autoIncrement: true
                });
                notes.createIndex("title", "title", { unique: false });
                notes.createIndex("tags", "tags", { multiEntry: true });
                notes.createIndex("favorite", "favorite", { unique: false });
                notes.createIndex("pinned", "pinned", { unique: false });
                notes.createIndex("bookmarked", "bookmarked", { unique: false });
            }

            // TASKS
            if (!db.objectStoreNames.contains("tasks")) {
                const tasks = db.createObjectStore("tasks", {
                    keyPath: "id",
                    autoIncrement: true
                });
                tasks.createIndex("title", "title", { unique: false });
                tasks.createIndex("deadline", "deadline", { unique: false });
                tasks.createIndex("status", "status", { unique: false });
                tasks.createIndex("tags", "tags", { multiEntry: true });
                tasks.createIndex("favorite", "favorite", { unique: false });
                tasks.createIndex("pinned", "pinned", { unique: false });
            }

            // TASK TAGS
            if (!db.objectStoreNames.contains("taskTags")) {
                db.createObjectStore("taskTags", {
                    keyPath: "name"
                });
            }

            // PROJECTS
            if (!db.objectStoreNames.contains("projects")) {
                const p = db.createObjectStore("projects", {
                    keyPath: "id",
                    autoIncrement: true
                });
                p.createIndex("title", "title", { unique: false });
                p.createIndex("priority", "priority", { unique: false });
                p.createIndex("deadline", "deadline", { unique: false });
                p.createIndex("startDate", "startDate", { unique: false });
                p.createIndex("endDate", "endDate", { unique: false });
                p.createIndex("tags", "tags", { multiEntry: true });
                p.createIndex("favorite", "favorite", { unique: false });
                p.createIndex("pinned", "pinned", { unique: false });
            }

            // PROJECT SUBTASKS
            if (!db.objectStoreNames.contains("projectSubtasks")) {
                const subtasks = db.createObjectStore("projectSubtasks", {
                    keyPath: "id",
                    autoIncrement: true
                });
                subtasks.createIndex("projectId", "projectId", { unique: false });
                subtasks.createIndex("completed", "completed", { unique: false });
            }

            // COURSES
            if (!db.objectStoreNames.contains("courses")) {
                const store = db.createObjectStore("courses", {
                    keyPath: "id",
                    autoIncrement: true
                });
                store.createIndex("title", "title", { unique: false });
                store.createIndex("deadline", "deadline", { unique: false });
                store.createIndex("thumbnail", "thumbnail", { unique: false });
                store.createIndex("tags", "tags", { multiEntry: true });
            }

            // ACTIVITY LOG
            if (!db.objectStoreNames.contains("activityLog")) {
                const store = db.createObjectStore("activityLog", {
                    keyPath: "id",
                    autoIncrement: true
                });
                store.createIndex("date", "date", { unique: false });
                store.createIndex("type", "type", { unique: false });
            }

            // PROFILE (single record with id=1)
            if (!db.objectStoreNames.contains("profile")) {
                const store = db.createObjectStore("profile", { keyPath: "id" });
                store.createIndex("username", "username", { unique: false });
                store.createIndex("certificates", "certificates", { multiEntry: true });
                store.createIndex("progress", "progress", { unique: false });

                store.put({
                    id: 1,
                    username: "Student",
                    certificates: [],
                    progress: 0,
                    notifications: true,
                    pic: ""
                });
            }

            // SETTINGS (optional single record id=1)
            if (!db.objectStoreNames.contains("settings")) {
                const store = db.createObjectStore("settings", { keyPath: "id" });
                store.put({
                    id: 1,
                    notifications: true,
                    theme: "light",
                    dataControl: "normal"
                });
            }
        };
    });
}

/* GENERIC CRUD */
async function addItem(storeName, item) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.add(item);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target?.error || new Error("Add failed"));
    });
}

async function putItem(storeName, item) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target?.error || new Error("Put failed"));
    });
}

async function getAll(storeName) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = (e) => reject(e.target?.error || new Error("GetAll failed"));
    });
}

async function getById(storeName, id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target?.error || new Error("GetById failed"));
    });
}

async function deleteItem(storeName, id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target?.error || new Error("Delete failed"));
    });
}

export { initDB, addItem, putItem, getAll, getById, deleteItem };
