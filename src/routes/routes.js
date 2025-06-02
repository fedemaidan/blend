const express = require("express");
const configuracionRoutes = require("./configuracion");
const stockRoutes = require("./stock");
const ofertasRoutes = require("./ofertas");

const router = express.Router();

router.use("/configuracion", configuracionRoutes);
router.use("/stock", stockRoutes);
router.use("/ofertas", ofertasRoutes);

module.exports = router;
