const express = require('express');
const router = express.Router();
const authController = require('../contollers/authContollers');

router.post('/AdminSignin', authController.signIn);
router.get('/protected', authenticateToken, authController.protected);

function authenticateToken(req, res, next) {
    const token = sessionStorage.getItem('token');

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, environment.SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
}

module.exports = router;
