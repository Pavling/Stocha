var rhyth = rhyth || {};

rhyth.output = ctx.context.createChannelMerger(8);
rhyth.output.connect(ctx.channel1);
