//@module

var Abilities = require('./lib/Abilities');
var ClassUtils = require('./lib/ClassUtils');
var Maze = require('./lib/Maze');
var PlayerData = require('./lib/PlayerData');
var Point2D = require('./lib/Point2D');

var Bar = require('./bar');
var Page = require('./Page');
var PageController = require('./PageController');

var DexTestPage = function DexTestPage(data) {
	Page.call(this, {
		subtitle: 'Dexterity Test'
	});
	
	var countdownTimer = new Label({top: 10, left: 0, right: 0}, null, Theme.titleStyle,
	   '');
    this.layout.add(countdownTimer);
	
	var mazeCanvas = {
	   left: 40,
	   top: 10,
	   right: 40,
	   width: 245,
	   height: 140
	};
	var mazeDisplay = new Canvas(mazeCanvas);
	this.layout.add(mazeDisplay);
	
	var ctx = mazeDisplay.getContext('2d');
	var cols = 7;
	var rows = 4;
	var startCell = {x: 0, y: 0};
	var finishCell = {x: cols - 1, y: rows - 1}; 
	var pad = 2;
	
	
    var setCountdownTimer = function(duration, time) {
    	var ms = duration - time;
    	var s = Math.ceil(ms / 1000);
    	countdownTimer.string = '' + s;
    	if(ms < 900 && !this.behavior.played) {
    		this.behavior.sound.play();
    		this.behavior.played = true;
    	}
    }.bind(this);
    
    var computeDexScore = function(duration, time, finalPosition) {
    	if(time == duration) {
    		// they didn't finish the maze :(
    		var xDist = finalPosition.x - mazeCanvas.width;
    		var yDist = finalPosition.y - mazeCanvas.height;
    		var distFromGoal = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    		trace(distFromGoal + "\n");
    		return Math.min(Math.max(1, 7 - (distFromGoal/40)), 5);
    	} else {
    	    // they did finish!  yay!
        	var rawDex = Math.round(14 * (1 - time / duration));
        	return Math.min(Math.max(rawDex, 6), 7);
        }
    };
	
	ctx.strokeStyle = '#f00';
	ctx.lineWidth = 6;
	this.behavior = {
		wasHittingWall: false,
		validDrag: false,
		maze: null,
		finalPos: {x: 0, y: 0},
		played: false,
		soundUrl: mergeURI( application.url, "./assets/whip.wav" ),
		sound: null,
		onDisplaying: function(container) {
			this.sound = new Sound( this.soundUrl );
			Sound.volume = 1.0;
			this.finalPos.x = 0;
			this.finalPos.y = 0;
		    this.wasHittingWall = false;
		    this.validDrag = false;
		    this.maze = Maze.generate(cols, rows, startCell);
			this.maze.draw(mazeDisplay, ctx, startCell, finishCell, pad);
		    container.time = 0;
			container.interval = 100;
			container.duration = Abilities.countdowns.dex;
			setCountdownTimer(container.duration, container.time);
			container.start();
		},
		onTimeChanged: function(container) {
			setCountdownTimer(container.duration, container.time);
		},
		onFinished: function(container) {
		    var reading = computeDexScore(
		      container.duration,
		      container.time,
		      this.finalPos);
		    trace("dex: " + container.time + " .. (" + this.finalPos.x + ", " + this.finalPos.y + ")\n");
		    PlayerData.dex = Abilities.threshold(reading, 'dex');
			container.invoke(new Message('/dex/results'));
		},
		onTouchBegan: function(container, id, x, y, ticks) {
		    var p = new Point2D(x, y).relativeTo(mazeDisplay);
		    if (!this.maze.pointInCell(mazeDisplay, pad, p, startCell)) {
		        return this.onTouchEnded(container, id, x, y, ticks);
		    }
		    this.validDrag = true;
		    ctx.beginPath();
		    ctx.moveTo(p.x, p.y);
		},
		onTouchMoved: function(container, id, x, y, ticks) {
		    if (!this.validDrag) {
		        return;
		    }
		    var p = new Point2D(x, y).relativeTo(mazeDisplay);
		    if (this.maze.pointInCell(mazeDisplay, pad, p, finishCell)) {
		        return this.onFinished(container);
		    }
		    var hittingWall = this.maze.pointHitsWall(mazeDisplay, pad, p);
		    if (hittingWall && !this.wasHittingWall) {
		        return this.onTouchEnded(container, id, x, y, ticks);
		    }
		    this.wasHittingWall = hittingWall;
		    ctx.lineTo(p.x, p.y);
		    ctx.stroke();
		    ctx.beginPath();
		    ctx.moveTo(p.x, p.y);
		    this.finalPos.x = p.x;
		    this.finalPos.y = p.y;
		},
		onTouchEnded: function(container, id, x, y, ticks) {
		    var p = new Point2D(x, y).relativeTo(mazeDisplay);
		    this.wallsHit = 0;
		    this.wasHittingWall = false;
            this.validDrag = false;
		    ctx.stroke();
		    this.maze.draw(mazeDisplay, ctx, startCell, finishCell, pad);
		}
	};
};
ClassUtils.subclass(DexTestPage, Page);

module.exports = new DexTestPage();