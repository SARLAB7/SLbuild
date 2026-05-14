// js/ui.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// js/ui.js
export function activarNavegacionPill() {
    const navGroups = document.querySelectorAll('.nav-group');
    const subItems = document.querySelectorAll('.sub-item');
    const sections = document.querySelectorAll('.content-section');

    // 1. Manejar clics en los Temas Principales (Acordeón con Toggle)
    navGroups.forEach(group => {
        group.querySelector('.topic-header').addEventListener('click', () => {
            // Verificamos si el grupo que acabamos de tocar ya estaba abierto
            const estabaAbierto = group.classList.contains('active');

            // 1. Cerramos todos los grupos por precaución
            navGroups.forEach(g => g.classList.remove('active'));

            // 2. Si NO estaba abierto, lo abrimos
            if (!estabaAbierto) {
                group.classList.add('active');
                
                // Auto-seleccionar la primera subsección del grupo al abrir
                const firstSub = group.querySelector('.sub-item');
                if (firstSub) firstSub.click();
            }
            // (Si ya estaba abierto, se queda cerrado gracias al paso 1)
        });
    });

    // 2. Manejar clics en las Subsecciones (Queda igual)
    subItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); 

            subItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-section');
            sections.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active-section');
            });
            
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.style.display = 'block';
                setTimeout(() => targetSec.classList.add('active-section'), 10);
            }
        });
    });
// --- NUEVA LÓGICA PARA LOGOUT ---
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            // Animación opcional: desvanecer la pantalla antes de salir
            document.body.style.opacity = '0.5';
            
            signOut(auth).then(() => {
                console.log("Sesión terminada en SACLAB");
                window.location.href = 'index.html'; // Regresa al login
            }).catch((error) => {
                console.error("Error al cerrar sesión:", error);
                document.body.style.opacity = '1';
            });
        };
    }

    // Abrir "Finanzas" por defecto
    if (navGroups.length > 0 && !document.querySelector('.nav-group.active')) {
        navGroups[0].querySelector('.topic-header').click();
    }
}
// Función para mostrar notificaciones personalizadas
export function showToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    // Icono según el tipo (usando tus nuevos Material Symbols)
    const icon = tipo === 'error' ? 'report' : (tipo === 'success' ? 'check_circle' : 'info');
    
    toast.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <span>${mensaje}</span>
    `;

    container.appendChild(toast);

    // Eliminar automáticamente después de 4 segundos
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

export function configurarAvatar(user) {
    const avatarContent = document.getElementById('avatar-content');
    const avatarContainer = document.getElementById('user-avatar');
    const selector = document.getElementById('avatar-selector');

    // 1. Mostrar iniciales por defecto desde Firebase
    if (user && user.displayName) {
        const nombres = user.displayName.split(" ");
        const iniciales = nombres.map(n => n[0]).join("").toUpperCase().substring(0, 2);
        avatarContent.innerText = iniciales;
    }

    // 2. Toggle del menú
    avatarContainer.onclick = (e) => {
        e.stopPropagation(); // Evita que el click se propague al documento
        selector.style.display = selector.style.display === 'block' ? 'none' : 'block';
    };

    // 3. Selección de icono o volver a iniciales
    document.querySelectorAll('.sel-icon').forEach(icon => {
        icon.onclick = (e) => {
            const type = e.target.dataset.type;
            
            if (type === 'icon') {
                avatarContent.style.fontFamily = "'Material Symbols Outlined'"; // Forzar fuente de iconos
                avatarContent.classList.add('material-symbols-outlined');
                avatarContent.innerText = e.target.innerText;
            } else {
                avatarContent.style.fontFamily = "var(--font-main)"; // Volver a fuente de texto
                avatarContent.classList.remove('material-symbols-outlined');
                
                // Re-ejecutar lógica de iniciales
                const nombres = (user && user.displayName) ? user.displayName.split(" ") : ["User"];
                avatarContent.innerText = nombres.map(n => n[0]).join("").toUpperCase().substring(0, 2);
            }
            
            selector.style.display = 'none'; // Cerrar el menú tras elegir
        };
    });

    // 4. Cerrar si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!avatarContainer.contains(e.target) && !selector.contains(e.target)) {
            selector.style.display = 'none';
        }
    });
}

    // Cerrar si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!avatarContainer.contains(e.target) && !selector.contains(e.target)) {
            selector.style.display = 'none';
        }
    });
}
