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

/*(Conectar la Interfaz con la Base de Datos)*/

export async function inicializarConfiguracion(user) {
    if (!user) return;

    // --- 1. LÓGICA DEL PERFIL (Lo que ya tenías) ---
    const nameInput = document.getElementById('config-name');
    const emailDisplay = document.getElementById('profile-email-display');
    const formPerfil = document.getElementById('form-update-profile');

    if (nameInput) nameInput.value = user.displayName || "";
    if (emailDisplay) emailDisplay.value = user.email; // Cambiado a .value porque es un input disabled

    if (formPerfil) {
        formPerfil.onsubmit = async (e) => {
            e.preventDefault();
            const nuevoNombre = nameInput.value.trim();
            if (!nuevoNombre) return notify("El nombre no puede estar vacío", "error");

            try {
                await updateProfile(user, { displayName: nuevoNombre });
                notify("Perfil actualizado en SACLAB");
                // (Aquí va tu lógica de actualizar avatares visualmente que ya tenías)
            } catch (error) {
                notify("Error al actualizar perfil", "error");
            }
        };
    }

    // --- 2. CARGAR DATOS DE FIRESTORE AL INICIAR ---
    const configData = await obtenerConfiguracion(user.uid);
    if (configData) {
        // Llenar datos de empresa
        if (configData.empresa) {
            document.getElementById('empresa-nombre').value = configData.empresa.nombre || '';
            document.getElementById('empresa-nit').value = configData.empresa.nit || '';
            document.getElementById('empresa-regimen').value = configData.empresa.regimen || 'responsable';
        }
        // Llenar datos de pagos
        if (configData.pagos) {
            document.getElementById('banco-principal').value = configData.pagos.banco || 'bancolombia';
            document.getElementById('cuenta-numero').value = configData.pagos.cuenta || '';
            document.getElementById('instrucciones-pago').value = configData.pagos.instrucciones || '';
        }
    }

    // --- 3. GUARDAR DATOS DE EMPRESA ---
    const formEmpresa = document.getElementById('form-update-empresa');
    if (formEmpresa) {
        formEmpresa.onsubmit = async (e) => {
            e.preventDefault();
            const datosEmpresa = {
                nombre: document.getElementById('empresa-nombre').value.trim(),
                nit: document.getElementById('empresa-nit').value.trim(),
                regimen: document.getElementById('empresa-regimen').value
            };
            await guardarConfiguracion(user.uid, 'empresa', datosEmpresa);
        };
    }

    // --- 4. GUARDAR DATOS DE PAGOS ---
    const formPagos = document.getElementById('form-update-pagos');
    if (formPagos) {
        formPagos.onsubmit = async (e) => {
            e.preventDefault();
            const datosPagos = {
                banco: document.getElementById('banco-principal').value,
                cuenta: document.getElementById('cuenta-numero').value.trim(),
                instrucciones: document.getElementById('instrucciones-pago').value.trim()
            };
            await guardarConfiguracion(user.uid, 'pagos', datosPagos);
        };
    }
}
