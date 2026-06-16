// Variables de control de estado global
let currentEditingPluId = null;
let currentSelectedPluImage = null;
let quizState = { list: [], currentIdx: 0, scoreGained: 0, correctAnswers: 0, mode: '', area: '', currentItem: null };

document.addEventListener("DOMContentLoaded", async () => {
    initTabNavigation();
    initImageUploadListener();
    
    document.getElementById("login-form").addEventListener("submit", loginFormSubmit);
    document.getElementById("btn-logout").addEventListener("click", logoutUser);
    document.getElementById("btn-start-quiz").addEventListener("click", startQuizGame);
    document.getElementById("study-area-filter").addEventListener("change", renderLearningContent);

    // Verificar si ya hay una sesi車n activa guardada
    const session = getActiveUser();
    if (session) {
        showAppShell(session);
    }
});

// Enrutador de la Interfaz Est芍tica (Tabs)
function initTabNavigation() {
    document.querySelectorAll(".nav-link").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            document.querySelectorAll(".nav-link, .tab-content").forEach(el => el.classList.remove("active"));
            btn.classList.add("active");
            
            const targetTab = btn.getAttribute("data-tab");
            document.getElementById(`tab-${targetTab}`).classList.add("active");
            
            // Carga bajo demanda seg迆n la pesta?a seleccionada
            if (targetTab === 'dashboard') updateDashboardStats();
            if (targetTab === 'study') await loadStudyTab();
            if (targetTab === 'quiz') await loadQuizSetup();
            if (targetTab === 'leaderboard') await renderLeaderboard();
            if (targetTab === 'admin') await renderAdminPLUTable();
        });
    });
}

// Lector de archivos de imagen a Base64
function initImageUploadListener() {
    const input = document.getElementById("plu-image-input");
    const preview = document.getElementById("plu-image-preview");
    if (!input || !preview) return;

    input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            currentSelectedPluImage = event.target.result;
            preview.style.backgroundImage = `url('${currentSelectedPluImage}')`;
            preview.textContent = "";
        };
        reader.readAsDataURL(file);
    });
}

// Autenticaci車n de Asociados
async function loginFormSubmit(e) {
    e.preventDefault();
    const userIn = document.getElementById("login-username").value.trim();
    const passIn = document.getElementById("login-password").value;

    const users = await getUsers();
    const found = users.find(u => u.username.toLowerCase() === userIn.toLowerCase() && u.password === passIn);

    if (found) {
        setActiveUser(found);
        showAppShell(found);
    } else {
        alert("Credenciales incorrectas o el usuario no existe en la sucursal.");
    }
}

function showAppShell(user) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-screen").style.display = "flex";
    document.getElementById("user-name").textContent = user.username;
    document.getElementById("user-level").textContent = user.level;
    document.getElementById("user-avatar").textContent = user.avatar || "??";
    updateDashboardStats();
}

function logoutUser() {
    setActiveUser(null);
    document.getElementById("app-screen").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("login-form").reset();
}

function updateDashboardStats() {
    const u = getActiveUser();
    if (!u) return;
    document.getElementById("stat-score").textContent = u.score || 0;
    document.getElementById("stat-quizzes").textContent = u.totalQuizzes || 0;
    document.getElementById("stat-accuracy").textContent = (u.accuracy || 0) + "%";
    document.getElementById("stat-streak").textContent = (u.streak || 0) + " ??";
    document.getElementById("user-level").textContent = u.level;
}

// Carga de M車dulo de Estudio
async function loadStudyTab() {
    const areas = await getAreas();
    const filter = document.getElementById("study-area-filter");
    filter.innerHTML = '<option value="todas">Todas las 芍reas</option>';
    areas.forEach(a => filter.innerHTML += `<option value="${a}">${a}</option>`);
    await renderLearningContent();
}

async function renderLearningContent() {
    const container = document.getElementById("learning-container");
    container.innerHTML = "<p>Cargando cat芍logo...</p>";
    const plus = await getPLUs();
    const filterVal = document.getElementById("study-area-filter").value;
    
    const filtered = filterVal === 'todas' ? plus : plus.filter(p => p.area === filterVal);
    container.innerHTML = "";

    if(filtered.length === 0) {
        container.innerHTML = "<p>No hay art赤culos registrados en esta 芍rea.</p>";
        return;
    }

    filtered.forEach(p => {
        let media = p.image 
            ? `<div class="fc-image-frame" style="background-image: url('${p.image}')"></div>`
            : `<div style="font-size:2.5rem; margin-bottom:15px;">${p.icon || '??'}</div>`;
        
        container.innerHTML += `
            <div class="fc-card">
                ${media}
                <h3>${p.name}</h3>
                <p class="badge" style="margin-top:8px;">PLU: ${p.code}</p>
            </div>
        `;
    });
}

// Operaci車n del Simulador / Juego
async function loadQuizSetup() {
    const areas = await getAreas();
    const select = document.getElementById("quiz-area-filter");
    select.innerHTML = '<option value="todas">Todas las 芍reas</option>';
    areas.forEach(a => select.innerHTML += `<option value="${a}">${a}</option>`);
}

async function startQuizGame() {
    const plus = await getPLUs();
    const area = document.getElementById("quiz-area-filter").value;
    const mode = document.getElementById("quiz-mode").value;

    let filtered = area === 'todas' ? plus : plus.filter(p => p.area === area);
    if (filtered.length < 4) {
        alert("Necesitas al menos 4 art赤culos en este departamento para simular.");
        return;
    }

    // Mezclar y tomar un bloque de 10 preguntas
    filtered.sort(() => Math.random() - 0.5);
    quizState = {
        list: filtered.slice(0, 10),
        currentIdx: 0,
        scoreGained: 0,
        correctAnswers: 0,
        mode: mode,
        area: area,
        currentItem: null
    };

    document.getElementById("quiz-setup").style.display = "none";
    document.getElementById("quiz-game").style.display = "block";
    showNextQuizQuestion();
}

function showNextQuizQuestion() {
    if (quizState.currentIdx >= quizState.list.length) {
        endQuizGame();
        return;
    }

    const item = quizState.list[quizState.currentIdx];
    quizState.currentItem = item;
    
    document.getElementById("quiz-progress").textContent = `Pregunta ${quizState.currentIdx + 1}/${quizState.list.length}`;
    document.getElementById("quiz-score").textContent = `Score: +${quizState.scoreGained}`;

    const mediaCont = document.getElementById("quiz-item-media");
    if (item.image) {
        mediaCont.innerHTML = `<div class="quiz-media-img" style="background-image: url('${item.image}')"></div>`;
    } else {
        mediaCont.innerHTML = item.icon || '??';
        mediaCont.style.fontSize = "4rem";
    }

    const prompt = document.getElementById("quiz-item-prompt");
    if (quizState.mode === 'name-to-code') {
        prompt.textContent = `?Cu芍l es el c車digo PLU de: ${item.name}?`;
    } else {
        mediaCont.innerHTML = `<div style="font-size:3.5rem; font-weight:bold; color:var(--primary);">${item.code}</div>`;
        prompt.textContent = `?A qu谷 art赤culo corresponde este c車digo PLU?`;
    }

    // Generar opciones de respuesta incorrectas (Distractores)
    const allItems = quizState.list;
    let distractors = allItems.filter(i => i.id !== item.id).sort(() => Math.random() - 0.5).slice(0, 3);
    distractors.push(item);
    distractors.sort(() => Math.random() - 0.5);

    const optsCont = document.getElementById("quiz-options");
    optsCont.innerHTML = "";
    distractors.forEach(opt => {
        const textBtn = quizState.mode === 'name-to-code' ? opt.code : opt.name;
        const btn = document.createElement("button");
        btn.className = "btn-option";
        btn.textContent = textBtn;
        btn.onclick = () => verifyQuizAnswer(textBtn);
        optsCont.appendChild(btn);
    });
}

function verifyQuizAnswer(selected) {
    const correct = quizState.mode === 'name-to-code' ? quizState.currentItem.code : quizState.currentItem.name;
    if (selected === correct) {
        quizState.scoreGained += 10;
        quizState.correctAnswers += 1;
    }
    quizState.currentIdx += 1;
    showNextQuizQuestion();
}

async function endQuizGame() {
    document.getElementById("quiz-game").style.display = "none";
    document.getElementById("quiz-setup").style.display = "block";
    
    const u = getActiveUser();
    alert(`Simulaci車n terminada.\nRespuestas correctas: ${quizState.correctAnswers}/10\nPuntos obtenidos: ${quizState.scoreGained}`);
    
    await updateUserStats(u.username, quizState.correctAnswers, quizState.list.length, quizState.scoreGained, quizState.area);
    updateDashboardStats();
}

// Pintar la tabla de L赤deres
async function renderLeaderboard() {
    const tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = "<tr><td colspan='5'>Descargando ranking...</td></tr>";
    const users = await getUsers();
    tbody.innerHTML = "";
    
    users.forEach((u, index) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>#${index + 1}</strong></td>
                <td>${u.avatar || '??'} ${u.username}</td>
                <td>${u.store || 'Matriz'}</td>
                <td><span class="badge">${u.level}</span></td>
                <td><strong>${u.score} pts</strong></td>
            </tr>
        `;
    });
}

// M車dulo CRUD de Administraci車n
async function renderAdminPLUTable() {
    const tbody = document.getElementById("admin-table-body");
    tbody.innerHTML = "<tr><td colspan='5'>Cargando cat芍logo...</td></tr>";
    const plus = await getPLUs();
    tbody.innerHTML = "";

    plus.forEach(p => {
        let visual = p.image 
            ? `<div style="width:36px; height:36px; border-radius:6px; background-size:cover; background-position:center; background-image:url('${p.image}')"></div>`
            : `<span style="font-size:1.5rem">${p.icon || '??'}</span>`;

        tbody.innerHTML += `
            <tr>
                <td>${visual}</td>
                <td><code>${p.code}</code></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.area}</td>
                <td>
                    <button class="btn btn-secondary" style="padding:5px 10px; font-size:0.85rem;" onclick="openEditPluModal('${p.id}')">Editar</button>
                </td>
            </tr>
        `;
    });
}

async function populateAreaSelects() {
    const areas = await getAreas();
    const select = document.getElementById("plu-area");
    select.innerHTML = "";
    areas.forEach(a => select.innerHTML += `<option value="${a}">${a}</option>`);
}

async function openAddPluModal() {
    currentEditingPluId = null;
    currentSelectedPluImage = null;
    document.getElementById("plu-modal-title").textContent = "Agregar Nuevo Art赤culo";
    document.getElementById("plu-edit-form").reset();
    document.getElementById("edit-plu-id").value = "";
    
    const preview = document.getElementById("plu-image-preview");
    preview.style.backgroundImage = "none";
    preview.textContent = "Sin imagen";
    
    await populateAreaSelects();
    document.getElementById("plu-form-modal").style.display = "flex";
}

async function openEditPluModal(id) {
    currentEditingPluId = id;
    document.getElementById("plu-modal-title").textContent = "Editar Art赤culo PLU";
    
    const plus = await getPLUs();
    const item = plus.find(p => p.id === id);
    if (!item) return;

    document.getElementById("edit-plu-id").value = item.id;
    document.getElementById("plu-code").value = item.code;
    document.getElementById("plu-name").value = item.name;
    document.getElementById("plu-emoji").value = item.icon || "";
    
    currentSelectedPluImage = item.image || null;
    const preview = document.getElementById("plu-image-preview");
    if (currentSelectedPluImage) {
        preview.style.backgroundImage = `url('${currentSelectedPluImage}')`;
        preview.textContent = "";
    } else {
        preview.style.backgroundImage = "none";
        preview.textContent = "Sin imagen";
    }

    await populateAreaSelects();
    document.getElementById("plu-area").value = item.area;
    document.getElementById("plu-form-modal").style.display = "flex";
}

function closePluModal() {
    document.getElementById("plu-form-modal").style.display = "none";
}

async function savePluFormSubmit() {
    const id = document.getElementById("edit-plu-id").value;
    const code = document.getElementById("plu-code").value.trim();
    const name = document.getElementById("plu-name").value.trim().toUpperCase();
    const area = document.getElementById("plu-area").value;
    const icon = document.getElementById("plu-emoji").value.trim() || "??";
    const image = currentSelectedPluImage;

    let plus = await getPLUs();

    // Evitar c車digos duplicados
    if (plus.some(p => p.code === code && p.id !== id)) {
        alert(`Error cr赤tico: El c車digo PLU "${code}" ya est芍 asignado a otro art赤culo.`);
        return;
    }

    if (id) {
        // Editar
        plus = plus.map(p => p.id === id ? { ...p, code, name, area, icon, image } : p);
    } else {
        // Crear
        plus.push({ id: "item_" + Date.now(), code, name, area, icon, image });
    }

    await savePLUs(plus);
    closePluModal();
    await renderAdminPLUTable();
}