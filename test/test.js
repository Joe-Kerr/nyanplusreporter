const assert = require("assert");
const proxyquire = require("proxyquire").noCallThru();;

const supportsColor = {stdout: {level: 2}};
const Sample = proxyquire("../src/nyanPlus.js", {"supports-color": supportsColor});

const os = process.platform;
const version = require("os").release().split(".");

const fakeRunner = {
	on: ()=>{},
	once: ()=>{}
};

const sample = new Sample(fakeRunner);

function testConsoleOverride(refBuffer, refSample) {
	refSample.overrideConsole(refBuffer);
	console.log("log");
	console.error("error");
	console.warn("warn");
	console.info("info");	
}

suite("NyanPlus tests");

test("Has base nyan methods", ()=>{
	assert.ok(typeof sample.drawNyanCat !== "undefined");
});

test("More awesome rainbow is used", ()=>{
	assert.equal(sample.rainbowify("nyan"), '\u001b[38;5;' + 154 + 'm' + "nyan" + '\u001b[0m'); 
	
	sample.colorIndex = 0;
});

test("Substitute rainbow is used", ()=>{
	supportsColor.stdout.level = 1
	assert.equal(sample.rainbowify("nyan"), '\u001b[' + 31 + 'm' + "nyan" + '\u001b[0m'); 
	
	supportsColor.stdout = false;
	assert.equal(sample.rainbowify("nyan"), '\u001b[' + 32 + 'm' + "nyan" + '\u001b[0m'); 
	
	sample.colorIndex = 0;
});

test("Calls to console are captured", ()=>{
	let buffer = [];

	testConsoleOverride(buffer, sample)
	assert.equal(buffer.length, 4);
	sample.restoreConsole();
});

test("Console is restored", ()=>{
	let buffer = [];
	testConsoleOverride(buffer, sample)
	
	sample.restoreConsole();
	console.log(".");
	assert.equal(buffer.length, 4);	
});

test("Console buffer is flushed", ()=>{
	let buffer = [];
	sample.overrideConsole(buffer);
	console.log(".");
	
	sample.restoreConsole();
	sample.flushConsole(buffer);
	
	assert.equal(buffer.length, 0);
});

//At least on Win7, child-process close event not emitted which makes the sync option useless and hence automatic testing a bit difficult. On Win10, it works. 
if(os !== "win32" || version[0] >= 10) {
	test("Audio played.", function() {
		this.timeout(6000);
		
		const player = require("node-wav-player");
		const {join} = require("path");
		
		const start = Date.now();
		return new Promise((resolve, reject)=>{
			player.play({
				path: join(__dirname, "./Nyan_Cat_unit_test.wav"), sync: true
			})	
			.then(()=>{	
				(Date.now() - start > 3000) ? assert.ok(true) : assert.ok(false);
				player.stop();
				return resolve("yay");
			})
			.catch(function(error) {		
				return reject("boo");
			});	
		
		});
	})
}
else
	test("Audio probably played");

test("Ctrl-c flushes console buffer", ()=>{	
	sample.overrideConsole(sample.hiddenFromNyanCat);
	console.log(".");	
	
	assert.equal(sample.hiddenFromNyanCat.length, 1);
	
	process.once("SIGINT", ()=>{
		assert.equal(sample.hiddenFromNyanCat.length, 0);
	});
	
	process.emit("SIGINT");
});