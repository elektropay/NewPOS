var hourlyRatePage = {
    init : function() {
        hourlyRate.init();
        uiBaseObj.addDeleteConfirmDialog("hourlyRatePage", "deleteHourlyRateConfirmationDialog", "HourlyRate", "hourlyRate.deleteHourlyRate();");
    }
};

var hourlyRate = {
    action : "",
    v_selected_rowid : "",
    hourlyRateGroupBySaleItem : {},
    toBeDeletedElementID : -1,
    init : function() {
        hourlyRate.listAllHourlyRates();
        hourlyRate.listAllElements();
        $("#dateFrom").datepicker({
            dateFormat: "mm-dd",
            changeMonth: true,
            changeYear: false,
        });
        $("#dateTo").datepicker({
            dateFormat: "mm-dd",
            changeMonth: true,
            changeYear: false,
        });
    },
    clearDetails : function(disableElements) {
        $("#from").val("");
        $("#from").prop("readOnly", disableElements);
        $("#to").val("");
        $("#to").prop("readOnly", disableElements);
        $("#step").val("");
        $("#step").prop("readOnly", disableElements);
        $("#price").val("");
        $("#price").prop("readOnly", disableElements);
        $("#btnSaveHourlyRate").prop("disabled", disableElements);       
        $("#fixPrice").val("");
        $("#fixPrice").prop("readOnly", disableElements);
        $("#hourly-rate-rule-detail-show-panel").empty();
        $("#curHourlyRateEntryId").val("");
        hourlyRate.clearRowHighlight();
        hourlyRate.displayHint(true);
        hourlyRate.clearBackgroundColor();
    },
    listAllHourlyRates : function (){
        var soapType = new ListHourlyRatesBySaleItemType();
        callWebService(soapType, hourlyRate.listAllHourlyRatesHandler);
    },
    listAllHourlyRatesHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listhourlyratesbysaleitemresponsetype)) {
            var saleItemList = util.getElementsArray(jsonObj.listhourlyratesbysaleitemresponsetype.saleitems);
            hourlyRate.hourlyRateGroupBySaleItem = {};
            for (var i = 0; i < saleItemList.length; i++) {
                var saleItem = saleItemList[i];
                hourlyRate.hourlyRateGroupBySaleItem[saleItem.id] = util.getElementsArray(saleItem.hourlyrates);
            }
            if (hourlyRate.v_selected_rowid) {
                hourlyRate.selectRow("hourlyRateTable", hourlyRate.v_selected_rowid);
            }
        }
    },
    listAllElements : function (){
        hourlyRate.clearDetails(true);
        var soapType = new FindSaleItemsType(true);
        callWebService(soapType, hourlyRate.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
         if (util.isSuccessfulResponse(jsonObj.findsaleitemsresponsetype)) {
            $("#hourlyRateTable").empty();
            var saleItemList = util.getElementsArray(jsonObj.findsaleitemsresponsetype.saleitem);
            for (var i = 0; i < saleItemList.length; i++) {
                var saleItem = saleItemList[i];
                hourlyRate.addRow("hourlyRateTable", saleItem.name, saleItem.id, "hourlyRate.selectRow", "hourlyRate.deleteHourlyRateConfirmationDialog");
            }
            hourlyRate.listAllHourlyRates();
        } else {
            console.log("Error getting sale item list");
        }
    },
    selectRow : function (tableID, selectedRowID) {
        hourlyRate.clearBackgroundColor();
        $("#curHourlyRateEntryId").val("");
        var table = document.getElementById(tableID);
        hourlyRate.v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                hourlyRate.clearRowHighlight();
                uiBaseObj.highlightRow(row, true);
                $("#from").prop("readOnly", false);
                $("#from").val("");
                $("#to").prop("readOnly", false);
                $("#to").val("")
                $("#step").prop("readOnly", false);
                $("#step").val("")
                $("#price").prop("readOnly", false);
                $("#price").val("")
                $("#fixPrice").prop("readOnly", false);
                $("#fixPrice").val("")
                $("#btnSaveHourlyRate").prop("disabled", false);
                $("#curSaleItemId").val(row.key);
                var hourlyRateRules = hourlyRate.hourlyRateGroupBySaleItem[row.key];
                if (hourlyRateRules === undefined) {
                    hourlyRate.displayHint(true);
                    return;
                }
                hourlyRateRules.sort(function(a, b) {return parseInt(a.to) - parseInt(b.to)});
                var allRulesHtml = '';
                for (var j = 0; j < hourlyRateRules.length; j++) {
                    var enableDeleteIcon = false;
                    if (j == hourlyRateRules.length - 1) {
                        enableDeleteIcon = true;
                    }
                    var element = hourlyRateRules[j];
                    allRulesHtml += hourlyRate.createHourlyRateRule(element, enableDeleteIcon);
                }
                $("#hourly-rate-rule-detail-show-panel").empty();
                $("#hourly-rate-rule-detail-show-panel").append(allRulesHtml).trigger("create");
            }
        }
    },
    createHourlyRateRule : function(hourlyRateRule, enableDeleteIcon) {
        var id = hourlyRateRule.id;
        var key = $("#curSaleItemId").val();
        var from = hourlyRateRule.from + ' <span class="minute">min</span> ~ ';
        var to = hourlyRateRule.to == '' || hourlyRateRule.to == null || hourlyRateRule.to === undefined ? "" : hourlyRateRule.to + ' <span class="minute">min</span>';
        var step = hourlyRateRule.step == '' || hourlyRateRule.step == null || hourlyRateRule.step === undefined ? '' :  ' / ' + hourlyRateRule.step + ' <span class="minute">min</span>';
        var realPrice = hourlyRateRule.price == undefined ? hourlyRateRule.fixprice : hourlyRateRule.price;
        var div1 = '<div class="ui-grid-a border-top font_17" style="margin-right: 5%;" id="hourlyRate-' + hourlyRateRule.id + '"><div class="ui-block-a" style="width: 40%;"><p style="margin:0 0;">' + from + to + '</p></div>';
        var span1 = '<span style="margin-left:20%;" onclick=\'hourlyRate.editHourlyRateRule(\"' + key + '\", \"' + id + '\");\'><i class="fa fa-pencil" aria-hidden="true"></i></span>';
        var span2 = '';
        if (enableDeleteIcon) {
            span2 = '<span style="margin-left:15%;" onclick="hourlyRate.deleteHourlyRateConfirmationDialog(' + id + ');"><i class="fa fa-close" aria-hidden="true"></i></span>';
        } else {
            span2 = '<span style="margin-left:15%;color: rgb(229, 229, 229);"><i class="fa fa-close" aria-hidden="true"></i></span>';
        }
        var div2 = '<div class="ui-block-b" style="width: 60%;"><p style="text-align:right;margin:0 0;">$ ' + realPrice + step + span1 + span2 + '</p></div></div>';
        return div1 + div2;
    },
    editHourlyRateRule : function (key, id) {
        hourlyRate.clearBackgroundColor();
        var hourlyRateRules = hourlyRate.hourlyRateGroupBySaleItem[key];
        var hourlyRateRule = null;
        for (var i = 0; i < hourlyRateRules.length; i++) {
            if (id == hourlyRateRules[i].id) {
                hourlyRateRule = hourlyRateRules[i];
                break;
            }
        }
        if (hourlyRateRule == null) {
            return;
        }
        $("#curHourlyRateEntryId").val(hourlyRateRule.id);
        $("#from").prop("readOnly", false);
        $("#from").val(hourlyRateRule.from);
        $("#to").prop("readOnly", false);
        $("#to").val(hourlyRateRule.to);
        $("#step").prop("readOnly", false);
        $("#step").val(hourlyRateRule.step);
        $("#price").prop("readOnly", false);
        $("#price").val(hourlyRateRule.price);
        $("#fixPrice").prop("readOnly", false);
        $("#fixPrice").val(hourlyRateRule.fixprice);
        hourlyRate.addBackgroundColor("hourlyRate-"+hourlyRateRule.id);
    },
    addRow : function (tableID, rowName, key, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.key = key;

        var innerHTML = "<td style=\"font-size: 20px;\" onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>" + rowName + "</td>";
        row.innerHTML = innerHTML;
    },
    deleteHourlyRate : function () {
        if (hourlyRate.toBeDeletedElementID && hourlyRate.toBeDeletedElementID >=0) {
            var soapType = new DeleteHourlyRateType(hourlyRate.toBeDeletedElementID);
            callWebService(soapType, hourlyRate.deleteElementHandler);
        }
        hourlyRate.toBeDeletedElementID = -1;
    },
    deleteHourlyRateConfirmationDialog : function (id) {
        hourlyRate.toBeDeletedElementID = id;
        $("#curHourlyRateEntryId").val("");
        $('#deleteHourlyRateConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletehourlyrateresponsetype)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS, "Entry have been successfully deleted", jsonObj.deletehourlyrateresponsetype.result);
            hourlyRate.listAllElements();
            $("#btnSaveHourlyRate").prop("disabled", false);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Unable to delete entry", jsonObj.deletehourlyrateresponsetype.result);
        }
    },
    saveElement : function () {
        var entryId = $("#curHourlyRateEntryId").val();
        var from = $("#from").val();
        var to = $("#to").val();
        var step = $("#step").val();
        var price = $("#price").val();
        var saleItemId = $("#curSaleItemId").val();
        var fixPrice = $("#fixPrice").val();
        
        // validate form
        if (!util.isValidVariable(from)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_START_TIME, "Start time cannot be empty!");
            return;
        } else {
            from = parseInt(from);
        }
        
        if (util.isValidVariable(to)) {
            to = parseInt(to);
            if (to <= from) {
                uiBaseObj.alert(systemLanguage.msgCodeList.BEGINNING_LARGER_THAN_ENDING, "Ending time has to be larger than beginning time!");
                return;
            }
        }
        
        var existingHourlyRates = hourlyRate.hourlyRateGroupBySaleItem[saleItemId];
        if (existingHourlyRates === undefined || existingHourlyRates.length <= 0) {
            if (from != 0) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SHOULD_BEGIN_FROM_ZERO, "The first rule should begin from 0 min!");
                return;
            }
        }
                
        if (util.isValidVariable(fixPrice) && (util.isValidVariable(price) || util.isValidVariable(step))) {
            uiBaseObj.alert(systemLanguage.msgCodeList.FIX_PRICE_USE_INCORRECT, "Fix price and price can not be used in the same time!");
            return;
        }
        
        if (!util.isValidVariable(fixPrice) && !util.isValidVariable(price) && !util.isValidVariable(step)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PRICE, "Need a price!");
            return;
        }
        
        if (util.isValidVariable(step)) {
            step = parseInt(step);
        }
        
        if (!util.isValidVariable(entryId)) {
            hourlyRate.action = uiBaseObj.ADD;
        } else {
            hourlyRate.action = uiBaseObj.UPDATE;
        }
        
        var soapType = new SaveHourlyRateType(entryId, from, to, step, price, fixPrice, saleItemId);
        callWebService(soapType, hourlyRate.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savehourlyrateresponsetype)) {
            if(hourlyRate.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(hourlyRate.action = uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            hourlyRate.listAllElements();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Hourly Rate!", jsonObj.savehourlyrateresponsetype.result);
        }
    },
    clearBackgroundColor : function () {
        $("#hourly-rate-rule-detail-show-panel>.ui-grid-a").removeClass("background-color-238");
    },
    addBackgroundColor : function (id) {
        $("#" + id).addClass("background-color-238");
    },
    clearRowHighlight : function () {
        var table = document.getElementById("hourlyRateTable");
        for (var i = 0; i < table.rows.length; i++) {
            var row = table.rows[i];
            uiBaseObj.highlightRow(row, false);
        }    
    },
    displayHint : function (isDisplay) {
        var hint = '<h2 id="hint-fare-information" style="margin-top:25%;" class="text-center"><b>Fare Information</b></h2>';
        if (isDisplay) {
            $("#hourly-rate-rule-detail-show-panel").empty();
            $("#hourly-rate-rule-detail-show-panel").append(hint).trigger("create");
        }
    }
};