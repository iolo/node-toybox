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
});