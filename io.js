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
 * @param {function(file,name,stats):boolean} [fileFilter] returns `true` to iterate, `false` to skip.
 * @param {function(file,name,stats):boolean} [dirFilter] returns `true` to iterate, `false` to skip.
 * @param {function(err,result)} [callback]
 * @param {boolean} [recursive]
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

/**
 *
 * @param {Array.<string>} files
 * @param {string} dst
 * @param {function} callback
 */
function concatFiles(files, dst, callback) {
    if (!files.length) {
        fs.close(dst);
        return callback(null, dst);
    }
    if (typeof dst === 'string') {
        return fs.open(dst, 'w', function (err, fd) {
            if (err) {
                switch (err.code) {
                    case 'ENOENT':
                        return createDirectory(path.dirname(dst), function (err) {
                            if (err) {
                                return callback(err);
                            }
                            // NOTE: one-time recursion with existing parent directory
                            return concatFiles(files, dst, callback);
                        });
                    default:
                        return callback(err);
                }
            }
            // NOTE: one-time recursion with file descriptor instead of file path
            return concatFiles(files, fd, callback);
        });
    }
    fs.readFile(files[0], null, function (err, data) {
        if (err) {
            return callback(err);
        }
        var errorOccurred = false;
        fs.write(dst, data, 0, data.length, null, function (err) {
            if (errorOccurred) {
                return;
            }
            if (err) {
                errorOccurred = true;
                return callback(err);
            }
            // NOTE: async recursion for remaining files...
            concatFiles(files.slice(1), dst, callback);
        });
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
    createDirectory: createDirectory,
    cleanDirectory: cleanDirectory,
    deleteDirectory: deleteDirectory,
    forceDelete: forceDelete,
    iterateFiles: iterateFiles,
    concatFiles: concatFiles
};
