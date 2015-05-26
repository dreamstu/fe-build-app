define('modules/edit-account/0.0.1/index',['common'],function(require, exports, module) {
var editAccount = {};require('common');
function loadProvince(target,id){
    $.ajax({
        url:'/base/province/find/all',
        type:'GET',
        dataType:'json',
        success:function(rs){
            if(rs.success){
                var models = rs.model;
                if(models.length==0) return;
                var tmp = '';
                $.each(models,function(idx,mode){
                    if (mode.proId == id)
                        tmp+='<option value="'+mode.proId+'" selected="selected">'+mode.proName+'</option>';
                    else
                        tmp+='<option value="'+mode.proId+'">'+mode.proName+'</option>';
                });
                target.append(tmp);
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

function loadCity(target,proId,id){
    $.ajax({
        url:'/base/city/find/{proId}'.replace('{proId}',proId),
        type:'GET',
        dataType:'json',
        success:function(rs){
            if(rs.success){
                var models = rs.model;
                if(models.length==0) return;
                var tmp = '';
                $.each(models,function(idx,mode){
                    if (mode.cityId == id) {
                        tmp += '<option value="' + mode.cityId + '" selected="selected">' + mode.cityName + '</option>';
                    }else
                        tmp+='<option value="'+mode.cityId+'">'+mode.cityName+'</option>';
                });
                target.append(tmp);
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

function loadArea(target,cityId,id,callback){
    $.ajax({
        url:'/base/area/find/{cityId}'.replace('{cityId}',cityId),
        type:'GET',
        dataType:'json',
        success:function(rs){
            if(rs.success){
                var models = rs.model;
                if(models.length==0) return;
                var tmp = '';
                $.each(models,function(idx,mode){
                    if (mode.areaId == id){
                        tmp+='<option value="'+mode.areaId+'" selected="selected">'+mode.areaName+'</option>';
                        callback(mode.cityId);
                    }else
                        tmp+='<option value="'+mode.areaId+'">'+mode.areaName+'</option>';
                });
                target.append(tmp);
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

function loadAreaFull(callback){
    $.ajax({
        url:'/wx/user/find/fullArea',
        type:'GET',
        dataType:'json',
        success:function(rs){
            if(rs.success){
                callback(rs.model);
            }
        }
    });
}

//加载职位
loadDept(dutyId,0);

loadAreaFull(function(params){
    loadArea(areaId,params.cityId,params.areaId,function(){
        loadCity(city,params.proId,params.cityId,function(){
            loadProvince(province,params.proId);
        });
    });
});
module.exports = editAccount;

});