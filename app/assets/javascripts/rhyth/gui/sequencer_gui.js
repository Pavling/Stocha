$(function(){
	$(":checkbox").click(function(ev){
		var box = ev.target;
		sequencer.params.steps[box.value].active = box.checked;
	})

	// sequencer.focused = true;

})