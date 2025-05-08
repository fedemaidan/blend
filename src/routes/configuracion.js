const express = require("express");
const {
  createUser,
  existsUser,
  deleteUser,
  updateUser,
  getUserById,
} = require("../services/Api/usuario");
const {
  setRentabilidadDeseada,
} = require("../services/Api/rentabilidadDeseada");

const router = express.Router();

router.post("/usuario", async (req, res) => {
  try {
    const { usuario, permisos, userId } = req.body;

    if ((!usuario || !permisos, !userId)) {
      return res.status(400).json({
        message: "El usuario y los permisos son obligatorios",
      });
    }

    const existingUser = await existsUser(usuario);
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const newUser = await createUser(usuario, permisos, userId);

    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error al agregar el usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.delete("/usuario/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await deleteUser(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.put("/usuario/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { permisos } = req.body;

    if (!permisos) {
      return res.status(400).json({ message: "Los permisos son obligatorios" });
    }

    const updatedUser = await updateUser(userId, { permisos });

    if (!updatedUser[0]) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = await getUserById(userId);
    return res.status(200).json({
      message: "Usuario actualizado",
      user,
    });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.put("/rentabilidad-deseada", async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ message: "El valor es obligatorio" });
    }

    const rentabilidad = await setRentabilidadDeseada(value);
    return res.status(200).json({
      message: "Rentabilidad deseada actualizada",
      rentabilidad,
    });
  } catch (error) {
    console.error("Error al establecer rentabilidad deseada:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
