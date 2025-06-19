const { addRow } = require('../../services/google/General');
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'OfertasRaw';
const RANGE = `${SHEET_NAME}!A1:Z`;

module.exports = async function ConfessionarOferta(oferta, userId) {
  try {
    if (!oferta || !oferta[0]) throw new Error("Oferta vacía o inválida");

    const tipo = oferta[0].tipo;
    const now = new Date();
    const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const aporte = oferta[0].cliente_aporta;
    const recibe = oferta[0].cliente_recibe.productos[0];
    const blend = oferta[0].cliente_recibe.productos[1];
    const resumen = oferta[0].resumen_operacion;

    const cleanUserId = userId.split('@')[0];
    const linkWhatsapp = `https://wa.me/${cleanUserId}`;

    const fila = [
      tipo,
      fecha,
      cleanUserId,

      aporte.nombre_principio || '',
      aporte.concentracion ? parseFloat(aporte.concentracion) * 100 : '',
      aporte.cantidad || '',
      aporte.precio_unitario || '',
      aporte.valor_total_aportado || '',

      recibe?.producto?.nombre || recibe?.producto || '',
      recibe?.concentracion ? parseFloat(recibe.concentracion) * 100 : '',
      recibe?.cantidad || '',
      recibe?.precio_unitario || '',
      recibe?.valor_total || '',

      blend?.producto?.principio || '',
      blend?.producto?.concentracion ? parseFloat(blend.producto.concentracion) * 100 : '',
      blend?.cantidad || '',
      blend?.producto?.precio || '',
      blend?.producto?.rentabilidad || '',
      blend?.valor_total || '',

      resumen?.resultado_final || ''
    ];

    await addRow(SHEET_ID, fila, RANGE);
    console.log("✅ Oferta registrada en Google Sheet");
  } catch (err) {
    console.error("❌ Error al guardar la oferta en Google Sheet:", err);
  }
};