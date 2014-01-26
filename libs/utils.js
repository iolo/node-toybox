'use strict';

var
    crypto = require('crypto'),
    _ = require('lodash'),
    Q = require('q');

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
    var hash = (salt) ? crypto.createHmac('sha1', salt) : crypto.createHash('sha1');
    return hash.update(password).digest('hex');
}

/**
 * digest file content.
 *
 * @param {String} file
 * @return {String} digest string
 */
function digestFile(file) {
    return require('crypto').createHash('md5').update(fs.readFileSync(file)).digest('hex');
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
        var tag = tag.trim();
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
        var tag = tag.trim();
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
    gravatarIcon: gravatarIcon,
    generateNonce: generateNonce,
    digestPassword: digestPassword,
    digestFile: digestFile,
    join: join,
    split: split,
    includeProperties: includeProperties,
    excludeProperties: excludeProperties,
    extractProperty: extractProperty
};
