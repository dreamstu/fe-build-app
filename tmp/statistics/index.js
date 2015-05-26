/*
 * statistics
 * https://github.com/johnkim/statistics
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */

var statistics = {};

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
        window.location.href='/statistics/tel/tradeInfo?current='+page+'&size='+params.size +'&'+ ops;
    }

    $('.btn').on('click',function(){
        var ops = getBaseFilterParams();
        goPage(0,ops);
    });

    function getBaseFilterParams(){
        var t = $(".tool .group input").serialize();
        return t==undefined? '':t+'&userId='+$('#userId').val();
    }

    //查询客服信息
    $.ajax({
        url:'/user/list',
        type:'GET',
        dataType:'json',
        success:function(rs){
            var userId = $('#userId');
            if(rs.success){
                $.each(rs.model,function(idx,mo){
                    if(!mo.isAdmin){
                        userId.append('<option value="'+mo.userId+'">'+mo.userName+'</option>');
                    }
                });
            }
        }
    });

});

module.exports = statistics;
