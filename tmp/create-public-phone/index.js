var listPublicPhone = {};
var $ = require('jquery');
require('common');

var contactTypeName = document.getElementById('contactTypeName'),
    contactTypeID = document.getElementById('contactTypeID'),
    delBtn = $('#delBtn'),
    backBtn = $('#backBtn'),
    backUrl = '/base/pubPhone/find/pub/all';

$('#submitBtn').on('click',function(){
    form.submit();
});

$.ajax({
    url:'/wx/phone/getContectType',
    dataType:'json',
    success: function (data) {
        if(data.success && data.model && data.model.length>0){
            contactTypeName.innerHTML = '';
            $.each(data.model,function(idx,data){
                var option = document.createElement('option');
                option.id = data.typeID;
                option.text = data.typeName;
                if(params.contactTypeID==data.typeID){
                    option.selected = 'selected';
                }
                contactTypeName.appendChild(option);
            });
            if(params.contactTypeID==''){
                $(contactTypeID).val(1);
            }
        }
    }
});

$(contactTypeName).on('change',function(){
    $(contactTypeID).val($('#contactTypeName option:selected')[0].id);
});
backBtn.on('click',function(){
    location.href=backUrl;
});
delBtn.on('click',function(){
    if(confirm('你确定删除此号码？')){
        $.ajax({
            url:'/base/pubPhone/del',
            data:'id='+params.id,
            type:'GET',
            dataType:'json',
            success: function (data) {
                if(data.success){
                    alert('号码已删除！');
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

module.exports = listPublicPhone;
