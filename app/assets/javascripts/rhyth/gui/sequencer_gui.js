$(function(){	

	$('#start_play').click(function() { ctx.clock.start(); });
	$('#stop_play').click(function() { ctx.clock.stop(); });

	sequencer.gui.activate();

})
