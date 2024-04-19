const express = require('express');
const router = express.Router();
const adminController = require('../admin/adminControllers');
const { authenticateToken } = require('../admin/authMiddllware');

// Admin Signup Router
router.post('/adminSignup', adminController.adminSignup);

// ADMIN Signin Router
router.post('/signin', adminController.signIn);

// Protected routes
router.use(authenticateToken);

// Protected routes below this line will require authentication

// Protected route to access admin profile
router.get('/profile/:UserID', adminController.getUserProfile);

// Route to get all users (requires authentication)
router.get('/allUsers', adminController.getAllUsers);

// Route to get all admins (requires authentication)
router.get('/allAdmins', adminController.getAllAdmins);

// Route to update admin information (requires authentication)
router.post('/AdminUpdate/:Admin_ID', adminController.updateAdminInfo);

// Route to update user status (requires authentication)
router.post('/UserUpdate/:UserID', adminController.updateUserInfo);

// Route to delete an admin (requires authentication)
router.delete('/deleteAdmin/:Admin_ID', adminController.deleteAdmin);

// Route to update admin status (requires authentication)
router.post('/updateStatus/:Admin_ID', adminController.updateAdminStatus);

// Route to reset the admin password (requires authentication)
router.post('/resetPassword/:Admin_ID', adminController.resetAdminPassword);

// Route to get admin data (requires authentication)
router.get('/adminAuth/accessLevel', (req, res) => {
  // AccessLevel is attached to the request object by the authenticateToken middleware
  const accessLevel = req.tokenPayload; // Assuming tokenPayload contains access level
  // Send AccessLevel to the frontend
  res.json(accessLevel);
});

module.exports = router;
