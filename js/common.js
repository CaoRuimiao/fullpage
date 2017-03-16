/*服务地址配置*/
//var global_service = "http://srv.silentwind.com.cn/";
var global_service = "http://www.p.net/srv/";

/*聊天地址配置*/
//var global_chat = "http://chat.silentwind.com.cn/signalr"
var global_chat = "http://chat.p.net/signalr"

/*页面登录的标识*/
var global_token = 'TokenID';

//var global_domain = "silentwind.com.cn";
var global_domain = "p.net";

/*登录跳转地址*/
var global_backurl = 'backurl';

/*定义获取参数方法，输入参数名称，获得参数值*/
(function ($) {
    $.getQueryString = function (commonname, isDecode) {
        var reg = new RegExp("(^|&)" + commonname + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            if (isDecode) {
                return decodeURIComponent(r[2]);
            }
            else {
                return r[2];
            }
        }
        else {
            return null;
        }
    }
})(jQuery);

// 控制body元素根据页面宽度变化 font-size值随之改变
(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            docEl.style.fontSize = 16 * (clientWidth / 320) + 'px';
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    //doc.addEventListener('DOMContentLoaded', recalc, false);
    $(function () { recalc(); })
})(document, window);

// 收藏成功 tip: 提示的文字
var w_h = $(window).height();
var prompt = function (tip_word, delay) {
    delay = delay || 400;
    var shade_layer = $('<div>');
    shade_layer.css({
        'position': 'fixed',
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0,
        'background': 'rgba(0, 0, 0, .5)',
        'text-align': 'center',
        'line-height': w_h + 'px',
        'z-index': 9999
    });

    $('body').append(shade_layer);

    var tip_div = $('<div style="font-size: .75em; text-align: center;">');
    tip_div.text(tip_word);
    shade_layer.append(tip_div);
    tip_div.css({
        'display': 'inline-block',
        'vertical-align': 'middle',
        'maxWidth': '60%',
        'line-height': 1.2,
        'text-align': 'center',
        'background': '#fff',
        'color': '#434343',
        'font-size': '.875em',
        'border-radius': 4,
        'padding': '.4em'
    });


    $('html').css({
        'overflow': 'hidden'
    });

    setTimeout(function () {
        shade_layer.animate({
            'opacity': 0
        }, 1500, function () {
            shade_layer.remove();
            $('html').css('overflow', 'visible');
        });
    }, delay);
}

// 弹出route时 隐藏video
var isAndroid = navigator.userAgent.indexof('Android') > -1 ? true : false;
var _myvideo = null
window.onload = function () { _myvideo = $('#myvideo'); }
function AndroidVideoHide() { if (isAndroid) _myvideo.hide(); }
function RecoverVideo() { if (iisAndroid) _myvideo.show(); }

/*获取Cookie*/
function getCookie(name) {
    var strCookie = document.cookie;
    var arrCookie = strCookie.split("; ");
    for (var i = 0; i < arrCookie.length; i++) {
        var arr = arrCookie[i].split("=");
        if (arr[0] == name) return unescape(arr[1]);
    }
    return null;
}

/*添加Cookie*/
function addCookie(name, value, expiresdays) {
    var cookieString = name + "=" + escape(value) + ';path=/';

    if (expiresdays != 0 && expiresdays != '' && expiresdays != null) {
        var date = new Date();
        date.setTime(date.getTime() + expiresdays * 24 * 3600 * 1000);
        cookieString = cookieString + "; expires=" + date.toGMTString();
    }

    document.cookie = cookieString + ";domain=" + global_domain;
    //document.domain = global_domain;
}

/*删除Cookie*/
function deleteCookie(name, value) {
    var cookieString = name + "=" + escape(value);
    var cookiedate = new Date();
    cookiedate.setTime(cookiedate.getTime() - 1);
    cookieString = cookieString + "; expires=" + cookiedate.toGMTString() + ";path=/";
    document.cookie = cookieString;
}

/*获取登录token*/
function getLoginToken() {
    var token = getCookie(global_token);
    if ($.trim(token) == null || $.trim(token) == '' || $.trim(token) == 'null' || $.trim(token) == undefined) {
        return null;
    }
    return token;
}

//微信登陆系统调用地址
function loginwdb() {
    addCookie(global_backurl, window.location.href);
    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb6609c8a8d0ac637&redirect_uri=http://srv.silentwind.com.cn/api/Member/LoginWDB&response_type=code&scope=snsapi_base&state=1#wechat_redirect';
}

/*获取房间标识，并写入cookie*/
var rc = $.getQueryString("rc", true);
if (rc) {
    addCookie("ShopInfo", rc);
}


/*获取微信支付参数*/
function jsApiCall(orderCode, orderType, callBack) {
    $.ajax({
        xhrFields: { withCredentials: true },
        url: global_service + "api/Order/OrderPay?orderCode=" + orderCode + "&orderType=" + orderType,
        async: false,
        type: "Post",
        cache: false,
        dataType: "json",
        success: function (data) {
            if (callBack) callBack();
            if (data.ResultCode == 0) {
                //alert(data.Data);
                var obj = jQuery.parseJSON(data.Data);
                if (obj != null) {
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest', {
                            "appId": obj.appId,     //公众号名称，由商户传入
                            "timeStamp": obj.timeStamp,         //时间戳，自1970年以来的秒数
                            "nonceStr": obj.nonceStr, //随机串
                            "package": obj.package,
                            "signType": obj.signType,         //微信签名方式：
                            "paySign": obj.paySign //微信签名
                        },
                        function (res) {
                            //判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                            if (res.err_msg == "get_brand_wcpay_request:ok") {
                                window.location.href = '#/Orders';
                            }
                            else {
                                alert("支付失败");
                            }
                        }
                    );
                }
            }
            else if (data.ResultCode == 500) {
                alert(data.Message);
                return null;
            }
            else {
                alert("请到PC端进行支付！");
                return null;
            }
        },
    })
}

///*根据参数调用微信支付*/
//function jsApiCall(orderCode, orderType) {
//    getPayParms(orderCode, orderType);
//    if (payJsonStr) {
//        var obj = jQuery.parseJSON(payJsonStr);
//        if (obj != null) {
//            WeixinJSBridge.invoke(
//                'getBrandWCPayRequest', {
//                    "appId": obj.appId,     //公众号名称，由商户传入
//                    "timeStamp": obj.timeStamp,         //时间戳，自1970年以来的秒数
//                    "nonceStr": obj.nonceStr, //随机串
//                    "package": obj.package,
//                    "signType": obj.signType,         //微信签名方式：
//                    "paySign": obj.paySign //微信签名
//                },
//                function (res) {
//                    //判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
//                    if (res.err_msg == "get_brand_wcpay_request：ok") {
//                        alert("支付成功");
//                    }
//                    else {
//                        alert("支付失败");
//                    }
//                }
//            );
//        }
//    }
//}

/*页面调用微信支付*/
function wxPay(orderCode, orderType, callBack) {
    if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', jsApiCall(orderCode, orderType, callBack), false);
        }
        else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', jsApiCall(orderCode, orderType, callBack));
            document.attachEvent('onWeixinJSBridgeReady', jsApiCall(orderCode, orderType, callBack));
        }
    }
    else {
        jsApiCall(orderCode, orderType, callBack);
    }
}