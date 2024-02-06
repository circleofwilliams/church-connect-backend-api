require('dotenv').config();
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const logWriter = require('../utils/logger');
const { queryDatabase } = require('./database');

const errorLog = 'errorsLogs.log';

//ecrypt password to create a hash
const encryptPassword = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  if (!hash) {
    logWriter('Error hashing password', errorLog);
    throw new createError.InternalServerError();
  } else {
    return hash;
  }
};

//generate jwt tokens
const generateToken = (payload, expiresIn) => {
  const tokenSecret = process.env.ACCESS_TOKEN_SECRET;
  try {
    const token = jwt.sign(payload, tokenSecret, { expiresIn });
    return token;
  } catch (error) {
    logWriter('Error generating token', errorLog);
    throw error;
  }
};

//token authentication middleware for protected routes
const authenticateToken = async (req, res, next) => {
  const token = req.cookies.access_token;
  const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (token == null) throw new createError.BadRequest('No authorization token');

  try {
    const user = await jwt.verify(token, tokenSecret);
    req.username = user.username;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new createError.Unauthorized('Token expired');
    }
    throw new createError.Unauthorized('Invalid token');
  }
};

//general token verification
const verifiedToken = async (req, token) => {
  const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

  try {
    const user = await jwt.verify(token, tokenSecret);
    req.username = user.username;
    return user;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new createError.Unauthorized('Token expired');
    }
    throw new createError.Unauthorized('Invalid token');
  }
};

// check if login credentials are valid
const isValidCredentials = async (credentials) => {
  let dbQueryOPtions = {
    tableName: 'users',
    column: 'username',
    columnValue: credentials.username,
  };
  const existingUser = await queryDatabase(dbQueryOPtions);

  //check if user exists
  if (existingUser.length > 0) {
    //check if password is correct
    const validPassword = await bcrypt.compare(
      credentials.password,
      existingUser[0].password,
    );
    if (validPassword) {
      return true;
    }
  }
  return false;
};

const authHelpers = {
  encryptPassword,
  generateToken,
  authenticateToken,
  verifiedToken,
  isValidCredentials,
};

module.exports = authHelpers;
