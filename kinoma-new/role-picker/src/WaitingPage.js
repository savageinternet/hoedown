//@module

var THEME = require('./themes/main/theme');

var ClassUtils = require('./lib/ClassUtils');
var Page = require('./Page');

var UI = require('./lib/UI');

var WaitingPage = function WaitingPage() {
	Page.call(this, {});
	
	var label = new Label({}, null, THEME.waitingStyle, 'Waiting...');
	this.layout.add(label);
	
	var waitPicture = new Picture({
		width: 200,
		height: 200
	}, './assets/waiting-dark.png');
	waitPicture.behavior = {
		onLoaded: function(picture, data) {
			picture.origin = { x:100, y:100 };
			picture.scale = { x:0.5, y:0.5 };
		},
		onDisplaying: function(picture) {
			picture.start();
		},
		onTimeChanged: function(picture) {
			var rotation = picture.rotation;
			rotation -= 5;
			if (rotation < 0) rotation = 360;
			picture.rotation = rotation;
		}
	};
	this.layout.add(waitPicture);
};
ClassUtils.subclass(WaitingPage, Page);

module.exports = new WaitingPage();