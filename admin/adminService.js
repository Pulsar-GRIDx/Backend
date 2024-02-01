const connection = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



//Register New Admin//

exports.registerAdmin = async (Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel) => {
 
  const hashedPassword = await bcrypt.hash(Password, 10);

  return new Promise((resolve, reject) => {
    connection.query(
      'INSERT INTO SystemAdmins (Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Username, hashedPassword, FirstName, LastName, Email, IsActive, RoleName, AccessLevel],
      (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          reject(err);
        }
        console.log('Registration successful');
        resolve(result);
      }
    );
  });
};

// //Admin SignIn//

// exports.signIn = async (Email, Password, GuestID) => {
//   if (!GuestID && (!Email || !Password)) {
//     throw new Error('Invalid request');
//   }

//   if (GuestID) {
//     const findGuestQuery = 'SELECT * FROM guest_users WHERE GuestID = ?';
//     const updateGuestQuery = 'UPDATE guest_users SET login_count = login_count + 1 WHERE GuestID = ?';

//     const guestUser = await new Promise((resolve, reject) => {
//       connection.query(findGuestQuery, [GuestID], (err, results) => {
//         if (err) {
//           reject(err);
//         } else if (results.length === 0) {
//           reject(new Error('Authentication failed'));
//         } else {
//           resolve(results[0]);
//         }
//       });
//     });

//     await new Promise((resolve, reject) => {
//       connection.query(updateGuestQuery, [GuestID], (err, updateResult) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(updateResult);
//         }
//       });
//     });

//     const token = jwt.sign(
//       { GuestID: guestUser.GuestID, name: guestUser.name, role: 'guest' },
//       process.env.SECRET_KEY,
//       { expiresIn: '10m' }
//     );

//     return {
//       token,
//       user: {
//         GuestID: guestUser.GuestID,
//         name: guestUser.name,
//         role: 'guest',
//         redirect: `/protected?token=${encodeURIComponent(token)}`
//       }
//     };
//   } else {
//     // Regular Admin sign-in
//     // Find the Admin by email
//     const findUserQuery = 'SELECT * FROM SystemAdmins WHERE email = ?';
//     const updateUserQuery = 'UPDATE SystemAdmins SET login_count = login_count + 1 WHERE Admin_ID = ?';

//     const admin = await new Promise((resolve, reject) => {
//       connection.query(findUserQuery, [Email], (err, results) => {
//         if (err) {
//           reject(err);
//         } else if (results.length === 0) {
//           reject(new Error('Authentication failed'));
//         } else {
//           resolve(results[0]);
//         }
//       });
//     });

//     const isMatch = await bcrypt.compare(Password, admin.Password);
//     if (!isMatch) {
//       throw new Error('Authentication failed');
//     }

//     await new Promise((resolve, reject) => {
//       connection.query(updateUserQuery, [admin.Admin_ID], (err, updateResult) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(updateResult);
//         }
//       });
//     });

//     const token = jwt.sign(
//       { Admin_ID: admin.adminID, email: admin.email, AccessLevel: admin.AccessLevel },
//       process.env.SECRET_KEY,
//       { expiresIn: '1h' } // Token expires in 1 hour
//     );

//     return {
//       token,
//       user: {
//         Admin_ID: admin.adminID,
//         email: admin.email,
//         AccessLevel: admin.AccessLevel,
//         redirect: `/protected?token=${encodeURIComponent(token)}`
//       }
//     };
//   }
// };

