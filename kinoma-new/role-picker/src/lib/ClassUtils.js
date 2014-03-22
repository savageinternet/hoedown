//@module

var _subclassOf = function _subclassOf() {};

var subclass = function subclass(derived, base) {
  _subclassOf.prototype = base.prototype;
  derived.prototype = new _subclassOf();
};

exports.subclass = subclass;