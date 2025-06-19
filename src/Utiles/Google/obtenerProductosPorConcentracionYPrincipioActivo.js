const { getSheetData } = require('../../services/google/General');
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Principios';
const RANGE = `${SHEET_NAME}!A1:Z`;

module.exports = async function obtenerProductosPorConcentracionYPrincipioActivo(principioActivo, concentracion) {
  try {
    const rows = await getSheetData(SHEET_ID, RANGE);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const productos = [];

    for (const row of dataRows) {
      const rowObj = Object.fromEntries(headers.map((key, i) => [key.trim(), row[i]?.toString().trim()]));

      const nombre = rowObj["nombre"]?.trim();
      const activo = (rowObj["activo"] || "").toUpperCase().includes("SI");

      if (!nombre || nombre !== principioActivo.nombre.trim()) continue;
      if (!activo) continue;

      for (let i = 1; i <= 6; i++) {
        const concKey = `concentracion ${i}`;
        const raw = rowObj[concKey];
        const valor = parseFloat(raw);
        const normalizado = !isNaN(valor) ? valor / 100 : NaN;

        if (!isNaN(normalizado) && normalizado === parseFloat(concentracion)) {
          productos.push({
            id: `${nombre}-${normalizado}`,
            marca: "Generic",            // FALTA: no hay columna "marca"
            empresa: "Generic",          // FALTA: no hay columna "empresa"
            stock: 5000,                 // FALTA: no hay columna "stock"
            precio: parseFloat(rowObj["precio"]) || 0,
            precio_maximo: parseFloat(rowObj["precio_maximo"]) || 0,
            precio_minimo: parseFloat(rowObj["precio"]) || 0, // asumimos igual al precio base
            activos: true,               // Se chequeó arriba
            rentabilidad: null           // FALTA: no hay columna "rentabilidad"
          });
        }
      }
    }

    return productos;
  } catch (error) {
    console.error('❌ Error al obtener productos por concentración y principio activo desde Google Sheet:', error);
    throw new Error('No se pudieron obtener los productos.');
  }
};
