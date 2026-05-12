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