$(function(){	

	$('#start_play').click(function() { ctx.clock.start(); });
	$('#stop_play').click(function() { ctx.clock.stop(); });


	kick.gui.drawSliders();
	kick.gui.linkSlidersToParams();
	sequencer.gui.activate();
	sequencer.gui.drawSliders();
})
