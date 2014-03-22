//@module

var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var PlayerData = require('./lib/PlayerData');
var Point2D = require('./lib/Point2D');

var Bar = require('./bar');
var Page = require('./Page');
var PageController = require('./PageController');

var WisTestPage = function WisTestPage(data) {
	Page.call(this, {
		subtitle: 'Wisdom Test'
	});
	
	var beardDisplay = new Canvas({
       left: 40,
       top: 10,
       right: 40,
       width: 240,
       height: 150
    });
    this.layout.add(beardDisplay);
	
    var countdownTimer = new Label({top: 10, left: 0, right: 0}, null, Theme.titleStyle, '');
    this.layout.add(countdownTimer);
    
    var beardFaceUri = mergeURI(application.url, 'assets/tests/wis-beard-guy.png');
    var beardFace = new Picture(null, beardFaceUri);
    
    var ctx = beardDisplay.getContext('2d');
    ctx.strokeStyle = '#000';
	ctx.fillStyle = '#fff';
	
    var redrawFace = function() {
    	ctx.fillRect(0, 0, 240, 150);
    	ctx.drawImage(beardFace, 0, 0, 240, 150, 40, 0, 160, 90);
    };
    
    var setCountdownTimer = function(duration, time) {
    	var ms = duration - time;
    	var s = Math.ceil(ms / 1000);
    	countdownTimer.string = '' + s;
    };
    
    var pixelIsBearded = function(imageData, x, y) {
    	var pixelIndex = x + imageData.width * y;
    	return imageData.data[pixelIndex * 4] === 0;
    };
    
    var computeBeardScore = function() {
    	// sample pixels, count the number filled in
    	var imageData = ctx.getImageData(0, 0, 240, 150);
    	var beardScore = 0;
    	var n = 5000;
    	for (var i = 0; i < n; i++) {
    		var x = Math.floor(Math.random() * 240);
    		var y = Math.floor(Math.random() * 150);
    		if (pixelIsBearded(imageData, x, y)) {
    			beardScore++;
    		}
    	}
    	beardScore /= n;
    	return beardScore * 8 * 7;
    };
	
	this.behavior = {
		onDisplaying: function(container) {
			this.sound = new Sound( this.soundUrl );
			Sound.volume = 1.0;
		    container.time = 0;
			container.interval = 100;
			container.duration = Abilities.countdowns.wis;
			redrawFace();
			setCountdownTimer(container.duration, container.time);
			container.start();
		},
		onTimeChanged: function(container) {
			setCountdownTimer(container.duration, container.time);
		},
		onFinished: function(container) {
			var reading = computeBeardScore();
			trace("wis: " + reading + "\n");
			PlayerData.wis = Abilities.threshold(reading, 'wis');
			container.invoke(new Message('/wis/results'));
		},
		onTouchBegan: function(container, id, x, y, ticks) {
		    var p = new Point2D(x, y).relativeTo(beardDisplay);
			ctx.strokeStyle = '#000';
		    ctx.lineWidth = 5;
		    ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
		},
		onTouchMoved: function(container, id, x, y, ticks) {
            var p = new Point2D(x, y).relativeTo(beardDisplay);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
        },
        onTouchEnded: function(container, id, x, y, ticks) {
            var p = new Point2D(x, y).relativeTo(beardDisplay);
            ctx.stroke();
        }
	};
};
ClassUtils.subclass(WisTestPage, Page);

module.exports = new WisTestPage();