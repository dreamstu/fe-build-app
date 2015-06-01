module.exports = (function(){
	'use strict';
	var UglifyJS = require('uglify-js');
	var _ = {};
	//代码压缩
	_.min = function(content){
		return UglifyJS.minify(content, {fromString: true});
	}
	_.compressor = function(fileName,content,uglifyOps){
		var ast = UglifyJS.parse(content,{filename:fileName,toplevel: ast});
		ast.figure_out_scope();
		var compressor = UglifyJS.Compressor(uglifyOps.options);
		ast = ast.transform(compressor);
		var stream = UglifyJS.OutputStream(uglifyOps.output);
		var code = ast.print(stream);
		return stream.toString();
	}
	return _;
})();