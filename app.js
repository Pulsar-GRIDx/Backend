const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const corsOptions = {
  origin: 'http://localhost:4000', 
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
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
const db = require('./db'); // Import the database connection from db.js

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
app.use('/',forgotPasswordRoutes);



//AIzaSyAqaUc4pBP_ZfHAgN8dHk8TS_5NM8otvPg:216 