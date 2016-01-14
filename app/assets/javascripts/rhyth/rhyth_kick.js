var kick = kick || {};

// index
// *1* params & main output
// *2* resoHead
// *3* beaterHead
// *4* shell
// *5* master trigger function

// ************************
// *1* params & main output
// ************************

// set up paramaters interface
kick.params = {}
kick.params.beaterHead = {
	tuning: ctx.paramBuilder(1.0, 6.0),
	stiffness: ctx.paramBuilder(1.0, 4.0),
	material: ctx.paramBuilder(1.0, 1.5),
	mix: ctx.paramBuilder(0.00001, 1.0)
};
kick.params.resoHead = {
	tuning: ctx.paramBuilder(20.0, 80.0),
	decay: ctx.paramBuilder(75.0, 500.0),
	stiffness: ctx.paramBuilder(35.0, 350.0),
	mix: ctx.paramBuilder(0.00001, 1.0)
}
kick.params.shell = {
	resonance: ctx.paramBuilder(0.0, 0.75),
	material: ctx.paramBuilder(40.0, 160.0)
}

// set up output node w/ lowpass filtering, and merger node to join the three sections together
kick.output = ctx.filterBuilder(rhyth.output, 1000.0, "lowpass", 0.1);

// *************
// *2* resoHead
// *************

kick.resoHead = {};
// create vca and connect to output
kick.resoHead.vca = ctx.gainBuilder(kick.output);
//oscillator
kick.resoHead.vco = ctx.oscillatorBuilder(kick.resoHead.vca, 20, 'sine');

//trig method
kick.resoHead.trig = function(velocity, time){

	// get scaled variables
	var params = kick.params.resoHead
	var tuning = params.tuning.calc(velocity);
	var decay = params.decay.calc(velocity)/1000;
	var mix = params.mix.calc(velocity);
	var stiffness = params.stiffness.calc(velocity)/1000;
	var pitchEnvStart = tuning * kick.params.beaterHead.tuning.calc(velocity);
	// get the gainNode and oscillatorNode we need to apply envelopes to
	var vca = kick.resoHead.vca.gain;
	var vco = kick.resoHead.vco.frequency;

	// clear any still running envelopes
	vca.cancelScheduledValues(time);
	vco.cancelScheduledValues(time);
	
	// attack
	vca.setValueAtTime(mix, time);
	vco.setValueAtTime(pitchEnvStart, time);

	// decay
	vca.exponentialRampToValueAtTime(0.0000001, time + decay);
	vco.exponentialRampToValueAtTime(tuning, time + stiffness);
}

// ***************
// *2* beaterHead 
// ***************

kick.beaterHead = {};
// create vca and connect to output
kick.beaterHead.vca = ctx.gainBuilder(kick.output);
kick.beaterHead.beater = {}
// shortcut for readability
var output = kick.beaterHead.vca

// create the six oscillators
kick.beaterHead.beater.osc1 = ctx.oscillatorBuilder(output, 20, 'sine');
kick.beaterHead.beater.osc2 = ctx.oscillatorBuilder(output, 20, 'sine');
kick.beaterHead.beater.osc3 = ctx.oscillatorBuilder(output, 20, 'sine');
kick.beaterHead.beater.osc4 = ctx.oscillatorBuilder(output, 20, 'sine');
kick.beaterHead.beater.osc5 = ctx.oscillatorBuilder(output, 20, 'sine');
kick.beaterHead.beater.osc6 = ctx.oscillatorBuilder(output, 20, 'sine');

//trig method
kick.beaterHead.trig = function(velocity, time){
	// get scaled variables
	var material = kick.params.beaterHead.material.calc(velocity);
	var mix = kick.params.beaterHead.mix.calc(velocity);
	var basePitch = kick.params.resoHead.tuning.calc(velocity) * kick.params.beaterHead.stiffness.calc(velocity);
	// shortcut to vca
	var vca = kick.beaterHead.vca.gain;
	// schedule pitch changes for beater emulator 10ms before hit
	for (var i = 1; i <= 6; i++){
		this.beater["osc"+i].frequency.setValueAtTime(basePitch*((i*material)+1), time-0.01)
	}

	// attack
	vca.setValueAtTime(mix, time);
	// decay (always 50ms for beater)
	vca.exponentialRampToValueAtTime(0.0000001, time + 0.05);

}

// *********
// *4* shell ### behaving strange
// *********

kick.shell = {};


kick.shell.bandpass2 = ctx.filterBuilder(kick.output, 160, 'bandpass', 0.9, 0.9);
kick.shell.bandpass1 = ctx.filterBuilder(kick.shell.bandpass2, 160, 'bandpass', 0.9, 0.9);
kick.shell.delay = ctx.delayBuilder(kick.shell.bandpass1, 1, 0.2);
kick.shell.feedback = ctx.gainBuilder(kick.shell.delay, 0.5);
kick.shell.bandpass2.connect(kick.shell.feedback);


//trigger function
kick.shell.trig = function(velocity, time){
	// shortcuts to nodes
	var bp1 = kick.shell.bandpass1.frequency;
	var bp2 = kick.shell.bandpass2.frequency;
	// get scaled values
	var resonance = kick.params.shell.resonance.calc(velocity);
	var material = kick.params.shell.material.calc(velocity);

	// // set values
	kick.shell.feedback.gain.setValueAtTime(resonance, time);
	bp1.setValueAtTime(material, time);
	bp2.setValueAtTime(material, time);
}

// ***************************
// *5* master trigger function
// ***************************

kick.trig = function(velocity, time){
	kick.resoHead.trig(velocity, time);
	kick.beaterHead.trig(velocity, time);
	kick.shell.trig(velocity, time);
}
