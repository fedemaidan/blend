const { getSheetData } = require('../../services/google/General');
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Principios';
const RANGE = `${SHEET_NAME}!A1:Z`;

module.exports = async function getPrincipiosActivosConStock({ incluirPropios = false } = {}) {
  try {
    const rows = await getSheetData(SHEET_ID, RANGE);
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const principiosMap = new Map();

    for (const row of dataRows) {
      const rowObj = Object.fromEntries(headers.map((key, i) => [key.trim(), row[i]?.toString().trim()]));

      const nombre = rowObj["nombre"]?.trim();
      const isActivo = (rowObj["activo"] || "").toUpperCase().includes("SI");
      const esBlend = (rowObj["Blend ?"] || "").toUpperCase().includes("SI");

      if (!nombre) {
        console.log(`⛔ Ignorado: sin nombre válido`);
        continue;
      }
      if (!isActivo) {
        console.log(`⛔ Ignorado: principio inactivo -> ${nombre}`);
        continue;
      }
      if (!incluirPropios && esBlend) {
        console.log(`⛔ Ignorado: producto propio (Blend) -> ${nombre}`);
        continue;
      }

      const concentraciones = [];
      for (let i = 1; i <= 6; i++) {
        const raw = rowObj[`concentracion ${i}`];
        const valor = parseFloat(raw);
        if (!isNaN(valor)) {
          const normalizado = valor / 100;
          concentraciones.push({ id: `${nombre}-${normalizado}`, concentracion: normalizado });
        }
      }

      if (concentraciones.length === 0) {
        console.log(`⛔ Ignorado: sin concentraciones numéricas válidas -> ${nombre}`);
        continue;
      }

      principiosMap.set(nombre, {
        principio_activo: {
          id: nombre,
          nombre,
          alias: rowObj["alias"] || "",
          precio: parseFloat(rowObj["precio"]) || 0,
          precio_maximo: parseFloat(rowObj["precio_maximo"]) || 0,
          activo: isActivo,
          createdAt: null,
          updatedAt: null
        },
        concentraciones
      });
    }

    return Array.from(principiosMap.values());
  } catch (error) {
    console.error("❌ Error al obtener principios activos desde Google Sheet:", error);
    throw new Error("No se pudieron obtener los principios activos desde la hoja.");
  }
};
