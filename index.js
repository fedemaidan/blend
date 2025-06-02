require("dotenv").config();
const connectToWhatsApp = require("./src/services/Mensajes/whatsapp");
const getMessageType = require("./src/services/Mensajes/GetType");
const messageResponder = require("./src/services/Mensajes/messageResponder");
const socketSingleton = require("./src/services/SockSingleton/sockSingleton");
const QRCode = require("qrcode");
// Importa Express para exponer el QR vía web
const express = require("express");
const apiRoutes = require("./src/routes/routes");

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Permitir CORS

// Procesamiento de JSON
app.use(express.json());

// Usar las rutas de la API
app.use("/api", apiRoutes);

// Variable para almacenar el último QR generado (si se requiere)
let latestQR = null;

// Ruta para mostrar el QR en un navegador
app.get("/qr", (req, res) => {
  if (!latestQR) {
    return res.send("QR no generado aún. Espera...");
  }
  // Genera una imagen en base64 del QR y la envía al navegador
  QRCode.toDataURL(latestQR, (err, url) => {
    if (err) return res.status(500).send("Error generando QR");
    res.send(`<img src="${url}" style="width:300px;">`);
  });
});

const startBot = async () => {
  const sock = await connectToWhatsApp();
  await socketSingleton.setSock(sock);

  sock.ev.on("messages.upsert", async (message) => {
    const msg = message.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const messageType = getMessageType(msg.message);

    await messageResponder(messageType, msg, sock, sender);
  });

  setInterval(() => console.log("Keep-alive"), 5 * 60 * 1000);
  setInterval(
    async () => await sock.sendPresenceUpdate("available"),
    10 * 60 * 1000
  );
};

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}/qr`);
  console.log(`- API disponible en http://localhost:${port}/api/`);
  console.log(`- QR disponible en http://localhost:${port}/qr`);
});

startBot();
