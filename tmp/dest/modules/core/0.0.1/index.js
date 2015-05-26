define('modules/core/0.0.1/index',['jquery'],function(require, exports, module) {
/*
 * core
 * https://github.com/johnkim/core
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */

var core = {};
var $ =require('jquery');

core.mapQuery = function() {
    //window.location.search
    var i,
        key,
        value,
        uri = uri && uri.split('#')[0] || window.location.search, //remove hash
        index = uri.indexOf("?"),
        pieces = uri.substring(index + 1).split("&"),
        params = {};
    if(index === -1){//如果连?号都没有,直接返回,不再进行处理. az 2011/5/11
        return params;
    }
    for(i=0; i<pieces.length; i++){
        try{
            index = pieces[i].indexOf("=");
            key = pieces[i].substring(0,index);
            value = pieces[i].substring(index+1);
            if(!(params[key] = unescape(value))){
                throw new Error("uri has wrong query string when run mapQuery.");
            }
        }
        catch(e){
            seajs.log("错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 2);
        }
    }
    return params;
};

/**
 对需要出现在一个URI的一部分的不信任输入进行编码
 例如:
 <a href="http://search.msn.com/results.aspx?q1=[Un-trusted-input]& q2=[Un-trusted-input]">Click Here!</a>
 以下字符将会被编码:
 除[a-zA-Z0-9.-_]以外的字符都会被替换成URL编码
 *
 * @memberOf string
 * @param {String} sStr
 * @return {String}
 */
core.encodeUriComponent = function(sStr){
    sStr = encodeURIComponent(sStr);
    sStr = sStr.replace(/~/g,"%7E");
    sStr = sStr.replace(/!/g,"%21");
    sStr = sStr.replace(/\*/g,"%2A");
    sStr = sStr.replace(/\(/g,"%28");
    sStr = sStr.replace(/\)/g,"%29");
    sStr = sStr.replace(/'/g,"%27");
    sStr = sStr.replace(/\?/g,"%3F");
    sStr = sStr.replace(/;/g,"%3B");
    return sStr;
};


module.exports = core;

});