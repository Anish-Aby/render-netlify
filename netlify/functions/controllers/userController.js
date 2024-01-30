const User = require("../models/usersModel");

exports.getAllUsers = async (req, res, next) => {
  const users = User.find();

  res.status(200).json({
    status: "success",
    data: users,
  });
};
