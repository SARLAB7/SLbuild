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
    // FUNCIÓN VACÍA: Alpine.js ahora controla los menús desplegables 
    // directamente en el HTML mediante x-data="{ open: false }".
    // Esto evita bloqueos y conflictos de CSS.
    
    // Solo mantenemos la lógica de cerrar sesión si existe el botón
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        import('./firebase-config.js').then(({ auth }) => {
            import('firebase/auth').then(({ signOut }) => {
                btnLogout.onclick = () => signOut(auth).then(() => window.location.href = 'index.html');
            });
        });
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

// --- DASHBOARD: KPIs + GRÁFICOS ---
export function inicializarDashboard() {
    // 1. Inyectar KPIs (Aquí podrías hacer un fetch a Firestore)
    console.log("Dashboard: Renderizando KPIs dinámicos...");

    // 2. Renderizar Gráficos (ApexCharts)
    if (document.getElementById('chart-flujo') && typeof ApexCharts !== 'undefined') {
        const opcionesFlujo = { /* ... tus opciones actuales ... */ };
        new ApexCharts(document.querySelector("#chart-flujo"), opcionesFlujo).render();
        
        const opcionesEstados = { /* ... tus opciones actuales ... */ };
        new ApexCharts(document.querySelector("#chart-estados"), opcionesEstados).render();
    }
}

// --- FACTURACIÓN: LÓGICA + AUTOMATIZACIÓN ---
export function inicializarFacturacion() {
    const form = document.getElementById('form-nueva-factura');
    const listaFacturas = document.getElementById('lista-facturas');

    // Suscripción en tiempo real (Firebase)
    suscribirFacturas((facturas) => {
        if (!listaFacturas) return;
        listaFacturas.innerHTML = facturas.map(f => `...template card...`).join('');
    });

    // Envío de formulario
    form.onsubmit = async (e) => {
        e.preventDefault();
        const datos = { /* capturar de inputs */ };
        
        // Guardar en Firestore
        const docRef = await guardarFactura(datos);
        
        // Automatización contable si es pagada
        if(datos.estado === 'Pagada') {
            await registrarAsientoContable(datos, docRef.id);
        }

        Toastify({ text: "Factura registrada", backgroundColor: "#8b5cf6" }).showToast();
    };
}
export function inicializarCalculoAutomatico() {
    const inputMonto = document.getElementById('factura-monto');
    // Supongamos que añadiste un campo oculto o display para el IVA
    // Si no lo tienes, podemos agregarlo al form en tu HTML
    
    inputMonto.addEventListener('input', (e) => {
        const base = parseFloat(e.target.value) || 0;
        const iva = base * 0.19; // IVA del 19% en Colombia
        const total = base + iva;
        
        console.log(`Base: ${base}, IVA: ${iva}, Total: ${total}`);
        // Aquí podrías actualizar un texto en pantalla:
        // document.getElementById('display-total').innerText = total;
    });
}
