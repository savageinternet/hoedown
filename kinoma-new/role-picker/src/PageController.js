//@module

var PageController = function PageController(container) {
  this._container = container;
  this._pages = {};
  this._active = null;
};
PageController.prototype._go = function go(path) {
	if (this._active === path) {
		return;
	}
	if (this._active !== null) {
		var oldPage = this._pages[this._active];
		oldPage.container.remove(oldPage);
	}
	var newPage = this._pages[path];
	if (!newPage) {
		throw new Error('page path unknown: ' + path);
	}
	this._container.add(newPage);
	this._active = path;
};
PageController.prototype.register = function register(path, page) {
    if (this._pages.hasOwnProperty(path)) {
    	throw new Error('page already exists at: ' + path);
    }
	this._pages[path] = page;
	var handler = new Handler(path);
	handler.behavior = {
		onInvoke: function(handler, message) {
			this._go(path);
		}.bind(this)
	};
	Handler.put(handler);
};
PageController.prototype.get = function(path) {
	return this._pages[path];
};
module.exports = new PageController(application);