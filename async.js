'use strict';

var
    Q = require('q'),
    _ = require('lodash'),
    debug = require('debug')('node-toybox:q'),
    DEBUG = false;//!!debug.enabled;

/**
 *
 * @param {Array.<promise>} promises
 * @param {number} [limit]
 * @returns {promise}
 */
function parallel(promises, limit) {
    var d = Q.defer();
    var total = promises.length;
    var results = new Array(total);
    var firstErr;
    var running = 0;
    var finished = 0;
    var next = 0;

    limit = limit || total;

    function sched() {
        while (next < total && running < limit) {
            DEBUG && debug('*** sched #', next, '***', promises[next].inspect());
            exec(next++);
        }
    }

    function exec(id) {
        running += 1;
        var promise = promises[id];
        DEBUG && debug('>>> running', running);
        DEBUG && debug('*** run #', id, '***', promise.inspect());
        promise.then(function (result) {
            DEBUG && debug('#', id, 'then ***', result);
            results[id] = result; // collect all result
            d.notify(promise.inspect());
        }).catch(function (err) {
            DEBUG && debug('#', id, 'catch ***', err);
            firstErr = firstErr || err; // keep the first error
        }).finally(function () {
            DEBUG && debug('#', id, 'finally ***', promise.inspect());
            if (++finished === total) {
                DEBUG && debug('>>> finished all ***', firstErr, results);
                return firstErr ? d.reject(firstErr) : d.resolve(results);
            }
            DEBUG && debug('>>> finished', finished);
            running -= 1;
            sched();
        });
    }

    sched();
    return d.promise;
}

/**
 *
 * @param {Array.<promise>} promises
 * @returns {promise}
 */
function serial(promises) {
    return parallel(promises, 1);
}

/**
 *
 * @param {Array.<function>} funcs (promise-producing) functions
 * @param {*} [initial]
 * @returns {promise}
 */
function waterfall(funcs, initial) {
    return funcs.reduce(Q.when, Q(initial));
}

/**
 *
 * @param {Array} arr
 * @param {function(prev:*,curr:*,next:function)} iterator **should** invoke `next()` with error or next value.
 * @param {function} callback final callback.
 * @param {*} [initialValue]
 */
function reduce(arr, iterator, callback, initialValue) {
    if (!arr.length) {
        return callback(null, initialValue);
    }
    iterator(initialValue, arr[0], function (err, nextValue) {
        if (err) {
            return callback(err);
        }
        // NOTE: async recursion
        reduce(arr.slice(1), iterator, callback, nextValue);
    });
}

/**
 *
 * @param {object|function} obj object to wrap or `constructor` to wrap instance methods.
 * @param {*} [opts]
 * @param {string} [opts.prefix='']
 * @param {string} [opts.suffix='Q']
 * @param {function} [opts.filter]
 * @param {function} [opts.mapper]
 * @param {*} [ctx] the value to be passed as `this` to wrapped functions.
 * @returns {*} wrapped object
 */
function qualify(obj, opts, ctx) {
    var
        slice = Array.prototype.slice,
        funcs = (typeof obj === 'function' && typeof obj.prototype === 'object') ? obj.prototype : obj,
        prefix = (opts && opts.prefix) || '',
        suffix = (opts && opts.suffix) || 'Q',
        mapper = (opts && opts.mapper) || function (funcName) {
            return prefix + funcName + suffix;
        },
        filter = (opts && opts.filter) || function (func) {
            return typeof func === 'function' && func.length > 0;
        };
    Object.keys(funcs).forEach(function (funcName) {
        var func = funcs[funcName];
        if (filter(func)) {
            var wrappedFunc;
            if (funcs === obj) {
                wrappedFunc = (typeof ctx === 'undefined') ? Q.denodeify(func) : Q.nbind(func, ctx);
            } else {
                wrappedFunc = function () {
                    var d = Q.defer();
                    var args = slice.call(arguments);
                    args.push(d.makeNodeResolver());
                    func.apply(this, args);
                    return d.promise;
                };
            }
            funcs[mapper(funcName)] = wrappedFunc;
        }
    });
    return obj;
}

module.exports = {
    parallel: parallel,
    serial: serial,
    series: serial, // alias
    waterfall: waterfall,
    reduce: reduce,
    qualify: qualify
};
