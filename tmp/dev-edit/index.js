var devEdit = {};
var $ = require('jquery');
require('calendar');
require('common');

$(function(){

    $('.time').datetimepicker({
        timepicker:true,
        format:'Y-m-d H:i:s'
    });

    function getBaseFilterParams(){
        var t = $(".edit ul li input").serialize();
        return t==undefined? '':t;
    }

    $('#submitBtn').on('click',function(){
        var ops = getBaseFilterParams();
        edit(ops);
    });

    function edit(ops){
        if(ops==undefined){
            return;
        }
        if($.trim($('#developUserID').val())==''){
            alert('请使用提示的开发人名称，不能使用提示列表之外的信息');
            return;
        }
        if($.trim($('#maintainUserID').val())==''){
            alert('请使用提示的维护人名称，不能使用提示列表之外的信息');
            return;
        }
        $.ajax({
            url:'/base/maintain/update',
            type:'POST',
            dataType:'json',
            data:ops,
            success: function (data) {
                if(data.success){
                    alert('信息更新成功！');
                    window.location.href = window.location.href;
                }else{
                    alert('信息更新失败！');
                }
            },
            error: function (data) {
                alert(data.msg+',请重试！');
            }
        })
    }

    listenChange('developUser',loadAccount);
    listenChange('maintainUser',loadAccount);

    function listenChange(inputId,changeCallback){
        function callback(){
            changeCallback.call(this);
        }
        var element = document.getElementById(inputId);
        if("\v"=="v") {
            element.onpropertychange = callback;
        }else{
            element.addEventListener("input",callback,false);
        }
    }
    var $searchResults = $('#searchResults');
    var $searchResultsList = $('#searchResults ul');

    function loadAccount(){
        var self = $(this);
        self.prev('input').val('');
        var dev = self.attr('id')=='developUser'?1:0;
        var key = self.val();
        $.ajax({
            url:'/find/byKey',
            data:'key='+key,
            dataType:'json',
            success: function (data) {
                if(data.success && data.model && data.model.length>0){
                    var tmp = '';
                    $searchResultsList.empty();
                    $.each(data.model,function(idx,data){
                        var li = document.createElement('li');
                        li = $(li).text(data.userName).data('data'+dev,data);
                        $searchResultsList.append(li);
                    });
                    $searchResults.css({
                        top:self.position().top+36
                    });
                    $searchResults.show();
                }
            }
        })
    }

    $searchResults.on('click','li',function(){
        var data = $(this).data('data1');
        var dev = 1;
        if(data==undefined){
            dev = 0;
            data = $(this).data('data0');
        }
        if(dev){
            $('#developUserID').val(data.userID);
            $('#developUser').val(data.userName);
            $('#developTel').val(data.mp);
        }else{
            $('#maintainUserID').val(data.userID);
            $('#maintainUser').val(data.userName);
            $('#maintainTel').val(data.mp);
        }
    });

    $(document).on('click',function(){
        $('#searchResults').hide();
    });

});
module.exports = devEdit;
