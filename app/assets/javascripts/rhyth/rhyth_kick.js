var kick = kick || {};

kick.ctx = ctx.context;

// set up paramaters interface
kick.params = {}
kick.params.batterHead = {
	tuning: rhyth.paramBuilder(1.0, 4.0),
	stiffness: rhyth.paramBuilder(1.0, 3.0),
	material: rhyth.paramBuilder(1.0, 1.5),
	mix: rhyth.paramBuilder(0.00001, 1.0)
};
kick.params.resoHead = {
	tuning: rhyth.paramBuilder(20.0, 80.0),
	decay: rhyth.paramBuilder(75.0, 500.0),
	stiffness: rhyth.paramBuilder(35.0, 350.0),
	mix: rhyth.paramBuilder(0.00001, 1.0)
}
kick.params.shell = {
	resonance: rhyth.paramBuilder(0.0, 0.9),
	material: rhyth.paramBuilder(40.0, 160.0)
}

// set up output node
kick.output = kick.ctx.createChannelMerger(3);

// set up batterHead section of voice
kick.resoHead = {};
// envelope & mixer
kick.resoHead.envelope = kick.ctx.createGain();
kick.resoHead.envelope.value = 0.0;
kick.resoHead.envelope.connect(kick.output);

// make envelopes and event triggers inside the object?