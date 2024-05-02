const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const app = express();
const corsOptions = {
  origin: ['https://admin.gridxmeter.com', 'http://admin.gridxmeter.com','http://localhost:3000/','http://localhost:3000','http://localhost:3001/','http://localhost:3001'],
  methods:[['GET'],['POST'],['DELETE'],['PUT']],
  credentials: true,
  optionSuccessStatus: 200,
};
// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 5,
  max: 1000000,
  message: 'Too many requests, please try again later.',
});





// Get the routes
const getRoutes = require('./meter/getSuburbEnergyRoute');
const meterPercentageRoutes = require('./routes/meterPercentageCountRoutes');
const meterRoutes = require('./routes/meterRoutes');
const suburbEnergyRoute = require('./meter/getSuburbEnergyRoute');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const notificationRoutes = require('./notifications/noficationsRoutes');
const financialRoutes = require('./routes/financialRoutes');
const suburbFinance = require('./financial/surburbFinance');
const settingsRoutes = require('./settings/settingsRoutes');



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/healthCheck', (req, res) => {
  res.status(200).send('Healthy');
});


app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Middleware for handling errors
app.use((err, req, res, next) => {
 
  res.status(500).json({ error: 'Something went wrong!' });
});

// Define global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Global error handler caught an error:', err);

  // Check if the error is a known type and handle it accordingly
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Bad request, invalid JSON' });
  }

  // For other types of errors, respond with a generic 500 error message
  res.status(500).json({ error: 'An unexpected error occurred' });
};

// Apply the global error handling middleware
app.use(errorHandler);


// Use our routes

app.use('/', getRoutes);
app.use('/',meterRoutes);
app.use('/', suburbEnergyRoute);
app.use('/', adminAuthRoutes);
app.use('/', notificationRoutes);
app.use('/', meterPercentageRoutes);
app.use('/finance', financialRoutes);
app.use('/finance',suburbFinance);
app.use('/settings', settingsRoutes);


//Export the app server configuration

module.exports = app ;


//AIzaSyAqaUc4pBP_ZfHAgN8dHk8TS_5NM8otvPg:216 
