var createAccount = {};
var $ = require('jquery');
var dialog = require('dialog');
var core = require('core');
var loadcity = require('loadcity');
require('common');
$(function() {
    var mp = $('#mp'),
        email = $('#email'),
        mfctyName = $('#mfctyName'),
        address = $('#address'),
        cactMan = $('#cactMan'),
        cactTel = $('#cactTel'),
        createTime = $('#createTime'),
        dutyId = $('#dutyId'),
        province = $('#Province'),
        city = $('#City'),
        areaId = $('#areaId'),
        loginPwd = $('#loginPwd'),
        reloginPwd = $('#reloginPwd'),
        submitBtn = $('#submitBtn'),
        goList = $('#goList'),
        delBtn = $('#delBtn'),
        resetPwdBtn = $('#resetPwdBtn'),
        backBtn = $('#backBtn'),
        backUrl = '/mobile/account/index.do';
        form = $('#form');


    var emptytpl ='<option value="-1">请先选择上一级</option>';

    function loadDept(target,id){
        $.ajax({
            url:'/base/duty/find',
            type:'GET',
            dataType:'json',
            success:function(rs){
                if(rs.success){
                    var models = rs.model;
                    if(models.length==0) return;
                    var tmp = '';
                    $.each(models,function(idx,mode){
                        if (mode.dutyID == id)
                            tmp+='<option value="'+mode.dutyID+'" selected="selected">'+mode.dutyName+'</option>';
                        else
                            tmp+='<option value="'+mode.dutyID+'">'+mode.dutyName+'</option>';
                    });
                    target.empty().append(tmp);
                }else{
                    dialog({
                        id: 'ajax',
                        content: rs.msg,
                        padding:10,
                        skin: 'greybox',
                        onok: function( panel, dialog ){
                            dialog.close();
                        },
                        offsetY: -50
                    }).show();
                }
            }
        });
    }

    //加载职位
    loadDept(dutyId,params.dutyID);
    //初始化省份
    loadcity.loadProvince(province,params.provinceID!=''?params.provinceID:undefined);
    if(params.provinceID && params.cityId && params.areaId){
        loadcity.loadCity(city,params.provinceID,params.cityId);
        loadcity.loadArea(areaId,params.cityId,params.areaId,null);
    }

    province.on('change',function(){
        var val = province.val();
        city.find(':not(:first)').remove();
        areaId.find(':not(:first)').remove();
        if(val){
            loadcity.loadCity(city,val);
        }
    });
    city.on('change', function () {
        var val = city.val();
        if(val) {
            areaId.find(':not(:first)').remove();
            loadcity.loadArea(areaId, val);
        }
    });

    submitBtn.on('click',function(){
        form.submit();
    });
    goList.on('click',function(){
       window.location.href='/base/account/find/all';
    });

    delBtn.on('click',function(){
        if(confirm('你确定删除此账户？')){
            $.ajax({
                url:'/base/account/del',
                data:'id='+params.id,
                type:'POST',
                dataType:'json',
                success: function (data) {
                    if(data.success){
                        alert('删除成功！');
                        location.href=document.referrer;
                    }else{
                        alert(data.msg);
                    }
                },error:function(){
                    alert('删除失败！');
                }
            });
        }
    });

    resetPwdBtn.on('click',function(){
        if(confirm('你确定重置此账户密码？')){
            $.ajax({
                url:'/base/account/reset',
                data:'id='+params.id,
                type:'GET',
                dataType:'json',
                success: function (data) {
                    if(data.success){
                        alert('重置完成，初始密码为c123456！');
                        location.href=backUrl;
                    }else{
                        alert(data.msg);
                    }
                },error:function(){
                    alert('重置失败！');
                }
            });
        }
    });

});

module.exports = createAccount;
