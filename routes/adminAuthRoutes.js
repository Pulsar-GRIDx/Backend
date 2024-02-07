const express = require('express');
const router = express.Router();
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');
const adminController = require('../admin/adminControllers');



router.post('/adminSignup', authenticateTokenAndGetAdmin_ID, adminController.adminSignup);

router.post('/AdminSignin', adminController.signIn);



module.exports = router;