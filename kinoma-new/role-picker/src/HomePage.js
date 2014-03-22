//@module

var THEME = require('./themes/main/theme');
var CONTROL = require('mobile/control');
	
var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');
var Trace = require('./lib/Trace');
var UI = require('./lib/UI');

var Bar = require('./bar');
var TextLabel = require('./textLabel');
var Theme = require('./theme');
var Page = require('./Page');
var PageController = require('./PageController');

var makeAbilityBar = function makeAbilityBar(ability) {
	var score = PlayerData[ability];
	if (score === null) {
		return new TextLabel.TextLabel({
			left: 5,
			top: 5,
			width: 160,
			height: 20,
			text: '\t\t???',
			style: Theme.textStyle
		});
	}
	return new Bar.HorizontalBar({
		left: 5,
		top: 5,
		width: 200,
		height: 20,
		bgColor: '#ccc',
		fgColor: '#333',
		progress: score
	});
}

var HomePage = function HomePage() {
	Page.call(this, {'subtitle':'press the buttons, test your skills!'});
	this.active = true;
	
	var abilities = new Line({left: 0, right: 0, top: 0, bottom: 0});
	abilities.name = 'abilities';
	this.layout.add(abilities);
	
	var buttons = new Column({});
	buttons.name = 'buttons';
	abilities.add(buttons);
		
	var bars = new Column({});
	bars.name = 'bars';
	abilities.add(bars);
	
	var reset = new UI.Button({
		left: 100,
		top: 0,
		width: 120,
		height: 20,
		string: 'reset scores',
		active: true,
		action: '/reset'
	});
	this.layout.add(reset);

	this.behavior = {
		onDisplaying: function(container) {
			buttons.empty();
			bars.empty();
			
			for (var i = 0; i < Abilities.shortNames.length; i++) {
				var shortName = Abilities.shortNames[i];
			    buttons.add(new UI.AbilityButton({shortName: shortName}));
			    bars.add(makeAbilityBar(shortName));
			}
		},
		onDisplayed: function(container) {
		    if (PlayerData.isComplete()) {
                application.invoke(new Message('/finish'));
            }
		}
	};
};
ClassUtils.subclass(HomePage, Page);

module.exports = new HomePage();