// Base de Datos inicial de PLU y gestión de almacenamiento local

const DEFAULT_AREAS = [
    "Carnes",
    "Frutas y Verduras",
    "Panaderia"
];

const DEFAULT_PLUS = [
    // ===================== CARNES (61 items) =====================
    { id: "m1", code: "9644", name: "MUSLO PIERNA FRESCO", area: "Carnes", icon: "🥩" },
    { id: "m2", code: "9640", name: "FILETE PECHUGA INDIO", area: "Carnes", icon: "🥩" },
    { id: "m3", code: "9493", name: "PECHUGA DE POLLO INDIO", area: "Carnes", icon: "🥩" },
    { id: "m4", code: "9492", name: "CARNE MOLIDA POLLO", area: "Carnes", icon: "🥩" },
    { id: "m5", code: "9333", name: "SE PIERNA CON PIEL", area: "Carnes", icon: "🥩" },
    { id: "m6", code: "9283", name: "ALAS DE POLLO", area: "Carnes", icon: "🥩" },
    { id: "m7", code: "9276", name: "MUSLO CONGLADO LOCAL PI", area: "Carnes", icon: "🥩" },
    { id: "m8", code: "9269", name: "MOLLEJAS E HIGADO", area: "Carnes", icon: "🥩" },
    { id: "m9", code: "9141", name: "MUSLO SIN PIEL FRESCO", area: "Carnes", icon: "🥩" },
    { id: "m10", code: "9099", name: "CHORIZO ARGENTINO AS", area: "Carnes", icon: "🥩" },
    { id: "m11", code: "9096", name: "PECHUG POLLO AMERICANA", area: "Carnes", icon: "🥩" },
    { id: "m12", code: "9077", name: "PIERNITA AMERICANA", area: "Carnes", icon: "🥩" },
    { id: "m13", code: "9070", name: "PATAS Y PESCUEZOS", area: "Carnes", icon: "🥩" },
    { id: "m14", code: "9002", name: "POLLO INDIO ENTERO", area: "Carnes", icon: "🥩" },
    { id: "m15", code: "8935", name: "DC FILETE AL AJO", area: "Carnes", icon: "🥩" },
    { id: "m16", code: "8080", name: "MUSLO AMERICANO CONGELADO", area: "Carnes", icon: "🥩" },
    { id: "m17", code: "8071", name: "PIERNITA DE POLLO DESHUESADA", area: "Carnes", icon: "🥩" },
    { id: "m18", code: "8043", name: "CHORIZO CRIOLLO LB", area: "Carnes", icon: "🥩" },
    { id: "m19", code: "8037", name: "CHORIZO PICANTE LB", area: "Carnes", icon: "🥩" },
    { id: "m20", code: "2626", name: "CHURRASQUITO DE RES AS", area: "Carnes", icon: "🥩" },
    { id: "m21", code: "2620", name: "HUESO RES BOLSA 3LB", area: "Carnes", icon: "🥩" },
    { id: "m22", code: "2448", name: "CARNE PARA SALPICON", area: "Carnes", icon: "🥩" },
    { id: "m23", code: "2358", name: "CARNE SALADA AS", area: "Carnes", icon: "🥩" },
    { id: "m24", code: "2324", name: "MOLIDA ESPESCIAL AS", area: "Carnes", icon: "🥩" },
    { id: "m25", code: "2322", name: "MOLIDA SUPER ESPECIAL AS", area: "Carnes", icon: "🥩" },
    { id: "m26", code: "2274", name: "BT SOLOMO", area: "Carnes", icon: "🥩" },
    { id: "m27", code: "2236", name: "BISTEC CRIOLLO AS", area: "Carnes", icon: "🥩" },
    { id: "m28", code: "2235", name: "CHURRASQUITO DE RES AS", area: "Carnes", icon: "🥩" },
    { id: "m29", code: "2234", name: "CARNITAS DE RES JALAPENO AS", area: "Carnes", icon: "🥩" },
    { id: "m30", code: "2233", name: "MOLIDA CONDIMENTADA AS", area: "Carnes", icon: "🥩" },
    { id: "m31", code: "2212", name: "COSTILLA RIBLETS BBQ", area: "Carnes", icon: "🥩" },
    { id: "m32", code: "2190", name: "CARNE CERDO JALAPENA AS", area: "Carnes", icon: "🥩" },
    { id: "m33", code: "2140", name: "BT LOMO PACHO", area: "Carnes", icon: "🥩" },
    { id: "m34", code: "2131", name: "BT CARNE A PARRILLA", area: "Carnes", icon: "🥩" },
    { id: "m35", code: "2049", name: "BT POSTA CHOQUEZUELA", area: "Carnes", icon: "🥩" },
    { id: "m36", code: "2010", name: "BT POSTA NEGRA", area: "Carnes", icon: "🥩" },
    { id: "m37", code: "1863", name: "CARNITA RES JALAPENA LB", area: "Carnes", icon: "🥩" },
    { id: "m38", code: "1770", name: "BISTEC CRIOLLO LB", area: "Carnes", icon: "🥩" },
    { id: "m39", code: "1682", name: "CHULETA REDONDA", area: "Carnes", icon: "🥩" },
    { id: "m40", code: "1680", name: "BT POSTA ANGELINA", area: "Carnes", icon: "🥩" },
    { id: "m41", code: "1678", name: "COSTILLA ALTA", area: "Carnes", icon: "🥩" },
    { id: "m42", code: "1671", name: "HUESO DE YUGO", area: "Carnes", icon: "🥩" },
    { id: "m43", code: "1632", name: "HUESO DE RES CORRIENTE", area: "Carnes", icon: "🥩" },
    { id: "m44", code: "1623", name: "MOLIDA ESPECIAL LB", area: "Carnes", icon: "🥩" },
    { id: "m45", code: "1622", name: "MOLID SUPER ESPECIAL LB", area: "Carnes", icon: "🥩" },
    { id: "m46", code: "1621", name: "MOLID EXTRAFINA LB", area: "Carnes", icon: "🥩" },
    { id: "m47", code: "1381", name: "CHULETA DE RES", area: "Carnes", icon: "🥩" },
    { id: "m48", code: "1235", name: "COSTILLA RIBLETS", area: "Carnes", icon: "🥩" },
    { id: "m49", code: "1219", name: "COSTILLA PORCIONADA", area: "Carnes", icon: "🥩" },
    { id: "m50", code: "1190", name: "CARNE MOLIDA POPULAR", area: "Carnes", icon: "🥩" },
    { id: "m51", code: "1131", name: "COSTILLA CRIOLLA", area: "Carnes", icon: "🥩" },
    { id: "m52", code: "1101", name: "CHULETA DE CERDO CRIOLLA", area: "Carnes", icon: "🥩" },
    { id: "m53", code: "1078", name: "BISTEC LOMO CERDO", area: "Carnes", icon: "🥩" },
    { id: "m54", code: "1075", name: "HUESO DE CERDO", area: "Carnes", icon: "🥩" },
    { id: "m55", code: "1068", name: "CARNITAS DE CERDO JALAPENA LB", area: "Carnes", icon: "🥩" },
    { id: "m56", code: "1052", name: "CHULETA CERDO IMPORTADA", area: "Carnes", icon: "🥩" },
    { id: "m57", code: "1047", name: "BISTEC POSTA CERDO", area: "Carnes", icon: "🥩" },
    { id: "m58", code: "1037", name: "HUESO DE RES ESPECIAL", area: "Carnes", icon: "🥩" },
    { id: "m59", code: "1019", name: "DESHILAR SUAVIZADA", area: "Carnes", icon: "🥩" },
    { id: "m60", code: "1006", name: "GUISAR TROCITOS SUAVIZADA", area: "Carnes", icon: "🥩" },
    { id: "m61", code: "1000", name: "CARNITAS PARA CHICHARRON", area: "Carnes", icon: "🥩" },

    // ===================== PANADERIA (41 items) =====================
    { id: "p1", code: "266", name: "UND SALPOR/ ALMIDON", area: "Panaderia", icon: "🍞" },
    { id: "p2", code: "285", name: "PAN CROISSANNT UND", area: "Panaderia", icon: "🥐" },
    { id: "p3", code: "323", name: "PAN PIRUJO CON AJONJOLI", area: "Panaderia", icon: "🍞" },
    { id: "p4", code: "265", name: "UND SALPOR/ ARROZ", area: "Panaderia", icon: "🍞" },
    { id: "p5", code: "280", name: "MARGARITA UND", area: "Panaderia", icon: "🍞" },
    { id: "p6", code: "317", name: "SANTANECA UND", area: "Panaderia", icon: "🍞" },
    { id: "p7", code: "319", name: "GALLETA DE COCO UND", area: "Panaderia", icon: "🍪" },
    { id: "p8", code: "363", name: "GALLETA DE CHOCHIPS", area: "Panaderia", icon: "🍪" },
    { id: "p9", code: "190", name: "GUSANITO DULCE UND", area: "Panaderia", icon: "🍞" },
    { id: "p10", code: "209", name: "MUFFIN DECORADO UND UND", area: "Panaderia", icon: "🧁" },
    { id: "p11", code: "151", name: "GALLETA CON AVENA", area: "Panaderia", icon: "🍪" },
    { id: "p12", code: "453", name: "PICUDA", area: "Panaderia", icon: "🍞" },
    { id: "p13", code: "593", name: "TORTA SECA", area: "Panaderia", icon: "🍰" },
    { id: "p14", code: "596", name: "PAN CONCHA DE VAINILLA", area: "Panaderia", icon: "🍞" },
    { id: "p15", code: "600", name: "PANQUESITO ALMENDRA", area: "Panaderia", icon: "🧁" },
    { id: "p16", code: "615", name: "CARCAN GALLETA", area: "Panaderia", icon: "🍪" },
    { id: "p17", code: "618", name: "PIRUJO", area: "Panaderia", icon: "🍞" },
    { id: "p18", code: "625", name: "SEMITA ALTA UND", area: "Panaderia", icon: "🍞" },
    { id: "p19", code: "627", name: "PAN PEPERECHA UND", area: "Panaderia", icon: "🍞" },
    { id: "p20", code: "637", name: "MUFFIN CHOCOLATE UND UN", area: "Panaderia", icon: "🧁" },
    { id: "p21", code: "638", name: "MUFFIN VAINILLLA UND UN", area: "Panaderia", icon: "🧁" },
    { id: "p22", code: "718", name: "CARACOL DANES CCREMA UN", area: "Panaderia", icon: "🍰" },
    { id: "p23", code: "717", name: "TRENZA DANES CCREMA UN", area: "Panaderia", icon: "🍰" },
    { id: "p24", code: "295", name: "COFF CAK FRESA CREMA", area: "Panaderia", icon: "🍰" },
    { id: "p25", code: "337", name: "POSTRE 3 LECHES DOMO", area: "Panaderia", icon: "🍰" },
    { id: "p26", code: "352", name: "POSTRE TRES LECHES", area: "Panaderia", icon: "🍰" },
    { id: "p27", code: "416", name: "BRAZ GITAN AMBIE UND", area: "Panaderia", icon: "🍰" },
    { id: "p28", code: "159", name: "MIGA DE PAN LB", area: "Panaderia", icon: "🍞" },
    { id: "p29", code: "7108", name: "VIEJITAS 5 UND", area: "Panaderia", icon: "🍪" },
    { id: "p30", code: "119", name: "COFFE CAKE PINA FRESA", area: "Panaderia", icon: "🍰" },
    { id: "p31", code: "6978", name: "DOMINO 3 UND", area: "Panaderia", icon: "🍰" },
    { id: "p32", code: "3854", name: "MAGDALENA VAINILLA UND", area: "Panaderia", icon: "🧁" },
    { id: "p33", code: "3858", name: "MINIMAGDA VAINILLA UND", area: "Panaderia", icon: "🧁" },
    { id: "p34", code: "3859", name: "VIEJITA UND UN", area: "Panaderia", icon: "🍪" },
    { id: "p35", code: "3860", name: "MINIMAGDA ALMENDRA UN", area: "Panaderia", icon: "🧁" },
    { id: "p36", code: "3863", name: "PANQUE PASAS UN", area: "Panaderia", icon: "🍞" },
    { id: "p37", code: "3864", name: "PANQUE VAINILLA UND UN", area: "Panaderia", icon: "🍞" },
    { id: "p38", code: "3870", name: "PANQUE DE FRUTAS UND", area: "Panaderia", icon: "🍞" },
    { id: "p39", code: "3866", name: "PASTEL BA FRUT OCHOC UND", area: "Panaderia", icon: "🍰" },
    { id: "p40", code: "228", name: "PAN TIPO BAGUETTE CR UNIDAD", area: "Panaderia", icon: "🥖" },
    { id: "p41", code: "9010", name: "DOMO MARIA LUISA", area: "Panaderia", icon: "🍰" },

    // ===================== FRUTAS Y VERDURAS (57 items) =====================
    { id: "f1", code: "4227", name: "AGUACATE CRIOLLO UND", area: "Frutas y Verduras", icon: "🥑" },
    { id: "f2", code: "7496", name: "AGUACATE HASS UN", area: "Frutas y Verduras", icon: "🥑" },
    { id: "f3", code: "7013", name: "APIO 454 G LB", area: "Frutas y Verduras", icon: "🥬" },
    { id: "f4", code: "4789", name: "AYOTE SASON UND", area: "Frutas y Verduras", icon: "🥔" },
    { id: "f5", code: "9543", name: "AYOTE TIERNO UND", area: "Frutas y Verduras", icon: "🥔" },
    { id: "f6", code: "4186", name: "BANANO 454 G LB", area: "Frutas y Verduras", icon: "🍌" },
    { id: "f7", code: "7426", name: "BERENJENA CRIOLLA Und", area: "Frutas y Verduras", icon: "🍆" },
    { id: "f8", code: "7341", name: "BROCOLI 454 G LB", area: "Frutas y Verduras", icon: "🥦" },
    { id: "f9", code: "7422", name: "CAMOTE ROJO454 G LB", area: "Frutas y Verduras", icon: "🍠" },
    { id: "f10", code: "4663", name: "CEBOLLA BLANCA 454 G LB", area: "Frutas y Verduras", icon: "🧅" },
    { id: "f11", code: "9550", name: "CEBOLLA MORADA 454 G LB", area: "Frutas y Verduras", icon: "🧅" },
    { id: "f12", code: "4715", name: "CHILE DE COLOR 454 G LB", area: "Frutas y Verduras", icon: "🌶️" },
    { id: "f13", code: "7358", name: "CHILE JALAPENO 454 G LB", area: "Frutas y Verduras", icon: "🌶️" },
    { id: "f14", code: "4687", name: "CHILE VERDE UND", area: "Frutas y Verduras", icon: "🌶️" },
    { id: "f15", code: "8575", name: "CIRUELA 454 G LB", area: "Frutas y Verduras", icon: "🍇" },
    { id: "f16", code: "7348", name: "COLIFLOR 454 G LB", area: "Frutas y Verduras", icon: "🥦" },
    { id: "f17", code: "7557", name: "ESCAROLA AMARILLA UND", area: "Frutas y Verduras", icon: "🥬" },
    { id: "f18", code: "4299", name: "GUAYABA 454 G LB", area: "Frutas y Verduras", icon: "🍈" },
    { id: "f19", code: "7349", name: "GUAYABA IMPORTADA UND", area: "Frutas y Verduras", icon: "🍈" },
    { id: "f20", code: "7641", name: "GUISQUIL CRIOLLO UND", area: "Frutas y Verduras", icon: "🥒" },
    { id: "f21", code: "7555", name: "HF PAPAYA UND", area: "Frutas y Verduras", icon: "🍈" },
    { id: "f22", code: "4612", name: "JENGIBRE FRESC 454 G LB", area: "Frutas y Verduras", icon: "🫚" },
    { id: "f23", code: "4301", name: "KIWI UND", area: "Frutas y Verduras", icon: "🥝" },
    { id: "f24", code: "7361", name: "LECHUGA ARRE 454 G LB", area: "Frutas y Verduras", icon: "🥬" },
    { id: "f25", code: "7643", name: "LECHUGA ROMANA UND", area: "Frutas y Verduras", icon: "🥬" },
    { id: "f26", code: "7347", name: "LIMON PERSICO UND", area: "Frutas y Verduras", icon: "🍋" },
    { id: "f27", code: "3383", name: "MANDARINA CLEM 454 G LB", area: "Frutas y Verduras", icon: "🍊" },
    { id: "f28", code: "4055", name: "MANDARINA UND", area: "Frutas y Verduras", icon: "🍊" },
    { id: "f29", code: "7549", name: "MANGO PANADES 454 G LB", area: "Frutas y Verduras", icon: "🥭" },
    { id: "f30", code: "3591", name: "MANGO SUL UND", area: "Frutas y Verduras", icon: "🥭" },
    { id: "f31", code: "4315", name: "MANGO TOMMY 454 G LB", area: "Frutas y Verduras", icon: "🥭" },
    { id: "f32", code: "4132", name: "MANZANA GALA UND UND", area: "Frutas y Verduras", icon: "🍎" },
    { id: "f33", code: "7501", name: "MANZANA ROJA GRAN UN", area: "Frutas y Verduras", icon: "🍎" },
    { id: "f34", code: "7342", name: "MANZANA VERDE UND", area: "Frutas y Verduras", icon: "🍏" },
    { id: "f35", code: "4038", name: "MELOCOTONES 454 G LB", area: "Frutas y Verduras", icon: "🍑" },
    { id: "f36", code: "4050", name: "MELON CANTALOUPE UND", area: "Frutas y Verduras", icon: "🍈" },
    { id: "f37", code: "4552", name: "MELON HONEY DAW UND", area: "Frutas y Verduras", icon: "🍈" },
    { id: "f38", code: "4392", name: "NARANJA UND", area: "Frutas y Verduras", icon: "🍊" },
    { id: "f39", code: "7639", name: "NARANJA WASHIN 454 G LB", area: "Frutas y Verduras", icon: "🍊" },
    { id: "f40", code: "4072", name: "PAPA AMERICANA 454 G LB", area: "Frutas y Verduras", icon: "🥔" },
    { id: "f41", code: "4728", name: "PAPA SOLOMA 454 G LB", area: "Frutas y Verduras", icon: "🥔" },
    { id: "f42", code: "4596", name: "PEPINILLO TIER 454 G LB", area: "Frutas y Verduras", icon: "🥒" },
    { id: "f43", code: "7430", name: "PEPINO UND UND", area: "Frutas y Verduras", icon: "🥒" },
    { id: "f44", code: "4412", name: "PERA BOSC 454 G LB", area: "Frutas y Verduras", icon: "🍐" },
    { id: "f45", code: "7369", name: "PERA ROJA 454 G LB", area: "Frutas y Verduras", icon: "🍐" },
    { id: "f46", code: "7083", name: "PERA VERDE UND", area: "Frutas y Verduras", icon: "🍐" },
    { id: "f47", code: "9571", name: "PINA SIN CORONA", area: "Frutas y Verduras", icon: "🍍" },
    { id: "f48", code: "5800", name: "PITAHAYA 454 G LB", area: "Frutas y Verduras", icon: "🍈" },
    { id: "f49", code: "7354", name: "PLATANO 454 G LB", area: "Frutas y Verduras", icon: "🍌" },
    { id: "f50", code: "7847", name: "REPOLLO BLANCO UND", area: "Frutas y Verduras", icon: "🥬" },
    { id: "f51", code: "4344", name: "SANDIA LARGA UND", area: "Frutas y Verduras", icon: "🍉" },
    { id: "f52", code: "7350", name: "SANDIA REDONDA MEDIA UND", area: "Frutas y Verduras", icon: "🍉" },
    { id: "f53", code: "4664", name: "TOMATE COCINA 454 G LB", area: "Frutas y Verduras", icon: "🍅" },
    { id: "f54", code: "7480", name: "TOMATE ENSA GR 454 G LB", area: "Frutas y Verduras", icon: "🍅" },
    { id: "f55", code: "4636", name: "UVA RED GLOBE 454 G LB", area: "Frutas y Verduras", icon: "🍇" },
    { id: "f56", code: "7359", name: "UVA VERDE 454 G LB", area: "Frutas y Verduras", icon: "🍇" },
    { id: "f57", code: "7439", name: "YUCA VALENCIA 454 G LB", area: "Frutas y Verduras", icon: "🥔" },
    { id: "f58", code: "7419", name: "ZANAHORIA 454 G LB", area: "Frutas y Verduras", icon: "🥕" },
    { id: "f59", code: "9552", name: "ZUCCINI VERDE 454 G 1LB", area: "Frutas y Verduras", icon: "🥒" }
];

const DEFAULT_USERS = [
    { username: "Andres", password: "1234", badgeNumber: "1001", avatar: "⚡", store: "Matriz", score: 0, totalQuizzes: 0, accuracy: 0, streak: 0, level: "Principiante", categoryScores: {} }
];

function initDatabase() {
    // Migración a versión 5 (añadir store)
    const currentVersion = localStorage.getItem("plu_academy_db_ver");
    if (currentVersion !== "v5") {
        let users = JSON.parse(localStorage.getItem("plu_academy_users"));
        if (!users || users.length === 0) {
            users = DEFAULT_USERS;
        } else {
            users = users.map(u => ({
                ...u,
                badgeNumber: u.badgeNumber || (u.username.toLowerCase() === "andres" ? "1001" : "10" + Math.floor(Math.random() * 90 + 10)),
                avatar: u.avatar || (u.username.toLowerCase() === "andres" ? "⚡" : "👤"),
                store: u.store || "Sin Asignar",
                categoryScores: u.categoryScores || {}
            }));
        }
        localStorage.setItem("plu_academy_users", JSON.stringify(users));
        localStorage.removeItem("plu_academy_active_user"); // Forzar re-login para refrescar sesión
        localStorage.setItem("plu_academy_db_ver", "v5");
    }

    // Siempre cargar PLUs por defecto para garantizar datos limpios
    localStorage.setItem("plu_academy_plus", JSON.stringify(DEFAULT_PLUS));
    localStorage.setItem("plu_academy_areas", JSON.stringify(DEFAULT_AREAS));

    if (!localStorage.getItem("plu_academy_users")) {
        localStorage.setItem("plu_academy_users", JSON.stringify(DEFAULT_USERS));
    }
}

initDatabase();

// Métodos de acceso para PLUs
function getPLUs() {
    return JSON.parse(localStorage.getItem("plu_academy_plus"));
}

function savePLUs(plus) {
    localStorage.setItem("plu_academy_plus", JSON.stringify(plus));
}

// Métodos de acceso para Áreas
function getAreas() {
    return JSON.parse(localStorage.getItem("plu_academy_areas"));
}

function saveAreas(areas) {
    localStorage.setItem("plu_academy_areas", JSON.stringify(areas));
}

// Métodos de acceso para Usuarios
function getUsers() {
    const users = JSON.parse(localStorage.getItem("plu_academy_users"));
    return users.sort((a, b) => b.score - a.score); // Ordenar por puntaje (Ranking)
}

function saveUsers(users) {
    localStorage.setItem("plu_academy_users", JSON.stringify(users));
}

function getActiveUser() {
    const active = localStorage.getItem("plu_academy_active_user");
    return active ? JSON.parse(active) : null;
}

function setActiveUser(user) {
    if (user) {
        localStorage.setItem("plu_academy_active_user", JSON.stringify(user));
    } else {
        localStorage.removeItem("plu_academy_active_user");
    }
}

// Calcular Nivel según puntuación
function calculateLevel(score) {
    if (score >= 1200) return "Maestro PLU";
    if (score >= 800) return "Cajero Senior";
    if (score >= 400) return "Cajero Junior";
    return "Principiante";
}

// Actualizar puntuación e historial
function updateUserStats(username, correctAnswers, totalQuestions, scoreGained, area) {
    const users = getUsers();
    let userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    
    let user;
    if (userIndex === -1) {
        // Crear usuario si no existe
        user = {
            username: username,
            score: 0,
            totalQuizzes: 0,
            accuracy: 0,
            streak: 0,
            level: "Principiante",
            categoryScores: {}
        };
        users.push(user);
        userIndex = users.length - 1;
    } else {
        user = users[userIndex];
    }
    
    if (!user.categoryScores) user.categoryScores = {};

    // Actualizar campos
    user.totalQuizzes += 1;
    user.score = Math.max(0, user.score + scoreGained);
    
    if (area && area !== 'todas') {
        user.categoryScores[area] = (user.categoryScores[area] || 0) + scoreGained;
    }
    
    // Recalcular precisión promedio
    const newAccuracy = Math.round((correctAnswers / totalQuestions) * 100);
    if (user.accuracy === 0) {
        user.accuracy = newAccuracy;
    } else {
        user.accuracy = Math.round((user.accuracy * (user.totalQuizzes - 1) + newAccuracy) / user.totalQuizzes);
    }

    // Racha actual (en base a este quiz o lógica simple)
    if (newAccuracy >= 80) {
        user.streak += 1;
    } else {
        user.streak = 0;
    }

    user.level = calculateLevel(user.score);
    
    // Guardar cambios
    saveUsers(users);
    
    // Actualizar usuario activo si es el mismo
    const active = getActiveUser();
    if (active && active.username.toLowerCase() === username.toLowerCase()) {
        setActiveUser(user);
    }
    
    return user;
}
