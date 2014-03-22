//@module

var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');
var RemoteManager = require('./lib/RemoteManager');

var Button = require('./button');
var Theme = require('./theme');
var Page = require('./Page');
var PageController = require('./PageController');

var UI = require('./lib/UI');

var FinishPage = function FinishPage() {
	var ROLES = [
		'Oil Baron',
		'Sheriff',
		'Conquistador',
		'Square Dancer',
		'Rodeo Clown',
		'Rancher',
		'Outlaw'
	];

	Page.call(this, {
		subtitle: 'Congratulations!'
	});

	var sendingLabel = new Text({left: 0, right: 0, top: 10}, null, Theme.textStyle,
				"Sending player data...");
	this.layout.add(sendingLabel);

	var finishButton = new UI.Button({
		left: 100,
		top: 20,
		width: 120,
		height: 20,
		string: 'Off You Go!',
		active: true,
		style: Theme.abilityButtonStyle,
		action: '/resetandreturn'
	});

	this.layout.add(finishButton);

	this.behavior = {
		onDisplaying: function(container) {
			PlayerData.role = Math.floor(Math.random() * 7);
                        // TODO: replace this with the k4pop host
			var message = new Message('http://hoedown.savageinter.net/users/');
			var text = serializeQuery({
			    cha: PlayerData.cha,
			    con: PlayerData.con,
			    dex: PlayerData.dex,
			    int: PlayerData.int,
			    str: PlayerData.str,
			    wis: PlayerData.wis,
			    role: PlayerData.role
			});
            message.method = 'POST';
            message.requestText = text;
			message.setRequestHeader('Content-Length', text.length);
			message.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			trace(message.requestText + "\n");
			container.invoke(message, Message.JSON);
		},
		onComplete: function(container, message, data) {
		    if (!message || !data) {
                // TODO: handle this more gracefully
                throw new Error('no response from application!');
		    }
		    if(!('success' in data)) {
		    	trace("\nwe didn't get a success message...\n");
		    }
		    else if (!data.success) {
		        // TODO: handle this more gracefully
		        trace("\noh, noez!  something went le wrong...");
		        trace(JSON.stringify(data) + '\n');
		    }

		    if (RemoteManager.get() !== null) {
		    	RemoteManager.sendUserId(data.id);
		    }

			sendingLabel.string = "Turns out you're a " + ROLES[PlayerData.role] + "!  Head over to the next station to get your official ID.";
			PlayerData.reset();
			finishButton.active = true;
		}
	};
};
ClassUtils.subclass(FinishPage, Page);

module.exports = new FinishPage();
