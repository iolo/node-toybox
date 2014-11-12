/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    assert = require('assert'),
    fs = require('fs'),
    io = require('../io'),
    debug = require('debug')('test');

describe('io', function () {
    beforeEach(function () {
        fs.writeFileSync('/tmp/io-test.txt', 'hello', 'utf8');
    });

    it('toBuffer binary', function (done) {
        io.toBuffer(fs.createReadStream('/tmp/io-test.txt'), function (err, result) {
            assert.ifError(err);
            debug('toBuffer:', result);
            assert.ok(Buffer.isBuffer(result));
            assert.equal(result, 'hello');
            done();
        });
    });
    it('toBuffer string', function (done) {
        io.toBuffer(fs.createReadStream('/tmp/io-test.txt', 'utf8'), function (err, result) {
            assert.ifError(err);
            debug('toBuffer:', result);
            assert.ok(Buffer.isBuffer(result));
            assert.equal(result, 'hello');
            done();
        });
    });
    it('toString binary', function (done) {
        io.toString(fs.createReadStream('/tmp/io-test.txt'), function (err, result) {
            assert.ifError(err);
            debug('toString:', result);
            assert.ok(typeof result === 'string');
            assert.equal(result, 'hello');
            done();
        });
    });
    it('toString string', function (done) {
        io.toString(fs.createReadStream('/tmp/io-test.txt', 'utf8'), function (err, result) {
            assert.ifError(err);
            debug('toString:', result);
            assert.ok(typeof result === 'string');
            assert.equal(result, 'hello');
            done();
        });
    });
    it('createDirectory', function (done) {
        var dir = '/tmp/foo/bar/baz/qux';
        require('child_process').exec('rm -rf ' + dir, function (err) {
            assert(!fs.existsSync(dir));
            io.createDirectory(dir, function (err) {
                assert.ifError(err);
                assert(fs.existsSync(dir));
                done();
            });
        });
    });
    it('forceDelete', function (done) {
        var dir = '/tmp/foo/bar/baz/qux';
        require('child_process').exec('mkdir -p ' + dir, function (err) {
            assert(fs.existsSync(dir));
            io.forceDelete('/tmp/foo', function (err) {
                assert.ifError(err);
                assert(!fs.existsSync(dir));
                done();
            });
        });
    });
});