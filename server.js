require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');

const helpers = require('./utils/helpers');
const authRoute = require('./routes/authRoutes');

// creating an app instance.
const app = express();

//setting middlewares that works before response is sent.
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//request logger middleware.
app.use(helpers.requestLogger);

//port is an environment variable or 6244.
const PORT = process.env.PORT || 6244;
//interface to run server
const INTERFACE = '192.168.43.11';

//handling home route
app.get('/', (req, res) => {
  const messageOptions = {
    statusCode: 200,
    msgContent: 'Welcome to Church connect backend Api',
  };
  helpers.sendMessage(res, messageOptions);
});

//handling all routes with /auth/...
app.use('/auth', authRoute);

//handling not found routes
app.use((req, res, next) => {
  next(
    new createError.NotFound(
      'The page is not found or the http method is not supported!',
    ),
  );
});

//error handler
app.use(helpers.errorHandler);

//starting the server
app.listen(PORT, INTERFACE, () => {
  console.log(`Server listening on http://${INTERFACE}:${PORT}`);
});
