//@module

exports.shortNames = ['cha', 'con', 'dex', 'int', 'str', 'wis'];
exports.fullNames = {
	cha: 'Charisma',
	con: 'Constitution',
	dex: 'Dexterity',
	int: 'Intelligence',
	str: 'Strength',
	wis: 'Wisdom'
};
exports.resultDescriptions = {
	cha: [
		"Everything you touch turns to ice.",
		"Lukewarm in the midst of the American South.  How about that?",
		"You are hot!  I mean, really!"
	],
	con: [
		"I heard you got drunk off a Shirley Temple.  Is that true??",
		"The Alamo?  Yeah, I think it's at the bottom of this glass somewhere...",
		"Everything is bigger in Texas, including the livers.  Well done!"
	],
	dex: [
		"Faster than a bullet, agile as a cat!  That's not you, I'm afraid.",
		"You may not be a professional dancer, but at least you don't trip on the stairs.",
		"You dance circles around ninjas.  With your eyes closed."
	],
	int: [
		"Maybe you're brilliant, but where do you keep the brains?  Your head is tiny!",
		"Your head is of average girth.",
		"Quite the cranium you have there!  Or should I say, 'brainium'?"
	],
	str: [
		"You have your friends open your jars, and your cat beats you at arm wrestling.",
		"You secretly do pushups when you're bored, but only twice a month.",
		"Your handshake crushes the hands of lesser mortals."
	],
	wis: [
		"How do you expect such a scraggly beard to impart wisdom?",
		"You see the wisdom in having beard, but not in having MORE OF IT.  Learn, young one!",
		"Mo' beard is mo' wise, and that's a lot of beard!"
	]
};

exports.countdowns = {
    cha: 5000,
    con: 5000,
    dex: 7499,
    int: 5000,
    str: 5000,
    wis: 7500
};

var thresholds = {
	cha: [73, 78, 81, 86, 90, 100],
    con: [.01, .015, .02, .03, .04, .05],
    dex: [2, 3, 4, 5, 6, 7],
    int: [10, 12, 13, 14, 15, 16],
    str: [1, 2, 4, 6, 8, 10],
    wis: [2, 3, 4, 5, 6, 7]
};

exports.threshold = function(value, ability) {
	var threshes = thresholds[ability];
	for(var i = threshes.length-1; i >= 0; i--) {
		if(value > threshes[i]) {
			return i+2;
		}
	}
	return 1;
}
