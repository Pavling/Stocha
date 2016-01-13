
var ctx = ctx || {};
ctx.context = new (window.AudioContext || window.webkitAudioContext)()

ctx.now = function(){
	this.context.currentTime;
}