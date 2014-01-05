'use strict';

var
  errors = require('../libs/errors'),
  debug = require('debug')('test');

module.exports = {
  test_Error: function (test) {
    var e = new Error('foo');
    debug('error:', e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof Error);
    test.ok(require('util').isError(e));
    test.equal(e.name, 'Error');
    test.equal(e.message, 'foo');
    test.done();
  },
  test_CustomError: function (test) {
    var e = new errors.CustomError(1234, 'foo');
    debug('error:', e);
    debug('toString:', e.toString());
    debug('message:', e.message);
    debug('name:', e.name);
    test.ok(e instanceof errors.CustomError);
    test.ok(e instanceof Error);
    //FIXME: test.ok(require('util').isError(e));
    test.equal(e.code, 1234);
    test.done();
  }
};
