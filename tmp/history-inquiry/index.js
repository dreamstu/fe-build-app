/*
 * history_inquiry
 * https://github.com/johnkim/history_inquiry
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */
var $ = require('jquery');
var dialog = require('dialog');
require('common');
if(typeof params!="undefined" && params.need && params.need=='true'){
    $('tr').on('click',function(){
        var inquiryId = $.trim($(this).attr('data-id'));
        if(inquiryId=='' || inquiryId ==undefined) return;
        dialog({
            id: 'ajax',
            type:'iframe',
            title:'询价单及物流详情信息',
            content: '/bill/inquiryInfo?inquiryId='+inquiryId,
            width: 850,
            height: 500,
            skin: 'greybox',
            textOk:'关闭',
            onok: function( panel, dialog ){
                dialog.close();
            },
            offsetY: -50
        }).show();
    });
}

var history_inquiry = {};

//write your code

module.exports = history_inquiry;
