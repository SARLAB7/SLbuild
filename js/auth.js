// auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. Lógica de Inicio de Sesión
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, pass)
            .then((userCredential) => {
                // Login exitoso, redirigir al Dashboard
                window.location.href = "panel.html";
            })
            .catch((error) => {
                alert("Error de acceso: " + error.message);
            });
    });
}

// 2. Observador de Estado (Protección de la página)
// Coloca esto en todas tus páginas para que nadie entre "por la fuerza"
export function vigilarSesion() {
    onAuthStateChanged(auth, (user) => {
        if (!user && window.location.pathname.includes('index.html')) {
            // Si no hay usuario y está en el dashboard, mandarlo al login
            window.location.href = 'login.html';
        }
    });
}
