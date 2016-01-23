rhyth = rhyth || {};

rhyth.GUIBuilder = function(voice){

	voice.gui = {};

	voice.gui.focused = false;

	voice.gui.drawSliders = function() {
		voice.gui.focused = true
		$( ".param-slider" ).slider({
			range: true,
			min: 0,
			max: 100,
			slide: function(event, ui) {
				var target = ui.handle.parentNode.dataset
				var values = ui.values
				voice.params[target.superParam][target.subParam].range.min = ui.values[0];
				voice.params[target.superParam][target.subParam].range.max = ui.values[1];
				console.log(voice.params[target.superParam][target.subParam].range);
			}
		});
	};

	voice.gui.linkSlidersToParams = function(){
		var collectionIndex = 0;
		var sliderIndex = 0;
		$.each(voice.keysIndex, function(superParamKey, subParamArray){
			$('#collection-'+ collectionIndex).show();
			$('#collection-'+ collectionIndex +'-title').text(superParamKey);
			$.each(subParamArray, function(index, subParamKey){
				voice.gui.setAndTitleSlider(superParamKey, subParamKey, collectionIndex, sliderIndex);
				sliderIndex++;
			});
			while (sliderIndex < 4) { 
				var id = collectionIndex + "-" + sliderIndex;
				$('#'+id+ "-slider").hide();
				$('#'+id+ "-title").hide();
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

	voice.gui.setAndTitleSlider = function(superParamKey, subParamKey, collectionIndex, sliderIndex){
		var id = collectionIndex + "-" + sliderIndex + "-";
		$('#'+id+"slider").show();
		$('#'+id+"title").text(subParamKey);
		$('#'+id+"title").show();
		$('#'+id+"slider").attr({'data-super-param': superParamKey, 'data-sub-param': subParamKey});
		var setMin = voice.params[superParamKey][subParamKey].range.min;
		var setMax = voice.params[superParamKey][subParamKey].range.max;
		$('#'+id+"slider").slider('values', [setMin, setMax]);
	};
};


rhyth.loadAndSaveBuilder = function(voice){

	voice.keysIndex = (function(){
		var indexOfKeys = {};
		$.each(voice.params, function(key, paramsObj){
			indexOfKeys[key] = [];
			$.each(paramsObj, function(subKey, storedParams){
				indexOfKeys[key].push(subKey);
			});
		});
		return indexOfKeys;
	})();

	voice.params.load = function(data){
		$.each(data, function(paramGroupKey, paramGroupObject){
			$.each(paramGroupObject, function(paramNameKey, paramValues){
				var convertedValues = {max: parseFloat(paramValues.max), min: parseFloat(paramValues.min)}
				voice.params[paramGroupKey][paramNameKey].range = convertedValues
			})
		})
	}


	voice.saveParams = function(){
		var params = {};
		$.each(voice.params, function(key, storedObj){
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

	voice.save = function(){
		var data = {};
		data.params = voice.saveParams();
		data.sequencer = voice.sequencer.save();
		return data;
	}

	voice.load = function(data){
		voice.params.load(data.params);
		voice.gui.linkSlidersToParams();
		voice.sequencer.load(data.sequencer);
	}
};

