// js/ui.js
import { auth } from './firebase-config.js';
import { signOut, updateProfile } from "firebase/auth"; 
import { notify } from './utils.js';
import { guardarConfiguracion, obtenerConfiguracion, guardarFactura } from './db.js';
import { suscribirFacturas } from './db.js';

/* =========================================
   1. NAVEGACIÓN PRINCIPAL (Pill Navigation)
   ========================================= */
export function activarNavegacionPill() {
    const navGroups = document.querySelectorAll('.nav-group');

    // Solo se encarga de expandir la píldora principal (Finanzas, Gestión, etc)
    navGroups.forEach(group => {
        const header = group.querySelector('.topic-header');
        
        header.addEventListener('click', (e) => {
            e.preventDefault();
            if (group.classList.contains('active')) return;

            navGroups.forEach(g => g.classList.remove('active'));
            group.classList.add('active');
        });
    });

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => signOut(auth).then(() => window.location.href = 'index.html');
    }
}

/* =========================================
   2. GESTIÓN DEL AVATAR (Limpieza Tailwind)
   ========================================= */
export function configurarAvatar(user) {
    const avatarContent = document.getElementById('avatar-content');
    const avatarContainer = document.getElementById('user-avatar');
    const selector = document.getElementById('avatar-selector');

    if (!avatarContent || !avatarContainer) return;

    const aplicarPreferencia = (tipo, valor) => {
        avatarContent.classList.remove('material-symbols-outlined');
        avatarContent.style.fontFamily = "var(--font-main)";

        if (tipo === 'icon') {
            avatarContent.classList.add('material-symbols-outlined');
            avatarContent.innerText = valor;
        } else {
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
        localStorage.setItem('saclab_avatar_tipo', tipo);
        localStorage.setItem('saclab_avatar_valor', valor);
    };

    const tipoGuardado = localStorage.getItem('saclab_avatar_tipo');
    const valorGuardado = localStorage.getItem('saclab_avatar_valor');
    
    if (tipoGuardado) aplicarPreferencia(tipoGuardado, valorGuardado);
    else aplicarPreferencia('initials', 'abc');

    // MODO MODERNO TAILWIND: Usamos classList.toggle('hidden') en vez de style.display
    avatarContainer.onclick = (e) => {
        e.stopPropagation();
        selector.classList.toggle('hidden');
    };

    document.querySelectorAll('.sel-icon').forEach(iconBtn => {
        iconBtn.onclick = (e) => {
            const type = iconBtn.dataset.type;
            const value = iconBtn.innerText;
            aplicarPreferencia(type, value);
            selector.classList.add('hidden'); // Ocultar añadiendo 'hidden'
        };
    });

    document.addEventListener('click', () => {
        if (selector) selector.classList.add('hidden');
    });
}

/* =========================================
   3. CONFIGURACIÓN DEL SISTEMA Y MODALES
   ========================================= */

export async function inicializarConfiguracion(user) {
    if (!user) return;

    // --- CARGA DE DATOS DE USUARIO ---
    const nameInput = document.getElementById('config-name');
    const emailDisplay = document.getElementById('profile-email-display');
    
    if (nameInput) nameInput.value = user.displayName || "";
    if (emailDisplay) emailDisplay.value = user.email || "";

    const configData = await obtenerConfiguracion(user.uid);
    if (configData) {
        if (configData.empresa) {
            const ent = configData.empresa;
            if(document.getElementById('empresa-nombre')) document.getElementById('empresa-nombre').value = ent.nombre || '';
            if(document.getElementById('empresa-nit')) document.getElementById('empresa-nit').value = ent.nit || '';
            if(document.getElementById('empresa-regimen')) document.getElementById('empresa-regimen').value = ent.regimen || 'responsable';
            if(document.getElementById('empresa-direccion')) document.getElementById('empresa-direccion').value = ent.direccion || '';
            if(document.getElementById('empresa-ciudad')) document.getElementById('empresa-ciudad').value = ent.ciudad || '';
        }
        if (configData.pagos) {
            const pag = configData.pagos;
            if(document.getElementById('banco-principal')) document.getElementById('banco-principal').value = pag.banco || 'bancolombia';
            if(document.getElementById('cuenta-numero')) document.getElementById('cuenta-numero').value = pag.cuenta || '';
            if(document.getElementById('instrucciones-pago')) document.getElementById('instrucciones-pago').value = pag.instrucciones || '';
        }
        if (configData.branding) {
            if (configData.branding.logo) {
                document.getElementById('preview-logo').src = configData.branding.logo;
                document.getElementById('preview-logo').classList.remove('hidden');
                document.getElementById('text-logo').classList.add('hidden');
            }
            if (configData.branding.firma) {
                document.getElementById('preview-firma').src = configData.branding.firma;
                document.getElementById('preview-firma').classList.remove('hidden');
                document.getElementById('text-firma').classList.add('hidden');
            }
        }
    }

    // --- EVENTOS DE SUBMIT ---
    const formPerfil = document.getElementById('form-update-profile');
    if (formPerfil) {
        formPerfil.onsubmit = async (e) => {
            e.preventDefault();
            const nuevoNombre = nameInput.value.trim();
            if (!nuevoNombre) return notify("El nombre no puede estar vacío", "error");
            try {
                await updateProfile(user, { displayName: nuevoNombre });
                notify("Perfil actualizado en SACLAB");
            } catch (error) { notify("Error al actualizar perfil", "error"); }
        };
    }

    const formEmpresa = document.getElementById('form-update-empresa');
    if (formEmpresa) {
        formEmpresa.onsubmit = async (e) => {
            e.preventDefault();
            const datos = {
                nombre: document.getElementById('empresa-nombre').value.trim() || "",
                nit: document.getElementById('empresa-nit').value.trim() || "",
                regimen: document.getElementById('empresa-regimen').value || "",
                direccion: document.getElementById('empresa-direccion').value.trim() || "",
                ciudad: document.getElementById('empresa-ciudad').value.trim() || ""
            };
            await guardarConfiguracion(user.uid, 'empresa', datos);
        };
    }

    const formPagos = document.getElementById('form-update-pagos');
    if (formPagos) {
        formPagos.onsubmit = async (e) => {
            e.preventDefault();
            const datos = {
                banco: document.getElementById('banco-principal').value || "",
                cuenta: document.getElementById('cuenta-numero').value.trim() || "",
                instrucciones: document.getElementById('instrucciones-pago').value.trim() || ""
            };
            await guardarConfiguracion(user.uid, 'pagos', datos);
        };
    }

    // --- LÓGICA DEL NUEVO MODAL SHOELACE ---
    const formFactura = document.getElementById('form-nueva-factura');
    const modalFactura = document.getElementById('modal-factura');
    
    if (formFactura && modalFactura) {
        formFactura.onsubmit = async (e) => {
            e.preventDefault();
            
            const datos = {
                cliente: document.getElementById('factura-cliente').value,
                monto: document.getElementById('factura-monto').value,
                estado: document.getElementById('factura-estado').value
            };

            const exito = await guardarFactura(datos);
            if (exito) {
                modalFactura.hide(); // Magia de Shoelace: cierra con animación
                formFactura.reset(); // Limpia los campos
                // Aquí podrías llamar a cargarFacturas() nuevamente para actualizar la UI
            }
        };
    }

    // --- GESTIÓN DE CARGA DE IMÁGENES (Limpieza Tailwind) ---
    const procesarImagen = (zoneId, inputId, previewId, textId, dbField) => {
        const zone = document.getElementById(zoneId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const text = document.getElementById(textId);

        if (!zone || !input) return;

        zone.onclick = () => input.click(); 

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result;
                    preview.src = base64String;
                    preview.classList.remove('hidden'); // Método Tailwind
                    text.classList.add('hidden');

                    await guardarConfiguracion(user.uid, 'branding', { [dbField]: base64String });
                };
                reader.readAsDataURL(file);
            }
        };
    };

    procesarImagen('zone-logo', 'input-logo', 'preview-logo', 'text-logo', 'logo');
    procesarImagen('zone-firma', 'input-firma', 'preview-firma', 'text-firma', 'firma');
}
export function inicializarFacturacion() {
    const listaFacturas = document.getElementById('lista-facturas');
    if (!listaFacturas) return;

    // Nos suscribimos a los cambios en tiempo real
    suscribirFacturas((facturas) => {
        listaFacturas.innerHTML = ''; // Limpiamos la lista actual

        if (facturas.length === 0) {
            listaFacturas.innerHTML = `
                <div class="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                    <span class="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                    <p>No hay facturas registradas aún.</p>
                </div>`;
            return;
        }

        // Renderizamos cada factura
        facturas.forEach(factura => {
            const card = document.createElement('div');
            // Estilos de tarjeta premium Apple/Android
            card.className = "bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer";
            
            // Colores por estado
            let badgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"; // Borrador
            if (factura.estado === 'Pagada') badgeClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            if (factura.estado === 'Pendiente') badgeClass = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

            // Formatear moneda (Pesos Colombianos)
            const montoFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(factura.monto);

            card.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-enterprise-50 dark:bg-enterprise-900/20 text-enterprise-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-xl">person</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-100">${factura.cliente}</h4>
                        <span class="text-xs font-semibold px-2 py-1 rounded-md ${badgeClass}">${factura.estado}</span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-extrabold text-lg text-slate-800 dark:text-slate-100">${montoFormateado}</p>
                </div>
            `;
            listaFacturas.appendChild(card);
        });
    });
}
