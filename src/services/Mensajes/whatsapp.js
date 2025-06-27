const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const SocketSingleton = require('../../services/SockSingleton/sockSingleton');

const connectToWhatsApp = async (setQR) => {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    emitOwnEvents: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && setQR) {
      setQR(qr); // ✅ QR actualizado correctamente en el proceso principal
      console.log('QR actualizado. Escanea en: http://localhost:3005/qr');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log('Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) connectToWhatsApp(setQR);
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  console.log('SINGLETON ACTUALIZADO');
  await SocketSingleton.setSock(sock);


  return sock;
};

module.exports = connectToWhatsApp;
