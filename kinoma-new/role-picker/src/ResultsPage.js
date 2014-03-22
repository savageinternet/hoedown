//@module

var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');
var UI = require('./lib/UI');

var TextLabel = require('./textLabel');
var Page = require('./Page');
var PageController = require('./PageController');

var ResultsPage = function ResultsPage(data) {
	var fullName = Abilities.fullNames[shortName];
	Page.call(this, {
		subtitle: fullName + ' Test'
	});
	
	var subSubTitle = new Label({left: 0, right: 0, top: 10}, null, Theme.textStyle,
		'Your ' + fullName + ':');
	var textLabel = new Text({left: 0, right: 0, top: 10}, null, Theme.textStyle,
	    '');
	var button = new UI.Button({
		left: 120,
		top: 10,
		width: 80,
		height: 20,
		string: 'OK!',
		active: true,
		action: '/'
	});
	this.layout.add(subSubTitle);
	this.layout.add(textLabel);
	this.layout.add(button);
	
	this.behavior = {
		shortName: data.ability,
		bar: null,
		layout: this.layout,
		getDescription: function(score) {
			var descriptions = Abilities.resultDescriptions[this.shortName];
			if (score < 3) {
				return descriptions[0];
			} else if (score < 6) {
				return descriptions[1];
			} else {
				return descriptions[2];
			}
		},
		onDisplaying: function(container) {
			// all our scores are 1-7
			var score = PlayerData[this.shortName];
			var bar = new Bar.HorizontalBar({
				left: 5,
				top: 5,
				width: 310,
				height: 20,
				bgColor: '#ccc',
				fgColor: '#333',
				progress: score
			});
			if (this.bar !== null) {
				this.layout.remove(this.bar);
			}
			this.bar = bar;
			this.layout.insert(bar, textLabel);
			textLabel.string = this.getDescription(score);
		}
	};
};
ClassUtils.subclass(ResultsPage, Page);

for (var i = 0; i < Abilities.shortNames.length; i++) {
	var shortName = Abilities.shortNames[i];
	exports[shortName] = new ResultsPage({
		ability: shortName
	});
}