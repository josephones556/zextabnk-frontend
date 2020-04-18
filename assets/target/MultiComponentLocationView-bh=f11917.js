//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);
//     Backbone.js 0.9.10

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to array methods.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.10';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  Backbone.$ = root.jQuery || root.Zepto || root.ender;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
    } else if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
    } else {
      return true;
    }
  };

  // Optimized internal dispatch function for triggering events. Tries to
  // keep the usual cases speedy (most Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length;
    switch (args.length) {
    case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx);
    return;
    case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0]);
    return;
    case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1]);
    return;
    case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1], args[2]);
    return;
    default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, or an events map,
    // to a `callback` function. Passing `"all"` will bind the callback to
    // all events fired.
    on: function(name, callback, context) {
      if (!(eventsApi(this, 'on', name, [callback, context]) && callback)) return this;
      this._events || (this._events = {});
      var list = this._events[name] || (this._events[name] = []);
      list.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind events to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!(eventsApi(this, 'once', name, [callback, context]) && callback)) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      this.on(name, once, context);
      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var list, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (list = this._events[name]) {
          events = [];
          if (callback || context) {
            for (j = 0, k = list.length; j < k; j++) {
              ev = list[j];
              if ((callback && callback !== ev.callback &&
                               callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                events.push(ev);
              }
            }
          }
          this._events[name] = events;
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // An inversion-of-control version of `on`. Tell *this* object to listen to
    // an event in another object ... keeping track of what it's listening to.
    listenTo: function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      obj.on(name, typeof name === 'object' ? this : callback, this);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return;
      if (obj) {
        obj.off(name, typeof name === 'object' ? this : callback, this);
        if (!name && !callback) delete listeners[obj._listenerId];
      } else {
        if (typeof name === 'object') callback = this;
        for (var id in listeners) {
          listeners[id].off(name, callback, this);
        }
        this._listeners = {};
      }
      return this;
    }
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    var attrs = attributes || {};
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options && options.collection) this.collection = options.collection;
    if (options && options.parse) attrs = this.parse(attrs, options) || {};
    if (defaults = _.result(this, 'defaults')) {
      attrs = _.defaults({}, attrs, defaults);
    }
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // ----------------------------------------------------------------------

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = true;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // ---------------------------------------------------------------------

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
      };
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, success, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      // If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
      if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;

      options = _.extend({validate: true}, options);

      // Do not persist invalid models.
      if (!this._validate(attrs, options)) return false;

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      success = options.success;
      options.success = function(model, resp, options) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
      };

      // Finish configuring and sending the Ajax request.
      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(model, resp, options) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
      };

      if (this.isNew()) {
        options.success(this, null, options);
        return false;
      }

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return !this.validate || !this.validate(this.attributes, options);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire a general
    // `"error"` event and call the error callback, if specified.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, options || {});
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this.models = [];
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      models = _.isArray(models) ? models.slice() : [models];
      options || (options = {});
      var i, l, model, attrs, existing, doSort, add, at, sort, sortAttr;
      add = [];
      at = options.at;
      sort = this.comparator && (at == null) && options.sort != false;
      sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        if (!(model = this._prepareModel(attrs = models[i], options))) {
          this.trigger('invalid', this, attrs, options);
          continue;
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(model)) {
          if (options.merge) {
            existing.set(attrs === model ? model.attributes : attrs, options);
            if (sort && !doSort && existing.hasChanged(sortAttr)) doSort = true;
          }
          continue;
        }

        // This is a new model, push it to the `add` list.
        add.push(model);

        // Listen to added models' events, and index models for lookup by
        // `id` and by `cid`.
        model.on('all', this._onModelEvent, this);
        this._byId[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (add.length) {
        if (sort) doSort = true;
        this.length += add.length;
        if (at != null) {
          splice.apply(this.models, [at, 0].concat(add));
        } else {
          push.apply(this.models, add);
        }
      }

      // Silently sort the collection if appropriate.
      if (doSort) this.sort({silent: true});

      if (options.silent) return this;

      // Trigger `add` events.
      for (i = 0, l = add.length; i < l; i++) {
        (model = add[i]).trigger('add', model, this, options);
      }

      // Trigger `sort` if the collection was sorted.
      if (doSort) this.trigger('sort', this, options);

      return this;
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      models = _.isArray(models) ? models.slice() : [models];
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: this.length}, options));
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function(begin, end) {
      return this.models.slice(begin, end);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      this._idAttr || (this._idAttr = this.model.prototype.idAttribute);
      return this._byId[obj.id || obj.cid || obj[this._idAttr] || obj];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) {
        throw new Error('Cannot sort a set without a comparator');
      }
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Smartly update a collection with a change set of models, adding,
    // removing, and merging as necessary.
    update: function(models, options) {
      options = _.extend({add: true, merge: true, remove: true}, options);
      if (options.parse) models = this.parse(models, options);
      var model, i, l, existing;
      var add = [], remove = [], modelMap = {};

      // Allow a single model (or no argument) to be passed.
      if (!_.isArray(models)) models = models ? [models] : [];

      // Proxy to `add` for this case, no need to iterate...
      if (options.add && !options.remove) return this.add(models, options);

      // Determine which models to add and merge, and which to remove.
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i];
        existing = this.get(model);
        if (options.remove && existing) modelMap[existing.cid] = true;
        if ((options.add && !existing) || (options.merge && existing)) {
          add.push(model);
        }
      }
      if (options.remove) {
        for (i = 0, l = this.models.length; i < l; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) remove.push(model);
        }
      }

      // Remove models (if applicable) before we add and merge the rest.
      if (remove.length) this.remove(remove, options);
      if (add.length) this.add(add, options);
      return this;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      options || (options = {});
      if (options.parse) models = this.parse(models, options);
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models.slice();
      this._reset();
      if (models) this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `update: true` is passed, the response
    // data will be passed through the `update` method instead of `reset`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      options.success = function(collection, resp, options) {
        var method = options.update ? 'update' : 'reset';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
      };
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function() {
      this.length = 0;
      this.models.length = 0;
      this._byId  = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options || (options = {});
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model._validate(attrs, options)) return false;
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    },

    sortedIndex: function (model, value, context) {
      value || (value = this.comparator);
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _.sortedIndex(this.models, model, iterator, context);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
    'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        this.trigger('route', name, args);
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional){
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;
      var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(this.root + this.location.search + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      fragment = this.getFragment(fragment || '');
      if (this.fragment === fragment) return;
      this.fragment = fragment;
      var url = this.root + fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, _.result(this, 'options'), options);
      _.extend(this, _.pick(options, viewOptions));
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    var success = options.success;
    options.success = function(resp) {
      if (success) success(model, resp, options);
      model.trigger('sync', model, resp, options);
    };

    var error = options.error;
    options.error = function(xhr) {
      if (error) error(model, xhr, options);
      model.trigger('error', model, xhr, options);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);
/*
 * l10n.js
 * 2011-05-12
 * 
 * By Eli Grey, http://eligrey.com
 * Licensed under the X11/MIT License
 *   See LICENSE.md
 */

/*global XMLHttpRequest, setTimeout, document, navigator, ActiveXObject*/

/*! @source http://purl.eligrey.com/github/l10n.js/blob/master/l10n.js*/

"use strict";

(function () {
	var
		  undef_type = "undefined"
		, string_type = "string"
		, String_ctr = String
		, has_own_prop = Object.prototype.hasOwnProperty
		, load_queues = {}
		, localizations = {}
		, FALSE = !1
		// the official format is application/vnd.oftn.l10n+json, though l10n.js will also
		// accept application/x-l10n+json and application/l10n+json
		, l10n_js_media_type = /^\s*application\/(?:vnd\.oftn\.|x-)?l10n\+json\s*(?:$|;)/i
		, XHR
		, $to_locale_string = "toLocaleString"
		, $to_lowercase = "toLowerCase"
	
	, array_index_of = Array.prototype.indexOf || function (item) {
		var
			  len = this.length
			, i   = 0
		;
		
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		
		return -1;
	}
	, request_JSON = function (uri) {
		var req = new XHR();
		
		// sadly, this has to be blocking to allow for a graceful degrading API
		req.open("GET", uri, FALSE);
		req.send(null);
		
		if (req.status !== 200) {
			// warn about error without stopping execution
			setTimeout(function () {
				// Error messages are not localized as not to cause an infinite loop
				var l10n_err = new Error("Unable to load localization data: " + uri);
				l10n_err.name = "Localization Error";
				throw l10n_err;
			}, 0);
			
			return {};
		} else {
			return JSON.parse(req.responseText);
		}
	}
	, load = String_ctr[$to_locale_string] = function (data) {
		// don't handle function[$to_locale_string](indentationAmount:Number)
		if (arguments.length > 0 && typeof data !== "number") {
			if (typeof data === string_type) {
				load(request_JSON(data));
			} else if (data === FALSE) {
				// reset all localizations
				localizations = {};
			} else {
				// Extend current localizations instead of completely overwriting them
				for (var locale in data) {
					if (has_own_prop.call(data, locale)) {
						var localization = data[locale];
						locale = locale[$to_lowercase]();
						
						if (!(locale in localizations) || localization === FALSE) {
							// reset locale if not existing or reset flag is specified
							localizations[locale] = {};
						}
						
						if (localization === FALSE) {
							continue;
						}
						
						// URL specified
						if (typeof localization === string_type) {
							if (String_ctr.locale[$to_lowercase]().indexOf(locale) === 0) {
								localization = request_JSON(localization);
							} else {
								// queue loading locale if not needed
								if (!(locale in load_queues)) {
									load_queues[locale] = [];
								}
								load_queues[locale].push(localization);
								continue;
							}
						}
						
						for (var message in localization) {
							if (has_own_prop.call(localization, message)) {
								localizations[locale][message] = localization[message];
							}
						}
					}
				}
			}
		}
		// Return what function[$to_locale_string]() normally returns
		return Function.prototype[$to_locale_string].apply(String_ctr, arguments);
	}
	, process_load_queue = function (locale) {
		var queue = load_queues[locale],
		i = 0,
		len = queue.length;
		
		for (; i < len; i++) {
			var localization = {};
			localization[locale] = request_JSON(queue[i]);
			load(localization);
		}
		
		delete load_queues[locale];
	}

	;
	
	if (typeof XMLHttpRequest === undef_type && typeof ActiveXObject !== undef_type) {
		var AXO = ActiveXObject;
		
		XHR = function () {
			try {
				return new AXO("Msxml2.XMLHTTP.6.0");
			} catch (xhrEx1) {}
			try {
				return new AXO("Msxml2.XMLHTTP.3.0");
			} catch (xhrEx2) {}
			try {
				return new AXO("Msxml2.XMLHTTP");
			} catch (xhrEx3) {}
		
			throw new Error("XMLHttpRequest not supported by this browser.");
		};
	} else {
		XHR = XMLHttpRequest;
	}
	
	if (!String_ctr.locale) {
		if (typeof navigator !== undef_type) {
			var nav = navigator;
			String_ctr.locale = nav.language || nav.userLanguage || "";
		} else {
			String_ctr.locale = "";
		}
	}
	
	if (typeof document !== undef_type) {
		var
			  elts = document.getElementsByTagName("link")
			, i = elts.length
		;
		
		while (i--) {
			var
				  elt = elts[i]
				, rel = (elt.getAttribute("rel") || "")[$to_lowercase]().split(/\s+/)
			;
			
			if (l10n_js_media_type.test(elt.type)) {
				if (array_index_of.call(rel, "localizations") !== -1) {
					// multiple localizations
					load(elt.getAttribute("href"));
				} else if (array_index_of.call(rel, "localization") !== -1) {
					// single localization
					var localization = {};
					localization[(elt.getAttribute("hreflang") || "")[$to_lowercase]()] =
						elt.getAttribute("href");
					load(localization);
				}
			}
		}
	}
	
	String_ctr.prototype[$to_locale_string] = function () {
		var
			  parts = String_ctr.locale[$to_lowercase]().split("-")
			, i = parts.length
			, this_val = this.valueOf()
		;
		
		// Iterate through locales starting at most-specific until localization is found
		do {
			var locale = parts.slice(0, i).join("-");
			// load locale if not loaded
			if (locale in load_queues) {
				process_load_queue(locale);
			}
			if (locale in localizations && this_val in localizations[locale]) {
				return localizations[locale][this_val];
			}
		}
		while (i--);
		
		return this_val;
	};
}());
/*

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

// lib/handlebars/browser-prefix.js
var Handlebars = {};

(function(Handlebars, undefined) {
;
// lib/handlebars/base.js

Handlebars.VERSION = "1.0.0";
Handlebars.COMPILER_REVISION = 4;

Handlebars.REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};

Handlebars.helpers  = {};
Handlebars.partials = {};

var toString = Object.prototype.toString,
    functionType = '[object Function]',
    objectType = '[object Object]';

Handlebars.registerHelper = function(name, fn, inverse) {
  if (toString.call(name) === objectType) {
    if (inverse || fn) { throw new Handlebars.Exception('Arg not supported with multiple helpers'); }
    Handlebars.Utils.extend(this.helpers, name);
  } else {
    if (inverse) { fn.not = inverse; }
    this.helpers[name] = fn;
  }
};

Handlebars.registerPartial = function(name, str) {
  if (toString.call(name) === objectType) {
    Handlebars.Utils.extend(this.partials,  name);
  } else {
    this.partials[name] = str;
  }
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Missing helper: '" + arg + "'");
  }
});

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;

  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(conditional, options) {
  var type = toString.call(conditional);
  if(type === functionType) { conditional = conditional.call(this); }

  if(!conditional || Handlebars.Utils.isEmpty(conditional)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(conditional, options) {
  return Handlebars.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn});
});

Handlebars.registerHelper('with', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
});

Handlebars.registerHelper('log', function(context, options) {
  var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
  Handlebars.log(level, context);
});
;
// lib/handlebars/utils.js

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

var escapeChar = function(chr) {
  return escape[chr] || "&amp;";
};

Handlebars.Utils = {
  extend: function(obj, value) {
    for(var key in value) {
      if(value.hasOwnProperty(key)) {
        obj[key] = value[key];
      }
    }
  },

  escapeExpression: function(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof Handlebars.SafeString) {
      return string.toString();
    } else if (string == null || string === false) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = string.toString();

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  },

  isEmpty: function(value) {
    if (!value && value !== 0) {
      return true;
    } else if(toString.call(value) === "[object Array]" && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
};
;
// lib/handlebars/runtime.js

Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = Handlebars.VM.program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = Handlebars.VM.program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common) {
          ret = {};
          Handlebars.Utils.extend(ret, common);
          Handlebars.Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);

      var compilerInfo = container.compilerInfo || [],
          compilerRevision = compilerInfo[0] || 1,
          currentRevision = Handlebars.COMPILER_REVISION;

      if (compilerRevision !== currentRevision) {
        if (compilerRevision < currentRevision) {
          var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision],
              compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
          throw "Template was precompiled with an older version of Handlebars than the current runtime. "+
                "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").";
        } else {
          // Use the embedded version info since the runtime doesn't know about this revision yet
          throw "Template was precompiled with a newer version of Handlebars than the current runtime. "+
                "Please update your runtime to a newer version ("+compilerInfo[1]+").";
        }
      }

      return result;
    };
  },

  programWithDepth: function(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var program = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    program.program = i;
    program.depth = args.length;
    return program;
  },
  program: function(i, fn, data) {
    var program = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    program.program = i;
    program.depth = 0;
    return program;
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;
// lib/handlebars/browser-suffix.js
})(Handlebars);
;
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['atmTemplate'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<strong itemprop='name' role='heading'>";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</strong>";
  return buffer;
  }

  buffer += "<address>\n  ";
  stack1 = helpers['if'].call(depth0, depth0.name, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  <div class='banno-location-address' itemscope itemtype='http://schema.org/PostalAddress'>\n  	<span itemprop='streetAddress'>";
  if (stack1 = helpers.address) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.address; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span><br>\n    <span itemprop='addressLocality'>";
  if (stack1 = helpers.city) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.city; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>, <span itemprop='addressRegion'>";
  if (stack1 = helpers.state) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span> <span itemprop='postalCode'>";
  if (stack1 = helpers.zip) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.zip; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n</div>\n</address>\n<div class='banno-location-travel-info'>\n  <div class='banno-location-distance'>";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.roundNumber || depth0.roundNumber),stack1 ? stack1.call(depth0, depth0.distance, options) : helperMissing.call(depth0, "roundNumber", depth0.distance, options)))
    + " ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.translate || depth0.translate),stack1 ? stack1.call(depth0, depth0.miles, options) : helperMissing.call(depth0, "translate", depth0.miles, options)))
    + "</div>\n  <a href='http://maps.google.com/maps?saddr=&daddr=";
  if (stack2 = helpers.address) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.address; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " ";
  if (stack2 = helpers.city) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.city; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " ";
  if (stack2 = helpers.zip) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.zip; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "' target='_blank' class='banno-location-directions external' data-disclaimer-id='disclaimer' itemprop='map'>";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.translate || depth0.translate),stack1 ? stack1.call(depth0, depth0.getDirections, options) : helperMissing.call(depth0, "translate", depth0.getDirections, options)))
    + "</a>\n</div>";
  return buffer;
  });
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['branchTemplate'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    ";
  stack1 = helpers['if'].call(depth0, depth0.imageId, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n      <div class='banno-location-img'>\n        <img src='";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.branchImage || depth0.branchImage),stack1 ? stack1.call(depth0, depth0.id, depth0.imageId, options) : helperMissing.call(depth0, "branchImage", depth0.id, depth0.imageId, options)))
    + "' itemprop='photo' alt='Image for ";
  if (stack2 = helpers.name) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.name; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "' style='max-width:100%'>\n      </div>\n    ";
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <div class='banno-location-description' itemprop='description'>";
  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n  ";
  return buffer;
  }

  buffer += "<td itemscope itemtype='http://schema.org/BankOrCreditUnion'>\n  ";
  stack1 = helpers['if'].call(depth0, depth0.imageInList, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  <address>\n    <strong itemprop='name' role='heading'>";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</strong>\n    <div class='banno-location-address' itemscope itemtype='http://schema.org/PostalAddress'>\n      <span itemprop='streetAddress'>";
  if (stack1 = helpers.address) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.address; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span><br>\n      <span itemprop='addressLocality'>";
  if (stack1 = helpers.city) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.city; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>, <span itemprop='addressRegion'>";
  if (stack1 = helpers.state) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span> <span itemprop='postalCode'>";
  if (stack1 = helpers.zip) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.zip; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span><br>\n      <span itemprop='telephone'><a href=\"tel:";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.removePhoneFormatting || depth0.removePhoneFormatting),stack1 ? stack1.call(depth0, depth0.phone, options) : helperMissing.call(depth0, "removePhoneFormatting", depth0.phone, options)))
    + "\">";
  if (stack2 = helpers.phone) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.phone; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</a></span>\n    </div>\n  </address>\n  ";
  stack2 = helpers['if'].call(depth0, depth0.descriptionInList, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n  <div class='banno-location-travel-info'>\n    <div class='banno-location-distance'>";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.roundNumber || depth0.roundNumber),stack1 ? stack1.call(depth0, depth0.distance, options) : helperMissing.call(depth0, "roundNumber", depth0.distance, options)))
    + " ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.translate || depth0.translate),stack1 ? stack1.call(depth0, depth0.miles, options) : helperMissing.call(depth0, "translate", depth0.miles, options)))
    + "</div>\n    <a href='http://maps.google.com/maps?saddr=&daddr=";
  if (stack2 = helpers.address) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.address; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " ";
  if (stack2 = helpers.city) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.city; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " ";
  if (stack2 = helpers.zip) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.zip; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "' target='_blank' class='banno-location-directions external' data-disclaimer-id='disclaimer' itemprop='map'>";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.translate || depth0.translate),stack1 ? stack1.call(depth0, depth0.getDirections, options) : helperMissing.call(depth0, "translate", depth0.getDirections, options)))
    + "</a>\n  </div>\n</td>\n";
  return buffer;
  });
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['branchMarkerTemplate'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n      ";
  stack1 = helpers['if'].call(depth0, depth0.imageId, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n        <div class='banno-location-img'>\n          <img src='";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.branchImage || depth0.branchImage),stack1 ? stack1.call(depth0, depth0.id, depth0.imageId, options) : helperMissing.call(depth0, "branchImage", depth0.id, depth0.imageId, options)))
    + "' itemprop='photo' alt='Image for ";
  if (stack2 = helpers.name) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.name; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "' style='max-width:100%'>\n        </div>\n      ";
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n      <div class='banno-location-description' itemprop='description'>";
  if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n    ";
  return buffer;
  }

  buffer += "<div id='content' itemscope itemtype='http://schema.org/BankOrCreditUnion'>\n  <div id='bodyContent'>\n    ";
  stack1 = helpers['if'].call(depth0, depth0.imageInMap, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <address>\n      <strong itemprop='name' role='heading'>";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</strong>\n      <div class='banno-location-address' itemscope itemtype='http://schema.org/PostalAddress'>\n        <span itemprop='streetAddress'>";
  if (stack1 = helpers.address) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.address; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span><br>\n        <span itemprop='addressLocality'>";
  if (stack1 = helpers.city) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.city; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>, <span itemprop='addressRegion'>";
  if (stack1 = helpers.state) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span> <span itemprop='postalCode'>";
  if (stack1 = helpers.zip) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.zip; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span><br>\n        <span itemprop='telephone'><a href=\"tel:";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.removePhoneFormatting || depth0.removePhoneFormatting),stack1 ? stack1.call(depth0, depth0.phone, options) : helperMissing.call(depth0, "removePhoneFormatting", depth0.phone, options)))
    + "\">";
  if (stack2 = helpers.phone) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.phone; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</a></span>\n      </div>\n    </address>\n    ";
  stack2 = helpers['if'].call(depth0, depth0.descriptionInMap, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    <div class='banno-location-travel-info'>\n      <div class='banno-location-distance'>";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.roundNumber || depth0.roundNumber),stack1 ? stack1.call(depth0, depth0.distance, options) : helperMissing.call(depth0, "roundNumber", depth0.distance, options)))
    + " ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.translate || depth0.translate),stack1 ? stack1.call(depth0, depth0.miles, options) : helperMissing.call(depth0, "translate", depth0.miles, options)))
    + "</div>\n      <a href='http://maps.google.com/maps?saddr=&daddr=";
  if (stack2 = helpers.address) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.address; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " ";
  if (stack2 = helpers.city) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.city; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " ";
  if (stack2 = helpers.zip) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.zip; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "' target='_blank' class='banno-location-directions external' data-disclaimer-id='disclaimer' itemprop='map'>";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.translate || depth0.translate),stack1 ? stack1.call(depth0, depth0.getDirections, options) : helperMissing.call(depth0, "translate", depth0.getDirections, options)))
    + "</a>\n    </div>\n  </div>\n</div>\n";
  return buffer;
  });
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['checkedNetworkTemplate'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function";


  buffer += "<label class='checkbox'>\n  <input class=\"atm-network\" type='checkbox' name='refine' id=";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.replaceSpace || depth0.replaceSpace),stack1 ? stack1.call(depth0, depth0.name, options) : helperMissing.call(depth0, "replaceSpace", depth0.name, options)))
    + " checked> ";
  if (stack2 = helpers.name) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.name; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " </input> \n</label>\n";
  return buffer;
  });
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['iconTemplate'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<td>\n  <img alt=\"\" src=";
  if (stack1 = helpers.imgSource) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.imgSource; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "></img>\n</td>\n";
  return buffer;
  });
})();(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['uncheckedNetworkTemplate'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function";


  buffer += "<label class='checkbox'>\n  <input class=\"atm-network\" type='checkbox' name='refine' id=";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.replaceSpace || depth0.replaceSpace),stack1 ? stack1.call(depth0, depth0.name, options) : helperMissing.call(depth0, "replaceSpace", depth0.name, options)))
    + "> ";
  if (stack2 = helpers.name) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.name; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " </input>\n</label>\n";
  return buffer;
  });
})();// Generated by CoffeeScript 1.6.1
(function() {
  var $, AtmCollection, AtmConfigModel, AtmModel, AtmNetworkModel, Backbone, BranchCollection, BranchModel, ContentTypeHelpers, Handlebars, LocationPaginationClass, LocationView, atmModelMembers, branchModelMembers, cleanNetworkName, dateFormat, defaults, _,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.ContentTypeHelpers = {
    pptIcon: "ppt.png",
    xlsIcon: "xls.png",
    docIcon: "doc.png",
    defaultIcon: "default.png",
    contentTypeToIconMap: {
      "video/msvideo": "avi.png",
      "text/csv": "csv.png",
      "video/x-flv": "flv.png",
      "image/gif": "gif.png",
      "text/html": "html.png",
      "image/jpeg": "jpg.png",
      "video/quicktime": "mov.png",
      "audio/mpeg3": "mp3.png",
      "video/mpeg": "mpg.png",
      "application/pdf": "pdf.png",
      "image/png": "png.png",
      "application/vnd.ms-powerpoint": this.pptIcon,
      "application/x-shockwave-flash": "swf.png",
      "text/plain": "txt.png",
      "application/xml": "xml.png",
      "application/zip": "zip.png",
      "application/vnd.ms-excel": this.xlsIcon,
      "application/msword": this.docIcon,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': this.xlsIcon,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": this.docIcon,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': this.pptIcon
    },
    extensionToContentTypeMap: {
      'csv': 'text/csv',
      'txt': 'text/plain',
      'htm': 'text/html',
      'html': 'text/html',
      'php': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      'swf': 'application/x-shockwave-flash',
      'flv': 'video/x-flv',
      'png': 'image/png',
      'jpe': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'jpg': 'image/jpeg',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'ico': 'image/vnd.microsoft.icon',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      'svg': 'image/svg+xml',
      'svgz': 'image/svg+xml',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      'exe': 'application/x-msdownload',
      'msi': 'application/x-msdownload',
      'cab': 'application/vnd.ms-cab-compressed',
      'tar': 'application/x-tar',
      'qt': 'video/quicktime',
      'mov': 'video/quicktime',
      'mpeg': 'video/mpeg',
      'mpg': 'video/mpeg',
      'mpe': 'video/mpeg',
      'mp3': 'audio/mpeg3',
      'wav': 'audio/wav',
      'aiff': 'audio/aiff',
      'aif': 'audio/aiff',
      'avi': 'video/msvideo',
      'wmv': 'video/x-ms-wmv',
      'pdf': 'application/pdf',
      'psd': 'image/vnd.adobe.photoshop',
      'ai': 'application/postscript',
      'eps': 'application/postscript',
      'ps': 'application/postscript',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'rtf': 'application/rtf',
      'ppt': 'application/vnd.ms-powerpoint',
      'pps': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xlt': 'application/vnd.ms-excel',
      'xlm': 'application/vnd.ms-excel',
      'xld': 'application/vnd.ms-excel',
      'xla': 'application/vnd.ms-excel',
      'xlc': 'application/vnd.ms-excel',
      'xlw': 'application/vnd.ms-excel',
      'xll': 'application/vnd.ms-excel',
      'odt': 'application/vnd.oasis.opendocument.text',
      'ods': 'application/vnd.oasis.opendocument.spreadsheet'
    },
    contentTypeToIcon: function(contentType) {
      var icon;
      icon = this.contentTypeToIconMap[contentType.toLowerCase()];
      if (icon) {
        return icon;
      } else {
        return this.defaultIcon;
      }
    },
    extensionToContentType: function(filename) {
      var contentType, extension, periodPos;
      extension = (periodPos = filename.lastIndexOf('.')) > -1 ? filename.slice(periodPos + 1) : filename;
      contentType = this.extensionToContentTypeMap[extension.toLowerCase()];
      if (contentType) {
        return contentType;
      } else {
        return "";
      }
    }
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.ContentTypeHelpers = this.ContentTypeHelpers;
  }

  Handlebars = this.Handlebars;

  dateFormat = this.dateFormat;

  ContentTypeHelpers = this.ContentTypeHelpers;

  Handlebars.registerHelper("thumbnail", function(id, contentType, w, h) {
    if (w == null) {
      w = 100;
    }
    if (h == null) {
      h = 100;
    }
    contentType = contentType.toLowerCase();
    if (contentType === "image/jpeg" || contentType === "image/png" || contentType === "image/gif" || contentType === "image/bmp") {
      w = isFinite(w) ? w : 100;
      h = isFinite(h) ? h : 100;
      return "/assets/files/" + id + "/thumbnail/" + w + "/" + h;
    } else {
      return "/assets/editor/img/file-types/" + ContentTypeHelpers.contentTypeToIcon(contentType);
    }
  });

  Handlebars.registerHelper("url", function(id) {
    return "/assets/files/" + id;
  });

  Handlebars.registerHelper("endpoint", function(id) {
    return "/_/api/asset/file/" + id;
  });

  Handlebars.registerHelper("dateformat", function(date) {
    return new Handlebars.SafeString(dateFormat(new Date(date), "mm/dd/yyyy"));
  });

  Handlebars.registerHelper("datetimeformat", function(date) {
    return new Handlebars.SafeString(dateFormat(new Date(date), "mmm dd, yyyy h:MM tt"));
  });

  Handlebars.registerHelper("altdatetimeformat", function(date) {
    return new Handlebars.SafeString(dateFormat(new Date(date), "mm/dd/yyyy' at 'h:MM TT"));
  });

  Handlebars.registerHelper("filesizeformat", function(filesize) {
    if (Math.pow(10, 6) > filesize) {
      return (Math.round(filesize / 10) / 100) + " KB";
    } else {
      return (Math.round(filesize / 10000) / 100) + " MB";
    }
  });

  Handlebars.registerHelper("filetype", function(contentTypeOrFilename) {
    var icon;
    if (contentTypeOrFilename.indexOf("/") < 0) {
      contentTypeOrFilename = ContentTypeHelpers.extensionToContentType(contentTypeOrFilename);
    }
    icon = ContentTypeHelpers.contentTypeToIcon(contentTypeOrFilename);
    icon = icon.slice(0, icon.indexOf('.')).toUpperCase();
    if (icon === "DEFAULT") {
      return "File";
    } else {
      return icon;
    }
  });

  cleanNetworkName = function(name) {
    return name.replace(/\s/g, "-").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
  };

  Handlebars.registerHelper("getIcon", function(network) {
    if (network != null) {
      return cleanNetworkName(network);
    } else {
      return "branch";
    }
  });

  Handlebars.registerHelper("getActive", function(active) {
    if (active === true) {
      return "checked";
    } else {
      return "";
    }
  });

  Handlebars.registerHelper("replaceSpace", function(text) {
    return text = cleanNetworkName(text);
  });

  Handlebars.registerHelper("getLocationType", function(network) {
    if (network != null) {
      return "atm";
    } else {
      return "branch";
    }
  });

  Handlebars.registerHelper("roundNumber", function(num) {
    return num.toFixed(2);
  });

  Handlebars.registerHelper("branchImage", function(branchId, imageId) {
    if (imageId) {
      return "/_/api/branchimage/" + branchId + "/" + imageId;
    } else {
      return "";
    }
  });

  Handlebars.registerHelper("locationLabel", function(label, atmOverride, branchOverride) {
    if (label === "Branches" && (branchOverride != null)) {
      return branchOverride;
    } else if (label === "Atms" && (atmOverride != null)) {
      return atmOverride;
    } else {
      return label;
    }
  });

  Handlebars.registerHelper("isUnread", function(read) {
    if (read) {
      return "";
    } else {
      return "unread";
    }
  });

  Handlebars.registerHelper("userAvatar", function(userId) {
    return "/_/api/user/" + userId + "/image";
  });

  Handlebars.registerHelper("removePhoneFormatting", function(phoneNumber) {
    return phoneNumber = phoneNumber.replace(/[\s.+()-]/g, "");
  });

  this.LocationPaginationClass = (function() {

    function LocationPaginationClass(show_per_page) {
      this.show_per_page = show_per_page;
      _(this).bindAll("next", "previous", "page_num");
    }

    LocationPaginationClass.prototype.paginate = function() {
      var current_link, navigation_html, number_of_items;
      number_of_items = $('#locationListBody > tr').length;
      this.number_of_pages = Math.ceil(number_of_items / this.show_per_page);
      $('#current_page').val(0);
      navigation_html = "";
      if (number_of_items > this.show_per_page) {
        navigation_html += '<li class="disabled previous_link"><a href="#locationTable">' + '%pagination.previous'.toLocaleString() + '</a></li>';
        current_link = 0;
        while (this.number_of_pages > current_link) {
          if (current_link === 0) {
            navigation_html += '<li class="active page_link"><a href="#locationTable" longdesc="' + current_link + '">' + (current_link + 1) + '</a></li>';
          } else {
            navigation_html += '<li class="page_link"><a href="#locationTable" longdesc="' + current_link + '">' + (current_link + 1) + '</a></li>';
          }
          current_link++;
        }
        navigation_html += '<li class="next_link"><a href="#locationTable">' + '%pagination.next'.toLocaleString() + '</a></li>';
      }
      $('a.previous_link').addClass('disabled');
      $('#page_navigation').html(navigation_html);
      $('#page_navigation li.page_link:first').addClass('active');
      $('#locationListBody > tr').hide();
      $('#locationListBody > tr').slice(0, this.show_per_page).show();
      $(".page_link > a", $("#page_navigation")).click(this.page_num);
      $(".next_link > a", $("#page_navigation")).click(this.next);
      return $(".previous_link > a", $("#page_navigation")).click(this.previous);
    };

    LocationPaginationClass.prototype.page_num = function(event) {
      var page;
      page = $(event.target).text();
      return this.go_to_page(page - 1);
    };

    LocationPaginationClass.prototype.previous = function() {
      var new_page;
      new_page = parseInt($('#current_page').val()) - 1;
      if ($('.active').prev('.page_link').length > 0) {
        return this.go_to_page(new_page);
      }
    };

    LocationPaginationClass.prototype.next = function() {
      var new_page;
      new_page = parseInt($('#current_page').val()) + 1;
      if ($('.active').next('.page_link').length > 0) {
        return this.go_to_page(new_page);
      }
    };

    LocationPaginationClass.prototype.go_to_page = function(page_num) {
      var a, end_on, start_from, _i, _len, _ref;
      start_from = page_num * this.show_per_page;
      end_on = start_from + this.show_per_page;
      if (page_num !== 0) {
        $('.previous_link').removeClass('disabled');
      } else {
        $('.previous_link').addClass('disabled');
      }
      if (page_num === this.number_of_pages - 1) {
        $('.next_link').addClass('disabled');
      } else {
        $('.next_link').removeClass('disabled');
      }
      _ref = $('.page_link');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        $(a).removeClass('disabled');
      }
      $($('.page_link')[page_num]).removeClass('disabled');
      $('#locationListBody > tr').hide().slice(start_from, end_on).show();
      $('.page_link a[longdesc=' + page_num + ']').parent('li').addClass('active').siblings('.active').removeClass('active');
      return $('#current_page').val(page_num);
    };

    return LocationPaginationClass;

  })();

  if (typeof exports !== "undefined" && exports !== null) {
    exports.LocationPaginationClass = this.LocationPaginationClass;
  }

  if (typeof exports !== "undefined" && exports !== null) {
    _ = require('underscore');
    Backbone = require('backbone');
  } else {
    _ = this._;
    Backbone = this.Backbone;
  }

  /*
  This is used to asynchronously fetch multiple collections and dispatch an event once all
  collections have been fetched.  Useful when different UI elements require data from different 
  sets before rendering.  If you're fetching data sets but do not have a backbone collection
  defined then use jquery's when() to wait for them all to finish.
  
  @events fetched Dispatched after all collections have been fetched
  */


  this.BatchCollectionFetcher = Backbone.Model.extend({
    constructor: function() {
      var collections;
      collections = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.collections = collections;
    },
    fetch: function() {
      var queue,
        _this = this;
      queue = this.collections.slice(0, this.collections.length);
      return _.each(this.collections, function(collection) {
        var onReset;
        onReset = function() {
          var index;
          if (queue.length > 0) {
            index = _.indexOf(queue, collection);
            if (index > -1) {
              queue.splice(index, 1);
            }
            if (queue.length === 0) {
              return _this.trigger("fetched");
            }
          }
        };
        collection.on("reset", function() {
          collection.off("reset", onReset);
          return onReset();
        });
        return collection.fetch();
      });
    }
  });

  if (typeof exports !== "undefined" && exports !== null) {
    exports.BatchCollectionFetcher = this.BatchCollectionFetcher;
  }

  if (typeof exports !== "undefined" && exports !== null) {
    Backbone = require("backbone");
    _ = require("underscore");
  } else {
    Backbone = this.Backbone;
    _ = this._;
  }

  defaults = {
    address: "",
    long: 0.0,
    zip: "",
    name: "",
    distance: 0.0,
    state: "",
    lat: 0.0,
    city: "",
    phone: "",
    description: "",
    imageId: "",
    active: true
  };

  branchModelMembers = {
    defaults: defaults,
    buildUrl: function(institutionId, branchId) {
      var url;
      url = "/_/api/branches";
      if (branchId.length > 0) {
        url += "/" + branchId;
      }
      return url;
    }
  };

  BranchModel = Backbone.Model.extend(branchModelMembers);

  if (typeof exports !== "undefined" && exports !== null) {
    exports.BranchModel = BranchModel;
  }

  this.BranchModel = BranchModel;

  if (typeof exports !== "undefined" && exports !== null) {
    Backbone = require("backbone");
    _ = require("underscore");
  } else {
    Backbone = this.Backbone;
    _ = this._;
  }

  defaults = {
    defaultLocation: {},
    defaultRadius: 10,
    textForLocationInput: null,
    showAtmOnFirstLoad: true,
    descriptionInList: true,
    descriptionInMap: false,
    imageInList: false,
    imageInMap: true,
    scrollWheel: true,
    allowBrowserGeolocation: true,
    branchLabel: null,
    atmLabel: null,
    googleApiKey: null
  };

  AtmConfigModel = Backbone.Model.extend({
    defaults: defaults,
    url: "/_/api/atms/config"
  });

  if (typeof exports !== "undefined" && exports !== null) {
    exports.AtmConfigModel = AtmConfigModel;
  }

  this.AtmConfigModel = AtmConfigModel;

  if (typeof exports !== "undefined" && exports !== null) {
    Backbone = require("backbone");
    _ = require("underscore");
  } else {
    Backbone = this.Backbone;
    _ = this._;
  }

  defaults = {
    id: "",
    name: ""
  };

  AtmNetworkModel = Backbone.Model.extend({
    defaults: defaults,
    url: "/_/atm/networks"
  });

  if (typeof exports !== "undefined" && exports !== null) {
    exports.AtmNetworkModel = AtmNetworkModel;
  }

  this.AtmNetworkModel = AtmNetworkModel;

  if (typeof exports !== "undefined" && exports !== null) {
    Backbone = require("backbone");
    _ = require("underscore");
    AtmNetworkModel = require('./AtmNetworkModel.coffee').AtmNetworkModel;
  } else {
    Backbone = this.Backbone;
    _ = this._;
  }

  this.AtmNetworkCollection = Backbone.Collection.extend({
    url: "/_/api/atm/networks",
    model: AtmNetworkModel,
    parse: function(resp, xhr) {
      return resp.networks;
    }
  });

  if (typeof exports !== "undefined" && exports !== null) {
    exports.AtmNetworkCollection = this.AtmNetworkCollection;
  }

  if (typeof exports !== "undefined" && exports !== null) {
    Backbone = require("backbone");
    _ = require("underscore");
    BranchModel = require('./BranchModel.coffee').BranchModel;
  } else {
    Backbone = this.Backbone;
    _ = this._;
  }

  this.BranchCollection = Backbone.Collection.extend({
    buildUrl: function(institutionId, lat, long, radius, shouldGetRemoved) {
      var removed;
      removed = shouldGetRemoved ? "?removed" : "";
      return "/_/api/branches/" + lat + "/" + long + "/" + radius + removed;
    },
    model: BranchModel,
    parse: function(resp, xhr) {
      return resp.branches;
    }
  });

  if (typeof exports !== "undefined" && exports !== null) {
    exports.BranchCollection = this.BranchCollection;
  }

  if (typeof exports !== "undefined" && exports !== null) {
    Backbone = require("backbone");
    _ = require("underscore");
  } else {
    Backbone = this.Backbone;
    _ = this._;
  }

  defaults = {
    address: "",
    long: 0.0,
    zip: "",
    name: "",
    distance: 0.0,
    state: "",
    lat: 0.0,
    city: "",
    networkName: "",
    active: true
  };

  atmModelMembers = {
    defaults: defaults,
    buildUrl: function(institutionId, networkId, atmId) {
      var url;
      url = "/_/api/atms";
      if (atmId.length > 0) {
        url += "/" + atmId;
      }
      return url + "/network/" + networkId;
    }
  };

  AtmModel = Backbone.Model.extend(atmModelMembers);

  if (typeof exports !== "undefined" && exports !== null) {
    exports.AtmModel = AtmModel;
  }

  this.AtmModel = AtmModel;

  if (typeof exports !== "undefined" && exports !== null) {
    Backbone = require("backbone");
    _ = require("underscore");
    AtmModel = require('./AtmModel.coffee').AtmModel;
  } else {
    Backbone = this.Backbone;
    _ = this._;
  }

  this.AtmCollection = Backbone.Collection.extend({
    buildUrl: function(institutionId, lat, long, radius, networks, shouldGetRemoved) {
      var removed;
      removed = shouldGetRemoved ? "?removed" : "";
      if (networks.length > 0) {
        return "/_/api/atms/networks/" + networks + "/" + lat + "/" + long + "/" + radius + removed;
      } else {
        return "/_/api/atms/" + lat + "/" + long + "/" + radius + removed;
      }
    },
    model: AtmModel,
    comparator: function(atm) {
      return atm.get("distance");
    },
    parse: function(resp, xhr) {
      return resp.atms;
    }
  });

  if (typeof exports !== "undefined" && exports !== null) {
    exports.AtmCollection = this.AtmCollection;
  }

  if (typeof require !== "undefined" && require !== null) {
    _ = require('underscore');
    Backbone = require('backbone');
    Handlebars = require('handlebars');
    BranchCollection = require('../model/BranchCollection.coffee').BranchCollection;
    AtmConfigModel = require('../model/AtmConfigModel.coffee').AtmConfigModel;
  } else {
    _ = this._;
    Backbone = this.Backbone;
    Handlebars = this.Handlebars;
    AtmCollection = this.AtmCollection;
    BranchCollection = this.BranchCollection;
    AtmConfigModel = this.AtmConfigModel;
    $ = this.$;
  }

  this.LocationView = Backbone.View.extend({
    initialize: function() {
      var _this = this;
      _(this).bindAll("process");
      this.htmlLocation = "";
      this.htmlNetwork = "";
      this.markerArray = [];
      this.markerCount = 0;
      this.loc = "";
      this.lat = 0;
      this.long = 0;
      this.firstLoad = true;
      this.institutionId = "";
      this.lastLocation = "";
      this.networksToShow = "";
      this.showAtmOnFirstLoad = true;
      this.showBranch = false;
      this.descriptionInList = true;
      this.descriptionInMap = false;
      this.imageInList = false;
      this.imageInMap = true;
      this.scrollWheel = true;
      this.allowBrowserGeolocation = true;
      this.networkListToShow = [];
      this.networks = new AtmNetworkCollection();
      this.networks.fetch();
      this.atms = new AtmCollection();
      this.branches = new BranchCollection();
      this.fetcher = new BatchCollectionFetcher(this.atms, this.branches);
      this.atmConfig = new AtmConfigModel();
      this.atmConfig.fetch();
      this.atms.bind("reset", function() {
        return _this.render();
      });
      this.atmConfig.bind("change", function() {
        return _this.fireSearchClickEvent(_this.atmConfig);
      });
      return this.registerHandlebarsHelpers();
    },
    registerHandlebarsHelpers: function() {
      return Handlebars.registerHelper('translate', function(string) {
        return string.toLocaleString();
      });
    },
    setConfigValues: function(config) {
      this.showAtmOnFirstLoad = config.get("showAtmOnFirstLoad");
      this.descriptionInList = config.get("descriptionInList");
      this.descriptionInMap = config.get("descriptionInMap");
      this.imageInList = config.get("imageInList");
      this.imageInMap = config.get("imageInMap");
      this.scrollWheel = config.get("scrollWheel");
      this.allowBrowserGeolocation = config.get("allowBrowserGeolocation");
      if (navigator.geolocation && this.allowBrowserGeolocation) {
        return navigator.geolocation.getCurrentPosition((function(position) {
          $('#location').val(position.coords.latitude + ',' + position.coords.longitude);
          return $('#search').trigger('click');
        }));
      }
    },
    getSearchAddress: function(config) {
      var address, transformerLocation;
      address = "";
      transformerLocation = $("#location").val();
      if (transformerLocation.length < 1) {
        address = this.getDefaultLocationFromConfig(config);
      } else {
        address = transformerLocation;
      }
      return address;
    },
    getDefaultLocationFromConfig: function(config) {
      var defaultLocation;
      defaultLocation = config.get("defaultLocation");
      return defaultLocation.address + " " + defaultLocation.city + " " + defaultLocation.state + " " + defaultLocation.zip;
    },
    cleanNetworkName: function(name) {
      return (name.replace(/\s/g, "-")).replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
    },
    searchClick: function() {
      var geocoder, location, locationToShow;
      $("#locationTable").show();
      $("#locationTable tbody", $(this.el)).html("<tr><td style='text-align: center;'><div class='banno-loading-container'><div class='banno-loading-indicator'></div></div></td></tr>");
      $("#map_canvas", $(this.el)).html("<div class='banno-location-loader' style='text-align: center;'><div class='banno-loading-container'><div class='banno-loading-indicator'></div></div></div>");
      location = $("#location").val().replace(/^\s+|\s+$/g, "");
      if (!location) {
        location = this.lastLocation;
      } else {
        this.lastLocation = location;
      }
      locationToShow = this.atmConfig.get("textForLocationInput");
      if (!(locationToShow === null)) {
        $("#location").val(locationToShow);
      }
      geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        address: location
      }, this.process);
      return false;
    },
    toggleSelection: function() {
      var all, checked;
      all = $(".atm-network").length;
      checked = $("input:checked", $(".atm-network").parent()).length;
      if ((checked === 0) || (checked > 0 && checked < all)) {
        return this.selectAll();
      } else {
        return this.selectNone();
      }
    },
    selectAll: function() {
      var item, _i, _len, _ref;
      _ref = $(".atm-network");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        $(item).prop("checked", true);
      }
      return this.updateAtmCheckbox();
    },
    selectNone: function() {
      var item, _i, _len, _ref;
      _ref = $(".atm-network");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        $(item).prop("checked", false);
      }
      return this.updateAtmCheckbox();
    },
    updateAtmCheckbox: function() {
      var all, checked;
      all = $(".atm-network").length;
      checked = $("input:checked", $(".atm-network").parent()).length;
      $("#ATMs").prop("checked", false);
      $("#ATMs").prop("indeterminate", false);
      if (checked === 0) {
        return $("#ATMs").prop("checked", false);
      } else if (checked > 0 && checked < all) {
        return $("#ATMs").prop("indeterminate", true);
      } else {
        return $("#ATMs").prop("checked", true);
      }
    },
    processNetworksToShow: function(networks) {
      this.networkListToShow = networks.split(",");
      if (__indexOf.call(this.networkListToShow, "branches") >= 0) {
        this.showBranch = true;
        this.networkListToShow.pop();
      }
      return this.networkListToShow.toString();
    },
    forceMarkerClick: function(event) {
      var markerIndex;
      markerIndex = $(event.currentTarget).attr('marker-index');
      return google.maps.event.trigger(this.markerArray[markerIndex], 'click');
    },
    markOnMap: function(json, compiledMarker, isBranch, infoWindow) {
      var img, locationContent, marker, markerInfo, zIndex;
      img = "";
      zIndex = "";
      if (isBranch) {
        img = "/assets/img/location-pins/branch.png";
        zIndex = 9999;
      } else {
        img = "/assets/img/location-pins/" + this.cleanNetworkName(json.networkName) + ".png";
        zIndex = 0;
      }
      markerInfo = {
        position: new google.maps.LatLng(json.lat, json.long),
        map: this.map,
        titile: json.name,
        clickable: true,
        icon: img,
        zIndex: zIndex
      };
      marker = new google.maps.Marker(markerInfo);
      this.markerArray.push(marker);
      locationContent = "<div id='content'><div id='bodyContent'>" + (compiledMarker(json)) + "</div></div>";
      google.maps.event.addListener(this.map, 'click', function() {
        return infoWindow.close();
      });
      google.maps.event.addListener(marker, 'dblclick', function() {
        return infoWindow.close();
      });
      google.maps.event.addListener(infoWindow, 'domready', function() {
        return window.com.banno.watchDisclaimers(true);
      });
      google.maps.event.addListener(marker, 'click', function(event) {
        infoWindow.close();
        infoWindow.setContent(locationContent);
        return infoWindow.open(this.map, marker);
      });
      return marker.setMap(this.map);
    },
    insertIcon: function(imgLocation) {
      var iconTemplateCompiled, img;
      img = {
        imgSource: imgLocation
      };
      iconTemplateCompiled = Handlebars.templates.iconTemplate;
      return this.htmlLocation += iconTemplateCompiled(img);
    },
    renderBranches: function(infoWindow) {
      var _this = this;
      $("#Branches").get(0).checked = true;
      return this.branches.each(function(branch, index, list) {
        var branchJson, compiled;
        branchJson = branch.toJSON();
        branchJson = _.extend(branchJson, {
          miles: "%locations.miles",
          getDirections: "%locations.getDirections",
          descriptionInList: _this.descriptionInList && (branchJson.description != null),
          descriptionInMap: _this.descriptionInMap && (branchJson.description != null),
          imageInList: _this.imageInList && (branchJson.imageId != null),
          imageInMap: _this.imageInMap && (branchJson.imageId != null)
        });
        _this.htmlLocation += "<tr class='marker-click' marker-index='" + _this.markerCount + "'>";
        _this.markerCount += 1;
        _this.insertIcon("/assets/img/location-pins/branch.png");
        compiled = Handlebars.templates.branchTemplate;
        _this.htmlLocation += compiled(branchJson);
        _this.htmlLocation += "</tr>";
        return _this.markOnMap(branchJson, Handlebars.templates.branchMarkerTemplate, true, infoWindow);
      });
    },
    renderNetworks: function() {
      var _this = this;
      return this.networks.each(function(network, index, list) {
        var cleanName, networkJson, networkTemplateCompiled, _ref;
        networkJson = network.toJSON();
        cleanName = _this.cleanNetworkName(networkJson.name);
        if (_this.networkListToShow.length > 0) {
          if (_ref = networkJson.id.toString(), __indexOf.call(_this.networkListToShow, _ref) >= 0) {
            if (_this.firstLoad) {
              if (_this.showAtmOnFirstLoad || !_this.showBranch) {
                return _this.htmlNetwork += Handlebars.templates.checkedNetworkTemplate(networkJson);
              } else {
                return _this.htmlNetwork += Handlebars.templates.uncheckedNetworkTemplate(networkJson);
              }
            } else {
              if ($("#" + cleanName).prop("checked")) {
                networkTemplateCompiled = Handlebars.templates.checkedNetworkTemplate;
              } else {
                networkTemplateCompiled = Handlebars.templates.uncheckedNetworkTemplate;
              }
              return _this.htmlNetwork += networkTemplateCompiled(networkJson);
            }
          }
        } else {
          if (_this.firstLoad) {
            if (_this.showAtmOnFirstLoad) {
              return _this.htmlNetwork += Handlebars.templates.checkedNetworkTemplate(networkJson);
            } else {
              return _this.htmlNetwork += Handlebars.templates.uncheckedNetworkTemplate(networkJson);
            }
          } else {
            if ($("#" + cleanName).prop("checked")) {
              networkTemplateCompiled = Handlebars.templates.checkedNetworkTemplate;
            } else {
              networkTemplateCompiled = Handlebars.templates.uncheckedNetworkTemplate;
            }
            return _this.htmlNetwork += networkTemplateCompiled(networkJson);
          }
        }
      });
    },
    renderAtms: function(infoWindow) {
      var _this = this;
      return this.atms.each(function(atm, index, list) {
        var atmJson, cleanNetwork, compiled;
        atmJson = atm.toJSON();
        cleanNetwork = _this.cleanNetworkName(atmJson.networkName);
        if ((_this.firstLoad && (_this.showAtmOnFirstLoad || (_this.networkListToShow.length > 0 && !_this.showBranch))) || ($("#" + cleanNetwork).prop("checked"))) {
          _this.htmlLocation += "<tr class='marker-click' marker-index='" + _this.markerCount + "'>";
          _this.markerCount += 1;
          _this.insertIcon("/assets/img/location-pins/" + _this.cleanNetworkName(atmJson.networkName) + ".png");
          compiled = Handlebars.templates.atmTemplate;
          atmJson = _.extend(atmJson, {
            miles: "%locations.miles",
            getDirections: "%locations.getDirections"
          });
          _this.htmlLocation += "<td itemscope itemtype='http://schema.org/AutomatedTeller'>" + (compiled(atmJson)) + "</td>";
          _this.htmlLocation += "</tr>";
          return _this.markOnMap(atmJson, compiled, false, infoWindow);
        }
      });
    }
  });

  if (typeof require !== "undefined" && require !== null) {
    exports.LocationView = this.LocationView;
  }

  if (typeof require !== "undefined" && require !== null) {
    _ = require('underscore');
    Backbone = require('backbone');
    Handlebars = require('handlebars');
    BranchCollection = require('../model/BranchCollection.coffee').BranchCollection;
    LocationPaginationClass = require('./LocationPaginationClass.coffee').LocationPaginationClass;
    AtmConfigModel = require('../model/AtmConfigModel.coffee').AtmConfigModel;
    LocationView = require('./LocationView.coffee').LocationView;
  } else {
    _ = this._;
    Backbone = this.Backbone;
    Handlebars = this.Handlebars;
    AtmCollection = this.AtmCollection;
    BranchCollection = this.BranchCollection;
    LocationPaginationClass = this.LocationPaginationClass;
    AtmConfigModel = this.AtmConfigModel;
    LocationView = this.LocationView;
    $ = this.$;
  }

  this.MultiComponentLocationView = LocationView.extend({
    initialize: function() {
      LocationView.prototype.initialize.call(this);
      return this.pagination = new LocationPaginationClass(10);
    },
    events: {
      "click #locationSearch": "searchClick",
      "submit #locationSearchForm": "searchClick",
      "change .banno-location-toggles": "render",
      "change .atm-network": "updateAtmCheckbox",
      "change #ATMs": "toggleSelection",
      "change #locationProximity": "searchClick",
      "click .marker-click": "forceMarkerClick"
    },
    fireSearchClickEvent: function(config) {
      var exampleAddress, searchAddress;
      this.setConfigValues(config);
      searchAddress = this.getSearchAddress(config);
      exampleAddress = this.getDefaultLocationFromConfig(config);
      $("#location").val(searchAddress);
      $("#example-address").html(exampleAddress);
      return $("#locationSearch").click();
    },
    process: function(results_array, status) {
      var networks, radius;
      if (status === "OK") {
        radius = $("#locationProximity").val();
        $(".banno-location-results", this.el).html("");
        $("#page_navigation").html("");
        this.loc = results_array[0].formatted_address;
        this.searchResultTemplate = '%locations.results'.toLocaleString() + ' <strong><span id="searched-address"></span></strong>';
        this.lat = results_array[0].geometry.location.lat();
        this.long = results_array[0].geometry.location.lng();
        networks = $('#locationListContainer').attr('networks');
        if (networks == null) {
          networks = "";
        }
        if (networks.length > 0) {
          this.networksToShow = this.processNetworksToShow(networks);
        }
        this.atms.url = this.atms.buildUrl(this.institutionId, this.lat, this.long, radius, this.networksToShow);
        this.branches.url = this.branches.buildUrl(this.institutionId, this.lat, this.long, radius);
        if (this.networksToShow.length > 0 && !this.showBranch) {
          $("label#branchLabel").hide();
          return this.atms.fetch();
        } else {
          this.branches.fetch({
            async: false
          });
          return this.atms.fetch();
        }
      } else {
        this.branches.reset();
        this.loc = $("#location").val();
        this.searchResultTemplate = '<strong>' + '%locations.notFound'.toLocaleString() + ' </strong><br><span id="searched-address"></span>';
        $("#locationTable").hide();
        return this.atms.reset();
      }
    },
    render: function() {
      var circle, infoWindow, mapCenter, mapInfo, radius,
        _this = this;
      $("#locationTable").hide();
      this.htmlLocation = "";
      this.htmlNetwork = "";
      this.markerArray = [];
      this.markerCount = 0;
      $(".banno-location-results", this.el).html(this.searchResultTemplate);
      $("#searched-address").text(this.loc);
      mapCenter = new google.maps.LatLng(this.lat, this.long);
      radius = $("#locationProximity").val();
      mapInfo = {
        center: mapCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: this.scrollWheel,
        styles: (typeof mapStyles !== "undefined" && mapStyles !== null) ? mapStyles : null
      };
      this.map = new google.maps.Map(document.getElementById('map_canvas'), mapInfo);
      circle = new google.maps.Circle({
        radius: radius * 500,
        center: mapCenter
      });
      this.map.fitBounds(circle.getBounds());
      infoWindow = new google.maps.InfoWindow();
      if (this.firstLoad || ($("#Branches").prop("checked"))) {
        this.renderBranches(infoWindow);
      }
      this.renderNetworks();
      this.renderAtms(infoWindow);
      $("#locationListBody", $(this.el)).html(this.htmlLocation);
      $("#atmsToggleList", $(this.el)).html(this.htmlNetwork);
      $("#locationTable").show();
      this.pagination.paginate();
      this.firstLoad = false;
      this.updateAtmCheckbox();
      window.com.banno.watchDisclaimers(false);
      return google.maps.event.addListenerOnce(this.map, 'idle', function() {
        return document.querySelector(".banno-location-map-container div .gm-style iframe").setAttribute("title", "Google Map");
      });
    }
  });

  if (typeof require !== "undefined" && require !== null) {
    exports.MultiComponentLocationView = this.MultiComponentLocationView;
  }

}).call(this);
