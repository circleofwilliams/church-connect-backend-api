require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const createError = require('http-errors');

const { sendMessage } = require('./utils/database');
const { authRoute } = require('./routes/authRoutes');
const { logWriter } = require('./utils/logger');

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const message = `${req.headers.origin}\t${req.method}\t${req.url}`;
  logWriter(message, 'requestsLog.log');
  next();
});

const PORT = process.env.PORT || 6244;

app.get('/', (req, res) => {
  sendMessage(res, 200, false, 'Welcome to Church connect backend Api');
});

app.use('/auth', authRoute);

app.use((req, res, next) => {
  next(createError.NotFound('This page is unavailable!'));
});

app.use((error, req, res) => {
  const message = `${error.name}:, ${error.message}`;
  logWriter(message, 'errorsLogs.log');
  sendMessage(res, error.statusCode || 500, true, error.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
