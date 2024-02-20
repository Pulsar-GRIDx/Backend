const connection = require("../config/db");

function findGuestByGuestID(GuestID, callback) {
    const findGuestQuery = 'SELECT * FROM guest_users WHERE GuestID = ?';
    connection.query(findGuestQuery, [GuestID], callback);
}

function updateGuestLoginCount(GuestID, callback) {
    const updateQuery = 'UPDATE guest_users SET login_count = login_count + 1 WHERE GuestID = ?';
    connection.query(updateQuery, [GuestID], callback);
}

function findAdminByEmail(Email, callback) {
    const findUserQuery = 'SELECT * FROM SystemAdmins WHERE email = ?';
    connection.query(findUserQuery, [Email], callback);
}

function updateAdminLoginCount(Admin_ID, callback) {
    const updateQuery = 'UPDATE SystemAdmins SET login_count = login_count + 1 WHERE Admin_ID = ?';
    connection.query(updateQuery, [Admin_ID], callback);
}

module.exports = {
    findGuestByGuestID,
    updateGuestLoginCount,
    findAdminByEmail,
    updateAdminLoginCount
};
