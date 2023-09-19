const express = require('express');
const mysql = require('mysql2');
//const app = express();


//const port = 4000;


const db = mysql.createConnection({
  host: 'localhost',
  user: 'king',
  password: 'king',
  database: 'user_auth',
});

module.exports = db;


