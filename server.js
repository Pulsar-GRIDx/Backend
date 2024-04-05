const app = require('./app');

const db = require("./config/db");

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

