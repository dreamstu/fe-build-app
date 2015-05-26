var chartsTest;
var $ = require('jquery');
var charts = require('charts');
console.log(charts);
charts.initialize(['modules/exporting'],function(pluginName,pluginInit){
    pluginInit(charts.Highcharts);
});
charts.initialize(['modules/no-data-to-display'],function(pluginName,pluginInit){
    pluginInit(charts.Highcharts);
});
charts.initialize(['3d'],function(pluginName,pluginInit){
    pluginInit(charts.Highcharts);
});
charts.initialize(['themes/sand-signika'],function(pluginName,pluginInit){
    pluginInit(charts.Highcharts);
    setTimeout(function(){
        startDraw();
    },1000);
});

function startDraw(){
    var chart;
    charts.Highcharts.setOptions({
        lang:{
            loading: '加载中...',
            months:['一月', '二月', '三月', '四月', '五月', '六月','七月', '八月', '九月', '十月', '十一月', '十二月'],
            weekdays:["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            printChart:'打印图表',
            downloadJPEG:'导出为JPEG图片',
            downloadPNG:'导出为PNG图片',
            downloadSVG:'导出为SVG矢量图像',
            downloadPDF:'导出为PDF文档',
            resetZoom:'重置缩放',
            resetZoomTitle:'重置缩放比例为1:1',
            noData: "没有数据"
        }
    });

    $('#container').highcharts({
        loading: {
            hideDuration: 1000,
            showDuration: 1000
        },
        title: {
            text: '业绩（测试）',
            x: -20 //center
        },
        subtitle: {
            text: '来源: www.qipeipu.com',
            x: -20
        },
        xAxis: {
            categories: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月']
        },
        yAxis: {
            title: {
                text: '业绩 (万元)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '万元'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        navigation: {
            buttonOptions: {
                align: 'right',
                text:'操作'
            }
        },
        series: [{
            name: '阳江',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
            visible: false
        }, {
            name: '中山',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, {
            name: '东莞',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
            name: '广州',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });
    chart = $('#container').highcharts();
    //chart.showNoData("!!");
    //chart.showLoading();
}

$(function () {

});

module.exports = chartsTest;
