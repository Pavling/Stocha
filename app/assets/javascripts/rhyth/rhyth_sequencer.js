rhyth = rhyth || {};

rhyth.sequencerBuilder = function(target){

	var sequencer = {};

	// index 
	// *1* internal params
	// *2* audio events
	// *3* gui events
	// *4* start and stop
	// *5* load and save functions

	// *******************
	// *1* internal params
	// *******************

	sequencer.target = target

	sequencer.step = 0;
	sequencer.incrementStep = function(){
		sequencer.step++;
		if (sequencer.step >= sequencer.params.sequenceLength) {sequencer.step = 0};
	}

	sequencer.focused = false;
	sequencer.lastStep = null;
	sequencer.queue = [];
	sequencer.queueStart = null;

	sequencer.params = {};
	sequencer.params.sequenceLength = 32;
	sequencer.params.steps = {};

	//patch init
	for (var i = 0; i <= 31; i++){
		sequencer.params.steps[i] = {velocity: 50, active: false}
	}

	// ****************
	// *2* audio events
	// ****************

	sequencer.audio = {};

	sequencer.audio.queueEvents = function(){
		sequencer.queueStart = ctx.now();
		var thisStep = sequencer.lastStep || ctx.now();
		while ((sequencer.lastStep < (sequencer.queueStart + ctx.clock.timeoutInterval/1000)) && ctx.clock.running){
			sequencer.lastStep = sequencer.audio.nextStep(sequencer.lastStep);
		}
	};


	sequencer.audio.nextStep = function(previousStepTime) {
		var nextStepTime = previousStepTime + ctx.clock.interval();
		var stepParams = sequencer.params.steps[sequencer.step]
		if (stepParams.active){
			sequencer.target.trig(stepParams.velocity, nextStepTime)
		};
		sequencer.incrementStep();
		return nextStepTime;
	}

	// ****************
	//  *3* gui events 
	// ****************

	sequencer.gui = {};

	sequencer.gui.activate = function(){
		sequencer.focused = true;
		sequencer.gui.addCheckboxListeners();
		sequencer.gui.loadParamsIntoSliders();
		sequencer.gui.loadValuesIntoCheckboxes();
		sequencer.gui.drawSpinner();
		sequencer.gui.greyOutUnusedSteps
	}

	sequencer.gui.addCheckboxListeners = function(){
		$(':checkbox').off();
		$(':checkbox').click(function(event){
			var target = event.target
			sequencer.params.steps[$(target).val()].active = $(target).prop('checked')
		})
	}

	sequencer.gui.drawSliders = function(){
		$( ".step-slider" ).slider({
			orientation: "vertical",
			range: "min",
			min: 0,
			max: 100,
			slide: function( event, ui ) {
				var stepId = ui.handle.parentNode.id.replace(/\D+/g,'');
				sequencer.params.steps[stepId].velocity = ui.value
			}
		});
		sequencer.gui.loadParamsIntoSliders();
	};

	sequencer.gui.loadParamsIntoSliders = function(){
		for(var i = 0; i < 32; i++){ 
			var id = "#step"+i+"_slider";
			var velocity = sequencer.params.steps[i].velocity
			$(id).slider('value', velocity);
		};
	};

	sequencer.gui.loadValuesIntoCheckboxes = function(){
		for(var i = 0; i < 32; i++){ 
			var id = "#step"+i+"_checkbox";
			var active = sequencer.params.steps[i].active
			$(id).prop('checked', active);
		};
	}

	sequencer.gui.spinnerParams = {
		max: 32,
		min: 1,
		step: 1,
		change: function(ev, ui){ sequencer.gui.changeSequenceLength(parseInt(ev.target.value)); },
		spin: function(ev, ui){ sequencer.gui.changeSequenceLength(parseInt(ev.target.value));}
	}

	sequencer.gui.drawSpinner = function(){
		$('#sequence-length').spinner(sequencer.gui.spinnerParams).val(sequencer.params.sequenceLength)
	}

	sequencer.gui.changeSequenceLength = function(newLength){
		sequencer.params.sequenceLength = newLength;
		sequencer.gui.greyOutUnusedSteps();
	}

	sequencer.gui.greyOutUnusedSteps = function(){
		var length = sequencer.params.sequenceLength
		for (var i = 0; i < length; i++){
			var id = "#step"+i;
			$(id).removeClass('inactive');
		}
		for(var i = length; i < 32; i++){ 
			var id = "#step"+i;
			$(id).addClass('inactive');
		};
	}


	// *************************
	// *4* start and stop etc.
	// *************************

	sequencer.run = function(){
		if (ctx.clock.running){
			sequencer.audio.queueEvents();
		}
	};

	sequencer.stop = function(){
		sequencer.lastStep = null;
		sequencer.step = 0;
		sequencer.gui.step = 0
	};

	// *************************
	// *5* save & load functions
	// *************************

	sequencer.save = function(){
		var data = {};
		data.steps = {};
		data.sequencerLength = sequencer.params.sequenceLength;
		for (var i = 0; i <= 15; i++){
			data.steps[i] = sequencer.params.steps[i];
		}
		return data;
	}

	sequencer.load = function(data){
		$.each(data.steps, function(key, value){
			var converted = {velocity: parseFloat(value.velocity), active: $.parseJSON(value.active)}
			sequencer.params.steps[key] = converted
		});
		sequencer.params.sequenceLength = data.sequencerLength;
		// sequencer.gui.loadParamsIntoSliders();
		// sequencer.gui.loadValuesIntoCheckboxes();
	}

	return sequencer;
};