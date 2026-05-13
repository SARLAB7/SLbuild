// js/ui.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// js/ui.js
export function activarNavegacionPill() {
    const navGroups = document.querySelectorAll('.nav-group');
    const subItems = document.querySelectorAll('.sub-item');
    const sections = document.querySelectorAll('.content-section');

    // 1. Manejar clics en los Temas Principales (Acordeón con Toggle)
    navGroups.forEach(group => {
        group.querySelector('.topic-header').addEventListener('click', () => {
            // Verificamos si el grupo que acabamos de tocar ya estaba abierto
            const estabaAbierto = group.classList.contains('active');

            // 1. Cerramos todos los grupos por precaución
            navGroups.forEach(g => g.classList.remove('active'));

            // 2. Si NO estaba abierto, lo abrimos
            if (!estabaAbierto) {
                group.classList.add('active');
                
                // Auto-seleccionar la primera subsección del grupo al abrir
                const firstSub = group.querySelector('.sub-item');
                if (firstSub) firstSub.click();
            }
            // (Si ya estaba abierto, se queda cerrado gracias al paso 1)
        });
    });

    // 2. Manejar clics en las Subsecciones (Queda igual)
    subItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); 

            subItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-section');
            sections.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active-section');
            });
            
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.style.display = 'block';
                setTimeout(() => targetSec.classList.add('active-section'), 10);
            }
        });
    });

    // Abrir "Finanzas" por defecto al cargar la página
    if (navGroups.length > 0) {
        navGroups[0].querySelector('.topic-header').click();
    }
}
