// js/db.js
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { notify } from './utils.js';
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


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
// js/db.js

// ... (tus otros imports y la función guardarFactura) ...//

export async function cargarFacturas() {
    console.log("Cargando facturas desde Firestore...");
    // Aquí luego pondremos la lógica de Grid.js o tablas
    return []; 
    
}
* Guarda o actualiza la configuración del usuario en Firestore
 * @param {string} uid - El ID del usuario autenticado
 * @param {string} seccion - Puede ser 'empresa' o 'pagos'
 * @param {object} datos - Los datos del formulario
 */
     
export async function guardarConfiguracion(uid, seccion, datos) {
    try {
        const userRef = doc(db, "usuarios", uid);
        
        // setDoc con { merge: true } actualiza solo los campos que le pasamos, 
        // sin borrar la información que ya existía en el documento.
        await setDoc(userRef, {
            [seccion]: datos,
            ultimaActualizacion: new Date()
        }, { merge: true });

        notify(`Datos de ${seccion} guardados correctamente`);
        return true;
    } catch (error) {
        console.error("Error al guardar configuración:", error);
        notify("Error al guardar los datos", "error");
        return false;
    }
}

/**
 * Obtiene toda la configuración de un usuario al iniciar sesión
 */
export async function obtenerConfiguracion(uid) {
    try {
        const userRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No hay configuración previa para este usuario.");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener configuración:", error);
        return null;
    }
}

