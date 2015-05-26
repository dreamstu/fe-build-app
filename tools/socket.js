var path = require('path');
var appcfg = require('../configs/app-cfg');
var getColor=function(){
  var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
                'orange','blue','blueviolet','brown','burlywood','cadetblue'];
  return colors[Math.round(Math.random() * 10000 % colors.length)];
};
var getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
};

function getRealPath(project){
  return path.join(__dirname,'..',appcfg.procfg,appcfg.procfgs[project],project)+'.js';
}

module.exports = {
  start: function(io) {
    //设置日志级别
    io.set('log level', 1);
    io.on('connection', function(socket) {
      socket.emit('open'); //通知客户端已连接
      socket.emit('init','> 初始化完成,待就绪\r\n');
      socket.on('start', function(obj) {
        //设置配置文件
        var build = require('../tools/lib/build')(socket);
        build.setConfig(getRealPath(obj.path));
        build.main(obj.all,obj.dirs,obj.cfg);
      });

      // 构造客户端对象
      var client = {
        socket: socket,
        name: false,
        color: getColor()
      }

      //监听出退事件
      socket.on('disconnect', function() {
        var obj = {
          time: getTime(),
          color: client.color,
          author: 'System',
          text: client.name,
          type: 'disconnect'
        };
        console.log('>>> 用户已退出');
        // 广播用户已退出
        socket.broadcast.emit('system', obj);
      });

    });
  }
}
