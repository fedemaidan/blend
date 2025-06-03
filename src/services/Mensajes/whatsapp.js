// Importa la librería Baileys para conexión con WhatsApp
const {
  default: makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
// Importa Boom para el manejo de errores (opcional)
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");

// Función para conectarse a WhatsApp
const connectToWhatsApp = async (onQRUpdate) => {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("QR actualizado. Escanea en: http://localhost:3000/qr");
      onQRUpdate(qr); // Llama al callback para actualizar el QR
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log("Connection closed. Reconnecting...", shouldReconnect);
      if (shouldReconnect) connectToWhatsApp(onQRUpdate);
    } else if (connection === "open") {
      console.log("✅ Connected to WhatsApp");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
};

// Exporta la función para conectar a WhatsApp
module.exports = connectToWhatsApp;
