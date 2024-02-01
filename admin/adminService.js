// const connection = require('../config/db');
// const bcrypt = require('bcrypt');


// exports.registerAdmin = async (Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel) => {
 

//   if (!Username || !Password || !FirstName || !LastName || !Email || !IsActive || !RoleName || !AccessLevel || !validateEmail(Email)) {
//     throw new Error('Invalid input data');
//   }

//   const hashedPassword = await bcrypt.hash(Password, 10);

//   return new Promise((resolve, reject) => {
//     connection.query(
//       'INSERT INTO SystemAdmins (Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//       [Username, hashedPassword, FirstName, LastName, Email, IsActive, RoleName, AccessLevel],
//       (err, result) => {
//         if (err) {
//           console.error('Registration error:', err);
//           reject(err);
//         }
//         console.log('Registration successful');
//         resolve(result);
//       }
//     );
//   });
// };
