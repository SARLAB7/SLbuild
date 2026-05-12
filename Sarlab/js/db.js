import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Referencia a la colección principal de facturas
const facturasRef = collection(db, "facturas");

// 1. Función para agregar una factura (Solo se ejecuta cuando tú llenas un formulario)
export async function agregarFactura(datosFactura) {
    try {
        const docRef = await addDoc(facturasRef, {
            ...datosFactura,
            fechaCreacion: new Date() // Sello de tiempo automático
        });
        console.log("Factura registrada con éxito. ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Error al guardar la factura: ", error);
        return false;
    }
}

// 2. Función para leer facturas y mostrarlas en la UI
export async function cargarFacturas() {
    const contenedor = document.getElementById('transactions-container');
    
    try {
        // Traemos los datos ordenados por fecha
        const q = query(facturasRef, orderBy("fechaCreacion", "desc"));
        const querySnapshot = await getDocs(q);

        // Si Firebase está vacío, dejamos el "Empty State" que está en el HTML
        if (querySnapshot.empty) {
            return; 
        }

        // Si hay datos, limpiamos el contenedor y renderizamos
        contenedor.innerHTML = ''; 

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Aquí construiremos el HTML de cada fila de transacción
            const filaHTML = `
                <div class="transaction-row" style="display: flex; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--border-color);">
                    <div style="color: var(--text-primary);">${data.cliente || 'Cliente sin nombre'}</div>
                    <div style="color: var(--text-secondary);">${data.estado || 'Pendiente'}</div>
                    <div style="font-weight: bold; color: var(--text-primary);">$${data.monto || '0.00'}</div>
                </div>
            `;
            contenedor.innerHTML += filaHTML;
        });

    } catch (error) {
        console.error("Error al cargar las facturas: ", error);
    }
}