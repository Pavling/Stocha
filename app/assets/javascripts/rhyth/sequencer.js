var sequencer = {};

// *1* internal params

sequencer.target = kick

sequencer.step = 0;
sequencer.focused = false
sequencer.lastStep = null;

sequencer.params = {};
sequencer.params.sequenceLength = 16;
sequencer.params.steps = {};

for (var i = 0; i <= 15; i++){
	sequencer.params.steps[i] = {velocity: 100, active: false}
}

sequencer.params.steps[0].active = true;
sequencer.params.steps[4].active = true;
sequencer.params.steps[8].active = true;
sequencer.params.steps[12].active = true;

// *2* sequencer start and stop

sequencer.run = function(){
	if (ctx.clock.running){
		if (sequencer.focused){sequencer.gui.queueEvents();};
		sequencer.audio.queueEvents();
	}
};


sequencer.stop = function(){
	sequencer.lastStep = null;
}

// *3* audio events

sequencer.audio = {};

sequencer.audio.queue = {};

sequencer.audio.queueEvents = function(){
	var queueStart = ctx.now()
	var thisStep = sequencer.lastStep || ctx.now();
	while ((sequencer.lastStep < (queueStart + ctx.clock.timeoutInterval/1000)) && ctx.clock.running){

		sequencer.lastStep = sequencer.audio.nextStep(sequencer.lastStep);
	};
}

sequencer.audio.nextStep = function(previousStep) {
  var interval = ctx.clock.interval();	
  var nextStep = previousStep + interval;
  var stepParams = sequencer.params.steps[sequencer.step]
  var velocity = stepParams.velocity
  sequencer.step++;
  if (sequencer.step >= sequencer.params.sequenceLength) {sequencer.step = 0};
  if (stepParams.active){sequencer.target.trig(velocity, nextStep)};
  return nextStep;
}

//  *4* gui events

//  *5* start/stop 


	
	rhyth.sequener = sequencer