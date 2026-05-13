// js/ui.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// js/ui.js

// 1. Diccionario de Secciones
const menuData = {
    finanzas: [
        { id: 'inicio', label: 'Dashboard', icon: 'home' },
        { id: 'facturas', label: 'Ventas y Facturas', icon: 'file-text' },
        { id: 'gastos', label: 'Egresos', icon: 'minus-circle' }
    ],
    gestion: [
        { id: 'clientes', label: 'Directorio Clientes', icon: 'users' },
        { id: 'productos', label: 'Servicios', icon: 'package' }
    ],
    legal: [
        { id: 'asientos', label: 'Libro Diario', icon: 'book' },
        { id: 'impuestos', label: 'Reportes Fiscales', icon: 'pie-chart' }
    ]
};

export function activarInterfaz() {
    const topicBtns = document.querySelectorAll('.topic-btn');
    
    // Navegación Superior
    topicBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Cambio visual arriba
            topicBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Cargar barra lateral
            const tema = btn.getAttribute('data-topic');
            renderSideMenu(tema);
        });
    });

    // Arrancar el sistema en "Finanzas" por defecto
    if (topicBtns.length > 0) {
        topicBtns[0].click(); 
    }
    
    // IMPORTANTE: Asegúrate de tener Feather importado en tu HTML
    if (typeof feather !== 'undefined') feather.replace();
}

// 2. Constructor de la Barra Lateral
function renderSideMenu(tema) {
    const sideNav = document.getElementById('side-nav-content');
    if (!sideNav) return;

    const items = menuData[tema];
    
    // Inyectar el HTML estético
    sideNav.innerHTML = items.map(item => `
        <a href="#" class="nav-item" data-section="sec-${item.id}">
            <i data-feather="${item.icon}"></i> 
            <span>${item.label}</span>
        </a>
    `).join('');

    if (typeof feather !== 'undefined') feather.replace();
    
    // Activar los botones recién creados
    asignarEventosSecciones();
}

// 3. El Switch (Lo que hace que las secciones cambien)
function asignarEventosSecciones() {
    const navItems = document.querySelectorAll('.side-nav .nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Efecto Neón en la barra lateral
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // 2. Buscar qué sección mostrar
            const targetId = item.getAttribute('data-section');
            
            // Ocultar TODAS las secciones
            sections.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active-section');
            });
            
            // Mostrar SOLO la sección seleccionada
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.style.display = 'block';
                // Pequeño retardo para que la animación de CSS funcione
                setTimeout(() => targetSec.classList.add('active-section'), 10);
            } else {
                console.warn(`La sección ID="${targetId}" no existe en tu HTML.`);
            }
        });
    });

    // Auto-clic en la primera opción de la barra lateral al cambiar de tema
    if (navItems.length > 0) {
        navItems[0].click();
    }
}
// js/ui.js
export function activarNavegacionPill() {
    const navGroups = document.querySelectorAll('.nav-group');
    const subItems = document.querySelectorAll('.sub-item');
    const sections = document.querySelectorAll('.content-section');

    // 1. Manejar clics en los Temas Principales (Acordeón)
    navGroups.forEach(group => {
        group.querySelector('.topic-header').addEventListener('click', () => {
            // Contraer todos y expandir el seleccionado
            navGroups.forEach(g => g.classList.remove('active'));
            group.classList.add('active');
            
            // Auto-seleccionar la primera subsección del grupo al abrir
            const firstSub = group.querySelector('.sub-item');
            if (firstSub) firstSub.click();
        });
    });

    // 2. Manejar clics en las Subsecciones
    subItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el clic llegue al topic-header

            // Activar botón visualmente
            subItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Cambiar de sección en el centro
            const targetId = item.getAttribute('data-section');
            sections.forEach(s => s.style.display = 'none');
            
            const targetSec = document.getElementById(targetId);
            if (targetSec) targetSec.style.display = 'block';
        });
    });
}
