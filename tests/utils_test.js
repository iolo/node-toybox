'use strict';

var
    utils = require('../libs/utils'),
    debug = require('debug')('test');

module.exports = {
    test_split: function (test) {
        var result = utils.split('a,b,c');
        test.equal(result.length, 3);
        test.equal(result[0], 'a');
        test.equal(result[1], 'b');
        test.equal(result[2], 'c');
        test.done();
    },
    test_split_whitespace: function (test) {
        var result = utils.split('  a,  b,  c  ');
        test.equal(result.length, 3);
        test.equal(result[0], 'a');
        test.equal(result[1], 'b');
        test.equal(result[2], 'c');
        test.done();
    },
    test_split_empty: function (test) {
        var result = utils.split('');
        test.equal(result.length, 0);
        test.done();
    },
    test_split_null: function (test) {
        var result = utils.split(null);
        test.equal(result.length, 0);
        test.done();
    },
    test_split_undefined: function (test) {
        var result = utils.split();
        test.equal(result.length, 0);
        test.done();
    },
    test_split_blankTag: function (test) {
        var result = utils.split('a,,b,   ,c');
        test.equal(result.length, 3);
        test.equal(result[0], 'a');
        test.equal(result[1], 'b');
        test.equal(result[2], 'c');
        test.done();
    },
    test_join: function (test) {
        var result = utils.join(['a', 'b', 'c']);
        test.equal(result, 'a,b,c');
        test.done();
    },
    test_join_blankTag: function (test) {
        var result = utils.join(['a', '', 'b', '   ', 'c']);
        test.equal(result, 'a,b,c');
        test.done();
    },
    test_join_empty: function (test) {
        var result = utils.join([]);
        test.equal(result, '');
        test.done();
    },
    test_join_null: function (test) {
        var result = utils.join(null);
        test.equal(result, '');
        test.done();
    },
    test_join_undefined: function (test) {
        var result = utils.join();
        test.equal(result, '');
        test.done();
    },
};
