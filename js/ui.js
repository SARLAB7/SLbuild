import { cargarFacturas } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderizar iconos de Feather
    feather.replace();

    // 2. Cargar datos de Firebase al iniciar (si los hay)
    cargarFacturas();

    // 3. Configurar el botón de nueva factura
    const btnNuevaFactura = document.getElementById('btn-nueva-factura');
    if (btnNuevaFactura) {
        btnNuevaFactura.addEventListener('click', () => {
            // Aquí abriremos el modal para agregar datos
            console.log("Abrir formulario de nueva factura");
        });
    }
});
// js/ui.js
export function setupUI() {
    const modal = document.getElementById('modal-factura');
    const btnNuevaFactura = document.getElementById('btn-nueva-factura');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const themeToggle = document.getElementById('theme-toggle');

    // Abrir Modal
    if (btnNuevaFactura) {
        btnNuevaFactura.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // Cerrar Modal
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Cambio de Pestañas (Filtros)
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            console.log("Filtrando por:", tab.textContent);
        });
    });

    // Dark Mode básico
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            feather.replace();
        });
    }
}
