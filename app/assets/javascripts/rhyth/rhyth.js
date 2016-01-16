var rhyth = rhyth || {};

// *1* initializations and setup

rhyth.output = ctx.gainBuilder(ctx.channel1, 1.0);

rhyth.run = function(){
	rhyth.kick.sequencer.run();
}

rhyth.setup = function(){
	rhyth.kick = rhyth.kickBuilder(rhyth.output);
}

// *2* gui functions

rhyth.gui = {};

rhyth.gui.draw = function(voice){
	voice.gui.drawSliders();
	voice.gui.linkSlidersToParams();
	voice.sequencer.gui.activate();
	voice.sequencer.gui.drawSliders();
}

// *3* save and load functions

rhyth.save = function(){
	var data = {};
	data.kick = rhyth.kick.save();
	console.log(data)
}

rhyth.load = function(params){
	rhyth.kick.load(params);
}