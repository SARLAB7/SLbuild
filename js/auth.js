// js/auth.js
import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Importamos solo lo necesario
import { activarNavegacionPill } from './ui.js';
import { notify } from './utils.js'; // <--- USAMOS NUESTRA UTILIDAD DE LIBRERÍA
import { cargarFacturas } from './db.js';

/* =========================================
   1. GESTIÓN DE VISTAS (LOGIN / RECOVERY)
   ========================================= */
const loginView = document.getElementById('login-view');
const forgotView = document.getElementById('forgot-view');
const linkForgot = document.getElementById('link-forgot');
const linkBack = document.getElementById('link-back-login');

if (linkForgot && linkBack) {
    linkForgot.onclick = (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        forgotView.style.display = 'block';
    };
    linkBack.onclick = (e) => {
        e.preventDefault();
        forgotView.style.display = 'none';
        loginView.style.display = 'block';
    };
}

/* =========================================
   2. LÓGICA DE AUTENTICACIÓN
   ========================================= */

// --- Inicio de Sesión ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, pass)
            .then(() => {
                notify("Bienvenido a SACLAB"); // Uso de librería
                setTimeout(() => window.location.href = "panel.html", 800);
            })
            .catch((error) => {
                let mensaje = "Error de acceso";
                if (error.code === 'auth/wrong-password') mensaje = "Contraseña incorrecta";
                if (error.code === 'auth/user-not-found') mensaje = "Usuario no registrado";
                notify(mensaje, "error"); // Uso de librería
            });
    });
}

// --- Recuperación de Contraseña ---
const forgotForm = document.getElementById('forgot-form');
if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;

        sendPasswordResetEmail(auth, email)
            .then(() => {
                notify("Enlace enviado al correo");
                forgotView.style.display = 'none';
                loginView.style.display = 'block';
            })
            .catch(() => {
                notify("No se pudo enviar el correo", "error");
            });
    });
}

/* =========================================
   3. EXPORTACIÓN DEL VIGILANTE
   ========================================= */
export function vigilarSesion(encontrado, noEncontrado) {
    onAuthStateChanged(auth, async (user) => {
        const esPanel = window.location.pathname.includes('panel.html');
        if (user) {
            if (esPanel) {
                activarNavegacionPill(); 
                await cargarFacturas(); 
            }
            if (encontrado) encontrado(user);
        } else {
            if (esPanel) window.location.href = 'index.html';
            if (noEncontrado) noEncontrado();
        }
    });
}
