//@module
exports.show = function() {
	if (!system.keyboard.visible) {
		system.keyboard.visible = true;
	}
}
exports.hide = function() {
	if (system.keyboard.visible) {
		system.keyboard.visible = false;
	}
}

