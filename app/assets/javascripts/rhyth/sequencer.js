var sequencer = {};

// *1* internal clock

sequencer.target = kick

sequencer.step = 0;
sequencer.focused = false

sequencer.run = function(){
	if (sequencer.focused){
		sequencer.gui.queueEvents();
	};
	sequencer.audio.queueEvents();
};

// *2* params

sequencer.params.sequenceLength = 16;
sequencer.params.steps = {};

for (var i = 0; i <= 15; i++){
	sequencer.params.steps[i] = {velocity: 100}
}

// *3* audio events



//  *4* gui events

//  *5* start/stop event listeners

sequencer.addEventListener('start', function(){
	sequencer.step = 0;
	sequencer.run();
})


	