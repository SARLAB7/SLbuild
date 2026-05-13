// js/ui.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
