const adminService = require('./adminService');

exports.adminSignup = async (req, res) => {
  try {
    const { Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel } = req.body;

    // Check if any of the required fields are missing or invalid
    if (
      typeof Username !== 'string' || !Username.trim() ||
      typeof Password !== 'string' || !Password.trim() ||
      typeof FirstName !== 'string' || !FirstName.trim() ||
      typeof LastName !== 'string' || !LastName.trim() ||
      typeof Email !== 'string' || !Email.trim() || !validateEmail(Email) ||
      (typeof IsActive !== 'boolean' && typeof IsActive !== 'number') ||
      typeof RoleName !== 'string' || !RoleName.trim() ||
      typeof AccessLevel !== 'number'
    ) {
      return res.status(400).json({ error: 'Missing or invalid required fields in request body' });
    }

    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    // Check for duplicate Username
    const isUsernameTaken = await adminService.isUsernameTaken(Username);
    if (isUsernameTaken) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Check for duplicate Email
    const isEmailTaken = await adminService.isEmailTaken(Email);
    if (isEmailTaken) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    await adminService.registerAdmin(Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel);
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};






//Admin SignIn


exports.signIn = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Check if Email or Password is missing
    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and Password are required' });
    }

    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if Email has invalid syntax
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ error: 'Invalid email syntax' });
    }

    const result = await adminService.signIn(Email, Password);

    // If signIn service did not return a valid result
    if (!result || !result.token || !result.user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set the access token in a cookie
    res.cookie('accessToken', result.token, {
      httpOnly: false,
      secure: true, // Set this to true for HTTPS
      maxAge: 40 * 60 * 1000,
      domain: '.gridxmeter.com', // Example domain, adjust as needed
      path: '/',
      sameSite: 'None',
    });

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'http://admin.gridxmeter.com', 'https://admin.gridxmeter.com', 'http://localhost:4000', 'http://admintest.gridxmter.com.s3-website-us-east-1.amazonaws.com/');
    res.header('Access-Control-Allow-Credentials', true);

    // Send the response with both token and user data
    res.status(200).json({
      message: 'Admin signed in successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Error during sign-in:', error);

    // Handle specific error statuses and send them to the front end
    if (error.status === 404) {
      return res.status(404).json({ error: 'Email not found' });
    } else if (error.status === 401) {
      return res.status(401).json({ error: 'Incorrect Password' });
    } else {
      // Send a generic 500 error if the error status is not explicitly handled
      res.status(500).json({ error: 'Sign-in failed', details: error.message });
    }
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
    .catch(err => {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ error: 'Admin not found' });
      }
      return res.status(500).json({ error: 'Internal server error', details: err });
    });
};


//Update user
exports.updateUserInfo = (req, res) => {
  const { UserID } = req.params;
  const { FirstName, Email, LastName, DRN } = req.body;

  if (!UserID) {
    return res.status(400).json({ error: 'Invalid Admin_ID, enter a valid ID' });
  }

  adminService.updateUserInfo(UserID, FirstName, Email, LastName, DRN)
    .then(() => res.status(200).json({ message: 'User information updated successfully' }))
    .catch(err => {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ error: 'Admin not found' });
      }
      return res.status(500).json({ error: 'Internal server error', details: err });
    });
};
//Update admin
exports.updateAdminInfo = (req, res) => {
  const { Admin_ID } = req.params;
  const { FirstName, Email, LastName, AccessLevel, Username } = req.body;

  if (!Admin_ID) {
    return res.status(400).json({ error: 'Invalid Admin_ID, enter a valid ID' });
  }

  adminService.updateAdminInfo(Admin_ID, FirstName, Email, LastName, AccessLevel, Username)
    .then(() => res.status(200).json({ message: 'Admin information updated successfully' }))
    .catch(err => {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ error: 'Admin not found' });
      }
      return res.status(500).json({ error: 'Internal server error', details: err });
    });
};
//Delete Admin
exports.deleteAdmin = (req, res) => {
  const { Admin_ID } = req.params;

  if (!Admin_ID) {
    return res.status(400).json({ error: 'Invalid Admin_ID, enter a valid ID' });
  }


  adminService.deleteAdmin(Admin_ID)
    .then(() => res.status(200).json({ message: 'Admin deleted successfully' }))
    .catch(err => {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ error: 'Admin not found' });
      }
      return res.status(500).json({ error: 'Internal server error', details: err });
    });
};
//Update AdminStatus
exports.updateAdminStatus = (req, res) => {
  const { Admin_ID } = req.params;

  if (!Admin_ID) {
    return res.status(400).json({ error: 'Invalid Admin_ID, enter a valid ID' });
  }

  adminService.updateAdminStatus(Admin_ID)
    .then(newStatus => res.status(200).json({ message: 'Admin status updated successfully', newStatus }))
    .catch(err => {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ error: 'Admin not found' });
      }
      return res.status(500).json({ error: 'Internal server error', details: err });
    });
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
    .catch(err => {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ error: 'Admin not found' });
      }
      return res.status(500).json({ error: 'Internal server error', details: err });
    });
};

//Get Admin Data

exports.getAdminData = (req, res) => {
  const { Admin_ID } = req.params;

  if (!Admin_ID) {
    return res.status(400).json({ error: 'Invalid Admin_ID, enter a valid ID' });
  }

  adminService.getAdminData(Admin_ID)
    .then(adminData => res.status(200).json(adminData))
    .catch(err => {
      if (err.message === 'Admin not found') {
        return res.status(404).json({ error: 'Admin not found' });
      }
      return res.status(500).json({ error: 'Internal server error', details: err });
    });
};