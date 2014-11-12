'use strict';

/** @namespace node_toybox.io */

var
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    stream = require('stream');

/**
 *
 * @param {string|Buffer|*} obj
 * @param {*} opts
 * @constructor
 * @extends Stream.Readable
 */
function MemoryStream(obj, opts) {
    if (!(this instanceof MemoryStream)) {
        return new MemoryStream(obj, opts);
    }
    opts = opts || {};
    if (!Buffer.isBuffer(obj) && typeof obj !== 'string') {
        opts.objectMode = true;
    }
    stream.Readable.call(this, opts);
    this._obj = obj;
}
util.inherits(MemoryStream, stream.Readable);

MemoryStream.prototype._read = function () {
    this.push(this._obj);
    this._obj = null;
};

/**
 *
 * @param {Stream.Readable|EventEmitter} readable
 * @param {function(err,Buffer)} callback
 */
function toBuffer(readable, callback) {
    var result;
    readable
        .once('error', callback)
        .once('end', function () {
            callback(null, result);
        })
        .on('data', function (chunk) {
            result = (result) ? Buffer.concat([result, chunk]) : chunk;
        });
}

/**
 *
 * @param {Stream.Readable|EventEmitter} readable
 * @param {function(err,string)} callback
 */
function toString(readable, callback) {
    var result = '';
    readable
        .once('error', callback)
        .once('end', function () {
            callback(null, result);
        })
        .on('data', function (chunk) {
            result += chunk;
        });
}

/**
 *
 * @param {Stream.Readable|EventEmitter} src
 * @param {Stream.Writable|EventEmitter} dst
 * @param {function} callback
 */
function copyStream(src, dst, callback) {
    dst.once('error', callback).once('close', callback);
    src.once('error', callback).pipe(dst);
}

/**
 *
 * @param {string} src
 * @param {string} dst
 * @param {function} callback
 */
function copyFile(src, dst, callback) {
    createDirectory(path.dirname(dst), function (err) {
        if (err) {
            return callback(err);
        }
        copyStream(fs.createReadStream(src), fs.createWriteStream(dst), function (err) {
            return callback(err, dst);
        });
    });
}

/**
 *
 * @param {string} file
 * @param {string} refFile
 * @param {function(boolean)} callback
 */
function isFileNewer(file, refFile, callback) {
    fs.stat(file, function (err, stats) {
        if (err || !stats.isFile()) {
            return callback(false);
        }
        fs.stat(refFile, function (err, refStats) {
            return callback(!err && refStats.isFile() && (stats.mtime > refStats.mtime));
        });
    });
}

/**
 *
 * @param {string} dir
 * @param {function} callback
 */
function createDirectory(dir, callback) {
    fs.mkdir(dir, function (err) {
        if (err) {
            switch (err.code) {
                case 'ENOENT':
                    return createDirectory(path.dirname(dir), function (err) {
                        return err ? callback(err) : createDirectory(dir, callback);
                    });
                case 'EEXIST':
                    return callback();
            }
            return callback(err);
        }
        return callback(null);
    });
}

module.exports = {
    MemoryStream: MemoryStream,
    toStream: MemoryStream,
    toBuffer: toBuffer,
    toString: toString,
    copyStream: copyStream,
    copyFile: copyFile,
    isFileNew: isFileNewer,
    createDirectory: createDirectory
};
