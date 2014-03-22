//@module

var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');

var Button = require('./button');
var Theme = require('./theme');
var Page = require('./Page');
var PageController = require('./PageController');

var UI = require('./lib/UI');

var ResetPage = function ResetPage() {
	Page.call(this, {
		subtitle: 'Are you sure you want to reset?'
	});
	
	var resetButton = new UI.Button({
		left: 60,
		top: 50,
		width: 200,
		height: 25,
		string: 'Yes, reset scores.',
		active: true,
		style: Theme.abilityButtonStyle,
		action: '/resetandreturn'
	});
	
	var handler = new Handler('/resetandreturn');
	handler.behavior = {
		onInvoke: function(handler, message) {
			trace("reset player\n");
			PlayerData.reset();
			application.invoke(new Message('/'));
		}.bind(this)
	};
	Handler.put(handler);
	
	var noResetButton = new UI.Button({
		left: 60,
		top: 25,
		width: 200,
		height: 20,
		string: 'No! Keep my scores!',
		active: true,
		style: Theme.abilityButtonStyle,
		action: '/',
	});
	
	this.layout.add(resetButton);
	this.layout.add(noResetButton);
	
	this.behavior = {
		onDisplaying: function(container) {},
	};
};
ClassUtils.subclass(ResetPage, Page);

module.exports = new ResetPage();