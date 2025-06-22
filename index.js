require("dotenv").config();
const connectToWhatsApp = require("./src/services/Mensajes/whatsapp");
const QRCode = require("qrcode");
const cors = require("cors");
const express = require("express");
const apiRoutes = require("./src/routes/routes");

const app = express();
const port = process.env.PORT || 3005;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", apiRoutes);

// 🔄 Variable compartida para el QR (movida arriba para compartir)
let latestQR = null;
const setLatestQR = (qr) => { latestQR = qr; };
const getLatestQR = () => latestQR;

app.get("/qr", (req, res) => {
  const qr = getLatestQR();
  if (!qr) {
    return res.send("QR no generado aún. Espera...");
  }
  QRCode.toDataURL(qr, (err, url) => {
    if (err) return res.status(500).send("Error generando QR");
    res.send(`<img src="${url}" style="width:300px;">`);
  });
});

const startBot = async () => {
  const sock = await connectToWhatsApp(setLatestQR); // ✅ Le pasamos el setter del QR
  setInterval(() => console.log('Keep-alive'), 5 * 60 * 1000);
  
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}/qr`);
    console.log(`- API disponible en http://localhost:${port}/api/`);
    console.log(`- QR disponible en http://localhost:${port}/qr`);
  });
};

startBot();
