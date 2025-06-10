const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Product, PrincipioActivo, Concentracion, sequelize } = require('../../models'); // Asegúrate de que la ruta sea correcta a tu modelo
const { Op } = require("sequelize");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Ruta del archivo CSV
const filePath = process.argv[2];

if (!filePath) {
    console.error("Por favor, proporciona la ruta del archivo CSV como argumento.");
    process.exit(1);
}

// Verifica que el archivo proporcionado sea un archivo .csv
if (path.extname(filePath) !== '.csv') {
    console.error("Por favor, proporciona un archivo con extensión .csv");
    process.exit(1);
}

async function processCSV(filePath) {
    let productos = [];

    // Lee el archivo CSV y convierte cada fila en un objeto
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
            // if (row.registro === "S_40345") {
                const activosArray = row.activos.split('##').map((activo) => activo.trim());
                let precioProducto = 0; // Precio acumulado del producto
                let concentraciones = []; // Datos para crear entidades de Concentracion
                
                for (const activoStr of activosArray) {
                    const match = activoStr.match(/(.+?)\s(\d+(\,\d+)?)%/);
                    if (match) {
                        const nombreActivo = match[1].trim();
                        const auxPorcentaje = match[2].replace(',', '.');
                        
                        const porcentaje = parseFloat(auxPorcentaje) / 100;
                        
                        const transaction = await sequelize.transaction();
                        try {
                            let principioActivo = await PrincipioActivo.findOne({ 
                                where: { nombre: { [Op.eq]: nombreActivo } },
                                transaction 
                            });
    
                            if (!principioActivo) {
                                principioActivo = await PrincipioActivo.create({
                                    nombre: nombreActivo,
                                    precio: 100,
                                    precio_maximo: 110,
                                    activo: false,
                                    alias: []
                                }, { transaction });
                            }
    
                            await transaction.commit();
    
                            const precioActivo = principioActivo.precio * porcentaje;
                            precioProducto += precioActivo;
    
                            // Agregar a la lista de concentraciones
                            concentraciones.push({
                                id_principio_activo: principioActivo.id,
                                id_producto: null, // Se asignará después de crear el producto
                                concentracion: porcentaje
                            });
    
                        } catch (error) {
                            await transaction.rollback();
                            console.error(`Error procesando el principio activo ${nombreActivo}:`, error);
                        }
    
                    }
                };
    
                // Crear datos del producto
                const productoData = {
                    registro: row.registro,
                    registro_senasa: row.registro_senasa || "",
                    registo_inase: row.registo_inase || "",
                    especie: row.especie || "",
                    cultivar: row.cultivar || "",
                    marca: row.marca || 'Sin Marca',
                    empresa: row.empresa || 'Sin Empresa',
                    activos: row.activos,
                    banda_toxicologica: "",
                    precio: precioProducto || 0,
                    precio_minimo: 0,
                    precio_maximo: precioProducto * 1.10,
                    producto_propio: row.producto_propio === 'TRUE' || row.producto_propio === 'true',
                    stock: 0,
                    potencial_proveedor: row.potencial_proveedor || "",
                    rentabilidad: 0, 
                };
    
                productos.push({ productoData, concentraciones });
            // }
        })
        .on('end', async () => {
            try {
                for (const { productoData, concentraciones } of productos) {
                    // Crear producto
                    const producto = await Product.create(productoData);
                    
                    // Asignar el productoId a las concentraciones y crearlas
                    for (const concentracion of concentraciones) {
                        concentracion.id_producto = producto.id;
                    }
                    await Concentracion.bulkCreate(concentraciones);
                }
            } catch (error) {
            }
        })
        .on('error', (err) => {
            console.error('Error al procesar el archivo CSV:', err.message);
        });
}

// Ejecuta el proceso de importación
processCSV(filePath);
