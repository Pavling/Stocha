tooltips = {};
tooltips.showOptions = {effect: "fadeIn", delay: 750}

tooltips.checkboxes = function(){
	$( ".step-checkbox" ).tooltip({
	  content: "click this checkbox to add or remove a trigger here for the active drum",
	  show: tooltips.showOptions
	});
}

tooltips.velocitySliders = function (){
	var velocitySliderHandles = $( ".step" ).find( ".ui-slider-handle" );
	velocitySliderHandles.prop("title", "");
	velocitySliderHandles.tooltip({
	  content: "this slider adjusts the velocity for the note that is triggered by this step for the current drum, if one exists",
	  show: tooltips.showOptions
	});
}

tooltips.stepLength = function(){
	$('#sequence-length').prop("title", "");
	$('#sequence-length').tooltip({
	  content: "set the length in steps for the sequence this drum will play",
	  show: tooltips.showOptions
	});
}

tooltips.bpm = function(){
	$('#bpminput').prop("title", "");
	$('#bpminput').tooltip({
	  content: "set the beats per minute",
	  show: tooltips.showOptions
	});
}

tooltips.paramSliders = function(){
	var sliderHandles = $('.param-slider').find( ".ui-slider-handle" );
	sliderHandles.prop("title", "");
	sliderHandles.tooltip({
	  content: "set the range across which this drum will change this aspect of its sound: the left-most handle represents the value when the velocity of a hit is at the minimum, the right-most when it is at the mamximum",
	  show: tooltips.showOptions
	});
}

tooltips.create = function(){
	tooltips.checkboxes();
	tooltips.velocitySliders();
	tooltips.stepLength();
	tooltips.bpm();
	tooltips.paramSliders();
}