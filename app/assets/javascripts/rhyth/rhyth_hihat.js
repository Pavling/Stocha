rhyth = rhyth || {};

rhyth.hihatBuilder = function(outputConnection){

	var hihat = hihat || {};

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
	hihat.output = ctx.filterBuilder(outputConnection, 6000.0, "highpass", 0.75);

	// set up paramaters interface
	hihat.params = {}
	hihat.params.oscillators = {
		tuning: ctx.paramBuilder(40.0, 80.0),
		shimmer: ctx.paramBuilder(1.0, 2.0),
		ring: ctx.paramBuilder(-0.25, 0.25)
	}
	hihat.params.strike = {
		tone: ctx.paramBuilder(8000.0, 12000.0),
		decay: ctx.paramBuilder(0.25, 0.75),
		mix: ctx.paramBuilder(0.00001, 1.0)
	};
	hihat.params.sizzle = {
		decay: ctx.paramBuilder(75.0, 500.0),
		tone: ctx.paramBuilder(6000.0, 10000.0),
		mix: ctx.paramBuilder(0.00001, 1.0)
	}


	hihat.keysIndex = (function(){
		var indexOfKeys = {};
		$.each(hihat.params, function(key, paramsObj){
			indexOfKeys[key] = [];
			$.each(paramsObj, function(subKey, storedParams){
				indexOfKeys[key].push(subKey);
			});
		});
		return indexOfKeys;
	})();

	hihat.params.load = function(data){
		$.each(data, function(paramGroupKey, paramGroupObject){
			$.each(paramGroupObject, function(paramNameKey, paramValues){
				var convertedValues = {max: parseFloat(paramValues.max), min: parseFloat(paramValues.min)}
				rhyth.hihat.params[paramGroupKey][paramNameKey].range = convertedValues
			})
		})
	}

	hihat.sequencer = rhyth.sequencerBuilder(hihat)

	// ******************************
	// *2* filter, output & envelopes
	// ******************************

	hihat.output = ctx.gainBuilder(rhyth.output, 1.0);

	hihat.filters = {};

	hihat.filters.sizzle = {};
	hihat.filters.sizzle.output = ctx.gainBuilder(hihat.output, 1.0);
	hihat.filters.sizzle.filter = ctx.filterBuilder(hihat.filters.sizzle.output, 6000.0, "highpass", 0.75, 1.0);

	hihat.filters.sizzle = {}
	hihat.filters.sizzle.output = ctx.gainBuilder(hihat.output, 1.0)
	hihat.filters.sizzle.filter = ctx.filterBuilder(hihat.filters.sizzle.output, 6000.0, "highpass", 0.75, 1.0);


	//trig method
	hihat.filters.trig = function(velocity, time){
		// get scaled variables
		var osc1Params = hihat.params.osc1;
		var osc2Params = hihat.params.osc2;

		
		// get the gainNode and oscillatorNode we need to apply envelopes to
		var osc1vca = hihat.oscillators.osc1.vca.gain;
		var osc2vca = hihat.oscillators.osc2.vca.gain;

		var osc1vco = hihat.oscillators.osc1.vco.frequency;
		var osc2vco = hihat.oscillators.osc2.vco.frequency;

		// clear any still running envelopes
		osc1vca.cancelScheduledValues(time);
		osc1vco.cancelScheduledValues(time);

		osc2vca.cancelScheduledValues(time);
		osc2vco.cancelScheduledValues(time);
		
		// attack
		osc1vca.setValueAtTime(osc1Mix, time);
		osc1vco.setValueAtTime(osc1Tuning, time);

		osc2vca.setValueAtTime(osc2Mix, time);
		osc2vco.setValueAtTime(osc2Tuning, time);

		// decay
		osc1vca.exponentialRampToValueAtTime(0.0000001, time + osc1Decay);
		osc2vca.exponentialRampToValueAtTime(0.0000001, time + osc2Decay);
		
	}

	// ***************
	// *3* oscillators 
	// ***************

	hihat.oscillators = {};
	hihat.oscillators.osc1 = ctx.oscillatorBuilder(hihat.oscillators.osc1.vca, 40, 'square');
	hihat.oscillators.osc2 = ctx.oscillatorBuilder(hihat.oscillators.osc2.vca, 50, 'sine');

	hihat.noise = {};

	// create vca and connect filters
	hihat.noise.vca = ctx.gainBuilder(hihat.output);

	hihat.noise.hicut = ctx.filterBuilder(hihat.noise.vca, 2000.0, "lowpass", 0.8, 1.5);
	hihat.noise.locut = ctx.filterBuilder(hihat.noise.hicut, 250.0, "highpass", 0.8, 1.5);

	hihat.noise.noisegen = function(){
		var oneSample = Math.random() * 2 - 1;
		if (oneSample < 0){
			return 0;
		} else {
			return oneSample;
		}
	}

	// create noise wavetable
	hihat.noise.osc = (function(){
			var bufferSize = 2 * ctx.context.sampleRate,
			    noiseBuffer = ctx.context.createBuffer(1, bufferSize, ctx.context.sampleRate),
			    output = noiseBuffer.getChannelData(0);
			for (var i = 0; i < bufferSize; i++) {
			    output[i] = hihat.noise.noisegen() * 2 - 1;
			}

			Math.random
	
			var whiteNoise = ctx.context.createBufferSource();
			whiteNoise.buffer = noiseBuffer;
			whiteNoise.loop = true;
			whiteNoise.start(0);

			return whiteNoise;
		})();

	hihat.noise.osc.connect(hihat.noise.locut);

	//trig method
	hihat.noise.trig = function(velocity, time){
		// get scaled variables
		var mix = hihat.params.noise.mix.calc(velocity);
		var decay = hihat.params.noise.decay.calc(velocity)/1000;
		var locutFreq = hihat.params.noise.locut.calc(velocity);
		var hicutFreq = hihat.params.noise.hicut.calc(velocity);

		// shortcut to vca and filters
		var vca = hihat.noise.vca.gain;
		var locut = hihat.noise.locut.frequency;
		var hicut = hihat.noise.hicut.frequency;

		// clear any still running envelopes
		// vca.cancelScheduledValues(time);

		// attack
		vca.setValueAtTime(mix, time-0.01);
		hicut.setValueAtTime(hicutFreq, time-0.01);
		locut.setValueAtTime(locutFreq, time-0.01);

		// decay
		vca.exponentialRampToValueAtTime(0.0000001, time + decay);

	}

	// *************************
	// *4* master trig function 
	// *************************

	hihat.trig = function(velocity, time){
		hihat.oscillators.trig(velocity, time);
		hihat.noise.trig(velocity, time);
	}

	// *************************
	// *5* gui drawer and binder
	// *************************

	hihat.gui = {};

	hihat.gui.focused = false;

	hihat.gui.drawSliders = function() {
		hihat.gui.focused = true
	   $( ".param-slider" ).slider({
	     range: true,
	     min: 0,
	     max: 100,
	     slide: function(event, ui) {
	      var target = ui.handle.parentNode.dataset
	      var values = ui.values
	      hihat.params[target.superParam][target.subParam].range.min = ui.values[0];
	     	hihat.params[target.superParam][target.subParam].range.max = ui.values[1];
	     }
	   });
	 };

 hihat.gui.linkSlidersToParams = function(){
  	var collectionIndex = 0;
  	var sliderIndex = 0;
 	$.each(hihat.keysIndex, function(superParamKey, subParamArray){
 		$('#collection-'+ collectionIndex).show();
 		$('#collection-'+ collectionIndex +'-title').text(superParamKey);
 		$.each(subParamArray, function(index, subParamKey){
 			hihat.gui.setAndTitleSlider(superParamKey, subParamKey, collectionIndex, sliderIndex);
 			sliderIndex++;
 		});
 		while (sliderIndex < 4) { 
 			var id = collectionIndex + "-" + sliderIndex + "-slider";
 			$('#'+id).hide();
 			sliderIndex++
 		}
 		sliderIndex = 0;
 		collectionIndex++;
 	});
 	while (collectionIndex < 4) { 
 		var id = "#collection-" + collectionIndex ;
 		$(id).hide();
 		collectionIndex++;
 	}
 };

 hihat.gui.setAndTitleSlider = function(superParamKey, subParamKey, collectionIndex, sliderIndex){
 	var id = collectionIndex + "-" + sliderIndex + "-";
 	$('#'+id+"slider").show();
 	$('#'+id+"title").text(subParamKey);
 	$('#'+id+"slider").attr({'data-super-param': superParamKey, 'data-sub-param': subParamKey});
 	var setMin = hihat.params[superParamKey][subParamKey].range.min;
 	var setMax = hihat.params[superParamKey][subParamKey].range.max ;
 	$('#'+id+"slider").slider('values', [setMin, setMax]);
 };

 	// *************************
 	// *6* save & load functions
 	// *************************

	hihat.saveParams = function(){
		var params = {};
		$.each(hihat.params, function(key, storedObj){
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

 	hihat.save = function(){
 		var data = {};
 		data.params = hihat.saveParams();
 		data.sequencer = hihat.sequencer.save();
 		return data;
 	}

 	hihat.load = function(data){
 		hihat.params.load(data.params);
 		hihat.gui.linkSlidersToParams();
 		hihat.sequencer.load(data.sequencer);
 	}


 return hihat;

};