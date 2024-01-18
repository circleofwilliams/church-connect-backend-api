require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON;

const supabaseClient = createClient(url, key);

module.exports = { supabaseClient };
