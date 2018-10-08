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

	console.log("\n"); //prevents Nyan Cat hurting its cute little head
	
	runner.on("start", function() {
		_this.onStart();
	});

	runner.on("end", function() {
		_this.onEnd();
	});
		
	//#TODO: Never triggered :(
	//process.once("SIGINT", function() { if(_this.hiddenFromNyanCat.length > 0) _this.flushConsole(_this.hiddenFromNyanCat) }); //Ctrl-C	
}

NyanPlus.prototype.overrideConsole = function(buffer) {
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
}

NyanPlus.prototype.flushConsole = function(buffer) {
	var i,ii; 
	for(i=0, ii=buffer.length; i<ii; i++) {
		console.log.apply(null, buffer[i])
	}	
	buffer = [];
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
}

NyanPlus.prototype.play = function() {
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