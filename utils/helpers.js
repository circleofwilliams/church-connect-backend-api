const logWriter = require('./logger');

const sendMessage = (res, messageOptions) => {
  const successCode = [200, 201, 202, 204, 206];
  if (successCode.includes(messageOptions.statusCode)) {
    res.status(messageOptions.statusCode).json({
      status: true,
      message: messageOptions.msgContent,
      data: messageOptions.data || {},
    });

    return;
  }
  if (!messageOptions.statusCode || messageOptions.statusCode === 500) {
    messageOptions.msgContent = 'Internal Server Error.';
  }

  res.status(messageOptions.statusCode).json({
    error: true,
    message: messageOptions.msgContent,
    data: messageOptions.data || {},
  });
};

//request logger middleware
const requestLogger = (req, res, next) => {
  const message = `${req.headers.origin}\t${req.method}\t${req.url}`;
  logWriter(message, 'requestsLog.log');
  next();
};

//error handler middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const message = `${error.name}: ${error.message}`;

  logWriter(message, 'errorsLogs.log');
  const messageOptions = {
    statusCode: error.statusCode || 500,
    msgContent: error.message,
  };
  sendMessage(res, messageOptions);
};

const helpers = { sendMessage, requestLogger, errorHandler };

module.exports = helpers;
