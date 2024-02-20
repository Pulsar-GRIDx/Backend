const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModels');

exports.signIn = (req, res) => {
    const { Email, Password, GuestID } = req.body;

    if (!GuestID && (!Email || !Password)) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    if (GuestID) {
        authModel.findGuestByGuestID(GuestID, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database query failed', err });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Authentication failed' });
            }

            const guestUser = results[0];

            authModel.updateGuestLoginCount(GuestID, (err, updateResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Login count update failed', err });
                }

                const token = jwt.sign(
                    { GuestID: guestUser.GuestID, name: guestUser.name, role: 'guest' },
                    environment.SECRET_KEY,
                    { expiresIn: '10m' }
                );

                res.cookie('accessToken', token, {
                    httpOnly: false,
                    secure: true,
                    maxAge: 40 * 60 * 1000,
                    domain: 'admin.gridxmeter.com',
                    path: '/',
                    sameSite: 'None',
                });

                res.status(200).json({
                    token,
                    user: {
                        GuestID: guestUser.GuestID,
                        name: guestUser.name,
                        role: 'guest',
                    },
                });
            });
        });
    } else {
        authModel.findAdminByEmail(Email, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database query failed', err });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Authentication failed' });
            }

            const admin = results[0];

            bcrypt.compare(Password, admin.Password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ error: 'Password comparison failed', err });
                }

                if (!isMatch) {
                    return res.status(401).json({ error: 'Authentication failed' });
                }

                authModel.updateAdminLoginCount(admin.Admin_ID, (err, updateResult) => {
                    if (err) {
                        return res.status(500).json({ error: 'Login count update failed', err });
                    }

                    const token = jwt.sign(
                        { Admin_ID: admin.adminID, email: admin.email, AccessLevel: admin.AccessLevel },
                        environment.SECRET_KEY,
                        { expiresIn: '1h' }
                    );

                    res.cookie('accessToken', token, {
                        httpOnly: false,
                        secure: true,
                        maxAge: 40 * 60 * 1000,
                        domain: ('admin.gridxmeter.com', 'localhost:3000', 'localhost:3001'),
                        path: '/',
                        sameSite: 'None',
                    });

                    res.status(200).json({
                        message: 'Admin signed in successfully',
                        token,
                        redirect: (`/protected?token=${encodeURIComponent(token)}`)
                    });
                });
            });
        });
    }
};

exports.protected = (req, res) => {
    // Business logic for protected routes
};
