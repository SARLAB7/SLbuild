// js/ui.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* =========================================
   1. NAVEGACIÓN PRINCIPAL (Pill Navigation)
   ========================================= */
export function activarNavegacionPill() {
    const navGroups = document.querySelectorAll('.nav-group');
    const subItems = document.querySelectorAll('.sub-item');
    const sections = document.querySelectorAll('.content-section');

    navGroups.forEach(group => {
        group.querySelector('.topic-header').addEventListener('click', () => {
            const estabaAbierto = group.classList.contains('active');
            navGroups.forEach(g => g.classList.remove('active'));

            if (!estabaAbierto) {
                group.classList.add('active');
                const firstSub = group.querySelector('.sub-item');
                if (firstSub) firstSub.click();
            }
        });
    });

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

    // Lógica de Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            document.body.style.opacity = '0.5';
            signOut(auth).then(() => {
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error("Error al cerrar sesión:", error);
                document.body.style.opacity = '1';
            });
        };
    }

    // Abrir por defecto
    if (navGroups.length > 0 && !document.querySelector('.nav-group.active')) {
        navGroups[0].querySelector('.topic-header').click();
    }
}

/* =========================================
   2. NOTIFICACIONES (Toast)
   ========================================= */
export function showToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    const icon = tipo === 'error' ? 'report' : (tipo === 'success' ? 'check_circle' : 'info');
    
    toast.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <span>${mensaje}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

/* =========================================
   3. GESTIÓN DEL AVATAR (Iniciales e Iconos)
   ========================================= */
export function configurarAvatar(user) {
    const avatarContent = document.getElementById('avatar-content');
    const avatarContainer = document.getElementById('user-avatar');
    const selector = document.getElementById('avatar-selector');

    if (!avatarContent || !avatarContainer) return;

    // Iniciales dinámicas
    if (user && user.displayName) {
        const nombres = user.displayName.split(" ");
        const iniciales = nombres.map(n => n[0]).join("").toUpperCase().substring(0, 2);
        avatarContent.innerText = iniciales;
    }

    // Toggle del selector
    avatarContainer.onclick = (e) => {
        e.stopPropagation();
        selector.style.display = selector.style.display === 'block' ? 'none' : 'block';
    };

    // Cambio de iconos
    document.querySelectorAll('.sel-icon').forEach(icon => {
        icon.onclick = (e) => {
            const type = e.target.dataset.type;
            
            if (type === 'icon') {
                avatarContent.style.fontFamily = "'Material Symbols Outlined'";
                avatarContent.classList.add('material-symbols-outlined');
                avatarContent.innerText = e.target.innerText;
            } else {
                avatarContent.style.fontFamily = "var(--font-main)";
                avatarContent.classList.remove('material-symbols-outlined');
                const nombres = (user && user.displayName) ? user.displayName.split(" ") : ["User"];
                avatarContent.innerText = nombres.map(n => n[0]).join("").toUpperCase().substring(0, 2);
            }
            selector.style.display = 'none';
        };
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!avatarContainer.contains(e.target) && !selector.contains(e.target)) {
            selector.style.display = 'none';
        }
    });
}
