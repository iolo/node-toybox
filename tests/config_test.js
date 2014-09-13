'use strict';

var
    assert = require('assert'),
    debug = require('debug')('test');

describe('config', function () {
    beforeEach(function () {
        // XXX: unload all configuration modules
        delete require.cache[require.resolve('./config')];
        delete require.cache[require.resolve('./config/defaults')];
        delete require.cache[require.resolve('./config/development')];
        delete require.cache[require.resolve('./config/staging')];
        delete require.cache[require.resolve('./config/production')];
        delete require.cache[require.resolve('../libs/config')];
    });
    it('should load without env/config', function () {
        process.env.HELLO_ENV = '';
        process.env.HELLO_CONFIG = '';
        var config = require('./config');
        debug('config:', config);
        assert.equal(config.foo, 'development');
        assert.equal(config.bar.baz, 'baz');
        assert.equal(config.bar.qux, 'qux');
    });
    it('should load with env development', function () {
        process.env.HELLO_ENV = 'development';
        process.env.HELLO_CONFIG = '';
        var config = require('./config');
        debug('config:', config);
        assert.equal(config.foo, 'development');
        assert.equal(config.bar.baz, 'baz');
        assert.equal(config.bar.qux, 'qux');
    });
    it('should load with env staging', function () {
        process.env.HELLO_ENV = 'staging';
        process.env.HELLO_CONFIG = '';
        var config = require('./config');
        debug('config:', config);
        assert.equal(config.foo, 'foo');
        assert.equal(config.bar.baz, 'staging');
        assert.equal(config.bar.qux, 'qux');
    });
    it('should load with env production', function () {
        process.env.HELLO_ENV = 'production';
        process.env.HELLO_CONFIG = '';
        var config = require('./config');
        debug('config:', config);
        assert.equal(config.foo, 'foo');
        assert.equal(config.bar.baz, 'baz');
        assert.equal(config.bar.qux, 'production');
    });
    it('should load with config', function () {
        process.env.HELLO_ENV = '__whatever__';
        process.env.HELLO_CONFIG = __dirname + '/config/production';
        var config = require('./config');
        debug('config:', config);
        assert.equal(config.foo, 'foo');
        assert.equal(config.bar.baz, 'baz');
        assert.equal(config.bar.qux, 'production');
    });
    it('should merge', function () {
        process.env.HELLO_ENV = 'development';
        process.env.HELLO_CONFIG = '';
        var config = require('./config')({bar: {qux: 'merge'}});
        debug('config:', config);
        assert.equal(config.foo, 'development');
        assert.equal(config.bar.baz, 'baz');
        assert.equal(config.bar.qux, 'merge');
    });
});
