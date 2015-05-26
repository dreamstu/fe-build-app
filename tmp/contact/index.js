/*
 * contact
 * https://github.com/johnkim/contact
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */

var contact = {};

var $ = require('jquery');
require('common');
var pagination = require('pagination');
$ = require('raty');
require('calendar');
var dialog = require('dialog');


$(function() {

    $('#start').datetimepicker({lang:'ch',timepicker:false, format:'Y-m-d'});
    $('#end').datetimepicker({lang:'ch',timepicker:false, format:'Y-m-d'});

    pagination.init({
        target: '.pager',
        total: params.total,
        eachCount: params.size,
        currentPage: params.current,
        callback: goPage
    });

    function goPage(page,ops){
        window.location.href='/customer/memo/'+params.id+'?current='+page+'&size='+params.size +'&'+ ops;
    }

    $('#star').raty({
        path:window.GLOBAL.CDN+'/css/plugin/raty/images/',
        hints: ['没希望了', '一线希望', '中立态度', '偏好态度', '强烈态度'],
        target : '#hint',
        targetKeep:true,
        score:function(){
            return $(this).attr('data-star') || 0;
        },
        scoreName:'star'
    });

    $('#new').on('submit',function(){
        if($.trim($('#content').val())==""){
            return false;
        }
        var action = $(this).attr('action');
        var params = $(this).serialize();
        $.ajax({
            url:action,
            type:'POST',
            data:params,
            dataType:'json',
            success:function(rs){
                if(rs.success){
                }
                dialog({
                    id: 'ajax',
                    content: rs.msg,
                    width: 300,
                    skin: 'greybox',
                    textOk: '关闭',
                    onok: function (panel, dialog) {
                        if(window.localStorage){
                            window.localStorage.removeItem("memo-content");
                        }
                        dialog.close();
                    },
                    onclose:function(){
                        window.location.reload();
                    },
                    offsetY: -50
                }).show();
            }
        });
        return false;
    });

    function getBaseFilterParams(){
        var t = $(".history .tool .group input").serialize();
        return t==undefined? '':t;
    }

    $('.history').on('click','#query',function(){
        var ops = getBaseFilterParams();
        goPage(0,ops);
    });

    require.async('store');
    //自动设置值
    if(window.localStorage){
        $('#content').val(window.localStorage.getItem("memo-content"));
    }

    setInterval(autoSave,3000);
    function autoSave(){
        if(needAutoSave() && window.localStorage){
            window.localStorage.setItem("memo-content",$('#content').val());
            seajs.log('已自动保存．');
        }
    }

    function needAutoSave(){
        return $('#isautosave').attr('checked')=='checked' && $.trim($('#content').val())!='';
    }
});

module.exports = contact;