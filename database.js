// ==========================================
// CONFIGURACIÓN DE FIREBASE (Sustituye por tus llaves reales)
// ==========================================
const firebaseConfig = {
      apiKey: "AIzaSyDYKqALqrCBCQ6qWAbaUz--GaAqtniKOIU",
      authDomain: "plu-academy.firebaseapp.com",
      projectId: "plu-academy",
      storageBucket: "plu-academy.firebasestorage.app",
      messagingSenderId: "113074302558",
      appId: "1:113074302558:web:7a6ca99ced0d4bd5c3cecf"
};

// Inicializar servicios
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Catálogos estáticos iniciales en caso de base de datos vacía
const DEFAULT_AREAS = ["Carnes", "Frutas y Verduras", "Panaderia"];
const DEFAULT_PLUS = [
    { id: "m1", code: "9644", name: "MUSLO PIERNA FRESCO", area: "Carnes", icon: "🥩" },
    { id: "m2", code: "9640", name: "FILETE PECHUGA INDIO", area: "Carnes", icon: "🥩" },
    { id: "p1", code: "266", name: "UND SALPOR/ ALMIDON", area: "Panaderia", icon: "🍞" },
    { id: "f1", code: "4227", name: "AGUACATE CRIOLLO UND", area: "Frutas y Verduras", icon: "🥑" },
    { id: "f2", code: "7496", name: "AGUACATE HASS UN", area: "Frutas y Verduras", icon: "🥑" }
];
const DEFAULT_USERS = [
    { username: "Andres", password: "1234", badgeNumber: "1001", avatar: "⚡", store: "Matriz", score: 0, totalQuizzes: 0, accuracy: 0, streak: 0, level: "Principiante", categoryScores: {} }
];

// Inicialización controlada
async function initDatabase() {
    try {
        const plusDoc = await db.collection("app_config").doc("plus_data").get();
        if (!plusDoc.exists) {
            await db.collection("app_config").doc("plus_data").set({ list: DEFAULT_PLUS });
            console.log("🚀 Catálogo de artículos inicializado en Firestore.");
        }
        const areasDoc = await db.collection("app_config").doc("areas_data").get();
        if (!areasDoc.exists) {
            await db.collection("app_config").doc("areas_data").set({ list: DEFAULT_AREAS });
        }
        const usersSnap = await db.collection("users").limit(1).get();
        if (usersSnap.empty) {
            for (let u of DEFAULT_USERS) {
                await db.collection("users").doc(u.username.toLowerCase()).set(u);
            }
        }
    } catch (e) { console.error("Error inicializando base remota:", e); }
}
initDatabase();

// Funciones CRUD del API Remoto
async function getPLUs() {
    const d = await db.collection("app_config").doc("plus_data").get();
    return d.exists ? d.data().list : [];
}
async function savePLUs(arr) {
    await db.collection("app_config").doc("plus_data").set({ list: arr });
}
async function getAreas() {
    const d = await db.collection("app_config").doc("areas_data").get();
    return d.exists ? d.data().list : [];
}
async function saveAreas(arr) {
    await db.collection("app_config").doc("areas_data").set({ list: arr });
}
async function getUsers() {
    const snap = await db.collection("users").orderBy("score", "desc").get();
    let res = [];
    snap.forEach(doc => res.push(doc.data()));
    return res;
}

// Sesión Local Síncrona
function getActiveUser() {
    const u = localStorage.getItem("plu_academy_active_user");
    return u ? JSON.parse(u) : null;
}
function setActiveUser(u) {
    if (u) localStorage.setItem("plu_academy_active_user", JSON.stringify(u));
    else localStorage.removeItem("plu_academy_active_user");
}

async function updateUserStats(username, correct, total, scoreGained, area) {
    const ref = db.collection("users").doc(username.toLowerCase());
    const doc = await ref.get();
    let u = doc.exists ? doc.data() : { username, score:0, totalQuizzes:0, accuracy:0, streak:0, level:"Principiante", categoryScores:{} };
    
    if(!u.categoryScores) u.categoryScores = {};
    u.totalQuizzes += 1;
    u.score = Math.max(0, u.score + scoreGained);
    if(area && area !== 'todas') u.categoryScores[area] = (u.categoryScores[area] || 0) + scoreGained;
    
    const acc = Math.round((correct / total) * 100);
    u.accuracy = u.accuracy === 0 ? acc : Math.round((u.accuracy * (u.totalQuizzes - 1) + acc) / u.totalQuizzes);
    u.streak = acc >= 80 ? u.streak + 1 : 0;
    
    if (u.score >= 3000) u.level = "Maestra PLU";
    else if (u.score >= 1500) u.level = "Cajero Senior";
    else if (u.score >= 600) u.level = "Cajero Junior";
    else u.level = "Principiante";

    await ref.set(u);
    if(getActiveUser()?.username.toLowerCase() === username.toLowerCase()) setActiveUser(u);
    return u;
}