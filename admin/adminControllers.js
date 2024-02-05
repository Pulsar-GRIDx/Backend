
const adminService = require('./adminService');

exports.adminSignup = async (req, res) => {
    
  try {
    const { Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel } = req.body;
    await adminService.registerAdmin(Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel);
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed', error });
  }
};

//Admin SignIn//


// exports.signIn = async (req, res) => {
//   try {
//     const { Email, Password, GuestID } = req.body;
//     const result = await adminService.signIn(Email, Password, GuestID);
//     res.cookie('accessToken', result.token, {
//       httpOnly: false,
//       secure: true, // Set this to true for HTTPS
//       maxAge: 40 * 60 * 1000,
//       domain: 'admin.gridxmeter.com', // Include the dot before the domain
//       path: '/',
//       sameSite: 'None',
//     });
//     // Set CORS headers
//     res.header('Access-Control-Allow-Origin', 'http://admin.gridxmeter.com','https://admin.gridxmeter.com'); 
//     res.header('Access-Control-Allow-Credentials', true);
//     // Send the response with both token and user data
//     res.status(200).json({
//       message: 'User signed in successfully',
//       token: result.token,
//       user: result.user
//     });
//   } catch (error) {
//     console.error('Error during sign-in:', error);
//     res.status(500).json({ error: 'Sign-in failed', details: error.message });
//   }
// };

// exports.protected = (req, res) => {
//   res.json({ message: 'Protected resource accessed' });
// };
