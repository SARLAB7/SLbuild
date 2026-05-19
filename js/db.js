// js/db.js
import { db } from './firebase-config.js';
import { 
    collection, addDoc, serverTimestamp, 
    doc, setDoc, getDoc,
    onSnapshot, query, orderBy // <-- Nuevas importaciones
} from "firebase/firestore"; 
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
// Nueva función para escuchar facturas en tiempo real
export function suscribirFacturas(callback) {
    const facturasRef = collection(db, "facturas");
    // Ordenamos de la más reciente a la más antigua
    const q = query(facturasRef, orderBy("fechaCreacion", "desc"));
    
    // onSnapshot escucha cambios en la BD en tiempo real
    return onSnapshot(q, (snapshot) => {
        const facturas = [];
        snapshot.forEach((doc) => {
            facturas.push({ id: doc.id, ...doc.data() });
        });
        callback(facturas);
    }, (error) => {
        console.error("Error al cargar facturas:", error);
        notify("Error al cargar la lista de facturas", "error");
    });
}
