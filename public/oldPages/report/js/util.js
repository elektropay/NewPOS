var converter = {
    jq : function(myid) {
        return "#" + myid.replace( /(:|\.|\[|\])/g, "\\$1" );
    },
    getTodayDate: function () {
        var now = new Date();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        return now.getFullYear() + '-' + month + '-' + day;
    },
    getTomorrowDate: function () {
        var now = new Date();
        now.setDate(now.getDate() + 1);
        var month = now.getMonth() + 1;
        var day = now.getDate();
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        return now.getFullYear() + '-' + month + '-' + day;
    }
};

var util = {
    xmlSpecialCharactersDict : {
        '&' : '&amp;',
        '<' : '&lt;',
        '>' : '&gt;'
    },
    xmlSpecialCharactersInverseDict : {
        '&amp;' : '&',
        '&lt;' : '<',
        '&gt;' : '>'
    },
    getStringValue : function(value) {
        if (typeof value == "string" && value != null) {
            return value;
        } else if (util.isValidNumber(value)) {
            return value.toString();
        }
        return "";
    },
    isNumber : function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },
    isEmptyMap : function(map) {
       for (var key in map) {
          if (map.hasOwnProperty(key)) {
             return false;
          }
       }
       return true;
    },
    equalIgnoreCase : function(str1, str2) {
        return str1.toUpperCase() === str2.toUpperCase();
    },
    getXMLSafeValue : function(value) {
        value = util.getStringValue(value);
        for (specialChar in util.xmlSpecialCharactersDict) {
            value = value.replace(new RegExp(specialChar,"g"), util.xmlSpecialCharactersDict[specialChar]);
        }
        return value;
    },
    getXMLDisplayValue : function(value) {
        value = util.getStringValue(value);
        for (specialChar in util.xmlSpecialCharactersInverseDict) {
            value = value.replace(new RegExp(specialChar,"g"), util.xmlSpecialCharactersInverseDict[specialChar]);
        }
        return value;
    },
    getElementsArray : function(elements) {
        if (elements == undefined || elements == null || elements == "") {
            var array = new Array();
            return array;
        }
        if (elements.length == undefined) {
            var array = new Array();
            array.push(elements);
            return array;
        }
        return elements;
    },
    uncheckAll : function (checkBoxList) {
        if(checkBoxList != null) {
            for(var i = 0; i < checkBoxList.length; i++) {
                checkBoxList[i].checked = false;
            }
        }
    },
    updateCheckBoxListBySelections : function(checkBoxList, selections, markAsChecked, setReadOnly) {
        selections = util.getElementsArray(selections);
        if (selections != undefined && selections != null) {
            for (var i = 0; i < selections.length; i++) {
                if (checkBoxList != null) {
                    for (var j = 0; j < checkBoxList.length; j++) {
                        if (selections[i].id == checkBoxList[j].value) {
                            checkBoxList[j].checked = markAsChecked;
                            setReadOnly = (typeof setReadOnly !== 'undefined' ? setReadOnly : false);
                            if (setReadOnly) {
                                checkBoxList[j].disabled = markAsChecked;
                            }
                        }
                    }
                }
            }
        }
    },
    isNullOrEmpty : function(value) {
        return value == null || value == "";
    },
    isValidVariable : function(value) {
        return typeof value !== 'undefined' && value;
    },
    isValidVariableOrEmpty : function(value) {
        return typeof value !== 'undefined' && value != null;
    },
    isValidBooleanVariable : function(value) {
        return typeof value !== 'undefined' && value != null && value !== "";
    },
    isValidNumber : function(value) {
        return typeof value == 'number';
    },
    isValidInteger : function(value) {
        return value == parseInt(value);
    },
    isValidSoapRequestVariable : function(value) {
        return typeof value !== 'undefined' && value != null;
    },
    getRoundupValue : function(value, precision) {
        return Math.round(value * precision) / precision;
    },
    getNullValueIfInvalid : function(value) {
        return util.isValidVariable(value) ? value : null;
    },
    getEmptyValueIfInvalid : function(value) {
        return util.isValidVariable(value) ? value : "";
    },
    getLeftPaddedStr : function(value, paddingChar, totalLength) {
        var str = "" + value;
        var padString = "";
        for (var i = 0; i < totalLength; i++) {
            padString += paddingChar;
        }
        return padString.substring(0, padString.length - str.length) + str;
    },
    addCheckbox : function(name, displayName, containerId) {
        var container = $('#' + containerId);
        var inputs = container.find('input');
        var id = inputs.length + 1;
        $('<input />', { type: 'checkbox', id: 'cb'+id, name: name }).appendTo(container);
        $('<label />', { 'for': 'cb'+id, text: displayName }).appendTo(container);
    },
    isBooleanTrue : function(value) {
        return value == 'true' || value == 'TRUE';
    },
    isSuccessfulResponse : function(response) {
        return util.isValidVariable(response) && util.isValidVariable(response.result) && response.result.successful == "true";
    },
    trim : function(str) {
        if (!util.isValidVariable(str)) {
            return "";
        }
        return str.replace(/^\s+|\s+$/g, '');
    },
    getFloatValue : function(value) {
        if (!util.isValidVariable(value)) {
            return value;
        }
        return parseFloat(value.toFixed(4));
    },
    getMoneyAmount : function(value) {
        if (!util.isValidVariable(value)) {
            return value;
        }
        return parseFloat(value.toFixed(2));
    },
    formatJsDate : function(jsDate) {
        return jsDate.replace("T", " ") + ":00";
    },
    isValidPhoneNumber : function(number) {
        var expression = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return expression.test(number);
    }
};

var biscuitHelper = {
    hasPermission : function(currentUser, permission) {
        var permissionList = util.getElementsArray(currentUser.tblist);
        for (var i = 0; i < permissionList.length; i++) {
            if (permissionList[i].funName == permission) {
                return true;
            }
        }
        // CMS permissions
        permissionList = util.getElementsArray(currentUser.permissions);
        for (var i = 0; i < permissionList.length; i++) {
            if (permissionList[i].name == permission) {
                return true;
            }
        }
        return false;
    },
    hasRole : function(currentUser, role) {
        var roleList = util.getElementsArray(currentUser.rllist);
        if (roleList.length == 0) {
            roleList = util.getElementsArray(currentUser.uG);
        }
        if (roleList.length == 0) {
            roleList = util.getElementsArray(currentUser.Jj);
        }
        for (var i = 0; i < roleList.length; i++) {
            if (roleList[i].name.toUpperCase() == role.toUpperCase()) {
                return true;
            }
        }
        return false;
    },
    getMerchantInfo : function(currentUser) {
        var merchantInfo = {
            merchantName: '',
            merchantIds: ''
        };
        var merchantDetailsMapById = {};
        var merchants = util.getElementsArray(currentUser.merchants);
        for (var i = 0; i < merchants.length; i++) {
            var merchant = merchants[i];
            merchantDetailsMapById[merchant.merchantId] = merchant;
        }
        var merchantIds = util.getElementsArray(currentUser.selectedStores);
        if (merchantIds.length > 0) {
            var currentMIDs = '';
            var merchantDetails = merchantDetailsMapById[merchantIds[0]];
            if (merchantDetails) {
                merchantInfo.merchantName = merchantDetails.name;
            } else {
                console.log("ERROR: merchant details not found by mid: " + merchantIds[0]);
            }
            if (merchantIds.length > 1) {
                merchantInfo.merchantName += ' and other ' + (merchantIds.length - 1) + ' Stores';
            }
            for (var i = 0; i < merchantIds.length; i++) {
                currentMIDs += merchantIds[i] + ',';
            }
            currentMIDs = currentMIDs.substr(0, currentMIDs.length - 1);
            merchantInfo.merchantIds = currentMIDs;
        }
        return merchantInfo;
    }
};

var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
                      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
                      '<soapenv:Header/><soapenv:Body>';

var soapXMLEnd = '</soapenv:Body></soapenv:Envelope>';

var serverUrl = getServerUrl() + "/kpos/ws/kposService";

var getMenuListUrl = getServerUrl() + "/kpos/webapp/menu/menus";

var getMenuUrl = getServerUrl() + "/kpos/webapp/menu/menu/";

var getMenuGroupUrl = getServerUrl() + "/kpos/webapp/menu/menuGroup/";

var getOrderTypeListUrl = getServerUrl() + "/kpos/webapp/orderTypes";

var getStaffTypeUrl = getServerUrl() + "/kpos/webapp/staffMembers";

function getServerUrl() {
    var thisurl = window.location.href.split('/');
    var suburl = '';
    var ishttps = false;
    for(var i in thisurl)
    {
        if(thisurl[i] == 'http:')continue;
        else if(thisurl[i] == 'https:'){ishttps = true;continue;}
        else if(thisurl[i] == '')continue;
        else{return(ishttps?"https://":"http://")+thisurl[i]+suburl;}
    }
}

function xml2Json (response) {
    var x2js = new X2JS();
    var jsonObj = x2js.xml_str2json(response);
    return jsonObj.Envelope.Body;
}

function setFormActionUrl (formId, actionUrl) {
    var reportActionUrl = getServerUrl() + actionUrl;
    $('#' + formId).attr('action', reportActionUrl);
}

function getCurrentDate (systemHours) {
    var systemHoursStr = systemHours.split(':');
    var systemHoursMinutesSinceMidnight = parseInt(systemHoursStr[0]) * 60 + parseInt(systemHoursStr[1]);
    var now = new Date();
    var nowMinutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
    if (nowMinutesSinceMidnight < systemHoursMinutesSinceMidnight) {
        now = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    return now;
}

function parseReportDate (date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    return date.getFullYear() + '-' + month + '-' + day;
}

var staffIdMap = {
    userIdToStaffIdMapping : {}
}

function getRestaurantHour() {
    var soapXMLRequest = soapXMLBegin + "<app:FetchCompanyProfileType></app:FetchCompanyProfileType>" + soapXMLEnd;
    var fromSystemHours;
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", serverUrl, false);
    var currentUser = biscuit.u();
    if (util.isValidVariable(currentUser)) {
        xhttp.setRequestHeader('Merchant-ID', biscuitHelper.getMerchantInfo(currentUser).merchantIds);
    }
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState = 4 && xhttp.status == 200) {
            var jsonObj = xml2Json(xhttp.response);
            var curHours = util.getElementsArray(jsonObj.FetchCompanyProfileResponseType.company.hours);
            if (curHours.length > 0) {
                fromSystemHours = curHours[0].from;
            }
        }
    }
    xhttp.send(soapXMLRequest);
    return fromSystemHours;
}

function getRestaurantHourInDecimalFormat() {
    var restaurantHour = getRestaurantHour();
    var hourInDecimal = restaurantHour.split(':');
    return parseInt(hourInDecimal[0], 10);
}

function convertStringToTime(restaurantHour, format) {
    var now = new Date();
    if (format === "HH:mm") {
        now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')));
        now.setMinutes(restaurantHour.substr(restaurantHour.indexOf(':') + 1));
        now.setSeconds(0);
        return now;
    } else {
        return 'Invalid Format';
    }
}

function getSystemConfigurationValue(configuration) {
    var systemConfiguration;
    var soapXMLRequest = soapXMLBegin + "<app:ListSystemConfigurationsType/>" + soapXMLEnd;
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", serverUrl, false);
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState = 4 && xhttp.status == 200) {
            var jsonObj = xml2Json(xhttp.response);
            systemConfiguration = util.getElementsArray(jsonObj.ListSystemConfigurationsResponseType.systemConfiguration);
        }
    }
    xhttp.send(soapXMLRequest);

    for (var i = 0; i < systemConfiguration.length; i++) {
        if (systemConfiguration[i].name == configuration) {
            if (systemConfiguration[i].dataType == "Boolean") {
                if (systemConfiguration[i].value == "true") {
                    return true;
                } else {
                    return false;
                }
            } else if (systemConfiguration[i].dataType == "Integer") {
                return systemConfiguration[i].value;
            } else if (systemConfiguration[i].dataType == "Double") {
                return systemConfiguration[i].value;
            } else {
                return systemConfiguration[i].value;
            }
        }    
    }
}

function findOpenSessionStartTime() {
    var soapXMLRequest = soapXMLBegin + "<app:FindSessionType/>" + soapXMLEnd;
    var xhttp = new XMLHttpRequest();
    var session;
    xhttp.open("POST", serverUrl, false);
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState = 4 && xhttp.status == 200) {
            var jsonObj = xml2Json(xhttp.response);
            session = jsonObj.FindSessionResponseType.Session;
        }
    }
    xhttp.send(soapXMLRequest);
    if (session != null) {
        return session.startTime;
    }
}

function renderOrderTypeSelectDiv() {
    var orderTypeSettingList;
    var soapXMLRequest = soapXMLBegin + "<app:ListOrderTypeSettingsType/>" + soapXMLEnd;
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", serverUrl, false);
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState = 4 && xhttp.status == 200) {
            var jsonObj = xml2Json(xhttp.response);
            orderTypeSettingList = util.getElementsArray(jsonObj.ListOrderTypeSettingsResponseType.orderTypeSettings);
        }
    }
    xhttp.send(soapXMLRequest);
    
    $('#label-orderType ~ div ul li a span.text').each(
        function() {
            for (var i = 0; i < orderTypeSettingList.length; i++) {
                if ($(this).html() == orderTypeSettingList[i].name) {
                    $(this).html(getDataDisplayValue(orderTypeSettingList[i], "name", orderTypeSettingList[i].displayName));
                }
            }
        }
    );
    
    $('#orderType option').each(
        function() {
            for (var i = 0; i < orderTypeSettingList.length; i++) {
                if ($(this).html() == orderTypeSettingList[i].name) {
                    $(this).html(getDataDisplayValue(orderTypeSettingList[i], "name", orderTypeSettingList[i].displayName));
                }
            }
        }
    );
}