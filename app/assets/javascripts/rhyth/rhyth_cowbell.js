rhyth = rhyth || {};

rhyth.cowbellBuilder = function(outputConnection){

	var cowbell = cowbell || {};

	// index
	// *1* params & main output
	// *2* resoHead
	// *3* beaterHead
	// *4* master trigger function
	
	// ************************
	// *1* params & main output
	// ************************

	// set up output node w/ lowpass filtering, and merger node to join the three sections together
	cowbell.output = ctx.filterBuilder(outputConnection, 8000.0, "highpass", 0.75);

	// set up paramaters interface
	cowbell.params = {}
	cowbell.params.oscillators = {
		tuning: ctx.paramBuilder(40.0, 160.0),
		osc1Loudness: ctx.paramBuilder(0.000001, 1.0),
		osc2Loudness: ctx.paramBuilder(0.000001, 1.0)
	}
	cowbell.params.character = {
		decay: ctx.paramBuilder(25.0, 5000.0),
		tone: ctx.paramBuilder(1000.0, 6000.0),
	};
	

	// ******************************
	// *2* filter, output & envelopes
	// ******************************

	cowbell.output = ctx.gainBuilder(outputConnection);

	cowbell.filter = ctx.filterBuilder(cowbell.filters.strike.output, 8000.0, "bandpass", 0.75, 1.0);



	//trig method
	cowbell.filters.trig = function(velocity, time){
		
		var vca = 
		
		// attack
		vca.setValueAtTime(strikeParams.loudness.calc(velocity), time);
		filter.setValueAtTime(strikeParams.tone.calc(velocity), time);

		
		// decay
		ctx.envelopeBuilder(time, (cowbell.params.character.decay.calc(velocity)/1000), 0.0000001, vca);

	}

	// ***************
	// *3* oscillators 
	// ***************

	cowbell.oscillators = {};
	cowbell.oscillators.output = ctx.gainBuilder(cowbell.filters.sizzle.filter, 1.0);
	cowbell.oscillators.output.connect(cowbell.filters.strike.filter);

	cowbell.oscillators.osc1 = ctx.oscillatorBuilder(cowbell.oscillators.output, 40, 'square');
	cowbell.oscillators.osc2 = ctx.oscillatorBuilder(cowbell.oscillators.output, 40, 'square');
	cowbell.oscillators.osc3 = ctx.oscillatorBuilder(cowbell.oscillators.output, 40, 'square');
	cowbell.oscillators.osc4 = ctx.oscillatorBuilder(cowbell.oscillators.output, 40, 'square');
	cowbell.oscillators.osc5 = ctx.oscillatorBuilder(cowbell.oscillators.output, 40, 'square');
	cowbell.oscillators.osc6 = ctx.oscillatorBuilder(cowbell.oscillators.output, 40, 'square');


	//trig method
	cowbell.oscillators.trig = function(velocity, time){

		// get scaled variables
		var basePitch = cowbell.params.oscillators.tuning.calc(velocity);
		var scale = cowbell.params.oscillators.shimmer.calc(velocity);
		var offset = cowbell.params.oscillators.ring.calc(velocity);
		
		for (var i = 1; i <= 6; i++){
			var frequency = ( basePitch * ( (scale*i) + (offset * (6-i) ) ) );
			cowbell.oscillators["osc"+i].frequency.setValueAtTime(frequency, time)
		}

	}

	// *************************
	// *4* master trig function 
	// *************************

	cowbell.trig = function(velocity, time){
		cowbell.oscillators.trig(velocity, time);
		cowbell.filters.trig(velocity, time);
	}

	//  *5* build gui, sequencer and load/save

	cowbell.sequencer = rhyth.sequencerBuilder(cowbell);
	rhyth.GUIBuilder(cowbell);
	rhyth.loadAndSaveBuilder(cowbell);

 return cowbell;

};