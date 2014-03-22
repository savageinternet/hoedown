//@module

var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');

var Bar = require('./bar');
var Page = require('./Page');
var PageController = require('./PageController');

var Sensors = require('./lib/Sensors');

var Utils = require('./lib/Utils');

var StrTestPage = function StrTestPage(data) {
	Page.call(this, {
		subtitle: 'Strength Test'
	});
	
    var lowThresh = 130000;
    var highThresh = 150000;
    var squeezed = false;
    var released = true;
    var container = this;
    
    var squeezeLabel = new Label({top: 5, left: 0, right: 0}, null, Theme.titleStyle, '');
    squeezeLabel.string = "squeeze away!";
    this.layout.add(squeezeLabel);
	
	var handler = new Handler("/flexcallback"); 
    handler.behavior = {
    	onInvoke: function(handler, message) {
	    	var reading = JSON.parse( message.requestText ).flex;
	    	
	    	// we want to count how many times the person has squeezed... so we need
	    	// to look for their going outside the thresholds on each end, and how many times they do that.
	    	if (squeezed) {
	    		if(reading < lowThresh) {
	    			//trace("### released!\n");
	    			released = true;
	    			squeezed = false;
	    			squeezeLabel.string = "released!";
	    		}
	    	}
	    	
	    	else if (released) {
	    		if (reading > highThresh) {
	    			//trace("### squeezed!\n");
	    			released = false;
	    			squeezed = true;
	    			container.behavior.flexCount += 1;
	    			squeezeLabel.string = "squeezed!";
	    		}
	    	}
	    	
	    	container.behavior.reading = reading;
    	}
    };
    Handler.put(handler);
    
    var readflex = function(container) {
    	var query = new Object();
        
        query.scriptPath = mergeURI( application.url, "scripts/read-flex.js" ).substring( "file:///".length );
		query.sendParamsOnce = true;
		query.mseconds = 50;
		query.callback = "xkpr://" + application.id + "/flexcallback";
		
		var msg = new Message( "xkpr://shell/hardwarepins/repeat?" + serializeQuery( query ) );
		var parameters = new Object();
   		parameters.addr = Sensors.addresses.FLEX_A2D;
        
        msg.requestText = JSON.stringify( parameters );
   
       	container.invoke( msg, Message.JSON );
    }
    
    var stopflex = function(container) {
    	var query = new Object();
        query.id = container.behavior.sensorID;
        
    	var msg = new Message( "xkpr://shell/hardwarepins/stop?" + serializeQuery( query ) );
		var parameters = new Object();
   		parameters.id = container.behavior.sensorID;
        
        msg.requestText = JSON.stringify( parameters );
            
       	container.invoke( msg );
    }
	
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
    
    var setSensorBar = function(flexCount) {
	    var mapped = Utils.linearMap(flexCount, 0, 10, 0, 1);
        var R = Math.floor(mapped * 255);
        var B = 255 - R;
        var fgColor = 'rgb(' + R + ',0,' + B + ')';
    	sensorBar.filledIn.skin = new Skin(fgColor);
    	sensorBar.filledIn.width = 240 * mapped;
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
		flexCount: 0,
		played: false,
		soundUrl: mergeURI( application.url, "./assets/whip.wav" ),
		sound: null,
		onDisplaying: function(container) {
			this.sound = new Sound( this.soundUrl );
			Sound.volume = 1.0;
			this.reading = 0;
			this.flexCount = 0;
			squeezed = false;
			released = true;
			readflex(container);
		    container.time = 0;
			container.interval = 100;
			container.duration = Abilities.countdowns.str;
			setCountdownTimer(container.duration, container.time);
			container.start();
		},
		onTimeChanged: function(container) {
			setSensorBar(this.flexCount);
			setCountdownTimer(container.duration, container.time);
		},
		onFinished: function(container) {
			stopflex(container);
			trace("str: " + this.flexCount + "\n");
			PlayerData.str = Abilities.threshold(this.flexCount, 'str');
			container.invoke(new Message('/str/results'));
		},
		onComplete: function(container, message, data) {
			this.sensorID = JSON.parse( message.responseText ).id;
		}
	};
};
ClassUtils.subclass(StrTestPage, Page);

module.exports = new StrTestPage();