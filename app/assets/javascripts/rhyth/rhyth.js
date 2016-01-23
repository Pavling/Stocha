var rhyth = rhyth || {};

// *1* initializations and setup

rhyth.output = ctx.gainBuilder(ctx.channel1, 1.0);

rhyth.current_voice = rhyth.kick;

rhyth.setup = function(){
	rhyth.kick1 = rhyth.kickBuilder(rhyth.output);
	rhyth.snare1 = rhyth.snareBuilder(rhyth.output);
	rhyth.hihat1 = rhyth.hihatBuilder(rhyth.output);
	rhyth.kick2 = rhyth.kickBuilder(rhyth.output);
	rhyth.snare2 = rhyth.snareBuilder(rhyth.output);
	rhyth.hihat2 = rhyth.hihatBuilder(rhyth.output);
}

// *2* gui functions

rhyth.gui = {};

rhyth.gui.draw = function(voice){
	rhyth.current_voice = voice;
	voice.sequencer.gui.drawSliders();
	voice.sequencer.gui.activate();
	voice.sequencer.gui.loadValuesIntoCheckboxes();
	voice.sequencer.gui.drawSpinner();
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
	rhyth.gui.draw(rhyth.kick1);
	$('#select_kick1').click( function(){ rhyth.gui.draw(rhyth.kick1); });
	$('#select_snare1').click( function(){ rhyth.gui.draw(rhyth.snare1); });
	$('#select_hihat1').click( function(){ rhyth.gui.draw(rhyth.hihat1); });
	$('#select_kick2').click( function(){ rhyth.gui.draw(rhyth.kick2); });
	$('#select_snare2').click( function(){ rhyth.gui.draw(rhyth.snare2); });
	$('#select_hihat2').click( function(){ rhyth.gui.draw(rhyth.hihat2); });
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


rhyth.run = function(){
	rhyth.kick1.sequencer.run();
	rhyth.kick2.sequencer.run();
	rhyth.snare1.sequencer.run();
	rhyth.snare2.sequencer.run();
	rhyth.hihat1.sequencer.run();
	rhyth.hihat2.sequencer.run();
}

rhyth.stop = function(){
	rhyth.kick1.sequencer.stop();
	rhyth.kick2.sequencer.stop();
	rhyth.snare1.sequencer.stop();
	rhyth.snare2.sequencer.stop();
	rhyth.hihat1.sequencer.stop();
	rhyth.hihat2.sequencer.stop();
}