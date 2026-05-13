// js/auth.js
import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { activarNavegacionPill, showToast } from './ui.js';
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
                showToast("Bienvenido a SACLAB", "success");
                // Pequeño delay para que el usuario vea el Toast antes de redirigir
                setTimeout(() => window.location.href = "panel.html", 800);
            })
            .catch((error) => {
                let mensaje = "Error de acceso";
                if (error.code === 'auth/wrong-password') mensaje = "Contraseña incorrecta";
                if (error.code === 'auth/user-not-found') mensaje = "Usuario no registrado";
                showToast(mensaje, "error");
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
                showToast("Enlace enviado al correo", "success");
                forgotView.style.display = 'none';
                loginView.style.display = 'block';
            })
            .catch((error) => {
                showToast("No se pudo enviar el correo", "error");
            });
    });
}

/* =========================================
   3. OBSERVADOR DE SESIÓN (PROTECCIÓN)
   ========================================= */
onAuthStateChanged(auth, async (user) => {
    const esPanel = window.location.pathname.includes('panel.html');

    if (user) {
        if (esPanel) {
            console.log("SACLAB: Acceso autorizado");
            activarNavegacionPill(); 
            await cargarFacturas(); 
        }
    } else {
        if (esPanel) {
            window.location.href = 'index.html';
        }
    }
});
