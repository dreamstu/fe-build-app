var register = function(quick){
    var _ = {};
    _.Promise = require('bluebird');
    _.fs = require('fs');
    _._ = require('lodash');
    // Windows?
    var win32 = process.platform === 'win32';
    var confName = quick.config.confFileName;

    //You can't use merge in util.js
    _.merge = function(source,target){
        if(typeof source === 'object' && typeof target === 'object'){
            for(var key in source){
                if(target.hasOwnProperty(key)) {
                    if(typeof target[key] === 'function' ){
                        target[key] = source[key];
                    }else{
                        source[key] = _.merge(source[key], target[key]);
                    }
                }else{
                    target[key] = source[key];
                }
            }
            for(var key in target){
                if(!source.hasOwnProperty(key)) {
                    source[key] = target[key];
                }
            }
        } else {
            source = target;
        }
        return source;
    };

    _.hasArgv = function(argv, search){
        var pos = argv.indexOf(search);
        var ret = false;
        while(pos > -1){
            argv.splice(pos, 1);
            pos = argv.indexOf(search);
            ret = true;
        }
        return ret;
    };

    /***
     * trim函数,作用为去掉字符串中所有的空字符串
     * @param str
     * @returns {XML|string|void}
     */
    _.trim = function(str){
        return str.replace(/(^\s*)|(\s*$)/g,"");
    };

    /***
     * 取package.json中的某一项值
     * @param key
     * @param file
     * @returns {*}
     */
    _.pkg = function(key, file){
        var result;
        key = key || '';
        file = file || 'package.json';
        try {
            // 注意；readFileSync的返回值是object类型，不是string类型
            result = JSON.parse(_.fs.readFileSync(file));
            return key ? result[key] : result;
        } catch(e) {
            throw Error('_.pkg(): JSON.parse error');
        }
    };
    /***
     * 获取系统用户目录
     * @returns {*}
     */
    _.userDir = function() {
        return process.env[win32 ? 'USERPROFILE' : 'HOME'];
    };
    return _;
};
module.exports = {
    register:register
};
