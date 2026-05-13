// js/ui.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Definición de los menús por cada tema superior
const menuData = {
    finanzas: [
        { id: 'inicio', label: 'Dashboard', icon: 'home' },
        { id: 'facturas', label: 'Ventas y Facturas', icon: 'file-text' },
        { id: 'gastos', label: 'Gastos y Egresos', icon: 'minus-circle' }
    ],
    gestion: [
        { id: 'clientes', label: 'Clientes', icon: 'users' },
        { id: 'productos', label: 'Servicios y Precios', icon: 'package' }
    ],
    legal: [
        { id: 'asientos', label: 'Libro Diario', icon: 'book' },
        { id: 'impuestos', label: 'Reportes Fiscales', icon: 'pie-chart' }
    ]
};

export function activarInterfaz() {
    const topicBtns = document.querySelectorAll('.topic-btn');
    
    // 1. Lógica para los botones Superiores (Temas)
    topicBtns.forEach(btn => {
        btn.onclick = () => {
            topicBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tema = btn.getAttribute('data-topic');
            renderSideMenu(tema);
        };
    });

    // 2. Lógica para Cerrar Sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            signOut(auth).then(() => window.location.href = 'index.html');
        };
    }

    // Carga inicial por defecto
    renderSideMenu('finanzas');
}

// Función que dibuja el menú lateral
function renderSideMenu(tema) {
    const sideNav = document.getElementById('side-nav-content');
    const items = menuData[tema];

    sideNav.innerHTML = items.map(item => `
        <a href="#" class="nav-item" data-section="sec-${item.id}">
            <i data-feather="${item.icon}"></i> ${item.label}
        </a>
    `).join('');

    feather.replace(); // Dibuja los iconos nuevos
    asignarEventosSecciones(); // Activa los clics en el nuevo menú
}

// Función que cambia las secciones del centro
function asignarEventosSecciones() {
    const navItems = document.querySelectorAll('.side-nav .nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            
            // Estilo visual del botón lateral
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Cambio de sección
            const targetId = item.getAttribute('data-section');
            sections.forEach(s => s.style.display = 'none');
            
            const targetSec = document.getElementById(targetId);
            if (targetSec) targetSec.style.display = 'block';
        };
    });
}
