var uiBaseObj = {
    ADD : "ADD",
    UPDATE : "UPDATE",
    SUCCESS : "SUCCESS",
    ERROR : "ERROR",
    WARN : "WARN",
    alertPopupElementId : "alert-popup",
    confirmDialogElementId : "confirm-dialog-popup",
    highlightRow : function (row, highLight) {
        row.style.cursor = 'pointer';
        var borderWidth = "1px";
        var borderColor;
        if (highLight) {
            borderColor = "blue";
        } else {
            borderColor = "#B3B1B1";
        }
        for (var i = 0; i < row.cells.length; i++) {
            var cell = row.cells[i];
            cell.style.borderWidth = borderWidth;
            cell.style.borderColor = borderColor;
        }
    },
    getAlignedTableContentHTML : function(elementList, cellPerRow, elementGenerationFun) {
        var html = "<tbody>";
        for (var i = 0; i < elementList.length; i++) {
            var element = elementList[i];
            if (i % cellPerRow == 0) {
                var rowHtml = "<tr>";
            }
            var cellContentHTML = elementGenerationFun(element);
            rowHtml += '<td>' + cellContentHTML + '</td>';
            if (i % cellPerRow == (cellPerRow - 1) || i == elementList.length - 1) {
                rowHtml += "</tr>";
                html += rowHtml;
            }
        }
        html += "</tbody>";
        return html;
    },
    updateCheckBoxListBySelections : function(containerId, elementList) {
        //$("#" + containerId + " :checked").prop("checked", false);
        $("#" + containerId + " :checkbox").each(function() {
            for (var i = 0; i < elementList.length; i++) {
                if(elementList[i].id == $(this).val() && (elementList[i].enable == "false" || elementList[i].enable ==0)) {
                    $(this).prop("checked", false);
                    break;
                }else if (elementList[i].id == $(this).val()) {
                    $(this).prop("checked", true);
                    break;
                }else if (elementList[i].name == $(this).val()) {
                    $(this).prop("checked", true);
                    break;
                }
            }
        });
    },
    addDeleteConfirmDialog : function(containerDivId, divId, deleteTargetName, confirmFunction, cancelFunction) {
        var containerDiv = $("#" +containerDivId);
        confirmFunction = confirmFunction + "uiBaseObj.closeDeleteConfirmDialog(" + divId + ");";
        //仅staff.js的cancelFunction(cancelStaffBreak)不为undefined, 且close功能已实现
        if (cancelFunction == undefined)
        {
            cancelFunction = 'onclick="' + 'uiBaseObj.closeDeleteConfirmDialog(' + divId + ');"';
        }
        containerDiv.append(uiBaseObj.getDeleteConfirmDialog(divId, deleteTargetName, confirmFunction, cancelFunction)).trigger("create");
    },
    //POS-4109
    closeDeleteConfirmDialog: function (divId) {
        $(divId).popup('close');
    },
    getDeleteConfirmDialog : function(divId, deleteTargetName, confirmFunction, cancelFunction) {
        var html = '<div data-role="popup" id="' + divId + '"  data-overlay-theme="a" data-theme="a" class="ui-corner-all deleteConfirmationDialog">';
        html += '<div data-role="header" data-theme="a" class="ui-corner-top"><h1 class="delete-confirm-dialog-header">Confirm Delete</h1></div>';
        html += '<div data-role="content" data-theme="a" class="ui-corner-bottom ui-content">';
        html += '<h3 class="ui-title delete-confirm-dialog-content-header">Are you sure you want to delete this entry?</h3><p class="delete-confirm-dialog-content-p">This action cannot be undone.</p>';
        html += '<a href="#" class="delete-confirm-dialog-btn-confirm" data-role="button" data-inline="true" data-transition="flow" data-theme="b" onclick="' + confirmFunction + '">Delete</a>';
        html += '<a href="#" class="delete-confirm-dialog-btn-cancel" data-role="button" data-inline="true" data-theme="a" ' + cancelFunction + '>Cancel</a>';
        html += '</div></div>';
        return html;
    },
    addAlertPopup : function(containerDivId, content, elementId) {
        var containerDiv = $("#" + containerDivId);
        containerDiv.append(uiBaseObj.getAlertPopupHTML(content, elementId)).trigger("create");
    },
    getAlertPopupHTML : function(content, elementId) {
        var html = '<div data-role="popup" data-transition="flow" id="' + (util.isValidVariable(elementId) ? elementId : uiBaseObj.alertPopupElementId) + '">';
        html += '<p>' + util.getEmptyValueIfInvalid(content) +  '</p>';
        html += '</div>';
        return html;
    },
    alertMsg : function(content, msgType) {
        var realMsgContent = systemLanguage.getMsgContent();
        var alertPopupObj = $("#" + uiBaseObj.alertPopupElementId);
        uiBaseObj.setAlertDivStyle(alertPopupObj, msgType);
        alertPopupObj.find("p").text(content);
        alertPopupObj.popup("open");
        window.setTimeout(function() {alertPopupObj.popup("close");}, 2000); 
    },
    alert : function(msgId, defaultContent, extraData, msgType) {
        var realMsgContent = systemLanguage.getMsgContent(msgId, defaultContent);
        if (util.isValidVariable(extraData)) {
            realMsgContent += uiBaseObj.getExtraDataContentForAlertPopup(msgId, extraData);
        }
        var alertPopupObj = $("#" + uiBaseObj.alertPopupElementId);
        uiBaseObj.setAlertDivStyle(alertPopupObj, msgType);
        alertPopupObj.find("p").text(realMsgContent);
        alertPopupObj.popup("open");
        window.setTimeout(function() {alertPopupObj.popup("close");}, 2000); 
    },
    alertDiv : function(containerDivId, msgId, defaultContent) {
        var realMsgContent = systemLanguage.getMsgContent(msgId, defaultContent);
        var parentDiv = $('#' + containerDivId);
        parentDiv.append(uiBaseObj.getAlertDiv(realMsgContent));
        parentDiv.css('border', '1px solid red');

    },
    getAlertDiv : function(content) {
        return '<div class="error-msg-div">' + content + '</div>';
    },
    setAlertDivStyle : function(alertDiv, msgType) {
        if (msgType == uiBaseObj.SUCCESS) {
            alertDiv.css('background-color', '#CBEFC9');
            alertDiv.css('border-color', '#7AC778');
        } else if (msgType == uiBaseObj.ERROR || !msgType) {
            alertDiv.css('background-color', '#FAD2D1');
            alertDiv.css('border-color', '#EC9788');
        } else if (msgType == uiBaseObj.WARN) {
            alertDiv.css('background-color', '#FEEFBC');
            alertDiv.css('border-color', '#FFD275');
        }
    },
    resetAllAlertDivs : function() {
        var alertDivs = $('.error-msg-div');
        alertDivs.each(function() {
            var parentDiv = $(this).parent();
            parentDiv.css('border', '');
            $(this).remove();
        });
    },
    getExtraDataContentForAlertPopup : function(msgId, extraData) {
        var content = "";
        var result = extraData;
        if (util.isValidVariable(result.failurereasoncode)) {
            //content += "Failure Code: " + result.failurereasoncode + ". ";
            console.log(result.failurereasoncode);
        }

        if (util.isValidVariable(result.failurereason)) {
            content += ". Reason: " + result.failurereason;
        } else{
            content += ". Reason: " + result;
        }
        return content;
    },
    addConfirmDialog : function(containerDivId, elementId, header, title, content, onConfirmCallBackFunction) {
        var containerDiv = $("#" + containerDivId);
        containerDiv.append(uiBaseObj.getConfirmDialog(elementId, header, title, content, onConfirmCallBackFunction)).trigger("create");
    },
    getConfirmDialog : function(elementId, header, title, content, onConfirmCallBackFunction) {
        var html = '<div data-role="popup" id="' + elementId + '" data-overlay-theme="a" data-theme="a" class="ui-corner-all">';
        html += '<div data-role="header" data-theme="a" class="ui-corner-top">';
        html += '<h1 id="confirm-popup-header">' + util.getEmptyValueIfInvalid(header) + '</h1></div>';
        html += '<div role="main" class="ui-corner-bottom ui-content">';
        html += '<h3 id="confirm-popup-content-title" class="ui-title">' + util.getEmptyValueIfInvalid(title) + '</h3>';
        html += '<p>' + util.getEmptyValueIfInvalid(content) + '</p>';
        html += '<a href="#" class="confirm-dialog-btn-confirm" data-role="button" data-inline="true" data-transition="flow" data-theme="b" onclick="' + onConfirmCallBackFunction +  '">Confirm</a>';
        html += '<a href="#" class="confirm-dialog-btn-cancel" data-role="button" data-inline="true" data-theme="a" onclick="uiBaseObj.closeConfirmDialog(' + elementId + ');">Cancel</a></div></div>';
        return html;
    },
    closeConfirmDialog: function (divId) {
        $(divId).popup('close');
    },
};

var baseReportObj = {
    currentUser : null,
    currentClientApp : null,
    userIdToStaffIdMapping : {},
    todayDate : null,
    tomorrowDate : null,
    setFromTimeAndToTimeObject : function(fromDateElementName, toDateElementName, fromTimeElementName, toTimeElementName) {
        var fromDateElement = $('#' + fromDateElementName);
        var toDateElement = $('#' + toDateElementName);
        var fromTimeElement = $('#' + fromTimeElementName);
        var toTimeElement = $('#' + toTimeElementName);
        var fromDate = fromDateElement.val();
        if (fromDate) {
            var s = fromDate.split("T");
            baseReportObj.todayDate = s[0];
            fromTimeElement.val(s[1]);
        }
        var toDate = toDateElement.val();
        if (toDate) {
            var s = toDate.split("T");
            baseReportObj.tomorrowDate = s[0];
            toTimeElement.val(s[1]);
        }
        fromTimeElement.change(function() {
             fromDateElement.val(baseReportObj.todayDate + "T" + fromTimeElement.val());
        });
        toTimeElement.change(function() {
             toDateElement.val(baseReportObj.tomorrowDate + "T" + toTimeElement.val());
        });
    },
    parseReportDate : function(date) {
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        return date.getFullYear() + '-' + month + '-' + day;
    },
    getCurrentDate : function(systemHours) {
        var systemHoursStr = systemHours.split(':');
        var systemHoursMinutesSinceMidnight = parseInt(systemHoursStr[0]) * 60 + parseInt(systemHoursStr[1]);
        var now = new Date();
        var nowMinutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
        if (nowMinutesSinceMidnight < systemHoursMinutesSinceMidnight) {
            now = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        return now;
    },
    setReportDateBasedOnSystemDate : function(fromElementId, toElementId, fromTimeElementId, toTimeElementId) {
        var soapType = new FetchCompanyProfileType();
        var element = {
            thisObj : this,
            fromElementId : fromElementId,
            toElementId : toElementId,
            fromTimeElementId : fromTimeElementId,
            toTimeElementId : toTimeElementId
        };
        callWebService(soapType, this.loadCompanyProfileHandler, element);
    },
    loadCompanyProfileHandler : function(jsonObj, callbackObj) {
        if (util.isSuccessfulResponse((jsonObj.fetchcompanyprofileresponsetype))) {
            companyProfile = jsonObj.fetchcompanyprofileresponsetype.company;
            var curHours = util.getElementsArray(companyProfile.hours);
            if (curHours.length > 0) {
                var fromSystemHours = curHours[0].from;
                var toSystemHours = curHours[0].to;
                var systemDate = callbackObj.thisObj.getCurrentDate(fromSystemHours);
                var fromElementObj = $("#" + callbackObj.fromElementId);
                var toElementObj = $("#" + callbackObj.toElementId);
                if (fromElementObj.is('[type=date]') && toElementObj.is('[type=date]')) {
                    var parsedDate = callbackObj.thisObj.parseReportDate(systemDate);
                    fromElementObj.val(parsedDate);
                    toElementObj.val(parsedDate);
                } else {
                    var parsedFromDate = callbackObj.thisObj.parseReportDate(systemDate) + "T" + fromSystemHours + ":00";
                    fromElementObj.val(parsedFromDate);
                    var toDate = new Date(systemDate.getTime() + 24 * 60 * 60 * 1000);
                    var parsedToDate = callbackObj.thisObj.parseReportDate(toDate) + "T" + fromSystemHours + ":00";
                    toElementObj.val(parsedToDate);
                }
                if (callbackObj.fromTimeElementId && callbackObj.toTimeElementId) {
                    baseReportObj.setFromTimeAndToTimeObject(callbackObj.fromElementId, callbackObj.toElementId, callbackObj.fromTimeElementId, callbackObj.toTimeElementId);
                }
            }
        }
    },
    setFormActionUrl : function(formId, actionUrl) {
        var reportActionUrl = getServerUrl() + actionUrl;
        $('#' + formId).attr('action', reportActionUrl);
    },
    goFend : function(){
        window.location.href='front/index.html';
    }
};

var admin = {
    init : function(pageId, obj) {
        if (!admin.hasAdminAccess()) {
            admin.disablePage();
            return false;
        }

        window.onhelp = function() {return false;}//Seems not working for Chromium
        document.onkeydown = mykeydownctrl;
        document.onselectstart = function(){return false;}

        var language = biscuit.l();
        systemLanguage.init(language);

        if (obj) {
            obj.init();
        }

        if (obj.disableCustomAlertPopup !== true) {
            uiBaseObj.addAlertPopup(pageId);
        }
        systemLanguage.loadLanguageForPage(pageId);
        if (obj && typeof(obj.afterInit) == "function") {
            obj.afterInit();
        }
        return true;
    },
    hasAdminAccess : function() {
        return typeof biscuit.k() != 'undefined';
    },
    disablePage : function() {
        $("input[type=button]").attr("disabled", "disabled");
        $(":input").attr("disabled","disabled");
    },
    initPage : function() {
        $(document).on('pagecreate', "#printingSetupPage", function() {
            admin.init("printingSetupPage", printingSetupPageObj);
        });
        $(document).on('pagecreate', "#staffPage", function() {
            admin.init("staffPage", staffPage);
        });
        $(document).on('pagecreate', "#companyPage", function() {
            admin.init("companyPage", companyPage);
        });
        $(document).on('pagecreate', "#globalOptionsPage", function() {
             admin.init("globalOptionsPage", globalOptionsPage);
        });

        $(document).on('pagecreate', "#settings-page", function() {
            admin.init("settings-page", settingsObj);
        });

        $(document).on('pagecreate', "#giftCard-page", function() {
            admin.init("giftCard-page", giftCardObj);
        });

        $(document).on('pagecreate', "#loyaltyCard-page", function() {
            admin.init("loyaltyCard-page", loyaltyCardPageObj);
        });

        $(document).on('pagecreate', "#customer-page", function() {
            admin.init("customer-page", customerObj);
        });

        $(document).on('pagecreate', "#taxPage", function() {
            admin.init("taxPage", tax);
        });

        $(document).on('pagecreate', "#discountPage", function() {
            admin.init("discountPage", discount);
        });

        $(document).on('pagecreate', "#chargePage", function() {
            admin.init("chargePage", charge);
        });

        $(document).on('pagecreate', "#paymentAccountPage", function() {
            admin.init("paymentAccountPage", paymentAccount);
        });

        $(document).on('pagecreate', "#tableManagementPage", function() {
            admin.init("tableManagementPage", tableManagementPage);
        });

        $(document).on('pagecreate', "#language-page", function() {
            admin.init("language-page", languageManagement);
        });

        $(document).on('pagecreate', "#printers-page", function() {
            admin.init("printers-page", devicePage);
        });

        $(document).on('pagecreate', "#totalsReportPage", function() {
            admin.init("totalsReportPage", totalReportObj);
        });

        $(document).on('pagecreate', "#staffReportPage", function() {
            admin.init("staffReportPage", staffReportObj);
        });

        $(document).on('pagecreate', "#creditCardReportPage", function() {
            admin.init("creditCardReportPage", creditCardReportObj);
        });

        $(document).on('pagecreate', "#menuReportPage", function() {
            admin.init("menuReportPage", menuReportObj);
        });

        $(document).on('pagecreate', "#detailReportPage", function() {
            admin.init("detailReportPage", detailReportObj);
        });

        $(document).on('pagecreate', "#cashIOPage", function() {
            admin.init("cashIOPage", cashInOutReportObj);
        });

        $(document).on('pagecreate', "#cashCreditDeliveryPage", function() {
            admin.init("cashCreditDeliveryPage", cashCreditDeliveryReportObj);
        });

        $(document).on('pagecreate', "#loyaltyCardTransactionReportPage", function() {
            admin.init("loyaltyCardTransactionReportPage", loyaltyCardTransactionReportObj);
        });

        $(document).on('pagecreate', "#giftCardTransactionReportPage", function() {
            admin.init("giftCardTransactionReportPage", giftCardTransactionReportObj);
        });

        $(document).on('pagecreate', "#itemSizePage", function() {
            admin.init("itemSizePage", itemSizePage);
        });

        $(document).on('pagecreate', "#deliveryAreaPage", function() {
            admin.init("deliveryAreaPage", deliveryArea);
        });

        $(document).on('pagecreate', "#cashRegisterActivityPage", function() {
            admin.init("cashRegisterActivityPage", cashRegisterActivityPageObj);
        });

        $(document).on('pagecreate', "#inventoryInfoPage", function() {
            admin.init("inventoryInfoPage", inventoryInfoPage);
        });

        $(document).on('pagecreate', "#inventoryItemPage", function() {
            admin.init("inventoryItemPage", inventoryItemPage);
        });

        $(document).on('pagecreate', "#coursePage", function() {
            admin.init("coursePage", coursePage);
        });
        $(document).on('pagecreate', "#promotionStrategy-page", function() {
            admin.init("promotionStrategy-page", promotionObj);
        });
        $(document).on('pagecreate', "#hourlyRatePage", function() {
            admin.init("hourlyRatePage", hourlyRatePage);
        });
        $(document).on('pagecreate', "#orderTypeSettingPage", function() {
            admin.init("orderTypeSettingPage", orderTypeSetting);
        });
        $(document).on('pagecreate', "#merchantStorePage", function() {
            admin.init("merchantStorePage", merchantStorePage);
        });
        $(document).on('pagecreate', "#cmsSettingPage", function() {
            admin.init("cmsSettingPage", cmsSettingPage);
        });
        $(document).ready(function() {
            if (typeof galleryPage != 'undefined') {
                admin.init("galleryPage", galleryPage);
            }
        });
      
        $(document).ready(function() {
            if (typeof inventoryManagementPage != 'undefined') {
                admin.init("inventoryManagementPage", inventoryManagementPage);
            }
        });

        $(document).ready(function() {
            if (typeof mainReportPage != 'undefined') {
                admin.init("mainReportPage", mainReportPage);
            }
        });
		$(document).ready(function() {
            if (typeof partnerIntegrationPage != 'undefined') {
                admin.init("partnerIntegrationPage", partnerIntegrationPage);
            }
        });
    },
    getUserAuthInfo : function() {
        var userAuth = null;
        var user = biscuit.u();
        //var sessionKey = biscuit.k();
        var sessionKey = null;
        if (user) {
            userAuth = new UserAuthenticationType(user.userid, sessionKey);
        }
        return userAuth;
    }
};

admin.initPage();
