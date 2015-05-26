define('modules/loadcity/0.0.1/index',['jquery'],function(require, exports, module) {
var $ =require('jquery');
var loadcity = function(){
    var exports = {};
    exports.loadProvince = function(target,id){
        $.ajax({
            url:'/base/province/find/all',
            type:'GET',
            dataType:'json',
            success:function(rs){
                if(rs.success){
                    var models = rs.model;
                    if(models && models.length==0) return;
                    var tmp = '';
                    $.each(models,function(idx,mode){
                        if (mode.proId == id)
                            tmp+='<option value="'+mode.proId+'" selected="selected">'+mode.proName+'</option>';
                        else
                            tmp+='<option value="'+mode.proId+'">'+mode.proName+'</option>';
                    });
                    target.append(tmp);
                }else{
                    alert(rs.msg);
                }
            }
        });
    }
    exports.loadCity = function(target,proId,id){
        if(proId==-1){return;}
        $.ajax({
            url:'/base/city/find/{proId}'.replace('{proId}',proId),
            type:'GET',
            dataType:'json',
            success:function(rs){
                if(rs.success){
                    var models = rs.model;
                    if(models && models.length==0) return;
                    var tmp = '';
                    $.each(models,function(idx,mode){
                        if (mode.cityId == id) {
                            tmp += '<option value="' + mode.cityId + '" selected="selected">' + mode.cityName + '</option>';
                        }else
                            tmp+='<option value="'+mode.cityId+'">'+mode.cityName+'</option>';
                    });
                    target.append(tmp);
                }else{
                    alert(rs.msg);
                }
            }
        });
    }
    exports.loadArea = function(target,cityId,id,callback){
        if(cityId==-1){return;}
        $.ajax({
            url:'/base/area/find/{cityId}'.replace('{cityId}',cityId),
            type:'GET',
            dataType:'json',
            success:function(rs){
                if(rs.success){
                    var models = rs.model;
                    if(models && models.length==0) return;
                    var tmp = '';
                    $.each(models,function(idx,mode){
                        if (mode.areaId == id){
                            tmp+='<option value="'+mode.areaId+'" selected="selected">'+mode.areaName+'</option>';
                            callback && callback(mode.cityId);
                        }else
                            tmp+='<option value="'+mode.areaId+'">'+mode.areaName+'</option>';
                    });
                    target.append(tmp);
                }else{
                    alert(rs.msg);
                }
            }
        });
    }
    exports.loadAreaFull = function(callback){
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
    return exports;
}();
module.exports = loadcity;

});