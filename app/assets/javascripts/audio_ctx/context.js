
var ctx = ctx || {};
ctx.context = new (window.AudioContext || window.webkitAudioContext)()

// index
// *1* webAudioAPI builders
// *2* audioConext query helpers
// *3* channel & mixer set up
// *4* master-clock
// *5* master save and load functions

// ************************
// *1* webAudioAPI builders
// ************************

ctx.paramBuilder = function(minIn, maxIn){
	return {
		range: {
			max: 60,
			min: 40
		},
		absoluteMaximum: maxIn,
		absoluteMinimum: minIn,
		calc: function(velocity){
			var precentage = (((this.range.max-this.range.min)*(velocity/100))+this.range.min)/100
			return ((this.absoluteMaximum - this.absoluteMinimum)*precentage)+this.absoluteMinimum
		}
	}
};

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

ctx.envelopeBuilder = function(start, decay, target){
	for (var i=1; i <= 8; i++){
		var envelopeEndValue = target * ( Math.exp(-i/8) );
		var envelopeEndTime = start + (decay/8);
		target.linearRampToValueAtTime(envelopeEndValue, envelopeEndTime);
		target.setValueAtTime(envelopeEndValue, envelopeEndTime);
	}
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
ctx.output = ctx.context.destination
ctx.leftOut = ctx.gainBuilder(ctx.output, 1);
ctx.rightOut = ctx.gainBuilder(ctx.output, 1);

ctx.channel1 = ctx.gainBuilder(ctx.leftOut, 1);
ctx.channel1.connect(ctx.rightOut);
ctx.channel2 = ctx.gainBuilder(ctx.leftOut, 1);
ctx.channel2.connect(ctx.rightOut);
ctx.channel3 = ctx.gainBuilder(ctx.leftOut, 1);
ctx.channel3.connect(ctx.rightOut);
ctx.channel4 = ctx.gainBuilder(ctx.leftOut, 1);
ctx.channel4.connect(ctx.rightOut);

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
	setInterval(function(){ctx.clock.continue()}, ctx.clock.timeoutInterval-75);
	ctx.clock.runAll();
}

ctx.clock.runAll = function(){
	rhyth.run();
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

ctx.clock.stopAll = function(){
	rhyth.stop();
}

// *5* master save & load functions

ctx.save = function(){
	var data = {};
	data.rhyth = rhyth.save();
	data.bpm = ctx.clock.bpm
	return data;
}

ctx.load = function(data){
	rhyth.load(data.rhyth);
	ctx.clock.bpm = data.bpm;
}
