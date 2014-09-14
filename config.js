'use strict';

/** @module node-toybox.config */

var
    path = require('path'),
    _ = require('lodash');

function load(name) {
    var
        configDir = path.dirname(module.parent.filename),
        defPath = path.join(configDir, 'defaults'),
        envPrefix = name.toUpperCase(),
        envName = process.env[envPrefix + '_ENV'] || process.env.NODE_ENV || 'development',
        envPath = process.env[envPrefix + '_CONFIG'] || path.join(configDir, envName),
        debug = require('debug')(name + ':config'),
        DEBUG = debug.enabled;

    DEBUG && debug('load configuration for', envName, 'from', envPath);

    try {
        var envConfig = require(envPath),
            defConfig = require(defPath),
            config = _.merge(defConfig, envConfig);
        DEBUG && debug(require('util').inspect(config, {depth: null, colors: true}));
        return config;
    } catch (e) {
        console.error('***fatal*** failed to load config', e);
        return process.exit(2);
    }
}

module.exports = function (name) {
    var config = load(name);

    function merge(opts) {
        return _.merge(config, opts);
    }

    return _.extend(merge, config);
};
