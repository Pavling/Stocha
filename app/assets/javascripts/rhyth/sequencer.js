var sequencer = {};

// *1* internal params

sequencer.target = kick

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
sequencer.params.sequenceLength = 16;
sequencer.params.steps = {};

//patch init
for (var i = 0; i <= 15; i++){
	sequencer.params.steps[i] = {velocity: 50, active: false}
}

// *2* audio events

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

//  *3* gui events - reconsider gui

sequencer.gui = {};

sequencer.gui.activate = function(){
	sequencer.focused = true;
	sequencer.gui.addCheckboxListeners();
}

sequencer.gui.addCheckboxListeners = function(){
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
	for(var i = 0; i < 16; i++){ 
		var id = "#step"+i+"_slider";
		var velocity = sequencer.params.steps[i].velocity
		$(id).slider('value', velocity);
	};
};

// *4* start and stop etc.

sequencer.run = function(){
	if (ctx.clock.running){
		sequencer.audio.queueEvents();
	}
};

sequencer.stop = function(){
	sequencer.lastStep = null;
	sequencer.step = 0;
	sequencer.gui.step = 0
}