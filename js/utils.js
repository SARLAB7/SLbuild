// js/utils.js

/* =========================================
   1. FORMATEO DE MONEDA (Peso Colombiano)
   ========================================= */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

/* =========================================
   2. FORMATEO DE FECHAS
   ========================================= */
export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
}

/* =========================================
   3. GENERADOR DE IDS CORTOS (Para facturas/recibos)
   ========================================= */
export function generateShortId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

/* =========================================
   4. VALIDACIÓN DE FORMULARIOS
   ========================================= */
export function validateForm(formData) {
    // Retorna true si todos los campos tienen valor
    return Object.values(formData).every(value => value.trim() !== "");
}

/* =========================================
   5. NOTIFICACIONES (Wrapper para Toastify)
   ========================================= */
// Esto centraliza el estilo de SACLAB para que no lo repitas en cada archivo
export function notify(message, type = "success") {
    const bgColor = type === "success" ? "#210DAA" : "#ef4444"; // Azul Neón o Rojo
    const textColor = "#ffffff";

    if (typeof Toastify !== "undefined") {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: bgColor,
                color: textColor,
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
            }
        }).showToast();
    } else {
        console.warn("Toastify no está cargado. Mensaje:", message);
    }
}
