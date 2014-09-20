'use strict';

/** @module node-toybox.utils */

var
    util = require('util'),
    ErrorCode = {
        UNKNOWN: 0
        // TODO: ... common error codes
    },
    ErrorMessage = {
        0: 'Unknown Error'
        // TODO: ... common error messages
    };

function defineError(name, parent) {
    var constructor = function (code, message, cause) {
        constructor.super_.call(this);
        this.code = code || ErrorCode.UNKNOWN;
        this.message = message || ErrorMessage[this.code] || ErrorMessage[ErrorCode.UNKNOWN];
        this.cause = cause;
    };

    util.inherits(constructor, parent || Error);
    constructor.prototype.name = name;
    constructor.prototype.toString = function () {
        return this.name + '#' + this.code + ': ' + this.message;
    };
    constructor.prototype.toJSON = function () {
        return { name: this.name, code: this.code, message: this.message, cause: this.cause };
    };

    return constructor;
}

module.exports = {
    ErrorCode: ErrorCode,
    ErrorMessage: ErrorMessage,
    CustomError: defineError('CustomError', Error),
    // TODO: ... common error classes
    defineError: defineError
};
