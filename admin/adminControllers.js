
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

//Admin SignIn


exports.signIn = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const result = await adminService.signIn(Email, Password);
    res.cookie('accessToken', result.token, {
      httpOnly: false,
      secure: true, // Set this to true for HTTPS
      maxAge: 40 * 60 * 1000,
      domain: 'admin.gridxmeter.com', // Include the dot before the domain
      path: '/',
      sameSite: 'None',
    });
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'http://admin.gridxmeter.com','https://admin.gridxmeter.com'); 
    res.header('Access-Control-Allow-Credentials', true);
    // Send the response with both token and user data
    res.status(200).json({
      message: 'User signed in successfully',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Error during sign-in:', error);
    res.status(500).json({ error: 'Sign-in failed', details: error.message });
  }
};

exports.protected = (req, res) => {
  res.json({ message: 'Protected resource accessed' });
};

//Get all User Profile
exports.getUserProfile = (req, res) => {
  const { UserID } = req.params;

  if (!UserID) {
    return res.status(400).json({ error: 'Invalid UserID' });
  }

  adminService.getUserProfile(UserID)
    .then(userProfile => res.status(200).json(userProfile))
    .catch(err => res.status(500).json({ error: 'Failed to fetch user profile', details: err }));
};

//Get all users
exports.getAllUsers = (req, res) => {
  adminService.getAllUsers()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json({ error: 'Internal server error', details: err }));
};

//Get all Admins
exports.getAllAdmins = (req, res) => {
  adminService.getAllAdmins()
    .then(users => res.status(200).json({ users: users }))
    .catch(err => res.status(500).json({ error: 'Internal server error', details: err }));
};

//Update user
exports.updateUserInfo = (req, res) => {
  const { UserID } = req.params;
  const { FirstName, Email, LastName, DRN } = req.body;

  adminService.updateUserInfo(UserID, FirstName, Email, LastName, DRN)
    .then(() => res.status(200).json({ message: 'User information updated successfully' }))
    .catch(err => res.status(500).json({ error: 'Internal server error', details: err }));
};
//Update admin
exports.updateAdminInfo = (req, res) => {
  const { Admin_ID } = req.params;
  const { FirstName, Email, LastName, AccessLevel, Username } = req.body;

  adminService.updateAdminInfo(Admin_ID, FirstName, Email, LastName, AccessLevel, Username)
    .then(() => res.status(200).json({ message: 'Admin information updated successfully' }))
    .catch(err => res.status(500).json({ error: 'Internal server error', details: err }));
};
//Delete Admin
exports.deleteAdmin = (req, res) => {
  const { Admin_ID } = req.params;

  adminService.deleteAdmin(Admin_ID)
    .then(() => res.status(200).json({ message: 'Admin deleted successfully' }))
    .catch(err => res.status(500).json({ error: 'Internal server error', details: err }));
};
//Update AdminStatus
exports.updateAdminStatus = (req, res) => {
  const { Admin_ID } = req.params;

  adminService.updateAdminStatus(Admin_ID)
    .then(newStatus => res.status(200).json({ message: 'Admin status updated successfully', newStatus }))
    .catch(err => res.status(500).json({ error: 'Internal server error', details: err }));
};

//Reset Admin Password
exports.resetAdminPassword = (req, res) => {
  const { Admin_ID } = req.params;
  const { Password } = req.body;

  if (!Password) {
    return res.status(400).json({ message: 'Please enter a new password' });
  }

  adminService.resetAdminPassword(Admin_ID, Password)
    .then(() => res.status(200).json({ message: 'Password updated successfully' }))
    .catch(err => res.status(500).json({ error: 'Internal server error', details: err }));
};