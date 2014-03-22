//@module

var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');

var Bar = require('./bar');
var Page = require('./Page');
var PageController = require('./PageController');

var Sensors = require('./lib/Sensors');

var Utils = require('./lib/Utils');

var ChaTestPage = function ChaTestPage(data) {
	Page.call(this, {
		subtitle: 'Charisma Test'
	});
	
    var countdownTimer = new Label({top: 10, left: 0, right: 0}, null, Theme.titleStyle, '');
    this.layout.add(countdownTimer);
	
	var sensorBar = new Bar.HorizontalBar({
		left: 40,
		top: 10,
		right: 40,
		width: 240,
		height: 60,
		bgColor: '#fff',
		fgColor: '#000',
		progress: 0.0
	});
	this.layout.add(sensorBar);
	
	var tempReadingLabel = new Label({top: 5, left: 0, right: 0}, null, Theme.titleStyle, '');
	tempReadingLabel.string = "0.0 F";
    this.layout.add(tempReadingLabel);
    
    var container = this;
    
    var handler = new Handler("/tempcallback"); 
    handler.behavior = {
    	onInvoke: function(handler, message) {
	    	var reading = JSON.parse( message.requestText ).temp;
	    	var minReading = 70; // degrees F
	    	var maxReading = 110; // degrees F
	    	tempReadingLabel.string = '' + (Math.ceil(reading*10)/10) + ' F';
	    	
	    	scaled = Utils.linearMap(reading, minReading, maxReading, 0, 1);
	        var R = Math.floor(scaled * 255);
	        var B = 255 - R;
	        var fgColor = 'rgb(' + R + ',0,' + B + ')';
	    	sensorBar.filledIn.skin = new Skin(fgColor);
	    	sensorBar.filledIn.width = 240 * scaled;
	    	container.behavior.reading = Math.max(container.behavior.reading, reading);
	    	container.behavior.scaled = scaled;
    	}
    };
    Handler.put(handler);
    
    var readTemp = function(container) {
    	var query = new Object();
        
        query.scriptPath = mergeURI( application.url, "scripts/read-temp.js" ).substring( "file:///".length );
		query.sendParamsOnce = true;
		query.mseconds = 100;
		query.callback = "xkpr://" + application.id + "/tempcallback";
		
		var msg = new Message( "xkpr://shell/hardwarepins/repeat?" + serializeQuery( query ) );
		var parameters = new Object();
   		parameters.addr = Sensors.addresses.TEMP_ADDR;
        
        msg.requestText = JSON.stringify( parameters );
   
       	container.invoke( msg, Message.JSON );
    }
    
    var setCountdownTimer = function(duration, time) {
    	var ms = duration - time;
    	var s = Math.ceil(ms / 1000);
    	countdownTimer.string = '' + s;
    	if(ms < 900 && !this.behavior.played) {
    		this.behavior.sound.play();
    		this.behavior.played = true;
    	}
    }.bind(this);
    
    var stopTemp = function(container) {
    	var query = new Object();
        query.id = container.behavior.sensorID;
        
    	var msg = new Message( "xkpr://shell/hardwarepins/stop?" + serializeQuery( query ) );
		var parameters = new Object();
   		parameters.id = container.behavior.sensorID;
        
        msg.requestText = JSON.stringify( parameters );
            
       	container.invoke( msg );
    }
	
	this.behavior = {
		reading: -666,
		scaled: 0,
		played: false,
		soundUrl: mergeURI( application.url, "./assets/whip.wav" ),
		sound: null,
		onDisplaying: function(container) {
			this.sound = new Sound( this.soundUrl );
			Sound.volume = 1.0;
			this.reading = -666;
			this.scaled = 0;
			readTemp(container);
		    container.time = 0;
			container.interval = 100;
			container.duration = Abilities.countdowns.cha;
			setCountdownTimer(container.duration, container.time);
			container.start();
		},
		onTimeChanged: function(container) {
			setCountdownTimer(container.duration, container.time);
		},
		onFinished: function(container) {
			stopTemp(container);
			trace("cha: " + this.reading + "\n");
			PlayerData.cha = Abilities.threshold(this.reading, 'cha');
			container.invoke(new Message('/cha/results'));
		},
		onComplete: function(container, message, data) {
			this.sensorID = JSON.parse( message.responseText ).id;
		}
	};
};
ClassUtils.subclass(ChaTestPage, Page);

module.exports = new ChaTestPage();