const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'GridX_Admin',
    description: 'This is the GridX Admin Api Documentation'
  },
  host: 'localhost:4000',
  
};

const outputFile = './swagger-output.json';
const routes = ['../routes/adminAuthRoutes.js','../routes/financialRoutes.js','../routes/getAllData.js','../routes/meterPercentageCountRoutes.js','../routes/meterRoutes.js','../routes/userRoutes.js','../meter/getSuburbEnergyRoute.js','../meterProfile/meterProfileRoutes.js','../notifications/noficationsRoutes.js','../routes/systemSettingsRoutes.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */



swaggerAutogen(outputFile, routes, doc).then(() => {
  require('../routes/adminAuthRoutes.js','../routes/financialRoutes.js','../routes/getAllData.js','../routes/meterPercentageCountRoutes.js','../routes/meterRoutes.js','../routes/userRoutes.js','../meter/getSuburbEnergyRoute.js','../meterProfile/meterProfileRoutes.js','../notifications/noficationsRoutes.js','../routes/systemSettingsRoutes.js'); 
});