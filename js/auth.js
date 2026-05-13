// js/auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { activarNavegacionPill } from './ui.js';
import { cargarFacturas } from './db.js';
import { 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail // <-- Nueva función
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
            activarNavegacionPill(); // Despierta botones y modales
            await cargarFacturas(); // Trae las facturas de Firebase
        }
    } else {
        // Si no hay usuario y trata de ver el panel, lo mandamos al login
        if (esPanel) {
            window.location.href = 'index.html';
        }
    }
});
// --- MANEJO DE VISTAS (Toggle) ---
const loginView = document.getElementById('login-view');
const forgotView = document.getElementById('forgot-view');
const linkForgot = document.getElementById('link-forgot');
const linkBack = document.getElementById('link-back-login');

if (linkForgot) {
    linkForgot.onclick = (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        forgotView.style.display = 'block';
    };
}

if (linkBack) {
    linkBack.onclick = (e) => {
        e.preventDefault();
        forgotView.style.display = 'none';
        loginView.style.display = 'block';
    };
}

// --- LÓGICA DE RECUPERACIÓN ---
const forgotForm = document.getElementById('forgot-form');
if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;

        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("¡Enlace enviado! Revisa tu bandeja de entrada o spam.");
                // Regresar al login automáticamente
                forgotView.style.display = 'none';
                loginView.style.display = 'block';
            })
            .catch((error) => {
                alert("Error: " + error.message);
            });
    });
}

