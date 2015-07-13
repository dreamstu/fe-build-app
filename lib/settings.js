var path = require('path');

var debug = false;
var root = path.join(__dirname,'..','node_modules','quick-build-core');
var settings = {
	debug:debug,
	root:root,
	tmp:path.join(root,'tmp')
}
module.exports = settings;