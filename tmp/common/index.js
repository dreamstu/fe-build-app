/*
 * common
 * https://github.com/dreamstu/com.qipeipu.app
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */
;(function(){
    var win = window;
    var $ = require('jquery');
    win.jQuery = $;
    var l = $(".logo a");
    win && win.console && l.size() && (
        console.log("%c%s", "color: red; background: yellow; font-size: 24px;", "\u5b89\u5168\u8b66\u544a\u0021"),
        console.log("%c%s", "color: black; font-size: 18px;", "\u8bf7\u52ff\u5728\u6b64\u63a7\u5236\u53f0\u8f93\u5165\u6216\u7c98\u8d34\u4f60\u4e0d\u660e\u767d\u7684\u4ee3\u7801\uff0c\u4ee5\u907f\u514d\u653b\u51fb\u8005\u7a83\u53d6\u4f60\u7684\u4fe1\u606f\u7ed9\u4f60\u9020\u6210\u4e0d\u53ef\u633d\u56de\u7684\u635f\u5931\uff01"),
        console.log("%c%s","color: green; font-size: 16px;", "\u559c\u6b22\u770b\u6c7d\u914d\u94fa\u7684\u4ee3\u7801\uff0c\u8fd8\u662f\u53d1\u73b0\u4e86\u4ec0\u4e48\u0062\u0075\u0067\uff1f\u4e0d\u5982\u548c\u6211\u4eec\u4e00\u8d77\u4e3a\u6c7d\u914d\u94fa\u6dfb\u7816\u52a0\u74e6\u5427\uff01"),
        console.info("\u0068\u0074\u0074\u0070\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u0062\u0061\u0074\u0075\u0072\u0075\u002e\u006f\u0072\u0067\u002f\u006a\u006f\u0069\u006e\u002d\u0075\u0073\u002e\u0068\u0074\u006d\u006c\u003f\u0066\u0072\u006f\u006d\u003d\u0070\u006f\u0073\u0069\u0074\u0069\u006f\u006e\u002d\u0063\u0073"),
        console.log("\u8bf7\u5728\u90ae\u4ef6\u4e2d\u6ce8\u660e%c\u6765\u81ea:crm console", "color:red;font-weight:bold;"),
        console.log("\n\n%c", "font-size:0;line-height:50px;padding-top:" + l.height() + "px; padding-left:" + l.width() + "px;background:" + l.css('background') + ";")
    );

    !function(){
        var cookie,
            ua,
            match;
        ua=win.navigator.userAgent;
        match=/;\s*MSIE (\d+).*?;/.exec(ua);
        if(match&&+match[1]<9){
            cookie=document.cookie.match(/(?:^|;)\s*ic=(\d)/);
            if(cookie&&cookie[1]){
                return ;
            }
            $("body").prepend([
                "<div id='js-compatible' class='compatible-contianer'>",
                "<p class='cpt-ct'><i></i>您的浏览器版本过低。为保证最佳用户体验，请用高级浏览器浏览本网站，<a href='/browser.html'>或点此更新高版本浏览器</a></p>",
                "<div class='cpt-handle'><a href='javascript:;' class='cpt-agin'>以后再说</a><a href='javascript:;' class='cpt-close'><i></i></a>",
                "</div>"
            ].join(""));
            $("#js-compatible .cpt-agin").click(function(){
                var d=new Date();
                d.setTime(d.getTime()+30*24*3600*1000);
                //d.setTime(d.getTime()+60*1000);
                document.cookie="ic=1; expires="+d.toGMTString()+"; path=/";
                $("#js-compatible").remove();
            });
            $("#js-compatible .cpt-close").click(function(){
                $("#js-compatible").remove();
            });
        }
    }();


    $(function(){
        $('[action-type="my_menu"],#nav_list').on('mouseenter',function(){
            $('[action-type="my_menu"]').addClass("hover");
            $('#nav_list').show();
        })
        $('[action-type="my_menu"],#nav_list').on('mouseleave',function(){
            $('[action-type="my_menu"]').removeClass("hover");
            $('#nav_list').hide();
        });
    });

})();