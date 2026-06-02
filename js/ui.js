import { auth } from './firebase-config.js';
import { signOut, updateProfile } from "firebase/auth"; 
import { notify } from './utils.js';
import { guardarConfiguracion, obtenerConfiguracion, guardarFactura, suscribirFacturas } from './db.js';

/* =========================================
   1. NAVEGACIÓN Y AVATAR
   ========================================= */
export function activarNavegacionPill() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => signOut(auth).then(() => window.location.href = 'index.html');
    }
}

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
                avatarContent.innerText = nombres.length > 1 ? (nombres[0][0] + nombres[nombres.length - 1][0]).toUpperCase() : nombres[0].substring(0, 2).toUpperCase();
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

    avatarContainer.onclick = (e) => { e.stopPropagation(); selector.classList.toggle('hidden'); };
    document.querySelectorAll('.sel-icon').forEach(iconBtn => {
        iconBtn.onclick = () => {
            aplicarPreferencia(iconBtn.dataset.type, iconBtn.innerText);
            selector.classList.add('hidden');
        };
    });
}

/* =========================================
   2. CONFIGURACIÓN Y PDF
   ========================================= */
export async function inicializarConfiguracion(user) {
    if (!user) return;
    // ... (Tu lógica de carga de datos existente)
    // Asegúrate de mantener aquí todo el bloque de 'procesarImagen' y los 'forms' de branding
}

export function generarPDF(factura) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("FACTURA DE VENTA", 105, 20, { align: "center" });
    doc.text(`Cliente: ${factura.cliente}`, 20, 40);
    doc.text(`TOTAL: $${factura.montoTotal.toLocaleString()}`, 20, 110);
    doc.save(`Factura_${factura.cliente}.pdf`);
}

/* =========================================
   3. DASHBOARD (KPIs dinámicos)
   ========================================= */
export function inicializarDashboard() {
    if (document.getElementById('chart-flujo')) {
        new ApexCharts(document.querySelector("#chart-flujo"), { /* tus opciones */ }).render();
    }
}

export function activarActualizacionKPIs() {
    suscribirFacturas((facturas) => {
        const ingresos = facturas.filter(f => f.estado === 'Pagada').reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
        const pendientes = facturas.filter(f => f.estado === 'Pendiente').length;
        
        const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', notation: "compact" });
        
        if (document.getElementById('kpi-ingresos')) document.getElementById('kpi-ingresos').innerText = formatter.format(ingresos);
        if (document.getElementById('kpi-pendientes')) document.getElementById('kpi-pendientes').innerText = pendientes;
    });
}

/* =========================================
   4. FACTURACIÓN
   ========================================= */
export function inicializarFacturacion() {
    const form = document.getElementById('form-nueva-factura');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const datos = {
            cliente: document.getElementById('factura-cliente').value,
            monto: document.getElementById('factura-monto').value,
            estado: document.getElementById('factura-estado').value
        };
        const exito = await guardarFactura(datos);
        if (exito) {
            document.getElementById('modal-factura').hide();
            form.reset();
            notify("Factura registrada y sincronizada");
        }
    };
}
