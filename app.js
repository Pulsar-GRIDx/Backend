const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const corsOptions = {
  origin: ['https://gridxmeter.com', 'http://gridxmeter.com','http://localhost:3000/'],
  credentials: true,
  optionSuccessStatus: 20000,
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
const meterRoutes = require('./meter/meterRoutes');
const getAll = require('./routes/getAllData');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});
const db = require('./db'); 


app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
// Middleware for handling errors
app.use((err, req, res, next) => {
 
  res.status(500).json({ error: 'Something went wrong!' });
});


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
app.use('/',meterRoutes);
app.use('/', getAll);



//AIzaSyAqaUc4pBP_ZfHAgN8dHk8TS_5NM8otvPg:216 
