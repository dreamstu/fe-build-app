var devList = {};
var $ = require('jquery');
var pagination = require('pagination');
var dialog = require('dialog');
require('common');
$(function(){

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

    function goPage(page){
        var ops = getBaseFilterParams();
        ops = ops==undefined?'':ops;
        window.location.href='/base/maintain/find/all?current='+page+'&size='+params.size +'&'+ ops;
    }
});

module.exports = devList;
