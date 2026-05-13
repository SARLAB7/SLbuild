// js/auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { activarInterfaz } from './ui.js';
import { cargarFacturas } from './db.js';

// 1. Lógica para el Login (index.html)
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, pass)
            .then(() => {
                // Si el login es exitoso, vamos al panel
                window.location.href = "panel.html"; 
            })
            .catch((error) => alert("Error: " + error.message));
    });
}

// 2. Observador de estado (Detecta si el usuario ya entró)
onAuthStateChanged(auth, async (user) => {
    // Verificamos si estamos en la página del panel de control
    const esPanel = window.location.pathname.includes('panel.html');

    if (user) {
        if (esPanel) {
            console.log("Sesión activa: Activando panel de SACLAB");
            activarInterfaz(); // Despierta botones y modales
            await cargarFacturas(); // Trae las facturas de Firebase
        }
    } else {
        // Si no hay usuario y trata de ver el panel, lo mandamos al login
        if (esPanel) {
            window.location.href = 'index.html';
        }
    }
});
