require('dotenv').config();
const { supabaseClient } = require('../Config/supabaseConfig');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sendMessage = (res, statusCode, errorMsg, msgContent, data) => {
  if (!statusCode || statusCode === 500) {
    msgContent = 'Internal Server Error.';
  }
  res
    .status(statusCode)
    .json({ error: errorMsg, message: msgContent, data: data || {} });
};

const encryptPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    if (!hash) {
      console.log('Password is not hashed...');
      throw new createError.InternalServerError();
    }
    return hash;
  } catch (error) {
    console.error('Error from encryptPassword:', error.message);
    throw error;
  }
};

const queryDatabase = async (tablename, column, value) => {
  try {
    const { data: existingRecord, error: Error } = await supabaseClient
      .from(tablename)
      .select()
      .eq(column, value);

    if (Error) {
      console.error('Error fetching from database...', Error.message);
      throw new createError.InternalServerError();
    }

    return existingRecord;
  } catch (error) {
    console.error('Error from queryDatabase: ', error.message);
    throw error;
  }
};

const insertIntoDatabase = async (tablename, data) => {
  try {
    const { error: Error } = await supabaseClient.from(tablename).insert(data);

    if (Error) {
      console.error('Error inserting into database', Error.message);
      throw new createError.InternalServerError();
    }
  } catch (error) {
    console.log('Error from insertIntoDatabase', error.message);
    throw error;
  }
};

const generateAccessToken = (payload, expiresIn) => {
  try {
    const tokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign(payload, tokenSecret, { expiresIn });
    return token;
  } catch (error) {
    console.log('Error from generateAccessToken', error.message);
    throw error;
  }
};

const isValidCredentials = async (username, password) => {
  //checking if the user is in the database
  try {
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
  } catch (error) {
    console.error('Error from isValidCredentials', error.message);
    throw error;
  }
};

module.exports = {
  sendMessage,
  encryptPassword,
  queryDatabase,
  insertIntoDatabase,
  generateAccessToken,
  isValidCredentials,
};
