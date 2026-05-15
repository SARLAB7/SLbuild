// js/ui.js
import { auth } from './firebase-config.js';
import { signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { notify } from './utils.js';
import { guardarConfiguracion, obtenerConfiguracion } from './db.js';

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

// Cambiamos el nombre a vincularBotonConfiguracion para que coincida con tu panel.html
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
            setTimeout(() => secConfig.classList.add('active-section'), 10);
        }
    };
}

// ESTA ES LA FUNCIÓN QUE FALTABA EXPORTAR PARA RENDER
export async function inicializarConfiguracion(user) {
    if (!user) return;

    // Referencias a elementos del DOM
    const nameInput = document.getElementById('config-name');
    const emailDisplay = document.getElementById('profile-email-display');
    const formPerfil = document.getElementById('form-update-profile');
    
    // 1. Cargar datos iniciales de Firebase Auth
    if (nameInput) nameInput.value = user.displayName || "";
    if (emailDisplay) emailDisplay.value = user.email || "";

    // 2. Cargar datos adicionales de Firestore
    const configData = await obtenerConfiguracion(user.uid);
    if (configData) {
        if (configData.empresa) {
            if(document.getElementById('empresa-nombre')) document.getElementById('empresa-nombre').value = configData.empresa.nombre || '';
            if(document.getElementById('empresa-nit')) document.getElementById('empresa-nit').value = configData.empresa.nit || '';
            if(document.getElementById('empresa-regimen')) document.getElementById('empresa-regimen').value = configData.empresa.regimen || 'responsable';
        }
        if (configData.pagos) {
            if(document.getElementById('banco-principal')) document.getElementById('banco-principal').value = configData.pagos.banco || 'bancolombia';
            if(document.getElementById('cuenta-numero')) document.getElementById('cuenta-numero').value = configData.pagos.cuenta || '';
            if(document.getElementById('instrucciones-pago')) document.getElementById('instrucciones-pago').value = configData.pagos.instrucciones || '';
        }
    }

    // 3. Listeners de formularios
    if (formPerfil) {
        formPerfil.onsubmit = async (e) => {
            e.preventDefault();
            const nuevoNombre = nameInput.value.trim();
            if (!nuevoNombre) return notify("El nombre no puede estar vacío", "error");
            try {
                await updateProfile(user, { displayName: nuevoNombre });
                notify("Perfil actualizado");
            } catch (error) { notify("Error al actualizar perfil", "error"); }
        };
    }

    const formEmpresa = document.getElementById('form-update-empresa');
    if (formEmpresa) {
        formEmpresa.onsubmit = async (e) => {
            e.preventDefault();
            const datos = {
                nombre: document.getElementById('empresa-nombre').value,
                nit: document.getElementById('empresa-nit').value,
                regimen: document.getElementById('empresa-regimen').value
            };
            await guardarConfiguracion(user.uid, 'empresa', datos);
        };
    }

    const formPagos = document.getElementById('form-update-pagos');
    if (formPagos) {
        formPagos.onsubmit = async (e) => {
            e.preventDefault();
            const datos = {
                banco: document.getElementById('banco-principal').value,
                cuenta: document.getElementById('cuenta-numero').value,
                instrucciones: document.getElementById('instrucciones-pago').value
            };
            await guardarConfiguracion(user.uid, 'pagos', datos);
        };
    }
}
/*(Conectar la Interfaz con la Base de Datos)*/

export async function inicializarConfiguracion(user) {
    if (!user) return;

    // --- 1. LÓGICA DEL PERFIL (Lo que ya tenías) ---
    const nameInput = document.getElementById('config-name');
    const emailDisplay = document.getElementById('profile-email-display');
    const formPerfil = document.getElementById('form-update-profile');

    if (nameInput) nameInput.value = user.displayName || "";
    if (emailDisplay) emailDisplay.value = user.email; // Cambiado a .value porque es un input disabled

    if (formPerfil) {
        formPerfil.onsubmit = async (e) => {
            e.preventDefault();
            const nuevoNombre = nameInput.value.trim();
            if (!nuevoNombre) return notify("El nombre no puede estar vacío", "error");

            try {
                await updateProfile(user, { displayName: nuevoNombre });
                notify("Perfil actualizado en SACLAB");
                // (Aquí va tu lógica de actualizar avatares visualmente que ya tenías)
            } catch (error) {
                notify("Error al actualizar perfil", "error");
            }
        };
    }

    // --- 2. CARGAR DATOS DE FIRESTORE AL INICIAR ---
    const configData = await obtenerConfiguracion(user.uid);
    if (configData) {
        // Llenar datos de empresa
        if (configData.empresa) {
            document.getElementById('empresa-nombre').value = configData.empresa.nombre || '';
            document.getElementById('empresa-nit').value = configData.empresa.nit || '';
            document.getElementById('empresa-regimen').value = configData.empresa.regimen || 'responsable';
        }
        // Llenar datos de pagos
        if (configData.pagos) {
            document.getElementById('banco-principal').value = configData.pagos.banco || 'bancolombia';
            document.getElementById('cuenta-numero').value = configData.pagos.cuenta || '';
            document.getElementById('instrucciones-pago').value = configData.pagos.instrucciones || '';
        }
    }

    // --- 3. GUARDAR DATOS DE EMPRESA ---
    const formEmpresa = document.getElementById('form-update-empresa');
    if (formEmpresa) {
        formEmpresa.onsubmit = async (e) => {
            e.preventDefault();
            const datosEmpresa = {
                nombre: document.getElementById('empresa-nombre').value.trim(),
                nit: document.getElementById('empresa-nit').value.trim(),
                regimen: document.getElementById('empresa-regimen').value
            };
            await guardarConfiguracion(user.uid, 'empresa', datosEmpresa);
        };
    }

    // --- 4. GUARDAR DATOS DE PAGOS ---
    const formPagos = document.getElementById('form-update-pagos');
    if (formPagos) {
        formPagos.onsubmit = async (e) => {
            e.preventDefault();
            const datosPagos = {
                banco: document.getElementById('banco-principal').value,
                cuenta: document.getElementById('cuenta-numero').value.trim(),
                instrucciones: document.getElementById('instrucciones-pago').value.trim()
            };
            await guardarConfiguracion(user.uid, 'pagos', datosPagos);
        };
    }
}
