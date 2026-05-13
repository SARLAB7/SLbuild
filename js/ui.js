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
