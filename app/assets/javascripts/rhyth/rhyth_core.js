var rhyth = rhyth || {};


// index
// *1* initializations and setup
// *2* gui functions
// *3* save and load functions
// *4* sequencer stop and start
// *5* mixer interface

// *****************************
// *1* initializations and setup
// *****************************


rhyth.current_voice = rhyth.kick;


rhyth.mixer = {};

rhyth.mixer.output = ctx.gainBuilder(ctx.channel1, 1.0);

rhyth.mixer.channels = {};

rhyth.mixer.channels.kick1 = ctx.gainBuilder(rhyth.mixer.output, 0.5);
rhyth.mixer.channels.kick2 = ctx.gainBuilder(rhyth.mixer.output, 0.5);
rhyth.mixer.channels.snare1 = ctx.gainBuilder(rhyth.mixer.output, 0.5);
rhyth.mixer.channels.snare2 = ctx.gainBuilder(rhyth.mixer.output, 0.5);
rhyth.mixer.channels.hihat1 = ctx.gainBuilder(rhyth.mixer.output, 0.5);
rhyth.mixer.channels.hihat2 = ctx.gainBuilder(rhyth.mixer.output, 0.5);


// *******************
// *1.2* mixer interface
// *******************

rhyth.mixer.draw = function(){
	$('#mixer').show();
	$('#param-display').hide();
	$('.sequencer').hide();
	$('#sequence-length-container').hide();
	$('.mixer-channel').slider({
		max:100,
		min: 0,
		range: "min",
		slide: function(ev,ui){
			rhyth.mixer.channels[ui.handle.parentNode.id].gain.value = (ui.value/100);
		}
	});
	$.each(rhyth.mixer.channels, function(key, gainNode){
		$('#'+key).slider('value', gainNode.gain.value*100);
	})
}

rhyth.mixer.save = function(){
	var data = {}
	$.each(rhyth.mixer.channels, function(key, gainNode){
		data[key] = gainNode.gain.value;
	});
	return data;
}

rhyth.mixer.load = function(data){
	$.each(data, function(key, value){
		rhyth.mixer.channels[key].gain.value = value;
	})
}


rhyth.setup = function(){
	rhyth.kick1 = rhyth.kickBuilder(rhyth.mixer.channels.kick1);
	rhyth.kick2 = rhyth.kickBuilder(rhyth.mixer.channels.kick2);
	rhyth.snare1 = rhyth.snareBuilder(rhyth.mixer.channels.snare1);
	rhyth.snare2 = rhyth.snareBuilder(rhyth.mixer.channels.snare2);
	rhyth.hihat1 = rhyth.hihatBuilder(rhyth.mixer.channels.hihat1);
	rhyth.hihat2 = rhyth.hihatBuilder(rhyth.mixer.channels.hihat2);
}

// *****************
// *2* gui functions
// *****************

rhyth.gui = {};

rhyth.gui.draw = function(voice){
	$('#mixer').hide();
	$('.sequencer').show();
	$('#param-display').show();
	$('#sequence-length-container').show();
	rhyth.current_voice = voice;
	voice.sequencer.gui.drawSliders();
	voice.sequencer.gui.activate();
	voice.sequencer.gui.loadValuesIntoCheckboxes();
	voice.sequencer.gui.drawSpinner();
	voice.sequencer.gui.greyOutUnusedSteps();
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
	$('#select_mixer').click( function(){ rhyth.mixer.draw(); });
}

// ***************************
// *3* save and load functions
// ***************************

rhyth.save = function(){
	var data = {};
	data.mixer = rhyth.mixer.save();
	data.kick1 = rhyth.kick1.save();
	data.kick2 = rhyth.kick2.save();
	data.snare1 = rhyth.snare1.save();
	data.snare2 = rhyth.snare2.save();
	data.hihat1 = rhyth.hihat1.save();
	data.hihat2 = rhyth.hihat2.save();
	return data
}

rhyth.load = function(data){
	rhyth.mixer.load(data.mixer)
	rhyth.kick1.load(data.kick1);
	rhyth.kick2.load(data.kick2)
	rhyth.snare1.load(data.snare1);
	rhyth.snare2.load(data.snare2);
	rhyth.hihat1.load(data.hihat1);
	rhyth.hihat2.load(data.hihat2);
	rhyth.gui.draw(rhyth.current_voice);
}

// ****************************
// *4* sequencer stop and start
// ****************************


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
