function initSensors() {
	if (!('a2d' in this)) {
		throw new Error('a2d missing');
	}
	if (!('i2c' in this)) {
		throw new Error('i2c missing');
	}
	if (!('gpio' in this)) {
		throw new Error('gpio missing');
	}
	trace( "## initialize sensors: \n");

	trace( "\t## initialize flex sensor, pin " + parameters.flex + "\n" );
	a2d.init( [parameters.flex] );
  
  	trace( "\t## initialize IR thermometer, I2C clock " + parameters.thermometer_clock + "\n" );
  	trace( "\t## initialize IR thermometer, I2C data " + parameters.thermometer_data + "\n" );
	i2c.init( parameters.thermometer_clock, parameters.thermometer_data );
    i2c.setSlave( parameters.thermometer_addr );
	
	trace( "\t## initialize BAC sensors, pins " + parameters.BAC_A2D1 + " & " + parameters.BAC_A2D2 + "\n" );
	a2d.init( [parameters.BAC_A2D1, parameters.BAC_A2D2] );
	gpio.init( [parameters.BAC_VCC1, parameters.BAC_VCC2],  "output");
	gpio.set( [parameters.BAC_VCC1, parameters.BAC_VCC2], 1 );
	gpio.init( [parameters.BAC_GND1, parameters.BAC_GND2],  "output");
	gpio.set( [parameters.BAC_VCC1, parameters.BAC_VCC2], 0 );
	
	trace( "\t## initialize stretch sensor, pin " + parameters.stretch + "\n" );
	a2d.init( [parameters.stretch] );
}

try
{
    initSensors();
    result = { op:"init", success:true };
}
catch( e ) {
    trace( "### initialize sensors failed: " + e + "\n" );
    result = { op:"init", success:false };
}

