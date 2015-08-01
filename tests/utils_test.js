/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    assert = require('assert'),
    utils = require('../utils'),
    debug = require('debug')('test');

describe('utils', function () {
    it('toInt', function (){
        assert.equal(utils.toInt('123'), 123);
        assert.equal(utils.toInt('0123'), 123);
        assert.equal(utils.toInt('-123'), -123);
        assert.equal(utils.toInt('-0123'), -123);
        assert.equal(utils.toInt('Infinity'), Infinity);
        assert.equal(utils.toInt('-Infinity'), -Infinity);
        assert.equal(utils.toInt(123), 123);
        assert.equal(utils.toInt(-123), -123);
        assert.equal(utils.toInt(Infinity), Infinity);
        assert.equal(utils.toInt(-Infinity), -Infinity);

        assert.equal(utils.toInt('123x'), undefined);
        assert.equal(utils.toInt('123.456'), undefined);
        assert.equal(utils.toInt('-123x'), undefined);
        assert.equal(utils.toInt('-123.456'), undefined);
        assert.equal(utils.toInt(-123.456), undefined);
        assert.equal(utils.toInt(true), undefined);
        assert.equal(utils.toInt(false), undefined);
        assert.equal(utils.toInt(null), undefined);
        assert.equal(utils.toInt(new Date()), undefined);
        assert.equal(utils.toInt(), undefined);

        assert.equal(utils.toInt('123x', 123), 123);
        assert.equal(utils.toInt('123.456', 123), 123);
        assert.equal(utils.toInt('-123x', 123), 123);
        assert.equal(utils.toInt('-123.456', 123), 123);
        assert.equal(utils.toInt(-123.456, 123), 123);
        assert.equal(utils.toInt(true, 123), 123);
        assert.equal(utils.toInt(false, 123), 123);
        assert.equal(utils.toInt(null, 123), 123);
        assert.equal(utils.toInt(new Date(), 123), 123);
        assert.equal(utils.toInt(undefined, 123), 123);
    });
    it('toNumber', function (){
        assert.equal(utils.toNumber('123'), 123);
        assert.equal(utils.toNumber('0123'), 123);
        assert.equal(utils.toNumber('123.456'), 123.456);
        assert.equal(utils.toNumber('-123'), -123);
        assert.equal(utils.toNumber('-0123'), -123);
        assert.equal(utils.toNumber('-123.456'), -123.456);
        assert.equal(utils.toNumber('Infinity'), Infinity);
        assert.equal(utils.toNumber('-Infinity'), -Infinity);
        assert.equal(utils.toNumber(123), 123);
        assert.equal(utils.toNumber(-123), -123);
        assert.equal(utils.toNumber(-123.456), -123.456);
        assert.equal(utils.toNumber(Infinity), Infinity);
        assert.equal(utils.toNumber(-Infinity), -Infinity);

        assert.equal(utils.toNumber('123x'), undefined);
        assert.equal(utils.toNumber('-123x'), undefined);
        assert.equal(utils.toNumber(true), undefined);
        assert.equal(utils.toNumber(false), undefined);
        assert.equal(utils.toNumber(null), undefined);
        assert.equal(utils.toNumber(new Date()), undefined);
        assert.equal(utils.toNumber(), undefined);

        assert.equal(utils.toNumber('123x', 123), 123);
        assert.equal(utils.toNumber('-123x', 123), 123);
        assert.equal(utils.toNumber(true, 123), 123);
        assert.equal(utils.toNumber(false, 123), 123);
        assert.equal(utils.toNumber(null, 123), 123);
        assert.equal(utils.toNumber(new Date(), 123), 123);
        assert.equal(utils.toNumber(undefined, 123), 123);
    });
    it('toBoolean', function (){
        assert.equal(utils.toBoolean('1'), true);
        assert.equal(utils.toBoolean('y'), true);
        assert.equal(utils.toBoolean('t'), true);
        assert.equal(utils.toBoolean('yes'), true);
        assert.equal(utils.toBoolean('true'), true);
        assert.equal(utils.toBoolean('on'), true);
        assert.equal(utils.toBoolean('0'), false);
        assert.equal(utils.toBoolean('n'), false);
        assert.equal(utils.toBoolean('f'), false);
        assert.equal(utils.toBoolean('no'), false);
        assert.equal(utils.toBoolean('false'), false);
        assert.equal(utils.toBoolean('off'), false);
        assert.equal(utils.toBoolean(true), true);
        assert.equal(utils.toBoolean(false), false);

        assert.equal(utils.toBoolean(null), undefined);
        assert.equal(utils.toBoolean(new Date()), undefined);
        assert.equal(utils.toBoolean(), undefined);
        assert.equal(utils.toBoolean(123), undefined);
        assert.equal(utils.toBoolean(-123), undefined);
        assert.equal(utils.toBoolean(-123.456), undefined);
        assert.equal(utils.toBoolean(Infinity), undefined);
        assert.equal(utils.toBoolean(-Infinity), undefined);

        assert.equal(utils.toBoolean(null, true), true);
        assert.equal(utils.toBoolean(new Date(), true), true);
        assert.equal(utils.toBoolean(undefined, true), true);
        assert.equal(utils.toBoolean(123, true), true);
        assert.equal(utils.toBoolean(-123, true), true);
        assert.equal(utils.toBoolean(-123.456, true), true);
        assert.equal(utils.toBoolean(Infinity, true), true);
        assert.equal(utils.toBoolean(-Infinity, true), true);
    });
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
