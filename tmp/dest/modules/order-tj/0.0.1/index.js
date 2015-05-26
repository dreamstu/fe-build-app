define('modules/order-tj/0.0.1/index',['jquery','common','moment','dialog','loadcity','pagination','calendar'],function(require, exports, module) {
var order_tj = {};
var $ =require('jquery');require('common');
var moment =require('moment');
var dialog =require('dialog');
var loadcity =require('loadcity');
var pagination =require('pagination');require('calendar');

//DOMS
var dataPicker = $('.datepicker'),
    startDate = $('#startDate'),
    endDate = $('#endDate'),
    list = $('#list'),
    list2 = $('#list2'),
    list3 = $('#list3'),
    province = $('#province'),
    city = $('#city'),
    area = $('#area'),
    box2 = $('#box2'),
    box3 = $('#box3'),
    orderCol = $('th[scope="sort"]'),
    orderCol1 = $('#orderCol1'),
    orderCol2 = $('#orderCol2'),
    orderCol3 = $('#orderCol3'),
    loadingIcon1 = $('.icon-loading'),
    breadcrumb1 = $('.breadcrumb1'),
    breadcrumb2 = $('.breadcrumb2'),
    exporting = $('#exporting'),
    exporting_box2 = $('#exporting_box2'),
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
orderCol.on('click',function(){
    var self = $(this);
    var active = self.hasClass('active');
    var val = self.data('val');
    var state = self.data('state');
    orderCol.removeClass('active');
    if(active && state!=undefined){
        self.data('val',val.slice(0,val.length-1)+state);
        if(state==0){
            self.find('b').removeClass('fa-sort-amount-desc').addClass('fa-sort-amount-asc');
        }else{
            self.find('b').removeClass('fa-sort-amount-asc').addClass('fa-sort-amount-desc');
        }
        self.data('state',state?0:1);
        self.addClass('active');
    }else{
        self.addClass(active?'':'active');
    }
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
    //console.log(day,date,day>0?yesterday:today);
    var end = day>0?yesterday:today;
    dataPicker.eq(0).data('date',date);
    dataPicker.eq(1).data('date',end);
    $('#startDate').val(date);
    $('#endDate').val(end);
    //console.log($('#startDate').data('date'));
    //console.log($('#endDate').data('date'));
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
//主列表点击tr，展示此地区的详细数据
list.on('click','tr',function(){
    var _self = $(this);
    if(_self.hasClass('nodata')){
        return;
    }
    var areaId = _self.data('area');
    if(areaId==undefined){return;}
    var areaName = _self.data('areaname');
    //更新数据
    cache.params.currCityId = areaId;
    cache.params.currCityName = areaName;
    breadcrumb1.text(areaName);
    load2();
    //打开弹窗
    if(!cache.d2){
        box2.show();
        cache.d2 = dialog({
            id: 'tip1',
            title:'提示',
            content: $('#box2'),
            width:'1024',
            skin: 'greybox',
            onok: function( panel, dialog ){
                dialog.close();
            },
            textOk:'关闭'
        });
        return;
    }
    cache.d2.show();
});
box2.on('click','#list2 tr',function(){
    var _self = $(this);
    if(_self.hasClass('nodata')){
        return;
    }
    cache.d2.close();
    var mfactyName = _self.data('mfactyname');
    var mfactyId = _self.data('mfactyid');
    cache.params.currMfctyId = mfactyId;
    breadcrumb2.text(mfactyName);
    load3();
    //打开弹窗
    if(!cache.d3){
        box3.show();
        cache.d3 = dialog({
            id: 'tip2',
            title:'提示',
            content: $('#box3'),
            width:'1024',
            skin: 'greybox',
            onok: function( panel, dialog ){
                dialog.close();
            },
            textOk:'关闭'
        });
        return;
    }
    cache.d3.show();
});

box3.on('click','.breadcrumb1',function(){
    if(cache.d3){
        cache.d3.close();
        cache.d2.show();
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
    var sortBy = $('th[scope="sort"].active').data('val') || '';
    return sortBy;
}

function loadTop(){
    var keys = ['totalOrder','orderNum','totalChargeback','totalChargebackNum'];
    $.ajax({
        url:'/statisticsTrade/find/orderAndReturnForYesterdayTradeAnalyse',
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var mode = rst.model;
                var inner = $('#inner');
                var numbers = inner.find('.number');
                $.each(numbers,function(idx,number){
                    if(idx<=1){
                        $(number).text(mode['statisticsOrderEntity'][keys[idx]]);
                    }else{
                        $(number).text(mode['statisticsReturnEntity'][keys[idx]]);
                    }
                });
            }
        }
    });
}

//加载主页面列表
function load(page){
    loading(loadingIcon1);
    page = page==undefined?0:page;
    exporting.attr('href','/statisticsTrade/find/orderAndReturnForTradeAnalyseExportExcel?'+encodeURI(getBaseFilterParams()));
    $.ajax({
        url:'/statisticsTrade/find/orderAndReturnForTradeAnalyse',
        data:encodeURI(getBaseFilterParams()+'&size=10&current='+ page),
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var mode = rst.model;
                var tmp = '';
                if(!mode.model || mode.model.length<=0){
                    list.empty().append(['<tr class="nodata">',
                        '<td colspan="9">没有符合条件的数据</td>',
                        '</tr>'].join(''));
                    exporting.hide();
                    return;
                }
                exporting.show();
                $.each(mode.model,function(idx,model){
                    var statisticsTrade = model.statisticsTradeEntity;
                    var statisticsOrderEntity = statisticsTrade.statisticsOrderEntity;
                    var statisticsReturnEntity = statisticsTrade.statisticsReturnEntity;
                    tmp+=['<tr class="data" data-area="',
                        model.cityID,
                        '" data-areaname="',
                        model.cityName,
                        '">',
                        '<td>',
                        model.cityName,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.totalOrder,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.orderNum,
                        '</td>',
                        '<td>',
                        statisticsReturnEntity.totalChargeback,
                        '</td>',
                        '<td>',
                        statisticsReturnEntity.totalChargebackNum,
                        '</td>',
                        '<td>',
                        statisticsTrade.orderReturnRatio,
                        '</td>',
                        '<td>',
                        statisticsTrade.returnNumToOrderNumRatio,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.registerToFirstTradeDayAverage,
                        '</td>',
                        '<td>',
                        statisticsOrderEntity.sensitizeToFirstTradeDayAverage,
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

function load2(page){
    page = page==undefined?0:page;
    exporting_box2.attr('href','/statisticsTrade/find/statisticsOrderAndReturnForTradeAnalyseByCityIDExportExcel?'+encodeURI(getDateFilterParams()+'&cityID='+cache.params.currCityId));
    $.ajax({
        url:'/statisticsTrade/find/statisticsOrderAndReturnForTradeAnalyseByCityID',
        data:encodeURI(getDateFilterParams()+'&cityID='+cache.params.currCityId+'&size=10&current='+ page),
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var mode = rst.model;
                var tmp = '';
                if(!mode.model || mode.model.length<=0){
                    list2.empty().append(['<tr class="nodata">',
                        '<td colspan="5">没有符合条件的数据</td>',
                        '</tr>'].join(''));
                    exporting_box2.hide();
                    return;
                }
                exporting_box2.show();
                $.each(mode.model,function(idx,model){
                    tmp+=['<tr class="data" data-mfactyId="',
                        model.mfctyID,
                        '" data-mfactyname="',
                        model.mfctyName,
                        '">',
                        '<td>',
                        model.mfctyName,
                        '</td>',
                        '<td>',
                        model.allOrderMoney,
                        '</td>',
                        '<td>',
                        model.orderAllNum,
                        '</td>',
                        '<td>',
                        model.returnGoodsMenoy || 0,
                        '</td>',
                        '<td>',
                        model.returnGoodsNum || 0,
                        '</td>',
                        '</tr>'].join('');
                });
                list2.empty().append(tmp);
                pagination.init({
                    target:'.pager2',
                    total:mode.total,
                    eachCount:mode.size,
                    currentPage:mode.current,
                    callback:load2
                });
            }
        }
    });
}

function load3(page){
    page = page==undefined?0:page;
    $.ajax({
        url:'/statisticsTrade/find/statisticsByMfctyID',
        data:encodeURI(getDateFilterParams()+'&mfctyID='+cache.params.currMfctyId+'&size=10&current='+ page),
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var mode = rst.model;
                var tmp = '';
                if(!mode.model || mode.model.length<=0){
                    list3.empty().append(['<tr class="nodata">',
                        '<td colspan="5">没有符合条件的数据</td>',
                        '</tr>'].join(''));
                    return;
                }
                $.each(mode.model,function(idx,model){
                    tmp+=['<tr class="data">',
                        '<td>',
                        model.orderMainNo,
                        '</td>',
                        '<td>',
                        model.money,
                        '</td>',
                        '<td>',
                        model.payTime,
                        '</td>',
                        '<td>',
                        model.receiveName,
                        '</td>',
                        '<td>',
                        model.receiveAddress,
                        '</td>',
                        '</tr>'].join('');
                });
                list3.empty().append(tmp);
                pagination.init({
                    target:'.pager3',
                    total:mode.total,
                    eachCount:mode.size,
                    currentPage:mode.current,
                    callback:load3
                });
            }
        }
    });
}

//初始化
loadTop();
load();
loadcity.loadProvince(province);

module.exports = order_tj;

});