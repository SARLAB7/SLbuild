// auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { setupUI } from './ui.js';
import { cargarFacturas } from './db.js';

// 1. Lógica de Inicio de Sesión (Solo funcionará si existe el formulario)
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, pass)
            .then(() => {
                window.location.href = "panel.html"; // Asegúrate de que tu archivo se llame así
            })
            .catch((error) => alert("Error: " + error.message));
    });
}

// 2. Observador de Estado (Detección de usuario dentro del Panel)
onAuthStateChanged(auth, async (user) => {
    const esPaginaProtegida = window.location.pathname.includes('panel.html');

    if (user) {
        // SI HAY USUARIO: Si estamos en el panel, despertamos las funciones
        if (esPaginaProtegida) {
            console.log("Usuario detectado, activando sistema...");
            setupUI();        // Activa botones y modales
            await cargarFacturas(); // Carga los datos de Firebase
        }
    } else {
        // SI NO HAY USUARIO: Y trata de ver el panel, lo sacamos
        if (esPaginaProtegida) {
            window.location.href = 'index.html'; 
        }
    }
});
