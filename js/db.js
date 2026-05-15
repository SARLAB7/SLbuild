import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { notify } from './utils.js';

export async function guardarFactura(datos) {
    try {
        const facturasRef = collection(db, "facturas");
        await addDoc(facturasRef, {
            ...datos,
            monto: parseFloat(datos.monto),
            fechaCreacion: serverTimestamp(),
            estado: datos.estado || 'Pendiente'
        });
        notify("Factura registrada en SACLAB con éxito");
        return true;
    } catch (e) {
        console.error("Error al guardar factura:", e);
        notify("Error al guardar en sistema", "error");
        return false;
    }
}

export async function cargarFacturas() {
    console.log("Cargando facturas desde Firestore...");
    return []; 
}

export async function guardarConfiguracion(uid, seccion, datos) {
    try {
        const userRef = doc(db, "usuarios", uid);
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

export async function obtenerConfiguracion(uid) {
    try {
        const userRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error al obtener configuración:", error);
        return null;
    }
}
