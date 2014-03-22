if (! ("temp_sensor" in this) ) {
    temp_sensor = new Object();
	temp_sensor.addr = parameters.addr;
	temp_sensor.linearMap = function(val, loIn, hiIn, loOut, hiOut) {
		var t = (val - loIn) / (hiIn - loIn);
		return (1 - t) * loOut + t * hiOut;
	}
}

try
{
	i2c.setSlave( temp_sensor.addr );
    tempData = i2c.readWordDataSMB( 0x07 );
    var C = temp_sensor.linearMap(tempData, 0x27AD, 0x7FFF, -70.01, 382.19);
    var F = C * 1.8 + 32;
    //trace("## temp " + F + "\n");
  	
  	result = { temp: F };
}
catch( e ) {
    trace( "### read temperature failed: " + e + "\n" );
    result = { temp: -1 };
}