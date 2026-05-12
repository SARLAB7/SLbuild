import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Aquí irán las credenciales de Firebase de SARLAB
const firebaseConfig = {
  apiKey: import.meta.env.FB_API_KEY,
  authDomain: import.meta.env.FB_AUTH_DOMAIN,
  projectId: import.meta.env.FB_PROJECT_ID,
  storageBucket: "slbuild2.firebasestorage.app",
  messagingSenderId: "676234118482",
  appId: import.meta.env.FB_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
