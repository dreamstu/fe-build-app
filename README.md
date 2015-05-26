# fe-build-app

fe-build for node-webkit clinet

#构建对象

适用与seajs模块

#模块生成

可利用 `quickjs` 生成

#quickjs安装方法
##使用淘宝镜像安装 [了解更多？](http://cnpmjs.org/)
  - `npm install -g cnpm --registry=https://r.cnpmjs.org`
  -  安装 `cnpm install -g quickjs`
  -  检查是否安装成功 `quick -v` 若安装成功则出现版本号
  - 生成seajs模块
    - 新建一个目录并进入 `mkdir test && cd test`
    - 运行 `quick init` 安装提示进行输入，直到成功
  - 构建seajs模块
    运行fe-build-app生成的可执行文件，选择seajs所在的父级文件夹为待构建目录。并选择一个输出目录，点击开始按钮进行构建，构建过程会通过日志打印到你眼前！

# TODO
  ...
  
