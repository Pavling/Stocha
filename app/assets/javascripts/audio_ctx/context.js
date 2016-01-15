
var ctx = ctx || {};
ctx.context = new (window.AudioContext || window.webkitAudioContext)()

// index
// *1* webAudioAPI builders
// *2* audioConext query helpers
// *3* channel & mixer set up
// *4* master-clock

// ************************
// *1* webAudioAPI builders
// ************************

ctx.paramBuilder = function(minIn, maxIn){
	return {
		range: {
			max: maxIn,
			min: minIn
		},
		absoluteMaximum: maxIn,
		absoluteMinimum: minIn,
		calc: function(velocity){
			return ((this.range.max-this.range.min)*(velocity/100))+this.range.min
		}
	}
};

// not sure why the or values have to be in here to shut it up
ctx.filterBuilder = function(connection, freq, topology, res, gain){
	var filter = this.context.createBiquadFilter();
	filter.frequency.value = freq || 350.0;
	filter.type = topology || "lowpass";
	filter.q = res || 0.3;
	filter.gain = gain;
	filter.connect(connection);
	return filter;
};

ctx.oscillatorBuilder = function(connection, start_freq, wave){
	var osc = this.context.createOscillator();
	osc.frequency.value = start_freq;
	osc.type = wave
	osc.connect(connection);
	osc.start();
	return osc
}

ctx.gainBuilder = function(connection, initial_gain){
	var gain = this.context.createGain();
	gain.connect(connection);
	gain.gain.value = initial_gain || 0;
	return gain
}

ctx.mergerBuilder = function(connection, channels){
	var merger = this.context.createChannelMerger(channels);
	merger.connect(connection);
	return merger
}

ctx.delayBuilder = function(connection, max_time, initial_time){
	var delay = this.context.createDelay(max_time);
	delay.delayTime.value = initial_time
	delay.connect(connection);
	return delay
}

// *****************************
// *2* audioConext query helpers
// *****************************

ctx.now = function(){
	return this.context.currentTime;
}

// **************************
// *3* channel & mixer set up
// **************************
ctx.output = ctx.mergerBuilder(ctx.context.destination, 2)
ctx.leftOut = ctx.gainBuilder(ctx.output, 1);
ctx.rightOut = ctx.gainBuilder(ctx.output, 1);

ctx.channel1 = ctx.gainBuilder(ctx.leftOut, 1);
ctx.channel1.connect(ctx.leftOut);
ctx.channel2 = ctx.gainBuilder(ctx.leftOut, 1);
ctx.channel2.connect(ctx.leftOut);
ctx.channel3 = ctx.gainBuilder(ctx.leftOut, 1);
ctx.channel3.connect(ctx.leftOut);
ctx.channel4 = ctx.gainBuilder(ctx.leftOut, 1);
ctx.channel4.connect(ctx.leftOut);

// ****************
// *4* master-clock
// ****************

ctx.clock = {};
ctx.clock.t = 0;
ctx.clock.running = false;
ctx.clock.bpm = 120;
ctx.clock.timeoutInterval = 350;


ctx.clock.interval = function(){
	return (60/ctx.clock.bpm)/4
}

ctx.clock.start = function(){
	ctx.clock.running = true;
	setTimeout(ctx.clock.runAll(), 350);
}

ctx.clock.continue = function(){
	if (ctx.clock.running) {
		setTimeout(function(){ctx.clock.runAll()}, ctx.clock.timeoutInterval);
	}
};
	
ctx.clock.stop = function(){
	ctx.clock.running = false;
	ctx.clock.stopAll();
}

ctx.clock.runAll = function(){
	sequencer.run(); // will need to be updated with run functions for each instrument
	setInterval(function(){ctx.clock.continue()}, ctx.clock.timeoutInterval-75);
}

ctx.clock.stopAll = function(){
	sequencer.stop();
}

