const messageResponder = require("../Mensajes/messageResponder");
const autoReporter = require("baileys-status-reporter");
const GetType = require("../Mensajes/GetType");
class SockSingleton {
    constructor() {
        if (!SockSingleton.instance) {
            this.sock = {}; // Se guardará la instancia única de sock
            SockSingleton.instance = this;
        }
        return SockSingleton.instance;
    }
    async setSock(sockInstance) {

        this.sock = sockInstance;
    console.log("🟢🛑🟢 SockSingleton: Instancia de sock establecida correctamente.🟢🛑🟢");
    autoReporter.startAutoReport(this.sock, "blend", "http://localhost:4000/api/reportar");

    
        this.sock.ev.on('messages.upsert', async (message) => {
            
            if (message.type === 'notify') {

                const msg = message.messages[0];


                console.log("🟢 Mensaje recibido from me:", msg.key.fromMe);
                console.log("🟢 Mensaje recibido:", msg.message.conversation);

                console.log("🟢🟢🟢🟢🟢🟢🟢🟢🟢");
                console.log("🟢 Mensaje recibido:", msg.message.extendedTextMessage?.text);

                if (msg.key.fromMe && msg.message.conversation  === 'TODO_OK'  || msg.message.extendedTextMessage?.text === 'TODO_OK') {
                    console.log("🟢 Mensaje de tipo 'TODO_OK' recibido, marcando ping como OK.");
                    autoReporter.marcarPingOK();
                }

                if (!msg.message || msg.key.fromMe) return;

                const sender = msg.key.remoteJid;
                const messageType = GetType(msg.message);

                await messageResponder(messageType, msg, this.sock, sender);
            }
        });
    }
    // Obtiene la instancia del sock
    getSock() {
    if (!this.sock) {
        console.error('🛑 Sock aún no está listo, espera antes de enviar el mensaje.');
        return null;
    }
    return this.sock;
}

}
module.exports = new SockSingleton();
