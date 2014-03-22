//@module

var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var UI = require('./lib/UI');

var Button = require('./button');
var TextLabel = require('./textLabel');
var Page = require('./Page');
var PageController = require('./PageController');

var DirectionsPage = function DirectionsPage(data) {
	var shortName = data.ability;
	var fullName = Abilities.fullNames[shortName];
	Page.call(this, {
		subtitle: fullName + ' Test',
		steps: data.steps
	});
	
	var buttonGo = new UI.Button({
		left: 120,
		top: 10,
		width: 80,
		height: 20,
		string: 'Go!',
		active: true,
		action: '/' + shortName + '/test'
	});
	this.layout.add(buttonGo);
};
ClassUtils.subclass(DirectionsPage, Page);

exports.cha = new DirectionsPage({
	ability: 'cha',
	steps: [
		'1. Put your hand over the charisma sensor.',
		'2. Hit go!',
		'3. Think warm thoughts...'
	]
});

exports.con = new DirectionsPage({
	ability: 'con',
	steps: [
		'1. Take a sip of your beverage.  (Please swallow it, too.)',
		'2. Start to breathe onto the constitution sensor.',
		'3. Hit go! Make sure to exhale for 5 whole seconds!'
	]
});

exports.dex = new DirectionsPage({
	ability: 'dex',
	steps: [
		'1. On the next screen, start with your finger at the red box, and follow the maze to the green box.',
		'2. Try not to hit the walls!'
	]
});

exports.int = new DirectionsPage({
	ability: 'int',
	steps: [
		'1. Let Valkyrie and Evan fit the intelligence device onto your head.',
		'2. Hit go!'
	]
});

exports.str = new DirectionsPage({
	ability: 'str',
	steps: [
		'1. Grab the strength device in your dominant hand.',
		'2. Hit go!',
		'3. SQUEEZE AS MANY TIMES AS YOU CAN!!!!!'
	]
});

exports.wis = new DirectionsPage({
	ability: 'wis',
	steps: [
		'1. On the next screen, draw the best beard you can.  Make sure you color it in nice and dark!',
		'2. Consider growing that beard.'
	]
});