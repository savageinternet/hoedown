if (! ("stretch_sensor" in this) ) {
	stretch_sensor = new Object();
	stretch_sensor.addr = parameters.addr;
	stretch_sensor.comparator = 22;
	stretch_sensor.VIn = 3.3;
	stretch_sensor.hiBound = 35;
	stretch_sensor.loBound = 0;
	
	stretch_sensor.readings_to_keep = 10;
	stretch_sensor.readings = [];
	for (var i = 0; i < stretch_sensor.readings_to_keep; i++) {
		stretch_sensor.readings.push(0);
	}
}

try
{
    var VOut = a2d.read([stretch_sensor.addr])[stretch_sensor.addr];
 
    // our other resistor in the circuit is 22 Ohms
    // VOut = comparator/(comparator + stretch) * VIn
    // => stretch = (comparator * VIn/VOut) - comparator
    var stretch = (stretch_sensor.comparator * stretch_sensor.VIn / VOut) - stretch_sensor.comparator;
    // we have 5(?!)ohms of resistance per inch,
    // we are picking up 60 ohms of resistance from the wires themselves, 
    // and the band to the end of the sensor is ~2.5ft = 30 inches
    var distFromEnd = (stretch - 60)/5;
    var length = 30 - distFromEnd;
    
    if (length < stretch_sensor.hiBound && length > stretch_sensor.loBound ) {
    	stretch_sensor.readings.push(length);
    	stretch_sensor.readings.shift();
    }
    
    var sum = 0;
   	for (var i = 0; i < stretch_sensor.readings.length; i++) {
    	sum += stretch_sensor.readings[i];
    }
    
   	var average = sum / (stretch_sensor.readings.length * 1.0);
    
    //trace("## " + length + "\n");
    
	result = { stretch: average };
}
catch( e ) {
    trace( "### read stretch failed: " + e + "\n" );
    result = { stretch: 0 };
}