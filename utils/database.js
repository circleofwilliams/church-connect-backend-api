require('dotenv').config();

const supabaseClient = require('../config/supabaseConfig');
const logWriter = require('./logger');

//query database with query options
const queryDatabase = async (queryOptions) => {
  const { data: existingRecord, error: Error } = await supabaseClient
    .from(queryOptions.tableName)
    .select()
    .eq(queryOptions.column, queryOptions.columnValue);

  //if there is an error, throw error else return result
  if (Error) {
    logWriter('Error from database query', 'errorsLogs.log');
    throw Error;
  } else {
    return existingRecord;
  }
};

//insert data into database with insert options
const insertIntoDatabase = async (insertOptions) => {
  const { error: Error } = await supabaseClient
    .from(insertOptions.tableName)
    .insert(insertOptions.data);

  //if error throw error else return true
  if (Error) {
    logWriter('Error inserting into database.', 'errorsLogs.log');
    throw Error;
  } else {
    return true;
  }
};

//update databse with update options
const updateDatabase = async (updateOptions) => {
  const { error: Error } = await supabaseClient
    .from(updateOptions.tableName)
    .update(updateOptions.data)
    .eq(updateOptions.column, updateOptions.columnValue);

  // if error throw erro else return true.
  if (Error) {
    logWriter('Error updating database.', 'errorsLogs.log');
    throw Error;
  } else {
    return true;
  }
};

const dbHelpers = {
  queryDatabase,
  insertIntoDatabase,
  updateDatabase,
};

module.exports = dbHelpers;
