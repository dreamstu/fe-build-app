/*
 * statistics_all
 * https://github.com/johnkim/statistics_all
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */

var statistics_all = {};

var pagination = require('pagination');
var $ = require('jquery');
require('common');
require('calendar');

$(function(){
    $('.start').datetimepicker({lang:'ch',timepicker:false, format:'Y-m-d'});
    $('.end').datetimepicker({lang:'ch',timepicker:false, format:'Y-m-d'});

    pagination.init({
        target:'.pager',
        total:params.total,
        eachCount:params.size,
        currentPage:params.current,
        callback:goPage
    });

    function goPage(page,ops){
        ops = ops==undefined?'':ops;
        window.location.href='/statistics/summary/tradeInfo?current='+page+'&size='+params.size +'&'+ ops;
    }

    $('.btn').on('click',function(){
        var ops = getBaseFilterParams();
        goPage(0,ops);
    });

    function getBaseFilterParams(){
        var t = $(".tool .group input").serialize();
        return t==undefined? '':t;
    }
});

module.exports = statistics_all;
