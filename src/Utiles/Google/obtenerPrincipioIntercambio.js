const { getSheetData } = require('../../services/google/General');
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Principios';
const RANGE = `${SHEET_NAME}!A1:Z`;

module.exports = async function obtenerPrincipioIntercambio() {
  try {
    const rows = await getSheetData(SHEET_ID, RANGE);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const principiosMap = new Map();

    for (const row of dataRows) {
      const rowObj = Object.fromEntries(headers.map((key, i) => [key.trim(), row[i]?.toString().trim()]));

      const activo = rowObj["activo"]?.toUpperCase() === "SI";
      const esPropio = rowObj["Blend ?"]?.toUpperCase() === "SI";
      const nombre = rowObj["nombre"]?.trim();

      if (!activo || esPropio || !nombre) continue;

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
        const raw = rowObj[`concentracion ${i}`];
        const conc = parseFloat(raw);
        if (!isNaN(conc)) {
          const normalizado = conc / 100;
          if (!agrupado.concentraciones.has(normalizado)) {
            agrupado.concentraciones.set(normalizado, {
              id: `${nombre}-${normalizado}`, // ID simulado
              concentracion: normalizado
            });
          }
        }
      }
    }

    return Array.from(principiosMap.values()).map(pa => ({
      principio_activo: pa.principio_activo,
      concentraciones: Array.from(pa.concentraciones.values())
    }));
  } catch (error) {
    console.error("❌ Error al obtener principios activos (sin productos propios):", error);
    throw new Error("No se pudieron obtener los principios activos para el intercambio.");
  }
};