//@module

var THEME = require('../themes/main/theme');
var localTheme = require('../theme');
var CONTROL = require('mobile/control');

var Abilities = require('./Abilities');
var ClassUtils = require('./ClassUtils');
var PlayerData = require('./PlayerData');

var Button = function(data) {
	Container.call(this, data, THEME.buttonSkin, THEME.buttonStyle);
	this.active = data.active;
	this.behavior = new CONTROL.ButtonBehavior(this, data);
	var label = new Label(null, null, THEME.buttonStyle, data.string);
	this.add(label);
};
ClassUtils.subclass(Button, Container);

var AngryButton = function(data) {
	Container.call(this, data, localTheme.angryButtonStyle, THEME.buttonStyle);
	this.active = data.active;
	this.behavior = new CONTROL.ButtonBehavior(this, data);
	var label = new Label(null, null, THEME.buttonStyle, data.string);
	this.add(label);
};
ClassUtils.subclass(AngryButton, Container);

var AbilityButton = function(data) {
	var completed = PlayerData[data.shortName] !== null;
	var path = '/' + data.shortName + '/directions';
    data.left = 5;
    data.top = 5;
    data.width = 100;
    data.height = 20;
    data.active = !completed;
    data.action = path;
    data.string = Abilities.fullNames[data.shortName];
	Button.call(this, data);
}
ClassUtils.subclass(AbilityButton, Button);

exports.Button = Button;
exports.AngryButton = AngryButton;
exports.AbilityButton = AbilityButton;