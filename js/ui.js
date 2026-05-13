// js/ui.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function activarInterfaz() {
    const modal = document.getElementById('modal-factura');
    const btnAbrir = document.getElementById('btn-nueva-factura');
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const themeBtn = document.getElementById('theme-toggle');
    const btnLogout = document.getElementById('btn-logout'); // Asegúrate de que este ID esté en tu HTML

    // 1. Abrir modal
    if (btnAbrir) {
        btnAbrir.onclick = () => modal.style.display = 'flex';
    }

    // 2. Cerrar modal
    if (btnCerrar) {
        btnCerrar.onclick = () => modal.style.display = 'none';
    }

    // 3. Lógica de Cerrar Sesión (Esto es lo que te faltaba)
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                console.log("Cerrando sesión en SACLAB...");
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error("Error al salir:", error);
            });
        };
    }

    // 4. Cambio de Pestañas (Filtros)
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        };
    });

    // 5. Cambiar tema (Dark Mode)
    if (themeBtn) {
        themeBtn.onclick = () => {
            document.body.classList.toggle('dark-theme');
            feather.replace();
        };
    }

    // Renderizar iconos de Feather al final
    feather.replace();
}
