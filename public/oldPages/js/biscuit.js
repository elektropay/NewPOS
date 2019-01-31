var fjm = {};

fjm.tsize = 32;

fjm.tsi = 8;

fjm.nk = function (i) {
    if (i < 0 || i >= fjm.ts.length) return 0;
    else return i;
};

fjm.rd = function () {
    var sb = '#';
    for (var j = 1;
        j < fjm.tsize;
        j++) {
        var t = fjm.ts[0];
        var l = t.length;
        for (var i = 0;
            i < l;
            i++) {
            var g = Math.floor(Math.random() * 100 % l);
            var og = t[g];
            var oi = t[i];
            t = t.replace(oi, sb);
            t = t.replace(og, oi);
            t = t.replace(sb, og);
        } fjm.ts[j] = t;
    }
};

fjm.ts = ["HIVrstuvwWSTpqKPQRxyz012UXYabclmno348ABC7DLO5MN6Z9EFGdeJfghijk"];

fjm.d = function (n, k) {
    if (n == undefined) return undefined;
    k = fjm.nk(k);
    var nl = n.length, t = [], a, b, c, x, m = function (y) {
        t[t.length] = fjm.ts[k].charAt(y);
    },
        N = fjm.ts[k].length, N2 = N * N, N5 = N * 5;
    for (x = 0;
        x < nl;
        x++) {
        a = n.charCodeAt(x);
        if (a < N5) m(Math.floor(a / N)), m(a % N);
        else m(Math.floor(a / N2) + 5), m(Math.floor(a / N) % N), m(a % N);
    } var s = t.join("");
    return String(s.length).length + String(s.length) + s;
};

fjm.e = function (n, k) {
    if (n == undefined) return undefined;
    k = fjm.nk(k);
    var c = n.charAt(0) * 1;
    if (isNaN(c)) return "";
    c = n.substr(1, c) * 1;
    if (isNaN(c)) return "";
    var nl = n.length, t = [], a, f, b, x = String(c).length + 1, m = function (y) { return fjm.ts[k].indexOf(n.charAt(y)) },
        N = fjm.ts[k].length;
    if (nl != x + c) return "";
    while (x < nl) {
        a = m(x++);
        if (a < 5) f = a * N + m(x);
        else f = (a - 5) * N * N + m(x) * N + m(x += 1);
        t[t.length] = String.fromCharCode(f);
        x++;
    } return t.join("");
};

var biscuit = {
    r: '', 
    t1: 'S2KdseksxcEcy', 
    t2: 'U5r2O5Le5i2d', 
    t3: 'U182IdjeDuId', 
    t4: 'L3n45egU2g0e', 
    l: function () {
        return this.h(this.t4);
    },
    s: function (n, v) {
        sessionStorage.setItem(n, v);
    },
    g: function (n) {
        return sessionStorage.getItem(n);
    },
    h: function (n) {
        // var k = fjm.e(sessionStorage.getItem(fjm.d(n, 0)), 0);
        // return k == undefined ? undefined : k;
        return { "isok": true, "tblist": [{ "funId": 64, "funName": "ADMIN_CASHIER_INOUT" }, { "funId": 19, "funName": "RECALL" }, { "funId": 12, "funName": "CHANGE_SERVER" }, { "funId": 50, "funName": "VOID_KITCHEN_ITEM" }, { "funId": 59, "funName": "ADMIN_GIFT_CARD" }, { "funId": 30, "funName": "VIP_CARD" }, { "funId": 37, "funName": "VIEW_ALL_ORDERS" }, { "funId": 10, "funName": "CHANGE_TYPE" }, { "funId": 61, "funName": "ADMIN_STAFF" }, { "funId": 51, "funName": "SHOW_CASH_AMOUNT_BEFORE_CASHED_OUT" }, { "funId": 56, "funName": "REPORT_CUSTOMER_WAITING_TIME" }, { "funId": 8, "funName": "VOID" }, { "funId": 63, "funName": "ADMIN_PAID_OUT" }, { "funId": 49, "funName": "VIEW_HISTORY_ORDERS" }, { "funId": 25, "funName": "SPLIT_ORDER" }, { "funId": 31, "funName": "TIME_CARD" }, { "funId": 26, "funName": "RESERVATION" }, { "funId": 41, "funName": "SETTLE_PAYMENT" }, { "funId": 53, "funName": "CLEAR_TABLE" }, { "funId": 22, "funName": "ADMIN" }, { "funId": 11, "funName": "CHANGE_GUEST" }, { "funId": 48, "funName": "TOTAL_REPORT" }, { "funId": 13, "funName": "CHANGE_TABLE" }, { "funId": 34, "funName": "MOBILE_PAYMENT_BY_CASH" }, { "funId": 57, "funName": "REPORT_CASH_IN_OUT" }, { "funId": 47, "funName": "CASH_IN_OUT" }, { "funId": 65, "funName": "PAX_PAY_AT_THE_TABLE" }, { "funId": 1, "funName": "DINE_IN" }, { "funId": 43, "funName": "ADD_CREDIT_CARD_TIPS" }, { "funId": 23, "funName": "ADD_TIPS" }, { "funId": 45, "funName": "VIEW_ONLINE_ORDERS" }, { "funId": 38, "funName": "REPORT" }, { "funId": 14, "funName": "ITEM_OPTION_PRICE" }, { "funId": 60, "funName": "ADMIN_LOYALTY_CARD" }, { "funId": 40, "funName": "VIEW_ALL_ITEMS" }, { "funId": 7, "funName": "CHARGE" }, { "funId": 39, "funName": "MULTI_ORDER" }, { "funId": 55, "funName": "REPORT_PURCHASE_ORDER" }, { "funId": 21, "funName": "REPRINT" }, { "funId": 16, "funName": "NOTE" }, { "funId": 15, "funName": "OPEN_FOOD" }, { "funId": 54, "funName": "ADMIN_INVENTORY" }, { "funId": 67, "funName": "MODIFY_IN_KITCHEN_ITEM_OPTION" }, { "funId": 3, "funName": "PICKUP" }, { "funId": 28, "funName": "PERSONAL_REPORT" }, { "funId": 69, "funName": "MOVE_OUT" }, { "funId": 52, "funName": "OPEN_TABLE" }, { "funId": 36, "funName": "MOBILE_SETTING" }, { "funId": 58, "funName": "SESSION" }, { "funId": 17, "funName": "OPEN_DRAWER" }, { "funId": 18, "funName": "SETTLE" }, { "funId": 29, "funName": "GIFT_CARD" }, { "funId": 44, "funName": "SETTLE_CASH" }, { "funId": 46, "funName": "VIEW_SELF_DINE_IN_ORDERS" }, { "funId": 20, "funName": "REOPEN" }, { "funId": 71, "funName": "SPLIT_BEFORE_PRINTED" }, { "funId": 33, "funName": "MOBILE_PAYMENT_BY_CARD" }, { "funId": 5, "funName": "EXIT" }, { "funId": 6, "funName": "DISCOUNT" }, { "funId": 66, "funName": "CREATE_ANNOUNCEMENT" }, { "funId": 62, "funName": "ADMIN_RESTAURANT" }, { "funId": 27, "funName": "COMB_ORDER" }, { "funId": 35, "funName": "MOBILE_ORDER" }, { "funId": 9, "funName": "TAX" }, { "funId": 2, "funName": "TOGO" }, { "funId": 70, "funName": "MENU_QUICK_EDIT" }, { "funId": 4, "funName": "DELIVERY" }, { "funId": 24, "funName": "PAY_OUT" }, { "funId": 42, "funName": "VOID_PAYMENT" }], "rllist": [{ "id": 1, "name": "Boss", "readonly": "false" }], "topiclist": [], "needcheckin": "false", "needcashin": "false", "needcashtip": "false", "cashinoutstatus": "CASH_OUT", "status": "OUT", "info": { "name": "Boss", "lan": "en" }, "userid": 1, "staffid": 1 };
    },
    k: function () {
        return this.h(this.t1);
    },
    u: function () {
        // this.r = JSON.parse(this.h(this.t2));
        this.r = this.h(this.t2);
        return this.r;
    },
    c: function () {
        return this.h(this.t3);
    },
    C: function () {
        biscuitf.r = '';
        this.s(fjm.d(this.t3, 0), '');
        this.s(fjm.d(this.t1, 0), '');
        this.s(fjm.d(this.t2, 0), '{}');
    },
    p: function (r) {
        if (this.r == '') biscuitf.u();
        var rs = this.r.tblist;
        if (!rs) return false;
        for (var i in rs) if (rs[i].funName == r) return true;
        return false;
    }
};

