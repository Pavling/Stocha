rhyth = rhyth || {};

rhyth.kickBuilder = function(outputConnection){

	var kick = kick || {};

	// index
	// *1* params & main output
	// *2* resoHead
	// *3* beaterHead
	// *4* master trigger function
	// *5* gui drawer and listeners
	// *6* save & load functions

	// ************************
	// *1* params & main output
	// ************************

	// set up output node w/ lowpass filtering, and merger node to join the three sections together
	kick.output = ctx.filterBuilder(outputConnection, 500.0, "lowpass", 0.5);

	// set up paramaters interface
	kick.params = {}
	kick.params.resoHead = {
		tuning: ctx.paramBuilder(20.0, 100.0),
		slack: ctx.paramBuilder(35.0, 450.0),
		decay: ctx.paramBuilder(75.0, 600.0),
		mix: ctx.paramBuilder(0.00001, 1.0)
	}
	kick.params.beaterHead = {
		tuning: ctx.paramBuilder(1.0, 4.0),
		slack: ctx.paramBuilder(2.3, 0.4),
		material: ctx.paramBuilder(0.5, 2.0),
		mix: ctx.paramBuilder(0.00001, 1.0)
	};

	kick.keysIndex = (function(){
		var indexOfKeys = {};
		$.each(kick.params, function(key, paramsObj){
			indexOfKeys[key] = [];
			$.each(paramsObj, function(subKey, storedParams){
				indexOfKeys[key].push(subKey);
			});
		});
		return indexOfKeys;
	})();

	kick.params.load = function(data){
		$.each(data, function(paramGroupKey, paramGroupObject){
			$.each(paramGroupObject, function(paramNameKey, paramValues){
				var convertedValues = {max: parseFloat(paramValues.max), min: parseFloat(paramValues.min)}
				rhyth.kick.params[paramGroupKey][paramNameKey].range = convertedValues
			})
		})
	}

	kick.sequencer = rhyth.sequencerBuilder(kick)

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
		var slack = params.slack.calc(velocity)/1000;
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
		vca.linearRampToValueAtTime(0.0000001, time + decay);
		vco.linearRampToValueAtTime(tuning, time + slack);
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
		var basePitch = kick.params.resoHead.tuning.calc(velocity) * kick.params.beaterHead.slack.calc(velocity);
		// shortcut to vca
		var vca = kick.beaterHead.vca.gain;
		// schedule pitch changes for beater emulator
		for (var i = 1; i <= 6; i++){
			this.beater["osc"+i].frequency.setValueAtTime(basePitch*((i*material)+1), time)
		}
		// attack
		vca.setValueAtTime(mix, time);
		// decay (always 50ms for beater)
		vca.linearRampToValueAtTime(0.0000001, time + 0.03);

	}

	// *************************
	// *4* master trig function 
	// *************************

	kick.trig = function(velocity, time){
		kick.resoHead.trig(velocity, time);
		kick.beaterHead.trig(velocity, time);
	}

	// *************************
	// *5* gui drawer and binder
	// *************************

	kick.gui = {};

	kick.gui.drawSliders = function() {
	   $( ".param-slider" ).slider({
	     range: true,
	     min: 0,
	     max: 100,
	     slide: function(event, ui) {
	      var target = $(ui.handle.parentNode).data();
	      var values = ui.values
	      kick.params[target.superParam][target.subParam].range.min = ui.values[0];
	     	kick.params[target.superParam][target.subParam].range.max = ui.values[1];
	     }
	   });
	 };

 kick.gui.linkSlidersToParams = function(){
 	var collectionIndex = 0;
 	var sliderIndex = 0;
	$.each(kick.keysIndex, function(superParamKey, subParamArray){
		$('#collection-'+ collectionIndex +'-title').text(superParamKey);
		$.each(subParamArray, function(index, subParamKey){
			kick.gui.setAndTitleSlider(superParamKey, subParamKey, collectionIndex, sliderIndex);
			sliderIndex++;
		});
		sliderIndex = 0;
		collectionIndex++;
	});
 };

 kick.gui.setAndTitleSlider = function(superParamKey, subParamKey, collectionIndex, sliderIndex){
 	var id = collectionIndex + "-" + sliderIndex + "-"
 	$('#'+id+"title").text(subParamKey)
 	$('#'+id+"slider").attr({'data-super-param': superParamKey, 'data-sub-param': subParamKey});
 	var setMin = kick.params[superParamKey][subParamKey].range.min;
 	var setMax = kick.params[superParamKey][subParamKey].range.max ;
 	$('#'+id+"slider").slider('values', [setMin, setMax]);
 };

 kick.gui.updateSliders = function(){

 }

 	// *************************
 	// *6* save & load functions
 	// *************************

	kick.saveParams = function(){
		var params = {};
		$.each(kick.params, function(key, storedObj){
			params[key] = {};
			$.each(storedObj, function(subKey, value){
				//begin of each for sub param
					var max = value.range.max 
					var min = value.range.min
					params[key][subKey] = {max: max, min: min}
				//end of each for sub param
			})
		})
		return params
	}	

 	kick.save = function(){
 		var data = {};
 		data.params = kick.saveParams();
 		data.sequencer = kick.sequencer.save();
 		return data;
 	}

 	kick.load = function(data){
 		kick.params.load(data.params);
 		kick.sequencer.load(data.sequencer);
 	}


 return kick;

};