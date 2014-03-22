//@module

var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');

var Bar = require('./bar');
var Page = require('./Page');
var PageController = require('./PageController');

var Sensors = require('./lib/Sensors');

var Utils = require('./lib/Utils');

var IntTestPage = function IntTestPage(data) {
	Page.call(this, {
		subtitle: 'Intelligence Test'
	});
	
    var container = this;
	
    var countdownTimer = new Label({top: 10, left: 0, right: 0}, null, Theme.titleStyle, '');
    this.layout.add(countdownTimer);
	
	var handler = new Handler("/stretchcallback"); 
    handler.behavior = {
    	onInvoke: function(handler, message) {
	    	var reading = JSON.parse( message.requestText ).stretch;
	    	
	    	inchesLabel.string = (Math.round(reading*10)/10) + " in";
	    	container.behavior.reading = reading;
	    	container.behavior.scaled = Utils.linearMap(reading, 10, 35, 0, 1);
    	}
    };
    Handler.put(handler);
    
    var readstretch = function(container) {
    	var query = new Object();
        
        query.scriptPath = mergeURI( application.url, "scripts/read-stretch.js" ).substring( "file:///".length );
		query.sendParamsOnce = true;
		query.mseconds = 100;
		query.callback = "xkpr://" + application.id + "/stretchcallback";
		
		var msg = new Message( "xkpr://shell/hardwarepins/repeat?" + serializeQuery( query ) );
		var parameters = new Object();
   		parameters.addr = Sensors.addresses.STRETCH_A2D;
        
        msg.requestText = JSON.stringify( parameters );
   
       	container.invoke( msg, Message.JSON );
    }
    
    var stopstretch = function(container) {
    	var query = new Object();
        query.id = container.behavior.sensorID;
        
    	var msg = new Message( "xkpr://shell/hardwarepins/stop?" + serializeQuery( query ) );
		var parameters = new Object();
   		parameters.id = container.behavior.sensorID;
        
        msg.requestText = JSON.stringify( parameters );
            
       	container.invoke( msg );
    }
	
	var sensorDisplay = new Canvas({
		left: 40,
		top: 10,
		right: 40,
		width: 240,
		height: 60
	});
	this.layout.add(sensorDisplay);
	var ctx = sensorDisplay.getContext('2d');
	ctx.strokeStyle = '#fff';
    
    var inchesLabel = new Label({top: 5, left: 0, right: 0}, null, Theme.titleStyle, '');
    inchesLabel.string = "0 in";
    this.layout.add(inchesLabel);
    
    var setSensorDisplay = function(reading) {
    	var r = 15 + 10 * reading;
    	ctx.clearRect(0, 0, 240, 60);
    	ctx.beginPath();
    	ctx.arc(120, 30, r, 0, Math.PI * 2, true);
    	ctx.stroke();
    };
    
    var setCountdownTimer = function(duration, time) {
    	var ms = duration - time;
    	var s = Math.ceil(ms / 1000);
    	countdownTimer.string = '' + s;
    	if(ms < 900 && !this.behavior.played) {
    		this.behavior.sound.play();
    		this.behavior.played = true;
    	}
    }.bind(this);
	
	this.behavior = {
		reading: 0,
		scaled: 0,
		numReadings: 0,
		played: false,
		soundUrl: mergeURI( application.url, "./assets/whip.wav" ),
		sound: null,
		onDisplaying: function(container) {
			this.sound = new Sound( this.soundUrl );
			Sound.volume = 1.0;
			this.reading = 0;
			this.scaled = 0;
			this.numReadings = 0;
		    container.time = 0;
			container.interval = 100;
			readstretch(container);
			container.duration = Abilities.countdowns.int;
			setSensorDisplay(this.scaled);
			setCountdownTimer(container.duration, container.time);
			container.start();
		},
		onTimeChanged: function(container) {
			setSensorDisplay(this.scaled);
			setCountdownTimer(container.duration, container.time);
		},
		onFinished: function(container) {
			stopstretch(container);
			trace("int: " + this.reading + "\n");
			PlayerData.int = Abilities.threshold(this.reading, 'int');
			container.invoke(new Message('/int/results'));
		},
		onComplete: function(container, message, data) {
			this.sensorID = JSON.parse( message.responseText ).id;
		}
	};
};
ClassUtils.subclass(IntTestPage, Page);

module.exports = new IntTestPage();