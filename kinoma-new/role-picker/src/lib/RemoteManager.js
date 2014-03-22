//@module

var RemoteManager = {
	_remote: null
};

RemoteManager.get = function() {
	return this._remote;
};

RemoteManager.getUuid = function() {
	if (this._remote === null) {
		return null;
	}
	return this._remote.uuid;
};

RemoteManager.set = function(remote) {
	this._remote = remote;
};

RemoteManager.unset = function() {
	this._remote = null;
};

RemoteManager.sendMessage = function(message) {
	if (this._remote === null) {
		throw new Error('no remote!');
	}
	application.invoke(new Message(this._remote.location + message));
};

RemoteManager.sendUserId = function(user_id) {
	RemoteManager.sendMessage("user?user_id=" + user_id);
};

module.exports = RemoteManager;