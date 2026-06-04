import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { notify } from './utils.js';
import { activarNavegacionPill } from './ui.js';

// 1. EVENTOS DE LA INTERFAZ
document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const forgotView = document.getElementById('forgot-view');
    const loginForm = document.getElementById('login-form');
    const forgotForm = document.getElementById('forgot-form');

    // Navegación entre vistas de Login y Olvido de contraseña
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
                setTimeout(() => window.location.href = "panel.html", 800);
            } catch (error) {
                console.error(error.code);
                let msg = error.code === 'auth/wrong-password' ? "Contraseña incorrecta" : "Error de acceso";
                if(error.code === 'auth/user-not-found') msg = "Usuario no registrado";
                notify(msg, "error");
            }
        };
    }

    // Recuperar Contraseña
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

// 2. EXPORTACIÓN DEL VIGILANTE
export function vigilarSesion(encontrado, noEncontrado) {
    onAuthStateChanged(auth, async (user) => {
        const esPanel = window.location.pathname.includes('panel.html');
        
        if (user) {
            // Si está logueado y está en el panel, inicializa UI
            if (esPanel) {
                activarNavegacionPill(); 
                // Nota: Ya no llamamos a db.js aquí. 
                // La inicialización de datos ocurre en el index.html vía inicializarFacturacion()
            } else {
                window.location.href = 'panel.html';
            }
            if (encontrado) encontrado(user);
        } else {
            // Si no está logueado y trata de entrar al panel, redirige al index
            if (esPanel) window.location.href = 'index.html';
            if (noEncontrado) noEncontrado();
        }
    });
}
