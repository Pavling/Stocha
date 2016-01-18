var menu = menu || {};

// *1* popups generic functions

menu.popup = function(content){
	$('#popup').html(content);
	$.magnificPopup.open({
	  items: {
	    src: $('#popup'),
	    type: 'inline'
	  }
	});
}

menu.successDialog = function(data){
	console.log('success! ' + data)
}

// *2* saving songs

menu.saveDialog = function(ev){
	$.ajax({
		url: '/songs/new',
		success: function(data){
			menu.popup(data.content);
			menu.saveDialogAjaxSubmission();
		},
	});
};

menu.saveDialogAjaxSubmission = function(){
	$('#new_song').submit(function(ev){
		ev.preventDefault(); 
		var songData = rhyth.save(); // update later with master save function
		var title = ev.target[2].value;
		$.ajax({
			url: '/songs',
			method: 'POST',
			data: {title: title, songData: ctx.save()},
		})
	})
}

// *3* loading songs

menu.loadDialog = function(){
	$.ajax({
			url: '/songs',
			success: function(data){
				menu.popup(data.content);
			 	menu.addSongListeners();
			},
		});
};

menu.addSongListeners = function(){
	$('.songdisplay').click(function(ev){
		menu.loadDialogAjaxRetreival($(ev.target).attr('id'));
	})
}

menu.loadDialogAjaxRetreival = function (songId){
	$.ajax({
		url: ('/songs/'+songId),
		method: 'GET',
		success: function(data){
			rhyth.load(data.song_data.rhyth);
		}
	})
}

// *4* User Login & Out

menu.loginDialog = function(){
	
}


// *9* setting up on document ready

menu.spinnerOptions = {
	max: 280,
	min: 40,
	step: 0.25,
	change: function(ev, ui){ ctx.clock.bpm = parseFloat(ev.target.value); },
	spin: function(ev, ui){ ctx.clock.bpm = parseFloat(ev.target.value);}
}

menu.setup = function(){
	$( "#bpminput" ).spinner(menu.spinnerOptions).val(ctx.clock.bpm);
	$('#start_play').click(function() { ctx.clock.start(); });
	$('#stop_play').click(function() { ctx.clock.stop(); });
	$('#save_to_db').click(function(ev) { menu.saveDialog(ev); });
	$('#load_from_db').click(function() { menu.loadDialog();})
};