/* global describe,it,before,beforeEach,after,afterEach */
'use strict';

var
    assert = require('assert'),
    Q = require('q'),
    async = require('../async'),
    debug = require('debug')('test');

describe('async', function () {
    function delay(delay) {
        debug('delay', delay);
        //return Q.delay(delay, delay);
        console.time('delay:' + delay);
        var d = Q.defer();
        setTimeout(function () {
            console.timeEnd('delay:' + delay);
            d.resolve(delay);
        }, delay);
        return d.promise;
    }

    describe('parallel', function () {

        it('no limit', function (done) {
            var ordered = [];
            var expected = [300, 100, 200, 0];
            var sorted = [0, 100, 200, 300];
            var tasks = expected.map(delay);
            async.parallel(tasks).progress(function (x) {
                debug('>>>progress', x);
                ordered.push(x.value);
            }).then(function (result) {
                debug('result:', result);
                assert.deepEqual(result, expected);
                debug('ordered:', ordered);
                assert.deepEqual(ordered, sorted);
            }).catch(assert.ifError).done(done);
        });
        it('limit 0', function (done) {
            var ordered = [];
            var expected = [300, 100, 200, 0];
            var sorted = [0, 100, 200, 300];
            var tasks = expected.map(delay);
            async.parallel(tasks, 0).progress(function (x) {
                debug('>>>progress', x);
                ordered.push(x.value);
            }).then(function (result) {
                debug('result:', result);
                assert.deepEqual(result, expected);
                debug('ordered:', ordered);
                assert.deepEqual(ordered, sorted);
            }).catch(assert.ifError).done(done);
        });
        it('limit 4 == tasks.length', function (done) {
            var ordered = [];
            var expected = [300, 100, 200, 0];
            var sorted = [0, 100, 200, 300];
            var tasks = expected.map(delay);
            async.parallel(tasks, 4).progress(function (x) {
                debug('>>>progress', x);
                ordered.push(x.value);
            }).then(function (result) {
                debug('result:', result);
                assert.deepEqual(result, expected);
                debug('ordered:', ordered);
                assert.deepEqual(ordered, sorted);
            }).catch(assert.ifError).done(done);
        });
        it('limit 5 > tasks.length', function (done) {
            var ordered = [];
            var expected = [300, 100, 200, 0];
            var sorted = [0, 100, 200, 300];
            var tasks = expected.map(delay);
            async.parallel(tasks, 5).progress(function (x) {
                debug('>>>progress', x);
                ordered.push(x.value);
            }).then(function (result) {
                debug('result:', result);
                assert.deepEqual(result, expected);
                debug('ordered:', ordered);
                assert.deepEqual(ordered, sorted);
            }).catch(assert.ifError).done(done);
        });
        it('limit 1 < tasks.length', function (done) {
            var ordered = [];
            var expected = [300, 100, 200, 0];
            var tasks = expected.map(delay);
            async.parallel(tasks, 1).progress(function (x) {
                debug('>>>progress', x);
                ordered.push(x.value);
            }).then(function (result) {
                debug('result:', result);
                assert.deepEqual(result, expected);
                // ***NOTE!!!***
                assert.deepEqual(ordered, expected);
            }).catch(assert.ifError).done(done);
        });
        it('limit 2 < tasks.length', function (done) {
            var ordered = [];
            var expected = [300, 100, 200, 0];
            var tasks = expected.map(delay);
            async.parallel(tasks, 2).progress(function (x) {
                debug('--->progress:', x);
                ordered.push(x.value);
            }).then(function (result) {
                debug('result:', result);
                assert.deepEqual(result, expected);
                // ***NOTE!!!***
                // +300 +100 --> 100
                // @300 +200 --> 200
                // @300 +0   --> 0
                //           --> 300
                debug('ordered:', ordered);
                assert.deepEqual(ordered, [100, 200, 0, 300]);
            }).catch(assert.ifError).done(done);
        });
        it('limit 3 < tasks.length', function (done) {
            var ordered = [];
            var expected = [300, 100, 200, 0];
            var tasks = expected.map(delay);
            async.parallel(tasks, 3).progress(function (x) {
                debug('>>>progress', x);
                ordered.push(x.value);
            }).then(function (result) {
                debug('result:', result);
                assert.deepEqual(result, expected);
                // ***NOTE!!!***
                // +300 +100 +200 --> 100
                // @300 @200 +0   --> 0
                // @300           --> 200
                //                --> 300
                debug('ordered:', ordered);
                assert.deepEqual(ordered, [100, 0, 200, 300]);
            }).catch(assert.ifError).done(done);
        });
    });

    describe('serial', function () {
        it('in row after row', function (done) {
            var ordered = [];
            var expected = [300, 100, 200, 0];
            var tasks = expected.map(delay);
            async.parallel(tasks, 1).progress(function (x) {
                debug('>>>progress', x);
                ordered.push(x.value);
            }).then(function (result) {
                debug('result:', result);
                assert.deepEqual(result, expected);
                // ***NOTE!!!***
                assert.deepEqual(ordered, expected);
            }).catch(assert.ifError).done(done);
        });
    });

    describe('waterfall', function () {

        function incr(a) {
            debug('incr', a);
            return a + 1;
        }

        function incrQ(a) {
            debug('incrQ', a);
            //return Q.delay(a + 1, 10);
            var d = Q.defer();
            setTimeout(function () {
                d.resolve(a + 1);
            }, 100);
            return d.promise;
        }

        it('functions', function (done) {
            var tasks = [
                incr,
                incr,
                incr,
                incr
            ];
            async.waterfall(tasks, 0).then(function (result) {
                debug('result:', result);
                assert.equal(result, 4);
            }).catch(assert.ifError).done(done);
        });
        it('promises', function (done) {
            var tasks = [
                incrQ,
                incrQ,
                incrQ,
                incrQ
            ];
            async.waterfall(tasks, 0).then(function (result) {
                debug('result:', result);
                assert.equal(result, 4);
            }).catch(assert.ifError).done(done);
        });
    });

    describe('qualify', function () {

        function foo(callback) {
            debug('foo', this);
            callback(null, 'ok:' + this);
        }

        function bar(callback) {
            debug('bar', this);
            callback('err:' + this);
        }

        function baz(callback) {
            debug('baz', this);
            callback('err:' + this);
        }

        function qux() {
            debug('qux', this);
        }

        function Something() {
            debug('something');
        }

        Something.prototype.foo = foo;
        Something.prototype.bar = bar;
        Something.prototype.baz = baz;
        Something.prototype.qux = qux;
        Something.prototype.toString = function () {
            return 'something';
        };

        it('filter', function () {
            var obj = {
                foo: foo,
                bar: bar,
                baz: baz,
                qux: qux
            };
            var qualified = async.qualify(obj, {filter: function (func) {
                return func.name === 'foo';
            }});
            debug(Object.keys(qualified));
            assert(obj === qualified);
            assert(typeof qualified.fooQ === 'function');
            assert(typeof qualified.barQ === 'undefined');
            assert(typeof qualified.bazQ === 'undefined');
            assert(typeof qualified.quxQ === 'undefined');
        });

        it('mapper', function () {
            var obj = {
                foo: foo,
                bar: bar,
                baz: baz,
                qux: qux
            };
            var qualified = async.qualify(obj, {mapper: function (funcName) {
                return funcName.toUpperCase();
            }});
            debug(Object.keys(qualified));
            assert(obj === qualified);
            assert(typeof qualified.FOO === 'function');
            assert(typeof qualified.BAR === 'function');
            assert(typeof qualified.BAZ === 'function');
            assert(typeof qualified.QUX === 'undefined');
        });

        it('prefix and suffix', function () {
            var obj = {
                foo: foo,
                bar: bar,
                baz: baz,
                qux: qux
            };
            var qualified = async.qualify(obj, {prefix: 'prefix_', suffix: '_suffix'});
            debug(Object.keys(qualified));
            assert(obj === qualified);
            assert(typeof qualified.prefix_foo_suffix === 'function');
            assert(typeof qualified.prefix_bar_suffix === 'function');
            assert(typeof qualified.prefix_baz_suffix === 'function');
            assert(typeof qualified.prefix_qux_suffix === 'undefined');
        });

        it('object', function (done) {
            var obj = {
                foo: foo,
                bar: bar,
                baz: baz,
                qux: qux
            };
            var qualified = async.qualify(obj, {});
            debug(Object.keys(qualified));
            assert(obj === qualified);
            assert(typeof qualified.fooQ === 'function');
            assert(typeof qualified.barQ === 'function');
            assert(typeof qualified.bazQ === 'function');
            assert(typeof qualified.quxQ === 'undefined');
            qualified.fooQ().then(function (result) {
                assert.equal(result, 'ok:undefined');
            }).catch(assert.ifError).done(function () {
                qualified.barQ().then(assert.ifError).catch(function (err) {
                    assert.equal(err, 'err:undefined');
                }).done(done);
            });
        });
        it('object null', function (done) {
            var obj = {
                foo: foo,
                bar: bar,
                baz: baz,
                qux: qux
            };
            var qualified = async.qualify(obj, {}, null);
            debug(Object.keys(qualified));
            assert(obj === qualified);
            assert(typeof qualified.fooQ === 'function');
            assert(typeof qualified.barQ === 'function');
            assert(typeof qualified.bazQ === 'function');
            assert(typeof qualified.quxQ === 'undefined');
            qualified.fooQ().then(function (result) {
                assert.equal(result, 'ok:null');
            }).catch(assert.ifError).done(function () {
                qualified.barQ().then(assert.ifError).catch(function (err) {
                    assert.equal(err, 'err:null');
                }).done(done);
            });
        });
        it('object test', function (done) {
            var obj = {
                foo: foo,
                bar: bar,
                baz: baz,
                qux: qux
            };
            var qualified = async.qualify(obj, {}, 'test');
            debug(Object.keys(qualified));
            assert(obj === qualified);
            assert(typeof qualified.fooQ === 'function');
            assert(typeof qualified.barQ === 'function');
            assert(typeof qualified.bazQ === 'function');
            assert(typeof qualified.quxQ === 'undefined');
            qualified.fooQ().then(function (result) {
                assert.equal(result, 'ok:test');
            }).catch(assert.ifError).done(function () {
                qualified.barQ().then(assert.ifError).catch(function (err) {
                    assert.equal(err, 'err:test');
                }).done(done);
            });
        });
        it('prototype', function (done) {
            var Qualified = async.qualify(Something);
            var qualified = new Qualified();
            debug(Object.keys(qualified));
            assert(Something === Qualified);
            assert(typeof qualified.fooQ === 'function');
            assert(typeof qualified.barQ === 'function');
            assert(typeof qualified.bazQ === 'function');
            assert(typeof qualified.quxQ === 'undefined');
            qualified.fooQ().then(function (result) {
                assert.equal(result, 'ok:something');
            }).catch(assert.ifError).done(function () {
                qualified.barQ().then(assert.ifError).catch(function (err) {
                    assert.equal(err, 'err:something');
                }).done(done);
            });
        });

    });
});
