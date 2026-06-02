import { auth } from './firebase-config.js';
import { signOut, updateProfile } from "firebase/auth"; 
import { notify } from './utils.js';
import { guardarConfiguracion, obtenerConfiguracion, guardarFactura, suscribirFacturas, registrarAsientoContable } from './db.js';

/* =========================================
   1. GESTIÓN DE UI Y NAVEGACIÓN
   ========================================= */
export function activarNavegacionPill() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => signOut(auth).then(() => window.location.href = 'index.html');
    }
}

export function configurarAvatar(user) {
    // ... (Tu lógica existente de avatar)
}

/* =========================================
   2. DASHBOARD Y KPIs (Automatización)
   ========================================= */
export function inicializarDashboard() {
    if (document.getElementById('chart-flujo') && typeof ApexCharts !== 'undefined') {
        // Inicializa tus gráficos aquí
        const chartFlujo = new ApexCharts(document.querySelector("#chart-flujo"), { /* tus opciones */ });
        chartFlujo.render();
    }
}

export function activarActualizacionKPIs() {
    suscribirFacturas((facturas) => {
        const ingresos = facturas
            .filter(f => f.estado === 'Pagada')
            .reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
            
        const pendientes = facturas.filter(f => f.estado === 'Pendiente').length;
        
        const formatter = new Intl.NumberFormat('es-CO', { 
            style: 'currency', currency: 'COP', notation: "compact", maximumFractionDigits: 1 
        });

        const elIngresos = document.getElementById('kpi-ingresos');
        const elPendientes = document.getElementById('kpi-pendientes');
        
        if (elIngresos) elIngresos.innerText = formatter.format(ingresos);
        if (elPendientes) elPendientes.innerText = pendientes;
    });
}

/* =========================================
   3. FACTURACIÓN Y LÓGICA DE NEGOCIO
   ========================================= */
export function inicializarFacturacion() {
    const form = document.getElementById('form-nueva-factura');
    
    // Cálculo automático al escribir en monto
    const inputMonto = document.getElementById('factura-monto');
    inputMonto?.addEventListener('input', (e) => {
        const base = parseFloat(e.target.value) || 0;
        console.log(`Cálculo IVA (19%): $${(base * 0.19).toLocaleString()}`);
    });

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

// ... (Resto de tus funciones de inicializarConfiguracion y generarPDF)
