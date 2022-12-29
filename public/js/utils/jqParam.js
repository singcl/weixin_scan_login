var rbracket = /\[\]$/,
  // rCRLF = /\r?\n/g,
  op = Object.prototype,
  ap = Array.prototype,
  aeach = ap.forEach,
  ostring = op.toString;

function isFunction(it) {
  return ostring.call(it) === '[object Function]';
}

function isArray(it) {
  return ostring.call(it) === '[object Array]';
}

function isObject(it) {
  return ostring.call(it) === '[object Object]';
}

function buildParams(prefix, obj, traditional, add) {
  var name;

  if (isArray(obj)) {
    // Serialize array item.
    aeach.call(obj, function (v, i) {
      if (traditional || rbracket.test(prefix)) {
        // Treat each array item as a scalar.
        add(prefix, v);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(
          prefix + '[' + (typeof v === 'object' && v != null ? i : '') + ']',
          v,
          traditional,
          add
        );
      }
    });
  } else if (!traditional && isObject(obj)) {
    // Serialize object item.
    for (name in obj) {
      buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
    }
  } else {
    // Serialize scalar item.
    add(prefix, obj);
  }
}

/**
 * Serialize an array of form elements or a set of
* key/values into a query string
 * @param {*} a 
 * @param {*} traditional 
 * @returns 
 */
export default function jollyparam(a, traditional) {
  var prefix,
    s = [],
    add = function (key, valueOrFunction) {
      // If value is a function, invoke it and use its return value
      var value = isFunction(valueOrFunction)
        ? valueOrFunction()
        : valueOrFunction;

      s[s.length] =
        encodeURIComponent(key) +
        '=' +
        encodeURIComponent(value == null ? '' : value);
    };

  // If an array was passed in, assume that it is an array of form elements.
  if (isArray(a)) {
    // Serialize the form elements
    aeach.call(a, function (item) {
      add(item.name, item.value);
    });
  } else {
    // If traditional, encode the "old" way (the way 1.3.2 or older
    // did it), otherwise encode params recursively.
    for (prefix in a) {
      buildParams(prefix, a[prefix], traditional, add);
    }
  }

  // Return the resulting serialization
  return s.join('&');
}
