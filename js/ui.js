// js/ui.js
import { auth } from './firebase-config.js';
import { signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { notify } from './utils.js';

/* =========================================
   1. NAVEGACIÓN PRINCIPAL (Pill Navigation)
   ========================================= */
export function activarNavegacionPill() {
    const navGroups = document.querySelectorAll('.nav-group');
    const sections = document.querySelectorAll('.content-section');

    navGroups.forEach(group => {
        const header = group.querySelector('.topic-header');
        
        header.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Si ya está activo, no hacemos nada (evita que se oculte al re-clickear)
            if (group.classList.contains('active')) return;

            // 1. Limpiar todos los grupos y sub-ítems
            navGroups.forEach(g => g.classList.remove('active'));
            document.querySelectorAll('.sub-item').forEach(si => si.classList.remove('active'));

            // 2. Activar este grupo
            group.classList.add('active');

            // 3. Simular clic en el primer sub-item para mostrar la sección
            const firstSub = group.querySelector('.sub-item');
            if (firstSub) {
                firstSub.click();
            }
        });
    });

    // Lógica de Sub-ítems (Delegada para mayor eficiencia)
    document.querySelectorAll('.sub-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Activar botón visualmente
            document.querySelectorAll('.sub-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Mostrar Sección
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

    // Logout y Apertura por defecto (Mantener igual)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => signOut(auth).then(() => window.location.href = 'index.html');
    }

    // Asegurar que algo esté abierto al iniciar
    const activeSub = document.querySelector('.sub-item.active');
    if (!activeSub && navGroups.length > 0) {
        navGroups[0].querySelector('.topic-header').click();
    }
}
/* =========================================
   2. GESTIÓN DEL AVATAR (Iniciales e Iconos)
   ========================================= */
export function configurarAvatar(user) {
    const avatarContent = document.getElementById('avatar-content');
    const avatarContainer = document.getElementById('user-avatar');
    const selector = document.getElementById('avatar-selector');

    if (!avatarContent || !avatarContainer) return;

    // --- FUNCIÓN PARA LIMPIAR Y APLICAR ---
    const aplicarPreferencia = (tipo, valor) => {
        // 1. Limpiar todo rastro de fuentes anteriores
        avatarContent.classList.remove('material-symbols-outlined');
        avatarContent.style.fontFamily = "var(--font-main)";

        if (tipo === 'icon') {
            avatarContent.classList.add('material-symbols-outlined');
            avatarContent.innerText = valor;
        } else {
            // Si es iniciales, calculamos según el usuario actual
            const u = auth.currentUser || user;
            if (u && u.displayName) {
                const nombres = u.displayName.trim().split(/\s+/);
                avatarContent.innerText = nombres.length > 1 
                    ? (nombres[0][0] + nombres[nombres.length - 1][0]).toUpperCase()
                    : nombres[0].substring(0, 2).toUpperCase();
            } else {
                avatarContent.innerText = "US";
            }
        }
        // 2. GUARDAR: Para que no se borre al refrescar
        localStorage.setItem('saclab_avatar_tipo', tipo);
        localStorage.setItem('saclab_avatar_valor', valor);
    };

    // --- CARGAR PREFERENCIA AL INICIAR ---
    const tipoGuardado = localStorage.getItem('saclab_avatar_tipo');
    const valorGuardado = localStorage.getItem('saclab_avatar_valor');
    
    if (tipoGuardado) {
        aplicarPreferencia(tipoGuardado, valorGuardado);
    } else {
        aplicarPreferencia('initials', 'abc'); // Por defecto
    }

    // --- EVENTOS DEL SELECTOR ---
    avatarContainer.onclick = (e) => {
        e.stopPropagation();
        selector.style.display = selector.style.display === 'block' ? 'none' : 'block';
    };

    document.querySelectorAll('.sel-icon').forEach(iconBtn => {
        iconBtn.onclick = (e) => {
            const type = iconBtn.dataset.type;
            const value = iconBtn.innerText;
            aplicarPreferencia(type, value);
            selector.style.display = 'none';
        };
    });

    document.addEventListener('click', () => {
        if (selector) selector.style.display = 'none';
    });
}

/* =========================================
   3. CONFIGURACIÓN DEL SISTEMA
   ========================================= */
// js/ui.js

export function vincularBotonConfiguracion() {
    const btn = document.getElementById('btn-open-config');
    if (!btn) return;

    btn.onclick = (e) => {
        e.preventDefault();
        
        // 1. Ocultar TODAS las secciones de contenido
        document.querySelectorAll('.content-section').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active-section');
        });

        // 2. Quitar el estado activo de los "Pills" (Finanzas, Gestión, etc.)
        document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('active'));
        document.querySelectorAll('.sub-item').forEach(i => i.classList.remove('active'));

        // 3. Mostrar la sección de configuración
        const secConfig = document.getElementById('sec-configuracion');
        if (secConfig) {
            secConfig.style.display = 'block';
            // Delay mínimo para que la animación de entrada funcione
            setTimeout(() => secConfig.classList.add('active-section'), 10);
        }
    };
}
