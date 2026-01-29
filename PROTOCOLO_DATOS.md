# Protocolo de Gestión y Actualización de Datos
## Hacienda El Copihue - Sistema de Gestión Inmobiliaria

Este documento define el procedimiento estándar para mantener la información del sistema actualizada y veraz.

---

### 1. Estructura de Alimentación del Sistema
El sistema se alimenta de tres fuentes de datos principales ubicadas en la carpeta `/data`:
1.  `Disponibles_2.js`: Lotes en venta con sus atributos técnicos.
2.  `Vendidas_1.js`: Lotes con venta confirmada y datos financieros.
3.  `fotos_copihue_3.js`: Puntos de georreferenciación de fotografías de terreno.

### 2. Procedimiento de Actualización de Lotes (Ventas)
Cuando un lote cambia de estado (de Disponible a Vendido), se debe seguir este flujo:

*   **Paso 1 (Captura)**: El ejecutivo de ventas notifica el cierre de operación incluyendo: N° de Lote, Precio de Cierre, Fecha y Vendedor.
*   **Paso 2 (Transferencia)**: El administrador debe mover el objeto GeoJSON del lote desde `Disponibles_2.js` hacia `Vendidas_1.js`.
*   **Paso 3 (Datos Financieros)**: Al mover el lote, se deben añadir/actualizar las propiedades financieras para que el módulo de informes las detecte:
    ```javascript
    "properties": {
        "Lote": "X",
        "Precio": "45.000.000", // Precio real de cierre
        "FechaVenta": "2025-01-27", // Formato AAAA-MM-DD
        "Vendedor": "Nombre"
    }
    ```

### 3. Procedimiento para Nuevas Fotografías
1.  Tomar la fotografía con GPS activado o anotar el número de lote.
2.  Redimensionar la imagen para web (máximo 1200px de ancho).
3.  Subir la imagen a la carpeta `/images`.
4.  Actualizar `fotos_copihue_3.js` con la nueva ruta de la imagen vinculada al lote correspondiente.

### 4. Actualización del Módulo Financiero
El módulo financiero lee directamente de `Vendidas_1.js`. Para que los informes mensuales y anuales sean precisos:
*   **Validación de Fechas**: Asegurarse de que toda entrada en `Vendidas_1.js` tenga el campo `FechaVenta` en formato ISO (AAAA-MM-DD).
*   **Cierre Mensual**: Se recomienda realizar una revisión los primeros 5 días de cada mes para verificar que el monto total en el dashboard coincide con la contabilidad física.

### 5. Copia de Seguridad
Antes de cualquier modificación manual en la carpeta `/data`, el administrador DEBE realizar una copia de seguridad de los archivos `.js` actuales.

---
*Documento Versión 1.0 - Enero 2026*
