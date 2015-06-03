var order_tj = {};
var $ = require('jquery');
require('common');
var moment = require('moment');
var loadcity = require('loadcity');
var layer = require('layer');
var laydate = require('laydate');
var tpl = require('tpl');
var pagination = require('pagination');
var listtpl = require('./src/list-tpl');

//禁用拖拽
layer.config({
    move:false
});

var loading;
$(document).on('ajaxSend', function () {
    loading = layer.load();
}).on('ajaxComplete', function () {
    layer.close(loading);
});

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
    breadcrumb1 = $('.breadcrumb1'),
    breadcrumb2 = $('.breadcrumb2'),
    exporting = $('#exporting'),
    exporting_box2 = $('#exporting_box2'),
    cache = {params:{}};

//事件绑定

var _start = {
    elem: '#startDate',
    format: 'YYYY-MM-DD',
    event: 'focus',
    choose: function(datas){
        _end.min = datas;
        _end.start = datas;
    }
};
var _end = {
    elem: '#endDate',
    event: 'focus',
    choose: function(datas){
        _start.max = datas;
    }
};

laydate(_start);
laydate(_end);


$('#query').on('click', function () {
    load();
});
orderCol.on('click',function(){
    var self = $(this);
    var active = self.hasClass('active');
    var val = self.data('val');
    var state = self.data('state');
    orderCol.removeClass('active');
    if(active && state!==undefined){
        self.data('val',val.slice(0,val.length-1)+state);
        if(state===0){
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

$('.timebtn').on('click','button.item',function(){
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

//主列表点击tr，展示此地区的详细数据
list.on('click','tr',function(){
    var _self = $(this);
    if(_self.hasClass('nodata')){
        return;
    }
    var areaId = _self.data('area');
    if(areaId===undefined){return;}
    var areaName = _self.data('areaname');
    //更新数据
    cache.params.currCityId = areaId;
    cache.params.currCityName = areaName;
    breadcrumb1.text(areaName);
    require.async('./src/list-tpl2', function (tpl) {
        cache.tpl2 = tpl;
        load2(0,function(){
            //打开弹窗
            box2.show();
            cache.d2 = layer.open({
                type: 1,
                title:'地区详细数据',
                area:'1024px',
                content:$('#box2')
            });
        });
    });
});

box2.on('click','#list2 tr',function(){
    var _self = $(this);
    if(_self.hasClass('nodata')){
        return;
    }
    var mfactyName = _self.data('mfactyname');
    var mfactyId = _self.data('mfactyid');
    cache.params.currMfctyId = mfactyId;
    breadcrumb2.text(mfactyName);
    require.async('./src/list-tpl3', function (tpl) {
        cache.tpl3 = tpl;
        load3(0, function () {
            //打开弹窗
            box3.show();
            cache.d3 = layer.open({
                type: 1,
                title:'厂家详细数据',
                area: '1024px',
                content: $('#box3')
            });
        });
    });
});

box3.on('click','.breadcrumb1',function(){
    cache.d3 && layer.close(cache.d3);
});

//函数
function getBaseFilterParams(){
    var areastr = $(".filter select").serialize();
    areastr = areastr ===undefined? '':areastr;
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
    return datestr ===undefined? '':datestr;
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
                        $(number).text(mode.statisticsOrderEntity[keys[idx]]);
                    }else{
                        $(number).text(mode.statisticsReturnEntity[keys[idx]]);
                    }
                });
            }
        }
    });
}

//加载主页面列表
function load(page){
    page = page===undefined?0:page;
    exporting.attr('href','/statisticsTrade/find/orderAndReturnForTradeAnalyseExportExcel?'+encodeURI(getBaseFilterParams()));
    $.ajax({
        url:'/statisticsTrade/find/orderAndReturnForTradeAnalyse',
        data:encodeURI(getBaseFilterParams()+'&size=10&current='+ page),
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var data = rst.model;
                if(!data.model || data.model.length<=0){
                    exporting.hide();
                }
                exporting.show();
                tpl(listtpl).render(data, function (render) {
                    list.empty().append(render.replace(/undefined/g,''));
                });
                pagination.init({
                    target:'.pager1',
                    total:data.total,
                    eachCount:data.size,
                    currentPage:data.current,
                    callback:load
                });
            }
        }
    });
}

function load2(page,callback){
    page = page===undefined?0:page;
    exporting_box2.attr('href','/statisticsTrade/find/statisticsOrderAndReturnForTradeAnalyseByCityIDExportExcel?'+encodeURI(getDateFilterParams()+'&cityID='+cache.params.currCityId));
    $.ajax({
        url:'/statisticsTrade/find/statisticsOrderAndReturnForTradeAnalyseByCityID',
        data:encodeURI(getDateFilterParams()+'&cityID='+cache.params.currCityId+'&size=10&current='+ page),
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var data = rst.model;
                if(!data.model || data.model.length<=0){
                    exporting_box2.hide();
                }
                exporting_box2.show();
                tpl(cache.tpl2).render(data, function (render) {
                    list2.empty().append(render.replace(/undefined/g,''));
                });
                pagination.init({
                    target:'.pager2',
                    total:data.total,
                    eachCount:data.size,
                    currentPage:data.current,
                    callback:load2
                });
                callback && callback();
            }
        }
    });
}

function load3(page,callback){
    page = page===undefined?0:page;
    $.ajax({
        url:'/statisticsTrade/find/statisticsByMfctyID',
        data:encodeURI(getDateFilterParams()+'&mfctyID='+cache.params.currMfctyId+'&size=10&current='+ page),
        dataType:'json',
        success:function(rst){
            if(rst.success){
                var data = rst.model;
                tpl(cache.tpl3).render(data, function (render) {
                    list3.empty().append(render.replace(/undefined/g,''));
                });
                pagination.init({
                    target:'.pager3',
                    total:data.total,
                    eachCount:data.size,
                    currentPage:data.current,
                    callback:load3
                });
                callback && callback();
            }
        }
    });
}

//初始化
loadTop();
load();
loadcity.loadProvince(province);

module.exports = order_tj;
