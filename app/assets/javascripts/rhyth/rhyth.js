var rhyth = rhyth || {};

// *1* initializations and setup

rhyth.output = ctx.gainBuilder(ctx.channel1, 1.0);

rhyth.current_voice = rhyth.kick;

rhyth.run = function(){
	rhyth.kick.sequencer.run();
	rhyth.snare.sequencer.run();
	rhyth.hihat.sequencer.run();
}

rhyth.setup = function(){
	rhyth.kick = rhyth.kickBuilder(rhyth.output);
	rhyth.snare = rhyth.snareBuilder(rhyth.output);
	rhyth.hihat = rhyth.hihatBuilder(rhyth.output);
}

// *2* gui functions

rhyth.gui = {};

rhyth.gui.draw = function(voice){
	rhyth.current_voice = voice;
	voice.sequencer.gui.drawSliders();
	voice.sequencer.gui.activate();
	voice.sequencer.gui.loadValuesIntoCheckboxes();
	
	voice.gui.drawSliders();
	voice.gui.linkSlidersToParams();
}

rhyth.gui.drawSliders = function(){
	$( ".param-slider" ).slider({
	  range: true,
	  min: 0,
	  max: 100,
	  slide: function(event, ui) {
	   var target = $(ui.handle.parentNode).data();
	   var values = ui.values
	   var current_voice = function(){return rhyth.current_voice};
	   	current_voice().params[target.superParam + ""][target.subParam + ""].range.min = ui.values[0];
	  	current_voice().params[target.superParam + ""][target.subParam + ""].range.max = ui.values[1];
	  }
	});
}


rhyth.gui.activate = function(){
	rhyth.gui.drawSliders();
	rhyth.gui.draw(rhyth.kick);
	$('#select_kick').click( function(){ rhyth.gui.draw(rhyth.kick); });
	$('#select_snare').click( function(){ rhyth.gui.draw(rhyth.snare); });
}

// *3* save and load functions

rhyth.save = function(){
	var data = {};
	data.kick = rhyth.kick.save();
	data.snare = rhyth.snare.save();
	data.hihat = rhyth.hihat.save()
	return data
}

rhyth.load = function(params){
	rhyth.kick.load(params.kick);
	rhyth.snare.load(params.snare);
	rhyth.hihat.load(params.hihat)
	rhyth.gui.draw(rhyth.current_voice);
}

// *4* sequencer stop and start

rhyth.stop = function(){
	rhyth.kick.sequencer.stop();
	rhyth.snare.sequencer.stop();
	rhyth.hihat.sequencer.stop();
}