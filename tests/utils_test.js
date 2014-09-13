'use strict';

var
    assert = require('assert'),
    utils = require('../libs/utils'),
    debug = require('debug')('test');

describe('utils', function () {
    it('split', function () {
        var result = utils.split('a,b,c');
        assert.equal(result.length, 3);
        assert.equal(result[0], 'a');
        assert.equal(result[1], 'b');
        assert.equal(result[2], 'c');
    });
    it('split whitespace', function () {
        var result = utils.split('  a,  b,  c  ');
        assert.equal(result.length, 3);
        assert.equal(result[0], 'a');
        assert.equal(result[1], 'b');
        assert.equal(result[2], 'c');
    });
    it('split empty', function () {
        var result = utils.split('');
        assert.equal(result.length, 0);
    });
    it('split null', function () {
        var result = utils.split(null);
        assert.equal(result.length, 0);
    });
    it('split undefined', function () {
        var result = utils.split();
        assert.equal(result.length, 0);
    });
    it('split blank', function () {
        var result = utils.split('a,,b,   ,c');
        assert.equal(result.length, 3);
        assert.equal(result[0], 'a');
        assert.equal(result[1], 'b');
        assert.equal(result[2], 'c');
    });
    it('join', function () {
        var result = utils.join(['a', 'b', 'c']);
        assert.equal(result, 'a,b,c');
    });
    it('join blank', function () {
        var result = utils.join(['a', '', 'b', '   ', 'c']);
        assert.equal(result, 'a,b,c');
    });
    it('join empty', function () {
        var result = utils.join([]);
        assert.equal(result, '');
    });
    it('join null', function () {
        var result = utils.join(null);
        assert.equal(result, '');
    });
    it('join undefined', function () {
        var result = utils.join();
        assert.equal(result, '');
    });
});
