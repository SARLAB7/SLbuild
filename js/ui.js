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

    navGroups.forEach(group => {
        const header = group.querySelector('.topic-header');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Lógica de Toggle: si ya tiene active, se quita; si no, se pone.
            const esActivo = group.classList.contains('active');
            
            // Primero cerramos todos los grupos
            navGroups.forEach(g => g.classList.remove('active'));
            
            // Si no era activo, lo activamos
            if (!esActivo) {
                group.classList.add('active');
            }
        });
    });

    // Cerrar al hacer clic en cualquier parte de la pantalla
    document.addEventListener('click', () => {
        navGroups.forEach(g => g.classList.remove('active'));
    });
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
          card.className = "bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 hover:shadow-md transition-shadow cursor-pointer";            
            // Colores por estado
            let badgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"; // Borrador
            if (factura.estado === 'Pagada') badgeClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            if (factura.estado === 'Pendiente') badgeClass = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

            // Formatear moneda (Pesos Colombianos)
            const montoFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(factura.monto);

            card.innerHTML = `
    <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="w-10 h-10 rounded-full bg-enterprise-50 dark:bg-enterprise-900/20 text-enterprise-600 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-xl">person</span>
        </div>
        <div class="flex-1 min-w-0">
            <!-- truncate evita que nombres muy largos rompan el diseño -->
            <h4 class="font-bold text-slate-800 dark:text-slate-100 truncate">${factura.cliente}</h4>
            <span class="text-[10px] md:text-xs font-semibold px-2 py-1 rounded-md ${badgeClass} inline-block mt-0.5">${factura.estado}</span>
        </div>
    </div>
    <!-- En celular el texto se alinea a la izquierda con padding, en PC a la derecha -->
<!-- Cambia pl-13 por pl-12 -->
<div class="text-left sm:text-right w-full sm:w-auto pl-12 sm:pl-0 mt-2 sm:mt-0">
<p class="font-extrabold text-lg text-slate-800 dark:text-slate-100">${montoFormateado}</p>
    </div>
`;
           
            listaFacturas.appendChild(card);
        });
    });
}

// js/ui.js (añadir al final)

export function inicializarDashboard() {
    // Comprobamos que el contenedor exista y que ApexCharts esté cargado
    if (!document.getElementById('chart-flujo') || typeof ApexCharts === 'undefined') return;

    // 1. Gráfico de Flujo (Área Suave)
    const opcionesFlujo = {
        series: [{
            name: 'Ingresos',
            data: [3100000, 4000000, 2800000, 5100000, 4200000, 6000000]
        }],
        chart: {
            type: 'area',
            height: 300,
            toolbar: { show: false }, // Oculta menú feo de opciones
            fontFamily: 'inherit',
            background: 'transparent' // Respeta el modo oscuro
        },
        colors: ['#2563eb'], // Enterprise Blue
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
            categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: '#64748b' } }
        },
        yaxis: {
            labels: { 
                style: { colors: '#64748b' },
                formatter: (value) => "$" + (value / 1000000).toFixed(1) + "M"
            }
        },
        grid: { borderColor: 'rgba(148, 163, 184, 0.1)', strokeDashArray: 4 }
    };

    const chartFlujo = new ApexCharts(document.querySelector("#chart-flujo"), opcionesFlujo);
    chartFlujo.render();

    // 2. Gráfico de Estados (Dona)
    const opcionesEstados = {
        series: [65, 25, 10], // Pagadas, Pendientes, Borrador
        labels: ['Pagadas', 'Pendientes', 'Borrador'],
        chart: { type: 'donut', height: 280, fontFamily: 'inherit', background: 'transparent' },
        colors: ['#10b981', '#f59e0b', '#cbd5e1'], // Verde, Naranja, Gris
        plotOptions: {
            pie: { donut: { size: '75%' } } // Dona más delgada y elegante
        },
        dataLabels: { enabled: false },
        stroke: { show: false },
        legend: { position: 'bottom', labels: { colors: '#64748b' } }
    };

    const chartEstados = new ApexCharts(document.querySelector("#chart-estados"), opcionesEstados);
    chartEstados.render();
}
