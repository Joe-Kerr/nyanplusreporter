var join = require("path").join;
var supportsColor = require("supports-color");
var player = require("node-wav-player");
var mocha = require("mocha");
var Base = mocha.reporters.Base;
var Nyan = mocha.reporters.Nyan;

function NyanPlus(runner) {
	"use strict";
	
	Nyan.call(this, runner);
	
	var _this = this;
	
	this.realDeal;
	this.hiddenFromNyanCat = [];
	this.fixedRainbowColors = [31,32,33,34,35,36];
	this.playInterval;
	this.whereNyanCatLives = join(__dirname, "../media/Nyan_Cat_min_loop.wav");
	this.duration = 26000;//3:26 || 0:26
	this.sigintListener = null;
	
	console.log("\n"); //prevents Nyan Cat hurting its cute little head
	
	runner.on("start", function() {
		_this.onStart();
	});

	runner.on("end", function() {
		_this.onEnd();
	});
	
	//Ctrl-C	
	process.on("SIGINT", function () {
		_this.onSIGINT();
	});		
		
	if(process.platform === "win32") {
		var rl = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.on("SIGINT", function () {
			process.emit("SIGINT");
		});
		
		this.sigintListener = rl;
	}
}

NyanPlus.prototype.overrideConsole = function(buffer) {
	if(!(buffer instanceof Array)) {
		throw new Error("Parameter 'buffer' of overrideConsole must be an Array");
	}
	
	this.realDeal = console.log;
	
	["log", "warn", "info", "error"].forEach(function(type) {
		var log = console[type];
		console[type] = function() {
			buffer.push(Array.prototype.slice.call(arguments));
		};	
	});		
}

NyanPlus.prototype.restoreConsole = function() {
	console.log = this.realDeal;
	console.error = console.log;
	console.info = console.log;
	console.warn = console.log;
	
	if(typeof console.log !== "function" || console.log.toString().indexOf("[native code]") === -1) {
		throw new Error("Failed to restore console. Did you override 'this.realDeal'?");
	}
}

NyanPlus.prototype.flushConsole = function(buffer) {
	if(!(buffer instanceof Array)) {
		throw new Error("Parameter 'buffer' of flushConsole must be an Array");
	}
	
	var i,ii; 
	
	for(i=0, ii=buffer.length; i<ii; i++) {
		console.log.apply(null, buffer[i])
	}	
	buffer.splice(0, buffer.length);
}

NyanPlus.prototype.onStart = function() {
	var _this = this;
	
	this.overrideConsole(this.hiddenFromNyanCat);
	this.play();
	this.playInterval = setInterval(function() {
		_this.restart();			
	}, this.duration);
}

NyanPlus.prototype.onEnd = function() {
	this.restoreConsole();
	console.log("\n"); //Nyan Cat flies!
	this.flushConsole(this.hiddenFromNyanCat);
	
	this.stop();
	if(this.sigintListener != null) this.sigintListener.close();
}

NyanPlus.prototype.onSIGINT = function() {
    Base.cursor.show();
    for(var i=0; i<this.numberOfLines; i++) {
      process.stdout.write("\n");
    }	
	this.onEnd(); 
	if(process.listenerCount("SIGINT") === 1) {
		process.exit(130); //http://tldp.org/LDP/abs/html/exitcodes.html
		//process.exit();	//or just, #TODO?
	}
}

NyanPlus.prototype.play = function() {
	var isFile = require("fs").existsSync;
	
	if(!isFile(this.whereNyanCatLives)) {
		throw new Error("Nyan cat audio file does not exist at: "+this.whereNyanCatLives);
	}
	
	var _this = this;
	player.play({
		path: _this.whereNyanCatLives
	})
	.catch(function(error) {
		console.error("wav player error: "+error);
	});		
}

NyanPlus.prototype.stop = function() {
	clearInterval(this.playInterval);
	player.stop();
}

NyanPlus.prototype.restart = function() {
	player.stop();
	this.play();
}

//Override to fix color issue (https://stackoverflow.com/questions/32742865/no-console-colors-if-using-npm-script-inside-a-git-bash-mintty)
NyanPlus.prototype.rainbowify = function(str) {
	if(!Base.useColors)
		return str;

	if(supportsColor.stdout !== false && supportsColor.stdout.level > 1) 
		return Nyan.prototype.rainbowify.call(this, str);

	var color = this.fixedRainbowColors[this.colorIndex % this.fixedRainbowColors.length];
	this.colorIndex += 1;		
	return '\u001b[' + color + 'm' + str + '\u001b[0m';
};

mocha.utils.inherits(NyanPlus, Nyan); //<-- !!!

module.exports = NyanPlus;