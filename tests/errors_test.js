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
    });
    it('CustomError', function () {
        var e = new errors.CustomError(1234, 'foo');
        debug('error:', e);
        debug('toString:', e.toString());
        debug('message:', e.message);
        debug('name:', e.name);
        assert.ok(e instanceof errors.CustomError);
        assert.ok(e instanceof Error);
        //FIXME: test.ok(require('util').isError(e));
        assert.equal(e.code, 1234);
    });
});
