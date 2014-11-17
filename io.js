'use strict';

/** @namespace node_toybox.io */

var
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    stream = require('stream'),
    async = require('./async');

/**
 *
 * @param {string|Buffer|*} obj
 * @param {*} [opts]
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
    var result = new Buffer(0);
    readable
        .once('error', callback)
        .once('end', function () {
            callback(null, result);
        })
        .on('data', function (chunk) {
            result = Buffer.concat([result, chunk]);
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
    src.once('error', callback).once('end', callback).pipe(dst.once('error', callback), {end: false});
}

/**
 *
 * @param {Array.<Stream.Readable>} readables
 * @param {Stream.Writable} writable
 * @param {function} callback
 */
function concatStreams(readables, writable, callback) {
    async.reduce(readables, function (prev, readable, next) {
        copyStream(readable, writable, next);
    }, callback);
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
 * @param {Array.<string>} files
 * @param {string} dst
 * @param {function} callback
 */
function concatFiles(files, dst, callback) {
    fs.unlink(dst, function (err) {
        // ignore unlink error
        async.reduce(files, function (prev, file, next) {
            fs.readFile(file, null, function (err, data) {
                if (err) {
                    return next(err);
                }
                fs.appendFile(dst, data, null, next);
            });
        }, callback);
    });
}

/**
 *
 * @param {string} file
 * @param {string} refFile
 * @param {function(boolean)} callback `true` if `file` is newer than `refFile`, `false` if older or equal, or `undefined` if error.
 */
function isFileNewer(file, refFile, callback) {
    if (file === refFile) {
        return callback(false);
    }
    fs.stat(file, function (err, stats) {
        if (err) {
            return callback();//undefined
        }
        fs.stat(refFile, function (err, refStats) {
            if (err) {
                return callback();//undefined
            }
            console.log(stats.mtime, refStats.mtime);
            return callback(stats.mtime > refStats.mtime);
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
        if (!err) {
            return callback();
        }
        switch (err.code) {
            case 'ENOENT':
                return createDirectory(path.dirname(dir), function (err) {
                    return err ? callback(err) : createDirectory(dir, callback);
                });
            case 'EEXIST':
                return callback();
        }
        return callback(err);
    });
}

/**
 *
 * @param {string} dir
 * @param {function} callback
 */
function cleanDirectory(dir, callback) {
    fs.readdir(dir, function (err, names) {
        if (err) {
            return callback(err);
        }
        async.reduce(names, function (ignore_prev, name, next) {
            forceDelete(path.join(dir, name), next);
        }, callback);
    });
}

/**
 *
 * @param dir
 * @param callback
 * @returns {*}
 */
function deleteDirectory(dir, callback) {
    fs.rmdir(dir, function (err) {
        if (!err) {
            return callback();
        }
        switch (err.code) {
            case 'ENOENT':
                return callback();
            case 'ENOTEMPTY':
                return cleanDirectory(dir, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    return fs.rmdir(dir, callback);
                });
            default:
                return callback(err);
        }
    });
}

/**
 *
 * @param {string} dir
 * @param {function} callback
 */
function forceDelete(file, callback) {
    return fs.unlink(file, function (err) {
        if (!err) {
            return callback();
        }
        switch (err.code) {
            case 'ENOENT':
                return callback();
            case 'EPERM':
                return deleteDirectory(file, callback);
            default:
                return callback(err);
        }
    });
}

/**
 *
 * @param {string} dir
 * @param {function(file,name,stats):boolean} [fileFilter] returns `true` to include, otherwise to exclude.
 * @param {function(file,name,stats):boolean} [dirFilter] returns `true` to include, otherwise to exclude.
 * @param {function} [callback]
 * @param {boolean} [recursive=false]
 * @returns {*}
 */
function iterateFiles(dir, fileFilter, dirFilter, callback, recursive) {
    return fs.readdir(dir, function (err, names) {
        if (err) {
            return callback(err);
        }
        async.reduce(names, function (files, name, next) {
            var file = path.join(dir, name);
            fs.stat(file, function (err, stats) {
                if (err) {
                    return next(err);
                }
                if (stats.isFile()) {
                    if (!fileFilter || fileFilter(file, name, stats)) {
                        files.push(file);
                    }
                } else if (stats.isDirectory()) {
                    if (!dirFilter || dirFilter(file, name, stats)) {
                        files.push(file);
                    }
                    if (recursive) {
                        // NOTE: async recursion for subdirectory...
                        return iterateFiles(file, fileFilter, dirFilter, function (err, result) {
                            if (err) {
                                return next(err);
                            }
                            next(null, files.concat(result));
                        }, true);
                    }
                }
                next(null, files);
            });
        }, callback, []);
    });
}

module.exports = {
    MemoryStream: MemoryStream,
    toStream: MemoryStream,
    toBuffer: toBuffer,
    toString: toString,
    copyStream: copyStream,
    concatStreams: concatStreams,
    copyFile: copyFile,
    concatFiles: concatFiles,
    isFileNewer: isFileNewer,
    createDirectory: createDirectory,
    cleanDirectory: cleanDirectory,
    deleteDirectory: deleteDirectory,
    forceDelete: forceDelete,
    iterateFiles: iterateFiles
};
