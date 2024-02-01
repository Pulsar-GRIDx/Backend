
// const adminService = require('./adminService');

// exports.adminSignup = async (req, res) => {
    
//   try {
//     const { Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel } = req.body;
//     await adminService.registerAdmin(Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel);
//     res.status(201).json({ message: 'Registration successful' });
//   } catch (error) {
//     console.error('Error during registration:', error);
//     res.status(500).json({ error: 'Registration failed', error });
//   }
// };
