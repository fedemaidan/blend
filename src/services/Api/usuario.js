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

const deleteUser = async (userId) => {
  const deletedUser = await Usuario.destroy({ where: { userId } });
  return deletedUser;
};

const updateUser = async (userId, updateFields) => {
  const updatedUser = await Usuario.update(updateFields, { where: { userId } });
  return updatedUser;
};

const existsUser = async (usuario) => {
  const existingUser = await Usuario.findOne({ where: { usuario } });
  return !!existingUser;
};

const getUserById = async (userId) => {
  const user = await Usuario.findOne({ where: { userId } });
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
