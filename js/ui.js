// js/ui.js
import { auth } from './firebase-config.js';
import { signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { notify } from './utils.js';

/* =========================================
   1. NAVEGACIÓN PRINCIPAL (Pill Navigation)
   ========================================= */
export function activarNavegacionPill() {
    const navGroups = document.querySelectorAll('.nav-group');
    const subItems = document.querySelectorAll('.sub-item');
    const sections = document.querySelectorAll('.content-section');

    // Manejo de Grupos (Finanzas, Gestión, etc.)
    navGroups.forEach(group => {
        const header = group.querySelector('.topic-header');
        
        header.addEventListener('click', (e) => {
            e.preventDefault();
            const estabaAbierto = group.classList.contains('active');

            // Cerramos todos los demás
            navGroups.forEach(g => g.classList.remove('active'));

            if (!estabaAbierto) {
                group.classList.add('active');
                // Al abrir un grupo, activamos automáticamente su primer sub-item
                const firstSub = group.querySelector('.sub-item');
                if (firstSub) firstSub.click();
            }
        });
    });

    // Manejo de Sub-ítems (Dashboard, Facturas, etc.)
    subItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 

            // Limpiar estados activos de botones
            subItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Gestión de visibilidad de SECCIONES
            const targetId = item.getAttribute('data-section');
            
            sections.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active-section');
            });
            
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.style.display = 'block';
                // Pequeño delay para la animación de entrada
                setTimeout(() => targetSec.classList.add('active-section'), 10);
            }
        });
    });

    // Lógica de Logout (Mantenla igual)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            signOut(auth).then(() => window.location.href = 'index.html');
        };
    }

    // Inicialización: Abrir la primera sección por defecto al cargar
    if (navGroups.length > 0) {
        const firstGroup = navGroups[0];
        firstGroup.classList.add('active');
        const firstSub = firstGroup.querySelector('.sub-item');
        if (firstSub) firstSub.click();
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
export function vincularBotonConfiguracion() {
    const btn = document.getElementById('btn-open-config');
    if (!btn) return;

    btn.onclick = () => {
        // Ocultar TODO lo demás
        document.querySelectorAll('.content-section').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active-section');
        });

        // Desactivar el Pill Navigation visualmente para que no parezca que hay dos cosas abiertas
        document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('active'));
        document.querySelectorAll('.sub-item').forEach(i => i.classList.remove('active'));

        const sec = document.getElementById('sec-configuracion');
        if (sec) {
            sec.style.display = 'block';
            sec.classList.add('active-section');
        }
    };
}

export function inicializarConfiguracion(user) {
    const nameInput = document.getElementById('config-name');
    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const form = document.getElementById('form-update-profile');

    if (user) {
        nameInput.value = user.displayName || "";
        nameDisplay.innerText = user.displayName || "Usuario SACLAB";
        emailDisplay.innerText = user.email;
        
        const nombres = (user.displayName || "U").trim().split(/\s+/);
        avatarDisplay.innerText = nombres.length > 1 
            ? (nombres[0][0] + nombres[nombres.length - 1][0]).toUpperCase()
            : nombres[0].substring(0, 2).toUpperCase();
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const nuevoNombre = nameInput.value.trim();
            if (!nuevoNombre) return notify("El nombre no puede estar vacío", "error");

            try {
                // 1. Actualizar en Firebase
                await updateProfile(user, { displayName: nuevoNombre });
                notify("Perfil actualizado en SACLAB");
                
                // 2. Actualizar textos en la página de configuración
                nameDisplay.innerText = nuevoNombre;
                
                // 3. Calcular nuevas iniciales
                const nombresArr = nuevoNombre.split(/\s+/);
                const iniciales = nombresArr.length > 1 
                    ? (nombresArr[0][0] + nombresArr[nombresArr.length - 1][0]).toUpperCase()
                    : nombresArr[0].substring(0, 2).toUpperCase();

                // 4. Actualizar el avatar de la sección configuración
                avatarDisplay.innerText = iniciales;

                // 5. Si el usuario tiene activo el modo "iniciales", actualizar el avatar de la barra superior
                if (localStorage.getItem('saclab_avatar_tipo') === 'initials') {
                    document.getElementById('avatar-content').innerText = iniciales;
                }
                
            } catch (error) {
                console.error(error);
                notify("Error al actualizar perfil", "error");
            }
        };
    }
}
