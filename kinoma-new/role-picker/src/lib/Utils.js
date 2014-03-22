//@module

exports.linearMap = function(val, loIn, hiIn, loOut, hiOut) {
	var t = (val - loIn) / (hiIn - loIn);
	var ret = (1 - t) * loOut + t * hiOut
	if(ret < loOut) ret = loOut;
	if(ret > hiOut) ret = hiOut;
	return ret;
}