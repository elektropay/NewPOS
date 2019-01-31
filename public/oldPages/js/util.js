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
    regExpDict : {
        '&' : new RegExp('&',"g"),
        '<' : new RegExp('<',"g"),
        '>' : new RegExp('>',"g"),
        '&amp;' : new RegExp('&amp;',"g"),
        '&lt;' : new RegExp('&lt;',"g"),
        '&gt;' : new RegExp('&gt;',"g")
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
            value = value.replace(util.regExpDict[specialChar], util.xmlSpecialCharactersDict[specialChar]);
        }
        return value;
    },
    getXMLDisplayValue : function(value) {
        value = util.getStringValue(value);
        for (specialChar in util.xmlSpecialCharactersInverseDict) {
            value = value.replace(util.regExpDict[specialChar], util.xmlSpecialCharactersInverseDict[specialChar]);
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
    },
    clearBlankSpace : function(str) {
        return str == null ? null : str.trim();
    },
    isPositiveInteger: function (s){//是否为正整数
    var re = /^[0-9]+$/ ;
    return re.test(s)
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
        if (!util.isValidVariable(currentUser)) {
            return false;
        }
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
        // CMS roles
        roleList = util.getElementsArray(currentUser.roles);
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