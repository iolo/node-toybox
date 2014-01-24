'use strict';

var
    util = require('util'),
    ErrorCode = {
        UNKNOWN: 0,
        DATA: 3000,
        DATA_READ: 3100,
        DATA_CREATE: 3200,
        DATA_UPDATE: 3300,
        DATA_DESTROY: 3400,
        DATA_FATAL: 3500,
        HTTP: 8000,
        AUTH: 9000,
        INVALID_TOKEN: 9100,
        INVALID_USER: 9200,
        INVALID_PASSWORD: 9300
    },
    ErrorMessage = {
        0: 'Unknown Error',
        3000: 'Data Error',
        3100: 'Data Read Error',
        3200: 'Data Create Error',
        3300: 'Data Update Error',
        3400: 'Data Destroy Error',
        3500: 'Data Fail Error',
        9000: 'Auth Error',
        9100: 'Invalid Token',
        9200: 'Invalid User',
        9300: 'Invalid Password'
    };

/**
 * unknown error.
 *
 * @param {int} [code]
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 */
function CustomError(code, message, cause) {
    this.code = code || ErrorCode.UNKNOWN;
    this.message = message || ErrorMessage[this.code] || ErrorMessage[ErrorCode.UNKNOWN];
    this.cause = cause;
    CustomError.super_.call(this);
}
util.inherits(CustomError, Error);
CustomError.prototype.name = 'CustomError';
CustomError.prototype.toString = function () {
    return 'CustomError#' + this.code + ': ' + this.message;
};

/**
 *
 * @param {int} [code]
 * @param {string} [message]
 * @param {*} [cause]
 * @constructor
 */
function DataError(code, message, cause) {
    DataError.super_.call(this, code || ErrorCode.DATA, message, cause);
}
util.inherits(DataError, CustomError);
DataError.prototype.name = 'DataError';

/**
 *
 * @param {string} [message]
 * @param {*} [cause]
 * @constructor
 */
function DataReadError(message, cause) {
    DataReadError.super_.call(this, ErrorCode.DATA_READ, message, cause);
}
util.inherits(DataReadError, DataError);
DataReadError.prototype.name = 'DataReadError';

/**
 *
 * @param {string} [message]
 * @param {*} [cause]
 * @constructor
 */
function DataCreateError(message, cause) {
    DataCreateError.super_.call(this, ErrorCode.DATA_CREATE, message, cause);
}
util.inherits(DataCreateError, DataError);
DataCreateError.prototype.name = 'DataCreateError';

/**
 *
 * @param {string} [message]
 * @param {*} [cause]
 * @constructor
 */
function DataUpdateError(message, cause) {
    DataUpdateError.super_.call(this, ErrorCode.DATA_UPDATE, message, cause);
}
util.inherits(DataUpdateError, DataError);
DataUpdateError.prototype.name = 'DataUpdateError';

/**
 *
 * @param {string} [message]
 * @param {*} [cause]
 * @constructor
 */
function DataDestroyError(message, cause) {
    DataDestroyError.super_.call(this, ErrorCode.DATA_DESTROY, message, cause);
}
util.inherits(DataDestroyError, DataError);
DataDestroyError.prototype.name = 'DataDestroyError';

/**
 *
 * @param {string} [message]
 * @param {*} [cause]
 * @constructor
 */
function DataFatalError(message, cause) {
    DataFatalError.super_.call(this, ErrorCode.DATA_FATAL, message, cause);
}
util.inherits(DataFatalError, DataError);
DataFatalError.prototype.name = 'DataFatalError';

/**
 *
 * @param {int} [code]
 * @param {string} [message]
 * @param {*} [cause]
 * @constructor
 */
function AuthError(code, message, cause) {
    AuthError.super_.call(this, code || ErrorCode.AUTH, message, cause);
}
util.inherits(AuthError, CustomError);
AuthError.prototype.name = 'AuthError';

/**
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 */
function InvalidToken(message, cause) {
    InvalidToken.super_.call(this, ErrorCode.INVALID_TOKEN, message, cause);
}
util.inherits(InvalidToken, AuthError);
InvalidToken.prototype.name = 'InvalidToken';

/**
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 */
function InvalidUser(message, cause) {
    InvalidUser.super_.call(this, ErrorCode.INVALID_USER, message, cause);
}
util.inherits(InvalidUser, AuthError);
InvalidUser.prototype.name = 'InvalidUser';

/**
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 */
function InvalidPassword(message, cause) {
    InvalidPassword.super_.call(this, ErrorCode.INVALID_PASSWORD, message, cause);
}
util.inherits(InvalidPassword, AuthError);
InvalidPassword.prototype.name = 'InvalidPassword';

module.exports = {
    ErrorCode: ErrorCode,
    ErrorMessage: ErrorMessage,
    CustomError: CustomError,
    DataError: DataError,
    DataReadError: DataReadError,
    DataUpdateError: DataUpdateError,
    DataCreateError: DataCreateError,
    DataDestroyError: DataDestroyError,
    DataFatalError: DataFatalError,
    AuthError: AuthError,
    InvalidToken: InvalidToken,
    InvalidUser: InvalidUser,
    InvalidPassword: InvalidPassword
};
