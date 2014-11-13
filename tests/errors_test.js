/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    assert = require('assert'),
    errors = require('../errors'),
    debug = require('debug')('test');

describe('errors', function () {
    it('Error', function () {
        var e = new Error('foo');
        debug('error:', e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof Error);
        assert.ok(require('util').isError(e));
        assert.equal(e.name, 'Error');
        assert.equal(e.message, 'foo');
        assert.equal(e.toString(), 'Error: foo');
        assert.equal(JSON.stringify(e), JSON.stringify({}));
    });
    it('CustomError', function () {
        var e = new errors.CustomError(1234, 'foo', {cause: 4567});
        debug('error:', e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        //FIXME: test.ok(require('util').isError(e));
        assert.equal(e.name, 'CustomError');
        assert.equal(e.code, 1234);
        assert.equal(e.message, 'foo');
        assert.deepEqual(e.cause, {cause: 4567});
        assert.equal(e.toString(), 'CustomError#1234: foo')
        assert.equal(JSON.stringify(e), JSON.stringify({
            name: 'CustomError',
            code: 1234,
            message: 'foo',
            cause: {cause: 4567}
        }));
    });
    it('defineError', function () {
        var MyError = errors.defineError('MyError', errors.CustomError);
        var e = new MyError(1234, 'foo', {cause: 4567});
        debug('error:', e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof MyError);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        //FIXME: test.ok(require('util').isError(e));
        assert.equal(e.name, 'MyError');
        assert.equal(e.code, 1234);
        assert.equal(e.message, 'foo');
        assert.deepEqual(e.cause, {cause: 4567});
        assert.equal(e.toString(), 'MyError#1234: foo')
        assert.equal(JSON.stringify(e), JSON.stringify({
            name: 'MyError',
            code: 1234,
            message: 'foo',
            cause: {cause: 4567}
        }));
    });
});
