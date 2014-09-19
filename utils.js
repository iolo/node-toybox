'use strict';

/** @module node-toybox.utils */

var
    crypto = require('crypto'),
    util = require('util'),
    fs = require('fs'),
    _ = require('lodash'),
    Q = require('q');

/**
 * get a non-crypto hash code from a string.
 *
 * @param {string} str
 * @returns {number} unsigned 32bit hash code
 * @see http://www.cse.yorku.ca/~oz/hash.html
 */
function hashCode(str) {
    var hash = 0xdeadbeef;
    for (var i = str.length; i >= 0; --i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    // turn to unsigned 32bit int
    return hash >>> 0;
}

/**
 * get gravatar url.
 *
 * @param {String} email
 * @param {Number} [size]
 * @return {String} gravatar url
 */
function gravatarIcon(email, size) {
    var url = 'http://www.gravatar.com/avatar/';
    if (email) {
        url += crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    }
    if (size) {
        url += '?s=' + size;
    }
    return url;
}

/**
 * generate nonce string.
 *
 * @param {Number} [len=20]
 * @return {String} nonce string
 */
function generateNonce(len) {
    return crypto.randomBytes(len || 20).toString('hex');
}

/**
 * digest password string with optional salt.
 *
 * @param {String} password
 * @param {String} [salt]
 * @return {String} digested password string
 */
function digestPassword(password, salt, algorithm) {
    var hash = (salt) ? crypto.createHmac(algorithm || 'sha1', salt) : crypto.createHash(algorithm || 'sha1');
    return hash.update(password).digest('hex');
}

/**
 * digest file content.
 *
 * @param {String} file
 * @return {String} digest string
 */
function digestFile(file) {
    return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
}

/**
 * get dump string for debug.
 *
 * @param {*} obj
 * @return {String} dump string
 */
function dump(obj) {
    return util.inspect(obj, {depth: null});
}

/**
 *
 * @param {Array.<String>} tags
 * @param {String} [separator=',']
 * @returns {String}
 */
function join(tags, separator) {
    if (!tags) {
        return '';
    }

    return tags.reduce(function (tags, tag) {
        tag = tag.trim();
        if (tag) {
            tags.push(tag);
        }
        return tags;
    }, []).join(separator || ',');
}

/**
 *
 * @param {String} tags
 * @param {String} [separator=',']
 * @returns {Array.<String>}
 */
function split(tags, separator) {
    if (!tags) {
        return [];
    }
    return tags.split(separator || ',').reduce(function (tags, tag) {
        tag = tag.trim();
        if (tag) {
            tags.push(tag);
        }
        return tags;
    }, []);
}

/**
 *
 * @param {*} obj
 * @param {Array.<String>} properties
 * @returns {*}
 */
function includeProperties(obj, properties) {
    if (obj.toJSON) {
        obj = obj.toJSON();
    } else if (obj.toObject) {
        obj = obj.toObject();
    }
    return _.pick(obj, properties);
}

/**
 *
 * @param {*} obj
 * @param {Array.<String>} properties
 * @returns {*}
 */
function excludeProperties(obj, properties) {
    if (obj.toJSON) {
        obj = obj.toJSON();
    } else if (obj.toObject) {
        obj = obj.toObject();
    }
    return _.omit(obj, properties);
}

/**
 *
 * @param {Array} objects
 * @param {string} property
 * @returns {Array}
 */
function extractProperty(objects, property) {
    return _.pluck(objects, property);
}

module.exports = {
    hashCode: hashCode,
    gravatarIcon: gravatarIcon,
    generateNonce: generateNonce,
    digestPassword: digestPassword,
    digestFile: digestFile,
    dump: dump,
    join: join,
    split: split,
    includeProperties: includeProperties,
    excludeProperties: excludeProperties,
    extractProperty: extractProperty
};