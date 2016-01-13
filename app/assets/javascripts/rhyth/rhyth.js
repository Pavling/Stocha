var rhyth = rhyth || {};

rhyth.context = ctx.context

rhyth.paramBuilder = function(maxIn,minIn){

	return {
		set: {
			max: maxIn,
			min: minIn
		},
		absoluteMaximum: maxIn,
		absoluteMinimum: minIn,
		calc: function(velocity){
			return ((this.set.max-this.set.min)*((100-velocity)/100))+this.set.min
		}
	}
}
