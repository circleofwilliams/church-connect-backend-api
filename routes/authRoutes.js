require('dotenv').config();
const { Router } = require('express');
const authHelpers = require('../utils/auth');
const authControllers = require('../controllers/authController');

const authRoute = Router();

//handling the signup route
authRoute.post('/signup', authControllers.signup);

//handling the login route
authRoute.post('/login', authControllers.login);

//handling forgot password
authRoute.post('/forgotPassword', authControllers.forgotPassword);

//handling password reset
authRoute.patch('/resetPassword/:token', authControllers.resetPassword);

//handling the logout route
authRoute.delete(
  '/logout',
  authHelpers.authenticateToken,
  authControllers.logout,
);

module.exports = authRoute;
