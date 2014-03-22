//@module

var ClassUtils = require('./lib/ClassUtils');

var Page = function Page(data) {
	Container.call(this, {left: 0, right: 0, top: 0, bottom: 0}, Theme.bgSkin);
	this.active = true;
	
	var layout = new Column({left: 0, right: 0, top: 10, bottom: 0});
	layout.name = 'layout';
	this.add(layout);
	
	var title = new Label({left: 0, right: 0}, null, Theme.titleStyle,
		'K4 Hoedown');
	layout.add(title);
	
	if ('subtitle' in data) {
		var subtitle = new Label({left: 0, right: 0}, null, Theme.subTitleStyle,
			data.subtitle);
		layout.add(subtitle);
	}
	
	if ('steps' in data) {
		for (var i = 0; i < data.steps.length; i++) {
			var step = new Text({left: 0, right: 0, top: 10}, null, Theme.textStyle,
				data.steps[i]);
			layout.add(step);
		}
	}
};
ClassUtils.subclass(Page, Container);

module.exports = Page;