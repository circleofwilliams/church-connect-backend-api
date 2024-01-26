require('dotenv').config();
const { supabaseClient } = require('../config/supabaseConfig');
const { logWriter } = require('./logger');

const sendMessage = (res, statusCode, errorMsg, msgContent, data) => {
  const successCode = [200, 201, 202, 204, 206];
  if (successCode.includes(statusCode)) {
    res
      .status(statusCode)
      .json({ status: true, message: msgContent, data: data || {} });

    return;
  }
  if (!statusCode || statusCode === 500) {
    msgContent = 'Internal Server Error.';
  }

  res
    .status(statusCode)
    .json({ error: errorMsg, message: msgContent, data: data || {} });
};

const queryDatabase = async (tablename, column, value) => {
  const { data: existingRecord, error: Error } = await supabaseClient
    .from(tablename)
    .select()
    .eq(column, value);

  if (Error) {
    logWriter('Error from database query', 'errorsLogs.log');
    throw Error;
  }

  return existingRecord;
};

const insertIntoDatabase = async (tablename, data) => {
  const { error: Error } = await supabaseClient.from(tablename).insert(data);

  if (Error) {
    logWriter('Error inserting into database.', 'errorsLogs.log');
    throw Error;
  }
};

module.exports = {
  sendMessage,
  queryDatabase,
  insertIntoDatabase,
};
