require('dotenv').config();
const createError = require('http-errors');

const authValidator = require('../schemas/authSchema');
const helpers = require('../utils/helpers');
const dbHelpers = require('../utils/database');
const authHelpers = require('../utils/auth');

const logWriter = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

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
    let dbQueryOPtions = {
      tableName: 'users',
      column: 'username',
      columnValue: validatedResult.username,
    };
    const existingUsername = await dbHelpers.queryDatabase(dbQueryOPtions);

    //if username exist return error
    if (existingUsername.length > 0) {
      throw new createError.Conflict('username already exists!');
    }

    //checking if email exist in the database
    dbQueryOPtions = {
      tableName: 'users',
      column: 'email',
      columnValue: validatedResult.email,
    };
    const existingEmail = await dbHelpers.queryDatabase(dbQueryOPtions);

    //if email exist return error.
    if (existingEmail.length > 0) {
      throw new createError.Conflict('email already exists!');
    }

    //encryting the password.
    validatedResult.password = await authHelpers.encryptPassword(
      validatedResult.password,
    );

    // //storing new user inside the database.
    const dbInsertOptions = {
      tableName: 'users',
      data: validatedResult,
    };
    const insertedIntoDb = await dbHelpers.insertIntoDatabase(dbInsertOptions);

    //success message on saving the database
    if (insertedIntoDb) {
      const messageOptions = {
        statusCode: 201,
        msgContent: 'Created successfully',
      };
      helpers.sendMessage(res, messageOptions);
    }
  } catch (error) {
    logWriter('Error from signup controller.', 'errorsLogs.log');
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

    const credentials = {
      username: validatedResult.username,
      password: validatedResult.password,
    };
    //sending the access token to cookies after confirming credentials are valid
    if (await authHelpers.isValidCredentials(credentials)) {
      const payload = { username: validatedResult.username };
      const expiresIn = 30 * 24 * 60 * 60;
      const accessToken = authHelpers.generateToken(payload, expiresIn);
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      const messageOptions = {
        statusCode: 200,
        msgContent: 'Login success',
      };
      helpers.sendMessage(res, messageOptions);
    } else {
      throw new createError.Unauthorized('Unauthorized, invalid credentials');
    }
  } catch (error) {
    logWriter('Error from login controller', 'errorsLogs.log');
    next(error);
  }
};

//logout controller
const logout = async (req, res, next) => {
  try {
    //clearing access token from cookie.
    res.clearCookie('access_token');
    const messageOptions = {
      statusCode: 204,
      msgContent: 'Logged out',
    };
    helpers.sendMessage(res, messageOptions);
  } catch (error) {
    logWriter('Error from logout controller', 'errorsLogs.log');
    next(error);
  }
};

// forgot password routes handling.. send reset password link to the user.
const forgotPassword = async (req, res, next) => {
  try {
    //validating req.body
    let { value: validatedResult, error: validationError } =
      authValidator.forgotPasswordSchema.validate(req.body);

    if (validationError) {
      throw new createError.UnprocessableEntity(
        `Cannot process your data, ${validationError.details[0].message}`,
      );
    }

    //checking if email exist on database
    let dbQueryOPtions = {
      tableName: 'users',
      column: 'email',
      columnValue: validatedResult.email,
    };
    const existingUser = await dbHelpers.queryDatabase(dbQueryOPtions);

    //if email exist, proceed with sending mail else return error.
    if (existingUser.length > 0) {
      const payload = { username: existingUser[0].username };
      const expiresIn = 15 * 60;
      const resetToken = authHelpers.generateToken(payload, expiresIn);
      const reseturl = `${req.protocol}://${req.get(
        'host',
      )}/auth/resetPassword/${resetToken}`;
      const mailOptions = {
        link: `${req.protocol}://${req.get('host')}/`,
        reciever: existingUser[0].email,
        name: existingUser[0].firstname,
        subject: 'Password Reset',
        reason: 'we recieved a password reset request on your account.',
        action: {
          instructions: 'Click the button below to reset your password:',
          button: {
            color: '#22BC66',
            text: 'Reset your password',
            link: reseturl,
          },
        },
        outro:
          'If you did not request a password request, kindly ignore this email.',
      };
      const sentEmail = await sendEmail(mailOptions);
      if (sentEmail) {
        const messageOptions = {
          statusCode: 200,
          msgContent: 'An email has been sent to you.',
        };
        return helpers.sendMessage(res, messageOptions);
      } else {
        logWriter('Error sending email: ', 'errorsLogs.log');
        throw new createError.InternalServerError();
      }
    } else {
      throw new createError.Unauthorized('Unauthorized, email does not exist');
    }
  } catch (error) {
    logWriter('Error from forgot password controller', 'errorsLogs.log');
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    if (req.params.token) {
      //check if token is correct
      if (await authHelpers.verifiedToken(req, req.params.token)) {
        // validating users data from request body
        let { value: validatedResult, error: validationError } =
          authValidator.resetPasswordSchema.validate(req.body);

        if (validationError) {
          throw new createError.UnprocessableEntity(
            `Cannot process your data, ${validationError.details[0].message}`,
          );
        }

        //checking if user exists in database
        let dbQueryOPtions = {
          tableName: 'users',
          column: 'username',
          columnValue: req.username,
        };
        const user = await dbHelpers.queryDatabase(dbQueryOPtions);
        if (user.length > 0) {
          const newPassword = await authHelpers.encryptPassword(
            validatedResult.password,
          );
          const dataToUpdate = { password: newPassword };
          //updating the value in the databse... remember to restructure this functin parameters!!!
          const dbUpdateOptions = {
            tableName: 'users',
            data: dataToUpdate,
            column: 'username',
            columnValue: user[0].username,
          };
          const updated = await dbHelpers.updateDatabase(dbUpdateOptions);
          if (updated) {
            const messageOptions = {
              statusCode: 200,
              msgContent: 'Password updated successfully',
            };
            return helpers.sendMessage(res, messageOptions);
          }
        } else {
          throw new createError.Unauthorized('User does not exist');
        }
      }
    }
    //throw unauthorize error if no token as parameter
    // or if token is not valid
    throw new createError.Unauthorized('No valid token parameter');
  } catch (error) {
    logWriter('Error from reset password controller', 'errorsLogs.log');
    next(error);
  }
};

const authControllers = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  logout,
};

module.exports = authControllers;
