// const mysql = require("mysql");
// const dotenv = require('dotenv');

// // Load environment variables from the .env file
// dotenv.config();

// const awsDbConfig = {
//   host: process.env.RDS_HOSTNAME,
//   user: process.env.RDS_USERNAME,
//   password: process.env.RDS_PASSWORD,
//   port: process.env.RDS_PORT,
//   database: process.env.RDS_DB_NAME
// };

// const localDbConfig = {
//   host: process.env.LOCAL_RDS_HOSTNAME,
//   user: process.env.LOCAL_RDS_USERNAME,
//   password: process.env.LOCAL_RDS_PASSWORD,
//   port: process.env.LOCAL_RDS_PORT,
//   database: process.env.LOCAL_RDS_DB_NAME
// };

// // Create the AWS database connection
// const meterDb = mysql.createConnection(awsDbConfig);

// meterDb.connect((err) => {
//   if (err) {
//     console.log("Failed to connect to AWS DB:", err.message);

//     // If the AWS connection fails, try connecting to the local database
//     const localMeterDb = mysql.createConnection(localDbConfig);

//     localMeterDb.connect((localErr) => {
//       if (localErr) {
//         console.log("Failed to connect to the local database:", localErr.message);
//         return;
//       }
//       console.log("Connected to the local database.");

//       // Start your Express app and listen on port 4000 for the local connection
//       const express = require('express');
//       const app = express();
//       const port = 4000;

//       app.listen(port, () => {
//         console.log(`Server is running on port ${port}`);
//       });
//     });
//   } else {
//     console.log("Server Successfully connected to Gridx meters AWS database");
//   }
// });



// module.exports = meterDb;
