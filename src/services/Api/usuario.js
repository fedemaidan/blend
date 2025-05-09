const { Usuario } = require("../../../models");

const createUser = async (usuario, permisos, userId) => {
  const newUser = await Usuario.create({
    usuario,
    permisos,
    userId,
  });

  return {
    success: true,
    newUser,
  };
};

const deleteUser = async (id) => {
  const deletedUser = await Usuario.destroy({ where: { id } });
  return deletedUser;
};

const updateUser = async (id, updateFields) => {
  const updatedUser = await Usuario.update(updateFields, { where: { id } });
  return updatedUser;
};

const existsUser = async (usuario) => {
  const existingUser = await Usuario.findOne({ where: { usuario } });
  return !!existingUser;
};

const getUserById = async (id) => {
  const user = await Usuario.findOne({ where: { id } });
  return user;
};
const getUserByName = async (usuario) => {
  const user = await Usuario.findOne({ where: { usuario } });
  return user;
};

module.exports = {
  createUser,
  existsUser,
  deleteUser,
  updateUser,
  getUserById,
  getUserByName,
};
