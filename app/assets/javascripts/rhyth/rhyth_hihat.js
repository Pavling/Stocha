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
		decay: ctx.paramBuilder(25.0, 75.0),
		tone: ctx.paramBuilder(8000.0, 12000.0),
		mix: ctx.paramBuilder(0.00001, 1.0)
	};
	hihat.params.sizzle = {
		decay: ctx.paramBuilder(50.0, 350.0),
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
	hihat.filters.sizzle.output = ctx.gainBuilder(hihat.output);
	hihat.filters.sizzle.filter = ctx.filterBuilder(hihat.filters.sizzle.output, 6000.0, "highpass", 0.75, 1.0);

	hihat.filters.strike = {}
	hihat.filters.strike.output = ctx.gainBuilder(hihat.output)
	hihat.filters.strike.filter = ctx.filterBuilder(hihat.filters.strike.output, 8000.0, "bandpass", 0.75, 1.0);


	//trig method
	hihat.filters.trig = function(velocity, time){
		
		// get scaled variables
		var strikeParams = hihat.params.strike;
		var sizzleParams = hihat.params.sizzle;

		// get the gainNodes and filterNodes we need to apply envelopes to
		var strikeVCA = hihat.filters.strike.output.gain;
		var sizzleVCA = hihat.filters.sizzle.output.gain;

		var strikeFilter = hihat.filters.strike.filter.frequency;
		var sizzleFilter = hihat.filters.sizzle.filter.frequency;

		// clear any still running envelopes
		strikeVCA.cancelScheduledValues(time);
		sizzleVCA.cancelScheduledValues(time);
		
		// attack
		strikeVCA.setValueAtTime(strikeParams.mix.calc(velocity), time);
		strikeFilter.setValueAtTime(strikeParams.tone.calc(velocity), time);

		sizzleVCA.setValueAtTime(sizzleParams.mix.calc(velocity), time);
		sizzleFilter.setValueAtTime(sizzleParams.tone.calc(velocity), time);


		// decay
		sizzleVCA.exponentialRampToValueAtTime(0.0000001, time + (sizzleParams.decay.calc(velocity)/1000));
		strikeVCA.exponentialRampToValueAtTime(0.0000001, time + (strikeParams.decay.calc(velocity)/1000));
		
	}

	// ***************
	// *3* oscillators 
	// ***************

	hihat.oscillators = {};
	hihat.oscillators.output = ctx.gainBuilder(hihat.filters.sizzle.filter, 1.0);
	hihat.oscillators.output.connect(hihat.filters.strike.filter);

	hihat.oscillators.osc1 = ctx.oscillatorBuilder(hihat.oscillators.output, 40, 'square');
	hihat.oscillators.osc2 = ctx.oscillatorBuilder(hihat.oscillators.output, 40, 'square');
	hihat.oscillators.osc3 = ctx.oscillatorBuilder(hihat.oscillators.output, 40, 'square');
	hihat.oscillators.osc4 = ctx.oscillatorBuilder(hihat.oscillators.output, 40, 'square');
	hihat.oscillators.osc5 = ctx.oscillatorBuilder(hihat.oscillators.output, 40, 'square');
	hihat.oscillators.osc6 = ctx.oscillatorBuilder(hihat.oscillators.output, 40, 'square');


	//trig method
	hihat.oscillators.trig = function(velocity, time){

		hihat.params.oscillators = {
			tuning: ctx.paramBuilder(40.0, 80.0),
			shimmer: ctx.paramBuilder(1.0, 2.0),
			ring: ctx.paramBuilder(-0.25, 0.25)
		}


		// get scaled variables
		var basePitch = hihat.params.oscillators.tuning.calc(velocity);
		var scale = hihat.params.oscillators.shimmer.calc(velocity);
		var offset = hihat.params.oscillators.ring.calc(velocity);

		for (var i = 1; i <= 6; i++){
			var frequency = (basePitch * ((scale*i) + (offset * (6-i))));
			hihat.oscillators["osc"+i].frequency.setValueAtTime(frequency, time)
		}

	}

	// *************************
	// *4* master trig function 
	// *************************

	hihat.trig = function(velocity, time){
		hihat.oscillators.trig(velocity, time);
		hihat.filters.trig(velocity, time);
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