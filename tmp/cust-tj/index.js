var custTj;
var $ = require('jquery');
require('common');
var moment = require('moment');
var dialog = require('dialog');
var loadcity = require('loadcity');
var pagination = require('pagination');
require('calendar');

//DOMS
var dataPicker = $('.datepicker'),
    startDate = $('#startDate'),
    endDate = $('#endDate'),
    list = $('#list'),
    province = $('#province'),
    city = $('#city'),
    area = $('#area'),
    orderCol1 = $('#orderCol1'),
    loadingIcon1 = $('.icon-loading'),
    exporting = $('#exporting'),
    cache = {params:{}};

//事件绑定
dataPicker.datetimepicker({
    format:'Y-m-d'
});

function loading(obj){
    obj.toggleClass('fn-hide').toggleClass('fa-spin');
}

$('#query').on('click', function () {
    load();
});

orderCol1.on('change',function(){
    load();
});

$('.timebtn').on('click','button.item',function(e){
    var _self = $(this);
    var _siblings = _self.siblings();
    if(_self.hasClass('active')){
        dataPicker.removeAttr('disabled','none');
    }else{
        dataPicker.attr('disabled','disabled');
    }
    _siblings.removeClass('active').find('.arrow-up').addClass('fn-hide');
    _siblings.find('.arrow-text').addClass('fn-hide');
    _self.toggleClass('active').find('.arrow-up').toggleClass('fn-hide');
    _self.find('.arrow-text').toggleClass('fn-hide');
    //如果选择了时间区间，而不是的自定义时间区间的话，会将选择的时间区间设置在dataPicker的data上
    var day = _self.data('day');
    var today = moment().format('YYYY-MM-DD');
    var date = moment().subtract(day, 'days').format('YYYY-MM-DD');
    var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var end = day>0?yesterday:today;
    dataPicker.eq(0).data('date',date);
    dataPicker.eq(1).data('date',end);
    $('#startDate').val(date);
    $('#endDate').val(end);
});
$('button.item').eq(0).trigger('click');
province.on('change',function(){
    var val = province.val();
    city.find(':not(:first)').remove();
    area.find(':not(:first)').remove();
    if(val){
        loadcity.loadCity(city,val);
    }
});

city.on('change', function () {
    var val = city.val();
    if(val) {
        area.find(':not(:first)').remove();
        loadcity.loadArea(area, val);
    }
});

//函数
function getBaseFilterParams(){
    var areastr = $(".filter select").serialize();
    areastr = areastr ==undefined? '':areastr;
    return areastr+'&'+getDateFilterParams()+'&'+getOrderByFilterParams();
}

function getDateFilterParams(){
    var datestr = '';
    var btn = $(".filter button.active");
    if(btn.length<=0){
        datestr = $(".filter input").serialize();
    }else{
        datestr = 'start='+startDate.data('date')+'&end='+endDate.data('date');
    }
    return datestr ==undefined? '':datestr;
}

function getOrderByFilterParams(){
    var sortBy = orderCol1.val();
    return sortBy;
}

function loadTop(){
    var keys = ['dateRangeRegisterNum','transactionNum','sensitizeNum','activateNum'];
    $.ajax({
        url:'/statisticsTrade/find/allCustAnalyse',
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var mode = rst.model;
                var inner = $('#inner');
                var numbers = inner.find('.number');
                $.each(numbers,function(idx,number){
                    $(number).text(mode[keys[idx]]);
                });
            }
        }
    });
}

//加载主页面列表
function load(page){
    loading(loadingIcon1);
    page = page==undefined?0:page;
    exporting.attr('href','/statisticsTrade/find/statisticsCustTradeExportExcel?'+encodeURI(getBaseFilterParams()));
    $.ajax({
        url:'/ statisticsTrade/find/statisticsCustTrade',
        data:encodeURI(getBaseFilterParams()+'&size=10&current='+ page),
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var mode = rst.model;
                var tmp = '';
                if(!mode.model || mode.model.length<=0){
                    list.empty().append(['<tr class="nodata">',
                        '<td colspan="7">没有符合条件的数据</td>',
                        '</tr>'].join(''));
                    exporting.hide();
                    return;
                }
                exporting.show();
                $.each(mode.model,function(idx,model){
                    var statisticsTrade = model.statisticsTradeEntity;
                    var statisticsOrderEntity = statisticsTrade.statisticsOrderEntity;
                    tmp+=['<tr class="data">',
                        '<td>',
                        model.cityName,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.dateRangeRegisterNum,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.transactionNum,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.sensitizeNum,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.activateNum,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.tradeStayRatio,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.activateRatio,
                        '</td>',
                        '</tr>'].join('');
                });
                list.empty().append(tmp);
                pagination.init({
                    target:'.pager1',
                    total:mode.total,
                    eachCount:mode.size,
                    currentPage:mode.current,
                    callback:load
                });
            }
        },
        complete:function(){
            loading(loadingIcon1);
        }
    });
}

//初始化
loadTop();
load();
loadcity.loadProvince(province);

module.exports = custTj;
