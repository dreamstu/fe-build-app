var uglify2 = require('../uglify2');
module.exports = function(grunt) {
	var path = require('path');
	var rDefine = /define\(\s*(['"](.+?)['"],)?/,
		rQueryHash = /[\?#].*$/,
		rModId = /([^\\\/?]+?)(\.(?:js))?([\?#].*)?$/,
		rRequire = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
		rRequireAsync = /(require\.async\(["'](.+)["']\,.+\))/g;

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
		//存放原始依赖与解析过后的依赖对应关系
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

				switch(fileExt){
					case '.tpl':
						content = "return '"+escape(content).replace(/\s/g,' ')+"'";
						break;
				}

				if (!rDefine.test(content)) {
					content = [wrap_prefix, content, wrap_suffix].join('\n');
				}
				//解析出同步加载的依赖数组
				var deps = pullDeps(_ops, rRequire, content);
				//解析出异步加载的依赖数组
				deps = deps.concat(pullDeps(_ops,rRequireAsync,content));
				//解析依赖关系
				var depNames = deps.map(function(dep){
					idMap[dep.origId] = depsMap[dep.id] = path.join((dep.origId.slice(0,1)!='.'?'':(destUri+path.sep+dirName)),dep.origId);
					return depsMap[dep.id];
				});
				//define
				content = content.replace(rDefine, function() {
					var id = destUri+(dirName=='.'?
						'':(path.normalize(dirName)==path.normalize(file.orig.cwd))?
						'':formatDepsText(path.relative(file.orig.cwd,dirName))+'/')+fileName;
					//(path.relative(file.orig.cwd,dirName)).replace(/\\/g,'/')
					//计算出相对于基本路径的路径，可能存在\符号，直接替换成/
					//cwd的路径与输出文件的基本路径一致，则返回'',否则返回基础文件夹+文件名
					return depNames.length ?
						"define('" + id + "',['" + parseDepsText(depNames.join("','")) + "']," :
						"define('" + id + "',";
				});
				//同步加载的
				content = content.replace(rRequire, function(id, _, $2) {
					return parse(id,$2);
				});
				//异步加载的
				content = content.replace(rRequireAsync, function(id,_,$2) {
					return parse(id,$2);
				});

				function parse(id,$2){
					var result = id,depId, depOrigId, depPathResult, firstStr;
					if ($2 && $2.slice(0, 4) !== 'http') {
						depPathResult = modPathResolve(options, $2); // { id: 'b', path: './b', extName: '' }
						depOrigId = depPathResult.path;
						depId = idMap[depOrigId];
						deps.push(depId);
						if(String(depOrigId).slice(0,1)=='.'){
							result = "require('" + parseDepsText(depId) + "')";
						}else{
							result = "require('" + depId + "')";	
						}
					}
					return result;
				}

				//返回处理结果
				return content;
			}).join('\n');
			//文件的路径相对与cwd的路径
			var _dest = path.join(file.orig.dest,destUri,path.relative(file.orig.cwd,file.src[0]));
			if(options.uglify){
				try{
					contents = uglify2.compressor(file.src[0],contents,options.uglify);
					if(options.uglify.min){
						contents = uglify2.min(contents).code;	
					}
				}catch(e){
					grunt.log.error('压缩代码失败：'+e);
				}
			}
			var fileExt = path.extname(_dest);
			switch(fileExt){
				case '.tpl':
					_dest = _dest.replace(fileExt,'.js');
					break;
			}
			grunt.file.write(_dest, contents);
			grunt.log.writeln('File "' + _dest + '" created.');
		});
	});
	
	//编码HTML
	function escape(html){
        return String(html||'').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    }

    //格式化
    function formatDepsText(depsText){
    	//转换\为/，解决win下的路径BUG
    	return depsText.replace(/\\/g,'/');
    }

    //将.tpl后缀去掉，tpl模版在转换的过程中已经变成了js模块了
    function parseDepsText(depsText){
    	return formatDepsText(depsText).replace(/\.tpl/g,'');
    }

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