require('dotenv').config();
const createError = require('http-errors');

const { authValidator } = require('../schemas/authSchema');

const {
  sendMessage,
  queryDatabase,
  insertIntoDatabase,
} = require('../utils/database');

const {
  encryptPassword,
  generateAccessToken,
  isValidCredentials,
} = require('../utils/auth');

const { logWriter } = require('../utils/logger');
// const { sendEmail } = require('../utils/sendEmail');

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

    if (existingUsername.length > 0) {
      throw new createError.Conflict('username already exists!');
    }

    //checking if email exist in the database
    const existingEmail = await queryDatabase(
      'users',
      'email',
      validatedResult.email,
    );

    if (existingEmail.length > 0) {
      throw new createError.Conflict('email already exists!');
    }

    //encryting the password.
    validatedResult.password = await encryptPassword(validatedResult.password);

    // //storing new user inside the database.
    await insertIntoDatabase('users', validatedResult);

    //success message on saving the database
    sendMessage(res, 201, false, 'Created successfully');
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
    logWriter('Error from login controller', 'errorsLogs.log');
    next(error);
  }
};

//logout controller
const logout = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    sendMessage(res, 204, false, 'logged out.');
  } catch (error) {
    logWriter('Error from logout controller', 'errorsLogs.log');
    next(error);
  }
};

// reset password routes handling.. send reset password link to the user.
// const resetPassword = async (req, res, next) => {
//   const mailOptions = {
//     name: 'Taiwo Babs',
//     reason: 'You are training Olamide to be a better developer kissess....',
//     reciever: 'babsman4all@gm.com',
//     subject: 'Your boy is doing this for the first time. Thank you boss!',
//   };
//   const sentEmail = await sendEmail(mailOptions);
//   console.log('sent email:', sentEmail);
//   if (sentEmail) sendMessage(res, 204, false, 'you should recieve an email');
//   else {
//     console.error('Error sentEmail is false', sentEmail);
//     throw new createError.InternalServerError();
//   }
// };

module.exports = { signup, login, logout };
