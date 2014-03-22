if (! ("flex_sensor" in this) ) {
	flex_sensor = new Object();
	flex_sensor.addr = parameters.addr;
	flex_sensor.comparator = 22000;
	flex_sensor.VIn = 3.3;
	
	flex_sensor.loBound = 75000;
	flex_sensor.hiBound = 600000;
	
	flex_sensor.readings_to_keep = 5;
	flex_sensor.readings = [];
	for (var i = 0; i < flex_sensor.readings_to_keep; i++) {
		flex_sensor.readings.push(0);
	}
}

try
{
    var VOut = a2d.read([flex_sensor.addr])[flex_sensor.addr];
 
    // our other resistor in the circuit is 22000 Ohms
    // VOut = comparator/(comparator + flex) * VIn
    // => flex = (comparator * VIn/VOut) - comparator
    var flex = (flex_sensor.comparator * flex_sensor.VIn / VOut) - flex_sensor.comparator;
    
    if (flex < flex_sensor.hiBound && flex > flex_sensor.loBound ) {
    	flex_sensor.readings.push(flex);
    	flex_sensor.readings.shift();
    }
    
    var sum = 0;
   	for (var i = 0; i < flex_sensor.readings.length; i++) {
    	sum += flex_sensor.readings[i];
    }
    
   	var average = sum / (flex_sensor.readings.length * 1.0);
    
    //trace( "## average: " + average + "\t\t");
	//trace( "## flex: " + flex + "\n");
  	
  	result = { flex: average };

}
catch( e ) {
    trace( "### read flex failed: " + e + "\n" );
    result = { flex: 0 };
}