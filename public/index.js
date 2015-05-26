var fs = require('fs');
var path = require('path');
var gui = require('nw.gui');
var shell = gui.Shell;
var build = require('./lib/build')(document);
var pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
var menubar = new gui.Menu({ type: 'menubar' });
var sub1 = new gui.Menu();

sub1.append(new gui.MenuItem({
	label: '打开',
	click: function() {
		var element = document.createElement('div');
		element.appendChild(document.createTextNode('Test 1'));
		document.body.appendChild(element);
	}
}));

menubar.append(new gui.MenuItem({ 
	label: '菜单',
	submenu: sub1 
}));

var win = gui.Window.get();
win.menu = menubar;



var $ = function(el){
	return document.querySelector(el);
}

//窗口逻辑
var closeBtn = $('#closebtn');
var minBtn = $('#minbtn');
var aboutBtn = $('#aboutbtn');
var debugBtn = $('#debugbtn');
var title = $('#title');
//设置标题
title.innerHTML = pkg.description+' '+pkg.version;

//调试模式窗口
debugBtn.onclick = function(){
	win.showDevTools('', true);
	win.on("devtools-opened", function(url) {
	    console.log("devtools-opened: welcome");
	});
}

closebtn.onclick = function(){
	if(confirm('你要关闭构建工具吗？')){
		win.close();
	}
}
minBtn.onclick = function(){
	win.minimize();
}
var aboutWin = null;
aboutBtn.onclick = function(){
	if(aboutWin){
		aboutWin.show();
	}else{
		aboutWin = gui.Window.open('./about.html',{
		  position: 'center',
		  width: 550,
		  height: 220,
		  resizable:false,
		  minimize:false,
		  focus:true,
		  toolbar:false
		});
		aboutWin.on('close',function(){
			this.hide();
		});
	}
}

win.on('close',function(){
	if(aboutWin){
		aboutWin.close(true);
	}
	this.hide();
	this.close(true);
});

function openInexplorer(url){
	shell.openExternal(url);
}


//构建逻辑

var startBtn = $('#start');
var inFolder = $('#inFolder');
var outFolder = $('#outFolder');
var moreLog = $('#moreLog');
var uglify = $('#uglify');
var ideading = $('#ideading');


//选择文件夹
var inFolderTrigger = $('#inFolderTrigger');
var outFolderTrigger = $('#outFolderTrigger');
inFolderTrigger.onclick = function(){
	inFolder.click();
}
outFolderTrigger.onclick = function(){
	outFolder.click();
}
inFolder.onchange = function(){
	inFolderTrigger.value = this.value;
}
outFolder.onchange = function(){
	outFolderTrigger.value = this.value;
}


startBtn.onclick = function(){
	var inf = inFolder.value;
	var outf = outFolder.value;
	if(inf==''){
		alert('构建目录没选');
		return;
	}
	if(outf==''){
		alert('输出目录没选');
		return;
	}
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
						//构造可选参数
						var params = {
							inf:inf,
							outf:formatPath(outf),
							queue:queue,
							moreLog:moreLog.checked,
							uglify:uglify.checked,
							id:ideading.value
						};
						build.start(params);
					}
				});
			});
		});
	});

	function formatPath(path){
		return path.replace(/\\/g,'/');
	}
};


/**
 *处理错误
 * err 错误堆栈
 * fatal 是否致命，致命终止程序的执行
**/
function catchError(err,fatal){
	if(err){
		console.log(new Date().getTime()+'\t',err);
		if(fatal){return;}	
	}
}