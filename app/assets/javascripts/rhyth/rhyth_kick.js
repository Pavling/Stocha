var kick = kick || {};

kick.ctx = ctx;

// set up paramaters interface
kick.params = {}
kick.params.batterHead = {
	tuning: rhyth.paramBuilder(1.0, 4.0),
	stiffness: rhyth.paramBuilder(1.0, 3.0),
	material: rhyth.paramBuilder(1.0, 1.5),
	mix: rhyth.paramBuilder(0.00001, 1.0)
};
kick.params.resoHead = {
	tuning: rhyth.paramBuilder(20.0, 80.0),
	decay: rhyth.paramBuilder(75.0, 500.0),
	stiffness: rhyth.paramBuilder(35.0, 350.0),
	mix: rhyth.paramBuilder(0.00001, 1.0)
}
kick.params.shell = {
	resonance: rhyth.paramBuilder(0.0, 0.9),
	material: rhyth.paramBuilder(40.0, 160.0)
}

// set up output node
kick.output = kick.ctx.context.createChannelMerger(3);

// set up resoHead section of voice
kick.resoHead = {};
// create vca and connect to output
kick.resoHead.vca = kick.ctx.context.createGain();
kick.resoHead.vca.value = 0.0;
kick.resoHead.vca.connect(kick.output);
//oscillator
kick.resoHead.vco = kick.ctx.context.createOscillator();
kick.resoHead.vco.type = 'sine'
kick.resoHead.vco.frequency.value = 20.0
kick.resoHead.vco.start();
//connect vco to vca
kick.resoHead.vco.connect(kick.resoHead.vca);

//trig method
kick.resoHead.trig = function(velocity){
	var now = kick.ctx.now;

	kick.params.resoHead = {
		tuning: rhyth.paramBuilder(20.0, 80.0),
		decay: rhyth.paramBuilder(75.0, 500.0),
		stiffness: rhyth.paramBuilder(35.0, 350.0),
		mix: rhyth.paramBuilder(0.00001, 1.0)
	}

	// clear any still running envelopes
	this.vca.cancelScheduledValues(now);
	this.vco.frequency.cancelScheduledValues(now);
	
	// attack
		// ***check batter head for this value ***
	// this.vco.frequency.value = kick.params.resoHead.tuning.calc(velocity);
		// ***check batter head for this value ***
	this.vca.gain.value = kick.params.resoHead.mix.calc(velocity);

	// decay
	this.vco.frequency.exponentialRampToValueAtTime(kick.params.resoHead.tuning.calc(velocity), (now + (kick.params.resoHead.stiffness.calc(velocity))/1000));
	this.vca.gain.exponentialRampToValueAtTime(0.00001, now + (kick.params.resoHead.decay.calc(velocity)/1000));
}

// set up resoHead section of voice
kick.batterHead = {};
// create vca and connect to output
kick.batterHead.vca = kick.ctx.context.createGain();
kick.batterHead.vca.value = 0.0;
kick.batterHead.vca.connect(kick.output);
//oscillator
kick.batterHead.vco = kick.ctx.context.createOscillator();
kick.batterHead.vco.type = 'sine'
kick.batterHead.vco.frequency.value = 20.0
kick.batterHead.vco.start();
//connect vco to vca
kick.batterHead.vco.connect(kick.batterHead.vca);

//trig method
kick.batterHead.trig = function(velocity){
	// var now = kick.ctx.now;

	// // clear any still running envelopes
	// this.vca.cancelScheduledValues(now);
	// this.vco.frequency.cancelScheduledValues(now);
	
	// // attack
	// 	// ***check batter head for this value ***
	// // this.vco.frequency.value = kick.params.resoHead.tuning.calc(velocity);
	// 	// ***check batter head for this value ***
	// this.vca.gain.value = kick.params.resoHead.mix.calc(velocity);

	// // decay
	// this.vco.frequency.exponentialRampToValueAtTime(kick.params.resoHead.tuning.calc(velocity), (now + (kick.params.resoHead.stiffness.calc(velocity))/1000));
	// this.vca.gain.exponentialRampToValueAtTime(0.00001, now + (kick.params.resoHead.decay.calc(velocity)/1000));
}