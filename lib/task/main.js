var uglify2 = require('../uglify2');
module.exports = function(grunt) {
	var path = require('path');
	var rDefine = /define\(\s*(['"](.+?)['"],)?/,
		rQueryHash = /[\?#].*$/,
		rModId = /([^\\\/?]+?)(\.(?:js))?([\?#].*)?$/,
		rRequire = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;

	var xdRepsContents = {};

	grunt.registerMultiTask('seabuild', 'build your seajs modules.', function() {
		var options = this.options({
			id: '',
			uglify:{
				min:true,//mini
				options:{},//http://lisperator.net/uglifyjs/compress
				output:{
					indent_start  : 0,     // start indentation on every line (only when `beautify`)
					indent_level  : 4,     // indentation level (only when `beautify`)
					quote_keys    : false, // quote all keys in object literals?
					space_colon   : true,  // add a space after colon signs?
					ascii_only    : false, // output ASCII-safe? (encodes Unicode characters as ASCII)
					inline_script : false, // escape "</script"?
					width         : 80,    // informative maximum line width (for beautified output)
					max_line_len  : 32000, // maximum line length (for non-beautified output)
					ie_proof      : true,  // output IE-safe code?
					beautify      : false, // beautify output?
					source_map    : null,  // output a source map
					bracketize    : false, // use brackets every time?
					comments      : false, // output comments?
					semicolons    : true,  // use semicolons to separate statements? (otherwise, newlines)
				}//http://lisperator.net/uglifyjs/codegen
			}
		});
		var wrap_prefix = 'define(function(require, exports, module) {';
		var wrap_suffix = '});';
		var idMap = {};
		var pkg = 'package.json';
		if (grunt.file.exists(pkg)) {
			pkg = grunt.file.readJSON(pkg);
		    options.pkg = pkg;
	  	}else{
	  		grunt.fail.fatal('package.json not found.');
	  	}
		var destUri = options.id+'/'+pkg.name+'/'+pkg.version+'/';

		var _ops = this.options();

		this.files.forEach(function(file) {
			var contents = file.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			}).map(function(filepath) {
				var content = grunt.file.read(filepath);
				var fileExt = path.extname(filepath);
				var fileName = path.basename(filepath,fileExt);
				var dirName = path.dirname(filepath);
				var depsMap = {};

				if (!rDefine.test(content)) {
					content = [wrap_prefix, content, wrap_suffix].join('\n');
				}
				var deps = pullDeps(_ops, rRequire, content);
				var depNames = deps.map(function(dep){
					depsMap[dep.id] = path.join((dep.origId.slice(0,1)!='.'?'':(destUri+path.sep+dirName)),dep.origId);
					return depsMap[dep.id];
				});
				content = content.replace(rDefine, function() {
					var id = destUri+(dirName=='.'?
						'':(path.normalize(dirName)==path.normalize(file.orig.cwd))?
						'':(path.relative(file.orig.cwd,dirName)).replace(/\\/g,'/')+'/')+fileName;
					//(path.relative(file.orig.cwd,dirName)).replace(/\\/g,'/')
					//计算出相对于基本路径的路径，可能存在\符号，直接替换成/
					//cwd的路径与输出文件的基本路径一致，则返回'',否则返回基础文件夹+文件名
					return depNames.length ?
						"define('" + id + "',['" + depNames.join("','").replace(/\\/g,'/') + "']," :
						"define('" + id + "',";
				});

				content = content.replace(rRequire, function(id, _, $2) {
					var result = id,depId, depOrigId, depPathResult, firstStr;
					if ($2 && $2.slice(0, 4) !== 'http') {
						depPathResult = modPathResolve(options, $2); // { id: 'b', path: './b', extName: '' }
						depOrigId = depPathResult.path;
						depId = idMap[depOrigId] || depPathResult.id;
						deps.push(depId);
						if(String(depOrigId).slice(0,1)=='.'){
							result = "require('" + depsMap[depId].replace(/\\/g,'/') + "')";
						}else{
							result = "require('" + depId + "')";	
						}
					}
					return result;
				});
				return content;
			}).join('\n');
			//文件的路径相对与cwd的路径
			var _dest = path.join(file.orig.dest,destUri,path.relative(file.orig.cwd,file.src[0]));
			if(options.uglify){				
				contents = uglify2.compressor(file.src[0],contents,options.uglify);
				if(options.uglify.min){
					contents = uglify2.min(contents).code;	
				}
			}
			grunt.file.write(_dest, contents);
			grunt.log.writeln('File "' + _dest + '" created.');
		});
	});

	function pullDeps(options, reg, contents) {
		var deps = [],matches, origId;
		reg.lastIndex = 0;
		while ((matches = reg.exec(contents)) !== null) {
			origId = matches[2];
			if (origId && origId.slice(0, 4) !== 'http') {
				depPathResult = modPathResolve(options, origId);
				deps.push({
					id: depPathResult.id,
					origId: depPathResult.path,
					extName: depPathResult.extName
				});
			}
		}
		return deps;
	}

	/*
	 * 解析模块标识
	 * param { Object } 配置参数
	 * param { String } 模块标识
	 * return { Object } filePath: 过滤query和hash后的模块标识,id: 模块id,extName: 模块后缀
	 */
	function modPathResolve(options, filePath) {
		// 过滤query(?)和hash(#)
		filePath = filePath.replace(rQueryHash, '');
		var id = filePath.match(rModId)[1],
			extName = path.extname(filePath);
		if (extName && extName === '.js') {
			id = id.replace(extName, '');
		}
		return {
			id: id,
			path: filePath,
			extName: extName
		};
	}
	return grunt;
}