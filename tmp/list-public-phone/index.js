var listPublicPhone = {};
var $ = require('jquery');
var pagination = require('pagination');
require('common');
$('#submitBtn').on('click',function(){
    form.submit();
});

pagination.init({
    target:'.pager',
    total:params.total,
    eachCount:params.size,
    currentPage:params.current,
    callback:goPage
});

function getBaseFilterParams(){
    var t = $(".filter .group input").serialize();
    return t==undefined? '':t;
}

$('.btn').on('click',function(){
    var ops = getBaseFilterParams();
    goPage(0,ops);
});

function goPage(page,ops){
    ops = ops==undefined?'':ops;
    window.location.href='/base/pubPhone/find/pub/all?current='+page+'&size='+params.size +'&'+ ops;
}

module.exports = listPublicPhone;
