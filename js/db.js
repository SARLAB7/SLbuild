// js/db.js
import { db } from './firebase-config.js';
// Cambiamos la URL por la librería instalada
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

const facturasRef = collection(db, "facturas");

export async function agregarFactura(datosFactura) {
    try {
        const docRef = await addDoc(facturasRef, {
            ...datosFactura,
            fechaCreacion: new Date()
        });
        console.log("Factura registrada con éxito. ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Error al guardar la factura: ", error);
        return false;
    }
}

export async function cargarFacturas() {
    const contenedor = document.getElementById('transactions-container');
    if (!contenedor) return;
    
    try {
        const q = query(facturasRef, orderBy("fechaCreacion", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return; 

        contenedor.innerHTML = ''; 

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Usamos las clases de badge que definimos en components.css
            const statusClass = data.estado?.toLowerCase() === 'pagada' ? 'badge success' : 'badge warning';
            
            const filaHTML = `
                <div class="transaction-row" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--border-color);">
                    <div>
                        <div style="color: var(--text-primary); font-weight: 500;">${data.cliente || 'Cliente sin nombre'}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Factura #${doc.id.substring(0,5)}</div>
                    </div>
                    <div class="${statusClass}">${data.estado || 'Pendiente'}</div>
                    <div style="font-weight: bold; color: var(--accent-neon);">$${Number(data.monto).toLocaleString()}</div>
                </div>
            `;
            contenedor.innerHTML += filaHTML;
        });

    } catch (error) {
        console.error("Error al cargar las facturas: ", error);
    }
}

// Referencia para la sección de clientes
const clientesRef = collection(db, "clientes");

export async function guardarCliente(datosCliente) {
    try {
        await addDoc(clientesRef, {
            ...datosCliente,
            creadoEn: new Date()
        });
        return true;
    } catch (error) {
        console.error("Error al crear cliente:", error);
        return false;
    }
}
/**
 * Lógica Profesional de Facturación con Impuestos
 */
export async function crearFacturaProfesional(datos) {
    const subtotal = Number(datos.monto);
    
    // Cálculos automáticos (Localización Colombia)
    const iva = subtotal * 0.19;
    const retefuente = subtotal * 0.04; // Ejemplo: 4% para servicios
    const total = subtotal + iva - retefuente;

    try {
        // 1. Guardar la Factura
        const facturaRef = await addDoc(collection(db, "facturas"), {
            ...datos,
            subtotal,
            iva,
            retefuente,
            total,
            fecha: serverTimestamp()
        });

        // 2. GENERAR ASIENTO CONTABLE (Partida Doble)
        await registrarAsiento({
            facturaId: facturaRef.id,
            tipo: 'ingreso',
            descripcion: `Venta: ${datos.cliente}`,
            debe: total,      // Entra a Bancos/Caja
            haber: subtotal,  // Es un Ingreso
            impuestos: iva    // Pasivo por pagar a la DIAN
        });

        return true;
    } catch (e) {
        console.error("Error contable:", e);
        return false;
    }
}

async function registrarAsiento(movimiento) {
    return await addDoc(collection(db, "asientos"), {
        ...movimiento,
        fecha: serverTimestamp()
    });
}
