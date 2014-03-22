//@module

var PlayerData = function PlayerData() {
	this.reset();
};
PlayerData.prototype.reset = function reset() {
	this.cha = null;
	this.dex = null;
	this.int = null;
	this.con = null;
	this.str = null;
	this.wis = null;
	this.role = null;
};
PlayerData.prototype.isComplete = function isComplete() {
	var hasCompleted =
		(this.cha !== null) &&
		(this.dex !== null) &&
		(this.int !== null) &&
		(this.con !== null) &&
		(this.str !== null) &&
		(this.wis !== null);
	return hasCompleted;
};

module.exports = new PlayerData();