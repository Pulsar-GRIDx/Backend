const express = require('express');
const router = express.Router();
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');
const adminController = require('../admin/adminControllers');
const authenticateToken = require('../admin/authMiddllware');


//Admin Signup Router
router.post('/adminSignup', authenticateTokenAndGetAdmin_ID, adminController.adminSignup);
//ADMIN Signin Router
router.post('/signin', adminController.signIn);
//Protected
router.get('/protected', authenticateToken.authenticateToken, adminController.protected);

//Gets a User
router.get('/profile/:UserID', adminController.getUserProfile);
//Gets all Users
router.get('/allUsers', adminController.getAllUsers);
//Gets all Admins
router.get('/allAdmins',adminController.getAllAdmins);
//Updates admin Infromation
router.post('/AdminUpdate/:Admin_ID', adminController.updateAdminInfo);
//Updates User Status
router.post('/UserUpdate/:UserID', adminController.updateUserInfo);
//Delets an admin
router.delete('/deleteAdmin/:Admin_ID',adminController.deleteAdmin);
//Updates Admin Status
router.post('/updateStatus/:Admin_ID',adminController.updateAdminStatus);
//Resets the admin Password
router.post('/resetPassword/:Admin_ID',adminController.resetAdminPassword);
//Get admin data
router.get('/adminAuth/accessLevel', authenticateTokenAndGetAdmin_ID, (req, res) => {
  // AccessLevel is attached to the request object by the decodeToken middleware
  // const accessLevel = req.AccessLevel;
  const AccessLevel = req.tokenPayload ;
  // Send AccessLevel to the frontend
  res.json(AccessLevel );
});

module.exports = router;