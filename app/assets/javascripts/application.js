// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require jquery-ui
//= require turbolinks
//= require_tree ./audio_ctx
//= require_tree ./rhyth
//= require_tree .

rhyth.setup();


$(function(){	

	$('#start_play').click(function() { ctx.clock.start(); });
	$('#stop_play').click(function() { ctx.clock.stop(); });


	rhyth.gui.draw(rhyth.kick);
})
