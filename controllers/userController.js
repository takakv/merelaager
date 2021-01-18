require("dotenv").config();
const db = require("../models/database");
const bcrypt = require("bcrypt");

const Users = db.users;

const userExists = async (username) => {
  const user = await Users.findByPk(username);
  return !!user;
};

const createUser = async (username, password) => {
  const salt = bcrypt.genSaltSync(parseInt(process.env.SALTR));
  const hash = bcrypt.hashSync(password, salt);
  try {
    await Users.create({
      username: username,
      password: hash,
    });
    return true;
  } catch {
    return false;
  }
};

exports.create = async (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;

  const isNew = !(await userExists(username));
  if (!isNew) {
    res.status(400).end();
    return;
  }

  const creationSuccessful = await createUser(username, password);
  if (!creationSuccessful) res.status(400).end();
  else res.status(201).end();
};
