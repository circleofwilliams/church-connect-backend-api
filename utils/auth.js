require('dotenv').config();
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { logWriter } = require('../utils/logger');
const { queryDatabase } = require('./database');

const encryptPassword = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  if (!hash) {
    logWriter('Error hashing password', 'errorsLogs.log');
    throw new createError.InternalServerError();
  }
  return hash;
};

const generateAccessToken = (payload, expiresIn) => {
  const tokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const token = jwt.sign(payload, tokenSecret, { expiresIn });
  return token;
};

//token authentication middleware for protected routes
const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;
  const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (token == null) throw new createError.BadRequest();

  jwt.verify(token, tokenSecret, (err, user) => {
    if (err) throw new createError.Unauthorized();
    req.username = user.username;
    next();
  });
};

const isValidCredentials = async (username, password) => {
  const existingUser = await queryDatabase('users', 'username', username);

  if (existingUser.length > 0) {
    const validPassword = await bcrypt.compare(
      password,
      existingUser[0].password,
    );
    if (validPassword) {
      return true;
    }
    return false;
  }
};

module.exports = {
  encryptPassword,
  generateAccessToken,
  authenticateToken,
  isValidCredentials,
};
