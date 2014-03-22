if (! ( "bac_sensor" in this ) ) {
	bac_sensor = new Object();
	bac_sensor.addrs = parameters.addrs;
	
	bac_sensor.MIN = .25;
	bac_sensor.MAX = .7;
}

var linearMap = function(val, loIn, hiIn, loOut, hiOut) {
	var t = (val - loIn) / (hiIn - loIn);
	return (1 - t) * loOut + t * hiOut;
}

try
{
	var readings = a2d.read(bac_sensor.addrs);
	//trace( "## BAC1: " + readings[bac_sensor.addrs[0]] + "\t");
	//trace( "## BAC2: " + readings[bac_sensor.addrs[1]] + "\n");
	
	bac_sensor.MIN = Math.min(readings[bac_sensor.addrs[0]], readings[bac_sensor.addrs[1]], bac_sensor.MIN);
	bac_sensor.MAX = Math.max(readings[bac_sensor.addrs[0]], readings[bac_sensor.addrs[1]], bac_sensor.MAX);
	
	// let's do some fake math, since this sensor is not precise enough to do BAC
	var higher = Math.max(readings[bac_sensor.addrs[0]], readings[bac_sensor.addrs[1]]);
	var BAC = linearMap(higher, bac_sensor.MIN, bac_sensor.MAX, .00, .50);
	
	if(BAC < 0) BAC = 0;
	
	//trace( "## BAC calc'd " + BAC + "\n");
  	
  	result = { BAC: BAC };
}
catch( e ) {
    trace( "### read BAC failed: " + e + "\n" );
    result = { BAC: 0 };
}

