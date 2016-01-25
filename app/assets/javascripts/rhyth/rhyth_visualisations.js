var rhyth = rhyth || {};
rhyth.mixer = rhyth.mixer || {};

// index
// *1* VU meters for each channel
// *2* VU scripts
// *3* attach VU scripts
// *9* on document ready

// ******************************
// *1* VU meters for each channel
// ******************************

rhyth.mixer.vuMeters = {};

rhyth.mixer.vuMeters.kick1 = ctx.analyserBuilder(rhyth.mixer.channels.kick1, "kick1");
rhyth.mixer.vuMeters.kick2 = ctx.analyserBuilder(rhyth.mixer.channels.kick2, "kick2");
rhyth.mixer.vuMeters.snare1 = ctx.analyserBuilder(rhyth.mixer.channels.snare1, "snare1");
rhyth.mixer.vuMeters.snare2 = ctx.analyserBuilder(rhyth.mixer.channels.snare2, "snare2");
rhyth.mixer.vuMeters.hihat1 = ctx.analyserBuilder(rhyth.mixer.channels.hihat1, "hihat1");
rhyth.mixer.vuMeters.hihat2 = ctx.analyserBuilder(rhyth.mixer.channels.hihat2, "hihat2");

// **************
// *2* VU scripts
// ************** 

rhyth.visualisations = {};

rhyth.visualisations.vuScriptBuilder = function(analyserObject){

  analyserObject.javascriptNode.onaudioprocess = function(audioProcessingEvent) {
    var array = new Uint8Array(analyserObject.analyserNode.frequencyBinCount);
    analyserObject.analyserNode.getByteFrequencyData(array);
    var average = getAverageVolume(array)

    var canvasContext = analyserObject.canvas;

    canvasContext.clearRect(0, 0, 600, 25);
    canvasContext.fillStyle="#BBDEFB";
    // create the meters
    canvasContext.fillRect(0,0,(average*8),25);
  }
}

function getAverageVolume(array) {
	var values = 0;
	var length = array.length;
	// get all the frequency amplitudes
	for (var i = 0; i < length; i++) {
		values += array[i];
	}
	var average = values / length;
	return average;
}

// *********************
// *3* attach VU scripts
// *********************



// *********************
// *9* on document ready
// *********************

$(function(){
  $.each(rhyth.mixer.vuMeters, function(key, object){
    object.canvas = $("#"+object.sourceName+"-vu").get()[0].getContext("2d");
  });
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.kick1);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.kick2);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.snare1);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.snare2);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.hihat1);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.hihat2);
});



