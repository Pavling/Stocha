var rhyth = rhyth || {};

// *1* initializations and setup


rhyth.mixer = {};

rhyth.merger = ctx.gainBuilder(ctx.channel1, 1.0);



rhyth.current_voice = rhyth.kick;

rhyth.setup = function(){
	rhyth.kick1 = rhyth.kickBuilder(rhyth.merger);
	rhyth.snare1 = rhyth.snareBuilder(rhyth.merger);
	rhyth.hihat1 = rhyth.hihatBuilder(rhyth.merger);
	rhyth.kick2 = rhyth.kickBuilder(rhyth.merger);
	rhyth.snare2 = rhyth.snareBuilder(rhyth.merger);
	rhyth.hihat2 = rhyth.hihatBuilder(rhyth.merger);
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
	data.kick1 = rhyth.kick1.save();
	data.kick2 = rhyth.kick1.save();
	data.snare1 = rhyth.snare1.save();
	data.snare2 = rhyth.snare1.save();
	data.hihat1 = rhyth.hihat1.save();
	data.hihat2 = rhyth.hihat1.save();
	return data
}

rhyth.load = function(params){
	rhyth.kick1.load(params.kick1);
	rhyth.kick2.load(params.kick2)
	rhyth.snare1.load(params.snare1);
	rhyth.snare2.load(params.snare2);
	rhyth.hihat1.load(params.hihat1);
	rhyth.hihat2.load(params.hihat2);
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