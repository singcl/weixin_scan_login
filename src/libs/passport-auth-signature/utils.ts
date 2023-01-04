'use strict';

/**
 * Looks up a value on the object.
 * @param {Object} obj The object to look through.
 * @param {String} field The name of the field to check.
 * @param {Object} [options] The lookup options.
 * @param {Boolean} options.caseInsensitive Whether or not to do case insensitive checking.
 * @returns {String} The property name.
 */
exports.lookup = function (obj, field, options) {
  if (!obj) {
    return null;
  }

  options = options || {};

  const chain = field.split(']').join('').split('[');

  for (let i = 0, len = chain.length; i < len; i++) {
    const prop = options.caseInsensitive
      ? obj[chain[i].toLowerCase()]
      : obj[chain[i]];

    if (typeof prop === 'undefined') {
      return null;
    }

    if (typeof prop !== 'object') {
      return prop;
    }

    obj = prop;
  }

  return null;
};
