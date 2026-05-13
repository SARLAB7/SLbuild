// js/ui.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// js/ui.js
export function activarInterfaz() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Estilo visual: Quitar 'active' de todos y poner al actual
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // 2. Lógica de navegación:
            // Obtenemos el texto del botón (ej: "Inicio", "Facturas")
            const targetName = item.textContent.trim().toLowerCase();
            
            // Escondemos todas las secciones
            sections.forEach(s => s.style.display = 'none');

            // Mostramos la sección que coincida
            if (targetName.includes("inicio")) {
                document.getElementById('sec-inicio').style.display = 'block';
            } else if (targetName.includes("facturas")) {
                document.getElementById('sec-facturas').style.display = 'block';
            } else if (targetName.includes("clientes")) {
                document.getElementById('sec-clientes').style.display = 'block';
            } else if (targetName.includes("estadísticas")) {
                document.getElementById('sec-estadisticas').style.display = 'block';
            }
        });
    });

    // No olvides llamar a Feather para que los iconos no desaparezcan
    feather.replace();
}
export function setupFormularioInteligente() {
    const inputMonto = document.getElementById('factura-monto');
    
    if (inputMonto) {
        inputMonto.addEventListener('input', (e) => {
            const valor = Number(e.target.value);
            const iva = valor * 0.19;
            const rete = valor * 0.04;
            const total = valor + iva - rete;

            // Actualizar vista previa en el modal (puedes añadir estos span en tu HTML)
            document.getElementById('preview-iva').textContent = `IVA (19%): $${iva.toLocaleString()}`;
            document.getElementById('preview-total').textContent = `Total Neto: $${total.toLocaleString()}`;
        });
    }
}
// js/ui.js
const menus = {
    finanzas: [
        { id: 'inicio', label: 'Dashboard', icon: 'home' },
        { id: 'facturas', label: 'Ventas/Facturas', icon: 'file-plus' },
        { id: 'gastos', label: 'Gastos/Egresos', icon: 'minus-circle' }
    ],
    gestion: [
        { id: 'clientes', label: 'Clientes', icon: 'users' },
        { id: 'productos', label: 'Servicios/Precios', icon: 'package' }
    ],
    legal: [
        { id: 'asientos', label: 'Libro Diario', icon: 'book' },
        { id: 'impuestos', label: 'Reporte DIAN', icon: 'pie-chart' }
    ]
};

export function activarNavegacionPro() {
    const topicBtns = document.querySelectorAll('.topic-btn');
    const sideNav = document.getElementById('side-nav-content');

    topicBtns.forEach(btn => {
        btn.onclick = () => {
            // 1. Switch visual arriba
            topicBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Cambiar menú lateral
            const topic = btn.dataset.topic;
            renderSideMenu(topic);
        };
    });

    // Carga inicial
    renderSideMenu('finanzas');
}

function renderSideMenu(topic) {
    const sideNav = document.getElementById('side-nav-content');
    const items = menus[topic];
    
    sideNav.innerHTML = items.map(item => `
        <a href="#" class="nav-item" data-section="sec-${item.id}">
            <i data-feather="${item.icon}"></i> ${item.label}
        </a>
    `).join('');

    feather.replace(); // Recargar iconos
    conectarSecciones(); // Función para que al dar clic cambie el centro
}
