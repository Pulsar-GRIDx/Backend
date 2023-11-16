// db.js
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const environment = process.env;

const db = mysql.createConnection({
  host: environment.RDS_HOSTNAME,
  user: environment.RDS_USERNAME,
  password: environment.RDS_PASSWORD,
  port: environment.RDS_PORT,
  database: environment.RDS_DB_NAME,
});

module.exports = db;
