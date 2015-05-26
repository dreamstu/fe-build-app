/*
 * pagination
 * https://github.com/johnkim/pagination
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */
var $ = require('jquery');

if (typeof Object.create !== 'function') {
    Object.create = function(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
var pagination = {
    init: function(options) {
        var self = this;
        self.options = $.extend({}, pagination.options, options);
        self.options.targetBox = $(options.target); //挂载的容器
        self._initPage();
    },
    _initPage: function() {
        var self = this;
        //totalPage, selector, currPage, callback
        var total = parseInt(self.options.total); //总条数
        var currentPage = parseInt(self.options.currentPage) + 1; //当前页 +1
        var eachCount = self.options.eachCount; //每页数量
        var totalPage = self._getTotalPage(total, eachCount); //总页数
        /**总页数**/
        self.options._totalPage = totalPage;
        var callback = self.options.callback; //回调
        var html = '<div class="ui-paging fn-right">';
        if (currentPage == 1) {
            html += self._getItemHtml('prev-disable');
        } else {
            html += self._getItemHtml('prev');
        }
        if (totalPage <= 7) {
            for (var i = 1; i < totalPage + 1; i++) {
                //console.info(currentPage,i,currentPage==i);
                if (currentPage == i) {
                    html += self._getItemHtml(i, 'current');
                } else {
                    html += self._getItemHtml(i);
                }
            }
        } else if (currentPage <= 3) {
            for (var i = 1; i < currentPage; i++) {
                html += self._getItemHtml(i);
            }
            html += self._getItemHtml(currentPage, 'current') + self._getItemHtml(currentPage + 1) + self._getItemHtml(currentPage + 2) + self._getItemHtml('etc') + self._getItemHtml(totalPage);
        } else if (currentPage >= totalPage - 2) {
            html += self._getItemHtml(1) + self._getItemHtml('etc') + self._getItemHtml(currentPage - 2) + self._getItemHtml(currentPage - 1) + self._getItemHtml(currentPage, 'current');
            for (var i = currentPage + 1; i < totalPage + 1; i++) {
                html += self._getItemHtml(i);
            }
        } else {
            html += self._getItemHtml(1);
            if (currentPage - 2 > 2) {
                html += self._getItemHtml('etc');
            }
            html += self._getItemHtml(currentPage - 2) + self._getItemHtml(currentPage - 1) + self._getItemHtml(currentPage, 'current') + self._getItemHtml(currentPage + 1) + self._getItemHtml(currentPage + 2);
            if (currentPage + 2 < totalPage - 1) {
                html += self._getItemHtml('etc');
            }
            html += self._getItemHtml(totalPage);
        }
        if (currentPage == totalPage) {
            html += self._getItemHtml('next-disable');
        } else {
            html += self._getItemHtml('next');
        }
        html += self._getItemHtml(currentPage, 'total', totalPage);
        html += self._getItemHtml(currentPage, 'goto');
        $(self.options.targetBox).html(html);
        //bind events
        self._events(self.options.targetBox, callback);
    },
    _getTotalPage: function(recordtotal, perPage) {
        var pc = Math.ceil(recordtotal / perPage);
        return (pc == 0) ? 1 : pc;
    },
    _events: function(targetBox, callback) {
        var self = this;
        var box = $(targetBox);
        box.find('a').on('click', function() {
            var gotoPage = 0;
            var data = $(this).attr('data-page');
            if (data == "currpage") {
                return;
                gotoPage = data;
            } else if (data == "prev") {
                var prevPage = box.find(".gn-current").text();
                gotoPage = (parseInt(prevPage)) - 1;
            } else if (data == "next") {
                var nextPage = box.find(".gn-current").text();
                gotoPage = (parseInt(nextPage)) + 1;
            } else if (data == "goto") {
                gotoPage = box.find(".gn-input").val();
                if (isNaN(gotoPage) || gotoPage > self.options._totalPage) {
                    gotoPage = box.find(".gn-current").text();
                } else if (gotoPage <= 0) {
                    gotoPage = 1;
                } else if (gotoPage == box.find(".gn-current").text()) {
                    return false;
                }
            } else {
                gotoPage = data;
            }
            //console.info('page:'+gotoPage+'----sysPage:'+(gotoPage-1));
            if (typeof callback != "function") {
                throw new TypeError();
            } else {
                callback((gotoPage - 1));
            }
        });
    },
    goPage: function(page) {},
    _getItemHtml: function(pageNum, type, totalPage) {
        type = type || 'default';
        if (type == 'current') {
            return '<a href="javascript:;" class="ui-paging-item ui-paging-current gn-current" data-page="currpage">' + pageNum + '</a>';
        } else if (type == 'etc' || pageNum == 'etc') {
            return '<span class="ui-paging-ellipsis">...</span>';
        } else if (type == 'total') {
            return '<span class="ui-paging-info"><span class="ui-paging-bold">' + pageNum + '/ ' + totalPage + ' </span>页</span>';
        } else if (type == 'prev' || pageNum == 'prev') {
            return '<a href="javascript:;" class="ui-paging-prev" data-page="prev">上一页</a>';
        } else if (type == 'prev-disable' || pageNum == 'prev-disable') {
            return '<span class="ui-paging-prev">上一页</span>';
        } else if (type == 'next' || pageNum == 'next') {
            return '<a href="javascript:;" class="ui-paging-next" data-page="next">下一页</a>';
        } else if (type == 'next-disable' || pageNum == 'next-disable') {
            return '<span class="ui-paging-next">下一页</span>';
        } else if (type == 'goto') {
            return '<span class="ui-paging-which"><input class="gn-input" name="some_name" value="' + pageNum + '" type="text"></span><a class="ui-paging-info ui-paging-goto" href="javascript:;" data-page="goto">跳转</a>';
        } else {
            return '<a href="javascript:;" class="ui-paging-item" data-page="' + pageNum + '">' + pageNum + '</a>';
        }
    }
};

pagination.options = {
    target:'body',
    total: 0,
    eachCount: 10,
    currentPage: 0,
    callback: function() {}
};

module.exports = {
    init:function(options){
        var pageObj = Object.create(pagination);
        pageObj.init(options);
        $(this).data('pageObj', pageObj);
    }
};
