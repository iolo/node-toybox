/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    assert = require('assert'),
    fs = require('fs'),
    io = require('../io'),
    debug = require('debug')('test');

describe('io', function () {
    var BASE_DIR = '/tmp/io-test';
    var TEST_DIR = BASE_DIR + '/foo/bar/baz/qux';
    var TEST_FILE = TEST_DIR + '/hello';
    var TEST_DATA = 'world';

    beforeEach(function (done) {
        require('child_process').exec('mkdir -p ' + TEST_DIR, function (err) {
            fs.writeFile(TEST_FILE, TEST_DATA, 'utf8', done);
        });
    });

    afterEach(function (done) {
        require('child_process').exec('rm -rf ' + TEST_DIR, done);
    });

    it('toStream binary', function (done) {
        var data = new Buffer(0);
        io.toStream(new Buffer([1, 2, 3, 4, 5]))
            .on('data', function (chunk) {
                debug('toStream:data:', chunk);
                data = Buffer.concat([data, chunk]);
            })
            .once('error', assert.ifError)
            .once('end', function () {
                assert.deepEqual(data.toJSON(), [1, 2, 3, 4, 5]);
                done();
            });
    });
    it('toStream string', function (done) {
        var data = '';
        io.toStream(TEST_DATA)
            .on('data', function (chunk) {
                debug('toStream:data:', chunk);
                data += chunk;
            })
            .once('error', assert.ifError)
            .once('end', function () {
                assert.equal(data, TEST_DATA);
                done();
            });
    });
    it('toBuffer binary', function (done) {
        io.toBuffer(fs.createReadStream(TEST_FILE), function (err, result) {
            assert.ifError(err);
            debug('toBuffer:', result);
            assert.ok(Buffer.isBuffer(result));
            assert.equal(result, TEST_DATA);
            done();
        });
    });
    it('toBuffer string', function (done) {
        io.toBuffer(fs.createReadStream(TEST_FILE, 'utf8'), function (err, result) {
            assert.ifError(err);
            debug('toBuffer:', result);
            assert.ok(Buffer.isBuffer(result));
            assert.equal(result, TEST_DATA);
            done();
        });
    });
    it('toString binary', function (done) {
        io.toString(fs.createReadStream(TEST_FILE), function (err, result) {
            assert.ifError(err);
            debug('toString:', result);
            assert.ok(typeof result === 'string');
            assert.equal(result, TEST_DATA);
            done();
        });
    });
    it('toString string', function (done) {
        io.toString(fs.createReadStream(TEST_FILE, 'utf8'), function (err, result) {
            assert.ifError(err);
            debug('toString:', result);
            assert.ok(typeof result === 'string');
            assert.equal(result, TEST_DATA);
            done();
        });
    });
    it('copyStream', function (done) {
        io.copyStream(fs.createReadStream(TEST_FILE, 'utf8'), fs.createWriteStream('/tmp/io-test-stream'), function (err) {
            assert.ifError(err);
            assert(fs.readFileSync('/tmp/io-test-stream', 'utf8'), TEST_DATA);
            done();
        });
    });
    it('concatStreams', function (done) {
        var readables = [TEST_FILE, TEST_FILE, TEST_FILE].map(function (f) {
            return fs.createReadStream(f);
        });
        io.concatStreams(readables, fs.createWriteStream('/tmp/io-test-stream-concat'), function (err) {
            assert.ifError(err);
            assert(fs.readFileSync('/tmp/io-test-file-concat', 'utf8'), TEST_DATA + TEST_DATA + TEST_DATA);
            done();
        });
    });
    it('copyFile', function (done) {
        io.copyFile(TEST_FILE, '/tmp/io-test-file', function (err) {
            assert.ifError(err);
            assert(fs.readFileSync('/tmp/io-test-file', 'utf8'), TEST_DATA);
            done();
        });
    });
    it('concatFiles', function (done) {
        io.concatFiles([TEST_FILE, TEST_FILE, TEST_FILE], '/tmp/io-test-file-concat', function (err) {
            assert.ifError(err);
            assert(fs.readFileSync('/tmp/io-test-file-concat', 'utf8'), TEST_DATA + TEST_DATA + TEST_DATA);
            done();
        });
    });
    it('createDirectory', function (done) {
        require('child_process').exec('rm -rf ' + TEST_DIR, function (err) {
            assert(!fs.existsSync(TEST_DIR));
            io.createDirectory(TEST_DIR, function (err) {
                assert.ifError(err);
                assert(fs.existsSync(TEST_DIR));
                done();
            });
        });
    });
    it('cleanDirectory dir', function (done) {
        assert(fs.existsSync(BASE_DIR));
        assert(fs.readdirSync(BASE_DIR).length > 0);
        io.cleanDirectory(BASE_DIR, function (err) {
            assert.ifError(err);
            assert(fs.existsSync(BASE_DIR));
            assert(fs.readdirSync(BASE_DIR).length == 0);
            done();
        });
    });
    it('cleanDirectory file', function (done) {
        assert(fs.existsSync(TEST_FILE));
        io.cleanDirectory(TEST_FILE, function (err) {
            assert.equal(err.code, 'ENOTDIR');
            assert(fs.existsSync(TEST_FILE));
            done();
        });
    });
    it('deleteDirectory dir', function (done) {
        assert(fs.existsSync(BASE_DIR));
        assert(fs.readdirSync(BASE_DIR).length > 0);
        io.deleteDirectory(BASE_DIR, function (err) {
            assert.ifError(err);
            assert(!fs.existsSync(BASE_DIR));
            done();
        });
    });
    it('deleteDirectory file', function (done) {
        assert(fs.existsSync(TEST_FILE));
        io.deleteDirectory(TEST_FILE, function (err) {
            assert(err);
            assert(fs.existsSync(TEST_FILE));
            done();
        });
    });
    it('forceDelete dir', function (done) {
        assert(fs.existsSync(BASE_DIR));
        assert(fs.readdirSync(BASE_DIR).length > 0);
        io.forceDelete(BASE_DIR, function (err) {
            assert.ifError(err);
            assert(!fs.existsSync(BASE_DIR));
            done();
        });
    });
    it('forceDelete file', function (done) {
        assert(fs.existsSync(TEST_FILE));
        io.forceDelete(TEST_FILE, function (err) {
            assert.ifError(err);
            assert(!fs.existsSync(TEST_FILE));
            done();
        });
    });
    it('iterateFiles', function (done) {
        io.iterateFiles(TEST_DIR, function (file) {
            debug('**********file:', file);
            assert.equal(file, TEST_FILE);
            return true;
        }, function (dir) {
            debug('**********dir:', dir);
            assert.equal(dir, TEST_DIR);
            return true;
        }, function (err, result) {
            assert.ifError(err);
            debug('**********', arguments);
            assert.equal(result.length, 1);
            assert.equal(result[0], TEST_FILE);
            done();
        });
    });
    it('iterateFiles dir only', function (done) {
        io.iterateFiles(TEST_DIR, function (file) {
            debug('**********file:', file);
            assert.equal(file, TEST_FILE);
            return false;
        }, function (dir) {
            debug('**********dir:', dir);
            assert.equal(dir, TEST_DIR);
            return true;
        }, function (err, result) {
            assert.ifError(err);
            debug('**********', arguments);
            assert.equal(result.length, 0);
            done();
        });
    });
    it('iterateFiles file only', function (done) {
        io.iterateFiles(TEST_DIR, function (file) {
            debug('**********file:', file);
            assert.equal(file, TEST_FILE);
            return true;
        }, function (dir) {
            debug('**********dir:', dir);
            assert.equal(dir, TEST_DIR);
            return false;
        }, function (err, result) {
            assert.ifError(err);
            debug('**********', arguments);
            assert.equal(result.length, 1);
            assert.equal(result[0], TEST_FILE);
            done();
        });
    });
    it('iterateFiles filter all', function (done) {
        io.iterateFiles(TEST_DIR, function (file) {
            debug('**********file:', file);
            assert.equal(file, TEST_FILE);
            return false;
        }, function (dir) {
            debug('**********dir:', dir);
            assert.equal(dir, TEST_DIR);
            return false;
        }, function (err, result) {
            assert.ifError(err);
            debug('**********', arguments);
            assert.equal(result.length, 0);
            done();
        });
    });
    it('iterateFiles recursive', function (done) {
        var expected = ['/foo', '/foo/bar', '/foo/bar/baz', '/foo/bar/baz/qux'];
        var i = 0;
        io.iterateFiles(BASE_DIR, function (file) {
            debug('**********file:', file);
            assert.equal(file, TEST_FILE);
            return true;
        }, function (dir) {
            debug('**********dir:', dir);
            assert.equal(dir, BASE_DIR + expected[i++]);
            return true;
        }, function (err, result) {
            assert.ifError(err);
            debug('**********', arguments);
            assert.equal(result.length, expected.length + 1);
            for (var i = 0; i < expected.length; i++) {
                assert.equal(result[i], BASE_DIR + expected[i]);
            }
            assert.equal(result[result.length - 1], TEST_FILE);
            done();
        }, true);
    });
    it('iterateFiles dir only recursive', function (done) {
        var expected = ['/foo', '/foo/bar', '/foo/bar/baz', '/foo/bar/baz/qux'];
        var i = 0;
        io.iterateFiles(BASE_DIR, function (file) {
            debug('**********file:', file);
            assert.equal(file, TEST_FILE);
            return false;
        }, function (dir) {
            debug('**********dir:', dir);
            assert.equal(dir, BASE_DIR + expected[i++]);
            return true;
        }, function (err, result) {
            assert.ifError(err);
            debug('**********', arguments);
            assert.equal(result.length, expected.length);
            for (var i = 0; i < expected.length; i++) {
                assert.equal(result[i], BASE_DIR + expected[i]);
            }
            done();
        }, true);
    });
    it('iterateFiles file only recursive', function (done) {
        var expected = ['/foo', '/foo/bar', '/foo/bar/baz', '/foo/bar/baz/qux'];
        var i = 0;
        io.iterateFiles(BASE_DIR, function (file) {
            debug('**********file:', file);
            assert.equal(file, TEST_FILE);
            return true;
        }, function (dir) {
            debug('**********dir:', dir);
            assert.equal(dir, BASE_DIR + expected[i++]);
            return false;
        }, function (err, result) {
            assert.ifError(err);
            debug('**********', arguments);
            assert.equal(result.length, 1);
            assert.equal(result[0], TEST_FILE);
            done();
        }, true);
    });
    it('iterateFiles filter all recursive', function (done) {
        var expected = ['/foo', '/foo/bar', '/foo/bar/baz', '/foo/bar/baz/qux'];
        var i = 0;
        io.iterateFiles(BASE_DIR, function (file) {
            debug('**********file:', file);
            assert.equal(file, TEST_FILE);
            return false;
        }, function (dir) {
            debug('**********dir:', dir);
            assert.equal(dir, BASE_DIR + expected[i++]);
            return false;
        }, function (err, result) {
            assert.ifError(err);
            debug('**********', arguments);
            assert.equal(result.length, 0);
            done();
        }, true);
    });
});