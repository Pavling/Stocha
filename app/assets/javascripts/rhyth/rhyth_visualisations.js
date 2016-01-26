var rhyth = rhyth || {};
rhyth.mixer = rhyth.mixer || {};

// index
// *1* VU meters for each channel
// *2* VU scripts
// *3* oscilloscope
// *4* spectograph
// *9* on document ready

// ******************************
// *1* VU meters for each channel
// ******************************

rhyth.mixer.vuMeters = {};

rhyth.mixer.vuMeters.kick1 = ctx.analyserBuilder(rhyth.mixer.channels.kick1);
rhyth.mixer.vuMeters.kick2 = ctx.analyserBuilder(rhyth.mixer.channels.kick2);
rhyth.mixer.vuMeters.snare1 = ctx.analyserBuilder(rhyth.mixer.channels.snare1);
rhyth.mixer.vuMeters.snare2 = ctx.analyserBuilder(rhyth.mixer.channels.snare2);
rhyth.mixer.vuMeters.hihat1 = ctx.analyserBuilder(rhyth.mixer.channels.hihat1);
rhyth.mixer.vuMeters.hihat2 = ctx.analyserBuilder(rhyth.mixer.channels.hihat2);

// **************
// *2* VU scripts
// ************** 

rhyth.visualisations = {};

rhyth.visualisations.vuScriptBuilder = function(analyserObject){

  analyserObject.javascriptNode.onaudioprocess = function(audioProcessingEvent) {
    var array = new Uint8Array(analyserObject.analyserNode.frequencyBinCount);
    analyserObject.analyserNode.getByteFrequencyData(array);
    var max = Math.max.apply(Math, array)

    var canvas = analyserObject.canvas;

    canvas.clearRect(0, 0, 600, 25);
    canvas.fillStyle="#BBDEFB";
    // create the meters
    canvas.fillRect(0,0,(max*2.25),25);
  }
}

// ***************
// *2*oscilloscope
// ***************

rhyth.visualisations.oscilloscope = ctx.analyserBuilder(rhyth.mixer.output, 0.5);

rhyth.visualisations.drawOscilloscope = function(){
  // aliases
  var analyser =  rhyth.visualisations.oscilloscope.analyserNode
  var array = new Uint8Array(analyser.fftSize);
  var drawer = requestAnimationFrame(rhyth.visualisations.drawOscilloscope);
  var canvas = rhyth.visualisations.oscilloscope.canvas

  analyser.getByteTimeDomainData(array);

 canvas.fillStyle = '#FFF';
 canvas.fillRect(0, 0, 250, 250);

 canvas.lineWidth = 2;
 canvas.strokeStyle = '#000';

 canvas.beginPath();

 var sliceWidth = 250 / analyser.fftSize;
 var x = 0;

 for(var i = 0; i < analyser.fftSize; i++) {
   var v = array[i] / 128.0;
   var y = v * 250/2;

   if(i === 0) {
     canvas.moveTo(x, y);
   } else {
     canvas.lineTo(x, y);
   }
   x += sliceWidth;
 }
 canvas.lineTo(250, 125);
 canvas.stroke();
}

// ***************
// *4* spectograph
// ***************

rhyth.visualisations.spectograph = ctx.analyserBuilder(rhyth.mixer.output, 0.9);

rhyth.visualisations.drawSpectograph = function(){
  // aliases
  var analyser =  rhyth.visualisations.oscilloscope.analyserNode
  var array = new Uint8Array(analyser.fftSize);
  var drawer = requestAnimationFrame(rhyth.visualisations.drawSpectograph);
  var canvas = rhyth.visualisations.spectograph.canvas

  analyser.getByteFrequencyData(array);

  canvas.fillStyle = '#FFF';
  canvas.fillRect(0, 0, 250, 250);

  var barWidth = (250 / analyser.fftSize)*2;
  var barHeight;
  var x = 0;

  for(var i = 0; i < analyser.fftSize; i++) {
    barHeight = array[i];

    canvas.fillStyle = 'rgb(0,0,0)';
    canvas.fillRect(x,250-(barHeight),barWidth,barHeight);

    x += barWidth + 1;
  }
};


// *********************
// *9* on document ready
// *********************

function attachVUScripts (){
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.kick1);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.kick2);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.snare1);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.snare2);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.hihat1);
  rhyth.visualisations.vuScriptBuilder(rhyth.mixer.vuMeters.hihat2);
}

function oscilloscopeSetup(){
  rhyth.visualisations.oscilloscope.canvas = $("#oscilloscope-canvas").get()[0].getContext("2d");
  rhyth.visualisations.drawOscilloscope();
}

function spectographSetup(){
  rhyth.visualisations.spectograph.canvas = $("#spectograph-canvas").get()[0].getContext("2d");
  rhyth.visualisations.drawSpectograph();
}

$(function(){
  $.each(rhyth.mixer.vuMeters, function(key, object){
    object.canvas = $("#"+key+"-vu").get()[0].getContext("2d");
  });
  attachVUScripts();
  oscilloscopeSetup();
  spectographSetup();
});



