const errorCodes = require('./errorCodes');

function getErrorMessage(errorCode) {
    return errorCodes[errorCode] || 'Unknown Error Code';
}

module.exports = {
    getErrorMessage
};
