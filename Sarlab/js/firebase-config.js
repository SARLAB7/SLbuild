import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Aquí irán las credenciales de Firebase de SARLAB
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "sarlab-app.firebaseapp.com",
  projectId: "sarlab-app",
  storageBucket: "sarlab-app.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);