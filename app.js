const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
<<<<<<< HEAD
const rateLimit = require('express-rate-limit');
const corsOptions = {
  origin: 'http://localhost:4000', 
=======
// const db = require('./db'); // Import the database connection from db.js
const moment = require('moment');
const mysql = require('mysql');
const corsOptions = {
  origin: ['https://gridxmeter.com', 'http://gridxmeter.com'], 
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
  credentials: true,
  optionSuccessStatus: 200,
};
// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
});
const authRoutes = require('./routes/authRoutes');
const getRoutes = require('./routes/getRoutes');
<<<<<<< HEAD
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
=======
const meterRoutes = require('./meter/meterRoutes');

>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});
const db = require('./db'); 
// // POST endpoint for calculating energy consumption
// app.post('/calculateEnergyConsumption', (req, res) => {
//   const { drn, date } = req.body;

//   // Calculate the start and end timestamps for the current week and last week
//   const currentDate = moment(date);
//   const currentWeekStart = currentDate.clone().startOf('week');
//   const lastWeekStart = currentWeekStart.clone().subtract(7, 'days');
//   const currentWeekEnd = currentWeekStart.clone().endOf('week');
//   const lastWeekEnd = lastWeekStart.clone().endOf('week');

//   // Format timestamps for MySQL queries
//   const currentWeekStartFormatted = currentWeekStart.format('YYYY-MM-DD HH:mm:ss');
//   const currentWeekEndFormatted = currentWeekEnd.format('YYYY-MM-DD HH:mm:ss');
//   const lastWeekStartFormatted = lastWeekStart.format('YYYY-MM-DD HH:mm:ss');
//   const lastWeekEndFormatted = lastWeekEnd.format('YYYY-MM-DD HH:mm:ss');

//   // MySQL query to get the data for the specified DRN and time range
//   const query = `
//     SELECT active_power, date_time
//     FROM meteringpower
//     WHERE DRN = ? AND date_time BETWEEN ? AND ?
//   `;

//   db.query(query, [drn, lastWeekStartFormatted, currentWeekEndFormatted], (err, results) => {
//     if (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }

//     // Calculate energy consumption for the current week and last week
//     let currentWeekEnergy = 0;
//     let lastWeekEnergy = 0;

//     results.forEach((result) => {
//       const power = result.active_power;
//       const resultDate = moment(result.date);

//       if (resultDate.isBetween(currentWeekStart, currentWeekEnd)) {
//         currentWeekEnergy += power;
//       } else if (resultDate.isBetween(lastWeekStart, lastWeekEnd)) {
//         lastWeekEnergy += power;
//       }
//     });

//     res.json({
//       currentWeekEnergy,
//       lastWeekEnergy,
//     });
//   });
// });


app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
<<<<<<< HEAD
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
const db = require('./db'); // Import the database connection from db.js
=======


>>>>>>> 2966415b133f63a36588360d30c329fc537bb412

db.connect((err) => {
  if (err) {
    console.log("Failed to connect to AWS RDS:", err.message);
    return;
  }
  console.log("Successfully connected to AWS RDS database");
  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
  });
});

// Use your authRoutes and getRoutes as before
app.use('/', authRoutes);
app.use('/', getRoutes);
<<<<<<< HEAD
app.use('/',forgotPasswordRoutes);



//AIzaSyAqaUc4pBP_ZfHAgN8dHk8TS_5NM8otvPg:216 
=======
app.use('/', meterRoutes);
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
