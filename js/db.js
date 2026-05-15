// js/db.js
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function guardarFactura(datos) {
    try {
        const docRef = await addDoc(collection(db, "facturas"), {
            ...datos,
            fecha: new Date().toISOString()
        });
        
        // Usando Toastify (Librería externa ligera)
        Toastify({
            text: "Factura registrada en SACLAB",
            duration: 3000,
            gravity: "top", 
            position: "right",
            style: { background: "var(--accent-neon)", color: "#000" }
        }).showToast();

    } catch (e) {
        console.error("Error: ", e);
    }
}
