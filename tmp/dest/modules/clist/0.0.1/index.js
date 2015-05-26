define('modules/clist/0.0.1/index',['jquery','common','pagination','raty','calendar','dialog'],function(require, exports, module) {
/*
 * clist
 * https://github.com/johnkim/clist
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */

var $ =require('jquery');require('common');
var pagination =require('pagination');
$ =require('raty');require('calendar');
var dialog =require('dialog');

var clist = {};

$(function(){

    $('.star').raty({
        path:window.GLOBAL.CDN+'/css/plugin/raty/images/',
        hints: ['没希望了', '一线希望', '中立态度', '偏好态度', '强烈态度'],
        readOnly: true,
        score:function(){
            return $(this).attr('data-star');
        }
    });

    $('#start').datetimepicker();
    $('#end').datetimepicker();

    pagination.init({
        target:'.pager',
        total:params.total,
        eachCount:params.size,
        currentPage:params.current,
        callback:goPage
    });

    function getBaseFilterParams(){
        var t = $(".filter .group input").serialize();
        return t==undefined? '':t;
    }

    $('.btn').on('click',function(){
        var ops = getBaseFilterParams();
        goPage(0,ops);
    });

    function goPage(page,ops){
        ops = ops==undefined?'':ops;
        window.location.href='/customer/clist?current='+page+'&size='+params.size +'&'+ ops;
    }
});

module.exports = clist;

});