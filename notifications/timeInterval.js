const cron = require('node-cron');
const nodemailer = require('nodemailer');
const mysql = require('mysql');



// Check for meters that haven't sent data in the last three hours every hour
cron.schedule('0 * * * *', () => {
  const threeHoursAgo = new Date();
  threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

  const query = `SELECT DRN FROM meteringpower WHERE date_time < ?`;
  connection.query(query, [threeHoursAgo], (error, results, fields) => {
    if (error) throw error;

    if (results.length > 0) {
      // Send notification
      sendNotification();
    }
  });
});

// Function to send notification (e.g., via email)
function sendNotification() {
  // Configure nodemailer to send an email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_email_password'
    }
  });

  const mailOptions = {
    from: 'your_email@gmail.com',
    to: 'recipient@example.com',
    subject: 'Metering Alert',
    text: 'Some meters have not sent data in the last three hours.'
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}
