var shell = require('shelljs');
var fs = require('fs');
var path = require('path');
var grunt = require('grunt');
var task = require('./task/main');
var gruntfile = require('./gruntfile');

var debug = false;

var _ = function(document){
	
	function printLog(){
		if(debug){
			console.log(Array.prototype.join.call(arguments,''));
		}else{
			var contentBox = document.querySelector('#content');
			var p = document.createElement('p');
			p.innerHTML = Array.prototype.join.call(arguments,'');
			contentBox.appendChild(p);
			contentBox.scrollTop = contentBox.scrollHeight;
			console.log(Array.prototype.join.call(arguments,''));
		}
	}

	//重写grunt日志输出函数
	grunt.log.__proto__._write = function(msg) {
	  // Abort if muted.
	  if (this.muted) { return; }
	  // Actually write output.
	  this.hasLogged = true;
	  msg = msg || '';
	  //过滤掉颜色代码
	  msg = ("" + msg).replace(/\x1B\[\d+m/g, '');
	  //打印日志到控制台
	  printLog(msg);
	};

	var _ = {};
	_.root = path.join(__dirname,'..');
	_.tmp = path.join(_.root,'tmp');
	_.options = null;

	_.start = function(params){
		_.options = params;
		var inf = params.inf;
		var queue = params.queue;
		//进入项目根目录
		shell.cd(_.root);
		printLog('构建目录：',inf);
		printLog('待构建队列：',queue);
		//拷贝待构建文件到临时文件夹中
		if(!fs.existsSync(_.tmp)){
			shell.mkdir('-p',_.tmp);
			printLog('创建了临时目录。');
		}else{
			shell.rm('-rf',_.tmp+'/*');
		}
		shell.cp('-rf',[inf+'/*'],_.tmp);
		printLog('拷贝待构建文件到临时文件夹中。');
		shell.sed('-i', "path.resolve('node_modules')", "path.resolve('..','..','..','node_modules')", "node_modules/grunt/lib/grunt/task.js");
		_.run(queue);
	}

	_.run = function(queue){
		if(queue.length>0){
			var name = queue.shift();
			var curr = path.join(_.tmp,name);
			var gruntfilePath = gruntfile(grunt,curr,_.options);
			grunt.tasks([],{verbose: _.options.moreLog, base:curr, gruntfile:gruntfilePath},function(){
				printLog(name,'已构建。。。');
				setTimeout(function(){
					_.run(queue);
				},150);
			});
		}else{
			printLog('##构建任务完成。。。');
			//清空临时文件
			shell.rm('-rf',_.tmp+'/*');
		}
	}

	return _;
};

module.exports = _;

if(debug){
	function catchError(err,fatal){
		if(err){
			console.log(new Date().getTime()+'\t',err);
			if(fatal){return;}	
		}
	}
	var deg = _();
	deg.test = function(){
		var inf = 'C://Users/Administrator/Desktop/static2'
		fs.exists(inf,function(exists){
			if(!exists) catchError("构建目录不存在！！！",true);
			fs.readdir(inf,function(err, files){
				catchError(err);
				var size = files.length;
				var queue = [];
				files.forEach(function(file,i){
					fs.stat(path.join(inf,file),function(err,stats){
						catchError(err);
						if(!err && stats && stats.isDirectory() && fs.existsSync(path.join(inf,file,'package.json')) ){
							queue.push(file);
						}
						if(i==size-1){
							var params = {
								inf:inf,
								outf:'C://Users/Administrator/Desktop/dist',
								queue:queue,
								moreLog:false,
								uglify:{}
							};
							deg.start(params);
						}
					});
				});
			});
		});
	}
	deg.formatPath = function(path){
		return path.replace(/\\/g,'/');
	}
	deg.test();
}