/***************************** webService接口改造 过渡方案 *****************************/

//先引入axios
!function (e, t) { "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.axios = t() : e.axios = t() }(this, function () {
    return function (e) { function t(r) { if (n[r]) return n[r].exports; var o = n[r] = { exports: {}, id: r, loaded: !1 }; return e[r].call(o.exports, o, o.exports, t), o.loaded = !0, o.exports } var n = {}; return t.m = e, t.c = n, t.p = "", t(0) }([function (e, t, n) { e.exports = n(1) }, function (e, t, n) { "use strict"; function r(e) { var t = new s(e), n = i(s.prototype.request, t); return o.extend(n, s.prototype, t), o.extend(n, t), n } var o = n(2), i = n(3), s = n(5), u = n(6), a = r(u); a.Axios = s, a.create = function (e) { return r(o.merge(u, e)) }, a.Cancel = n(23), a.CancelToken = n(24), a.isCancel = n(20), a.all = function (e) { return Promise.all(e) }, a.spread = n(25), e.exports = a, e.exports.default = a }, function (e, t, n) { "use strict"; function r(e) { return "[object Array]" === R.call(e) } function o(e) { return "[object ArrayBuffer]" === R.call(e) } function i(e) { return "undefined" != typeof FormData && e instanceof FormData } function s(e) { var t; return t = "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && e.buffer instanceof ArrayBuffer } function u(e) { return "string" == typeof e } function a(e) { return "number" == typeof e } function c(e) { return "undefined" == typeof e } function f(e) { return null !== e && "object" == typeof e } function p(e) { return "[object Date]" === R.call(e) } function d(e) { return "[object File]" === R.call(e) } function l(e) { return "[object Blob]" === R.call(e) } function h(e) { return "[object Function]" === R.call(e) } function m(e) { return f(e) && h(e.pipe) } function y(e) { return "undefined" != typeof URLSearchParams && e instanceof URLSearchParams } function w(e) { return e.replace(/^\s*/, "").replace(/\s*$/, "") } function g() { return ("undefined" == typeof navigator || "ReactNative" !== navigator.product) && ("undefined" != typeof window && "undefined" != typeof document) } function v(e, t) { if (null !== e && "undefined" != typeof e) if ("object" != typeof e && (e = [e]), r(e)) for (var n = 0, o = e.length; n < o; n++)t.call(null, e[n], n, e); else for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && t.call(null, e[i], i, e) } function x() { function e(e, n) { "object" == typeof t[n] && "object" == typeof e ? t[n] = x(t[n], e) : t[n] = e } for (var t = {}, n = 0, r = arguments.length; n < r; n++)v(arguments[n], e); return t } function b(e, t, n) { return v(t, function (t, r) { n && "function" == typeof t ? e[r] = E(t, n) : e[r] = t }), e } var E = n(3), C = n(4), R = Object.prototype.toString; e.exports = { isArray: r, isArrayBuffer: o, isBuffer: C, isFormData: i, isArrayBufferView: s, isString: u, isNumber: a, isObject: f, isUndefined: c, isDate: p, isFile: d, isBlob: l, isFunction: h, isStream: m, isURLSearchParams: y, isStandardBrowserEnv: g, forEach: v, merge: x, extend: b, trim: w } }, function (e, t) { "use strict"; e.exports = function (e, t) { return function () { for (var n = new Array(arguments.length), r = 0; r < n.length; r++)n[r] = arguments[r]; return e.apply(t, n) } } }, function (e, t) {
        function n(e) { return !!e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e) } function r(e) { return "function" == typeof e.readFloatLE && "function" == typeof e.slice && n(e.slice(0, 0)) }
        e.exports = function (e) { return null != e && (n(e) || r(e) || !!e._isBuffer) }
    }, function (e, t, n) { "use strict"; function r(e) { this.defaults = e, this.interceptors = { request: new s, response: new s } } var o = n(6), i = n(2), s = n(17), u = n(18); r.prototype.request = function (e) { "string" == typeof e && (e = i.merge({ url: arguments[0] }, arguments[1])), e = i.merge(o, { method: "get" }, this.defaults, e), e.method = e.method.toLowerCase(); var t = [u, void 0], n = Promise.resolve(e); for (this.interceptors.request.forEach(function (e) { t.unshift(e.fulfilled, e.rejected) }), this.interceptors.response.forEach(function (e) { t.push(e.fulfilled, e.rejected) }); t.length;)n = n.then(t.shift(), t.shift()); return n }, i.forEach(["delete", "get", "head", "options"], function (e) { r.prototype[e] = function (t, n) { return this.request(i.merge(n || {}, { method: e, url: t })) } }), i.forEach(["post", "put", "patch"], function (e) { r.prototype[e] = function (t, n, r) { return this.request(i.merge(r || {}, { method: e, url: t, data: n })) } }), e.exports = r }, function (e, t, n) { "use strict"; function r(e, t) { !i.isUndefined(e) && i.isUndefined(e["Content-Type"]) && (e["Content-Type"] = t) } function o() { var e; return "undefined" != typeof XMLHttpRequest ? e = n(8) : "undefined" != typeof process && (e = n(8)), e } var i = n(2), s = n(7), u = { "Content-Type": "application/x-www-form-urlencoded" }, a = { adapter: o(), transformRequest: [function (e, t) { return s(t, "Content-Type"), i.isFormData(e) || i.isArrayBuffer(e) || i.isBuffer(e) || i.isStream(e) || i.isFile(e) || i.isBlob(e) ? e : i.isArrayBufferView(e) ? e.buffer : i.isURLSearchParams(e) ? (r(t, "application/x-www-form-urlencoded;charset=utf-8"), e.toString()) : i.isObject(e) ? (r(t, "application/json;charset=utf-8"), JSON.stringify(e)) : e }], transformResponse: [function (e) { if ("string" == typeof e) try { e = JSON.parse(e) } catch (e) { } return e }], timeout: 0, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN", maxContentLength: -1, validateStatus: function (e) { return e >= 200 && e < 300 } }; a.headers = { common: { Accept: "application/json, text/plain, */*" } }, i.forEach(["delete", "get", "head"], function (e) { a.headers[e] = {} }), i.forEach(["post", "put", "patch"], function (e) { a.headers[e] = i.merge(u) }), e.exports = a }, function (e, t, n) { "use strict"; var r = n(2); e.exports = function (e, t) { r.forEach(e, function (n, r) { r !== t && r.toUpperCase() === t.toUpperCase() && (e[t] = n, delete e[r]) }) } }, function (e, t, n) { "use strict"; var r = n(2), o = n(9), i = n(12), s = n(13), u = n(14), a = n(10), c = "undefined" != typeof window && window.btoa && window.btoa.bind(window) || n(15); e.exports = function (e) { return new Promise(function (t, f) { var p = e.data, d = e.headers; r.isFormData(p) && delete d["Content-Type"]; var l = new XMLHttpRequest, h = "onreadystatechange", m = !1; if ("undefined" == typeof window || !window.XDomainRequest || "withCredentials" in l || u(e.url) || (l = new window.XDomainRequest, h = "onload", m = !0, l.onprogress = function () { }, l.ontimeout = function () { }), e.auth) { var y = e.auth.username || "", w = e.auth.password || ""; d.Authorization = "Basic " + c(y + ":" + w) } if (l.open(e.method.toUpperCase(), i(e.url, e.params, e.paramsSerializer), !0), l.timeout = e.timeout, l[h] = function () { if (l && (4 === l.readyState || m) && (0 !== l.status || l.responseURL && 0 === l.responseURL.indexOf("file:"))) { var n = "getAllResponseHeaders" in l ? s(l.getAllResponseHeaders()) : null, r = e.responseType && "text" !== e.responseType ? l.response : l.responseText, i = { data: r, status: 1223 === l.status ? 204 : l.status, statusText: 1223 === l.status ? "No Content" : l.statusText, headers: n, config: e, request: l }; o(t, f, i), l = null } }, l.onerror = function () { f(a("Network Error", e, null, l)), l = null }, l.ontimeout = function () { f(a("timeout of " + e.timeout + "ms exceeded", e, "ECONNABORTED", l)), l = null }, r.isStandardBrowserEnv()) { var g = n(16), v = (e.withCredentials || u(e.url)) && e.xsrfCookieName ? g.read(e.xsrfCookieName) : void 0; v && (d[e.xsrfHeaderName] = v) } if ("setRequestHeader" in l && r.forEach(d, function (e, t) { "undefined" == typeof p && "content-type" === t.toLowerCase() ? delete d[t] : l.setRequestHeader(t, e) }), e.withCredentials && (l.withCredentials = !0), e.responseType) try { l.responseType = e.responseType } catch (t) { if ("json" !== e.responseType) throw t } "function" == typeof e.onDownloadProgress && l.addEventListener("progress", e.onDownloadProgress), "function" == typeof e.onUploadProgress && l.upload && l.upload.addEventListener("progress", e.onUploadProgress), e.cancelToken && e.cancelToken.promise.then(function (e) { l && (l.abort(), f(e), l = null) }), void 0 === p && (p = null), l.send(p) }) } }, function (e, t, n) { "use strict"; var r = n(10); e.exports = function (e, t, n) { var o = n.config.validateStatus; n.status && o && !o(n.status) ? t(r("Request failed with status code " + n.status, n.config, null, n.request, n)) : e(n) } }, function (e, t, n) { "use strict"; var r = n(11); e.exports = function (e, t, n, o, i) { var s = new Error(e); return r(s, t, n, o, i) } }, function (e, t) { "use strict"; e.exports = function (e, t, n, r, o) { return e.config = t, n && (e.code = n), e.request = r, e.response = o, e } }, function (e, t, n) { "use strict"; function r(e) { return encodeURIComponent(e).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]") } var o = n(2); e.exports = function (e, t, n) { if (!t) return e; var i; if (n) i = n(t); else if (o.isURLSearchParams(t)) i = t.toString(); else { var s = []; o.forEach(t, function (e, t) { null !== e && "undefined" != typeof e && (o.isArray(e) ? t += "[]" : e = [e], o.forEach(e, function (e) { o.isDate(e) ? e = e.toISOString() : o.isObject(e) && (e = JSON.stringify(e)), s.push(r(t) + "=" + r(e)) })) }), i = s.join("&") } return i && (e += (e.indexOf("?") === -1 ? "?" : "&") + i), e } }, function (e, t, n) { "use strict"; var r = n(2), o = ["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]; e.exports = function (e) { var t, n, i, s = {}; return e ? (r.forEach(e.split("\n"), function (e) { if (i = e.indexOf(":"), t = r.trim(e.substr(0, i)).toLowerCase(), n = r.trim(e.substr(i + 1)), t) { if (s[t] && o.indexOf(t) >= 0) return; "set-cookie" === t ? s[t] = (s[t] ? s[t] : []).concat([n]) : s[t] = s[t] ? s[t] + ", " + n : n } }), s) : s } }, function (e, t, n) { "use strict"; var r = n(2); e.exports = r.isStandardBrowserEnv() ? function () { function e(e) { var t = e; return n && (o.setAttribute("href", t), t = o.href), o.setAttribute("href", t), { href: o.href, protocol: o.protocol ? o.protocol.replace(/:$/, "") : "", host: o.host, search: o.search ? o.search.replace(/^\?/, "") : "", hash: o.hash ? o.hash.replace(/^#/, "") : "", hostname: o.hostname, port: o.port, pathname: "/" === o.pathname.charAt(0) ? o.pathname : "/" + o.pathname } } var t, n = /(msie|trident)/i.test(navigator.userAgent), o = document.createElement("a"); return t = e(window.location.href), function (n) { var o = r.isString(n) ? e(n) : n; return o.protocol === t.protocol && o.host === t.host } }() : function () { return function () { return !0 } }() }, function (e, t) { "use strict"; function n() { this.message = "String contains an invalid character" } function r(e) { for (var t, r, i = String(e), s = "", u = 0, a = o; i.charAt(0 | u) || (a = "=", u % 1); s += a.charAt(63 & t >> 8 - u % 1 * 8)) { if (r = i.charCodeAt(u += .75), r > 255) throw new n; t = t << 8 | r } return s } var o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; n.prototype = new Error, n.prototype.code = 5, n.prototype.name = "InvalidCharacterError", e.exports = r }, function (e, t, n) { "use strict"; var r = n(2); e.exports = r.isStandardBrowserEnv() ? function () { return { write: function (e, t, n, o, i, s) { var u = []; u.push(e + "=" + encodeURIComponent(t)), r.isNumber(n) && u.push("expires=" + new Date(n).toGMTString()), r.isString(o) && u.push("path=" + o), r.isString(i) && u.push("domain=" + i), s === !0 && u.push("secure"), document.cookie = u.join("; ") }, read: function (e) { var t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)")); return t ? decodeURIComponent(t[3]) : null }, remove: function (e) { this.write(e, "", Date.now() - 864e5) } } }() : function () { return { write: function () { }, read: function () { return null }, remove: function () { } } }() }, function (e, t, n) { "use strict"; function r() { this.handlers = [] } var o = n(2); r.prototype.use = function (e, t) { return this.handlers.push({ fulfilled: e, rejected: t }), this.handlers.length - 1 }, r.prototype.eject = function (e) { this.handlers[e] && (this.handlers[e] = null) }, r.prototype.forEach = function (e) { o.forEach(this.handlers, function (t) { null !== t && e(t) }) }, e.exports = r }, function (e, t, n) { "use strict"; function r(e) { e.cancelToken && e.cancelToken.throwIfRequested() } var o = n(2), i = n(19), s = n(20), u = n(6), a = n(21), c = n(22); e.exports = function (e) { r(e), e.baseURL && !a(e.url) && (e.url = c(e.baseURL, e.url)), e.headers = e.headers || {}, e.data = i(e.data, e.headers, e.transformRequest), e.headers = o.merge(e.headers.common || {}, e.headers[e.method] || {}, e.headers || {}), o.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (t) { delete e.headers[t] }); var t = e.adapter || u.adapter; return t(e).then(function (t) { return r(e), t.data = i(t.data, t.headers, e.transformResponse), t }, function (t) { return s(t) || (r(e), t && t.response && (t.response.data = i(t.response.data, t.response.headers, e.transformResponse))), Promise.reject(t) }) } }, function (e, t, n) { "use strict"; var r = n(2); e.exports = function (e, t, n) { return r.forEach(n, function (n) { e = n(e, t) }), e } }, function (e, t) { "use strict"; e.exports = function (e) { return !(!e || !e.__CANCEL__) } }, function (e, t) { "use strict"; e.exports = function (e) { return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e) } }, function (e, t) { "use strict"; e.exports = function (e, t) { return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e } }, function (e, t) { "use strict"; function n(e) { this.message = e } n.prototype.toString = function () { return "Cancel" + (this.message ? ": " + this.message : "") }, n.prototype.__CANCEL__ = !0, e.exports = n }, function (e, t, n) { "use strict"; function r(e) { if ("function" != typeof e) throw new TypeError("executor must be a function."); var t; this.promise = new Promise(function (e) { t = e }); var n = this; e(function (e) { n.reason || (n.reason = new o(e), t(n.reason)) }) } var o = n(23); r.prototype.throwIfRequested = function () { if (this.reason) throw this.reason }, r.source = function () { var e, t = new r(function (t) { e = t }); return { token: t, cancel: e } }, e.exports = r }, function (e, t) { "use strict"; e.exports = function (e) { return function (t) { return e.apply(null, t) } } }])
});

/** 请求前，从xml中提取ajax信息 */
function transRequest(xml) {
    var json = {
        url: "",
        data:{}
    }
    var api="";
    var xmlString = xml.substring(xml.indexOf("<soapenv:Body>") + 14, xml.indexOf("</soapenv:Body>"))
    if (xmlString[xmlString.indexOf(">") - 1] === "/") {
        api = xmlString.substring(xmlString.indexOf(":") + 1, xmlString.indexOf("/>"));
    } else {
        api = xmlString.substring(xmlString.indexOf(":") + 1, xmlString.indexOf(">"));
    }
    json.url = "/api/" + api.charAt(0).toLowerCase() + api.substring(1, api.length);
    if (json.url.substring(json.url.length - 4, json.url.length) == "Type") {
        json.url = json.url.substring(0, json.url.length - 4)
    }
    var appData = xmlObjTree.parseXML(xml)['soapenv:envelope']['soapenv:body'];
    if (Object.keys(appData).length>0){
        appData = appData[Object.keys(appData)[0]]
        json.data = mapAppData(appData)
    }
    return json;
}
function mapAppData(appData){
    var mapData = {}
    Object.keys(appData).forEach((key) => {
        if (key.indexOf("app:") > -1) {
            mapData[key.substring(4, key.length)] = typeof appData[key] === "object" ? mapAppData(appData[key]) : appData[key]
        }
    })
    return mapData
}

/** 转换返回值的格式
 * obj:{code:0,info:"",data:{...}}
 * =>
 * resp:{result:{successful:true},...data}
*/
function transResponse(obj) {
    var resp = {
        result: {
            successful: obj.code === 0 ? "true" : "false"
        }
    };
    return Object.assign(resp, obj.data);
}

/***************************** webService接口改造 过渡方案 END *****************************/

var serverUrl = getServerUrl() + "/kpos/ws/kposService";
if (typeof XML != "undefined") {
    var xmlObjTree = new XML.ObjTree();
}

function getServerUrl() {
    var thisurl = window.location.href.split('/');
    var suburl = '';
    var ishttps = false;
    for (var i in thisurl) {
        if (thisurl[i] == 'http:') continue;
        else if (thisurl[i] == 'https:') { ishttps = true; continue; }
        else if (thisurl[i] == '') continue;
        else { return (ishttps ? "https://" : "http://") + thisurl[i] + suburl; }
    }
}

function obj2str(o) {
    return JSON.stringify(o);
}
function strToObj(json) {
    if (json != undefined && json != null && json != "") {
        return JSON.parse(json);
    }
}

var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
    '<soapenv:Header/><soapenv:Body>';
var soapXMLEnd = '</soapenv:Body></soapenv:Envelope>';

function callWebService(soapType, responseHandler, args) {
    if (!admin.hasAdminAccess()) {
        disablePage();
        return;
    }
    var soapXML = soapType.getXML();
    console.log("request", JSON.stringify(transRequest(soapXML)))
    if (args && args.$http) {
        args.$http.post(serverUrl, soapXML).then(
            function (response) {
                var data = response.data;
                var start = data.indexOf("<soap:Body>");
                var end = data.indexOf("</soap:Body>");
                data = data.substring(start + 11, end);

                var myJsonObject = xmlObjTree.parseXML(data);
                responseHandler(myJsonObject, args);
            },
            function (response) {
                //TODO. Better http level error handling
                console.log("HTTP Error: " + response);
            });
    } else {
        var parser;
        var xmlhttp = null;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            // Internet Explorer
            try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e) {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        var async = args && (typeof args.isAsync == "boolean") ? args.isAsync : true;
        xmlhttp.open("POST", serverUrl, async);
        var currentUser = biscuit ? biscuit.u() : null;
        if (util.isValidVariable(currentUser) && biscuitHelper) {
            xmlhttp.setRequestHeader('Merchant-ID', biscuitHelper.getMerchantInfo(currentUser).merchantIds);
        } else {
            console.log('biscuit.js or util.js is not properly loaded!!!');
        }
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                var responseText = xmlhttp.responseText;

                var start = responseText.indexOf("<soap:Body>");
                var end = responseText.indexOf("</soap:Body>");
                responseText = responseText.substring(start + 11, end);

                var myJsonObject = xmlObjTree.parseXML(responseText);
                console.log("response",JSON.stringify(myJsonObject))
                responseHandler(myJsonObject, args);
            }
        }
        xmlhttp.send(soapXML);

        // var requestObj = transRequest(soapXML)
        // axios.post(requestObj.url,requestObj.data).then(function (response) {
        // var responseData={}
        // responseData[requestObj.api.toLowerCase() +"responsetype"] = transResponse(response)
        //     responseHandler(responseData)
        // })
    }
}

function Printer(id, name, ip, realName, languageSetting, realNameSecondLanguage, secondLanguageID, thirdLanguageID, backupPrinterId, printOneItemPerTicket, printerType, model, kitchenName) {
    this.myId = id;
    this.myName = name;
    this.myIP = ip;
    this.realName = realName;
    this.languageSetting = languageSetting;
    this.realNameSecondLanguage = realNameSecondLanguage;
    this.secondLanguageID = secondLanguageID;
    this.thirdLanguageID = thirdLanguageID;
    this.backupPrinterId = backupPrinterId;
    this.printOneItemPerTicket = printOneItemPerTicket;
    this.printerType = printerType;
    this.model = model;
    this.kitchenName = kitchenName;
    this.tag = "<app:printer>";
    this.endTag = "</app:printer>";
    this.getXML = function () {
        var xml = this.tag;
        if (this.myId != null && this.myId !== "") {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        if (this.myName != null && this.myName != "") {
            xml += "<app:name>" + this.myName + "</app:name>";
        }
        if (this.myIP != null && this.myIP != "") {
            xml += "<app:ipAddr>" + this.myIP + "</app:ipAddr>";
        }
        if (this.realName != null && this.realName != "") {
            xml += "<app:realName>" + this.realName + "</app:realName>";
        }
        if (this.languageSetting != null && this.languageSetting != "") {
            xml += "<app:languageSetting>" + this.languageSetting + "</app:languageSetting>";
        }
        if (this.realNameSecondLanguage != null && this.realNameSecondLanguage != "") {
            xml += "<app:nameSecondLanguage>" + this.realNameSecondLanguage + "</app:nameSecondLanguage>";
        }
        if (this.secondLanguageID != null && this.secondLanguageID != "") {
            xml += "<app:secondLanguageID>" + this.secondLanguageID + "</app:secondLanguageID>";
        }
        if (this.thirdLanguageID != null && this.thirdLanguageID != "") {
            xml += "<app:thirdLanguageID>" + this.thirdLanguageID + "</app:thirdLanguageID>";
        }
        if (util.isValidVariable(this.backupPrinterId)) {
            xml += "<app:backupPrinterId>" + this.backupPrinterId + "</app:backupPrinterId>";
        }
        if (this.printOneItemPerTicket !== null && typeof this.printOneItemPerTicket != "undefined") {
            xml += "<app:printOneItemPerTicket>" + this.printOneItemPerTicket + "</app:printOneItemPerTicket>";
        }
        if (typeof this.printerType != "undefined" && this.printerType != null && this.printerType !== "") {
            xml += "<app:type>" + this.printerType + "</app:type>";
        }
        if (util.isValidVariable(this.model)) {
            xml += "<app:model>" + this.model + "</app:model>";
        }
        if (util.isValidVariable(this.kitchenName)) {
            xml += "<app:kitchenName>" + this.kitchenName + "</app:kitchenName>";
        }
        xml += this.endTag;
        return xml;
    };
}

function AddPrinterType(name, ipaddr, realname, languagesetting, realnamesecondlanguage, secondlanguageid, thirdlanguageid, backupPrinterId, printOneItemPerTicket, printerType, model, kitchenName) {
    this.myPrinter = new Printer("", name, ipaddr, realname, languagesetting, realnamesecondlanguage, secondlanguageid, thirdlanguageid, backupPrinterId, printOneItemPerTicket, printerType, model, kitchenName);
    this.tag = "<app:CreatePrinterType>";
    this.endTag = "</app:CreatePrinterType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myPrinter.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function ListPrintersType() {
    this.tag = "<app:ListPrintersType/>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag + soapXMLEnd;
        return xml;
    };
}

function ListAvailablePrintersType() {
    this.tag = "<app:ListAvailablePrintersType/>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag + soapXMLEnd;
        return xml;
    };
}

function UpdatePrinterType(id, name, ip, realName, languageSetting, nameSecondLanguage, secondLanguageId, thirdLanguageId, backupPrinterId, printOneItemPerTicket, printerType, model, kitchenName) {
    this.myPrinter = new Printer(id, name, ip, realName, languageSetting, nameSecondLanguage, secondLanguageId, thirdLanguageId, backupPrinterId, printOneItemPerTicket, printerType, model, kitchenName);
    this.tag = "<app:UpdatePrinterType>";
    this.endTag = "</app:UpdatePrinterType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myPrinter.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function ListPropertiesType(target) {
    this.tag = "<app:ListPropertiesType>";
    this.endTag = "</app:ListPropertiesType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + "<app:target>" + target + "</app:target>" + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeletePrinterType(id) {
    this.tag = "<app:DeletePrinterType>";
    this.endTag = "</app:DeletePrinterType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + "<app:id>" + id + "</app:id>" + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}
function MenuGroupType(aId, aName, aDescription, eMenuDisplayTemplate, tipOutPercentage, hours) {
    this.myId = aId;
    this.myName = aName;
    this.myDescription = aDescription;
    this.hours = hours;
    this.eMenuDisplayTemplate = eMenuDisplayTemplate;
    this.tipOutPercentage = tipOutPercentage;
    this.tag = "<app:catGroup>";
    this.endTag = "</app:catGroup>";
    this.getXML = function () {
        var xml = this.tag;
        if (this.myId != null && this.myId !== "") {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        xml += "<app:name>" + this.myName + "</app:name>";
        xml += "<app:description>" + this.myDescription + "</app:description>";
        xml += "<app:eMenuDisplayTemplate>" + this.eMenuDisplayTemplate + "</app:eMenuDisplayTemplate>";
        if (util.isValidVariable(this.tipOutPercentage)) {
            xml += "<app:tipOutPercentage>" + this.tipOutPercentage + "</app:tipOutPercentage>";
        }
        for (var i = 0; i < this.hours.length; i++) {
            var hoursDetails = hours[i];
            xml += hoursDetails.getXML();
        }
        xml += this.endTag;
        return xml;
    };
}
function CreateMenuGroupType(name, description, eMenuDisplayTemplate, tipOutPercentage, aHours) {
    this.myGroup = new MenuGroupType(null, name, description, eMenuDisplayTemplate, tipOutPercentage, aHours);
    this.tag = "<app:CreateCategoryGroupType>";
    this.endTag = "</app:CreateCategoryGroupType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myGroup.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}
function UpdateMenuGroupType(id, name, description, eMenuDisplayTemplate, tipOutPercentage, hours) {
    this.myMenuGroup = new MenuGroupType(id, name, description, eMenuDisplayTemplate, tipOutPercentage, hours);
    this.tag = "<app:UpdateCategoryGroupType>";
    this.endTag = "</app:UpdateCategoryGroupType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myMenuGroup.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}
function ListCategoryGroupType(id) {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListCategoryGroupType></app:ListCategoryGroupType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteMenuGroupType(id) {
    this.myId = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteCategoryGroupType><app:groupId>" + this.myId + "</app:groupId></app:DeleteCategoryGroupType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function Category(id, name, notes, thumb, printerIds, groupId, reportGroupId, readOnly, doNotDisplayForEMenu, requireCategory, applicableToOrderDiscount, discountAllowed, onlineOrderGroupId, taxIds, type, shortName, propertyList, displayPriority, color, alternateName, onlineOrderDisplayName, courseNumber) {
    this.myId = id;
    this.myName = name;
    this.myNotes = notes;
    this.myThumb = thumb;
    this.myPrinterIds = printerIds;
    this.myGroupId = groupId;
    this.myReportGroupId = reportGroupId;
    this.myReadOnly = readOnly;
    this.myDoNotDisplayForEMenu = doNotDisplayForEMenu;
    this.requireCategory = requireCategory;
    this.applicableToOrderDiscount = applicableToOrderDiscount;
    this.discountAllowed = discountAllowed;
    this.onlineOrderGroupId = onlineOrderGroupId;
    this.myTaxIds = taxIds;
    this.myType = type;
    this.myShortName = shortName;
    this.propertyList = propertyList;
    this.displayPriority = displayPriority;
    this.color = color;
    this.alternateName = alternateName;
    this.myOnlineOrderDisplayName = onlineOrderDisplayName;
    this.courseNumber = courseNumber;
    this.tag = "<app:category>";
    this.endTag = "</app:category>";
    this.getXML = function () {
        var xml = this.tag;
        if (this.myId != null && this.myId !== "") {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        if (util.isValidVariable(this.myName)) {
            xml += "<app:name>" + this.myName + "</app:name>";
        }
        if (typeof this.myNotes != "undefined" && this.myNotes != null) {
            xml += "<app:notes>" + this.myNotes + "</app:notes>";
        }
        if (this.myThumb != null && this.myThumb != "") {
            xml += "<app:thumbPath>" + this.myThumb + "</app:thumbPath>";
        }
        if (this.myPrinterIds != null) {
            for (var i = 0; i < this.myPrinterIds.length; i++) {
                xml += "<app:printerIds>" + this.myPrinterIds[i] + "</app:printerIds>";
            }
        }
        if (this.myGroupId != null && this.myGroupId !== "") {
            xml += "<app:groupId>" + this.myGroupId + "</app:groupId>";
        }
        if (util.isValidVariable(this.onlineOrderGroupId)) {
            xml += "<app:onlineOrderGroupId>" + this.onlineOrderGroupId + "</app:onlineOrderGroupId>";
        }
        if (this.myReportGroupId != null && this.myReportGroupId !== "") {
            xml += "<app:reportGroupId>" + this.myReportGroupId + "</app:reportGroupId>";
        }
        if (util.isValidBooleanVariable(this.myReadOnly)) {
            xml += "<app:readOnly>" + this.myReadOnly + "</app:readOnly>";
        }
        if (util.isValidBooleanVariable(this.myDoNotDisplayForEMenu)) {
            xml += "<app:doNotDisplayForEMenu>" + this.myDoNotDisplayForEMenu + "</app:doNotDisplayForEMenu>";
        }
        if (util.isValidBooleanVariable(this.requireCategory)) {
            xml += "<app:requireCategory>" + this.requireCategory + "</app:requireCategory>";
        }
        if (util.isValidBooleanVariable(this.applicableToOrderDiscount)) {
            xml += "<app:applicableToOrderDiscount>" + this.applicableToOrderDiscount + "</app:applicableToOrderDiscount>";
        }
        if (util.isValidBooleanVariable(this.discountAllowed)) {
            xml += "<app:discountAllowed>" + this.discountAllowed + "</app:discountAllowed>";
        }
        if (util.isValidVariable(this.myOnlineOrderDisplayName)) {
            xml += "<app:onlineOrderDisplayName>" + this.myOnlineOrderDisplayName + "</app:onlineOrderDisplayName>";
        }
        if (this.myType != null && this.myType !== "") {
            xml += "<app:type>" + this.myType + "</app:type>";
        }
        if (typeof this.myShortName != "undefined" && this.myShortName != null) {
            xml += "<app:shortName>" + this.myShortName + "</app:shortName>";
        }
        if (util.isValidVariable(this.displayPriority)) {
            xml += "<app:displayPriority>" + this.displayPriority + "</app:displayPriority>";
        }
        if (util.isValidVariable(this.color)) {
            xml += "<app:color>" + this.color + "</app:color>";
        }
        if (typeof this.alternateName != "undefined" && this.alternateName != null) {
            xml += "<app:alternateName>" + this.alternateName + "</app:alternateName>";
        }
        if (util.isValidVariable(this.courseNumber)) {
            xml += "<app:courseNumber>" + this.courseNumber + "</app:courseNumber>";
        }

        if (typeof this.propertyList != "undefined" && this.propertyList != null) {
            for (var i = 0; i < this.propertyList.length; i++) {
                xml += this.propertyList[i].getXML();
            }
        }

        if (this.myTaxIds != null) {
            for (var j = 0; j < this.myTaxIds.length; j++) {
                xml += "<app:taxIds>" + this.myTaxIds[j] + "</app:taxIds>";
            }
        }
        xml += this.endTag;
        return xml;
    };
}
function CreateCategoryType(name, notes, thumb, printerIds, groupId, reportGroupId, readOnly, doNotDisplayForEMenu, requireCategory, applicableToOrderDiscount, discountAllowed, onlineOrderGroupId, taxIds, type, shortName, propertyList, displayPriority, color, alternateName, onlineOrderDisplayName, courseNumber) {
    this.myCategory = new Category(null, name, notes, thumb, printerIds, groupId, reportGroupId, readOnly, doNotDisplayForEMenu, requireCategory, applicableToOrderDiscount, discountAllowed, onlineOrderGroupId, taxIds, type, shortName, propertyList, displayPriority, color, alternateName, onlineOrderDisplayName, courseNumber);
    this.tag = "<app:CreateCategoryType>";
    this.endTag = "</app:CreateCategoryType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myCategory.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function UpdateCategoriesType(categoryList, updateDetails) {
    this.categoryList = categoryList;
    this.updateDetails = updateDetails;
    this.tag = "<app:UpdateCategoryType>";
    this.endTag = "</app:UpdateCategoryType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        if (util.isValidVariable(this.updateDetails)) {
            xml += "<app:updateDetails>" + this.updateDetails + "</app:updateDetails>";
        }
        for (var i = 0; i < this.categoryList.length; i++) {
            xml += this.categoryList[i].getXML();
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    };
}

function UpdateCategoryType(id, name, notes, thumb, printerIds, groupId, reportGroupId, readOnly, doNotDisplayForEMenu, requireCategory, applicableToOrderDiscount, discountAllowed, onlineOrderGroupId, taxIds, type, shortName, propertyList, displayPriority, color, alternateName, onlineOrderDisplayName, courseNumber) {
    this.myCategory = new Category(id, name, notes, thumb, printerIds, groupId, reportGroupId, readOnly, doNotDisplayForEMenu, requireCategory, applicableToOrderDiscount, discountAllowed, onlineOrderGroupId, taxIds, type, shortName, propertyList, displayPriority, color, alternateName, onlineOrderDisplayName, courseNumber);
    this.tag = "<app:UpdateCategoryType>";
    this.endTag = "</app:UpdateCategoryType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myCategory.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function ListCategoriesType() {
    this.tag = "<app:ListCategoryType/>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag + soapXMLEnd;
        return xml;
    };
}

function DeleteCategoryType(ids) {
    this.ids = ids;
    this.tag = "<app:DeleteCategoryType>";
    this.endTag = "</app:DeleteCategoryType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        for (var i = 0; i < ids.length; i++) {
            xml += "<app:categoryId>" + ids[i] + "</app:categoryId>";
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    };
}
function SaleItemPriceType(aId, aPrice, aType, aSizeId, aSize) {
    this.id = aId;
    this.price = aPrice;
    this.type = aType;
    this.sizeId = aSizeId;
    this.size = aSize;
    this.getXML = function () {
        var xml = "";
        if (this.id && this.id != null) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "<app:price>" + this.price + "</app:price>";
        xml += "<app:type>" + this.type + "</app:type>";
        if (util.isValidSoapRequestVariable(this.size)) {
            xml += "<app:size>" + this.size + "</app:size>";
        }
        xml += "<app:sizeId>" + this.sizeId + "</app:sizeId>";
        return xml;
    }
}

function ItemPropertyType(name, value) {
    this.name = name;
    this.value = value;
    this.tag = "<app:properties>";
    this.endTag = "</app:properties>";
    this.getXML = function () {
        var xml = this.tag;
        if (this.name != null && this.name !== "") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.value != null && this.value !== "") {
            xml += "<app:value>" + this.value + "</app:value>";
        }
        xml += this.endTag;
        return xml;
    };
}

function SaleItem(id, catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierActions, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, isOffMenu, hhRate,
    taxRate, allowedHH, comboType, comboItem, color, alternateName, onlineOrderDisplayName, doNotDisplayForOnlineOrder, baseWeight, itemNumber, defaultSaleItemSizeId, ktvItem, outOfStock, attributeList) {
    this.myId = id;
    this.myCatId = catId;
    this.myReportGroupId = reportGroupId;
    this.myName = name;
    this.myShortName = shortName;
    this.myDescription = description;
    this.myThumb = thumb;
    this.myPrinterIds = printerIds;
    this.myAllowModifierActions = allowModifierActions;
    this.mySendToKitchenRequired = sendToKitchenRequired;
    this.myForComboOnly = forComboOnly;
    this.myMarketPriceItem = marketPriceItem;
    this.myGiftCardItem = giftCardItem;
    this.myPrice = price;
    this.myItemPrice = itemPrice;
    this.myTaxable = isTaxable;
    this.MyAllowedHH = allowedHH;
    this.myHHRate = hhRate;
    this.myTaxRate = taxRate;
    this.myOffMenu = isOffMenu;
    this.comboType = comboType;
    this.comboItem = comboItem;
    this.color = color;
    this.alternateName = alternateName;
    this.onlineOrderDisplayName = onlineOrderDisplayName;
    this.doNotDisplayForOnlineOrder = doNotDisplayForOnlineOrder;
    this.baseWeight = baseWeight;
    this.itemNumber = itemNumber;
    this.defaultSaleItemSizeId = defaultSaleItemSizeId;
    this.myKtvItem = ktvItem;
    this.myOutOfStock = outOfStock;
    this.propertyList = propertyList;
    this.attributeList = attributeList;
    this.tag = "<app:saleItem>";
    this.endTag = "</app:saleItem>";
    this.getXML = function () {
        var xml = this.tag;
        if (this.myId != null && this.myId !== "") {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        if (this.myCatId != null && this.myCatId !== "") {
            xml += "<app:catId>" + this.myCatId + "</app:catId>";
        }
        if (this.myReportGroupId != null && this.myReportGroupId !== "") {
            xml += "<app:reportGroupId>" + this.myReportGroupId + "</app:reportGroupId>";
        }
        if (util.isValidVariable(this.myName)) {
            xml += "<app:name>" + this.myName + "</app:name>";
        }
        if (typeof this.myDescription != "undefined" && this.myDescription != null) {
            xml += "<app:description>" + this.myDescription + "</app:description>";
        }
        if (typeof this.myShortName != "undefined" && this.myShortName != null) {
            xml += "<app:shortName>" + this.myShortName + "</app:shortName>";
        }
        if (this.myPrice != null && this.myPrice != "") {
            xml += "<app:price>" + this.myPrice + "</app:price>";
        }
        if (this.myItemPrice != null) {
            for (var i = 0; i < this.myItemPrice.length; i++) {
                xml += "<app:itemPrice>" + this.myItemPrice[i].getXML() + "</app:itemPrice>";
            }
        }
        if (util.isValidBooleanVariable(this.myTaxable)) {
            xml += "<app:taxable>" + this.myTaxable + "</app:taxable>";
        }
        if (this.myTaxRate != null && this.myTaxRate != '') {
            xml += "<app:taxRate>" + this.myTaxRate + "</app:taxRate>";
        }

        if (util.isValidBooleanVariable(this.myAllowModifierActions)) {
            xml += "<app:allowModifierActions>" + this.myAllowModifierActions + "</app:allowModifierActions>";
        }
        if (util.isValidBooleanVariable(this.mySendToKitchenRequired)) {
            xml += "<app:sendToKitchenRequired>" + this.mySendToKitchenRequired + "</app:sendToKitchenRequired>";
        }
        if (util.isValidBooleanVariable(this.myForComboOnly)) {
            xml += "<app:forComboOnly>" + this.myForComboOnly + "</app:forComboOnly>";
        }
        if (util.isValidBooleanVariable(this.myMarketPriceItem)) {
            xml += "<app:marketPriceItem>" + this.myMarketPriceItem + "</app:marketPriceItem>";
        }
        if (util.isValidBooleanVariable(this.myGiftCardItem)) {
            xml += "<app:giftCardItem>" + this.myGiftCardItem + "</app:giftCardItem>";
        }
        if (util.isValidBooleanVariable(this.myKtvItem)) {
            xml += "<app:ktvItem>" + this.myKtvItem + "</app:ktvItem>";
        }
        if (util.isValidBooleanVariable(this.myOutOfStock)) {
            xml += "<app:outOfStock>" + this.myOutOfStock + "</app:outOfStock>";
        }
        if (util.isValidBooleanVariable(this.myAllowHH)) {
            xml += "<app:allowHH>" + this.myAllowHH + "</app:allowHH>";
        }
        if (util.isValidBooleanVariable(this.myHHRate)) {
            xml += "<app:hhRate>" + this.myHHRate + "</app:hhRate>";
        }

        if (this.myThumb != null && this.myThumb != "") {
            xml += "<app:thumbPath>" + this.myThumb + "</app:thumbPath>";
        }

        if (util.isValidVariable(this.color)) {
            xml += "<app:color>" + this.color + "</app:color>";
        }

        if (typeof this.alternateName != "undefined" && this.alternateName != null) {
            xml += "<app:alternateName>" + this.alternateName + "</app:alternateName>";
        }
        if (util.isValidVariable(this.onlineOrderDisplayName)) {
            xml += "<app:onlineOrderDisplayName>" + this.onlineOrderDisplayName + "</app:onlineOrderDisplayName>";
        }
        if (util.isValidBooleanVariable(this.doNotDisplayForOnlineOrder)) {
            xml += "<app:doNotDisplayForOnlineOrder>" + this.doNotDisplayForOnlineOrder + "</app:doNotDisplayForOnlineOrder>";
        }
        if (util.isValidVariable(this.baseWeight)) {
            xml += "<app:baseWeight>" + this.baseWeight + "</app:baseWeight>";
        }
        if (this.itemNumber != null && typeof this.itemNumber != "undefined") {
            xml += "<app:itemNumber>" + this.itemNumber + "</app:itemNumber>";
        }
        if (util.isValidVariable(this.defaultSaleItemSizeId)) {
            xml += "<app:defaultItemSizeId>" + this.defaultSaleItemSizeId + "</app:defaultItemSizeId>";
        }

        if (this.myPrinterIds != null) {
            for (var i = 0; i < this.myPrinterIds.length; i++) {
                xml += "<app:printerIds>" + this.myPrinterIds[i] + "</app:printerIds>";
            }
        }

        if (typeof this.propertyList != "undefined" && this.propertyList != null) {
            for (var i = 0; i < this.propertyList.length; i++) {
                xml += this.propertyList[i].getXML();
            }
        }

        if (this.comboType != null && this.comboType != "") {
            xml += "<app:comboType>" + this.comboType + "</app:comboType>";
            if (this.comboItem != null && this.comboItem != "") {
                xml += "<app:comboItem>" + this.comboItem.getXML() + "</app:comboItem>";
            }
        }

        if (typeof this.attributeList != "undefined" && this.attributeList != null) {
            for (var i = 0; i < this.attributeList.length; i++) {
                xml += "<app:attributes>" + this.attributeList[i].getXML() + "</app:attributes>";
            }
        }
        xml += this.endTag;
        return xml;
    };
}

function ComboItem(id, name, fixedItem, priceAdjustable, comboSections) {
    this.myId = id;
    this.myName = name;
    this.fixedItem = fixedItem;
    this.priceAdjustable = priceAdjustable;
    this.myComboSections = comboSections;
    this.getXML = function () {
        var xml = "";
        if (this.myId != null && this.myId !== "") {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        xml += "<app:name>" + this.myName + "</app:name>";
        if (util.isValidBooleanVariable(this.fixedItem)) {
            xml += "<app:fixedItem>" + this.fixedItem + "</app:fixedItem>";
        }
        if (util.isValidBooleanVariable(this.priceAdjustable)) {
            xml += "<app:priceAdjustable>" + this.priceAdjustable + "</app:priceAdjustable>";
        }
        if (this.myComboSections != null && this.myComboSections != "") {
            for (var i = 0; i < this.myComboSections.length; i++) {
                xml += "<app:comboSections>" + this.myComboSections[i].getXML() + "</app:comboSections>";
            }
        }
        return xml;
    };
}

function ComboSection(id, name, numOfSelectionsAllowed, saleItems) {
    this.myId = id;
    this.myName = name;
    this.myNumOfSelectionsAllowed = numOfSelectionsAllowed;
    this.mySaleItems = saleItems;
    //this.tag = "<app:comboItem>";
    //this.endTag = "</app:comboItem>";
    this.getXML = function () {
        var xml = "";
        if (this.myId != null && this.myId !== "") {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        xml += "<app:name>" + this.myName + "</app:name>";
        if (this.myNumOfSelectionsAllowed != null && this.myNumOfSelectionsAllowed != "") {
            xml += "<app:numOfSelectionsAllowed>" + this.myNumOfSelectionsAllowed + "</app:numOfSelectionsAllowed>";
        }
        if (this.mySaleItems != null && this.mySaleItems != "") {
            for (var i = 0; i < this.mySaleItems.length; i++) {
                xml += "<app:saleItems>" + this.mySaleItems[i].getXML() + "</app:saleItems>";
            }
        }
        //xml += this.endTag;
        return xml;
    };
}

function SaleItemReference(id, name, displayPriority) {
    this.myId = id;
    this.displayPriority = displayPriority;
    this.getXML = function () {
        var xml = "";
        xml += "<app:id>" + this.myId + "</app:id>";
        if (util.isValidVariable(this.displayPriority)) {
            xml += "<app:displayPriority>" + this.displayPriority + "</app:displayPriority>";
        }
        return xml;
    };
}

function CreateSaleItemsType(saleItems) {
    this.saleItems = saleItems;
    this.tag = "<app:CreateSaleItemType>";
    this.endTag = "</app:CreateSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        for (var i = 0; i < this.saleItems.length; i++) {
            xml += this.saleItems[i].getXML();
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    };
}
function CreateItemType(catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierAction, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, hhRate, taxRate, allowHH, color, alternateName, onlineOrderDisplayName, doNotDisplayForOnlineOrder, baseWeight, itemNumber, defaultSaleItemSizeId, ktvItem, outOfStock, attributeList) {
    var isOffMenu = false;
    this.myItem = new SaleItem(null, catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierAction, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, isOffMenu, hhRate, taxRate, allowHH, false, null, color, alternateName, onlineOrderDisplayName, doNotDisplayForOnlineOrder, baseWeight, itemNumber, defaultSaleItemSizeId, ktvItem, outOfStock, attributeList);
    this.tag = "<app:CreateSaleItemType>";
    this.endTag = "</app:CreateSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myItem.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}
function ws_create_item(createItemType, handler) {
    var soapXML = createItemType.getXML();
    callWebService(soapXML, handler);
}

function MenuSetupUpdateItemsType(items, itemType) {
    this.items = items;
    this.updateDetails = false;
    this.tag = "<app:Update" + itemType + "Type>";
    this.endTag = "</app:Update" + itemType + "Type>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        xml += "<app:updateDetails>" + this.updateDetails + "</app:updateDetails>";
        if (this.items != null) {
            for (var i = 0; i < this.items.length; i++) {
                xml += this.items[i].getXML();
            }
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function MenuSetupItemType(id, displayPriority, displayPriorityType, color, itemType) {
    this.id = id;
    this.displayPriority = displayPriority;
    this.displayPriorityType = displayPriorityType;
    this.color = color;
    this.itemType = itemType;
    this.tag = "<app:" + itemType + ">";
    this.endTag = "</app:" + itemType + ">";
    this.getXML = function () {
        var xml = this.tag;
        if (this.id != null) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.displayPriority != null) {
            xml += "<app:" + this.displayPriorityType + ">" + this.displayPriority + "</app:" + this.displayPriorityType + ">";
        }
        if (this.color != null) {
            xml += "<app:color>" + this.color + "</app:color>";
        }
        xml += this.endTag;
        return xml;
    };
}

function UpdateItemType(id, catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierActions, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, happyRate, taxRate, allowHH, color, alternateName, onlineOrderDisplayName, doNotDisplayForOnlineOrder, baseWeight, itemNumber, defaultSaleItemSizeId, ktvItem, outOfStock) {
    var isOffMenu = false;
    this.myItem = new SaleItem(id, catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierActions, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, isOffMenu, happyRate, taxRate, allowHH, false, null, color, alternateName, onlineOrderDisplayName, doNotDisplayForOnlineOrder, baseWeight, itemNumber, defaultSaleItemSizeId, ktvItem, outOfStock, null);
    this.tag = "<app:UpdateSaleItemType>";
    this.endTag = "</app:UpdateSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myItem.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function UpdateSaleItemsType(saleItemList, updateDetails, adminBatchUpdates) {
    this.saleItemList = saleItemList;
    this.updateDetails = updateDetails;
    this.adminBatchUpdates = adminBatchUpdates;
    this.tag = "<app:UpdateSaleItemType>";
    this.endTag = "</app:UpdateSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        if (util.isValidVariable(this.updateDetails)) {
            xml += "<app:updateDetails>" + this.updateDetails + "</app:updateDetails>";
        }
        if (util.isValidVariable(this.adminBatchUpdates)) {
            xml += "<app:adminBatchUpdates>" + this.adminBatchUpdates + "</app:adminBatchUpdates>";
        }
        for (var i = 0; i < this.saleItemList.length; i++) {
            xml += this.saleItemList[i].getXML();
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    };
}

function ListSaleItemsForCategoryType(catId, showOffMenu, showNonCombo, fetchOptions, includeCatOptions, nameIdOnly) {
    this.myCatId = catId;
    this.myShowOffMenu = showOffMenu;
    this.myShowNonCombo = showNonCombo;
    this.myFetchOptions = fetchOptions;
    this.myIncludeCatOptions = includeCatOptions;
    this.myNameIdOnly = nameIdOnly;
    this.tag = "<app:ListSaleItemsForCategoryType>";
    this.endTag = "</app:ListSaleItemsForCategoryType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + "<app:categoryId>" + this.myCatId + "</app:categoryId>";
        if (this.myNameIdOnly != null && (this.myNameIdOnly == true || this.myNameIdOnly == false)) {
            xml += "<app:nameIdOnly>" + this.myNameIdOnly + "</app:nameIdOnly>";
        } else {
            xml += "<app:nameIdOnly>false</app:nameIdOnly>";
        }
        if (this.myShowOffMenu != null && (this.myShowOffMenu == true || this.myShowOffMenu == false))
            xml += "<app:showOffMenuItems>" + this.myShowOffMenu + "</app:showOffMenuItems>";
        else
            xml += "<app:showOffMenuItems>true</app:showOffMenuItems>";
        if (this.myShowNonCombo != null && (this.myShowNonCombo == true || this.myShowNonCombo == false))
            xml += "<app:showNonCombo>" + this.myShowNonCombo + "</app:showNonCombo>";
        else
            xml += "<app:showNonCombo>true</app:showNonCombo>";
        if (this.myFetchOptions != null && (this.myFetchOptions == true || this.myFetchOptions == false))
            xml += "<app:fetchOptions>" + this.myFetchOptions + "</app:fetchOptions>";
        else
            xml += "<app:fetchOptions>false</app:fetchOptions>";
        if (this.myIncludeCatOptions != null && (this.myIncludeCatOptions == true || this.myIncludeCatOptions == false))
            xml += "<app:includeCategoryAttributesAndOptions>" + this.myIncludeCatOptions + "</app:includeCategoryAttributesAndOptions>";
        else
            xml += "<app:includeCategoryAttributesAndOptions>false</app:includeCategoryAttributesAndOptions>";
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}
function FetchSaleItemType(itemId, showOffMenu, showNonCombo, fetchOptions, includeCatOptions, nameIdOnly) {
    this.myId = itemId;
    this.myFetchOptions = fetchOptions;
    this.showOffMenu = showOffMenu;
    this.showNonCombo = showNonCombo;
    this.myIncludeCatOptions = includeCatOptions;
    this.nameIdOnly = nameIdOnly;
    this.tag = "<app:FetchSaleItemType>";
    this.endTag = "</app:FetchSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + "<app:itemId>" + this.myId + "</app:itemId>"
        if (this.myFetchOptions != null && (this.myFetchOptions == true || this.myFetchOptions == false))
            xml += "<app:fetchOptions>" + this.myFetchOptions + "</app:fetchOptions>";
        else
            xml += "<app:fetchOptions>false</app:fetchOptions>";
        if (this.myIncludeCatOptions != null && (this.myIncludeCatOptions == true || this.myIncludeCatOptions == false))
            xml += "<app:includeCategoryAttributesAndOptions>" + this.myIncludeCatOptions + "</app:includeCategoryAttributesAndOptions>";
        else
            xml += "<app:includeCategoryAttributesAndOptions>false</app:includeCategoryAttributesAndOptions>";

        if (typeof this.showOffMenu != 'undefined' && this.showOffMenu != null) {
            xml += "<app:showOffMenuItems>" + this.showOffMenu + "</app:showOffMenuItems>";
        }
        if (typeof this.showNonCombo != 'undefined' && this.showNonCombo != null) {
            xml += "<app:showNonCombo>" + this.showNonCombo + "</app:showNonCombo>";
        }
        if (typeof this.nameIdOnly != 'undefined' && this.nameIdOnly != null) {
            xml += "<app:nameIdOnly>" + this.nameIdOnly + "</app:nameIdOnly>";
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteSaleItemType(ids) {
    this.ids = ids;
    this.tag = "<app:DeleteSaleItemType>";
    this.endTag = "</app:DeleteSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        for (var i = 0; i < ids.length; i++) {
            xml += "<app:itemId>" + ids[i] + "</app:itemId>";
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    }
}
function GlobalOptionType(id, name, price, optionShortName, catID, onlineOrderDisplayName, optionCode, doNotDisplayForOnlineOrder, optionPrice) {
    this.myId = id;
    this.myName = name;
    this.myPrice = price;
    this.myOptionShortName = optionShortName;
    this.myCatID = catID;
    this.myOptionPrice = optionPrice;
    this.onlineOrderDisplayName = onlineOrderDisplayName;
    this.optionCode = optionCode;
    this.doNotDisplayForOnlineOrder = doNotDisplayForOnlineOrder;
    this.getXML = function () {
        var xml = "<app:globalOption>";
        if (this.myId != null && this.myId !== "") {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        xml += "<app:name>" + this.myName + "</app:name>";
        if (this.myPrice != null && this.myPrice != "") {
            xml += "<app:price>" + this.myPrice + "</app:price>";
        }
        if (this.myOptionShortName != null && this.myOptionShortName != "") {
            xml += "<app:shortName>" + this.myOptionShortName + "</app:shortName>";
        }
        if (this.myCatID != null && this.myCatID != "") {
            xml += "<app:categoryID>" + this.myCatID + "</app:categoryID>";
        }
        if (util.isValidVariable(this.onlineOrderDisplayName)) {
            xml += "<app:onlineOrderDisplayName>" + this.onlineOrderDisplayName + "</app:onlineOrderDisplayName>";
        }
        if (this.optionCode != null && this.optionCode != "") {
            xml += "<app:optionCode>" + this.optionCode + "</app:optionCode>";
        }
        if (util.isValidBooleanVariable(this.doNotDisplayForOnlineOrder)) {
            xml += "<app:doNotDisplayForOnlineOrder>" + this.doNotDisplayForOnlineOrder + "</app:doNotDisplayForOnlineOrder>";
        }
        if (this.myOptionPrice != null) {
            for (var i = 0; i < this.myOptionPrice.length; i++) {
                xml += "<app:optionPrice>" + this.myOptionPrice[i].getXML() + "</app:optionPrice>";
            }
        }
        xml += "</app:globalOption>";
        return xml;
    }
}
function ListGlobalOptionsType(groupByCategory) {
    this.groupByCategory = groupByCategory;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListGlobalOptionType>";
        if (util.isValidVariable(this.groupByCategory)) {
            xml += "<app:groupByCategory>" + this.groupByCategory + "</app:groupByCategory>";
        }
        xml += "</app:ListGlobalOptionType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function CreateGlobalOptionType(name, price, optionShortName, catID, onlineOrderDisplayName, optionCode, doNotDisplayForOnlineOrder, optionPrice) {
    this.optionType = new GlobalOptionType(null, name, price, optionShortName, catID, onlineOrderDisplayName, optionCode, doNotDisplayForOnlineOrder, optionPrice);
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:CreateGlobalOptionType>";
        xml += this.optionType.getXML();
        xml += "</app:CreateGlobalOptionType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function UpdateGlobalOptionType(id, name, price, optionShortName, catID, onlineOrderDisplayName, optionCode, doNotDisplayForOnlineOrder, optionPrice, updateDetails) {
    this.optionType = new GlobalOptionType(id, name, price, optionShortName, catID, onlineOrderDisplayName, optionCode, doNotDisplayForOnlineOrder, optionPrice);
    this.updateDetails = updateDetails;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:UpdateGlobalOptionType>";
        xml += this.optionType.getXML();
        if (typeof this.updateDetails != "undefined" && this.updateDetails != null) {
            xml += "<app:updateDetails>" + this.updateDetails + "</app:updateDetails>";
        }
        xml += "</app:UpdateGlobalOptionType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteGlobalOptionType(id) {
    this.myId = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteGlobalOptionType>";
        xml += "<app:id>" + this.myId + "</app:id>";
        xml += "</app:DeleteGlobalOptionType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function FetchGlobalOptionType(id) {
    this.myId = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchGlobalOptionType>" + "<app:id>" + this.myId + "</app:id>";
        xml += "</app:FetchGlobalOptionType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function ItemOptionType(id, name, shortName, thumbPath, desc, displayPriority, price, optionPrice, onlineOrderDisplayName, doNotDisplayForOnlineOrder, itemAttributeId) {
    this.myId = id;
    this.myName = name;
    this.myShortName = shortName;
    this.thumbPath = thumbPath;
    this.myDesc = desc;
    this.displayPriority = displayPriority;
    this.myPrice = price;
    this.itemAttributeId = itemAttributeId;
    this.myOptionPrice = optionPrice;
    this.onlineOrderDisplayName = onlineOrderDisplayName;
    this.doNotDisplayForOnlineOrder = doNotDisplayForOnlineOrder;
    this.getXML = function () {
        var xml = "";
        if (this.myId != null && this.myId !== "") {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        xml += "<app:name>" + this.myName + "</app:name>";
        if (util.isValidSoapRequestVariable(this.myDesc)) {
            xml += "<app:description>" + this.myDesc + "</app:description>";
        }
        if (util.isValidVariable(this.displayPriority)) {
            xml += "<app:displayPriority>" + this.displayPriority + "</app:displayPriority>";
        }
        if (util.isValidSoapRequestVariable(this.myShortName)) {
            xml += "<app:shortName>" + this.myShortName + "</app:shortName>";
        }
        if (util.isValidVariable(this.thumbPath)) {
            xml += "<app:thumbPath>" + this.thumbPath + "</app:thumbPath>";
        }
        if (this.myPrice != null && this.myPrice != "") {
            xml += "<app:price>" + this.myPrice + "</app:price>";
        }
        if (util.isValidSoapRequestVariable(this.onlineOrderDisplayName)) {
            xml += "<app:onlineOrderDisplayName>" + this.onlineOrderDisplayName + "</app:onlineOrderDisplayName>";
        }
        if (util.isValidBooleanVariable(this.doNotDisplayForOnlineOrder)) {
            xml += "<app:doNotDisplayForOnlineOrder>" + this.doNotDisplayForOnlineOrder + "</app:doNotDisplayForOnlineOrder>";
        }
        if (util.isValidVariable(this.itemAttributeId)) {
            xml += "<app:attributeId>" + this.itemAttributeId + "</app:attributeId>";
        }
        if (this.myOptionPrice != null) {
            for (var i = 0; i < this.myOptionPrice.length; i++) {
                xml += "<app:optionPrice>" + this.myOptionPrice[i].getXML() + "</app:optionPrice>";
            }
        }
        return xml;
    }
}
function SaveItemOptionType(id, name, shortName, thumbPath, desc, displayPriority, price, optionPrice, onlineOrderDisplayName, doNotDisplayForOnlineOrder, categoryId, saleItemId, itemAttributeId) {
    this.myOption = new ItemOptionType(id, name, shortName, thumbPath, desc, displayPriority, price, optionPrice, onlineOrderDisplayName, doNotDisplayForOnlineOrder, itemAttributeId);
    this.categoryId = categoryId;
    this.saleItemId = saleItemId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveItemOptionType>";
        if (util.isValidVariable(this.categoryId)) {
            xml += "<app:categoryId>" + this.categoryId + "</app:categoryId>";
        }
        if (util.isValidVariable(this.saleItemId)) {
            xml += "<app:saleItemId>" + this.saleItemId + "</app:saleItemId>";
        }
        xml += "<app:itemOption>" + this.myOption.getXML() + "</app:itemOption>";
        xml += "</app:SaveItemOptionType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function FetchItemOptionType(id) {
    this.myId = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchItemOptionType>";
        xml += "<app:id>" + this.myId + "</app:id>";
        xml += "</app:FetchItemOptionType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteItemOptionType(id) {
    this.myId = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteItemOptionType>";
        xml += "<app:id>" + this.myId + "</app:id>";
        xml += "</app:DeleteItemOptionType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function ListItemOptionsType(categoryId, saleItemId) {
    this.categoryId = categoryId;
    this.saleItemId = saleItemId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListItemOptionsType>";
        if (util.isValidVariable(this.categoryId)) {
            xml += "<app:categoryId>" + this.categoryId + "</app:categoryId>";
        }
        if (util.isValidVariable(this.saleItemId)) {
            xml += "<app:saleItemId>" + this.saleItemId + "</app:saleItemId>";
        }
        xml += "</app:ListItemOptionsType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function ItemAttributeType(id, name, minNumSelections, maxNumSelections, displayPriority, onlineOrderDisplayName, doNotDisplayForOnlineOrder, type, optionList) {
    this.id = id;
    this.name = name;
    this.minNumSelections = minNumSelections;
    this.maxNumSelections = maxNumSelections;
    this.displayPriority = displayPriority;
    this.onlineOrderDisplayName = onlineOrderDisplayName;
    this.doNotDisplayForOnlineOrder = doNotDisplayForOnlineOrder;
    this.type = type;
    this.optionList = optionList;
    this.getXML = function () {
        var xml = "";
        if (this.id != null && this.id !== "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "<app:name>" + this.name + "</app:name>";
        if (util.isValidSoapRequestVariable(this.onlineOrderDisplayName)) {
            xml += "<app:onlineOrderDisplayName>" + this.onlineOrderDisplayName + "</app:onlineOrderDisplayName>";
        }
        if (util.isValidBooleanVariable(this.doNotDisplayForOnlineOrder)) {
            xml += "<app:doNotDisplayForOnlineOrder>" + this.doNotDisplayForOnlineOrder + "</app:doNotDisplayForOnlineOrder>";
        }
        if (util.isValidVariable(this.minNumSelections)) {
            xml += "<app:minNumberOfSelectionAllowed>" + this.minNumSelections + "</app:minNumberOfSelectionAllowed>";
        }
        if (util.isValidVariable(this.maxNumSelections)) {
            xml += "<app:maxNumberOfSelectionAllowed>" + this.maxNumSelections + "</app:maxNumberOfSelectionAllowed>";
        }
        if (util.isValidVariable(this.displayPriority)) {
            xml += "<app:displayPriority>" + this.displayPriority + "</app:displayPriority>";
        }
        if (util.isValidVariable(this.type)) {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        if (typeof this.optionList != "undefined" && this.optionList != null) {
            for (var i = 0; i < this.optionList.length; i++) {
                xml += "<app:options>" + this.optionList[i].getXML() + "</app:options>";
            }
        }
        return xml;
    }
}
function SaveItemAttributeType(id, name, minNumSelections, maxNumSelections, displayPriority, onlineOrderDisplayName, doNotDisplayForOnlineOrder, categoryId, saleItemId) {
    this.itemAttribute = new ItemAttributeType(id, name, minNumSelections, maxNumSelections, displayPriority, onlineOrderDisplayName, doNotDisplayForOnlineOrder, null);
    this.categoryId = categoryId;
    this.saleItemId = saleItemId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveItemAttributeType>";
        xml += "<app:attribute>" + this.itemAttribute.getXML() + "</app:attribute>";
        if (this.categoryId != null && this.categoryId !== "") {
            xml += "<app:categoryId>" + this.categoryId + "</app:categoryId>";
        }
        if (this.saleItemId != null && this.saleItemId !== "") {
            xml += "<app:saleItemId>" + this.saleItemId + "</app:saleItemId>";
        }
        xml += "</app:SaveItemAttributeType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteItemAttributeType(id) {
    this.myId = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteItemAttributeType><app:id>" + this.myId + "</app:id></app:DeleteItemAttributeType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function FetchItemAttributeType(id) {
    this.myId = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchItemAttributeType><app:id>" + this.myId + "</app:id></app:FetchItemAttributeType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function ListItemAttributesType(categoryId, saleItemId) {
    this.categoryId = categoryId;
    this.saleItemId = saleItemId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListItemAttributesType>";
        if (this.categoryId != null && this.categoryId !== "") {
            xml += "<app:categoryId>" + this.categoryId + "</app:categoryId>";
        }
        if (this.saleItemId != null && this.saleItemId !== "") {
            xml += "<app:saleItemId>" + this.saleItemId + "</app:saleItemId>";
        }
        xml += "</app:ListItemAttributesType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function Table(aId, aName, aX, aY, aAreaId, aDefaultGuestCount, width, height, shape, hibachiTableShape, seatingOrientation, defaultSaleItemId, tableCategoryId) {
    this.id = aId;
    this.name = aName;
    this.x = aX;
    this.y = aY;
    this.areaId = aAreaId;
    this.defaultGuestCount = aDefaultGuestCount;
    this.width = width;
    this.height = height;
    this.shape = shape;
    this.hibachiTableShape = hibachiTableShape;
    this.seatingOrientation = seatingOrientation;
    this.defaultSaleItemId = defaultSaleItemId;
    this.tableCategoryId = tableCategoryId;
    this.getXML = function () {
        var xml = "<app:table>";
        if (this.id != null && parseInt(this.id) > 0) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "<app:name>" + this.name + "</app:name>";
        xml += "<app:x>" + this.x + "</app:x>";
        xml += "<app:y>" + this.y + "</app:y>";
        if (this.areaId != null && parseInt(this.areaId) > 0) {
            xml += "<app:areaId>" + this.areaId + "</app:areaId>";
        }
        if (this.width != null && typeof this.width != "undefined") {
            xml += "<app:width>" + this.width + "</app:width>";
        }
        if (this.height != null && typeof this.height != "undefined") {
            xml += "<app:height>" + this.height + "</app:height>";
        }
        if (this.shape != null && typeof this.shape != "undefined") {
            xml += "<app:shape>" + this.shape + "</app:shape>";
        }
        if (util.isValidVariable(this.hibachiTableShape)) {
            xml += "<app:hibachiTableShape>" + this.hibachiTableShape + "</app:hibachiTableShape>";
        }
        if (util.isValidVariable(this.seatingOrientation)) {
            xml += "<app:seatingOrientation>" + this.seatingOrientation + "</app:seatingOrientation>";
        }
        if (util.isValidVariable(this.defaultSaleItemId)) {
            xml += "<app:defaultSaleItemId>" + this.defaultSaleItemId + "</app:defaultSaleItemId>";
        }
        if (util.isValidVariable(this.tableCategoryId)) {
            xml += "<app:tableCategoryId>" + this.tableCategoryId + "</app:tableCategoryId>";
        }
        xml += "<app:defaultGuestCount>" + this.defaultGuestCount + "</app:defaultGuestCount>";
        xml += "</app:table>";
        return xml;
    }
}
function SaveTableType(aTable) {
    this.table = aTable;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveTableType>";
        xml += this.table.getXML();
        xml += "</app:SaveTableType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteTableType(aId) {
    this.id = aId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteTableType><app:id>" + this.id + "</app:id></app:DeleteTableType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function ListAreasType(fetchOrders) {
    this.fetchOrders = fetchOrders;
    this.getXML = function () {
        var xml = soapXMLBegin + "<app:ListAreasType>";
        if (typeof this.fetchOrders != "undefined" && this.fetchOrders != null && this.fetchOrders !== "") {
            xml += "<app:fetchOrders>" + this.fetchOrders + "</app:fetchOrders>";
        }
        xml += "</app:ListAreasType>" + soapXMLEnd;
        return xml;
    }
}
function SaveAreaType(aName, aId) {
    this.name = aName;
    this.id = aId;
    this.tables = new Array();
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveSeatingAreaType>";
        xml += "<app:areaType><app:name>" + this.name + "</app:name>";
        if (this.id != null && this.id !== "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        for (var i = 0; i < this.tables.length; i++) {
            xml += "<app:tables>";
            if (this.tables[i].id != null && parseInt(this.tables[i].id) > 0) {
                xml += "<app:id>" + this.tables[i].id + "</app:id>";
            }
            xml += "<app:name>" + this.tables[i].name + "</app:name>";
            xml += "<app:x>" + this.tables[i].x + "</app:x>";
            xml += "<app:y>" + this.tables[i].y + "</app:y>";
            xml += "<app:defaultGuestCount>" + this.tables[i].defaultGuestCount + "</app:defaultGuestCount>";
            xml += "<app:areaId>" + this.id + "</app:areaId>";
            if (this.tables[i].width != null && typeof this.tables[i].width != "undefined") {
                xml += "<app:width>" + this.tables[i].width + "</app:width>";
            }
            if (this.tables[i].height != null && typeof this.tables[i].height != "undefined") {
                xml += "<app:height>" + this.tables[i].height + "</app:height>";
            }
            if (this.tables[i].shape != null && typeof this.tables[i].shape != "undefined") {
                xml += "<app:shape>" + this.tables[i].shape + "</app:shape>";
            }
            if (util.isValidVariable(this.tables[i].defaultSaleItemId)) {
                xml += "<app:defaultSaleItemId>" + this.tables[i].defaultSaleItemId + "</app:defaultSaleItemId>";
            }

            xml += "</app:tables>";
        }
        xml += "</app:areaType></app:SaveSeatingAreaType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteAreaType(aId) {
    this.id = aId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteSeatingAreaType>"
        xml += "<app:id>" + aId + "</app:id>";
        xml += "</app:DeleteSeatingAreaType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FunctionModuleType(aId, aName) {
    this.id = aId;
    this.name = aName;
    this.getXML = function () {
        var xml = "<app:name>" + this.name + "</app:name>";
        if (this.id != null && this.id !== "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        return xml;
    }
}

function PermissionDTO(aId, aName) {
    this.id = aId;
    this.name = aName;
}

function UserType(aId, aPasscode, aSwipeData, systemUser) {
    this.id = aId;
    this.passcode = aPasscode;
    this.swipeData = aSwipeData;
    this.systemUser = systemUser;
    this.modules = new Array();
    this.roles = new Array();
    this.subscribedTopics = new Array();
    this.getXML = function () {
        if (this.passcode != null && this.passcode != "***") {
            var xml = "<app:passcode>" + this.passcode + "</app:passcode>";
        }
        if (this.id != null && this.id != "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.swipeData != null && this.swipeData != "********") {
            xml += "<app:swipeData>" + this.swipeData + "</app:swipeData>";
        }
        for (var i = 0; i < this.modules.length; i++) {
            xml += "<app:functions>" + this.modules[i].getXML() + "</app:functions>";
        }
        for (var i = 0; i < this.roles.length; i++) {
            xml += "<app:roles>" + this.roles[i].getXML() + "</app:roles>";
        }
        for (var i = 0; i < this.subscribedTopics.length; i++) {
            xml += "<app:subscribedTopics>" + this.subscribedTopics[i].getXML() + "</app:subscribedTopics>";
        }
        return xml;
    }
}
function SaveTaxType(aId, aRate, aOutRate, aName, aDescription, aTaxFileNumber, aTaxIncreases, aPriceLimit, aTaxIncreaseName, aTaxIncreaseRate) {
    this.id = aId;
    this.rate = aRate;
    this.outRate = aOutRate;
    this.name = aName;
    this.description = aDescription;
    this.taxFileNumber = aTaxFileNumber;
    this.taxIncrease = aTaxIncreases;
    this.priceLimit = aPriceLimit;
    this.taxIncreaseName = aTaxIncreaseName;
    this.taxIncreaseRate = aTaxIncreaseRate
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveTaxType><app:tax>";
        if (this.id != null && this.id !== "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "<app:rate>" + this.rate + "</app:rate>";
        xml += "<app:outRate>" + this.outRate + "</app:outRate>";
        xml += "<app:name>" + this.name + "</app:name>";
        if (typeof this.description != "undefined" && this.description) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (typeof this.taxFileNumber != "undefined" && this.taxFileNumber) {
            xml += "<app:taxFileNumber>" + this.taxFileNumber + "</app:taxFileNumber>";
        }
        xml += "<app:taxIncrease>" + this.taxIncrease + "</app:taxIncrease>";
        console.log(this.taxIncrease + "==");
        if (this.taxIncrease != "DEFAULT") {
            xml += "<app:priceLimit>" + this.priceLimit + "</app:priceLimit>";
            xml += "<app:taxIncreaseName>" + this.taxIncreaseName + "</app:taxIncreaseName>";
            xml += "<app:taxIncreaseRate>" + this.taxIncreaseRate + "</app:taxIncreaseRate>";
        }
        xml += "</app:tax></app:SaveTaxType>";
        xml += soapXMLEnd;

        return xml;
    }
}
function ListTaxesType(aHtmlObject) {
    this.htmlObject = aHtmlObject;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListTaxesType>";
        if (this.htmlObject != null && this.htmlObject != "") {
            xml += "<app:htmlObject>" + this.htmlObject + "</app:htmlObject>";
        }
        xml += "</app:ListTaxesType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteTaxType(aId) {
    this.id = aId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteTaxType><app:taxId>" + this.id + "</app:taxId></app:DeleteTaxType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function ListOrdersByDateNumberType(aStart, aEnd, aServerId) {
    this.start = aStart;
    this.end = aEnd;
    this.serverId = aServerId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListOrdersByDateNumberType><app:startTime>" + this.start + "</app:startTime>";
        xml += "<app:endTime>" + this.end + "</app:endTime>";
        if (this.serverId != null && this.serverId != "") {
            xml += "<app:serverId>" + this.serverId + "</app:serverId>";
        }
        xml += "</app:ListOrdersByDateNumberType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function ListAllSaleItemsByCategoryAndGroupType(showOnlineOrderItems, showSummaryOnly) {
    this.showOnlineOrderItems = showOnlineOrderItems;
    this.showSummaryOnly = showSummaryOnly;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListAllSaleItemsByCategoryAndGroupType>"
        xml += "<app:showOffMenuItems>" + false + "</app:showOffMenuItems>";
        xml += "<app:fetchOptions>" + true + "</app:fetchOptions>";
        xml += "<app:includeCategoryAttributesAndOptions>" + false + "</app:includeCategoryAttributesAndOptions>";
        xml += "<app:fetchItemAttributes>" + true + "</app:fetchItemAttributes>";
        xml += "<app:showNonComboOnly>" + false + "</app:showNonComboOnly>";
        xml += "<app:hideNonEMenuItems>" + false + "</app:hideNonEMenuItems>";
        xml += "<app:showItemsForComboOnly>" + true + "</app:showItemsForComboOnly>";
        xml += "<app:combineNumberAndName>" + false + "</app:combineNumberAndName>";
        if (util.isValidBooleanVariable(this.showOnlineOrderItems)) {
            xml += "<app:showOnlineOrderItems>" + this.showOnlineOrderItems + "</app:showOnlineOrderItems>";
        }
        if (util.isValidBooleanVariable(this.showOnlineOrderItems)) {
            xml += "<app:combineMenuGroups>false</app:combineMenuGroups>";
        }
        if (util.isValidBooleanVariable(this.showSummaryOnly)) {
            xml += "<app:fetchSummaryOnly>" + this.showSummaryOnly + "</app:fetchSummaryOnly>";
        }
        xml += "</app:ListAllSaleItemsByCategoryAndGroupType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function CreateComboItemType(catId, reportGroupId, name, description, thumb, printerIds, allowModifierActions, price, isTaxable, itemPrice, isOffMenu, hhRate, taxRate, allowHH, comboType, comboItems) {
    this.myItem = new SaleItem(id, catId, reportGroupId, name, description, thumb, printerIds, allowModifierActions, price, isTaxable, itemPrice, isOffMenu, hhRate, taxRate, allowHH, comboType, comboItems, null);
    this.tag = "<app:CreateSaleItemType>";
    this.endTag = "</app:CreateSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myItem.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function UpdateComboItemType(id, catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierActions, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, isOffMenu, hhRate, taxRate, allowHH, comboType, comboItems) {
    this.myItem = new SaleItem(id, catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierActions, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, isOffMenu, hhRate, taxRate, allowHH, comboType, comboItems, null);
    this.updateDetails = false;
    this.tag = "<app:UpdateSaleItemType>";
    this.endTag = "</app:UpdateSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        xml += "<app:updateDetails>" + this.updateDetails + "</app:updateDetails>";
        xml += this.myItem.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function AddComboItemType(catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierActions, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, isOffMenu, hhRate, taxRate, allowHH, comboType, comboItems) {
    this.myItem = new SaleItem(null, catId, reportGroupId, name, shortName, description, thumb, printerIds, allowModifierActions, sendToKitchenRequired, forComboOnly, marketPriceItem, giftCardItem, price, isTaxable, itemPrice, propertyList, isOffMenu, hhRate, taxRate, allowHH, comboType, comboItems);
    this.tag = "<app:CreateSaleItemType>";
    this.endTag = "</app:CreateSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.myItem.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteComboItemType(itemId) {
    this.myId = itemId;
    this.tag = "<app:DeleteSaleItemType>";
    this.endTag = "</app:DeleteSaleItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + "<app:itemId>" + this.myId + "</app:itemId>" + this.endTag;
        xml += soapXMLEnd;
        return xml;
    }
}

function ListDiscountRatesType() {
    this.tag = "<app:ListDiscountRatesType>";
    this.endTag = "</app:ListDiscountRatesType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.endTag;
        xml += soapXMLEnd;
        return xml;
    }
}

function ListFieldDisplayNamesGroupType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListFieldDisplayNamesGroupType>"
        xml += "</app:ListFieldDisplayNamesGroupType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function AddSystemLanguageType(name, code) {
    this.name = name;
    this.code = code;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:AddSystemLanguageType><app:systemLanguage>";
        xml += "<app:name>" + this.name + "</app:name>";
        xml += "<app:code>" + this.code + "</app:code>";
        xml += "</app:systemLanguage></app:AddSystemLanguageType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function UpdateSystemLanguageType(id, name, code, enabled) {
    this.name = name;
    this.code = code;
    this.id = id;
    this.enabled = enabled;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:UpdateSystemLanguageType><app:systemLanguage>";
        xml += "<app:id>" + this.id + "</app:id>";
        if (typeof this.name != "undefined" && this.name) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (typeof this.code != "undefined" && this.code) {
            xml += "<app:code>" + this.code + "</app:code>";
        }
        if (typeof this.enabled != "undefined" && this.enabled != null && this.enabled !== "") {
            xml += "<app:enabled>" + this.enabled + "</app:enabled>";
        }
        xml += "</app:systemLanguage></app:UpdateSystemLanguageType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteSystemLanguageType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteSystemLanguageType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteSystemLanguageType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function AddFieldDisplayNameType(name, itemID, fieldName, languageID, fieldType) {
    this.name = name;
    this.itemID = itemID;
    this.fieldName = fieldName;
    this.languageID = languageID;
    this.fieldType = fieldType;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:AddFieldDisplayNameType><app:fieldDisplayName>";
        xml += "<app:name><![CDATA[" + this.name + "]]></app:name>";
        xml += "<app:itemID>" + this.itemID + "</app:itemID>";
        xml += "<app:fieldName><![CDATA[" + this.fieldName + "]]></app:fieldName>";
        xml += "<app:languageID>" + this.languageID + "</app:languageID>";
        xml += "<app:fieldType><![CDATA[" + this.fieldType + "]]></app:fieldType>";
        xml += "</app:fieldDisplayName></app:AddFieldDisplayNameType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function UpdateFieldDisplayNameType(id, name, itemID, fieldName, languageID, fieldType) {
    this.id = id;
    this.name = name;
    this.itemID = itemID;
    this.fieldName = fieldName;
    this.languageID = languageID;
    this.fieldType = fieldType;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:UpdateFieldDisplayNameType><app:fieldDisplayName>";
        xml += "<app:id>" + this.id + "</app:id>";
        if (this.name != null && this.name != "") {
            xml += "<app:name><![CDATA[" + this.name + "]]></app:name>";
        }
        if (this.itemID != null && this.itemID != "") {
            xml += "<app:itemID>" + this.itemID + "</app:itemID>";
        }
        if (this.fieldName != null && this.fieldName != "") {
            xml += "<app:fieldName><![CDATA[" + this.fieldName + "]]></app:fieldName>";
        }
        if (this.languageID != null && this.languageID != "") {
            xml += "<app:languageID>" + this.languageID + "</app:languageID>";
        }
        if (this.fieldType != null && this.fieldType != "") {
            xml += "<app:fieldType><![CDATA[" + this.fieldType + "]]></app:fieldType>";
        }
        xml += "</app:fieldDisplayName></app:UpdateFieldDisplayNameType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteFieldDisplayNameType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteFieldDisplayNameType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteFieldDisplayNameType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function ListSystemLanguagesType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListSystemLanguagesType>"
        xml += "</app:ListSystemLanguagesType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function CreateRestaurantHoursType(name, from, to, fromDayOfWeek, toDayOfWeek, description) {
    this.restaurantHours = new RestaurantHoursType(null, name, from, to, fromDayOfWeek, toDayOfWeek, description);
    this.tag = "<app:AddRestaurantHoursType>";
    this.endTag = "</app:AddRestaurantHoursType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.restaurantHours.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function UpdateRestaurantHoursType(id, name, from, to, fromDayOfWeek, toDayOfWeek, description) {
    this.restaurantHours = new RestaurantHoursType(id, name, from, to, fromDayOfWeek, toDayOfWeek, description);
    this.tag = "<app:UpdateRestaurantHoursType>";
    this.endTag = "</app:UpdateRestaurantHoursType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.restaurantHours.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteRestaurantHoursType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteRestaurantHoursType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteRestaurantHoursType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FetchRestaurantHoursType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchRestaurantHoursType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:FetchRestaurantHoursType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function ListAllRestaurantHoursType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListRestaurantHoursType>"
        xml += "</app:ListRestaurantHoursType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function RestaurantHoursType(id, name, from, to, fromDayOfWeek, toDayOfWeek, description) {
    this.id = id;
    this.name = name;
    this.from = from;
    this.to = to;
    this.fromDayOfWeek = fromDayOfWeek;
    this.toDayOfWeek = toDayOfWeek;
    this.description = description;
    this.getXML = function () {
        var xml = "<app:hours>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name != "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.from != null && this.from != "" && typeof this.from != "undefined") {
            xml += "<app:from>" + this.from + "</app:from>";
        }
        if (this.to != null && this.to != "" && typeof this.to != "undefined") {
            xml += "<app:to>" + this.to + "</app:to>";
        }
        if (util.isValidVariable(this.fromDayOfWeek)) {
            xml += "<app:fromDayOfWeek>" + this.fromDayOfWeek + "</app:fromDayOfWeek>";
        }
        if (util.isValidVariable(this.toDayOfWeek)) {
            xml += "<app:toDayOfWeek>" + this.toDayOfWeek + "</app:toDayOfWeek>";
        }
        if (this.description != null && this.description != "" && typeof this.description != "undefined") {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        xml += "</app:hours>";
        return xml;
    }
}

function ModifierActionType(id, name, shortName, modifierCode, priceMultiplier, description) {
    this.id = id;
    this.name = name;
    this.shortName = shortName;
    this.modifierCode = modifierCode;
    this.priceMultiplier = priceMultiplier;
    this.description = description;
    this.getXML = function () {
        var xml = "<app:modifierAction>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name != "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.name != null && this.name != "" && typeof this.name != "undefined") {
            xml += "<app:shortName>" + this.shortName + "</app:shortName>";
        }
        if (this.modifierCode != null && this.modifierCode != "" && typeof this.modifierCode != "undefined") {
            xml += "<app:modifierCode>" + this.modifierCode + "</app:modifierCode>";
        }
        if (this.priceMultiplier != null && this.priceMultiplier != "" && typeof this.priceMultiplier != "undefined") {
            xml += "<app:priceMultiplier>" + this.priceMultiplier + "</app:priceMultiplier>";
        }
        if (this.description != null && this.description != "" && typeof this.description != "undefined") {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        xml += "</app:modifierAction>";
        return xml;
    }
}

function ListModifierActionsType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListModifierActionsType>"
        xml += "</app:ListModifierActionsType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function CreateModifierActionType(name, shortName, modifierCode, priceMultiplier, description) {
    this.modifierAction = new ModifierActionType(null, name, shortName, modifierCode, priceMultiplier, description);
    this.tag = "<app:AddModifierActionType>";
    this.endTag = "</app:AddModifierActionType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.modifierAction.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function UpdateModifierActionType(id, name, shortName, modifierCode, priceMultiplier, description) {
    this.modifierAction = new ModifierActionType(id, name, shortName, modifierCode, priceMultiplier, description);
    this.tag = "<app:UpdateModifierActionType>";
    this.endTag = "</app:UpdateModifierActionType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.modifierAction.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteModifierActionType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteModifierActionType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteModifierActionType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FetchModifierActionType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchModifierActionType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:FetchModifierActionType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function ListGlobalOptionCategoriesType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListGlobalOptionCategoryType>"
        xml += "</app:ListGlobalOptionCategoryType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function CreateGlobalOptionCategoryType(name) {
    this.globalOptionCategory = new GlobalOptionCategoryType(null, name);
    this.tag = "<app:CreateGlobalOptionCategoryType>";
    this.endTag = "</app:CreateGlobalOptionCategoryType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.globalOptionCategory.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function UpdateGlobalOptionCategoryType(id, name) {
    this.globalOptionCategory = new GlobalOptionCategoryType(id, name);
    this.tag = "<app:UpdateGlobalOptionCategoryType>";
    this.endTag = "</app:UpdateGlobalOptionCategoryType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.globalOptionCategory.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteGlobalOptionCategoryType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteGlobalOptionCategoryType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteGlobalOptionCategoryType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FetchGlobalOptionCategoryType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchGlobalOptionCategoryType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:FetchGlobalOptionCategoryType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function GlobalOptionCategoryType(id, name) {
    this.id = id;
    this.name = name;
    this.getXML = function () {
        var xml = "<app:globalOptionCategory>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name != "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        xml += "</app:globalOptionCategory>";
        return xml;
    }
}

function DeviceType(id, name, realName, type, manufacturerName, printerId, defaultDeviceId, ipAddr, port, modelName, communicationType, additionalSettings, pinPadTipAdjustment, pinPadSignatureAdjustment, staffList, terminalId, pairingToken) {
    this.id = id;
    this.name = name;
    this.realName = realName;
    this.type = type;
    this.manufacturerName = manufacturerName;
    this.printerId = printerId;
    this.defaultDeviceId = defaultDeviceId;
    this.ipAddr = ipAddr;
    this.port = port;
    this.modelName = modelName;
    this.communicationType = communicationType;
    this.additionalSettings = additionalSettings;
    this.pinPadTipAdjustment = pinPadTipAdjustment;
    this.pinPadSignatureAdjustment = pinPadSignatureAdjustment;
    this.staffList = staffList;
    this.terminalId = terminalId;
    this.pairingToken = pairingToken;
    this.getXML = function () {
        var xml = "<app:device>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name != "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.realName != null && this.realName != "" && typeof this.realName != "undefined") {
            xml += "<app:realName>" + this.realName + "</app:realName>";
        }
        if (this.type != null && this.type != "" && typeof this.type != "undefined") {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        if (this.manufacturerName != null && this.manufacturerName != "" && typeof this.manufacturerName != "undefined") {
            xml += "<app:manufacturerName>" + this.manufacturerName + "</app:manufacturerName>";
        }
        if (this.printerId != null && this.printerId != "" && typeof this.printerId != "undefined") {
            xml += "<app:printerID>" + this.printerId + "</app:printerID>";
        }
        if (this.defaultDeviceId !== null && this.defaultDeviceId != "" && typeof this.defaultDeviceId != "undefined") {
            xml += "<app:defaultDevice>" + this.defaultDeviceId + "</app:defaultDevice>";
        }
        if (typeof this.ipAddr != "undefined" && this.ipAddr != null && this.ipAddr !== "") {
            xml += "<app:ipAddress>" + this.ipAddr + "</app:ipAddress>";
        }
        if (util.isValidVariableOrEmpty(this.port)) {
            xml += "<app:port>" + this.port + "</app:port>";
        }
        if (util.isValidVariableOrEmpty(this.modelName)) {
            xml += "<app:modelName>" + this.modelName + "</app:modelName>";
        }
        if (util.isValidVariable(this.communicationType)) {
            xml += "<app:communicationType>" + this.communicationType + "</app:communicationType>";
        }
        if (util.isValidVariableOrEmpty(this.additionalSettings)) {
            xml += "<app:additionalSettings>" + this.additionalSettings + "</app:additionalSettings>";
        }
        if (util.isValidVariableOrEmpty(this.pinPadTipAdjustment)) {
            xml += "<app:pinPadTipAdjustment>" + this.pinPadTipAdjustment + "</app:pinPadTipAdjustment>"
        }
        if (util.isValidVariableOrEmpty(this.pinPadSignatureAdjustment)) {
            xml += "<app:pinPadSignatureAdjustment>" + this.pinPadSignatureAdjustment + "</app:pinPadSignatureAdjustment>"
        }
        if (util.isValidVariable(this.staffList)) {
            for (var i = 0; i < this.staffList.length; i++) {
                xml += "<app:staffs>" + this.staffList[i].getXML() + "</app:staffs>";
            }
        }
        if (util.isValidVariableOrEmpty(this.terminalId)) {
            xml += "<app:terminalId>" + this.terminalId + "</app:terminalId>"
        }
        if (util.isValidVariableOrEmpty(this.pairingToken)) {
            xml += "<app:pairingToken>" + this.pairingToken + "</app:pairingToken>"
        }
        xml += "</app:device>";
        return xml;
    }
}

function FindDevicesType(id, type) {
    this.id = id;
    this.type = type;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindDevicesType>"
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.type != null && this.type != "" && typeof this.type != "undefined") {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        xml += "</app:FindDevicesType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveDeviceType(id, name, realName, type, manufacturerName, printerId, defaultDeviceId, ipAddr, port, modelName, communicationType, additionalSettings, pinPadTipAdjustment, pinPadSignatureAdjustment, staffList, terminalId, pairingToken) {
    this.device = new DeviceType(id, name, realName, type, manufacturerName, printerId, defaultDeviceId, ipAddr, port, modelName, communicationType, additionalSettings, pinPadTipAdjustment, pinPadSignatureAdjustment, staffList, terminalId, pairingToken);
    this.tag = "<app:SaveDeviceType>";
    this.endTag = "</app:SaveDeviceType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.device.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteDeviceType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteDeviceType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteDeviceType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function PaymentServiceProviderType(id, name, displayName, merchantName, merchantId, merchantKey, merchantUrl, setupPassword, resellerInfor) {
    this.id = id;
    this.name = name;
    this.displayName = displayName;
    this.merchantName = merchantName;
    this.merchantId = merchantId;
    this.merchantKey = merchantKey;
    this.merchantUrl = merchantUrl;
    this.setupPassword = setupPassword;
    this.resellerInfor = resellerInfor;
    this.getXML = function () {
        var xml = "<app:paymentServiceProvider>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name != "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.displayName != null && this.displayName != "" && typeof this.displayName != "undefined") {
            xml += "<app:displayName>" + this.displayName + "</app:displayName>";
        }
        if (this.merchantName != null && this.merchantName != "" && typeof this.merchantName != "undefined") {
            xml += "<app:merchantName>" + this.merchantName + "</app:merchantName>";
        }
        if (this.merchantId != null && this.merchantId != "" && typeof this.merchantId != "undefined") {
            xml += "<app:merchantId>" + this.merchantId + "</app:merchantId>";
        }
        if (this.merchantKey != null && this.merchantKey != "" && typeof this.merchantKey != "undefined") {
            xml += "<app:merchantKey>" + this.merchantKey + "</app:merchantKey>";
        }
        if (this.merchantUrl != null && this.merchantUrl != "" && typeof this.merchantUrl != "undefined") {
            xml += "<app:merchantUrl>" + this.merchantUrl + "</app:merchantUrl>";
        }
        if (util.isValidVariable(this.setupPassword)) {
            xml += "<app:setupPassword>" + this.setupPassword + "</app:setupPassword>";
        }
        if (util.isValidVariable(this.resellerInfor)) {
            xml += "<app:resellerInfor>" + this.resellerInfor + "</app:resellerInfor>";
        }
        xml += "</app:paymentServiceProvider>";
        return xml;
    }
}

function FindPaymentServiceProvidersType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindPaymentServiceProvidersType>"
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindPaymentServiceProvidersType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function SavePaymentServiceProviderType(id, name, displayName, merchantName, merchantId, merchantKey, merchantUrl, setupPassword, resellerInfor, userAuth) {
    this.paymentServiceProvider = new PaymentServiceProviderType(id, name, displayName, merchantName, merchantId, merchantKey, merchantUrl, setupPassword, resellerInfor);
    this.userAuth = userAuth;
    this.tag = "<app:SavePaymentServiceProviderType>";
    this.endTag = "</app:SavePaymentServiceProviderType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        xml += this.paymentServiceProvider.getXML();
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function AppInstanceType(id, printerId, cashDrawerId, paymentTerminalId, callerIdEnabled, weightScaleEnabled, customerDisplayEnabled, customerDisplayModel, deviceManagerPort, displayName, devices, settings, waitStatusEnabled, serveStatusEnabled, modifyWaitEnabled, modifyDoneEnabled, displaysValue, forewarn, areaId, waitlistPrinterId) {
    this.id = id;
    this.displayName = displayName;
    this.printerId = printerId;
    this.cashDrawerId = cashDrawerId;
    this.paymentTerminalId = paymentTerminalId;
    this.callerIdEnabled = callerIdEnabled;
    this.weightScaleEnabled = weightScaleEnabled;
    this.customerDisplayEnabled = customerDisplayEnabled;
    this.customerDisplayModel = customerDisplayModel;
    this.deviceManagerPort = deviceManagerPort;
    this.devices = devices;
    this.settings = settings;
    this.waitStatusEnabled = waitStatusEnabled;
    this.serveStatusEnabled = serveStatusEnabled;
    this.modifyWaitEnabled = modifyWaitEnabled;
    this.modifyDoneEnabled = modifyDoneEnabled;
    this.displaysValue = displaysValue;
    this.forewarn = forewarn;
    this.areaId = areaId;
    this.waitlistPrinterId = waitlistPrinterId;
    this.getXML = function () {
        var xml = "<app:appInstance>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.displayName)) {
            xml += "<app:displayName>" + this.displayName + "</app:displayName>";
        }
        if (util.isValidVariable(this.printerId)) {
            xml += "<app:printerID>" + this.printerId + "</app:printerID>";
        }
        if (util.isValidVariable(this.cashDrawerId)) {
            xml += "<app:cashDrawerID>" + this.cashDrawerId + "</app:cashDrawerID>";
        }
        if (util.isValidVariable(this.paymentTerminalId)) {
            xml += "<app:paymentTerminalID>" + this.paymentTerminalId + "</app:paymentTerminalID>";
        }
        if (util.isValidVariable(this.callerIdEnabled)) {
            xml += "<app:callerIdEnabled>" + this.callerIdEnabled + "</app:callerIdEnabled>";
        }
        if (util.isValidBooleanVariable(this.weightScaleEnabled)) {
            xml += "<app:weightScaleEnabled>" + this.weightScaleEnabled + "</app:weightScaleEnabled>";
        }
        if (util.isValidBooleanVariable(this.customerDisplayEnabled)) {
            xml += "<app:customerDisplayEnabled>" + this.customerDisplayEnabled + "</app:customerDisplayEnabled>";
        }
        if (this.customerDisplayModel != null) {
            xml += "<app:customerDisplayModel>" + this.customerDisplayModel + "</app:customerDisplayModel>";
        }
        if (util.isValidVariable(this.deviceManagerPort)) {
            xml += "<app:deviceManagerPort>" + this.deviceManagerPort + "</app:deviceManagerPort>";
        }
        if (this.devices != null && typeof this.devices != "undefined") {
            for (var i = 0; i < this.devices.length; i++) {
                xml += this.devices[i].getXML();
            }
        }
        if (this.settings != null && typeof this.settings != "undefined") {
            for (var i = 0; i < this.settings.length; i++) {
                xml += this.settings[i].getXML();
            }
        }
        if (util.isValidBooleanVariable(this.waitStatusEnabled)) {
            xml += "<app:enableWait>" + this.waitStatusEnabled + "</app:enableWait>";
        }
        if (util.isValidBooleanVariable(this.serveStatusEnabled)) {
            xml += "<app:enableServe>" + this.serveStatusEnabled + "</app:enableServe>";
        }
        if (util.isValidBooleanVariable(this.modifyWaitEnabled)) {
            xml += "<app:modifyWait>" + this.modifyWaitEnabled + "</app:modifyWait>";
        }
        if (util.isValidBooleanVariable(this.modifyDoneEnabled)) {
            xml += "<app:modifyDone>" + this.modifyDoneEnabled + "</app:modifyDone>";
        }
        if (util.isValidVariable(this.displaysValue)) {
            xml += "<app:displaysName>" + this.displaysValue + "</app:displaysName>";
        }
        if (util.isValidVariable(this.forewarn)) {
            xml += "<app:forewarn>" + this.forewarn + "</app:forewarn>";
        }
        if (util.isValidVariable(this.areaId)) {
            xml += "<app:areaId>" + this.areaId + "</app:areaId>";
        }
        if (util.isValidVariable(this.waitlistPrinterId)) {
            xml += "<app:waitlistPrinterID>" + this.waitlistPrinterId + "</app:waitlistPrinterID>";
        }
        xml += "</app:appInstance>";
        if (typeof this.settings != 'undefined' && this.settings != null) {
            xml += "<app:updateSettings>true</app:updateSettings>";
        }
        return xml;
    }
}

function FindAppInstancesType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindAppInstancesType>"
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindAppInstancesType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveAppInstanceType(id, printerId, cashDrawerId, paymentTerminalId, callerIdEnabled, weightScaleEnabled, customerDisplayEnabled, customerDisplayModel, deviceManagerPort, displayName, devices, settings, waitStatusEnabled, serveStatusEnabled, modifyWaitEnabled, modifyDoneEnabled, displaysValue, forewarn, userAuth, areaId, waitlistPrinterId) {
    this.appInstance = new AppInstanceType(id, printerId, cashDrawerId, paymentTerminalId, callerIdEnabled, weightScaleEnabled, customerDisplayEnabled, customerDisplayModel, deviceManagerPort, displayName, devices, settings, waitStatusEnabled, serveStatusEnabled, modifyWaitEnabled, modifyDoneEnabled, displaysValue, forewarn, areaId, waitlistPrinterId);
    this.userAuth = userAuth;
    this.tag = "<app:SaveAppInstanceType>";
    this.endTag = "</app:SaveAppInstanceType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        xml += this.appInstance.getXML();
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteAppInstanceType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteAppInstanceType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteAppInstanceType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteOrdersType(userAuth, fromDate, toDate) {
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.userAuth = userAuth;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteOrdersType>";
        if (util.isValidVariable(this.fromDate)) {
            xml += "<app:fromDate>" + this.fromDate + "</app:fromDate>";
        }
        if (util.isValidVariable(this.toDate)) {
            xml += "<app:toDate>" + this.toDate + "</app:toDate>";
        }
        if (util.isValidVariable(this.userId)) {
            xml += "<app:userId>" + this.userId + "</app:userId>";
        }
        if (this.userAuth) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:DeleteOrdersType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function RegisterServerInstanceType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:RegisterServerInstanceType>";
        xml += "</app:RegisterServerInstanceType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveGlobalDeviceType(id, receiptPrinterID, packagePrinterID, packagePrinterID2, runnerPrinterID, cashDrawerID, srmID, reportPrinterID, paymentTerminalId, waitlistPrinterId, openFoodPrinterId) {
    this.globalDevice = new GlobalDeviceType(id, receiptPrinterID, packagePrinterID, packagePrinterID2, runnerPrinterID, cashDrawerID, srmID, reportPrinterID, paymentTerminalId, waitlistPrinterId, openFoodPrinterId);
    this.tag = "<app:SaveGlobalDeviceType>";
    this.endTag = "</app:SaveGlobalDeviceType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.globalDevice.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function GlobalDeviceType(id, receiptPrinterID, packagePrinterID, packagePrinterID2, runnerPrinterID, cashDrawerID, srmID, reportPrinterID, paymentTerminalId, waitlistPrinterID, openFoodPrinterId) {
    this.id = id;
    this.receiptPrinterID = receiptPrinterID;
    this.packagePrinterID = packagePrinterID;
    this.packagePrinterID2 = packagePrinterID2;
    this.runnerPrinterID = runnerPrinterID;
    this.reportPrinterID = reportPrinterID;
    this.cashDrawerID = cashDrawerID;
    this.srmID = srmID;
    this.paymentTerminalId = paymentTerminalId;
    this.waitlistPrinterID = waitlistPrinterID;
    this.openFoodPrinterId = openFoodPrinterId;
    this.getXML = function () {
        var xml = "<app:globalDevice>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.receiptPrinterID != null && this.receiptPrinterID != "" && typeof this.receiptPrinterID != "undefined") {
            xml += "<app:receiptPrinterID>" + this.receiptPrinterID + "</app:receiptPrinterID>";
        }
        if (this.packagePrinterID != null && this.packagePrinterID != "" && typeof this.packagePrinterID != "undefined") {
            xml += "<app:packagePrinterID>" + this.packagePrinterID + "</app:packagePrinterID>";
        }
        if (this.packagePrinterID2 != null && this.packagePrinterID2 != "" && typeof this.packagePrinterID2 != "undefined") {
            xml += "<app:packagePrinterID2>" + this.packagePrinterID2 + "</app:packagePrinterID2>";
        }
        if (this.runnerPrinterID != null && this.runnerPrinterID != "" && typeof this.runnerPrinterID != "undefined") {
            xml += "<app:runnerPrinterID>" + this.runnerPrinterID + "</app:runnerPrinterID>";
        }
        if (this.reportPrinterID != null && this.reportPrinterID != "" && typeof this.reportPrinterID != "undefined") {
            xml += "<app:reportPrinterID>" + this.reportPrinterID + "</app:reportPrinterID>";
        }
        if (this.cashDrawerID != null && this.cashDrawerID != "" && typeof this.cashDrawerID != "undefined") {
            xml += "<app:cashDrawerID>" + this.cashDrawerID + "</app:cashDrawerID>";
        }
        if (this.srmID != null && this.srmID != "" && typeof this.srmID != "undefined") {
            xml += "<app:srmID>" + this.srmID + "</app:srmID>";
        }
        if (this.paymentTerminalId != null && this.paymentTerminalId != "" && typeof this.paymentTerminalId != "undefined") {
            xml += "<app:paymentTerminalID>" + this.paymentTerminalId + "</app:paymentTerminalID>";
        }
        if (this.waitlistPrinterID != null && this.waitlistPrinterID != "" && typeof this.waitlistPrinterID != "undefined") {
            xml += "<app:waitlistPrinterID>" + this.waitlistPrinterID + "</app:waitlistPrinterID>";
        }
        if (this.openFoodPrinterId != null && this.openFoodPrinterId != "" && typeof this.openFoodPrinterId != "undefined") {
            xml += "<app:openFoodPrinterID>" + this.openFoodPrinterId + "</app:openFoodPrinterID>";
        }
        xml += "</app:globalDevice>";
        return xml;
    }
}

function FindGlobalDevicesType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindGlobalDevicesType>"
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindGlobalDevicesType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveGiftCardType(id, name, number, value, balance, expireTime, enabled, issuedTo, customerID, syncFromCloud, userAuth) {
    this.giftCard = new GiftCardType(id, name, number, value, balance, expireTime, enabled, issuedTo, customerID, syncFromCloud, userAuth, null, null, null, null);
    this.tag = "<app:SaveGiftCardType>";
    this.endTag = "</app:SaveGiftCardType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.giftCard.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function GiftCardType(id, name, number, value, balance, expireTime, enabled, issuedTo, customerID, syncFromCloud, userAuth, consumptionTimes, rechargeAmount, amountSpent, endingBalance) {
    this.id = id;
    this.name = name;
    this.number = number;
    this.value = value;
    this.balance = balance;
    this.expireTime = expireTime;
    this.enabled = enabled;
    this.customerID = customerID;
    this.issuedTo = issuedTo;
    this.syncFromCloud = syncFromCloud;
    this.userAuth = userAuth;
    this.consumptionTimes = consumptionTimes;
    this.rechargeAmount = rechargeAmount;
    this.amountSpent = amountSpent;
    this.endingBalance = endingBalance;
    this.getXML = function () {
        var xml = "<app:giftCard>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name !== "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.number != null && this.number !== "" && typeof this.number != "undefined") {
            xml += "<app:number>" + this.number + "</app:number>";
        }
        if (this.value != null && this.value !== "" && typeof this.value != "undefined") {
            xml += "<app:value>" + this.value + "</app:value>";
        }
        if (this.balance != null && this.balance !== "" && typeof this.balance != "undefined") {
            xml += "<app:balance>" + this.balance + "</app:balance>";
        }
        if (this.expireTime != null && this.expireTime !== "" && typeof this.expireTime != "undefined") {
            xml += "<app:expireTime>" + this.expireTime + "</app:expireTime>";
        }
        if (this.enabled != null && this.enabled !== "" && typeof this.enabled != "undefined") {
            xml += "<app:enabled>" + this.enabled + "</app:enabled>";
        }
        if (this.customerID != null && this.customerID !== "" && typeof this.customerID != "undefined") {
            xml += "<app:customerID>" + this.customerID + "</app:customerID>";
        }
        if (this.issuedTo != null && this.issuedTo !== "" && typeof this.issuedTo != "undefined") {
            xml += "<app:issuedTo>" + this.issuedTo + "</app:issuedTo>";
        }
        if (util.isValidBooleanVariable(this.syncFromCloud)) {
            xml += "<app:syncFromCloud>" + this.syncFromCloud + "</app:syncFromCloud>";
        }
        if (util.isValidBooleanVariable(this.consumptionTimes)) {
            xml += "<app:consumptionTimes>" + this.consumptionTimes + "</app:consumptionTimes>";
        }
        if (util.isValidBooleanVariable(this.rechargeAmount)) {
            xml += "<app:rechargeAmount>" + this.rechargeAmount + "</app:rechargeAmount>";
        }
        if (util.isValidBooleanVariable(this.amountSpent)) {
            xml += "<app:amountSpent>" + this.amountSpent + "</app:amountSpent>";
        }
        if (util.isValidBooleanVariable(this.endingBalance)) {
            xml += "<app:endingBalance>" + this.endingBalance + "</app:endingBalance>";
        }

        xml += "</app:giftCard>";
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        return xml;
    }
}

function FindCustomerInfoType(id, firstName, lastName, email, phone, birthdayFrom, birthdayTo, query, searchAllFields) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.birthdayFrom = birthdayFrom;
    this.birthdayTo = birthdayTo;
    this.query = query;
    this.searchAllFields = searchAllFields;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindCustomerInfoType>"
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.firstName)) {
            xml += "<app:firstName>" + this.firstName + "</app:firstName>";
        }
        if (util.isValidVariable(this.lastName)) {
            xml += "<app:lastName>" + this.lastName + "</app:lastName>";
        }
        if (util.isValidVariable(this.email)) {
            xml += "<app:email>" + this.email + "</app:email>";
        }
        if (util.isValidVariable(this.phone)) {
            xml += "<app:phone>" + this.phone + "</app:phone>";
        }
        if (util.isValidVariable(this.birthdayFrom)) {
            xml += "<app:birthdayFrom>" + this.birthdayFrom + "</app:birthdayFrom>";
        }
        if (util.isValidVariable(this.birthdayTo)) {
            xml += "<app:birthdayTo>" + this.birthdayTo + "</app:birthdayTo>";
        }
        if (util.isValidVariable(this.searchAllFields)) {
            xml += "<app:searchAllFields>" + this.searchAllFields + "</app:searchAllFields>";
        }
        if (util.isValidVariable(this.query)) {
            xml += "<app:query>" + this.query + "</app:query>";
        }
        xml += "</app:FindCustomerInfoType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindGiftCardsType(id, issuedTo, cardNumber, fromDatePicker, toDatePicker) {
    this.id = id;
    this.issuedTo = issuedTo;
    this.cardNumber = cardNumber;
    this.fromDatePicker = fromDatePicker;
    this.toDatePicker = toDatePicker;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindGiftCardsType>"
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.issuedTo)) {
            xml += "<app:issuedTo>" + this.issuedTo + "</app:issuedTo>";
        }
        if (util.isValidVariable(this.cardNumber)) {
            xml += "<app:cardNumber>" + this.cardNumber + "</app:cardNumber>";
        }
        if (util.isValidVariable(this.fromDatePicker)) {
            xml += "<app:fromDatePicker>" + this.fromDatePicker + "</app:fromDatePicker>";
        }
        if (util.isValidVariable(this.toDatePicker)) {
            xml += "<app:toDatePicker>" + this.toDatePicker + "</app:toDatePicker>";
        }

        xml += "</app:FindGiftCardsType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteGiftCardType(id, cardNumber, userAuth) {
    this.id = id;
    this.cardNumber = cardNumber;
    this.userAuth = userAuth;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteGiftCardType>"
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.cardNumber != null && this.cardNumber !== "" && typeof this.cardNumber != "undefined") {
            xml += "<app:cardNumber>" + this.cardNumber + "</app:cardNumber>";
        }
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:DeleteGiftCardType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveSalesRecordingMachineType(id, name, srmDeviceName, operatingMode, connectionType, host, port, connectedPrinter, counterServiceMode, printClosingReceipt, tpsId, tvqId, enabled) {
    this.salesRecordingMachine = new SalesRecordingMachineType(id, name, srmDeviceName, operatingMode, connectionType, host, port, connectedPrinter, counterServiceMode, printClosingReceipt, tpsId, tvqId, enabled);
    this.tag = "<app:SaveSalesRecordingMachineType>";
    this.endTag = "</app:SaveSalesRecordingMachineType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.salesRecordingMachine.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function SalesRecordingMachineType(id, name, srmDeviceName, operatingMode, connectionType, host, port, connectedPrinter, counterServiceMode, printClosingReceipt, tpsId, tvqId, enabled) {
    this.id = id;
    this.name = name;
    this.srmDeviceName = srmDeviceName;
    this.host = host;
    this.port = port;
    this.operatingMode = operatingMode;
    this.connectionType = connectionType;
    this.connectedPrinter = connectedPrinter;
    this.counterServiceMode = counterServiceMode;
    this.printClosingReceipt = printClosingReceipt;
    this.tpsId = tpsId;
    this.tvqId = tvqId;
    this.enabled = enabled;
    this.getXML = function () {
        var xml = "<app:salesRecordingMachine>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name !== "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.srmDeviceName != null && this.srmDeviceName !== "" && typeof this.srmDeviceName != "undefined") {
            xml += "<app:deviceName>" + this.srmDeviceName + "</app:deviceName>";
        }
        if (this.operatingMode != null && this.operatingMode !== "" && typeof this.operatingMode != "undefined") {
            xml += "<app:operatingMode>" + this.operatingMode + "</app:operatingMode>";
        }
        if (this.connectionType != null && this.connectionType !== "" && typeof this.connectionType != "undefined") {
            xml += "<app:connectionType>" + this.connectionType + "</app:connectionType>";
        }
        if (this.host != null && this.host !== "" && typeof this.host != "undefined") {
            xml += "<app:host>" + this.host + "</app:host>";
        }
        if (this.port != null && this.port !== "" && typeof this.port != "undefined") {
            xml += "<app:port>" + this.port + "</app:port>";
        }
        if (this.counterServiceMode != null && this.counterServiceMode !== "" && typeof this.counterServiceMode != "undefined") {
            xml += "<app:counterService>" + this.counterServiceMode + "</app:counterService>";
        }
        if (this.printClosingReceipt != null && this.printClosingReceipt !== "" && typeof this.printClosingReceipt != "undefined") {
            xml += "<app:printClosingReceipt>" + this.printClosingReceipt + "</app:printClosingReceipt>";
        }
        if (this.connectedPrinter != null && this.connectedPrinter !== "" && typeof this.connectedPrinter != "undefined") {
            xml += "<app:printerId>" + this.connectedPrinter + "</app:printerId>";
        }
        if (this.tpsId != null && this.tpsId !== "" && typeof this.tpsId != "undefined") {
            xml += "<app:tpsId>" + this.tpsId + "</app:tpsId>";
        }
        if (this.tvqId != null && this.tvqId !== "" && typeof this.tvqId != "undefined") {
            xml += "<app:tvqId>" + this.tvqId + "</app:tvqId>";
        }
        if (this.enabled != null && this.enabled !== "" && typeof this.enabled != "undefined") {
            xml += "<app:active>" + this.enabled + "</app:active>";
        }
        xml += "</app:salesRecordingMachine>";
        return xml;
    }
}

function FindSalesRecordingMachinesType(id, showDetails) {
    this.id = id;
    this.showDetails = showDetails;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindSalesRecordingMachinesType>"
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.showDetails != null && this.showDetails !== "" && typeof this.showDetails != "undefined") {
            xml += "<app:fetchDetails>" + this.showDetails + "</app:fetchDetails>";
        }
        xml += "</app:FindSalesRecordingMachinesType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteSalesRecordingMachineType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteSalesRecordingMachineType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteSalesRecordingMachineType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindSystemConfigurationsType(name, fetchDetails) {
    this.name = name;
    this.fetchDetails = fetchDetails;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListSystemConfigurationsType>";
        if (typeof name != 'undefined' && name) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (typeof this.fetchDetails != 'undefined' && this.fetchDetails != null && this.fetchDetails != "") {
            xml += "<app:fetchDetails>" + this.fetchDetails + "</app:fetchDetails>";
        }
        xml += "<app:adminRequest>true</app:adminRequest>";
        xml += "</app:ListSystemConfigurationsType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function UpdateSystemConfigurationsType(configurations, userAuth) {
    this.systemConfigurations = configurations;
    this.userAuth = userAuth;
    this.tag = "<app:UpdateSystemConfigurationType>";
    this.endTag = "</app:UpdateSystemConfigurationType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        for (var i = 0; i < this.systemConfigurations.length; i++) {
            xml += this.systemConfigurations[i].getXML();
        }
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    }
}

function SystemConfigurationType(id, name, value, dataType) {
    this.id = id;
    this.name = name;
    this.value = value;
    this.dataType = dataType;
    this.getXML = function () {
        var xml = "<app:systemConfiguration>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name !== "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.value != null && typeof this.value != "undefined") {
            xml += "<app:value>" + this.value + "</app:value>";
        }
        if (this.dataType != null && this.dataType !== "" && typeof this.dataType != "undefined") {
            xml += "<app:dataType>" + this.dataType + "</app:dataType>";
        }
        xml += "</app:systemConfiguration>";
        return xml;
    }
}

function UserConfigurationType(id, name, value, dataType) {
    this.id = id;
    this.name = name;
    this.value = value;
    this.dataType = dataType;
    this.getXML = function () {
        var xml = "<app:settings>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name !== "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.value != null && typeof this.value != "undefined") {
            xml += "<app:value>" + this.value + "</app:value>";
        }
        if (this.dataType != null && this.dataType !== "" && typeof this.dataType != "undefined") {
            xml += "<app:dataType>" + this.dataType + "</app:dataType>";
        }
        xml += "</app:settings>";
        return xml;
    }
}

function AppConfigurationType(id, name, value, dataType) {
    this.id = id;
    this.name = name;
    this.value = value;
    this.dataType = dataType;
    this.getXML = function () {
        var xml = "<app:settings>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name !== "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.value != null && typeof this.value != "undefined") {
            xml += "<app:value>" + this.value + "</app:value>";
        }
        if (this.dataType != null && this.dataType !== "" && typeof this.dataType != "undefined") {
            xml += "<app:dataType>" + this.dataType + "</app:dataType>";
        }
        xml += "</app:settings>";
        return xml;
    }
}

function ListDiscountsType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListDiscountRatesType></app:ListDiscountRatesType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function FetchPrintingConfigType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchPrintingConfigType></app:FetchPrintingConfigType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function SavePrintingConfigType(printingTemplates, receiptFooterTemplateId, receiptFooterTemplatePart2Id, paymentReceiptFooterTemplateId, waitlistTicketFooterTemplateId) {
    this.printingTemplates = printingTemplates;
    this.receiptFooterTemplateId = receiptFooterTemplateId;
    this.receiptFooterTemplatePart2Id = receiptFooterTemplatePart2Id;
    this.paymentReceiptFooterTemplateId = paymentReceiptFooterTemplateId;
    this.waitlistTicketFooterTemplateId = waitlistTicketFooterTemplateId;
    this.tag = "<app:SavePrintingConfigType>";
    this.endTag = "</app:SavePrintingConfigType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        for (var i = 0; i < this.printingTemplates.length; i++) {
            xml += this.printingTemplates[i].getXML();
        }
        if (util.isValidVariable(this.receiptFooterTemplateId)) {
            xml += "<app:footerTemplateId>" + this.receiptFooterTemplateId + "</app:footerTemplateId>";
        }
        if (util.isValidVariable(this.receiptFooterTemplatePart2Id)) {
            xml += "<app:footerPart2TemplateId>" + this.receiptFooterTemplatePart2Id + "</app:footerPart2TemplateId>";
        }
        if (util.isValidVariable(this.paymentReceiptFooterTemplateId)) {
            xml += "<app:paymentReceiptFooterTemplateId>" + this.paymentReceiptFooterTemplateId + "</app:paymentReceiptFooterTemplateId>";
        }
        if (util.isValidVariable(this.waitlistTicketFooterTemplateId)) {
            xml += "<app:waitlistTicketFooterTemplateId>" + this.waitlistTicketFooterTemplateId + "</app:waitlistTicketFooterTemplateId>";
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    };
}
function PrintingTemplateType(value, reportType, selected) {
    this.value = value;
    this.reportType = reportType;
    this.selected = selected;
    this.getXML = function () {
        var xml = "<app:templates>";
        if (util.isValidVariable(this.value)) {
            xml += "<app:value>" + this.value + "</app:value>";
        }
        if (util.isValidVariable(this.reportType)) {
            xml += "<app:reportType>" + this.reportType + "</app:reportType>";
        }
        if (util.isValidBooleanVariable(this.selected)) {
            xml += "<app:selected>" + this.selected + "</app:selected>";
        }
        xml += "</app:templates>";
        return xml;
    }
}

function FetchReceiptFooterContentType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchReceiptFooterContentType></app:FetchReceiptFooterContentType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function SaveReceiptFooterContentType(receiptContentList) {
    this.receiptContentList = receiptContentList;
    this.tag = "<app:SaveReceiptFooterContentType>";
    this.endTag = "</app:SaveReceiptFooterContentType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        for (var i = 0; i < this.receiptContentList.length; i++) {
            xml += this.receiptContentList[i].getXML();
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    };
}
function DeleteReceiptFooterContentType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteReceiptFooterContentType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteReceiptFooterContentType>"
        xml += soapXMLEnd;
        return xml;
    }
}
function ReceiptFooterContentType(id, displayName, content, qrCodeUrl) {
    this.id = id;
    this.displayName = displayName;
    this.content = content;
    this.qrCodeUrl = qrCodeUrl;
    this.getXML = function () {
        var xml = "<app:footerContent>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.displayName)) {
            xml += "<app:displayName>" + this.displayName + "</app:displayName>";
        }
        if (util.isValidSoapRequestVariable(this.content)) {
            xml += "<app:content>" + this.content + "</app:content>";
        }
        if (util.isValidSoapRequestVariable(this.qrCodeUrl)) {
            xml += "<app:qrCodeUrl>" + this.qrCodeUrl + "</app:qrCodeUrl>";
        }
        xml += "</app:footerContent>";
        return xml;
    }
}

function SaveDiscountType(aId, aRate, aRateType, aName, aDescription) {
    this.id = aId;
    this.rate = aRate;
    this.rateType = aRateType;
    this.name = aName;
    this.description = aDescription;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveDiscountRateType>";
        xml += "<app:rate>" + this.rate + "</app:rate>";
        xml += "<app:rateType>" + this.rateType + "</app:rateType>";
        xml += "<app:name>" + this.name + "</app:name>";
        if (typeof this.description != "undefined" && this.description) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (this.id != null && this.id != "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:SaveDiscountRateType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteDiscountType(aDiscountId) {
    this.id = aDiscountId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteDiscountRateType><app:discountId>" + this.id + "</app:discountId>";
        xml += "</app:DeleteDiscountRateType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function ListChargesType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListChargesType></app:ListChargesType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function SaveChargeType(aId, aRate, aRateType, aName, aDescription, aType, minGuest, minMileage) {
    this.id = aId;
    this.rate = aRate;
    this.rateType = aRateType;
    this.name = aName;
    this.description = aDescription;
    this.type = aType;
    this.minGuest = minGuest;
    this.minMileage = minMileage;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveChargeType><app:charge>";
        xml += "<app:rate>" + this.rate + "</app:rate>";
        xml += "<app:rateType>" + this.rateType + "</app:rateType>";
        xml += "<app:type>" + this.type + "</app:type>";
        xml += "<app:name>" + this.name + "</app:name>";
        if (typeof this.description != "undefined" && this.description) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (this.id != null && this.id != "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (!util.isNullOrEmpty(this.minGuest)) {
            xml += "<app:minGuest>" + this.minGuest + "</app:minGuest>";
        }
        if (!util.isNullOrEmpty(this.minMileage)) {
            xml += "<app:minMileage>" + this.minMileage + "</app:minMileage>";
        }
        xml += "</app:charge></app:SaveChargeType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteChargeType(aChargeId) {
    this.id = aChargeId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteChargeType><app:chargeId>" + this.id + "</app:chargeId>";
        xml += "</app:DeleteChargeType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function CompanyProfileType(aId, aName, aAddress1, aAddress2, aCity, aState, aZipcode, aTelephone1, aTelephone2, aEmail, aWebsite, aFax, reseller, region, merchantGroupId, storeId, aHours, merchantCode) {
    this.id = aId;
    this.name = aName;
    this.address1 = aAddress1;
    this.address2 = aAddress2;
    this.city = aCity;
    this.state = aState;
    this.zipcode = aZipcode;
    this.telephone1 = aTelephone1;
    this.telephone2 = aTelephone2;
    this.fax = aFax;
    this.email = aEmail;
    this.website = aWebsite;
    this.reseller = reseller;
    this.merchantGroupId = merchantGroupId;
    this.storeId = storeId;
    this.merchantCode = merchantCode;
    this.region = region;
    this.hours = aHours;
    this.getXML = function () {
        var xml = "";
        if (this.id != null && this.id != '') {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "<app:name>" + util.getXMLSafeValue(this.name) + "</app:name>";
        if (this.address1 != null && this.address1 != "") {
            xml += "<app:address1>" + util.getXMLSafeValue(this.address1) + "</app:address1>";
        }
        if (this.address2 != null && this.address2 != "") {
            xml += "<app:address2>" + util.getXMLSafeValue(this.address2) + "</app:address2>";
        }
        if (this.city != null && this.city != "") {
            xml += "<app:city>" + util.getXMLSafeValue(this.city) + "</app:city>";
        }
        if (this.state != null && this.state != "") {
            xml += "<app:state>" + util.getXMLSafeValue(this.state) + "</app:state>";
        }
        if (this.zipcode != null && this.zipcode != "") {
            xml += "<app:zipcode>" + this.zipcode + "</app:zipcode>";
        }
        if (this.telephone1 != null && this.telephone1 != "") {
            xml += "<app:telephone1>" + this.telephone1 + "</app:telephone1>";
        }
        if (this.telephone2 != null && this.telephone2 != "") {
            xml += "<app:telephone2>" + this.telephone2 + "</app:telephone2>";
        }
        if (this.email != null && this.email != "") {
            xml += "<app:email>" + util.getXMLSafeValue(this.email) + "</app:email>";
        }
        if (this.website != null && this.website != "") {
            xml += "<app:website>" + util.getXMLSafeValue(this.website) + "</app:website>";
        }
        if (this.fax != null && this.fax != "") {
            xml += "<app:fax>" + this.fax + "</app:fax>";
        }
        if (this.reseller != null && this.reseller != "") {
            xml += "<app:reseller>" + this.reseller + "</app:reseller>";
        }
        if (this.region != null && this.region != "") {
            xml += "<app:region>" + this.region + "</app:region>";
        }
        if (this.merchantGroupId != null && this.merchantGroupId != "") {
            xml += "<app:merchantGroupId>" + this.merchantGroupId + "</app:merchantGroupId>";
        }
        if (this.storeId != null && this.storeId != "") {
            xml += "<app:storeId>" + this.storeId + "</app:storeId>";
        }
        if (this.merchantCode != null && this.merchantCode != "") {
            xml += "<app:merchantCode>" + this.merchantCode + "</app:merchantCode>";
        }
        for (var i = 0; i < this.hours.length; i++) {
            var hoursDetails = this.hours[i];
            xml += hoursDetails.getXML();
        }
        return xml;
    }
}
function FetchCompanyProfileType(fetchLicenseDetails) {
    this.fetchLicenseDetails = fetchLicenseDetails;
    this.getXML = function () {
        var xml = soapXMLBegin + "<app:FetchCompanyProfileType>"
        if (util.isValidBooleanVariable(this.fetchLicenseDetails)) {
            xml += "<app:fetchLicenseDetails>" + this.fetchLicenseDetails + "</app:fetchLicenseDetails>";
        }
        xml += "</app:FetchCompanyProfileType>" + soapXMLEnd;
        return xml;
    }
}
function SaveCompanyProfileType(aId, aName, aAddress1, aAddress2, aCity, aState, aZipcode, aTelephone1, aTelephone2, aEmail, aWebsite, aFax, reseller, region, merchantGroupId, storeId, aHours, merchantCode) {
    this.company = new CompanyProfileType(aId, aName, aAddress1, aAddress2, aCity, aState, aZipcode, aTelephone1, aTelephone2, aEmail, aWebsite, aFax, reseller, region, merchantGroupId, storeId, aHours, merchantCode);
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveCompanyProfileType><app:company>";
        xml += this.company.getXML();
        xml += "</app:company>";
        xml += "<app:updateDetails>" + true + "</app:updateDetails>";
        xml += "</app:SaveCompanyProfileType>" + soapXMLEnd;
        return xml;
    }
}

function StaffAttendanceType(aId, aStaffId, aStartTime, aEndTime, roleId, totalCashTips, notes) {
    this.id = aId;
    this.staffId = aStaffId;
    this.startTime = aStartTime;
    this.endTime = aEndTime;
    this.roleId = roleId;
    this.totalCashTips = totalCashTips;
    this.notes = notes;
    this.getXML = function () {
        var xml = "";
        if (this.id != null && this.id !== '') {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "<app:staffId>" + this.staffId + "</app:staffId>";
        xml += "<app:startTime>" + this.startTime + "</app:startTime>";
        if (this.endTime != null && this.endTime != '') {
            xml += "<app:endTime>" + this.endTime + "</app:endTime>";
        }
        if (this.roleId != null && this.roleId !== '') {
            xml += "<app:roleId>" + this.roleId + "</app:roleId>";
        }
        if (util.isValidVariable(this.totalCashTips)) {
            xml += "<app:totalCashTips>" + this.totalCashTips + "</app:totalCashTips>";
        }
        if (util.isValidVariable(this.notes)) {
            xml += "<app:memo>" + this.notes + "</app:memo>";
        }
        return xml;
    }
}
function StaffBreak(id, startTime, endTime, staffId, attendanceId, adjustmentReason) {
    this.id = id;
    this.startTime = startTime;
    this.endTime = endTime;
    this.staffId = staffId;
    this.attendanceId = attendanceId;
    this.adjustmentReason = adjustmentReason;
    this.getXML = function () {
        var xml = "";
        if (util.isValidVariable(this.id != null)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.startTime)) {
            xml += "<app:startTime>" + this.startTime + "</app:startTime>";
        }
        if (util.isValidVariable(this.endTime)) {
            xml += "<app:endTime>" + this.endTime + "</app:endTime>";
        }
        if (util.isValidVariable(this.staffId)) {
            xml += "<app:staffId>" + this.staffId + "</app:staffId>";
        }
        if (util.isValidVariable(this.attendanceId)) {
            xml += "<app:attendanceId>" + this.attendanceId + "</app:attendanceId>";
        }
        if (util.isValidVariable(this.adjustmentReason)) {
            xml += "<app:adjustmentReason>" + this.adjustmentReason + "</app:adjustmentReason>";
        }
        xml += "";
        return xml;
    }
}
function StaffCardInType(aPasscode) {
    this.passCode = aPasscode;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:StaffCardType>";
        xml += "<app:passcode>" + this.passcode + "</app:passcode>";
        xml += "<app:cardType>IN</app:cardType>";
        xml += "</app:StaffCardType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function StaffCardOutType(aPasscode) {
    this.passCode = aPasscode;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:StaffCardType>";
        xml += "<app:passcode>" + this.passcode + "</app:passcode>";
        xml += "<app:cardType>OUT</app:cardType>";
        xml += "</app:StaffCardType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function FetchAttendanceType(aFromDate, aToDate, aStaffId) {
    this.fromDate = aFromDate;
    this.toDate = aToDate;
    this.staffId = aStaffId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FetchAttendanceType>";
        if (this.fromDate != null && this.fromDate !== "" && typeof this.fromDate != "undefined") {
            xml += "<app:fromDate>" + this.fromDate + "</app:fromDate>";
        }
        if (this.toDate != null && this.toDate !== "" && typeof this.toDate != "undefined") {
            xml += "<app:toDate>" + this.toDate + "</app:toDate>";
        }
        if (this.staffId != null && this.staffId !== "" && typeof this.staffId != "undefined") {
            xml += "<app:staffId>" + this.staffId + "</app:staffId>";
        }
        xml += "</app:FetchAttendanceType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteAttendanceType(aId, userAuth) {
    this.id = aId;
    this.userAuth = userAuth;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteAttendanceType>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:attendanceId>" + this.id + "</app:attendanceId>";
        }
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:DeleteAttendanceType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function UpdateAttendanceType(aAttendanceType, userAuth, adjustmentReason) {
    this.attendanceType = aAttendanceType;
    this.userAuth = userAuth;
    this.adjustmentReason = adjustmentReason;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:UpdateAttendanceType><app:attendance>";
        xml += this.attendanceType.getXML() + "</app:attendance>";
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        if (util.isValidVariable(this.adjustmentReason)) {
            xml += "<app:adjustmentReason>" + this.adjustmentReason + "</app:adjustmentReason>";
        }
        xml += "</app:UpdateAttendanceType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function AddAttendanceType(aAttendanceType, userAuth, adjustmentReason) {
    this.attendanceType = aAttendanceType;
    this.userAuth = userAuth;
    this.adjustmentReason = adjustmentReason;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:AddAttendanceType><app:attendance>";
        xml += this.attendanceType.getXML() + "</app:attendance>";
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        if (util.isValidVariable(this.adjustmentReason)) {
            xml += "<app:adjustmentReason>" + this.adjustmentReason + "</app:adjustmentReason>";
        }
        xml += "</app:AddAttendanceType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function RoleType(aId, aName, aReadOnly) {
    this.id = aId;
    this.name = aName;
    this.readOnly = aReadOnly;
    this.functionIds = new Array();
    this.getXML = function () {
        var xml = "<app:name>" + this.name + "</app:name>";
        if (this.id != null && this.id != "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        for (var i = 0; i < this.functionIds.length; i++) {
            xml += "<app:function><app:id>" + this.functionIds[i] + "</app:id>";
            xml += "<app:name></app:name></app:function>";
        }
        return xml;
    }
}
function RoleDTO(aId, aName, companyId, aReadOnly) {
    this.id = aId;
    this.name = aName;
    this.companyId = companyId;
    this.readOnly = aReadOnly;
    this.permissionDTOList = new Array();
}
function SaveRoleRequestDTO(roleDTO) {
    this.roleDTO = roleDTO;
}
function LocationDTO(aId, aName) {
    this.id = aId;
    this.name = aName;
}
function ListRolesType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListRolesType/>";
        xml += soapXMLEnd;
        return xml;
    }
}
function SaveRoleType(aRoleType) {
    this.roleType = aRoleType;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveRoleType><app:role>";
        xml += this.roleType.getXML();
        xml += "</app:role></app:SaveRoleType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteRoleType(aId) {
    this.id = aId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteRoleType>"
        xml += "<app:roleId>" + this.id + "</app:roleId>";
        xml += "</app:DeleteRoleType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function ListStaffType(fetchSettings, adminMode, showPrevStaff, showPasscode, fetchDetails) {
    this.fetchSettings = fetchSettings;
    this.adminMode = adminMode;
    this.showPrevStaff = showPrevStaff;
    this.showPasscode = showPasscode;
    this.fetchDetails = fetchDetails;
    this.tag = "<app:ListStaffType>";
    this.endTag = "</app:ListStaffType>";
    this.getXML = function () {
        var xml = soapXMLBegin + this.tag;
        if (typeof this.fetchSettings != "undefined" && this.fetchSettings != "" && this.fetchSettings != null) {
            xml += "<app:fetchSettings>" + this.fetchSettings + "</app:fetchSettings>";
        }
        if (typeof this.adminMode != "undefined" && this.adminMode != "" && this.adminMode != null) {
            xml += "<app:adminMode>" + this.adminMode + "</app:adminMode>";
        }
        if (typeof this.showPrevStaff != "undefined" && this.showPrevStaff != "" && this.showPrevStaff != null) {
            xml += "<app:showPrevStaff>" + this.showPrevStaff + "</app:showPrevStaff>";
        }
        if (typeof this.showPasscode != "undefined" && this.showPasscode != "" && this.showPasscode != null) {
            xml += "<app:showPasscode>" + this.showPasscode + "</app:showPasscode>";
        }
        if (typeof this.fetchDetails != "undefined" && this.fetchDetails != "" && this.fetchDetails != null) {
            xml += "<app:fetchDetails>" + this.fetchDetails + "</app:fetchDetails>";
        }
        xml += this.endTag + soapXMLEnd;
        return xml;
    }
}
function DeleteStaffType(aId) {
    this.id = aId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteStaffType><app:staffId>" + this.id + "</app:staffId></app:DeleteStaffType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function SaveStaffType(aStaff, updateSettings) {
    this.staff = aStaff;
    this.updateSettings = updateSettings;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveStaffType><app:staff>" + this.staff.getXML() + "</app:staff>";
        if (typeof this.updateSettings != "undefined" && this.updateSettings != "" && this.updateSettings != null) {
            xml += "<app:updateSettings>" + this.updateSettings + "</app:updateSettings>";
        }
        xml += "</app:SaveStaffType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function SaveUserRequestDTO(aUserDTO) {
    this.userDTO = aUserDTO;
}
function SaveStaffUserConfigType(staffId, userId, configurations, updateSettings, userAuth) {
    this.staffId = staffId;
    this.userId = userId;
    this.configurations = configurations;
    this.updateSettings = updateSettings;
    this.userAuth = userAuth;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveStaffType><app:staff><app:id>" + this.staffId + "</app:id>";
        xml += "<app:user><app:id>" + this.userId + "</app:id>";
        for (var i = 0; i < this.configurations.length; i++) {
            xml += this.configurations[i].getXML();
        }
        xml += "</app:user></app:staff>";
        if (typeof this.updateSettings != "undefined" && this.updateSettings != "" && this.updateSettings != null) {
            xml += "<app:updateSettings>" + this.updateSettings + "</app:updateSettings>";
        }
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:SaveStaffType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function StaffType(aId, aName, lastName, aAge, aWage, aWageType, aRequireClockInOut, aRequireCashInOut, aRequireInputCashTips, aHomePhone, aCellPhone, aStreet, aCity, aState, aZipcode, aNotes, aUser, earliestClockInTime, staffSkillLevel, joinDate, birthday, thirdPartyPunchCode, mappingEmployeeId, maxWeeklyHours, email) {
    this.id = aId;
    this.name = aName;
    this.lastName = lastName;
    this.age = aAge;
    this.wage = aWage;
    this.wageType = aWageType;
    this.requireClockInOut = aRequireClockInOut;
    this.requireCashInOut = aRequireCashInOut;
    this.requireInputCashTips = aRequireInputCashTips;
    this.homePhone = aHomePhone;
    this.cellPhone = aCellPhone;
    this.street = aStreet;
    this.city = aCity;
    this.state = aState;
    this.zipcode = aZipcode;
    this.notes = aNotes;
    this.user = aUser;
    this.earliestClockInTime = earliestClockInTime;
    this.skillLevel = staffSkillLevel;
    this.joinDate = joinDate;
    this.birthday = birthday;
    this.thirdPartyPunchCode = thirdPartyPunchCode;
    this.mappingId = mappingEmployeeId;
    this.maxWeeklyHours = maxWeeklyHours;
    this.email = email;
    this.getXML = function () {
        var xml = "<app:name>" + this.name + "</app:name>";
        if (util.isValidVariable(this.lastName)) {
            xml += "<app:lastName>" + this.lastName + "</app:lastName>";
        }
        if (this.id != null && this.id != "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.age != null && this.age != "")
            xml += "<app:age>" + this.age + "</app:age>";
        if (this.wage != null && this.wage != "")
            xml += "<app:wage>" + this.wage + "</app:wage>";
        if (this.wageType != null && this.wageType != "")
            xml += "<app:wageType>" + this.wageType + "</app:wageType>";
        if (this.homePhone != null && this.homePhone != "")
            xml += "<app:homePhone>" + this.homePhone + "</app:homePhone>";
        if (this.cellPhone != null && this.cellPhone != "")
            xml += "<app:cellPhone>" + this.cellPhone + "</app:cellPhone>";
        if (this.street != null && this.street != "")
            xml += "<app:street>" + this.street + "</app:street>";
        if (this.city != null && this.city != "")
            xml += "<app:city>" + this.city + "</app:city>";
        if (this.state != null && this.state != "")
            xml += "<app:state>" + this.state + "</app:state>";
        if (this.zipcode != null && this.zipcode != "")
            xml += "<app:zipcode>" + this.zipcode + "</app:zipcode>";
        if (this.notes != null && this.notes != "")
            xml += "<app:notes>" + this.notes + "</app:notes>";
        if (this.user != null) {
            xml += "<app:user>" + this.user.getXML() + "</app:user>";
        }
        if (util.isValidBooleanVariable(this.requireClockInOut)) {
            xml += "<app:requireClockInOut>" + this.requireClockInOut + "</app:requireClockInOut>";
        }
        if (util.isValidBooleanVariable(this.requireCashInOut)) {
            xml += "<app:requireCashInOut>" + this.requireCashInOut + "</app:requireCashInOut>";
        }
        if (util.isValidBooleanVariable(this.requireInputCashTips)) {
            xml += "<app:requireInputCashTips>" + this.requireInputCashTips + "</app:requireInputCashTips>";
        }
        if (util.isValidVariable(this.earliestClockInTime)) {
            xml += "<app:earliestClockInTime>" + this.earliestClockInTime + "</app:earliestClockInTime>";
        }
        return xml;
    }
}
function UserDTO(aId, aName, lastName, posPasscode1, posPasscode2, aWage, aWageType, companyId, aRequireClockInOut, aRequireCashInOut, aRequireInputCashTips, aHomePhone, aCellPhone, aStreet, aCity, aState, aZipcode, aNotes, earliestClockInTime, skillLevel, joinDate, birthday, thirdPartyPunchCode, mappingId, maxWeeklyHours, email, permissionDTOList, roleDTOList, locationDTOList) {
    this.id = aId;
    this.name = aName;
    this.lastName = lastName;
    if (posPasscode1 != null && posPasscode1 != "***") { this.posPasscode1 = posPasscode1; }
    if (posPasscode2 != null && posPasscode2 != "********") { this.posPasscode2 = posPasscode2; }
    this.wage = aWage;
    this.wageType = aWageType;
    this.companyId = companyId;
    this.requireClockInOut = aRequireClockInOut;
    this.requireCashInOut = aRequireCashInOut;
    this.requireInputCashTips = aRequireInputCashTips;
    this.homePhone = aHomePhone;
    this.cellPhone = aCellPhone;
    this.street = aStreet;
    this.city = aCity;
    this.state = aState;
    this.zipcode = aZipcode;
    this.notes = aNotes;
    this.earliestClockInTime = earliestClockInTime;
    this.skillLevel = skillLevel;
    this.joinDate = joinDate;
    this.birthday = birthday;
    this.thirdPartyPunchCode = thirdPartyPunchCode;
    this.mappingEmployeeId = mappingId;
    this.maxWeeklyHours = maxWeeklyHours;
    this.email = email;
    this.permissionDTOList = permissionDTOList;
    this.roleDTOList = roleDTOList;
    this.locationDTOList = locationDTOList;
    this.systemUser = 0;
}
function UpdateUserStatusRequestDTO(userId, companyId, active, fromLocationId) {
    this.userId = userId;
    this.companyId = companyId;
    this.active = active;
    this.fromLocationId = fromLocationId;
}
function CheckPrivilegeType(aPasscode, aFunctionId) {
    this.passcode = aPasscode;
    this.functionId = aFunctionId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:CheckPrivilegeType><app:passcode>" + this.passcode + "</app:passcode>";
        xml += "<app:functionId>" + this.functionId + "</app:functionId></app:CheckPrivilegeType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function ListPrivilegesType(roleId) {
    this.roleId = roleId;
    this.getXML = function () {
        var xml = soapXMLBegin + "<app:ListPrivilegesType>";
        if (typeof this.roleId != "undefined" && this.roleId != null && this.roleId != "") {
            xml += "<app:roleId>" + this.roleId + "</app:roleId>";
        }
        xml += "</app:ListPrivilegesType>" + soapXMLEnd;
        return xml;
    }
}

function SaveLoyaltyCardType(id, name, number, points, allTimePoints, balance, expireTime, enabled, issuedTo, membershipLevelId, customer, syncFromCloud, userAuth) {
    this.loyaltyCard = new LoyaltyCardType(id, name, number, points, allTimePoints, balance, expireTime, enabled, issuedTo, membershipLevelId, customer, syncFromCloud, userAuth);
    this.tag = "<app:SaveLoyaltyCardType>";
    this.endTag = "</app:SaveLoyaltyCardType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.loyaltyCard.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function FindLoyaltyCardsType(id, fetchCustomerDetails, fetchTransactions, issuedTo, cardNumber) {
    this.id = id;
    this.fetchCustomerDetails = fetchCustomerDetails;
    this.fetchTransactions = fetchTransactions;
    this.issuedTo = issuedTo;
    this.cardNumber = cardNumber;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindLoyaltyCardsType>"
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.fetchCustomerDetails)) {
            xml += "<app:fetchCustomerDetail>" + this.fetchCustomerDetails + "</app:fetchCustomerDetail>";
        }
        if (util.isValidVariable(this.fetchTransactions)) {
            xml += "<app:fetchTransactionHistory>" + this.fetchTransactions + "</app:fetchTransactionHistory>";
        }
        if (util.isValidVariable(this.issuedTo)) {
            xml += "<app:issuedTo>" + this.issuedTo + "</app:issuedTo>";
        }
        if (util.isValidVariable(this.cardNumber)) {
            xml += "<app:cardNumber>" + this.cardNumber + "</app:cardNumber>";
        }
        xml += "</app:FindLoyaltyCardsType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteLoyaltyCardType(id, cardNumber, userAuth) {
    this.id = id;
    this.cardNumber = cardNumber;
    this.userAuth = userAuth;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteLoyaltyCardType>"
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.cardNumber)) {
            xml += "<app:cardNumber>" + this.cardNumber + "</app:cardNumber>";
        }
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:DeleteLoyaltyCardType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function LoyaltyCardType(id, name, number, points, allTimePoints, balance, expireTime, enabled, issuedTo, membershipLevelId, customer, syncFromCloud, userAuth) {
    this.id = id;
    this.name = name;
    this.number = number;
    this.points = points;
    this.allTimePoints = allTimePoints;
    this.balance = balance;
    this.expireTime = expireTime;
    this.enabled = enabled;
    this.issuedTo = issuedTo;
    this.membershipLevelId = membershipLevelId;
    this.customer = customer;
    this.syncFromCloud = syncFromCloud;
    this.userAuth = userAuth;
    this.getXML = function () {
        var xml = "<app:loyaltyCard>";
        if (this.id != null && this.id !== "" && typeof this.id != "undefined") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.name != null && this.name !== "" && typeof this.name != "undefined") {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (this.number != null && this.number !== "" && typeof this.number != "undefined") {
            xml += "<app:number>" + this.number + "</app:number>";
        }
        if (this.points != null && this.points !== "" && typeof this.points != "undefined") {
            xml += "<app:points>" + this.points + "</app:points>";
        }
        if (this.allTimePoints != null && this.allTimePoints !== "" && typeof this.allTimePoints != "undefined") {
            xml += "<app:allTimePoints>" + this.allTimePoints + "</app:allTimePoints>";
        }
        if (this.balance != null && this.balance !== "" && typeof this.balance != "undefined") {
            xml += "<app:balance>" + this.balance + "</app:balance>";
        }
        if (this.expireTime != null && this.expireTime !== "" && typeof this.expireTime != "undefined") {
            xml += "<app:expireTime>" + this.expireTime + "</app:expireTime>";
        }
        if (this.enabled != null && this.enabled !== "" && typeof this.enabled != "undefined") {
            xml += "<app:enabled>" + this.enabled + "</app:enabled>";
        }
        if (this.issuedTo != null && this.issuedTo !== "" && typeof this.issuedTo != "undefined") {
            xml += "<app:issuedTo>" + this.issuedTo + "</app:issuedTo>";
        }
        if (util.isValidVariable(this.membershipLevelId)) {
            xml += "<app:membershipLevelId>" + this.membershipLevelId + "</app:membershipLevelId>";
        }
        if (util.isValidVariable(this.customer)) {
            xml += this.customer.getXML();
        }
        if (util.isValidBooleanVariable(this.syncFromCloud)) {
            xml += "<app:syncFromCloud>" + this.syncFromCloud + "</app:syncFromCloud>";
        }
        xml += "</app:loyaltyCard>";
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        return xml;
    }
}

function SaveCustomerInfoType(customer) {
    this.customer = customer;
    this.tag = "<app:SaveCustomerInfoType>";
    this.endTag = "</app:SaveCustomerInfoType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.customer.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteCustomerInfoType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteCustomerInfoType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteCustomerInfoType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function CustomerInfoType(id, firstName, lastName, prefix, email, birthday, description, facebook, twitter, wechat, numberOfDineInOrders, numberOfOtherOrders, lastDineInOrderTime, lastOtherOrderTime, addressList, phoneList) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.prefix = prefix;
    this.email = email;
    this.birthday = birthday;
    this.description = description;
    this.facebook = facebook;
    this.twitter = twitter;
    this.wechat = wechat;
    this.numberOfDineInOrders = numberOfDineInOrders;
    this.numberOfOtherOrders = numberOfOtherOrders;
    this.lastDineInOrderTime = lastDineInOrderTime;
    this.lastOtherOrderTime = lastOtherOrderTime;
    this.addressList = addressList;
    this.phoneList = phoneList;
    this.getXML = function () {
        var xml = "<app:customer>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.firstName)) {
            xml += "<app:firstName>" + this.firstName + "</app:firstName>";
        }
        if (util.isValidVariable(this.lastName)) {
            xml += "<app:lastName>" + this.lastName + "</app:lastName>";
        }
        if (util.isValidVariable(this.prefix)) {
            xml += "<app:prefix>" + this.prefix + "</app:prefix>";
        }
        if (util.isValidVariable(this.email)) {
            xml += "<app:email>" + this.email + "</app:email>";
        }
        if (util.isValidVariable(this.birthday)) {
            xml += "<app:birthday>" + this.birthday + "</app:birthday>";
        }
        if (util.isValidVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (util.isValidVariable(this.facebook)) {
            xml += "<app:facebook>" + this.facebook + "</app:facebook>";
        }
        if (util.isValidVariable(this.twitter)) {
            xml += "<app:twitter>" + this.twitter + "</app:twitter>";
        }
        if (util.isValidVariable(this.wechat)) {
            xml += "<app:wechat>" + this.wechat + "</app:wechat>";
        }
        if (util.isValidVariable(this.numberOfDineInOrders)) {
            xml += "<app:numberOfDineInOrders>" + this.numberOfDineInOrders + "</app:numberOfDineInOrders>";
        }
        if (util.isValidVariable(this.numberOfOtherOrders)) {
            xml += "<app:numberOfOtherOrders>" + this.numberOfOtherOrders + "</app:numberOfOtherOrders>";
        }
        if (util.isValidVariable(this.lastDineInOrderTime)) {
            xml += "<app:lastDineInOrderTime>" + this.lastDineInOrderTime + "</app:lastDineInOrderTime>";
        }
        if (util.isValidVariable(this.lastOtherOrderTime)) {
            xml += "<app:lastOtherOrderTime>" + this.lastOtherOrderTime + "</app:lastOtherOrderTime>";
        }
        if (util.isValidVariable(this.addressList)) {
            for (var i = 0; i < this.addressList.length; i++) {
                xml += this.addressList[i].getXML();
            }
        }
        if (util.isValidVariable(this.phoneList)) {
            for (var i = 0; i < this.phoneList.length; i++) {
                xml += this.phoneList[i].getXML();
            }
        }
        xml += "</app:customer>";
        return xml;
    }
}

function AddressInfoType(id, address1, address2, state, city, zipcode, type, description, primaryUse) {
    this.id = id;
    this.address1 = address1;
    this.address2 = address2;
    this.state = state;
    this.city = city;
    this.zipcode = zipcode;
    this.type = type;
    this.description = description;
    this.primaryUse = primaryUse;
    this.getXML = function () {
        var xml = "<app:address>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.address1)) {
            xml += "<app:address1>" + this.address1 + "</app:address1>";
        }
        if (util.isValidVariable(this.address2)) {
            xml += "<app:address2>" + this.address2 + "</app:address2>";
        }
        if (util.isValidVariable(this.state)) {
            xml += "<app:state>" + this.state + "</app:state>";
        }
        if (util.isValidVariable(this.city)) {
            xml += "<app:city>" + this.city + "</app:city>";
        }
        if (util.isValidVariable(this.zipcode)) {
            xml += "<app:zipcode>" + this.zipcode + "</app:zipcode>";
        }
        if (util.isValidVariable(this.type)) {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        if (util.isValidVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (util.isValidBooleanVariable(this.primaryUse)) {
            xml += "<app:primaryUse>" + this.primaryUse + "</app:primaryUse>";
        }
        xml += "</app:address>";
        return xml;
    }
}

function PhoneInfoType(id, number, extension, type, description, primaryUse) {
    this.id = id;
    this.number = number;
    this.extension = extension;
    this.type = type;
    this.description = description;
    this.primaryUse = primaryUse;
    this.getXML = function () {
        var xml = "<app:phone>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.number)) {
            xml += "<app:number>" + this.number + "</app:number>";
        }
        if (util.isValidVariable(this.extension)) {
            xml += "<app:extension>" + this.extension + "</app:extension>";
        }
        if (util.isValidVariable(this.type)) {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        if (util.isValidVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (util.isValidBooleanVariable(this.primaryUse)) {
            xml += "<app:primaryUse>" + this.primaryUse + "</app:primaryUse>";
        }
        xml += "</app:phone>";
        return xml;
    }
}

function SaveMembershipLevelType(id, name, description, discountId, minPointsThreshold) {
    this.membershipLevel = new MembershipLevelType(id, name, description, discountId, minPointsThreshold);
    this.tag = "<app:SaveMembershipLevelType>";
    this.endTag = "</app:SaveMembershipLevelType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.membershipLevel.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function FindMembershipLevelsType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindMembershipLevelsType>"
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindMembershipLevelsType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteMembershipLevelType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteMembershipLevelType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteMembershipLevelType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function MembershipLevelType(id, name, description, discountId, minPointsThreshold) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.discountId = discountId;
    this.minPointsThreshold = minPointsThreshold;
    this.getXML = function () {
        var xml = "<app:membershipLevel>"
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (util.isValidVariable(this.discountId)) {
            xml += "<app:discountId>" + this.discountId + "</app:discountId>";
        }
        if (util.isValidVariable(this.minPointsThreshold)) {
            xml += "<app:minPointsThreshold>" + this.minPointsThreshold + "</app:minPointsThreshold>";
        }
        xml += "</app:membershipLevel>"
        return xml;
    }
}

function SyncCustomerDataType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SyncOnlineOrderCustomerInfoType/>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindPaymentAccountsType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindPaymentAccountsType>"
        if (+util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindPaymentAccountsType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function SavePaymentAccountType(id, name, description, billedToSelf) {
    this.paymentAccount = new PaymentAccountType(id, name, description, billedToSelf);
    this.tag = "<app:SavePaymentAccountType>";
    this.endTag = "</app:SavePaymentAccountType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.paymentAccount.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function PaymentAccountType(id, name, description, billedToSelf) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.billedToSelf = billedToSelf;
    this.getXML = function () {
        var xml = "<app:paymentAccount>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidSoapRequestVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (util.isValidBooleanVariable(this.billedToSelf)) {
            xml += "<app:billedToSelf>" + this.billedToSelf + "</app:billedToSelf>";
        }
        xml += "</app:paymentAccount>";
        return xml;
    }
}

function DeletePaymentAccountType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeletePaymentAccountType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeletePaymentAccountType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindItemSizesType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindItemSizesType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindItemSizesType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveItemSizeType(id, name, shortName) {
    this.itemSize = new ItemSizeType(id, name, shortName);
    this.tag = "<app:SaveItemSizeType>";
    this.endTag = "</app:SaveItemSizeType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.itemSize.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function ItemSizeType(id, name, shortName) {
    this.id = id;
    this.name = name;
    this.shortName = shortName;
    this.getXML = function () {
        var xml = "<app:itemSize>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidSoapRequestVariable(this.shortName)) {
            xml += "<app:shortName>" + this.shortName + "</app:shortName>";
        }
        xml += "</app:itemSize>";
        return xml;
    }
}

function DeleteItemSizeType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteItemSizeType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteItemSizeType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteAppInstanceType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteAppInstanceType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteAppInstanceType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function UpdateSystemStatusType(cloudServiceAction) {
    this.cloudServiceAction = cloudServiceAction;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:UpdateSystemStatusType>";
        if (util.isValidVariable(this.cloudServiceAction)) {
            xml += "<app:cloudServiceAction>" + this.cloudServiceAction + "</app:cloudServiceAction>";
        }
        xml += "</app:UpdateSystemStatusType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FindDeliveryAreasType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindDeliveryAreasType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindDeliveryAreasType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveDeliveryAreaType(id, city, state, zipCode) {
    this.deliveryArea = new DeliveryAreaType(id, city, state, zipCode);
    this.tag = "<app:SaveDeliveryAreaType>";
    this.endTag = "</app:SaveDeliveryAreaType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.deliveryArea.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeliveryAreaType(id, city, state, zipCode) {
    this.id = id;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.getXML = function () {
        var xml = "<app:deliveryArea>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.city)) {
            xml += "<app:city>" + this.city + "</app:city>";
        }
        if (util.isValidVariable(this.state)) {
            xml += "<app:state>" + this.state + "</app:state>";
        }
        if (util.isValidVariable(this.zipCode)) {
            xml += "<app:zipCode>" + this.zipCode + "</app:zipCode>";
        }
        xml += "</app:deliveryArea>";
        return xml;
    }
}

function DeleteDeliveryAreaType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteDeliveryAreaType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteDeliveryAreaType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindCustomTransactionsType(id, fromDate, toDate) {
    this.id = id;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindCustomTransactionsType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.fromDate)) {
            xml += "<app:fromDate>" + this.fromDate + "</app:fromDate>";
        }
        if (util.isValidVariable(this.toDate)) {
            xml += "<app:toDate>" + this.toDate + "</app:toDate>";
        }
        xml += "</app:FindCustomTransactionsType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveCustomTransactionType(id, fromStaffId, fromCashDrawerId, from, toStaffId, toCashDrawerId, to, type, amount, description, voided, authorizedBy, transactionDate) {
    this.customTransaction = new CustomTransactionType(id, fromStaffId, fromCashDrawerId, from, toStaffId, toCashDrawerId, to, type, amount, description, voided, authorizedBy, transactionDate);
    this.tag = "<app:SaveCustomTransactionType>";
    this.endTag = "</app:SaveCustomTransactionType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.customTransaction.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function CustomTransactionType(id, fromStaffId, fromCashDrawerId, from, toStaffId, toCashDrawerId, to, type, amount, description, voided, authorizedBy, transactionDate) {
    this.id = id;
    this.fromStaffId = fromStaffId;
    this.fromCashDrawerId = fromCashDrawerId;
    this.from = from;
    this.toStaffId = toStaffId;
    this.toCashDrawerId = toCashDrawerId;
    this.to = to;
    this.type = type;
    this.amount = amount;
    this.description = description;
    this.voided = voided;
    this.authorizedBy = authorizedBy;
    this.transactionDate = transactionDate;
    this.getXML = function () {
        var xml = "<app:customTransaction>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.fromStaffId)) {
            xml += "<app:fromStaffId>" + this.fromStaffId + "</app:fromStaffId>";
        }
        if (util.isValidVariable(this.fromCashDrawerId)) {
            xml += "<app:fromCashDrawerId>" + this.fromCashDrawerId + "</app:fromCashDrawerId>";
        }
        if (util.isValidVariable(this.from)) {
            xml += "<app:from>" + this.from + "</app:from>";
        }
        if (util.isValidVariable(this.toStaffId)) {
            xml += "<app:toStaffId>" + this.toStaffId + "</app:toStaffId>";
        }
        if (util.isValidVariable(this.toCashDrawerId)) {
            xml += "<app:toCashDrawerId>" + this.toCashDrawerId + "</app:toCashDrawerId>";
        }
        if (util.isValidVariable(this.to)) {
            xml += "<app:to>" + this.to + "</app:to>";
        }
        if (util.isValidVariable(this.type)) {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        if (util.isValidVariable(this.amount)) {
            xml += "<app:amount>" + this.amount + "</app:amount>";
        }
        if (util.isValidVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (util.isValidBooleanVariable(this.voided)) {
            xml += "<app:voided>" + this.voided + "</app:voided>";
        }
        if (util.isValidVariable(this.authorizedBy)) {
            xml += "<app:authorizedBy>" + this.authorizedBy + "</app:authorizedBy>";
        }
        if (util.isValidVariable(this.transactionDate)) {
            xml += "<app:transactionDate>" + this.transactionDate + "</app:transactionDate>";
        }
        xml += "</app:customTransaction>";
        return xml;
    }
}

function DeleteCustomTransactionType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteCustomTransactionType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteCustomTransactionType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindCashRegisterActivitiesType(id, fromDate, toDate) {
    this.id = id;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindCashRegisterActivitiesType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.fromDate)) {
            xml += "<app:fromDate>" + this.fromDate + "</app:fromDate>";
        }
        if (util.isValidVariable(this.toDate)) {
            xml += "<app:toDate>" + this.toDate + "</app:toDate>";
        }
        xml += "</app:FindCashRegisterActivitiesType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveCashRegisterActivityType(id, staffId, cashDrawerId, from, to, inAmount, outAmount, expectedOutAmount, discrepancyReason) {
    this.customTransaction = new CashRegisterActivityType(id, staffId, cashDrawerId, from, to, inAmount, outAmount, expectedOutAmount, discrepancyReason);
    this.tag = "<app:SaveCashRegisterActivityType>";
    this.endTag = "</app:SaveCashRegisterActivityType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.customTransaction.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function CashRegisterActivityType(id, staffId, cashDrawerId, from, to, inAmount, outAmount, expectedOutAmount, discrepancyReason) {
    this.id = id;
    this.staffId = staffId;
    this.cashDrawerId = cashDrawerId;
    this.from = from;
    this.to = to;
    this.inAmount = inAmount;
    this.outAmount = outAmount;
    this.expectedOutAmount = expectedOutAmount;
    this.discrepancyReason = discrepancyReason;
    this.getXML = function () {
        var xml = "<app:cashRegisterActivity>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.staffId)) {
            xml += "<app:staffId>" + this.staffId + "</app:staffId>";
        }
        if (util.isValidVariable(this.cashDrawerId)) {
            xml += "<app:cashDrawerId>" + this.cashDrawerId + "</app:cashDrawerId>";
        }
        if (util.isValidVariable(this.from)) {
            xml += "<app:startTime>" + this.from + "</app:startTime>";
        }
        if (util.isValidVariable(this.to)) {
            xml += "<app:endTime>" + this.to + "</app:endTime>";
        }
        if (util.isValidVariable(this.inAmount)) {
            xml += "<app:inAmount>" + this.inAmount + "</app:inAmount>";
        }
        if (util.isValidVariable(this.outAmount)) {
            xml += "<app:outAmount>" + this.outAmount + "</app:outAmount>";
        }
        if (util.isValidVariable(this.expectedOutAmount)) {
            xml += "<app:expectedOutAmount>" + this.expectedOutAmount + "</app:expectedOutAmount>";
        }
        if (util.isValidVariable(this.discrepancyReason)) {
            xml += "<app:discrepancyReason>" + this.discrepancyReason + "</app:discrepancyReason>";
        }
        xml += "</app:cashRegisterActivity>";
        return xml;
    }
}

function DeleteCashRegisterActivityType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteCashRegisterActivityType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteCashRegisterActivityType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindInventoryVendorsType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindInventoryVendorsType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindInventoryVendorsType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveInventoryVendorType(id, name, phoneNum, description) {
    this.inventoryVendor = new InventoryVendorType(id, name, phoneNum, description);
    this.tag = "<app:SaveInventoryVendorType>";
    this.endTag = "</app:SaveInventoryVendorType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.inventoryVendor.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function InventoryVendorType(id, name, phoneNum, description) {
    this.id = id;
    this.name = name;
    this.phoneNum = phoneNum;
    this.description = description;
    this.getXML = function () {
        var xml = "<app:inventoryVendor>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidVariable(this.phoneNum)) {
            xml += "<app:phoneNum>" + this.phoneNum + "</app:phoneNum>";
        }
        if (util.isValidVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        xml += "</app:inventoryVendor>";
        return xml;
    }
}

function DeleteInventoryVendorType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteInventoryVendorType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteInventoryVendorType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindInventoryLocationsType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindInventoryLocationsType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindInventoryLocationsType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveInventoryLocationType(id, name, contactInfo, address1, address2, city, state, zipCode, phoneNum, description) {
    this.inventoryLocation = new InventoryLocationType(id, name, contactInfo, address1, address2, city, state, zipCode, phoneNum, description);
    this.tag = "<app:SaveInventoryLocationType>";
    this.endTag = "</app:SaveInventoryLocationType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.inventoryLocation.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function InventoryLocationType(id, name, contactInfo, address1, address2, city, state, zipCode, phoneNum, description) {
    this.id = id;
    this.name = name;
    this.contactInfo = contactInfo;
    this.address1 = address1;
    this.address2 = address2;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.phoneNum = phoneNum;
    this.description = description;
    this.getXML = function () {
        var xml = "<app:inventoryLocation>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidVariable(this.contactInfo)) {
            xml += "<app:contactInfo>" + this.contactInfo + "</app:contactInfo>";
        }
        if (util.isValidVariable(this.address1)) {
            xml += "<app:address1>" + this.address1 + "</app:address1>";
        }
        if (util.isValidVariable(this.address2)) {
            xml += "<app:address2>" + this.address2 + "</app:address2>";
        }
        if (util.isValidVariable(this.city)) {
            xml += "<app:city>" + this.city + "</app:city>";
        }
        if (util.isValidVariable(this.state)) {
            xml += "<app:state>" + this.state + "</app:state>";
        }
        if (util.isValidVariable(this.zipCode)) {
            xml += "<app:zipCode>" + this.zipCode + "</app:zipCode>";
        }
        if (util.isValidVariable(this.phoneNum)) {
            xml += "<app:phoneNum>" + this.phoneNum + "</app:phoneNum>";
        }
        if (util.isValidVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        xml += "</app:inventoryLocation>";
        return xml;
    }
}

function DeleteInventoryLocationType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteInventoryLocationType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteInventoryLocationType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindItemUnitsType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindItemUnitsType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindItemUnitsType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveItemUnitType(id, name) {
    this.itemUnit = new ItemUnitType(id, name);
    this.tag = "<app:SaveItemUnitType>";
    this.endTag = "</app:SaveItemUnitType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.itemUnit.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function ItemUnitType(id, name) {
    this.id = id;
    this.name = name;
    this.getXML = function () {
        var xml = "<app:itemUnit>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        xml += "</app:itemUnit>";
        return xml;
    }
}

function DeleteItemUnitType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteItemUnitType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteItemUnitType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindInventoryItemGroupsType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindInventoryItemGroupsType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindInventoryItemGroupsType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveInventoryItemGroupType(id, name, displayPriority) {
    this.inventoryItemGroup = new InventoryItemGroupType(id, name, displayPriority);
    this.tag = "<app:SaveInventoryItemGroupType>";
    this.endTag = "</app:SaveInventoryItemGroupType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.inventoryItemGroup.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function InventoryItemGroupType(id, name, displayPriority) {
    this.id = id;
    this.name = name;
    this.displayPriority = displayPriority;
    this.getXML = function () {
        var xml = "<app:inventoryItemGroup>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidVariable(this.displayPriority)) {
            xml += "<app:displayPriority>" + this.displayPriority + "</app:displayPriority>";
        }
        xml += "</app:inventoryItemGroup>";
        return xml;
    }
}

function DeleteInventoryItemGroupType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteInventoryItemGroupType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteInventoryItemGroupType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function FindInventoryItemsType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindInventoryItemsType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindInventoryItemsType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveInventoryItemType(id, name, sku, defaultPurchasePrice, baseUnit, purchaseUnit, purchaseUnitToBaseUnitRatio, productionUnit, baseUnitToProductionUnitRatio,
    lowStockAlertThreshold, targetStockQty, defaultPurchaseQty, displayPriority, groupId, defaultShippingAddressId, defaultVendorId, baseItemId,
    inventoryCountUnit, replenishType, targetStockQTYCalculation) {
    this.inventoryItem = new InventoryItemType(id, name, sku, defaultPurchasePrice, baseUnit, purchaseUnit, purchaseUnitToBaseUnitRatio,
        productionUnit, baseUnitToProductionUnitRatio, lowStockAlertThreshold, targetStockQty, defaultPurchaseQty, displayPriority,
        groupId, defaultShippingAddressId, defaultVendorId, baseItemId, inventoryCountUnit, replenishType, targetStockQTYCalculation);
    this.tag = "<app:SaveInventoryItemType>";
    this.endTag = "</app:SaveInventoryItemType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.inventoryItem.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function InventoryItemType(id, name, sku, defaultPurchasePrice, baseUnit, purchaseUnit, purchaseUnitToBaseUnitRatio, productionUnit, baseUnitToProductionUnitRatio,
    lowStockAlertThreshold, targetStockQty, defaultPurchaseQty, displayPriority, groupId, defaultShippingAddressId, defaultVendorId, baseItemId,
    inventoryCountUnit, replenishType, targetStockQTYCalculation) {
    this.id = id;
    this.name = name;
    this.sku = sku;
    this.defaultPurchasePrice = defaultPurchasePrice;
    this.baseUnit = baseUnit;
    this.purchaseUnit = purchaseUnit;
    this.purchaseUnitToBaseUnitRatio = purchaseUnitToBaseUnitRatio;
    this.productionUnit = productionUnit;
    this.baseUnitToProductionUnitRatio = baseUnitToProductionUnitRatio;
    this.lowStockAlertThreshold = lowStockAlertThreshold;
    this.targetStockQty = targetStockQty;
    this.defaultPurchaseQty = defaultPurchaseQty;
    this.displayPriority = displayPriority;
    this.groupId = groupId;
    this.defaultShippingAddressId = defaultShippingAddressId;
    this.defaultVendorId = defaultVendorId;
    this.baseItemId = baseItemId;
    this.inventoryCountUnit = inventoryCountUnit;
    this.replenishType = replenishType;
    this.targetStockQTYCalculation = targetStockQTYCalculation;
    this.getXML = function () {
        var xml = "<app:inventoryItem>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidVariable(this.sku)) {
            xml += "<app:sku>" + this.sku + "</app:sku>";
        }
        if (util.isValidVariable(this.defaultPurchasePrice)) {
            xml += "<app:defaultPurchasePrice>" + this.defaultPurchasePrice + "</app:defaultPurchasePrice>";
        }
        if (util.isValidVariable(this.baseUnit)) {
            xml += "<app:baseUnit>" + this.baseUnit + "</app:baseUnit>";
        }
        if (util.isValidVariable(this.purchaseUnit)) {
            xml += "<app:purchaseUnit>" + this.purchaseUnit + "</app:purchaseUnit>";
        }
        if (util.isValidVariable(this.purchaseUnitToBaseUnitRatio)) {
            xml += "<app:purchaseUnitToBaseUnitRatio>" + this.purchaseUnitToBaseUnitRatio + "</app:purchaseUnitToBaseUnitRatio>";
        }
        if (util.isValidVariable(this.productionUnit)) {
            xml += "<app:productionUnit>" + this.productionUnit + "</app:productionUnit>";
        }
        if (util.isValidVariable(this.baseUnitToProductionUnitRatio)) {
            xml += "<app:baseUnitToProductionUnitRatio>" + this.baseUnitToProductionUnitRatio + "</app:baseUnitToProductionUnitRatio>";
        }
        if (util.isValidVariable(this.lowStockAlertThreshold)) {
            xml += "<app:lowStockAlertThreshold>" + this.lowStockAlertThreshold + "</app:lowStockAlertThreshold>";
        }
        if (util.isValidVariable(this.targetStockQty)) {
            xml += "<app:targetStockQty>" + this.targetStockQty + "</app:targetStockQty>";
        }
        if (util.isValidVariable(this.defaultPurchaseQty)) {
            xml += "<app:defaultPurchaseQty>" + this.defaultPurchaseQty + "</app:defaultPurchaseQty>";
        }
        if (util.isValidVariable(this.displayPriority)) {
            xml += "<app:displayPriority>" + this.displayPriority + "</app:displayPriority>";
        }
        if (util.isValidVariable(this.groupId)) {
            xml += "<app:groupId>" + this.groupId + "</app:groupId>";
        }
        if (util.isValidVariable(this.defaultShippingAddressId)) {
            xml += "<app:defaultShippingAddressId>" + this.defaultShippingAddressId + "</app:defaultShippingAddressId>";
        }
        if (util.isValidVariable(this.defaultVendorId)) {
            xml += "<app:defaultVendorId>" + this.defaultVendorId + "</app:defaultVendorId>";
        }
        if (util.isValidVariable(this.baseItemId)) {
            xml += "<app:baseItemId>" + this.baseItemId + "</app:baseItemId>";
        }
        if (util.isValidVariable(this.inventoryCountUnit)) {
            xml += "<app:inventoryCountUnit>" + this.inventoryCountUnit + "</app:inventoryCountUnit>";
        }
        if (util.isValidVariable(this.replenishType)) {
            xml += "<app:replenishType>" + this.replenishType + "</app:replenishType>";
        }
        if (util.isValidVariable(this.targetStockQTYCalculation)) {
            xml += "<app:targetStockQTYCalculation>" + this.targetStockQTYCalculation + "</app:targetStockQTYCalculation>";
        }
        xml += "</app:inventoryItem>";
        return xml;
    }
}

function DeleteInventoryItemType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteInventoryItemType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteInventoryItemType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveInventoryCountRecordType(id, startingStockValue, endingStockValue, stockValueUsed, itemChangeRecords, userAuth) {
    this.inventoryCountRecord = new InventoryCountRecordType(id, startingStockValue, endingStockValue, stockValueUsed, itemChangeRecords);
    this.userAuth = userAuth;
    this.tag = "<app:SaveInventoryCountRecordType>";
    this.endTag = "</app:SaveInventoryCountRecordType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        xml += this.inventoryCountRecord.getXML();
        if (this.userAuth) {
            xml += this.userAuth.getXML();
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function InventoryCountRecordType(id, startingStockValue, endingStockValue, stockValueUsed, itemChangeRecords) {
    this.id = id;
    this.startingStockValue = startingStockValue;
    this.endingStockValue = endingStockValue;
    this.stockValueUsed = stockValueUsed;
    this.itemChangeRecords = itemChangeRecords;
    this.getXML = function () {
        var xml = "<app:inventoryCountRecord>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidNumber(this.startingStockValue)) {
            xml += "<app:startingStockValue>" + this.startingStockValue + "</app:startingStockValue>";
        }
        if (util.isValidNumber(this.endingStockValue)) {
            xml += "<app:endingStockValue>" + this.endingStockValue + "</app:endingStockValue>";
        }
        if (util.isValidNumber(this.stockValueUsed)) {
            xml += "<app:stockValueUsed>" + this.stockValueUsed + "</app:stockValueUsed>";
        }
        for (var i = 0; i < this.itemChangeRecords.length; i++) {
            xml += this.itemChangeRecords[i].getXML();
        }
        xml += "</app:inventoryCountRecord>";
        return xml;
    }
}

function ItemChangeRecordType(id, originalStockQty, changedStockQty, originalEstimatedUsedQty, changedEstimatedUsedQty, type, adjustmentReason, itemId, lowStockAlertThreshold) {
    this.id = id;
    this.originalStockQty = originalStockQty;
    this.changedStockQty = changedStockQty;
    this.originalEstimatedUsedQty = originalEstimatedUsedQty;
    this.changedEstimatedUsedQty = changedEstimatedUsedQty;
    this.type = type;
    this.adjustmentReason = adjustmentReason;
    this.itemId = itemId;
    this.lowStockAlertThreshold = lowStockAlertThreshold;
    this.getXML = function () {
        var xml = "<app:itemChangeRecords>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidNumber(this.originalStockQty)) {
            xml += "<app:originalStockQty>" + this.originalStockQty + "</app:originalStockQty>";
        }
        if (util.isValidNumber(this.changedStockQty)) {
            xml += "<app:changedStockQty>" + this.changedStockQty + "</app:changedStockQty>";
        }
        if (util.isValidNumber(this.originalEstimatedUsedQty)) {
            xml += "<app:originalEstimatedUsedQty>" + this.originalEstimatedUsedQty + "</app:originalEstimatedUsedQty>";
        }
        if (util.isValidNumber(this.changedEstimatedUsedQty)) {
            xml += "<app:changedEstimatedUsedQty>" + this.changedEstimatedUsedQty + "</app:changedEstimatedUsedQty>";
        }
        if (util.isValidVariable(this.type)) {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        if (util.isValidVariable(this.adjustmentReason)) {
            xml += "<app:adjustmentReason>" + this.adjustmentReason + "</app:adjustmentReason>";
        }
        if (util.isValidVariable(this.itemId)) {
            xml += "<app:itemId>" + this.itemId + "</app:itemId>";
        }
        if (util.isValidNumber(this.lowStockAlertThreshold)) {
            xml += "<app:lowStockAlertThreshold>" + this.lowStockAlertThreshold + "</app:lowStockAlertThreshold>";
        }
        xml += "</app:itemChangeRecords>";
        return xml;
    }
}

function FindPurchaseOrdersType(id, from, to, status, vendorId, shippingAddressId) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.status = status;
    this.vendorId = vendorId;
    this.shippingAddressId = shippingAddressId;
    this.tag = "<app:FindPurchaseOrdersType>";
    this.endTag = "</app:FindPurchaseOrdersType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.from)) {
            xml += "<app:from>" + this.from + "</app:from>";
        }
        if (util.isValidVariable(this.to)) {
            xml += "<app:to>" + this.to + "</app:to>";
        }
        if (util.isValidVariable(this.status)) {
            xml += "<app:status>" + this.status + "</app:status>";
        }
        if (util.isValidVariable(this.vendorId)) {
            xml += "<app:vendorId>" + this.vendorId + "</app:vendorId>";
        }
        if (util.isValidVariable(this.shippingAddressId)) {
            xml += "<app:shippingAddressId>" + this.shippingAddressId + "</app:shippingAddressId>";
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function SavePurchaseOrderType(id, subtotal, tax, paidAmount, notes, type, status, vendorOrderId, shippingAddressId, vendorId, orderItems, userAuth, isSendEmail) {
    this.purchaseOrder = new PurchaseOrderType(id, subtotal, tax, paidAmount, notes, type, status, vendorOrderId, shippingAddressId, vendorId, orderItems);
    this.userAuth = userAuth;
    this.isSendEmail = isSendEmail;
    this.tag = "<app:SavePurchaseOrderType>";
    this.endTag = "</app:SavePurchaseOrderType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        xml += this.purchaseOrder.getXML();
        if (this.userAuth) {
            xml += this.userAuth.getXML();
        }
        if (this.isSendEmail) {
            xml += "<app:sendEmail>" + this.isSendEmail + "</app:sendEmail>";
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function PurchaseOrderType(id, subtotal, tax, paidAmount, notes, type, status, vendorOrderId, shippingAddressId, vendorId, orderItems) {
    this.id = id;
    this.subtotal = subtotal;
    this.tax = tax;
    this.paidAmount = paidAmount;
    this.notes = notes;
    this.type = type;
    this.status = status;
    this.vendorOrderId = vendorOrderId;
    this.shippingAddressId = shippingAddressId;
    this.vendorId = vendorId;
    this.orderItems = orderItems;
    this.getXML = function () {
        var xml = "<app:purchaseOrder>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidNumber(this.subtotal)) {
            xml += "<app:subtotal>" + this.subtotal + "</app:subtotal>";
        }
        if (util.isValidNumber(this.tax)) {
            xml += "<app:tax>" + this.tax + "</app:tax>";
        }
        if (util.isValidNumber(this.paidAmount)) {
            xml += "<app:paidAmount>" + this.paidAmount + "</app:paidAmount>";
        }
        if (util.isValidVariable(this.notes)) {
            xml += "<app:notes>" + this.notes + "</app:notes>";
        }
        if (util.isValidVariable(this.type)) {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        if (util.isValidVariable(this.status)) {
            xml += "<app:status>" + this.status + "</app:status>";
        }
        if (util.isValidVariable(this.vendorOrderId)) {
            xml += "<app:vendorOrderId>" + this.vendorOrderId + "</app:vendorOrderId>";
        }
        if (util.isValidVariable(this.shippingAddressId)) {
            xml += "<app:shippingAddressId>" + this.shippingAddressId + "</app:shippingAddressId>";
        }
        if (util.isValidVariable(this.vendorId)) {
            xml += "<app:vendorId>" + this.vendorId + "</app:vendorId>";
        }
        for (var i = 0; i < this.orderItems.length; i++) {
            xml += this.orderItems[i].getXML();
        }
        xml += "</app:purchaseOrder>";
        return xml;
    }
}

function PurchaseOrderItemType(id, name, sku, qty, purchaseUnitType, inStockUnitType, inStockToPurchaseQtyRatio, pricePerUnit, itemId) {
    this.id = id;
    this.name = name;
    this.sku = sku;
    this.qty = qty;
    this.purchaseUnitType = purchaseUnitType;
    this.inStockUnitType = inStockUnitType;
    this.inStockToPurchaseQtyRatio = inStockToPurchaseQtyRatio;
    this.pricePerUnit = pricePerUnit;
    this.itemId = itemId;
    this.getXML = function () {
        var xml = "<app:orderItems>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidVariable(this.sku)) {
            xml += "<app:sku>" + this.sku + "</app:sku>";
        }
        if (util.isValidNumber(this.qty)) {
            xml += "<app:qty>" + this.qty + "</app:qty>";
        }
        if (util.isValidVariable(this.purchaseUnitType)) {
            xml += "<app:purchaseUnitType>" + this.purchaseUnitType + "</app:purchaseUnitType>";
        }
        if (util.isValidVariable(this.inStockUnitType)) {
            xml += "<app:inStockUnitType>" + this.inStockUnitType + "</app:inStockUnitType>";
        }
        if (util.isValidNumber(this.inStockToPurchaseQtyRatio)) {
            xml += "<app:inStockToPurchaseQtyRatio>" + this.inStockToPurchaseQtyRatio + "</app:inStockToPurchaseQtyRatio>";
        }
        if (util.isValidNumber(this.pricePerUnit)) {
            xml += "<app:pricePerUnit>" + this.pricePerUnit + "</app:pricePerUnit>";
        }
        if (util.isValidVariable(this.itemId)) {
            xml += "<app:itemId>" + this.itemId + "</app:itemId>";
        }
        xml += "</app:orderItems>";
        return xml;
    }
}

function FindMenuRecipeType(itemId) {
    this.itemId = itemId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindMenuRecipesType>";
        if (util.isValidVariable(this.itemId)) {
            xml += "<app:itemId>" + this.itemId + "</app:itemId>";
        }
        xml += "</app:FindMenuRecipesType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveMenuRecipeType(itemId, itemName, itemSizeId, itemSizeName, inventoryItems, userAuth, itemCost) {
    this.menuRecipe = new MenuRecipeType(itemId, itemName, itemSizeId, itemSizeName, inventoryItems);
    this.userAuth = userAuth;
    this.itemCost = itemCost;
    this.tag = "<app:SaveMenuRecipeType>";
    this.endTag = "</app:SaveMenuRecipeType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        xml += this.menuRecipe.getXML();
        if (util.isValidNumber(this.itemCost)) {
            xml += "<app:saleItemCost>" + this.itemCost + "</app:saleItemCost>";
        }
        if (this.userAuth) {
            xml += this.userAuth.getXML();
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function MenuRecipeType(itemId, itemName, itemSizeId, itemSizeName, inventoryItems) {
    this.itemId = itemId;
    this.itemName = itemName;
    this.itemSizeId = itemSizeId;
    this.itemSizeName = itemSizeName;
    this.inventoryItems = inventoryItems;
    this.getXML = function () {
        var xml = "<app:menuRecipe>";
        if (util.isValidVariable(this.itemId)) {
            xml += "<app:itemId>" + this.itemId + "</app:itemId>";
        }
        if (util.isValidVariable(this.itemName)) {
            xml += "<app:itemName>" + this.itemName + "</app:itemName>";
        }
        if (util.isValidVariable(this.itemSizeId)) {
            xml += "<app:itemSizeId>" + this.itemSizeId + "</app:itemSizeId>";
        }
        if (util.isValidVariable(this.itemSizeName)) {
            xml += "<app:itemSizeName>" + this.itemSizeName + "</app:itemSizeName>";
        }
        for (var i = 0; i < this.inventoryItems.length; i++) {
            xml += this.inventoryItems[i].getXML();
        }
        xml += "</app:menuRecipe>";
        return xml;
    }
}

function MenuRecipeInventoryItemType(id, units) {
    this.id = id;
    this.units = units;
    this.getXML = function () {
        var xml = "<app:inventoryItems>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.units)) {
            xml += "<app:units>" + this.units + "</app:units>";
        }
        xml += "</app:inventoryItems>";
        return xml;
    }
}

function FindInventoryItemChangeRecordsType(id, from, to, itemId, itemGroupId, type, groupBy) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.itemId = itemId;
    this.itemGroupId = itemGroupId;
    this.type = type;
    this.groupBy = groupBy;
    this.tag = "<app:FindInventoryItemChangeRecordsType>";
    this.endTag = "</app:FindInventoryItemChangeRecordsType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.from)) {
            xml += "<app:from>" + this.from + "</app:from>";
        }
        if (util.isValidVariable(this.to)) {
            xml += "<app:to>" + this.to + "</app:to>";
        }
        if (util.isValidVariable(this.itemId)) {
            xml += "<app:itemId>" + this.itemId + "</app:itemId>";
        }
        if (util.isValidVariable(this.itemGroupId)) {
            xml += "<app:itemGroupId>" + this.itemGroupId + "</app:itemGroupId>";
        }
        if (util.isValidVariable(this.type)) {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        if (util.isValidVariable(this.groupBy)) {
            xml += "<app:groupBy>" + this.groupBy + "</app:groupBy>";
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function UserAuthenticationType(userId, sessionKey) {
    this.userId = userId;
    this.sessionKey = sessionKey;
    this.getXML = function () {
        var xml = "<app:userAuth>";
        if (util.isValidVariable(this.userId)) {
            xml += "<app:userId>" + this.userId + "</app:userId>";
        }
        if (util.isValidVariable(this.sessionKey)) {
            xml += "<app:sessionKey>" + this.sessionKey + "</app:sessionKey>";
        }
        xml += "</app:userAuth>";
        return xml;
    }
}

function FindGalleryType(id, prepareFor) {
    this.id = id;
    this.prepareFor = prepareFor;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindGalleryType>";
        if (this.id != null && this.id !== "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.prepareFor != null && this.prepareFor !== "") {
            xml += "<app:prepareFor>" + this.prepareFor + "</app:prepareFor>";
        }
        xml += "</app:FindGalleryType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveGalleryImage(thumb, galleryList, displayOrder, displayTime, id, transitionEffect, prepareFor) {
    this.thumb = thumb;
    this.displayTime = displayTime;
    this.image = new GalleryImage(id, thumb, displayOrder, displayTime, transitionEffect, prepareFor);
    this.galleryList = galleryList;
    this.tag = "<app:SaveGalleryType>";
    this.endTag = "</app:SaveGalleryType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag
        if (this.thumb != null && this.thumb !== "" || this.displayTime != null && this.displayTime !== "") {
            xml += this.image.getXML();
        }
        if (this.galleryList != null) {
            for (var i = 0; i < this.galleryList.length; i++) {
                xml += this.galleryList[i].getXML();
            }
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function GalleryImage(id, thumb, displayOrder, displayTime, transitionEffect, prepareFor) {
    this.id = id;
    this.thumb = thumb;
    this.displayOrder = displayOrder;
    this.displayTime = displayTime;
    this.transitionEffect = transitionEffect;
    this.prepareFor = prepareFor;
    if (this.thumb != null || this.displayTime != null) {
        this.tag = "<app:gallery>";
        this.endTag = "</app:gallery>";
    } else {
        this.tag = "<app:galleryList>";
        this.endTag = "</app:galleryList>";
    }
    this.getXML = function () {
        var xml = this.tag;
        if (this.id != null && this.id !== "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (this.thumb != null && this.thumb !== "") {
            xml += "<app:thumbPath>" + this.thumb + "</app:thumbPath>";
        }
        if (this.displayOrder != null && this.displayOrder !== "") {
            xml += "<app:displayOrder>" + this.displayOrder + "</app:displayOrder>";
        }
        if (this.displayTime != null && this.displayTime !== "") {
            xml += "<app:displayTime>" + this.displayTime + "</app:displayTime>";
        }
        if (this.transitionEffect != null && this.transitionEffect !== "") {
            xml += "<app:transitionEffect>" + this.transitionEffect + "</app:transitionEffect>"
        }
        if (this.prepareFor != null && this.prepareFor !== "") {
            xml += "<app:prepareFor>" + this.prepareFor + "</app:prepareFor>"
        }
        xml += this.endTag;
        return xml;
    };
}

function DeleteGalleryImage(id) {
    this.id = id;
    this.tag = "<app:DeleteGalleryType>";
    this.endTag = "</app:DeleteGalleryType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        if (this.id != null && this.id !== "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    }
}

function FindAuditLogType(id, from, to, displayName, user) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.displayName = displayName;
    this.user = user;
    this.tag = "<app:FindAuditLogType>";
    this.endTag = "</app:FindAuditLogType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag;
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.from)) {
            xml += "<app:from>" + this.from + "</app:from>";
        }
        if (util.isValidVariable(this.to)) {
            xml += "<app:to>" + this.to + "</app:to>";
        }
        if (util.isValidVariable(this.displayName)) {
            xml += "<app:displayName>" + this.displayName + "</app:displayName>";
        }
        if (util.isValidVariable(this.user)) {
            xml += "<app:user>" + this.user + "</app:user>";
        }
        xml += this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteSaleItemReviewsType(fromDate, toDate) {
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteSaleItemReviewType>";
        if (util.isValidVariable(this.fromDate)) {
            xml += "<app:from>" + this.fromDate + "</app:from>";
        }
        if (util.isValidVariable(this.toDate)) {
            xml += "<app:to>" + this.toDate + "</app:to>";
        }
        xml += "</app:DeleteSaleItemReviewType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FindCoursesType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindCoursesType>";
        if (typeof this.id != 'undefined' && this.id) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindCoursesType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveCourseType(id, number, name) {
    this.course = new CourseType(id, number, name);
    this.tag = "<app:SaveCourseType>";
    this.endTag = "</app:SaveCourseType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.course.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function CourseType(id, number, name) {
    this.id = id;
    this.number = number;
    this.name = name;
    this.getXML = function () {
        var xml = "<app:course>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.number)) {
            xml += "<app:number>" + this.number + "</app:number>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        xml += "</app:course>";
        return xml;
    }
}

function DeleteCourseType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteCourseType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteCourseType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function ListComboSaleItemType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListComboSaleItemType>"
        xml += "<app:fetchOptions>" + false + "</app:fetchOptions>";
        xml += "<app:fetchItemAttributes>" + false + "</app:fetchItemAttributes>";
        xml += "<app:nameIdOnly>" + false + "</app:nameIdOnly>";
        xml += "<app:fetchSummaryOnly>" + false + "</app:fetchSummaryOnly>";
        xml += "<app:groupFieldDisplayNameByLanguage>" + false + "</app:groupFieldDisplayNameByLanguage>";
        xml += "<app:fetchReviewRating>" + false + "</app:fetchReviewRating>";
        xml += "<app:showOnlineOrderItems>" + false + "</app:showOnlineOrderItems>";
        xml += "<app:combineNumberAndName>" + false + "</app:combineNumberAndName>";
        xml += "</app:ListComboSaleItemType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function SendCommandToDevice(deviceId, deviceName, deviceType, command) {
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.deviceType = deviceType;
    this.command = command;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SendCommandToDeviceType>"
        if (util.isValidVariable(this.deviceId)) {
            xml += "<app:deviceId>" + this.deviceId + "</app:deviceId>";
        }
        if (util.isValidVariable(this.deviceName)) {
            xml += "<app:deviceName>" + this.deviceName + "</app:deviceName>";
        }
        xml += "<app:deviceType>" + this.deviceType + "</app:deviceType>";
        xml += "<app:command>" + this.command + "</app:command>";
        xml += "</app:SendCommandToDeviceType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function BalanceCashDrawer(userId) {
    this.userId = userId;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:BalanceCashDrawerType>"
        if (util.isValidVariable(this.userId)) {
            xml += "<app:userId>" + this.userId + "</app:userId>";
        }
        xml += "</app:BalanceCashDrawerType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FindPrintJobRoutingRulesType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindPrintJobRoutingRulesType>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindPrintJobRoutingRulesType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SavePrintJobRoutingRuleType(id, sourcePrinterId, targetPrinterId, orderTypes, hoursId, appInstanceId) {
    this.printJobRoutingRule = new PrintJobRoutingRuleType(id, sourcePrinterId, targetPrinterId, orderTypes, hoursId, appInstanceId);
    this.tag = "<app:SavePrintJobRoutingRuleType>";
    this.endTag = "</app:SavePrintJobRoutingRuleType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.printJobRoutingRule.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function PrintJobRoutingRuleType(id, sourcePrinterId, targetPrinterId, orderTypes, hoursId, appInstanceId) {
    this.id = id;
    this.sourcePrinterId = sourcePrinterId;
    this.targetPrinterId = targetPrinterId;
    this.orderTypes = orderTypes;
    this.hoursId = hoursId;
    this.appInstanceId = appInstanceId;
    this.getXML = function () {
        var xml = "<app:printJobRoutingRule>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.sourcePrinterId)) {
            xml += "<app:sourcePrinterId>" + this.sourcePrinterId + "</app:sourcePrinterId>";
        }
        if (util.isValidVariable(this.targetPrinterId)) {
            xml += "<app:targetPrinterId>" + this.targetPrinterId + "</app:targetPrinterId>";
        }
        if (util.isValidVariable(this.orderTypes)) {
            xml += "<app:orderTypes>" + this.orderTypes + "</app:orderTypes>";
        }
        if (util.isValidVariable(this.hoursId)) {
            xml += "<app:hoursId>" + this.hoursId + "</app:hoursId>";
        }
        if (util.isValidVariable(this.appInstanceId)) {
            xml += "<app:appInstanceId>" + this.appInstanceId + "</app:appInstanceId>";
        }
        xml += "</app:printJobRoutingRule>";
        return xml;
    }
}

function DeletePrintJobRoutingRuleType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeletePrintJobRoutingRuleType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeletePrintJobRoutingRuleType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function ListPricingRuleType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListPricingRuleType/>";
        xml += soapXMLEnd;
        return xml;
    }
}

function DeletePricingRuleType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeletePricingRuleType>";
        xml += "<app:pricingRuleId>" + this.id + "</app:pricingRuleId>";
        xml += "</app:DeletePricingRuleType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function SavePricingRuleType(id, name, appliedOnOrder, dateFrom, dateTo, weekdays, hourFrom, hourTo, thresholdPrice, thresholdQty, orderType,
    discountCashId, discountPercentageId, promotionPrice, promotionQty, saleItemList) {
    this.myId = id;
    this.myName = name;
    this.myDateFrom = dateFrom;
    this.myDateTo = dateTo;
    this.myAppliedOnOrder = appliedOnOrder;
    this.myWeekdays = weekdays;
    this.myHourFrom = hourFrom;
    this.myHourTo = hourTo;
    this.myThresholdPrice = thresholdPrice;
    this.myThresholdQty = thresholdQty;
    this.myOrderType = orderType;
    this.myDiscountCashId = discountCashId;
    this.myDiscountPercentageId = discountPercentageId;
    this.myPromotionPrice = promotionPrice;
    this.myPromotionQty = promotionQty;
    this.mySaleItemList = saleItemList;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SavePricingRuleType>";
        xml += "<app:pricingRule>";
        if (util.isValidVariable(this.myId)) {
            xml += "<app:id>" + this.myId + "</app:id>";
        }
        if (util.isValidVariable(this.myName)) {
            xml += "<app:name>" + this.myName + "</app:name>";
        }
        if (util.isValidVariable(this.myDateFrom)) {
            xml += "<app:dateFrom>" + this.myDateFrom + "</app:dateFrom>";
        }
        if (util.isValidVariable(this.myDateTo)) {
            xml += "<app:dateTo>" + this.myDateTo + "</app:dateTo>";
        }
        if (util.isValidBooleanVariable(this.myAppliedOnOrder)) {
            xml += "<app:appliedOnOrder>" + this.myAppliedOnOrder + "</app:appliedOnOrder>";
        }
        if (util.isValidVariable(this.myWeekdays)) {
            xml += "<app:weekdays>" + this.myWeekdays + "</app:weekdays>";
        }
        if (util.isValidVariable(this.myHourFrom)) {
            xml += "<app:hourFrom>" + this.myHourFrom + "</app:hourFrom>";
        }
        if (util.isValidVariable(this.myHourTo)) {
            xml += "<app:hourTo>" + this.myHourTo + "</app:hourTo>";
        }
        if (util.isValidVariable(this.myThresholdPrice)) {
            xml += "<app:thresholdPrice>" + this.myThresholdPrice + "</app:thresholdPrice>";
        }
        if (util.isValidVariable(this.myThresholdQty)) {
            xml += "<app:thresholdQty>" + this.myThresholdQty + "</app:thresholdQty>";
        }
        if (util.isValidVariable(this.myOrderType)) {
            xml += "<app:orderType>" + this.myOrderType + "</app:orderType>";
        }
        if (util.isValidVariable(this.myDiscountCashId)) {
            xml += "<app:discountCashId>" + this.myDiscountCashId + "</app:discountCashId>";
        }
        if (util.isValidVariable(this.myDiscountPercentageId)) {
            xml += "<app:discountPercentageId>" + this.myDiscountPercentageId + "</app:discountPercentageId>";
        }
        if (util.isValidVariable(this.myPromotionPrice)) {
            xml += "<app:promotionPrice>" + this.myPromotionPrice + "</app:promotionPrice>";
        }
        if (util.isValidVariable(this.myPromotionQty)) {
            xml += "<app:promotionQty>" + this.myPromotionQty + "</app:promotionQty>";
        }
        if (util.isValidVariable(this.mySaleItemList)) {
            for (var i = 0; i < this.mySaleItemList.length; i++) {
                xml += this.mySaleItemList[i].getXML();
            }
        }
        xml += "</app:pricingRule>";
        xml += "</app:SavePricingRuleType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function DeleteHourlyRateType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteHourlyRateType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteHourlyRateType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveHourlyRateType(id, from, to, step, price, fixPrice, saleItemId) {
    this.id = id;
    this.myFrom = from;
    this.myTo = to;
    this.myStep = step;
    this.myPrice = price;
    this.fixPrice = fixPrice;
    this.saleItemId = saleItemId;
    this.tag = "<app:hourlyRate>";
    this.endTag = "</app:hourlyRate>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveHourlyRateType>";
        xml += this.tag;
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.myFrom)) {
            xml += "<app:from>" + this.myFrom + "</app:from>";
        }
        if (util.isValidVariable(this.myTo)) {
            xml += "<app:to>" + this.myTo + "</app:to>";
        }
        if (util.isValidVariable(this.myStep)) {
            xml += "<app:step>" + this.myStep + "</app:step>";
        }
        if (util.isValidVariable(this.myPrice)) {
            xml += "<app:price>" + this.myPrice + "</app:price>";
        }
        if (util.isValidVariable(this.fixPrice)) {
            xml += "<app:fixPrice>" + this.fixPrice + "</app:fixPrice>";
        }
        if (util.isValidVariable(this.saleItemId)) {
            xml += "<app:saleItemId>" + this.saleItemId + "</app:saleItemId>";
        }
        xml += this.endTag;
        xml += "</app:SaveHourlyRateType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function ListHourlyRatesBySaleItemType() {
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListHourlyRatesBySaleItemType/>";
        xml += soapXMLEnd;
        return xml;
    }
}

function ListOrderTypeSettingsType(isFetchInUsedCustomOrderType) {
    this.fetchInUsedCustomOrderType = isFetchInUsedCustomOrderType;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:ListOrderTypeSettingsType>";
        if (util.isValidBooleanVariable(this.fetchInUsedCustomOrderType)) {
            xml += "<app:fetchInUsedCustomOrderType>" + this.fetchInUsedCustomOrderType + "</app:fetchInUsedCustomOrderType>";
        }
        xml += "</app:ListOrderTypeSettingsType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function SaveOrderTypeSettingType(id, displayName, shortName, orderType, defaultAreaId, type) {
    this.id = id;
    this.displayName = displayName;
    this.shortName = shortName;
    this.orderType = orderType;
    this.defaultAreaId = defaultAreaId;
    this.type = type;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveOrderTypeSettingType>";
        xml += "<app:orderTypeSetting>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.displayName)) {
            xml += "<app:displayName>" + this.displayName + "</app:displayName>";
        }
        if (util.isValidVariable(this.shortName)) {
            xml += "<app:shortName>" + this.shortName + "</app:shortName>";
        }
        if (util.isValidVariable(this.orderType)) {
            xml += "<app:orderType>" + this.orderType + "</app:orderType>";
        }
        if (util.isValidVariable(this.defaultAreaId)) {
            xml += "<app:defaultAreaId>" + this.defaultAreaId + "</app:defaultAreaId>";
        }
        if (util.isValidVariable(this.type)) {
            xml += "<app:type>" + this.type + "</app:type>";
        }
        xml += "</app:orderTypeSetting>";
        xml += "</app:SaveOrderTypeSettingType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FindSaleItemsType(onlyKTVItem) {
    this.onlyKTVItem = onlyKTVItem;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindSaleItemsType>";
        if (util.isValidVariable(this.onlyKTVItem)) {
            xml += "<app:onlyKTVItem>" + this.onlyKTVItem + "</app:onlyKTVItem>";
        }
        xml += "</app:FindSaleItemsType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function FindMerchantStoresType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindMerchantStoresType>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindMerchantStoresType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveMerchantStoreType(id, merchantId, name, storeId, busyIndicatorSetup) {
    this.merchantStore = new MerchantStoreType(id, merchantId, name, storeId, busyIndicatorSetup);
    this.tag = "<app:SaveMerchantStoreType>";
    this.endTag = "</app:SaveMerchantStoreType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.merchantStore.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function DeleteMerchantStoreType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteMerchantStoreType>";
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteMerchantStoreType>"
        xml += soapXMLEnd;
        return xml;
    }
}

function MerchantStoreType(id, merchantId, name, storeId, busyIndicatorSetup) {
    this.id = id;
    this.merchantId = merchantId;
    this.name = name;
    this.storeId = storeId;
    this.busyIndicatorSetup = busyIndicatorSetup;
    this.getXML = function () {
        var xml = "<app:merchantStore>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.merchantId)) {
            xml += "<app:merchantId>" + this.merchantId + "</app:merchantId>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidVariable(this.storeId)) {
            xml += "<app:storeId>" + this.storeId + "</app:storeId>";
        }
        if (util.isValidVariable(this.busyIndicatorSetup)) {
            xml += "<app:busyStatusSetup>" + this.busyIndicatorSetup + "</app:busyStatusSetup>";
        }
        xml += "</app:merchantStore>";
        return xml;
    }
}

function BatchPrintReceiptsType(userAuth, from, to) {
    this.userAuth = userAuth;
    this.from = from;
    this.to = to;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:PrintReceiptType>";
        xml += "<app:fromDate>" + this.from + "</app:fromDate>";
        xml += "<app:toDate>" + this.to + "</app:toDate>";
        if (this.userAuth) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:PrintReceiptType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function SaveStaffBreakType(staffBreakList, userAuth) {
    this.staffBreakList = staffBreakList
    this.userAuth = userAuth;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:SaveStaffBreakType>";
        if (util.isValidVariable(this.staffBreakList)) {
            for (var i = 0; i < this.staffBreakList.length; i++) {
                xml += "<app:staffBreak>" + this.staffBreakList[i].getXML() + "</app:staffBreak>";
            }
        }
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:SaveStaffBreakType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function DeleteStaffBreakType(idList, userAuth) {
    this.idList = idList;
    this.userAuth = userAuth;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteStaffBreakType>";
        if (util.isValidVariable(this.idList)) {
            for (var i = 0; i < this.idList.length; i++) {
                xml += "<app:ids>" + this.idList[i] + "</app:ids>";
            }
        }
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:DeleteStaffBreakType>";
        xml += soapXMLEnd;
        return xml;
    }
}
function PrintReceiptType(userAuth, attendanceId, customTransactionId) {
    this.userAuth = userAuth;
    this.attendanceId = attendanceId;
    this.customTransactionId = customTransactionId
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:PrintReceiptType>";
        if (util.isValidVariable(this.attendanceId)) {
            xml += "<app:attendanceId>" + this.attendanceId + "</app:attendanceId>";
        }
        if (util.isValidVariable(this.customTransactionId)) {
            xml += "<app:customTransactionId>" + this.customTransactionId + "</app:customTransactionId>";
        }
        if (util.isValidVariable(this.userAuth)) {
            xml += this.userAuth.getXML();
        }
        xml += "</app:PrintReceiptType>";
        xml += soapXMLEnd;
        return xml;
    }
}

function SubscribedTopics(aId, aName) {
    this.id = aId;
    this.name = aName;
    this.getXML = function () {
        var xml = "<app:name>" + this.name + "</app:name>";
        if (this.id != null && this.id !== "") {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        return xml;
    }
}

function FindTableCategoriesType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:FindTableCategoriesType>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        xml += "</app:FindTableCategoriesType>";
        xml += soapXMLEnd;
        return xml;
    };
}

function SaveTableCategoryType(id, name, description, minSeats, maxSeats) {
    this.tableCategory = new TableCategoryType(id, name, description, minSeats, maxSeats);
    this.tag = "<app:SaveTableCategoryType>";
    this.endTag = "</app:SaveTableCategoryType>";
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += this.tag + this.tableCategory.getXML() + this.endTag;
        xml += soapXMLEnd;
        return xml;
    };
}

function TableCategoryType(id, name, description, minSeats, maxSeats) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.minSeats = minSeats;
    this.maxSeats = maxSeats;
    this.getXML = function () {
        var xml = "<app:tableCategory>";
        if (util.isValidVariable(this.id)) {
            xml += "<app:id>" + this.id + "</app:id>";
        }
        if (util.isValidVariable(this.name)) {
            xml += "<app:name>" + this.name + "</app:name>";
        }
        if (util.isValidVariable(this.description)) {
            xml += "<app:description>" + this.description + "</app:description>";
        }
        if (util.isValidVariable(this.minSeats)) {
            xml += "<app:minSeats>" + this.minSeats + "</app:minSeats>";
        }
        if (util.isValidVariable(this.maxSeats)) {
            xml += "<app:maxSeats>" + this.maxSeats + "</app:maxSeats>";
        }
        xml += "</app:tableCategory>";
        return xml;
    }
}

function DeleteTableCategoryType(id) {
    this.id = id;
    this.getXML = function () {
        var xml = soapXMLBegin;
        xml += "<app:DeleteTableCategoryType>"
        xml += "<app:id>" + this.id + "</app:id>";
        xml += "</app:DeleteTableCategoryType>"
        xml += soapXMLEnd;
        return xml;
    }
}
