// Lógica principal de PLU Academy

// Estado de la aplicación
let activeUser = null;
let currentView = 'dashboard';
let learnViewMode = 'flashcards'; // 'flashcards' o 'list'
let selectedAreaFilter = 'todas';
let selectedRankingArea = 'todas';
let selectedRankingStore = 'todas'; // <-- NUEVA: Controla el filtro por tienda en el ranking
let adminActiveTab = 'plu-list';

// Variables globales del Quiz
let quizState = {
    area: 'todas',
    mode: 'code-to-name',
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    streak: 0,
    scoreGained: 0,
    timer: null,
    timeLeft: 15,
    logs: [],
    isAnswering: false
};

// Variable para el artículo editado en Admin
let currentEditingPluId = null;
let tempSelectedUser = null;
let currentSelectedAvatar = '👤';

// ==========================================================================
// Sintetizador de Sonidos (Web Audio API)
// ==========================================================================
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
            
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.3);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1000, now);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            
            osc.start(now);
            osc.stop(now + 0.05);
        }
    } catch (e) {
        console.warn("La salida de audio falló o fue bloqueada por el navegador.");
    }
}

// ==========================================================================
// Inicialización y Navegación
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Configurar Navegación de la Sidebar
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            playSound('click');
            const targetView = btn.dataset.view;
            navigateToView(targetView);
        });
    });

    // Configurar cambio y edición de usuario
    document.getElementById("change-user-btn").addEventListener("click", () => {
        playSound('click');
        openUserModal();
    });
    const editBtn = document.getElementById("edit-profile-btn");
    if (editBtn) {
        editBtn.addEventListener("click", openEditProfileModal);
    }

    // Configurar pestañas en Admin
    document.querySelectorAll(".admin-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            playSound('click');
            switchAdminTab(tab.dataset.tab);
        });
    });

    // Crear Usuario Form
    document.getElementById("btn-create-user").addEventListener("click", createNewUser);

    // Confirmar y cancelar login por password
    document.getElementById("btn-login-confirm").addEventListener("click", confirmPasswordLogin);
    document.getElementById("btn-login-cancel").addEventListener("click", cancelPasswordLogin);
    document.getElementById("login-password-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            confirmPasswordLogin();
        }
    });

    // Iniciar Quiz Button
    document.getElementById("btn-start-quiz").addEventListener("click", startQuiz);
    document.getElementById("btn-quiz-retry").addEventListener("click", () => {
        playSound('click');
        showQuizSetup();
    });

    // Buscador en Estudio
    document.getElementById("search-plu").addEventListener("input", filterLearningContent);
    document.getElementById("toggle-learn-mode").addEventListener("click", toggleLearnViewMode);

    // Filtros de Admin
    document.getElementById("admin-search-plu").addEventListener("input", renderAdminPLUTable);
    document.getElementById("admin-filter-area").addEventListener("change", renderAdminPLUTable);

    // Chequear sesión inicial
    activeUser = getActiveUser();
    if (!activeUser) {
        openUserModal();
    } else {
        updateSidebarUserCard();
        navigateToView('dashboard');
    }
    
    // Cargar selectores generales
    populateAreaSelects();
    
    // Inicializar Avatares
    initAvatarSystem();
});

function navigateToView(viewId) {
    currentView = viewId;
    
    // Actualizar botones de navegación de la barra lateral
    document.querySelectorAll(".nav-btn").forEach(btn => {
        if (btn.dataset.view === viewId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Activar vista correcta
    document.querySelectorAll(".view-section").forEach(sec => {
        sec.classList.remove("active");
    });
    
    const activeSec = document.getElementById(`${viewId}-view`);
    if (activeSec) {
        activeSec.classList.add("active");
    }

    // Trigger de refresco según la vista activa
    if (viewId === 'dashboard') {
        renderDashboard();
    } else if (viewId === 'learning') {
        renderLearningAreaTabs();
        renderLearningContent();
    } else if (viewId === 'quiz') {
        showQuizSetup();
    } else if (viewId === 'ranking') {
        renderRanking();
    } else if (viewId === 'admin') {
        renderAdminPLUTable();
        renderAdminAreaTable();
        populateAreaSelects();
    }
}

// Llenar selectores de departamentos
function populateAreaSelects() {
    const areas = getAreas();
    
    // Selector en Quiz Setup
    const quizSelect = document.getElementById("quiz-area-select");
    quizSelect.innerHTML = '<option value="todas">Todas las Áreas</option>';
    areas.forEach(a => {
        quizSelect.innerHTML += `<option value="${a}">${a}</option>`;
    });

    // Selector en Admin filtros
    const adminFilterSelect = document.getElementById("admin-filter-area");
    adminFilterSelect.innerHTML = '<option value="todas">Todos los departamentos</option>';
    areas.forEach(a => {
        adminFilterSelect.innerHTML += `<option value="${a}">${a}</option>`;
    });

    // Selector en Modal Agregar PLU
    const pluAreaSelect = document.getElementById("plu-area");
    pluAreaSelect.innerHTML = '';
    areas.forEach(a => {
        pluAreaSelect.innerHTML += `<option value="${a}">${a}</option>`;
    });
}

// ==========================================================================
// Gestión de Perfiles de Usuario (Modales e Identificación)
// ==========================================================================
function openUserModal() {
    const modal = document.getElementById("user-modal");
    modal.style.display = "flex";
    
    // Ocultar sección de password y mostrar la sección principal de selección
    document.getElementById("user-password-login-container").style.display = "none";
    document.getElementById("modal-existing-users-container").style.display = "block";
    document.getElementById("modal-user-divider").style.display = "flex";
    document.getElementById("modal-new-user-form").style.display = "block";
    
    // Limpiar inputs
    document.getElementById("new-username-input").value = "";
    document.getElementById("new-user-store").value = "";
    document.getElementById("new-user-badge").value = "";
    document.getElementById("new-user-password").value = "";
    document.getElementById("login-password-input").value = "";
    document.getElementById("new-user-avatar-preview").textContent = "👤";
    document.getElementById("new-user-avatar-preview").style.backgroundImage = "none";
    currentSelectedAvatar = '👤';
    tempSelectedUser = null;
    
    // Listar usuarios existentes en el grid
    const usersGrid = document.getElementById("modal-users-grid");
    usersGrid.innerHTML = "";
    
    const users = getUsers();
    if (users.length === 0) {
        usersGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); font-size: 0.85rem; padding: 10px;">No hay perfiles. ¡Crea el tuyo abajo!</div>';
    } else {
        users.forEach(u => {
            const btn = document.createElement("button");
            btn.className = "user-select-btn";
            
            let avatarHtml = `<div class="btn-avatar">${u.username.substring(0, 2).toUpperCase()}</div>`;
            if (u.avatar && u.avatar.length > 10) {
                avatarHtml = `<div class="btn-avatar" style="background-image: url('${u.avatar}'); background-size: cover; background-position: center; color: transparent;"></div>`;
            } else if (u.avatar) {
                avatarHtml = `<div class="btn-avatar">${u.avatar}</div>`;
            }
            
            btn.innerHTML = `
                ${avatarHtml}
                <div class="btn-name">${u.username}</div>
            `;
            btn.onclick = () => {
                playSound('click');
                selectUser(u);
            };
            usersGrid.appendChild(btn);
        });
    }
}

function selectUser(user) {
    tempSelectedUser = user;
    
    // Ocultar selección principal
    document.getElementById("modal-existing-users-container").style.display = "none";
    document.getElementById("modal-user-divider").style.display = "none";
    document.getElementById("modal-new-user-form").style.display = "none";
    
    // Mostrar pantalla de clave
    const passwordContainer = document.getElementById("user-password-login-container");
    passwordContainer.style.display = "block";
    
    document.getElementById("login-password-title").textContent = `Ingresar Clave para ${user.username}`;
    const passwordInput = document.getElementById("login-password-input");
    passwordInput.value = "";
    passwordInput.focus();
}

function confirmPasswordLogin() {
    if (!tempSelectedUser) return;
    
    const passwordInput = document.getElementById("login-password-input");
    const enteredPassword = passwordInput.value;
    const userPassword = tempSelectedUser.password || "";
    
    if (enteredPassword === userPassword) {
        playSound('correct');
        loginUser(tempSelectedUser);
    } else {
        playSound('wrong');
        passwordInput.classList.add("wrong");
        setTimeout(() => {
            passwordInput.classList.remove("wrong");
        }, 400);
        alert("Contraseña incorrecta. Por favor intenta de nuevo.");
    }
}

function cancelPasswordLogin() {
    playSound('click');
    openUserModal();
}

function loginUser(user) {
    activeUser = user;
    setActiveUser(user);
    updateSidebarUserCard();
    document.getElementById("user-modal").style.display = "none";
    navigateToView('dashboard');
}

function createNewUser() {
    playSound('click');
    const input = document.getElementById("new-username-input");
    const name = input.value.trim();
    
    const passwordInput = document.getElementById("new-user-password");
    const password = passwordInput.value.trim();
    
    if (!name) {
        alert("Por favor, ingresa un nombre válido.");
        input.focus();
        return;
    }
    
    if (!password) {
        alert("Por favor, establece una contraseña para tu perfil.");
        passwordInput.focus();
        return;
    }
    
    const users = getUsers();
    const exists = users.some(u => u.username.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert("Este nombre ya existe. Selecciona tu perfil de la lista o escribe otro nombre.");
        return;
    }
    
    const badge = document.getElementById("new-user-badge").value.trim() || ("10" + Math.floor(Math.random() * 90 + 10));
    const store = document.getElementById("new-user-store").value.trim() || "General";
    
    const newUser = {
        username: name,
        password: password,
        badgeNumber: badge,
        avatar: currentSelectedAvatar,
        store: store,
        score: 0,
        totalQuizzes: 0,
        accuracy: 0,
        streak: 0,
        level: "Principiante",
        categoryScores: {}
    };
    
    users.push(newUser);
    saveUsers(users);
    
    input.value = "";
    passwordInput.value = "";
    loginUser(newUser);
}

function updateSidebarUserCard() {
    const avatar = document.getElementById("sidebar-avatar");
    const name = document.getElementById("sidebar-username");
    const lvl = document.getElementById("sidebar-level");
    
    if (activeUser) {
        if (activeUser.avatar && activeUser.avatar.length > 10) {
            avatar.style.backgroundImage = `url('${activeUser.avatar}')`;
            avatar.style.backgroundSize = "cover";
            avatar.style.backgroundPosition = "center";
            avatar.textContent = "";
        } else {
            avatar.style.backgroundImage = "none";
            avatar.textContent = activeUser.avatar || activeUser.username.substring(0, 2).toUpperCase();
        }
        name.textContent = activeUser.username;
        lvl.textContent = activeUser.level;
    } else {
        avatar.style.backgroundImage = "none";
        avatar.textContent = "👤";
        name.textContent = "Sin Usuario";
        lvl.textContent = "Selecciona uno";
    }
}

let tempEditAvatar = null;

function openEditProfileModal() {
    playSound('click');
    if (!activeUser) return;
    
    document.getElementById("edit-username-input").value = activeUser.username;
    document.getElementById("edit-user-store").value = activeUser.store || "";
    
    tempEditAvatar = activeUser.avatar;
    const preview = document.getElementById("edit-user-avatar-preview");
    if (tempEditAvatar && tempEditAvatar.length > 10) {
        preview.style.backgroundImage = `url('${tempEditAvatar}')`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";
        preview.textContent = "";
    } else {
        preview.style.backgroundImage = "none";
        preview.textContent = tempEditAvatar || activeUser.username.substring(0,2).toUpperCase();
    }
    
    document.getElementById("edit-profile-modal").style.display = "flex";
}

function saveProfileFormSubmit() {
    playSound('click');
    const newName = document.getElementById("edit-username-input").value.trim();
    const newStore = document.getElementById("edit-user-store").value.trim() || "General";
    
    if (!newName) {
        alert("El nombre no puede estar vacío.");
        return;
    }
    
    const users = getUsers();
    const oldName = activeUser.username;
    
    const exists = users.some(u => u.username.toLowerCase() === newName.toLowerCase() && u.username !== oldName);
    if (exists) {
        alert("Este nombre ya está en uso.");
        return;
    }
    
    const updatedUsers = users.map(u => {
        if (u.username === oldName) {
            u.username = newName;
            u.store = newStore;
            u.avatar = tempEditAvatar;
            activeUser = u; 
            return u;
        }
        return u;
    });
    
    saveUsers(updatedUsers);
    setActiveUser(activeUser);
    updateSidebarUserCard();
    
    document.getElementById("edit-profile-modal").style.display = "none";
    
    if (currentView === 'dashboard') renderDashboard();
    if (currentView === 'ranking') renderRanking();
}

// Inicializar sistema de avatares (Eventos de subida y predeterminados)
function initAvatarSystem() {
    const fileInput = document.getElementById('new-user-file-input');
    const preview = document.getElementById('new-user-avatar-preview');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Str = event.target.result;
                currentSelectedAvatar = base64Str;
                preview.style.backgroundImage = `url('${base64Str}')`;
                preview.style.backgroundSize = "cover";
                preview.style.backgroundPosition = "center";
                preview.textContent = "";
            };
            reader.readAsDataURL(file);
        });
    }
    
    const preloadedContainer = document.getElementById('preloaded-avatars-list');
    const editPreloadedContainer = document.getElementById('edit-preloaded-avatars-list');
    
    if (preloadedContainer) {
        const avatars = ['🧑‍💼', '👩‍💼', '⚡', '🌟', '🚀', '🧠', '😎', '🍉', '🥩', '🍞'];
        preloadedContainer.innerHTML = '';
        if (editPreloadedContainer) editPreloadedContainer.innerHTML = '';
        
        avatars.forEach(av => {
            // New user btn
            const btn = document.createElement('button');
            btn.className = 'action-icon-btn';
            btn.style.width = '36px';
            btn.style.height = '36px';
            btn.style.fontSize = '1.2rem';
            btn.textContent = av;
            btn.type = "button";
            btn.onclick = () => {
                currentSelectedAvatar = av;
                preview.style.backgroundImage = "none";
                preview.textContent = av;
            };
            preloadedContainer.appendChild(btn);
            
            // Edit user btn
            if (editPreloadedContainer) {
                const editPreview = document.getElementById('edit-user-avatar-preview');
                const btnEdit = document.createElement('button');
                btnEdit.className = 'action-icon-btn';
                btnEdit.style.width = '36px';
                btnEdit.style.height = '36px';
                btnEdit.style.fontSize = '1.2rem';
                btnEdit.textContent = av;
                btnEdit.type = "button";
                btnEdit.onclick = () => {
                    tempEditAvatar = av;
                    editPreview.style.backgroundImage = "none";
                    editPreview.textContent = av;
                };
                editPreloadedContainer.appendChild(btnEdit);
            }
        });
    }
    
    const editFileInput = document.getElementById('edit-user-file-input');
    const editPreview = document.getElementById('edit-user-avatar-preview');
    if (editFileInput) {
        editFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Str = event.target.result;
                tempEditAvatar = base64Str;
                editPreview.style.backgroundImage = `url('${base64Str}')`;
                editPreview.style.backgroundSize = "cover";
                editPreview.style.backgroundPosition = "center";
                editPreview.textContent = "";
            };
            reader.readAsDataURL(file);
        });
    }
}

// ==========================================================================
// Dashboard Logica
// ==========================================================================
function renderDashboard() {
    if (!activeUser) return;
    
    // Título bienvenida
    document.getElementById("welcome-title").textContent = `¡Hola, ${activeUser.username}!`;
    
    // Estadísticas
    document.getElementById("dash-score").textContent = activeUser.score;
    document.getElementById("dash-accuracy").textContent = `${activeUser.accuracy}%`;
    document.getElementById("dash-streak").textContent = activeUser.streak;
    document.getElementById("dash-quizzes").textContent = activeUser.totalQuizzes;
    
    // Mini Leaderboard (Top 3)
    const container = document.getElementById("mini-leaderboard-container");
    container.innerHTML = "";
    
    const allUsers = getUsers().slice(0, 3);
    allUsers.forEach((u, index) => {
        const item = document.createElement("div");
        item.className = `mini-rank-item rank-${index + 1}`;
        item.innerHTML = `
            <div class="mini-rank-badge">${index + 1}</div>
            <div class="mini-rank-name">${u.username} ${u.username === activeUser.username ? '<small style="color: var(--primary)">(Tú)</small>' : ''}</div>
            <div class="mini-rank-score">${u.score} pts</div>
        `;
        container.appendChild(item);
    });
}

// ==========================================================================
// Módulo de Estudio / Aprendizaje
// ==========================================================================
function renderLearningAreaTabs() {
    const container = document.getElementById("learning-area-filters");
    container.innerHTML = "";
    
    // Botón "Todas"
    const allBtn = document.createElement("button");
    allBtn.className = `area-tab ${selectedAreaFilter === 'todas' ? 'active' : ''}`;
    allBtn.textContent = "Todas las áreas";
    allBtn.onclick = () => {
        playSound('click');
        selectedAreaFilter = 'todas';
        renderLearningAreaTabs();
        renderLearningContent();
    };
    container.appendChild(allBtn);
    
    // Áreas individuales
    const areas = getAreas();
    areas.forEach(a => {
        const btn = document.createElement("button");
        btn.className = `area-tab ${selectedAreaFilter === a ? 'active' : ''}`;
        btn.textContent = a;
        btn.onclick = () => {
            playSound('click');
            selectedAreaFilter = a;
            renderLearningAreaTabs();
            renderLearningContent();
        };
        container.appendChild(btn);
    });
}

function toggleLearnViewMode() {
    playSound('click');
    const toggleBtn = document.getElementById("toggle-learn-mode");
    const cardsGrid = document.getElementById("flashcards-container");
    const listTable = document.getElementById("list-view-container");
    
    if (learnViewMode === 'flashcards') {
        learnViewMode = 'list';
        toggleBtn.textContent = "🎴 Ver Tarjetas";
        cardsGrid.classList.remove("active");
        listTable.classList.add("active");
    } else {
        learnViewMode = 'flashcards';
        toggleBtn.textContent = "📋 Ver Lista";
        listTable.classList.remove("active");
        cardsGrid.classList.add("active");
    }
    
    renderLearningContent();
}

function renderLearningContent() {
    const searchQuery = document.getElementById("search-plu").value.toLowerCase();
    const plus = getPLUs();
    
    // Filtrar PLUs
    const filtered = plus.filter(p => {
        const matchArea = selectedAreaFilter === 'todas' || p.area === selectedAreaFilter;
        const matchQuery = p.name.toLowerCase().includes(searchQuery) || p.code.includes(searchQuery);
        return matchArea && matchQuery;
    });

    if (learnViewMode === 'flashcards') {
        const grid = document.getElementById("flashcards-container");
        grid.innerHTML = "";
        
        if (filtered.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 40px;">No se encontraron artículos con estos filtros.</div>';
            return;
        }

        filtered.forEach(p => {
            const card = document.createElement("div");
            card.className = "flashcard";
            card.innerHTML = `
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <span class="fc-icon">${p.icon || '📦'}</span>
                        <span class="fc-name">${p.name}</span>
                        <span class="fc-category">${p.area}</span>
                        <span class="fc-tip">Toca para revelar PLU</span>
                    </div>
                    <div class="flashcard-back">
                        <span class="fc-plu-title">Código PLU</span>
                        <span class="fc-plu-code">${p.code}</span>
                        <span class="fc-name" style="margin-top: 20px; font-size: 0.95rem;">${p.name}</span>
                        <span class="fc-tip">Toca para voltear</span>
                    </div>
                </div>
            `;
            card.onclick = () => {
                playSound('click');
                card.classList.toggle("flipped");
            };
            grid.appendChild(card);
        });
    } else {
        // Modo Tabla/Lista
        const tableBody = document.getElementById("list-table-body");
        tableBody.innerHTML = "";
        
        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-dim); padding: 30px;">No se encontraron artículos.</td></tr>';
            return;
        }

        filtered.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span style="font-size: 1.2rem; margin-right: 8px;">${p.icon || '📦'}</span><strong>${p.name}</strong></td>
                <td><span class="rank-row-badge" style="font-size: 0.95rem; font-family: monospace;">${p.code}</span></td>
                <td><span style="color: var(--text-muted); font-size: 0.9rem;">${p.area}</span></td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

function filterLearningContent() {
    renderLearningContent();
}

// ==========================================================================
// Módulo de Evaluación (Quiz Engine)
// ==========================================================================
function showQuizSetup() {
    document.getElementById("quiz-setup-card").style.display = "block";
    document.getElementById("quiz-active-card").style.display = "none";
    document.getElementById("quiz-results-card").style.display = "none";
    
    // Parar temporizador si está activo
    if (quizState.timer) clearInterval(quizState.timer);
    
    populateAreaSelects();
}

function startQuiz() {
    playSound('click');
    const areaSelect = document.getElementById("quiz-area-select").value;
    const modeSelect = document.querySelector('input[name="quiz-mode"]:checked').value;
    
    const plus = getPLUs();
    
    // Filtrar artículos por área
    const pool = plus.filter(p => areaSelect === 'todas' || p.area === areaSelect);
    
    if (pool.length < 4) {
        alert("Necesitas al menos 4 artículos registrados en este departamento para iniciar un cuestionario. Registra más en el panel de Configuración.");
        return;
    }
    
    // Mezclar el pool de preguntas y usar todas las de la categoría
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledPool; // Usamos todo el listado de la categoría
    
    // Inicializar estado del juego
    quizState.area = areaSelect;
    quizState.mode = modeSelect;
    quizState.questions = selectedQuestions;
    quizState.currentIndex = 0;
    quizState.correctCount = 0;
    quizState.streak = 0;
    quizState.scoreGained = 0;
    quizState.logs = [];
    quizState.isAnswering = false;
    
    // Mostrar pantalla activa
    document.getElementById("quiz-setup-card").style.display = "none";
    document.getElementById("quiz-active-card").style.display = "block";
    
    showNextQuestion();
}

function showNextQuestion() {
    if (quizState.currentIndex >= quizState.questions.length) {
        endQuiz();
        return;
    }
    
    quizState.isAnswering = false;
    const item = quizState.questions[quizState.currentIndex];
    
    // Actualizar Progreso
    const total = quizState.questions.length;
    const progressPct = ((quizState.currentIndex) / total) * 100;
    document.getElementById("quiz-progress-text").textContent = `Pregunta ${quizState.currentIndex + 1} de ${total}`;
    document.getElementById("quiz-progress-bar").style.width = `${progressPct}%`;
    
    // Actualizar Racha visual
    document.getElementById("quiz-streak-display").textContent = `🔥 Racha: ${quizState.streak}`;
    
    // Prompt de Pregunta
    const iconEl = document.getElementById("quiz-item-icon");
    const promptEl = document.getElementById("quiz-question-prompt");
    
    if (quizState.mode === 'code-to-name') {
        iconEl.textContent = "⚡";
        promptEl.innerHTML = `¿A qué artículo pertenece el código PLU <span style="color: var(--secondary); font-family: monospace; font-size: 1.8rem; font-weight: 800; display: block; margin-top: 8px;">${item.code}</span>?`;
    } else {
        iconEl.textContent = item.icon || '📦';
        promptEl.innerHTML = `¿Cuál es el código PLU del artículo <strong style="color: var(--primary); display: block; margin-top: 8px; font-size: 1.8rem;">${item.name}</strong>?`;
    }
    
    // Obtener Opciones de Respuestas
    const allPlus = getPLUs();
    const options = generateOptions(item, allPlus, quizState.mode);
    
    // Renderizar Opciones en el Grid
    const optionsContainer = document.getElementById("quiz-options-container");
    optionsContainer.innerHTML = "";
    
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quiz-opt-btn";
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(btn, opt);
        optionsContainer.appendChild(btn);
    });
    
    // Iniciar Temporizador
    startTimer();
}

function generateOptions(correctItem, allItems, mode) {
    const isCodeToName = mode === 'code-to-name';
    const correctValue = isCodeToName ? correctItem.name : correctItem.code;
    
    // CORRECCIÓN: Filtrar por valor final para evitar que un distractor sea idéntico a la respuesta correcta
    let siblings = allItems.filter(i => {
        const value = isCodeToName ? i.name : i.code;
        return value.toLowerCase() !== correctValue.toLowerCase();
    });
    
    // Intentar buscar distractores del mismo departamento primero
    let areaSiblings = siblings.filter(i => i.area === correctItem.area);
    if (areaSiblings.length < 3) {
        areaSiblings = siblings; // Si no hay suficientes, busca en toda la tienda
    }
    
    // Mezclar y tomar 3 distractores únicos
    const shuffledSiblings = [...areaSiblings].sort(() => 0.5 - Math.random());
    const distractors = shuffledSiblings.slice(0, 3).map(i => isCodeToName ? i.name : i.code);
    
    // Unir respuesta correcta con distractores y volver a mezclar
    const options = [correctValue, ...distractors].sort(() => 0.5 - Math.random());
    return options;
}

function startTimer() {
    if (quizState.timer) clearInterval(quizState.timer);
    
    quizState.timeLeft = 15;
    const timerDisplay = document.getElementById("quiz-timer-display");
    timerDisplay.classList.remove("low-time");
    timerDisplay.textContent = `⏱️ ${quizState.timeLeft}s`;
    
    quizState.timer = setInterval(() => {
        quizState.timeLeft -= 1;
        timerDisplay.textContent = `⏱️ ${quizState.timeLeft}s`;
        
        if (quizState.timeLeft <= 5) {
            timerDisplay.classList.add("low-time");
        }
        
        if (quizState.timeLeft <= 0) {
            clearInterval(quizState.timer);
            handleTimeout();
        }
    }, 1000);
}

function handleAnswer(selectedBtn, selectedValue) {
    if (quizState.isAnswering) return;
    quizState.isAnswering = true;
    clearInterval(quizState.timer);
    
    const currentItem = quizState.questions[quizState.currentIndex];
    const correctValue = quizState.mode === 'code-to-name' ? currentItem.name : currentItem.code;
    const isCorrect = selectedValue === correctValue;
    
    // Registro de Logs para el feedback
    quizState.logs.push({
        item: currentItem,
        correctValue: correctValue,
        userValue: selectedValue,
        isCorrect: isCorrect,
        timedOut: false
    });
    
    if (isCorrect) {
        playSound('correct');
        selectedBtn.classList.add("correct");
        quizState.correctCount += 1;
        quizState.streak += 1;
        
        // Multiplicador por racha
        let multiplier = 1.0;
        if (quizState.streak >= 8) multiplier = 2.0;
        else if (quizState.streak >= 5) multiplier = 1.5;
        else if (quizState.streak >= 3) multiplier = 1.2;
        
        const basePoints = 100;
        const pts = Math.round(basePoints * multiplier);
        quizState.scoreGained += pts;
        
    } else {
        playSound('wrong');
        selectedBtn.classList.add("wrong");
        quizState.streak = 0;
        
        // Mostrar cuál era el botón correcto
        highlightCorrectOption(correctValue);
    }
    
    // Avanzar a la siguiente pregunta después de un breve delay
    setTimeout(() => {
        quizState.currentIndex += 1;
        showNextQuestion();
    }, 1500);
}

function handleTimeout() {
    if (quizState.isAnswering) return;
    quizState.isAnswering = true;
    
    const currentItem = quizState.questions[quizState.currentIndex];
    const correctValue = quizState.mode === 'code-to-name' ? currentItem.name : currentItem.code;
    
    playSound('wrong');
    quizState.streak = 0;
    
    quizState.logs.push({
        item: currentItem,
        correctValue: correctValue,
        userValue: "[Sin tiempo]",
        isCorrect: false,
        timedOut: true
    });
    
    highlightCorrectOption(correctValue);
    
    // Delay y avanzar
    setTimeout(() => {
        quizState.currentIndex += 1;
        showNextQuestion();
    }, 1500);
}

function highlightCorrectOption(correctValue) {
    const buttons = document.querySelectorAll(".quiz-opt-btn");
    buttons.forEach(b => {
        if (b.textContent === correctValue) {
            b.classList.add("correct");
        }
    });
}

function endQuiz() {
    if (quizState.timer) clearInterval(quizState.timer);
    
    // Guardar estadísticas en la Base de Datos
    const totalQuestions = quizState.questions.length;
    const accuracy = Math.round((quizState.correctCount / totalQuestions) * 100);
    
    // Llamar a la función correcta de database.js (updateUserStats)
    const updatedUser = updateUserStats(
        activeUser.username, 
        quizState.correctCount, 
        totalQuestions, 
        quizState.scoreGained,
        quizState.area 
    );
    activeUser = updatedUser;
    updateSidebarUserCard();
    
    // Renderizar resultados en pantalla
    document.getElementById("quiz-active-card").style.display = "none";
    document.getElementById("quiz-results-card").style.display = "block";
    
    // Modificar interfaz de resultados
    const scoreVal = document.getElementById("res-score");
    scoreVal.textContent = `+${quizState.scoreGained}`;
    document.getElementById("res-accuracy").textContent = `${accuracy}%`;
    document.getElementById("res-correct").textContent = `${quizState.correctCount}/${totalQuestions}`;
    
    const badge = document.getElementById("results-badge");
    const title = document.getElementById("results-title");
    const sub = document.getElementById("results-subtitle");
    
    if (accuracy === 100) {
        badge.textContent = "🏆";
        title.textContent = "¡Partida Perfecta!";
        sub.textContent = "¡Eres un experto total de códigos PLU!";
    } else if (accuracy >= 80) {
        badge.textContent = "🌟";
        title.textContent = "¡Excelente Desempeño!";
        sub.textContent = "Gran conocimiento del sistema del área.";
    } else if (accuracy >= 50) {
        badge.textContent = "👍";
        title.textContent = "¡Buen Intento!";
        sub.textContent = "Sigue practicando para afilar tu velocidad de respuesta.";
    } else {
        badge.textContent = "📚";
        title.textContent = "Sigue Estudiando";
        sub.textContent = "Te recomendamos revisar las Flashcards de esta categoría.";
    }
    
    // Renderizar el log de respuestas detallado
    const feedbackList = document.getElementById("quiz-feedback-list-container");
    feedbackList.innerHTML = "";
    
    quizState.logs.forEach(log => {
        const itemDiv = document.createElement("div");
        itemDiv.className = `feedback-item ${log.isCorrect ? 'correct' : 'wrong'}`;
        
        let feedbackDetails = "";
        if (log.isCorrect) {
            feedbackDetails = `Acierto: ${log.correctValue}`;
        } else if (log.timedOut) {
            feedbackDetails = `Se acabó el tiempo. Respuesta correcta: ${log.correctValue}`;
        } else {
            feedbackDetails = `Tu respuesta: "${log.userValue}". Correcta: "${log.correctValue}"`;
        }

        itemDiv.innerHTML = `
            <div class="feedback-left">
                <span class="feedback-emoji">${log.item.icon || '📦'}</span>
                <div>
                    <span class="feedback-name">${log.item.name} (PLU: ${log.item.code})</span>
                    <div class="feedback-details">${feedbackDetails}</div>
                </div>
            </div>
            <span class="feedback-badge">${log.isCorrect ? 'Correcto' : 'Error'}</span>
        `;
        feedbackList.appendChild(itemDiv);
    });
}

// ==========================================================================
// Ranking / Tabla de Posiciones
// ==========================================================================
function renderRankingAreaTabs() {
    const container = document.getElementById("ranking-area-filters");
    if (!container) return;
    container.innerHTML = "";
    
    // Botón "Todas"
    const allBtn = document.createElement("button");
    allBtn.className = `area-tab ${selectedRankingArea === 'todas' ? 'active' : ''}`;
    allBtn.textContent = "Global (Todas)";
    allBtn.onclick = () => {
        playSound('click');
        selectedRankingArea = 'todas';
        renderRanking();
    };
    container.appendChild(allBtn);
    
    // Áreas individuales
    const areas = getAreas();
    areas.forEach(a => {
        const btn = document.createElement("button");
        btn.className = `area-tab ${selectedRankingArea === a ? 'active' : ''}`;
        btn.textContent = a;
        btn.onclick = () => {
            playSound('click');
            selectedRankingArea = a;
            renderRanking();
        };
        container.appendChild(btn);
    });
}

// REFACTORIZADA: Implementación de filtros cruzados y botones dinámicos de tiendas
function renderRanking() {
    renderRankingAreaTabs();
    
    const allUsers = getUsers();
    const rankingBody = document.getElementById('ranking-table-body');
    const storeFiltersContainer = document.getElementById('ranking-store-filters');
    
    if (!rankingBody) return;

    // 1. CONTROLADOR DE FILTROS DINÁMICOS DE TIENDA
    if (storeFiltersContainer) {
        // Extraemos de forma única todas las tiendas registradas en la base de datos local
        const stores = ['todas', ...new Set(allUsers.map(u => u.store || 'General'))];
        
        storeFiltersContainer.innerHTML = '';
        stores.forEach(store => {
            const btn = document.createElement('button');
            const isActive = selectedRankingStore === store.toLowerCase();
            btn.className = `area-tab ${isActive ? 'active' : ''}`; // Reutiliza clases visuales existentes
            btn.textContent = store === 'todas' ? 'Todas las Tiendas' : store;
            
            btn.addEventListener('click', () => {
                playSound('click');
                selectedRankingStore = store.toLowerCase();
                renderRanking(); // Re-renderizar dinámicamente con filtros cruzados
            });
            storeFiltersContainer.appendChild(btn);
        });
    }

    // 2. APLICACIÓN DE FILTROS CRUZADOS (Área + Tienda)
    let filteredUsers = [...allUsers];

    // Filtro A: Por departamento (Área)
    if (selectedRankingArea !== 'todas') {
        filteredUsers = filteredUsers.filter(u => u.categoryScores && u.categoryScores[selectedRankingArea] > 0);
    }

    // Filtro B: Por Sucursal (Tienda)
    if (selectedRankingStore !== 'todas') {
        filteredUsers = filteredUsers.filter(u => (u.store || 'General').toLowerCase() === selectedRankingStore);
    }

    // 3. CRITERIO DE ORDENACIÓN (RANKING)
    filteredUsers.sort((a, b) => {
        if (selectedRankingArea !== 'todas') {
            const scoreA = a.categoryScores[selectedRankingArea] || 0;
            const scoreB = b.categoryScores[selectedRankingArea] || 0;
            return scoreB - scoreA;
        }
        return b.score - a.score;
    });

    const getScoreForDisplay = (user) => {
        if (selectedRankingArea === 'todas') return user.score;
        return (user.categoryScores && user.categoryScores[selectedRankingArea]) ? user.categoryScores[selectedRankingArea] : 0;
    };
    
    // 4. RENDERIZADO DEL PODIO (TOP 3) DEL UNIVERSO FILTRADO
    const podiumContainer = document.getElementById("podium-container");
    podiumContainer.innerHTML = "";
    
    // Configurar podio visual (orden tradicional: 2°, 1°, 3°)
    let podiumArray = [];
    if (filteredUsers[1]) podiumArray.push({ rank: 2, user: filteredUsers[1], cssClass: 'second-place' });
    if (filteredUsers[0]) podiumArray.push({ rank: 1, user: filteredUsers[0], cssClass: 'first-place' });
    if (filteredUsers[2]) podiumArray.push({ rank: 3, user: filteredUsers[2], cssClass: 'third-place' });
    
    podiumArray.sort((a, b) => {
        const order = [2, 1, 3];
        return order.indexOf(a.rank) - order.indexOf(b.rank);
    });

    if (podiumArray.length === 0) {
        podiumContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 20px;">No hay registros para este filtro de tienda.</div>';
    } else {
        podiumArray.forEach(p => {
            const card = document.createElement("div");
            card.className = `podium-card ${p.cssClass}`;
            
            let badgeIcon = "🥇";
            if (p.rank === 2) badgeIcon = "🥈";
            if (p.rank === 3) badgeIcon = "🥉";
            
            card.innerHTML = `
                <div class="podium-rank-num">${badgeIcon} ${p.rank}° Lugar</div>
                <div class="podium-avatar" style="${p.user.avatar && p.user.avatar.length > 10 ? `background-image: url('${p.user.avatar}'); background-size: cover; background-position: center; color: transparent;` : ''}">${p.user.avatar && p.user.avatar.length <= 10 ? p.user.avatar : ''}</div>
                <div class="podium-name">${p.user.username}</div>
                <div class="podium-score">${getScoreForDisplay(p.user)} pts</div>
                <div class="podium-meta">${p.user.totalQuizzes} exámenes | ${p.user.accuracy}% Precisión</div>
            `;
            podiumContainer.appendChild(card);
        });
    }
    
    // 5. TABLA DEL RESTO DE CLASIFICADOS (Posición 4 en adelante)
    const tableBody = document.getElementById("ranking-table-body");
    tableBody.innerHTML = "";
    
    const remainderUsers = filteredUsers.slice(3);
    if (remainderUsers.length === 0 && filteredUsers.length <= 3) {
        if (filteredUsers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">Sin asociados en la selección.</td></tr>';
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 20px;">No hay más competidores en la lista para esta sucursal.</td></tr>';
        }
    } else {
        remainderUsers.forEach((u, index) => {
            const realRank = index + 4;
            const tr = document.createElement("tr");
            
            // Resaltar al usuario activo en las filas secundarias
            if (activeUser && u.username === activeUser.username) {
                tr.classList.add('current-user-row');
            }

            tr.innerHTML = `
                <td><span class="rank-row-num">${realRank}</span></td>
                <td>
                    <div class="user-info-cell">
                        <div class="rank-collab-avatar" style="${u.avatar && u.avatar.length > 10 ? `background-image: url('${u.avatar}'); background-size: cover; background-position: center; color: transparent;` : ''}">${u.avatar && u.avatar.length <= 10 ? u.avatar : ''}</div>
                        <div class="user-name-meta">
                            <span class="user-name-text"><strong>${u.username}</strong></span>
                            <span class="user-store-tag">${u.store || 'General'}</span>
                        </div>
                    </div>
                </td>
                <td><span class="rank-row-badge">${u.level}</span></td>
                <td>${u.totalQuizzes}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 600;">${u.accuracy}%</span>
                        <div class="progress-bar-bg" style="width: 60px; height: 6px; margin: 0; display: inline-block;">
                            <div class="progress-bar-fill" style="width: ${u.accuracy}%; background: var(--secondary);"></div>
                        </div>
                    </div>
                </td>
                <td><span class="rank-row-score">${getScoreForDisplay(u)} pts</span></td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

// ==========================================================================
// Panel de Administración (Gestion de Datos)
// ==========================================================================
function switchAdminTab(tabId) {
    adminActiveTab = tabId;
    
    // Activar botón tab
    document.querySelectorAll(".admin-tab").forEach(tab => {
        if (tab.dataset.tab === tabId) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
    
    // Activar sub-vista
    document.querySelectorAll(".admin-sub-view").forEach(view => {
        view.classList.remove("active");
    });
    document.getElementById(`tab-${tabId}`).classList.add("active");
    
    if (tabId === 'plu-list') {
        renderAdminPLUTable();
    } else if (tabId === 'area-list') {
        renderAdminAreaTable();
    }
}

function renderAdminPLUTable() {
    const searchQuery = document.getElementById("admin-search-plu").value.toLowerCase();
    const areaFilter = document.getElementById("admin-filter-area").value;
    const plus = getPLUs();
    
    const filtered = plus.filter(p => {
        const matchArea = areaFilter === 'todas' || p.area === areaFilter;
        const matchQuery = p.name.toLowerCase().includes(searchQuery) || p.code.includes(searchQuery);
        return matchArea && matchQuery;
    });

    const tbody = document.getElementById("admin-plu-table-body");
    tbody.innerHTML = "";
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 30px;">No hay artículos registrados con estas condiciones.</td></tr>';
        return;
    }

    filtered.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><span class="admin-table-icon">${p.icon || '📦'}</span></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="rank-row-badge" style="font-size: 0.95rem; font-family: monospace;">${p.code}</span></td>
            <td><span style="color: var(--text-muted); font-size: 0.9rem;">${p.area}</span></td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="action-icon-btn edit-btn" onclick="openEditPluModal('${p.id}')" title="Editar">✏️</button>
                    <button class="action-icon-btn delete-btn" onclick="deletePluItem('${p.id}')" title="Eliminar">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAdminAreaTable() {
    const areas = getAreas();
    const plus = getPLUs();
    const tbody = document.getElementById("admin-area-table-body");
    tbody.innerHTML = "";
    
    areas.forEach(a => {
        const count = plus.filter(p => p.area === a).length;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${a}</strong></td>
            <td><span class="rank-row-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);">${count} artículos</span></td>
            <td>
                <button class="action-icon-btn delete-btn" onclick="deleteArea('${a}')" title="Eliminar Departamento">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Agregar o editar artículo (Modal Control)
function openAddPluModal() {
    playSound('click');
    currentEditingPluId = null;
    document.getElementById("plu-modal-title").textContent = "Agregar Nuevo Artículo";
    document.getElementById("plu-edit-form").reset();
    document.getElementById("edit-plu-id").value = "";
    
    populateAreaSelects();
    document.getElementById("plu-form-modal").style.display = "flex";
}

function openEditPluModal(id) {
    playSound('click');
    currentEditingPluId = id;
    document.getElementById("plu-modal-title").textContent = "Editar Artículo PLU";
    
    const plus = getPLUs();
    const item = plus.find(p => p.id === id);
    if (!item) return;
    
    document.getElementById("edit-plu-id").value = item.id;
    document.getElementById("plu-emoji").value = item.icon || "";
    document.getElementById("plu-name").value = item.name;
    document.getElementById("plu-code").value = item.code;
    
    populateAreaSelects();
    document.getElementById("plu-area").value = item.area;
    
    document.getElementById("plu-form-modal").style.display = "flex";
}

function closePluModal() {
    playSound('click');
    document.getElementById("plu-form-modal").style.display = "none";
}

function savePluFormSubmit() {
    playSound('click');
    const id = document.getElementById("edit-plu-id").value;
    const icon = document.getElementById("plu-emoji").value.trim();
    const name = document.getElementById("plu-name").value.trim();
    const code = document.getElementById("plu-code").value.trim();
    const area = document.getElementById("plu-area").value;
    
    let plus = getPLUs();
    
    // Validar código repetido (excepto si estamos editando el mismo artículo)
    const codeDuplicate = plus.some(p => p.code === code && p.id !== id);
    if (codeDuplicate) {
        alert(`Error: Ya existe un artículo con el código PLU "${code}".`);
        return;
    }
    
    if (id) {
        // Modo Edición
        plus = plus.map(p => {
            if (p.id === id) {
                return { ...p, icon, name, code, area };
            }
            return p;
        });
    } else {
        // Modo Creación
        const newItem = {
            id: 'item_' + Date.now(),
            icon,
            name,
            code,
            area
        };
        plus.push(newItem);
    }
    
    savePLUs(plus);
    closePluModal();
    renderAdminPLUTable();
}

function deletePluItem(id) {
    const item = getPLUs().find(p => p.id === id);
    if (!item) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar el artículo "${item.name}" del sistema?`)) {
        playSound('wrong');
        let plus = getPLUs();
        plus = plus.filter(p => p.id !== id);
        savePLUs(plus);
        renderAdminPLUTable();
    }
}

// Control de Áreas/Departamentos
function addNewArea() {
    playSound('click');
    const input = document.getElementById("new-area-name");
    const name = input.value.trim();
    
    if (!name) {
        alert("Ingresa un nombre de departamento válido.");
        return;
    }
    
    const areas = getAreas();
    if (areas.some(a => a.toLowerCase() === name.toLowerCase())) {
        alert("Este departamento ya existe.");
        return;
    }
    
    areas.push(name);
    saveAreas(areas);
    input.value = "";
    renderAdminAreaTable();
    populateAreaSelects();
}

function deleteArea(areaName) {
    if (confirm(`¿Eliminar el departamento "${areaName}"? Los artículos dentro de esta categoría NO se eliminarán, pero se quedarán sin área asignada. Te recomendamos editarlos.`)) {
        playSound('wrong');
        let areas = getAreas();
        areas = areas.filter(a => a !== areaName);
        saveAreas(areas);
        renderAdminAreaTable();
        populateAreaSelects();
    }
}

// Danger Zone Resets
function resetDatabaseToDefault() {
    if (confirm("¿Estás absolutamente seguro de que deseas restablecer los PLUs predeterminados? Se perderán todos tus cambios de artículos y áreas personalizadas.")) {
        playSound('wrong');
        localStorage.removeItem("plu_academy_plus");
        localStorage.removeItem("plu_academy_areas");
        initDatabase();
        populateAreaSelects();
        renderAdminPLUTable();
        renderAdminAreaTable();
        alert("Base de datos de PLUs reiniciada con éxito.");
    }
}

function resetUsersToDefault() {
    playSound('click');
    if (confirm("¿Estás absolutamente seguro de que deseas borrar los registros de todos los asociados del equipo? Esto borrará puntajes, rachas e historiales.")) {
        playSound('wrong');
        localStorage.removeItem("plu_academy_users");
        localStorage.removeItem("plu_academy_active_user");
        initDatabase();
        activeUser = null;
        updateSidebarUserCard();
        openUserModal();
        alert("Ranking y usuarios reiniciados con éxito.");
    }
}