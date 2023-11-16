const mysql = require("mysql");
const db = require("../db");

const db = mysql.createConnection(db);

db.connect((err) => {
  if (err) {
    console.log("failed to connect to AWS DB:", err.message);
    return;
  }
  console.log("Server Successfully connected to Gridx meters AWS database");
});
module.exports = db;