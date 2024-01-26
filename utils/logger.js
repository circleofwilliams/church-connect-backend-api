const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const logWriter = async (message, logName) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\t HH:mm:ss')}`;
  const logMessage = `${dateTime}\t ${uuid()}\t ${message}\n`;

  try {
    //check if log directory exists if no, create it.
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
    }

    //append the log message to the appropriate log file
    await fsPromises.appendFile(
      path.join(__dirname, '..', 'logs', logName),
      logMessage,
    );
  } catch (error) {
    console.log('Error from logger function', error.message);
  }
};

// const requestsLogger = (req, res, next) => {
//   const message = `${req.headers.origin}\t${req.method}\t${req.url}`;
//   logWriter(message, 'requestsLog.log');
//   next();
// };

module.exports = { logWriter };
