var menu = menu || {};

// index
// *1* popups generic functions
// *2* saving songs
// *3* loading songs
// *4* User Login/out & logged in user id retreiver


// ****************************
// *1* popups generic functions
// ****************************

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

// ****************
// *2* saving songs
// ****************

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
			data: {title: title, songData: ctx.save(), user_id: menu.user_id},
			success: function(data){
				menu.popup(data);
			}
		})
	})
}

// *****************
// *3* loading songs
// *****************

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
			menu.loadSongData(data);
		}
	})
}

menu.loadSongData = function(data){
	menu.current_song_owner = data.user_id.$oid;
	rhyth.load(data.song_data.rhyth);
	ctx.clock.bpm = data.song_data.bpm;
	menu.song_id = data.song_id.$oid;
	$('#song_title').text(data.title)
	$( "#bpminput" ).spinner("value", data.song_data.bpm);
	menu.updateMenu();
}

// ******************
// *4* updating songs
// ******************

menu.updateDialog = function(){
	$.ajax({
		url: ('/songs/' + menu.song_id),
		method: 'PUT',
		data: {songData: ctx.save()},
		success: function(){
			menu.popup('Song updated')
		}
	})
}

// ************************************************
// *5* User Login/out & logged in user id retreiver
// ************************************************

menu.loginDialog = function(){
	$.ajax({
		url: 'users/sign_in',
		success: function(data){
			menu.popup(data);
			$('#login_submit').click(function(ev){
				ev.preventDefault();
				var remember_me_box = (function(){ if ($(ev.target.form[4]).is(':checked')) { return 1 } else { return 0 };})();
				var data = {
					username: $(ev.target.form[1]).val(),
					password: $(ev.target.form[2]).val(),
					remember_me: remember_me_box
				};
				menu.loginPostViaAJAX(data);
			});
		}
	})
}

menu.loginPostViaAJAX = function(dataIn){
	$.ajax({
		url: '/users/sign_in',
		method: 'POST',
		data: {user: dataIn}, 
		success: function(data){ 
			menu.popup('Log in successful');
			menu.user_id = data._id.$oid;
			menu.updateMenu();
			// some way of changing the button to a log out then loginoutlisteners
		},
		error: function(data){
			menu.popup("Something went wrong. If you are getting this message frequently, check your internet connection or refresh the page");
			console.log(data);
		}
	});
};

menu.logoutDialog = function(){
	$.ajax({
		url: 'users/sign_out',
		method: 'DELETE',
		success: function(data){
			menu.popup('Log out successful');
			delete menu.user_id;
			menu.updateMenu();
			// some way of adding a log in button back then loginoutlisteners
		},
		error: function(data){
			menu.popup("Something went wrong. If you are getting this message frequently, check your internet connection or refresh the page");
			console.log(data);
		}
	});
};

menu.getCurrentUser = function(){
	$.ajax({
		async: false,
		url: 'get_current_user',
		success: function(data){
			if(data){menu.user_id = data._id.$oid;};
		},
		error: function(data){
			console.log(data);
		}
	});
};

menu.updateLogInOutButton = function(){
	if (menu.user_id) {
		$('#user_login').hide();
		$('#user_logout').show();
	} else if (!menu.user_if){
		$('#user_logout').hide();
		$('#user_login').show();
	};
};

// *********************************************
// *6* update interface according to user rights
// *********************************************

menu.updateSaveButton = function(){
	if (menu.user_id) {
		$('#save_to_db').show();
	} else if (!menu.user_if){
		$('#save_to_db').hide();
	};
};

menu.updateUpdateButton = function(){
	if (menu.user_id === menu.current_song_owner) {
		$('#update_in_db').show();
	} else {
		$('#update_in_db').hide();
	};
};

// *****************************
// *7* master menu update button
// *****************************

menu.updateMenu = function(){
	menu.updateLogInOutButton();
	menu.updateSaveButton();
	menu.updateUpdateButton();
}

// ********************************
// *9* setting up on document ready
// ********************************

menu.spinnerOptions = {
	max: 280,
	min: 40,
	step: 0.25,
	change: function(ev, ui){ ctx.clock.bpm = parseFloat(ev.target.value); },
	spin: function(ev, ui){ ctx.clock.bpm = parseFloat(ev.target.value);}
}

menu.logInOutListeners = function(){
	$('#user_login').click(function(ev) { menu.loginDialog(); })
	$('#user_logout').click(function(ev) { menu.logoutDialog(); })
}

menu.dbButtonListeners = function(){
	$('#save_to_db').click(function(ev) { menu.saveDialog(ev); });
	$('#load_from_db').click(function() { menu.loadDialog(); });
	$('#update_in_db').click(function() { menu.updateDialog(); });
}

menu.sequencerControlButtonListeners = function(){
	$( "#bpminput" ).spinner(menu.spinnerOptions).val(ctx.clock.bpm);
	$('#start_play').click(function() { ctx.clock.start(); });
	$('#stop_play').click(function() { ctx.clock.stop(); });
}

menu.setup = function(){	
	menu.getCurrentUser();
	menu.logInOutListeners();
	menu.dbButtonListeners();
	menu.sequencerControlButtonListeners();
	menu.updateMenu();
};