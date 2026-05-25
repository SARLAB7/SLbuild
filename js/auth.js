import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { notify } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const forgotView = document.getElementById('forgot-view');
    const loginForm = document.getElementById('login-form');
    const forgotForm = document.getElementById('forgot-form');

    // Cambios de vista
    document.getElementById('link-forgot').onclick = (e) => { e.preventDefault(); loginView.style.display = 'none'; forgotView.style.display = 'block'; };
    document.getElementById('link-back-login').onclick = (e) => { e.preventDefault(); forgotView.style.display = 'none'; loginView.style.display = 'block'; };

    // Login
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            notify("Bienvenido");
            window.location.href = "panel.html";
        } catch (error) {
            console.error(error.code);
            let msg = error.code === 'auth/wrong-password' ? "Contraseña incorrecta" : "Error de acceso";
            if(error.code === 'auth/user-not-found') msg = "Usuario no registrado";
            notify(msg, "error");
        }
    };

    // Recuperar
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

    // Vigilante
    onAuthStateChanged(auth, (user) => {
        if (user && window.location.pathname.includes('index.html')) {
            window.location.href = 'panel.html';
        }
    });
});
