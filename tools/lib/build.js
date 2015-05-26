'use strict';
var quick = require('../utils/exports');

quick.initConfig = function(config){
    quick.config = quick.util.merge(quick.config,config || {});
};

module.exports = function() {
    var exports = {};
    var shell = require('shelljs');
    var fs = require('fs');
    var exists = fs.existsSync;
    var path = require('path');
    var prompt = require('prompt');
    var moment = require('moment');

    var Promise = quick.util.Promise;

    var tmpbuild = path.join(__dirname,'..','..','tmp','build');

    var $buildFolder = quick.config.build.path;
    var $buildFilterFolder = quick.config.build.filter || /^(node_modules|jquery|seajs|logs)$/i;
    var $logsFolder = path.resolve('..',quick.config.logFileFolder);
    var $force = quick.config.build.force || '';

    var $isStart = false; // 是否开始构建
    var $versions = [];
    var $dirs = [];

    //打印日志
    function print(fn,log,event){
        fn.call(quick.log,log);
    };

    //path
    exports.setConfig = function(confpath){
      var conf = require(confpath);
      conf(quick);
     $buildFolder = quick.config.build.path;
     $buildFilterFolder = quick.config.build.filter || /^(node_modules|jquery|seajs|logs)$/i;
     $logsFolder = path.resolve('..',quick.config.logFileFolder);
     $force = quick.config.build.force || '';
    }

    exports.start = function(){
      print(quick.log.debug,'用户设定待构建目录：\t'+$buildFolder);
      print(quick.log.debug,'将待构建文件拷贝至临时文件夹/tmp/build下');

      var temparr = [];
      shell.cd(path.join(__dirname,'..','..'));
      shell.rm('-rf', './tmp/build/*');
      shell.cp('-rf', [$buildFolder+'/*'],'./tmp/build');
      print(quick.log.debug,'待构建文件已拷贝到临时目录');
      print(quick.log.debug,'进入临时目录');
      //quick.log.debug("replace path.resolve('..','node_modules') to path.resolve('..','..', 'node_modules')");
      //shell.sed('-i', "path.resolve('..', 'node_modules')", "path.resolve('..','..', 'node_modules')", "node_modules/grunt/lib/grunt/task.js");
      if( !shell.test('-d', $logsFolder) ){
          shell.mkdir($logsFolder);
           print(quick.log.debug,'创建了日志目录 '+ $logsFolder);
      }
      //获取目标构建目录的可构建组件名称数组
      $dirs = exports.findModuleList('./tmp/build');
      print(quick.log.debug,'可构建的组件列表，共 '+$dirs.length+' 个组件：');
      print(quick.log.debug,'\t'+$dirs.join(' | ').bold.yellow);
      //back to root
      shell.cd(path.join(__dirname,'..','..'));
      return $dirs;
    };

    //查找可构建目录
    exports.findModuleList = function(buildpath){
        shell.cd(buildpath);
        return shell.ls('./').filter(function(file) {
            // 仅返回目录，并且过滤掉 node_modules 和 module-tpl 两个非组件目录以及其他一些特殊组件
            return !$buildFilterFolder.test(file) && shell.test('-d', file);
        });
    };

    //构建循环逻辑
    //$all 所有组件
    //$cmd 需要构建的组件，可以是字符串，代表一个组建名，可以是数组，代表一组组件名
    exports.main = function($all,$cmd,$cfg){
      print(quick.log.debug,'# 正在初始化，请稍后...','init');
      //重新回到构建目录
      shell.cd(tmpbuild);
      //判断是否有可构建的组件
      if ( $all.length && $all.length>0 ) {
          var $dirs = [];
          //用户给出的是一个待构建组件集合
          if(Object.prototype.toString.call($cmd) === '[object Array]'){
            print(quick.log.debug,'> 当前为批量构建命令');
            print(quick.log.debug,'> 校验组件');
            for (var i = $cmd.length - 1; i >= 0; i--) {
              var name = $cmd[i];
              if ( shell.test('-d', name) ) {
                  $dirs.push(name);
                  print(quick.log.debug,'\t`'+name+'`\t');
              } else {
                  print(quick.log.error,'> 错误的组件名 `'+name+'`');
                  if(!$cfg || ($cfg && !$cfg.skipError) ){
                    return;
                  }else{
                    print(quick.log.error,'> 已经跳过`'+name+'`组件');
                  }
              }
            }
          }else{
            //用户给出的是一个待构建组件名称或者是all
            if ( $cmd === "all") {
                quick.log.debug('all');
            }
            if ( shell.test('-d', $cmd) ) {
                $dirs.push($cmd);
            } else {
                print(quick.log.error,'> 错误的组件名 `'+$cmd+'`');
                if(!$cfg || ($cfg && !$cfg.skipError) ){
                  return;
                }
            }
          }
          print(quick.log.debug,'> 待构建队列：'+$dirs.join(', '));
          print(quick.log.debug,'## 即将开始，共 `'+$dirs.length+'` 个组件');
          print(quick.log.debug,$dirs.length,'build-length');//通知客户端总共要构建的数量
          exports.run($dirs);
      } else {
          print(quick.log.debug,'> 没有可以构建的组件');
      }
    };

    /***
     * 运行构建逻辑
     * @param dirs 需要构建的组件文件夹
     */
    exports.run = function(dirs){
        var name, version, buildpath,currentpath,pkgpath;
        if( dirs.length ){
            if( $isStart ) {
                print(quick.log.debug,'还有 `'+ dirs.length + '` 个组件等待构建...');
            }
            $isStart = true;
            name = dirs.shift();
            print(quick.log.debug,dirs.length,'build-number');//通知客户端剩余数量
            buildpath = path.join(__dirname,'..','..','tmp','build');
            currentpath = path.join(buildpath,name);
            pkgpath = path.join(currentpath,'package.json');
            // print(quick.log.debug,"找到package配置文件:"+pkgpath);
            version = quick.util.pkg('version', pkgpath);

            print(quick.log.debug,'### 当前是 '+name + '@' + version);

            $versions.push( '"'+name+'": ["'+ version +'"]');

            shell.cd(buildpath);//回到构建文件夹
            shell.cp('-f', '../Gruntfile.js', name+'/');
            shell.cd(name);

            shell.exec('grunt', {async:true},function(code, output) {
                if( output.indexOf('without errors') === -1 ){
                    (output).to(path.join($logsFolder,name+'.log'));
                }else{
                    print(quick.log.debug,output.slice(output.indexOf('Execution')-1));
                    exports.run(dirs);
                }
            });
        }else{
            fs.appendFile(path.join($logsFolder,'version.txt'), moment().format('llll')+'\t'+$versions);
            print(quick.log.debug,'## 构建完毕.');
            print(quick.log.debug,'本次构建日志文件存放在： `'+ $logsFolder+'`','build-end');
            print(quick.log.debug,'\n\n');
            //back to root
            shell.cd(path.join(__dirname,'..','..'));
        }
    };
    return exports;
};
