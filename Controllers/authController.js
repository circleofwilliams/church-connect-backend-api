const Joi = require('joi');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { authValidator } = require('../Schemas/authSchema');
const { supabaseClient } = require('../Config/supabaseConfig');
const {
  sendMessage,
  encryptPassword,
  queryDatabase,
  insertIntoDatabase,
  generateAccessToken,
  isValidCredentials,
} = require('../Utils/utilityFunctions');

const signup = async (req, res, next) => {
  try {
    // validating users data from request body
    let { value: validatedResult, error: validationError } =
      authValidator.signupSchema.validate(req.body);

    if (validationError) {
      throw new createError.UnprocessableEntity(
        `Cannot process your data, ${validationError.details[0].message}`,
      );
    }

    // checking if username exists in the database
    const existingUsername = await queryDatabase(
      'users',
      'username',
      validatedResult.username,
    );

    if (existingUsername.length > 0)
      throw new createError.Conflict('username already exists!');

    //checking if email exist in the database
    const existingEmail = await queryDatabase(
      'users',
      'email',
      validatedResult.email,
    );

    if (existingEmail.length > 0)
      throw new createError.Conflict('email already exists!');

    //encryting the password.
    validatedResult.password = await encryptPassword(validatedResult.password);

    // //storing new user inside the database.
    await insertIntoDatabase('users', validatedResult);

    //success message on saving the database
    sendMessage(res, 201, false, 'Created successfully');
  } catch (error) {
    console.error('Error from signup:', error.message);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // validating users data from request body
    let { value: validatedResult, error: validationError } =
      authValidator.loginSchema.validate(req.body);

    if (validationError) {
      throw new createError.UnprocessableEntity(
        `Cannot process your data, ${validationError.details[0].message}`,
      );
    }

    //sending the access token to cookies after confirming credentials are valid
    if (
      await isValidCredentials(
        validatedResult.username,
        validatedResult.password,
      )
    ) {
      const payload = { username: validatedResult.username };
      const expiresIn = 30 * 24 * 60 * 60;
      const accessToken = generateAccessToken(payload, expiresIn);
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      sendMessage(res, 200, false, 'Login success.');
    } else {
      throw new createError.Unauthorized();
    }
  } catch (error) {
    console.error('Error from login:', error.message);
    next(error);
  }
};

//logout controller
const logout = (req, res, next) => {
  try {
    res.send('logout');
  } catch (error) {
    console.error('Error from logout:', error.message);
    next(error);
  }
};

module.exports = { signup, login, logout };
