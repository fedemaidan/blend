const { getSheetData } = require('../../services/google/General');
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Principios';
const RANGE = `${SHEET_NAME}!A1:Z`;

module.exports = async function ObtenerPrincipiosBlend() {
  try {
    const rows = await getSheetData(SHEET_ID, RANGE);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const principiosMap = new Map();

    for (const row of dataRows) {
      const rowObj = Object.fromEntries(headers.map((key, i) => [key.trim(), row[i]?.toString().trim()]));

      const nombre = rowObj["nombre"]?.trim();
      const activo = (rowObj["activo"] || "").toUpperCase().includes("SI");
      const esBlend = (rowObj["Blend ?"] || "").toUpperCase().includes("SI");

      if (!nombre || !activo || !esBlend) continue;

      const rentabilidadGlobal = parseFloat(rowObj["%xP"]);
      const rentabilidad = !isNaN(rentabilidadGlobal) ? rentabilidadGlobal / 100 : null;

      if (!principiosMap.has(nombre)) {
        principiosMap.set(nombre, {
          principio_activo: {
            id: nombre,
            nombre,
            alias: rowObj["alias"] || "",
            precio: parseFloat(rowObj["precio"]) || 0,
            precio_maximo: parseFloat(rowObj["precio_maximo"]) || 0,
            activo: true,
            createdAt: null,
            updatedAt: null
          },
          concentraciones: new Map()
        });
      }

      const agrupado = principiosMap.get(nombre);

      for (let i = 1; i <= 6; i++) {
        const rawConc = rowObj[`concentracion ${i}`];
        const conc = parseFloat(rawConc);
        const normalizado = !isNaN(conc) ? conc / 100 : NaN;

        if (!isNaN(normalizado) && !agrupado.concentraciones.has(normalizado)) {
          agrupado.concentraciones.set(normalizado, {
            id: `${nombre}-${normalizado}`,
            concentracion: normalizado,
            rentabilidad: rentabilidad // misma para todas las concentraciones
          });
        }
      }
    }

    return Array.from(principiosMap.values()).map(pa => ({
      principio_activo: pa.principio_activo,
      concentraciones: Array.from(pa.concentraciones.values())
    }));
  } catch (error) {
    console.error('❌ Error al obtener principios activos de blend:', error);
    throw new Error('No se pudo obtener la información de blend.');
  }
};
