//@module

var Point = function(x, y) {
  Object.defineProperty(this, 'x', {
    value: x,
    writable: false
  });
  Object.defineProperty(this, 'y', {
    value: y,
    writable: false
  });
};
Point.prototype.relativeTo = function(origin) {
  return new Point(this.x - origin.x, this.y - origin.y);
};

module.exports = Point;