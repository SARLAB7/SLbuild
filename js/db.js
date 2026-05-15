// js/db.js
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { notify } from './utils.js';

export async function guardarFactura(datos) {
    try {
        // 1. Referencia a la colección
        const facturasRef = collection(db, "facturas");

        // 2. Guardar en Firestore
        // Usamos serverTimestamp() en lugar de la fecha del PC del cliente
        // para que la hora sea exacta según Google, no según el reloj del usuario.
        await addDoc(facturasRef, {
            ...datos,
            monto: parseFloat(datos.monto), // Aseguramos que sea número
            fechaCreacion: serverTimestamp(),
            estado: datos.estado || 'Pendiente'
        });
        
        // 3. Notificar éxito usando nuestra utilidad
        notify("Factura registrada en SACLAB con éxito");
        
        return true; // Para saber que terminó bien

    } catch (e) {
        console.error("Error al guardar factura:", e);
        notify("Error al guardar en sistema", "error");
        return false;
    }
}
