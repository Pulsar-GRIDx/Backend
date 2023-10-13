const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv'); // Import dotenv

dotenv.config(); // Load environment variables from .env file
const enviroment = process.env;
// Use environment variables
const db = mysql.createConnection({
  host: enviroment.RDS_HOSTNAME,
  user: enviroment.RDS_USERNAME,
  password: enviroment.RDS_PASSWORD,
  port: enviroment.RDS_PORT,
  database: enviroment.RDS_DB_NAME,
});

module.exports = db;