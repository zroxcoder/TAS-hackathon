/* ================================
        MASTER DATABASE FILE
         db.js (EduMate DB)
   ================================ */

let db;
const DB_NAME = "EduMateDB";
const DB_VERSION = 1;

// Initialize DB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject("Error opening EduMate database");
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (e) => {
            db = e.target.result;

            /* ======================
                 NOTES STORE
            ======================= */
            if (!db.objectStoreNames.contains("notes")) {
                const notes = db.createObjectStore("notes", {
                    keyPath: "id",
                    autoIncrement: true
                });
                notes.createIndex("title", "title", { unique: false });
                notes.createIndex("tags", "tags", { multiEntry: true });
                notes.createIndex("favorite", "favorite", { unique: false });
                notes.createIndex("pinned", "pinned", { unique: false });
            }

            /* ======================
                 TASKS STORE
            ======================= */
            if (!db.objectStoreNames.contains("tasks")) {
                const tasks = db.createObjectStore("tasks", {
                    keyPath: "id",
                    autoIncrement: true
                });
                tasks.createIndex("title", "title", { unique: false });
                tasks.createIndex("deadline", "deadline", { unique: false });
                tasks.createIndex("status", "status", { unique: false });
                tasks.createIndex("tag", "tag", { unique: false });
            }

            /* ======================
                 PROJECTS STORE
            ======================= */
            if (!db.objectStoreNames.contains("projects")) {
                const store = db.createObjectStore("projects", {
                    keyPath: "id",
                    autoIncrement: true
                });

                store.createIndex("title", "title", { unique: false });
                store.createIndex("priority", "priority", { unique: false });
                store.createIndex("deadline", "deadline", { unique: false });
                store.createIndex("tags", "tags", { multiEntry: true });
                store.createIndex("favorite", "favorite", { unique: false });
                store.createIndex("pinned", "pinned", { unique: false });
            }

            /* ======================
                 COURSES STORE
            ======================= */
            if (!db.objectStoreNames.contains("courses")) {
                const store = db.createObjectStore("courses", {
                    keyPath: "id",
                    autoIncrement: true
                });

                store.createIndex("title", "title", { unique: false });
                store.createIndex("videoURL", "videoURL", { unique: false });
                store.createIndex("thumbnail", "thumbnail", { unique: false });
                store.createIndex("assignments", "assignments", { unique: false });
            }

            /* ======================
                 PROFILE STORE
            ======================= */
            if (!db.objectStoreNames.contains("profile")) {
                const store = db.createObjectStore("profile", {
                    keyPath: "id"
                });

                store.createIndex("username", "username", { unique: false });
                store.createIndex("certificates", "certificates", { unique: false });
                store.createIndex("progress", "progress", { unique: false });
            }

            /* ======================
                 SETTINGS STORE
            ======================= */
            if (!db.objectStoreNames.contains("settings")) {
                const store = db.createObjectStore("settings", {
                    keyPath: "id"
                });

                store.createIndex("notifications", "notifications", { unique: false });
                store.createIndex("theme", "theme", { unique: false });
                store.createIndex("dataControl", "dataControl", { unique: false });
            }
        };
    });
}

/* ================================
        GENERIC CRUD FUNCTIONS
   ================================ */

function addItem(storeName, item) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const request = store.add(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Error adding item");
    });
}

function getAll(storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Error fetching items");
    });
}

function updateItem(storeName, data) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve("Updated");
        request.onerror = () => reject("Update failed");
    });
}

function deleteItem(storeName, id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve("Deleted");
        request.onerror = () => reject("Delete failed");
    });
}

export { initDB, addItem, getAll, updateItem, deleteItem };
