import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { notify } from './utils.js';
import { activarNavegacionPill } from './ui.js';
import { cargarFacturas } from './db.js';

// 1. EVENTOS DE LA INTERFAZ (Solo se ejecutan si los elementos existen, ej. en index.html)
document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const forgotView = document.getElementById('forgot-view');
    const loginForm = document.getElementById('login-form');
    const forgotForm = document.getElementById('forgot-form');

    // Cambios de vista
    if (document.getElementById('link-forgot')) {
        document.getElementById('link-forgot').onclick = (e) => { e.preventDefault(); loginView.style.display = 'none'; forgotView.style.display = 'block'; };
        document.getElementById('link-back-login').onclick = (e) => { e.preventDefault(); forgotView.style.display = 'none'; loginView.style.display = 'block'; };
    }

    // Login
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            try {
                await signInWithEmailAndPassword(auth, email, pass);
                notify("Bienvenido a SACLAB");
                // No necesitamos el setTimeout aquí, el vigilarSesion hará el redireccionamiento
            } catch (error) {
                console.error(error.code);
                let msg = error.code === 'auth/wrong-password' ? "Contraseña incorrecta" : "Error de acceso";
                if(error.code === 'auth/user-not-found') msg = "Usuario no registrado";
                notify(msg, "error");
            }
        };
    }

    // Recuperar
    if (forgotForm) {
        forgotForm.onsubmit = async (e) => {
            e.preventDefault();
            try {
                await sendPasswordResetEmail(auth, document.getElementById('forgot-email').value);
                notify("Enlace enviado al correo");
                forgotView.style.display = 'none';
                loginView.style.display = 'block';
            } catch (e) {
                notify("Error al enviar el correo", "error");
            }
        };
    }
});

// 2. EXPORTACIÓN DEL VIGILANTE (VITAL PARA VITE Y PANEL.HTML)
export function vigilarSesion(encontrado, noEncontrado) {
    onAuthStateChanged(auth, async (user) => {
        const esPanel = window.location.pathname.includes('panel.html');
        if (user) {
            if (esPanel) {
                activarNavegacionPill(); 
                await cargarFacturas(); 
            } else {
                // Si está logueado pero está en el login, lo mandamos al panel
                window.location.href = 'panel.html';
            }
            if (encontrado) encontrado(user);
        } else {
            if (esPanel) window.location.href = 'index.html';
            if (noEncontrado) noEncontrado();
        }
    });
}
