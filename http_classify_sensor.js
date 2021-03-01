new DiscoverySensor({
	process: function(result) {
		var classyGr = new GlideRecord('discovery_classy_http_match');
		classyGr.addQuery('sys_id', result.output);
		classyGr.query();
		
		if (classyGr.next()) {
			var patternID = classyGr.getValue('pattern');
			var midAgent = g_probe.getParameter("agent");
			var source = g_probe.getParameter("source");
			var statusID = g_probe.getParameter("agent_correlator");
			var probeParams = {};
			
			var dstatus = new GlideRecord('discovery_status');
			dstatus.get(statusID);

			// Only if Status, Status Schedule, and Status Schedule Location are not empty set probeParams.cidata = ciDataVal;
			if(!gs.nill(dstatus) && !gs.nill(dstatus.dscheduler) && !gs.nill(dstatus.dscheduler.location)){
				var location = dstatus.dscheduler.location;
				var ciDataVal = "<CIData><data><fld name=\"location\">" + location + "</fld></data></CIData>";
				probeParams.cidata = ciDataVal;
			}
   
			var probeValues = {};
			var ppe = new SNC.PrePatternExecutionData();
			var patternLauncher = new SNC.PatternLauncherManager();
			patternLauncher.launchPattern(statusID, null, midAgent, source, patternID, probeParams, probeValues,ppe);
			return;
		}
	},
	
	handleError: function(errors) {
		DiscoverySensor.prototype.handleError.call(this, errors, {
			sourceName: 'HTTP Classify',
			lastState: DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY,
			deviceState: DiscoverySensor.DeviceStates.REJECTED,
			fireClassifiers: true
		});
    },
	
	type: "DiscoverySensor"
});

