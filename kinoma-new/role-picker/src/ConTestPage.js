//@module

var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');

var Bar = require('./bar');
var Page = require('./Page');
var PageController = require('./PageController');

var Sensors = require('./lib/Sensors');

var Utils = require('./lib/Utils');

var ConTestPage = function ConTestPage(data) {
	Page.call(this, {
		subtitle: 'Constitution Test'
	});
	
    var countdownTimer = new Label({top: 10, left: 0, right: 0}, null, Theme.titleStyle, '');
    this.layout.add(countdownTimer);
	
	var sensorDisplay = new Canvas({
		left: 40,
		top: 10,
		right: 40,
		width: 240,
		height: 60
	});
	this.layout.add(sensorDisplay);
	var ctx = sensorDisplay.getContext('2d');
	
	var BACLabel = new Label({top: 10, left: 0, right: 0}, null, Theme.titleStyle, '');
	BACLabel.string = ".00% BAC";
    this.layout.add(BACLabel);
    
    var container = this;
    var minReading = .0; // % BAC
	var maxReading = .2; // % BAC (sadly I can't set this higher, since the sensor response is slow
    
    var handler = new Handler("/BACcallback"); 
    handler.behavior = {
    	onInvoke: function(handler, message) {
	    	var reading = JSON.parse( message.requestText ).BAC;
	    	BACLabel.string = (Math.round(reading*100)/100) + "% BAC";

	    	container.behavior.reading = Math.max(container.behavior.reading, reading);
	    	container.behavior.scaled = Utils.linearMap(reading, minReading, maxReading, 0, 1);
	    	container.behavior.lastReadingAt = container.time;
    	}
    };
    Handler.put(handler);
    
    var readBAC = function(container) {
    	var query = new Object();
        
        query.scriptPath = mergeURI( application.url, "scripts/read-bac.js" ).substring( "file:///".length );
		query.sendParamsOnce = true;
		query.mseconds = 100;
		query.callback = "xkpr://" + application.id + "/BACcallback";
		
		var msg = new Message( "xkpr://shell/hardwarepins/repeat?" + serializeQuery( query ) );
		var parameters = new Object();
   		parameters.addrs = [ Sensors.addresses.BAC_A2D1, Sensors.addresses.BAC_A2D2 ];
        
        msg.requestText = JSON.stringify( parameters );
   
       	container.invoke( msg, Message.JSON );
    }
    
    var stopBAC = function(container) {
    	var query = new Object();
        query.id = container.behavior.sensorID;
        
    	var msg = new Message( "xkpr://shell/hardwarepins/stop?" + serializeQuery( query ) );
		var parameters = new Object();
   		parameters.id = container.behavior.sensorID;
        
        msg.requestText = JSON.stringify( parameters );
            
       	container.invoke( msg );
    }
    
    var setSensorDisplay = function(reading, time) {
    	ctx.clearRect(0, 0, 240, 60);
        var pulseMs = 500;
        var pulse = Math.sin(Math.PI * 2 * time / pulseMs);
        var pulseFactor = 1 + pulse * 0.2;
        var x = 30;
        var y = 30;
        var r = 10;
        var R = 0;
        var G = 255;
        for (var i = 0; i < 4; i++) {
        	ctx.strokeStyle = 'rgb(' + R + ',' + G + ',0)';
        	ctx.beginPath();
        	var pulseR = (reading > i / 4) ? r * pulseFactor : r;
        	ctx.arc(x, y, pulseR, 0, Math.PI * 2, true);
        	ctx.stroke();
        	r += 5;
        	x += 2 * r + 15;
        	R += 85;
        	G -= 85;
        }
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
		reading: -666,
		scaled: 0,
		lastReadingAt: -100,
		played: false,
		soundUrl: mergeURI( application.url, "./assets/whip.wav" ),
		sound: null,
		onDisplaying: function(container) {
			this.sound = new Sound( this.soundUrl );
			Sound.volume = 1.0;
			this.reading = -666;
			this.scaled = 0;
			readBAC(container);
		    container.time = 0;
			container.interval = 30;
			container.duration = Abilities.countdowns.con;
			setSensorDisplay(0.0, container.time);
			setCountdownTimer(container.duration, container.time);
			container.start();
		},
		onTimeChanged: function(container) {
			setSensorDisplay(this.scaled, container.time);
			setCountdownTimer(container.duration, container.time);
		},
		onFinished: function(container) {
			stopBAC(container);
			trace("con: " + this.reading + "\n");
			PlayerData.con = Abilities.threshold(this.reading, 'con');
			container.invoke(new Message('/con/results'));
		},
		onComplete: function(container, message, data) {
			this.sensorID = JSON.parse( message.responseText ).id;
		}
	};
};
ClassUtils.subclass(ConTestPage, Page);

module.exports = new ConTestPage();