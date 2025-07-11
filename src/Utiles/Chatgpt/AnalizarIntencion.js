const { getByChatGpt4o } = require("../../services/Chatgpt/Base");
const { obtenerUsuarioPorUserId } = require("../../services/usuario/usuarioBase");

const opciones = [
    {
        // Si no existe un atributo permiso la accion puede ser ejecutada por cualquiera.
        accion: "Menu",
        data: {
            Default: "El usuario envió un mensaje sin coherencia aparente."
        }
    },
    {
        // Si no existe un atributo permiso la accion puede ser ejecutada por cualquiera.
        accion: "No comprendido",
        data: {
            Default: "El usuario envió un mensaje sin coherencia aparente."
        }
    }
];

const analizarIntencion = async (message, sender) => {
    try {

        console.log("Entro a analizar intencion")
        //Obtiene el usuario y sus permisos, mediante el numero de telefono (sender)
        const usuario = await obtenerUsuarioPorUserId(sender);
        const permisosUsuario = (usuario?.permisos || []).map(p => p.toUpperCase());
        console.log("HIZO PATENTE Y PERMISO")

        const opcionesFiltradas = opciones.filter(op => {
            // NO opcion "permiso" = Acceso concedido
            if (!op.hasOwnProperty("permiso")) return true;

            // Validar si el usuario tiene ese permiso
            return permisosUsuario.includes(op.permiso.toUpperCase());
        });

        console.log("Filtro usuario")
        //------------------------- LOGICA DE CHAT GPT-----------------------------//
        const opcionesTxt = JSON.stringify(opcionesFiltradas);

        //los promt comprenden el 90% de que la informacion se valide y busque de buena manera.
        //Recomendacion: llena el formulario pre cargado con lo necesario.
        const prompt = `
Descripcion: Analiza la intencion del usuario y devuelve un json con la accion a realizar.
Formato de respuesta: devuelve el json, de la opcion elegida tal cual esta sin mensajes extras.
Advertencia: Si el mensaje no insinua compra o venta, utiliza la opcion menu.
El usuario dice: "${message}"

Tienes estas acciones posibles. Debes analizar la palabra clave del usuario: ${opcionesTxt}.
`;

console.log("LE esta por enviar el promts")
        const response = await getByChatGpt4o(prompt);
        const respuesta = JSON.parse(response);

        //Chat gpt toma el prompt y nos devuelve un json con la informacion que le requerimos
        //Acciones realizables por chatgpt:
        // coincidencia de articulos(busqueda de stock), Calculos avanzados(existencias y moviemientos), Analizar intencion(que necesita el usuario)
        return respuesta?.json_data || respuesta;
    } catch (error) {
        console.log('Error al analizar la intención:', error.message);
        return { accion: "No comprendido" };
    }
};

module.exports = { analizarIntencion };
