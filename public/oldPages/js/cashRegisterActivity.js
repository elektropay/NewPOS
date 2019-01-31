var cashRegisterActivityPageObj = {
    init : function() {
        customTransaction.init();
        cashRegisterActivity.init();
        tipOutSetupObj.init();
        uiBaseObj.addDeleteConfirmDialog("cashRegisterActivityPage", "deleteRegisterActivityConfirmationDialog", "Register Activity", "cashRegisterActivity.deleteEntry();");
    }
};

var customTransaction = {
    entryList: [],
    entryListByElementId: {},
    staffListById: {},
    cashDrawerListById: {},
    transactionType: "PAID_OUT",
    currentEntryId: null,
    init: function () {
        var currentUser = biscuit.u();
        if (!util.isValidVariable(currentUser) || !biscuitHelper.hasPermission(currentUser, "ADMIN_PAID_OUT")) {
            $('#tabList').find('#navbar-paidOutTransactionTab').remove();
            $('#tabList').navbar();
            $("#paidOutTransactionTab").remove();
            return;
        }
        var todayDate = converter.getTodayDate();
        $("#fromDatePicker0").val(todayDate);
        $("#toDatePicker0").val(todayDate);
        $('input:radio[name=paidToType-radio-choice]').change(function(){
            if (this.value == 'STAFF') {
                $("#paid-to-staff-select-div").show();
                $("#paid-to-other-input-div").hide();
            } else {
                $("#paid-to-staff-select-div").hide();
                $("#paid-to-other-input-div").show();
            }
        });
        $('#showVoidedPayments').prop('checked', false).checkboxradio('refresh');
        $('#showVoidedPayments').change(function() {
            customTransaction.filterEntries();
        });
        $('#staff-filter-list').change(function() {
            customTransaction.filterEntries();
        });
        customTransaction.loadAllStaff();
        customTransaction.loadAllCashDrawers();
    },
    fetchEntries: function () {
        var fromDate = $("#fromDatePicker0").val();
        var toDate = $("#toDatePicker0").val();
        if (fromDate && toDate) {
            var soapType = new FindCustomTransactionsType(null, fromDate, toDate);
            callWebService(soapType, customTransaction.fetchEntriesHandler);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_FROM_TO_DATE, "FromDate and ToDate not selected!");
        }
    },
    fetchEntriesHandler: function (response) {
        var tableId = "customTransactionTable";
        customTransaction.removeAllRows(tableId);
        customTransaction.entryList = [];
        customTransaction.entryListByElementId = {};
        if (util.isSuccessfulResponse(response.findcustomtransactionsresponsetype)) {
            customTransaction.entryList = util.getElementsArray(response.findcustomtransactionsresponsetype.customtransactions);
            for (var i = 0; i < customTransaction.entryList.length; i++) {
                var entry = customTransaction.entryList[i];
                var elementId = "row_" + i;
                var rowHTML = customTransaction.getEntryRowHTML(elementId, entry);
                $("#" + tableId + " tr:last").after(rowHTML);
                customTransaction.entryListByElementId[elementId] = entry;
            }
            $("#" + tableId + " .craRowCell").click(function () {
                customTransaction.selectEntry($(this).closest("tr"));
            });
            customTransaction.filterEntries();
        }
    },
    removeAllRows : function (tableId) {
        $("#" + tableId + " tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    },
    filterEntries: function () {
        var paidToStaffIdFilter = $("#staff-filter-list").val();
        showVoidedPayments = $("#showVoidedPayments").prop('checked');
        $("#customTransactionTable .craRow").each(function() {
            var shouldBeFiltered = customTransaction.shouldBeFiltered($(this), paidToStaffIdFilter, showVoidedPayments);
            if (shouldBeFiltered) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    },
    shouldBeFiltered : function (element, paidToStaffId, showVoidedPayments) {
        var rowStaffId = element.find("td.cra-tostaff").data("tostaffid");
        if (paidToStaffId !== "" && rowStaffId != paidToStaffId) {
            return true;
        }
        var voided = element.find("td.cra-voided").data("voided");
        if (!showVoidedPayments && voided) {
            return true;
        }
        return false;
    },
    getEntryRowHTML: function (elementId, jsonObj) {
        var toStaffId = -1;
        var paidTo;
        if (util.isValidVariable(jsonObj.tostaffid)) {
            var toStaff = customTransaction.staffListById[jsonObj.tostaffid];
            toStaffId = toStaff.id;
            paidTo = toStaff.name;
        } else {
            paidTo = jsonObj.to;
        }

        var cashDrawer = customTransaction.cashDrawerListById[jsonObj.fromcashdrawerid];
        var authorizedByStaff = customTransaction.staffListById[jsonObj.authorizedby];
        var cashDrawerName = "";
        var authorizedByStaffName = "";
        if(cashDrawer != null) {
            cashDrawerName = util.getStringValue(cashDrawer.name);
        }
        if(authorizedByStaff != null) {
            authorizedByStaffName = util.getStringValue(authorizedByStaff.name);
        }
        return "<tr id='" + elementId + "' class='craRow'>" +
            "<td class='craRowCell cra-tostaff' data-tostaffid='" + toStaffId + "'>" + util.getStringValue(paidTo) + "</td>" +
            "<td class='craRowCell cra-transactdate'>" + util.getStringValue(jsonObj.transactiondate) + "</td>" +
            "<td class='craRowCell cra-amount'>" + util.getStringValue(jsonObj.amount) + "</td>" +
            "<td class='craRowCell cra-authorizedby' data-authorizedbystaffid='" + jsonObj.authorizedby + "'>" + authorizedByStaffName + "</td>" +
            "<td class='craRowCell cra-cashdrawer' data-cashdrawerid='" + jsonObj.fromcashdrawerid + "'>" + cashDrawerName + "</td>" +
            "<td class='craRowCell cra-voided' data-voided='" + jsonObj.voided + "'>" + (util.isBooleanTrue(jsonObj.voided) ? "Y" : "N") + "</td>" +
            "<td class='delete-icon-td'><a href=\"javascript:customTransaction.printCustomTransactionRecord('" + elementId + "');\"><img src=\"css\\images\\print_icon&30.png\"/></a></td></tr>";
    },
    printCustomTransactionRecord: function (rowElementId) {
        var customTransactionRecord = this.entryListByElementId[rowElementId];
        this.currentEntryId = customTransactionRecord.id;
        //PrintReceiptType
        ////var userAuth = admin.getUserAuthInfo();
        var soapType = new PrintReceiptType(null, null, customTransactionRecord.id);
        callWebService(soapType, this.printCustomTransactionRecordHandler);
    },
    printCustomTransactionRecordHandler: function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.printreceiptresponsetype)) {
            uiBaseObj.alertMsg("Print successfully!");
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.PRINT_FAILED, "Print failed!", jsonObj.printreceiptresponsetype.result);
        }
    },
    openDeletePanel: function (rowElementId) {
        var entry = customTransaction.entryListByElementId[rowElementId];
        customTransaction.currentEntryId = entry.id;
        $('#deleteConfirmationDialog').popup('open');
    },
    selectEntry: function (tblRowObj) {
        customTransaction.currentEntryId = $(tblRowObj).attr("id");
        var entry = customTransaction.entryListByElementId[customTransaction.currentEntryId];
        var paidToStaffCell = $(tblRowObj).find("td.cra-tostaff");
        var authorizedByStaffCell = $(tblRowObj).find("td.cra-authorizedby");
        var cashDrawerCell = $(tblRowObj).find("td.cra-cashdrawer");
        var transactionDate = $(tblRowObj).find('td.cra-transactdate').text();
        var amount = $(tblRowObj).find('td.cra-amount').text();
        var toStaffId = paidToStaffCell.data('tostaffid');
        var authorizedByStaffId = authorizedByStaffCell.data('authorizedbystaffid');
        var cashDrawerId = cashDrawerCell.data('cashdrawerid');
        var paidToType = toStaffId != "-1" ? 'STAFF' : 'OTHER';
        var paidTo = "";

        if (paidToType == 'STAFF') {
            $("#paid-to-staff-select-div").show();
            $("#paid-to-other-input-div").hide();
        } else {
            $("#paid-to-staff-select-div").hide();
            $("#paid-to-other-input-div").show();
            paidTo = paidToStaffCell.text();
        }

        $("#paid-to-select-list").val(toStaffId).selectmenu("refresh");
        $("#authorized-by-select-list").val(authorizedByStaffId).selectmenu("refresh");
        $("#cash-drawer-select-list").val(cashDrawerId).selectmenu("refresh");
        $("#transactDatetimePicker").val(transactionDate.replace(" ", "T"));
        $("#amount").val(amount);
        $("#paidTo").val(paidTo);
        $("#description").val(util.getStringValue(entry.description));
        $("#voided").prop('checked', util.isBooleanTrue(entry.voided)).checkboxradio("refresh");
        customTransaction.currentEntryId = entry.id;
        var disableElements = util.isBooleanTrue(entry.voided);
        $("#amount").prop("readOnly", disableElements);
        $("#paidTo").prop("readOnly", disableElements);
        $("#paid-to-select-list").prop("disabled", disableElements);
        $("#cash-drawer-select-list").prop("disabled", disableElements);
        $("#authorized-by-select-list").prop("disabled", disableElements);
        $("#transactDatetimePicker").prop("readOnly", disableElements);
        $('#editCustomTransactionDetailPopup').popup('open');
    },
    newEntry: function () {
        customTransaction.clearEntryDetails();
        $('#editCustomTransactionDetailPopup').popup('open');
    },
    clearEntryDetails: function () {
        $("#paid-to-select-list").val('-1').selectmenu("refresh");
        $("#authorized-by-select-list").val('').selectmenu("refresh");
        $("#cash-drawer-select-list").val('').selectmenu("refresh");
        $("#transactDatetimePicker").val('');
        $("#toDatetimePicker").val('');
        $("#amount").val('');
        $("#paidTo").val('');
        $("#description").val('');
        $("#message").html("");
        $("#voided").prop('checked', false).checkboxradio("refresh");
        customTransaction.currentEntryId = null;
        uiBaseObj.resetAllAlertDivs();
    },
    formatJsDate : function(jsDate) {
        return jsDate.replace("T", " ") + ":00";
    },
    saveEntry: function () {
        var paidToStaffId = -1;
        var paidTo = "";
        var authorizedByStaffId = $("#authorized-by-select-list").val();
        var fromCashDrawerId = $("#cash-drawer-select-list").val();
        var transactionDate = $("#transactDatetimePicker").val();
        var amount = $("#amount").val();
        var description = $("#description").val();
        var voided = $("#voided").prop('checked');
        var id = customTransaction.currentEntryId;
        var paidToType = $('input:radio[name=paidToType-radio-choice]:checked').val();
        if (paidToType == 'STAFF') {
            paidToStaffId = $("#paid-to-select-list").val();
        } else {
            paidTo = $("#paidTo").val();
        }

        uiBaseObj.resetAllAlertDivs();
        if (authorizedByStaffId === '') {
            $("#editCustomTransactionDetailPopup").effect("shake");
            $("#message").html("Please select staff member!");
            return;
        }

        if (!transactionDate) {
            $("#editCustomTransactionDetailPopup").effect("shake");
            $("#message").html("Please select transaction date!");
            return;
        }

        var transactionDateStr = customTransaction.formatJsDate(transactionDate);
        var soapType = new SaveCustomTransactionType(id, null, fromCashDrawerId, null, paidToStaffId, null, paidTo, customTransaction.transactionType, amount, description, voided, authorizedByStaffId, transactionDateStr);
        callWebService(soapType, customTransaction.saveEntryHandler);
    },
    refreshWithoutChanges: function () {
        $('#editCustomTransactionDetailPopup').popup('close');
        customTransaction.clearEntryDetails();
    },
    saveEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.savecustomtransactionresponsetype)) {
            customTransaction.fetchEntries();
            $('#editCustomTransactionDetailPopup').popup('close');
        } else {
            $("#editCustomTransactionDetailPopup").effect("shake");
            $("#message").html("Failed to add transaction!");
        }
    },
    loadAllStaff: function () {
        var soapType = new ListStaffType();
        callWebService(soapType, customTransaction.loadAllStaffHandler);
    },
    loadAllStaffHandler: function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.liststaffresponsetype)) {
            var staffList = util.getElementsArray(jsonObj.liststaffresponsetype.staff);
            var staffFilterElement = $("#staff-filter-list");
            var authorizedByStaffSelectDropDownElement = $("#authorized-by-select-list");
            var paidToStaffSelectDropDownElement = $("#paid-to-select-list");
            customTransaction.staffListById = {};
            staffFilterElement.find('option').remove();
            staffFilterElement.append("<option value=''>All</option>").trigger("create");
            authorizedByStaffSelectDropDownElement.find('option').remove();
            paidToStaffSelectDropDownElement.find('option').remove();
            paidToStaffSelectDropDownElement.append("<option value='-1'>  </option>").trigger("create");
            for (var i = 0; i < staffList.length; i++) {
                var staff = staffList[i];
                staffFilterElement.append("<option value='" + staff.id + "'>" + staff.name + "</option>").trigger("create");
                authorizedByStaffSelectDropDownElement.append("<option value='" + staff.id + "'>" + staff.name + "</option>").trigger("create");
                paidToStaffSelectDropDownElement.append("<option value='" + staff.id + "'>" + staff.name + "</option>").trigger("create");
                customTransaction.staffListById[staff.id] = staff;
            }
        }
    },
    loadAllCashDrawers: function () {
        var soapType = new FindDevicesType(null, "CASH_DRAWER");
        callWebService(soapType, customTransaction.loadAllCashDrawersHandler);
    },
    loadAllCashDrawersHandler: function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finddevicesresponsetype)) {
            var cashDrawerList = util.getElementsArray(jsonObj.finddevicesresponsetype.devices);
            var cashDrawerSelectListElement = $("#cash-drawer-select-list");
            cashDrawerSelectListElement.find('option').remove();
            for (var i = 0; i < cashDrawerList.length; i++) {
                var cashDrawer = cashDrawerList[i];
                cashDrawerSelectListElement.append("<option value='" + cashDrawer.id + "'>" + cashDrawer.name + "</option>").trigger("create");
                customTransaction.cashDrawerListById[cashDrawer.id] = cashDrawer;
            }
        }
    }
};

var cashRegisterActivity = {
    entryList: [],
    entryListByElementId: {},
    staffListById: {},
    cashDrawerListById: {},
    currentEntryId: null,
    init: function () {
        var currentUser = biscuit.u();
        if (!util.isValidVariable(currentUser) || !biscuitHelper.hasPermission(currentUser, "ADMIN_CASHIER_INOUT")) {
            $('#tabList').find('#navbar-cashRegisterActivityTab').remove();
            $('#tabList').navbar();
            $("#cashRegisterActivityTab").remove();
            return;
        }
        if (!util.isValidVariable(currentUser) || !biscuitHelper.hasPermission(currentUser, "ADMIN_PAID_OUT")) {
            $('#cashRegisterActivityTab').css("display", "block");
        }
        var todayDate = converter.getTodayDate();
        var tomorrowDate = converter.getTomorrowDate();
        $("#fromDatePicker1").val(todayDate);
        $("#toDatePicker1").val(tomorrowDate);
        $('#staff-filter-list1').change(function() {
            cashRegisterActivity.filterEntries();
        });
        cashRegisterActivity.loadAllStaff();
        cashRegisterActivity.loadAllCashDrawers();
    },
    fetchEntries: function () {
        var fromDate = $("#fromDatePicker1").val();
        var toDate = $("#toDatePicker1").val();
        if (fromDate && toDate) {
            var soapType = new FindCashRegisterActivitiesType(null, fromDate, toDate);
            callWebService(soapType, cashRegisterActivity.fetchEntriesHandler);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_FROM_TO_DATE, "FromDate and ToDate not selected!");
        }
    },
    fetchEntriesHandler: function (response) {
        var tableId = "cashRegisterActivityTable";
        cashRegisterActivity.removeAllRows(tableId);
        cashRegisterActivity.entryList = [];
        cashRegisterActivity.entryListByElementId = {};
        if (util.isSuccessfulResponse(response.findcashregisteractivitiesresponsetype)) {
            cashRegisterActivity.entryList = util.getElementsArray(response.findcashregisteractivitiesresponsetype.cashregisteractivities);
            for (var i = 0; i < cashRegisterActivity.entryList.length; i++) {
                var entry = cashRegisterActivity.entryList[i];
                var elementId = "row_" + i;
                var rowHTML = cashRegisterActivity.getEntryRowHTML(elementId, entry);
                $("#" + tableId + " tr:last").after(rowHTML);
                cashRegisterActivity.entryListByElementId[elementId] = entry;
            }
            $("#" + tableId + " .cioRowCell").click(function () {
                cashRegisterActivity.selectEntry($(this).closest("tr"));
            });
            cashRegisterActivity.filterEntries();
        }
    },
    removeAllRows : function (tableId) {
        $("#" + tableId + " tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    },
    filterEntries: function () {
        var staffIdFilter = $("#staff-filter-list1").val();
        $("#cashRegisterActivityTable .cioRow").each(function() {
            var shouldBeFiltered = cashRegisterActivity.shouldBeFiltered($(this), staffIdFilter);
            if (shouldBeFiltered) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    },
    shouldBeFiltered : function (element, staffId) {
        var rowStaffId = element.find("td.cio-staff").data("staffid");
        if (staffId !== "" && rowStaffId != staffId) {
            return true;
        }
        return false;
    },
    getEntryRowHTML: function (elementId, jsonObj) {
        var staff = cashRegisterActivity.staffListById[jsonObj.staffid];
        var cashDrawer = cashRegisterActivity.cashDrawerListById[jsonObj.cashdrawerid];
        return "<tr id='" + elementId + "' class='cioRow'>" +
            "<td class='cioRowCell cio-staff' data-staffid='" + staff.id + "'>" + util.getStringValue(staff.name) + "</td>" +
            "<td class='cioRowCell cio-cashdrawer' data-cashdrawerid='" + cashDrawer.id + "'>" + util.getStringValue(cashDrawer.name) + "</td>" +
            "<td class='cioRowCell cio-inAmount'>" + util.getStringValue(jsonObj.inamount) + "</td>" +
            "<td class='cioRowCell cio-outAmount'>" + util.getStringValue(jsonObj.outamount) + "</td>" +
            "<td class='cioRowCell cio-fromDate'>" + util.getStringValue(jsonObj.starttime) + "</td>" +
            "<td class='cioRowCell cio-toDate'>" + util.getStringValue(jsonObj.endtime) + "</td>" +
            "<td class=\"delete-icon-td\"><a href=\"javascript:cashRegisterActivity.openDeletePanel('" + elementId + "');\"><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>" +
            "</tr>";
    },
    openDeletePanel: function (rowElementId) {
        var entry = cashRegisterActivity.entryListByElementId[rowElementId];
        cashRegisterActivity.currentEntryId = entry.id;
        $('#deleteRegisterActivityConfirmationDialog').popup('open');
    },
    deleteEntry: function () {
        $('#deleteRegisterActivityConfirmationDialog').popup('close');
        if (cashRegisterActivity.currentEntryId != null) {
            var soapType = new DeleteCashRegisterActivityType(cashRegisterActivity.currentEntryId);
            callWebService(soapType, cashRegisterActivity.deleteEntryHandler);
        }
        cashRegisterActivity.currentEntryId = null;
    },
    deleteEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.deletecashregisteractivityresponsetype)) {
            cashRegisterActivity.fetchEntries();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete transaction", response.deleteattendanceresponsetype.result);
        }
    },
    selectEntry: function (tblRowObj) {
        cashRegisterActivity.currentEntryId = $(tblRowObj).attr("id");
        var entry = cashRegisterActivity.entryListByElementId[cashRegisterActivity.currentEntryId];
        $("#staff-select-list").val(entry.staffid).selectmenu("refresh");
        $("#cash-drawer1-select-list").val(entry.cashdrawerid).selectmenu("refresh");
        $("#fromDatetimePicker").val(util.getStringValue(entry.starttime).replace(" ", "T"));
        $("#toDatetimePicker").val(util.getStringValue(entry.endtime).replace(" ", "T"));
        $("#inAmount").val(util.getStringValue(entry.inamount));
        $("#outAmount").val(util.getStringValue(entry.outamount));
        $("#expectedOutAmount").val(util.getStringValue(entry.expectedoutamount));
        $("#discrepancyReason").val(util.getStringValue(entry.discrepancyreason));
        cashRegisterActivity.currentEntryId = entry.id;
        $('#editCashRegisterActivityDetailPopup').popup('open');
    },
    newEntry: function () {
        cashRegisterActivity.clearEntryDetails();
        $('#editCashRegisterActivityDetailPopup').popup('open');
    },
    clearEntryDetails: function () {
        $("#staff-select-list").val('').selectmenu("refresh");
        $("#cash-drawer1-select-list").val('').selectmenu("refresh");
        $("#fromDatetimePicker").val('');
        $("#toDatetimePicker").val('');
        $("#inAmount").val('');
        $("#outAmount").val('');
        $("#expectedOutAmount").val('');
        $("#discrepancyReason").val('');
        $("#message1").html("");
        cashRegisterActivity.currentEntryId = null;
        uiBaseObj.resetAllAlertDivs();
    },
    formatJsDate : function(jsDate) {
        return jsDate.replace("T", " ") + ":00";
    },
    saveEntry: function () {
        var id = cashRegisterActivity.currentEntryId;
        var staffId = $("#staff-select-list").val();
        var cashDrawerId = $("#cash-drawer1-select-list").val();
        var from = $("#fromDatetimePicker").val();
        var to = $("#toDatetimePicker").val();
        var inAmount = $("#inAmount").val();
        var outAmount = $("#outAmount").val();
        var discrepancyReason = $("#discrepancyReason").val();

        uiBaseObj.resetAllAlertDivs();
        if (staffId === '' || staffId == null) {
            $("#editCashRegisterActivityDetailPopup").effect("shake");
            $("#message1").html("Please select staff member!");
            return;
        }

        if (cashDrawerId === '' || cashDrawerId == null) {
            $("#editCashRegisterActivityDetailPopup").effect("shake");
            $("#message1").html("Cash Drawer cannot be empty!");
            return;
        }

        var fromDateStr = cashRegisterActivity.formatJsDate(from);
        var toDateStr = cashRegisterActivity.formatJsDate(to);
        var soapType = new SaveCashRegisterActivityType(id, staffId, cashDrawerId, fromDateStr, toDateStr, inAmount, outAmount, null, discrepancyReason);
        callWebService(soapType, cashRegisterActivity.saveEntryHandler);
    },
    refreshWithoutChanges: function () {
        $('#editCashRegisterActivityDetailPopup').popup('close');
        cashRegisterActivity.clearEntryDetails();
    },
    saveEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.savecashregisteractivityresponsetype)) {
            cashRegisterActivity.fetchEntries();
            $('#editCashRegisterActivityDetailPopup').popup('close');
        } else {
            $("#editCashRegisterActivityDetailPopup").effect("shake");
            $("#message1").html("Failed to add transaction!");
        }
    },
    loadAllStaff: function () {
        var soapType = new ListStaffType();
        callWebService(soapType, cashRegisterActivity.loadAllStaffHandler);
    },
    loadAllStaffHandler: function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.liststaffresponsetype)) {
            var staffList = util.getElementsArray(jsonObj.liststaffresponsetype.staff);
            var staffFilterElement = $("#staff-filter-list1");
            var staffSelectDropDownElement = $("#staff-select-list");
            cashRegisterActivity.staffListById = {};
            staffFilterElement.find('option').remove();
            staffFilterElement.append("<option value=''>All</option>").trigger("create");
            staffSelectDropDownElement.find('option').remove();
            staffSelectDropDownElement.append("<option value=''>  </option>").trigger("create");
            for (var i = 0; i < staffList.length; i++) {
                var staff = staffList[i];
                staffFilterElement.append("<option value='" + staff.id + "'>" + staff.name + "</option>").trigger("create");
                staffSelectDropDownElement.append("<option value='" + staff.id + "'>" + staff.name + "</option>").trigger("create");
                cashRegisterActivity.staffListById[staff.id] = staff;
            }
        }
    },
    loadAllCashDrawers: function () {
        var soapType = new FindDevicesType(null, "CASH_DRAWER");
        callWebService(soapType, cashRegisterActivity.loadAllCashDrawersHandler);
    },
    loadAllCashDrawersHandler: function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finddevicesresponsetype)) {
            var cashDrawerList = util.getElementsArray(jsonObj.finddevicesresponsetype.devices);
            var cashDrawerSelectListElement = $("#cash-drawer1-select-list");
            cashDrawerSelectListElement.find('option').remove();
            for (var i = 0; i < cashDrawerList.length; i++) {
                var cashDrawer = cashDrawerList[i];
                cashDrawerSelectListElement.append("<option value='" + cashDrawer.id + "'>" + cashDrawer.name + "</option>").trigger("create");
                cashRegisterActivity.cashDrawerListById[cashDrawer.id] = cashDrawer;
            }
        }
    }
};
var tipOutSetupObj = {
    currentEntryId: null,
    menuList: [],
    areaList:[],
    roleList : [],
    elementList : [],
    tipOutSettingList: [],
    roleTipOutDistributionDTOs:[],
    tipOutSetting:null,
    init : function() {
        tipOutSetupObj.listOrderType();
        tipOutSetupObj.listAllRoles();
        tipOutSetupObj.listSeatingAreas();
        tipOutSetupObj.listMenuGroups('menuList',false);
        tipOutSetupObj.listEntry();
        uiBaseObj.addDeleteConfirmDialog("cashRegisterActivityPage", "deleteTipOutSettingConfirmationDialog", "Tip Out Setting", "tipOutSetupObj.deleteEntry();");
    },
    checkPercentage:function(thiz){
        //1正则表达式验证是否合理（大于等于0的整数或小数）
        if(thiz.value != null && thiz.value != ''){
            var reg = /^\d+(\.\d{1,2})?$/;
            if(!reg.test(thiz.value)){
                $("#messageTipOut").html("The percentage distributions can only be greater than or equal to 0. ");
                thiz.value = '';
                return;
            }
            var percentage = $("input[name='percentage']");
            var percentageTotal=0;
            for(var i in percentage){
                var val = percentage[i].value;
                if('undefined' != typeof(val) && null != val && '' != val){
                    percentageTotal+=parseFloat(val);
                }
            }
            if(percentageTotal > 100){
                $("#messageTipOut").html("The percentage distributions sum of each proportion should not exceed 100.");
                thiz.value = '';
                return;
            }
        }
    },
    validatepd:function(){
        var reg = /^\d+(\.\d{1,2})?$/;
        var percentage = $("input[name='percentage']");
        var percentageTotal=0;
        for(var i in percentage){
            var val = percentage[i].value;
            if('undefined' != typeof(val) && null != val && '' != val){
                if(!reg.test(val)){
                    $("#messageTipOut").html("The percentage distributions can only be greater than or equal to 0. ");
                    percentage[i].focus();
                    return false;
                }else{
                    $("#messageTipOut").html("");
                }
                percentageTotal+=parseFloat(val);
            }
        }
        if(percentageTotal > 100){
            $("#messageTipOut").html("The percentage distributions sum of each proportion should not exceed 100.");
            return false;
        }else{
            $("#messageTipOut").html("");
        }
        return true;
    },
    clearEntryDetails : function() {
        $('#tipOutName').val('');
        $('#totalPercentage').val('');
        $('#menuList1').val('');
        $('#menuList11').val('');
        $('#groupList1').val('');
        $('#groupList11').val('');
        $('#currentEntryId').val('');
        $("#messageTipOut").html("");
        tipOutSetupObj.currentEntryId = null;
        tipOutSetupObj.roleTipOutDistributionDTOs = [];
    },

    newEntry : function(id) {
        tipOutSetupObj.clearEntryDetails();
        $('#menuList1').empty();
        $('#groupList11').empty();
        $('#menuList1').selectmenu('refresh');
        $('#groupList1').selectmenu('refresh');
        //处理角色列表（roles）
        tipOutSetupObj.listAllRoles('saveOrupdate');
        if(null != id){
            //则处理编辑界面数据
            for(var i in tipOutSettingList){
                var tipOutSetting = tipOutSettingList[i];
                tipOutSetting = tipOutSetting;
                if(tipOutSetting.id == id){
                    tipOutSetupObj.getDetail(tipOutSetting);
                    break;
                }
            }
            $("#deleteBtn").show();
        }else{
            $('#groupList1').empty();
            $("#orderTypeList1 option:first").prop("selected", 'selected');

            //筛选出menuGroup联动
            $('#menuList1').selectmenu('refresh');
            tipOutSetupObj.listMenuGroups('menuList1', true);
            $('#groupList1').append("<option value=''>All Groups</option>");
            $('#orderTypeList1').selectmenu('refresh');
            $('#groupList1').selectmenu('refresh');
            tipOutSetupObj.typeOrMenuGroup($('#orderTypeList1'));
            $("#deleteBtn").hide();
        }
        tipOutSetupObj.changePer();
        setTimeout(function() {
            $('#editTipOutPopup').popup('open');
        }, 100);
    },
    changePer:function(){
        var currentEntryId = $('#currentEntryId').val();
        var calcTipOutBasingOn  = $('#calcTipOutBasingOn').val();
        var orderTypeList1Value = $('#orderTypeList1').val();
        if(calcTipOutBasingOn == 'GRATUITY' && orderTypeList1Value == 'ORDER_TYPE'){
            $('#totalPercentage').attr("disabled","disabled");
            $("#totalPercentage").attr("class","disabledClass")
            $("#totalPercentage").css("background","#e9e9e9");
        }else{
            $('#totalPercentage').attr("disabled",false)
            $("#totalPercentage").css("background","#fff");
        }
    },
    refreshTipOutTable:function(){
        tipOutSetupObj.clearGrayDisplay();
        $('#editTipOutPopup').popup('close');
    },
    getDetail:function(tipOutSetting){
        //设置值
        $('#orderTypeList1').val(tipOutSetting.type);//设置Type
        $('#currentEntryId').val(tipOutSetting.id);//设置currentEntryId
        $('#tipOutName').val(tipOutSetting.name);//设置名称
        $('#menuList1').val(tipOutSetting.menuIdOrOrderTypeId);//设置Menus
        $('#menuList11').val(tipOutSetting.menuIdOrOrderTypeId);
        $('#groupList1').val(tipOutSetting.groupIdOrAreaId);//设置Area 或group
        $('#groupList11').val(tipOutSetting.groupIdOrAreaId);
        $('#totalPercentage').val(tipOutSetting.percentage);//设置总百分比
        var orderTypeList1Val =  tipOutSetting.type;
        if(orderTypeList1Val == 'ORDER_TYPE'){
            //筛选出列表中OrderTypeList集合
            tipOutSetupObj.listOrderType('ORDER_TYPE');
        }
        if(orderTypeList1Val=='MENU_GROUP'){
            //筛选出menuGroup联动
            tipOutSetupObj.listMenuGroups('menuList1');
        }

        $('#orderTypeList1').selectmenu('refresh');
        //处理子项集合数据
        tipOutSetupObj.roleTipOutDistributionDTOs = tipOutSetting.roleTipOutDistributionDTOs;
        tipOutSetupObj.listAllRoles("saveOrupdate");
    },
    save : function() {
        if ($.trim($('#tipOutName').val() )== '' || $.trim($('#tipOutName').val()) == null) {
            $("#editTipOutPopup").effect("shake");
            $('#tipOutName').focus();
            $("#messageTipOut").html("Name can not be empty");
            return;
        }else{
            $("#messageTipOut").html("");
        }
        if ($('#orderTypeList1').val() == '' || $('#orderTypeList1').val() == null) {
            $("#editTipOutPopup").effect("shake");
            $("#messageTipOut").html("Please select type");
            return;
        }else{
            $("#messageTipOut").html("");
        }
        var groupList1 = $('#groupList1').val();
        var menuList1=$('#menuList1').val();
        if($('#orderTypeList1').val() == 'MENU_GROUP' && (!util.isValidVariable(groupList1)||!util.isValidVariable(menuList1))){
            $("#editTipOutPopup").effect("shake");
            $("#messageTipOut").html("Menu and Group must choose one");
            return;
        }else {
            $("#messageTipOut").html("");
        }
        if($('#orderTypeList1').val() == 'ORDER_TYPE' && !util.isValidVariable(menuList1)){
            $("#editTipOutPopup").effect("shake");
            $("#messageTipOut").html("Order Type and Area must choose one");
            return;
        }else {
            $("#messageTipOut").html("");
        }
        var menuList1Text =  $("#menuList1").find("option:selected").text();
        if($('#orderTypeList1').val() == 'ORDER_TYPE' && menuList1Text == "DINE_IN" && !util.isValidVariable(groupList1)){
            $("#editTipOutPopup").effect("shake");
            $("#messageTipOut").html("Order Type and Area must choose one");
            return;
        }else {
            $("#messageTipOut").html("");
        }
        if (!$.isNumeric($('#totalPercentage').val()) && !($('#calcTipOutBasingOn').val() == 'GRATUITY' && $('#orderTypeList1').val() == 'ORDER_TYPE')) {
            $("#editTipOutPopup").effect("shake");
            $('#editTipOutPopup').focus();
            $("#messageTipOut").html("Please enter a valid total percentage");
            return;
        }else{
            if($('#totalPercentage').val() < 100 && $('#totalPercentage').val() > 0){
                $("#messageTipOut").html("");
            }else if(!($('#calcTipOutBasingOn').val() == 'GRATUITY' && $('#orderTypeList1').val() == 'ORDER_TYPE')){
                $("#editTipOutPopup").effect("shake");
                $('#totalPercentage').focus();
                $("#messageTipOut").html("Total percentage must be greater than 0 and less than 100.");
                return;
            }
        }
        //组装集合（rolse and percentage）
        var percentage = $("input[name='percentage']");
        var roleId = $("input[name='roleId']");
        var roleTipOutDistributionId = $("input[name='roleTipOutDistributionId']");
        var jsons="";
        for(var i in percentage){
            var val = percentage[i].value;
            if('undefined' != typeof(val) && null != val && '' != val){
                if(roleTipOutDistributionId[i].value != null && '' != roleTipOutDistributionId[i].value){
                    jsons+="{id:"+roleTipOutDistributionId[i].value+",roleId:"+roleId[i].value+",percentageDistribution:"+val+"},";
                }else{
                    jsons+="{roleId:"+roleId[i].value+",percentageDistribution:"+val+"},";
                }

            }
        }
        if(tipOutSetupObj.validatepd() == false){
            return;
        }
        if(jsons==""){
            $("#editTipOutPopup").effect("shake");
            $("#messageTipOut").html("Please set at least one role's percentage");
            return;
        }else{
            $("#messageTipOut").html("");
        }
        jsons = "["+jsons.substring(0,jsons.length-1)+"]";
        jsons = eval(jsons);
        data = {
            id : $('#currentEntryId').val(),
            name : $('#tipOutName').val(),
            type : $('#orderTypeList1').val(),
            menuIdOrOrderTypeId:menuList1,
            groupIdOrAreaId:groupList1,
            percentage : $('#totalPercentage').val(),
            createdBy : biscuit.u().userid,
            updatedBy : biscuit.u().userid,
            roleTipOutDistributionDTOs:jsons
        }

        $.ajax({
            url: "/kpos/webapp/admin/tipoutsetting",
            type: "POST",
            cache: false,
            timeout: 60000,
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function(result, status, xhr) {
                if (result.tipOut != null) {
                    tipOutSetupObj.listEntry();
                    $('#editTipOutPopup').popup('close');
                    // uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
                } else {
                    $("#editTipOutPopup").effect("shake");
                    // uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to save tip out setting");
                    $("#messageTipOut").html("Failed to save tip out setting!");
                }
            },
            beforeSend: function(xhr) {
                // $('#editTipOutPopup').popup('close');
            },
            error: function (xhr, status, error) {
                $("#editTipOutPopup").effect("shake");
                $("#messageTipOut").html(xhr.responseJSON.error.msg);
                console.log("Error occur when add tip out setting. " + error);
            }
        });
    },
    deleteEntry : function() {
        if (undefined != $('#currentEntryId').val() &&  null != $('#currentEntryId').val() && "" != $('#currentEntryId').val()) {
            $.ajax({
                url: "/kpos/webapp/admin/tipoutsetting/" + $('#currentEntryId').val(),
                type: "DELETE",
                cache: false,
                timeout: 60000,
                dataType: 'json',
                contentType: "application/json",
                success: function(result, status, xhr) {
                    if (result.successful) {
                        $('#editTipOutPopup').popup('close');
                        tipOutSetupObj.listEntry();
                        //tipOutSetupObj.newEntry();
                        uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
                    } else {
                        uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete tip out setting");
                    }
                },
                error: function (xhr, status, error) {
                    uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete tip out setting");
                    console.log("Error occur when delete tip out setting. " + error);
                }
            });
        }
    },
    selectEntry : function(index) {
        tipOutSetupObj.clearEntryDetails();
        var tipOutSetting = tipOutSettingList[index];
        tipOutSetupObj.currentEntryId = tipOutSetting.id;

        $('#tip-pooling-option').find("option").remove();
        $('#tip-pooling-option').append("<option>Choose options</option>").trigger("create");
        if(tipOutSetting.type == 'AREA') {
            for(var i = 0; i < areaList.length; i++) {
                var area = areaList[i];
                $('#tip-pooling-option').append("<option value='" + area.id + "'>" + area.name + "</option>").trigger("create");
            }
        } else {
            for(var i = 0; i < menuList.length; i++) {
                var menu = menuList[i];
                if (menu.id == tipOutSetting.type) {
                    var menuGroupList = util.getElementsArray(menu.menuGroups);
                    if (menuGroupList != undefined && menuGroupList.length > 0) {
                        for (var j = 0; j < menuGroupList.length; j++) {
                            var menuGroup = menuGroupList[j]
                            if(menuGroup.systemGenerated==true) continue;
                            $('#tip-pooling-option').append("<option value='" + menuGroup.id + "'>" + menuGroup.name + "</option>").trigger("create");
                        }
                    }
                }
            }
        };

        setTimeout(function() {
            $('#tip-out-name').val(tipOutSetting.name);
            $("#tip-pooling-method").val(tipOutSetting.type).selectmenu('refresh');
            $('#tip-pooling-option').val(tipOutSetting.val.split(',').map(Number)).selectmenu('refresh');
            $('#tip-out-percentage').val(tipOutSetting.percentage);
        }, 100);
    },
    listEntry : function() {
        tipOutSetupObj.clearGrayDisplay();
        var menuId = $('#menuList').val();
        if(null == menuId){
            menuId = "";
        }
        $.ajax({
            url: "/kpos/webapp/admin/tipoutsetting?orderTypeId="+$('#orderTypeList').val()+"&areaId="+$('#areaList').val()+"&roleId="+$('#rolesList').val()+"&menuId="+menuId+"&menuGroupId="+$('#groupList').val(),
            type: "GET",
            cache: false,
            timeout: 60000,
            dataType: 'json',
            contentType: "application/json",
            success: function(result, status, xhr) {
                console.log('result',result);
                $('#calcTipOutBasingOn').val(result.calcTipOutBasingOn);//初始化 设置calcTipOutBasingOn值
                $('#tipoutTableTbody').empty();
                if (result.tipOutList != undefined && result.tipOutList.length != 0) {
                    tipOutSettingList = util.getElementsArray(result.tipOutList);
                    for(var i in tipOutSettingList){
                        var tipOutSetting = tipOutSettingList[i];
                        var allRoleName = util.getEmptyValueIfInvalid(tipOutSetting.allRoleName);
                        if(allRoleName.length>20){
                            allRoleName = allRoleName.substring(0,20)+"...";
                        }
                        var tipOutSettingSubList = tipOutSetting.roleTipOutDistributionDTOs;
                        var rolesListDiv = "<div id='roleD_"+i+"' style='display: none;'>";//初始化 隐藏div
                        var percentageListDiv = "<div id='percentageD_"+i+"' style='display: none;'>";//初始化 隐藏div
                        for(var j in tipOutSettingSubList){
                            var tipOutSettingSub = tipOutSettingSubList[j];
                            rolesListDiv+="<div style='border-bottom:1px solid #f5f5f5'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                                +tipOutSettingSub.roleName+"</div>";
                            percentageListDiv+="<div style='border-bottom:1px solid #f5f5f5'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                                +"*"+tipOutSettingSub.percentageDistribution+"%</div>";
                        }
                        rolesListDiv += "</div>";
                        //判断记录行是否类型 并处理其下面的数据
                        var groupOrAreaName = tipOutSetting.groupOrAreaName;
                        var menuOrOrderTypeName = tipOutSetting.menuOrOrderTypeName;
                        if(groupOrAreaName === undefined || groupOrAreaName == null){
                            groupOrAreaName = "";
                        }
                        if(menuOrOrderTypeName === undefined || menuOrOrderTypeName == null){
                            menuOrOrderTypeName = "";
                        }
                        var menuOrderArea = menuOrOrderTypeName+":"+ groupOrAreaName;

                        var $tr = $("<tr style='cursor:pointer;'>"+
                            "<td onclick='tipOutSetupObj.newEntry("+tipOutSetting.id+")'><input type='hidden' name='id' value='"+tipOutSetting.id+"'><span style='cursor:pointer;'>"+tipOutSetting.name+"</span></td>"+
                            "<td onclick='tipOutSetupObj.newEntry("+tipOutSetting.id+")'>"+tipOutSetting.type+"</td>"+
                            "<td onclick='tipOutSetupObj.newEntry("+tipOutSetting.id+")' >"+menuOrderArea+"</td>"+
                            "<td><div style='background: #f5f5f5;height: 30px;cursor:pointer;position:  relative;' onclick='tipOutSetupObj.openOrCloseDiv(this,"+i+")'>"+allRoleName+"<input type='hidden' value='' id='arrowFlag_"+i+"'>" +
                            "<span id='arrow_id"+i+"'></span>" +
                            "</div>"+rolesListDiv+"</td>"+
                            "<td><div style='background: #f5f5f5;height: 30px;'>"+tipOutSetting.percentage+"%</div>"+percentageListDiv+"</td>"+
                            "</tr>");
                        $('#tipoutTableTbody').append($tr);
                        if (util.isValidVariable(tipOutSettingSubList) && tipOutSettingSubList.length > 0){
                            $("#arrow_id"+i).addClass("close-arrow");
                            $("#arrowFlag_"+i).val("close");
                        }
                    }
                    tipOutSettingList = util.getElementsArray(result.tipOutList);
                }
            },
            error: function (xhr, status, error) {
                console.log("Error occur when trying to fetch all tip out setting. " + error);
            }
        });
    },
    openOrCloseDiv:function(thiz,i){
        var arrowFlagValue = $('#arrowFlag_'+i).val();
        console.log("arrowFlagValue",i);
        if(arrowFlagValue == 'close'){
            //则打开并赋值
            $('#roleD_'+i).show();
            $('#percentageD_'+i).show();
            $('#arrowFlag_'+i).val('open');
            $("#arrow_id"+i).removeClass("close-arrow");
            $("#arrow_id"+i).addClass("open-arrow");
        }else if(arrowFlagValue == 'open'){
            //则关闭 并赋值
            $('#roleD_'+i).hide();
            $('#percentageD_'+i).hide();
            $('#arrowFlag_'+i).val('close');
            $("#arrow_id"+i).removeClass("open-arrow");
            $("#arrow_id"+i).addClass("close-arrow");
        }
    },
    openDeletePanel: function () {
        $('#deleteTipOutSettingConfirmationDialog').popup('open');
    },
    generateSelectOptions : function() {
        $('#tip-pooling-option').find("option").remove();
        $('#tip-pooling-option').append("<option>Choose options</option>").trigger("create");

        if($('#tip-pooling-method').val() == 'AREA') {
            for(var i = 0; i < areaList.length; i++) {
                var area = areaList[i];
                $('#tip-pooling-option').append("<option value='" + area.id + "'>" + area.name + "</option>").trigger("create");
            }
        } else {
            for(var i = 0; i < menuList.length; i++) {
                var menu = menuList[i];
                if (menu.id == $('#tip-pooling-method').val()) {
                    var menuGroupList = util.getElementsArray(menu.menuGroups);
                    if (menuGroupList != undefined && menuGroupList.length > 0) {
                        for (var j = 0; j < menuGroupList.length; j++) {
                            var menuGroup = menuGroupList[j]
                            if(menuGroup.systemGenerated==true) continue;
                            $('#tip-pooling-option').append("<option value='" + menuGroup.id + "'>" + menuGroup.name + "</option>").trigger("create");
                        }
                    }
                }
            }
        }
        $('#tip-pooling-option').selectmenu('refresh');
    },
    listType:function(id){
        if(!id){
            id="orderTypeList";
        }
        $.ajax({
            url: "/kpos/webapp/menu/menus?showInactive=true&expandMenuLevel=1",
            type: "GET",
            cache: false,
            timeout: 60000,
            dataType: 'json',
            contentType: "application/json",
            success: function(result, status, xhr) {
                if (result.menus != undefined && result.menus.length != 0) {
                    menuList = util.getElementsArray(result.menus);
                    for(var i = 0; i < menuList.length; i++) {
                        var menu = menuList[i];
                        //$('#menu-selection').append("<option value='" + menu.id + "'>" + menu.name + "</option>").trigger("create");
                        $('#'+id).append("<option value='" + menu.id + "'>" + menu.name + "</option>").trigger("create");
                    }
                    var val = $('#'+id).val();
                    if(undefined != val && null != val && '' != val){
                        $('#'+id).val(val);
                    }
                    $('#'+id).selectmenu('refresh');
                }
            },
            error: function (xhr, status, error) {
                console.log("Error occur when trying to fetch all tip out setting. " + error);
            }
        });
    },
    listMenuGroups : function(id, newPage) {
        if(!id){
            id="menu-selection";
        }
        $('#'+id).empty();

        if(undefined != newPage && true!=newPage){
            console.log("All Menus",newPage);
            $('#'+id).append("<option value=''>All Menus</option>");
        }
        $('#'+id).selectmenu('refresh');
        $.ajax({
            url: "/kpos/webapp/menu/menus?showInactive=true&expandMenuLevel=1",
            type: "GET",
            cache: false,
            timeout: 60000,
            dataType: 'json',
            contentType: "application/json",
            success: function(result, status, xhr) {
                if (result.menus != undefined && result.menus.length != 0) {
                    menuList = util.getElementsArray(result.menus);
                    tipOutSetupObj.menuList.push(menuList);
                    for(var i = 0; i < menuList.length; i++) {
                        var menu = menuList[i];
                        $('#'+id).append("<option value='" + menu.id + "'>" + menu.name + "</option>").trigger("create");
                    }
                    if (newPage==true){
                        var firstSelector = '#' + id + " option:first";
                        $(firstSelector).prop("selected", 'selected');
                        //初始化最后一级combo
                        tipOutSetupObj.areaOrGroupList($('menuList1'));
                    }
                    var val = $('#'+id+"1").val();
                    if(undefined != val && null != val && '' != val){
                        $('#'+id).val(val);
                        //初始化最后一级combo
                        tipOutSetupObj.areaOrGroupList($('menuList1'));
                    }
                }
                $('#'+id).selectmenu('refresh');
            },
            error: function (xhr, status, error) {
                console.log("Error occur when trying to fetch all tip out setting. " + error);
            }
        });
    },
    listGroups:function(thiz,id){
        if(id == null || id === undefined || id == ''){
            id = 'groupList';
        }
        $('#'+id).empty();
        $('#'+id).append("<option value=''>All Groups</option>");
        $('#'+id).selectmenu('refresh');
        for(var i = 0; i < menuList.length; i++) {
            var menu = menuList[i];
            if (menu.id == $(thiz).val()) {
                var menuGroupList = util.getElementsArray(menu.menuGroups);
                if (menuGroupList != undefined && menuGroupList.length > 0) {
                    for (var j = 0; j < menuGroupList.length; j++) {
                        var menuGroup = menuGroupList[j]
                        if (menuGroup.systemGenerated == true) continue;
                        $('#'+id).append("<option value='" + menuGroup.id + "'>" + menuGroup.name + "</option>");
                    }
                }
            }
        }
        if('groupList1' == id){
            var val = $('#groupList11').val();
            if(undefined != val && null != val && '' != val){
                $('#groupList1').val(val);
                $('#groupList1').selectmenu('refresh');
                $("#groupList11").val('');
            }
        }
        $('#'+id).selectmenu('refresh');
    },
    clearGrayDisplay : function () {
        $('#groupList1').attr("disabled", false)
        $("#groupList1").css("background", "#fff");
        $("#groupList1").parent().css("background", "#fff");
    },
    openGrayDisplay : function () {
        $('#groupList1').attr("disabled","disabled");
        $("#groupList1").css("background","#e9e9e9");
        $("#groupList1").parent().css("background","#e9e9e9");
    },
    typeOrMenuGroup:function(thiz){
        //选择type或menugroup类型联动相关combo
        if(thiz.value == 'ORDER_TYPE'){
            //筛选出列表中OrderTypeList集合
            tipOutSetupObj.listOrderType('ORDER_TYPE');
        }
        if(thiz.value=='MENU_GROUP'){
            tipOutSetupObj.clearGrayDisplay();
            //筛选出menuGroup联动
            $('#menuList1').selectmenu('refresh');
            tipOutSetupObj.listMenuGroups('menuList1',true);
            //清空最后一级
            $('#groupList1').empty();
            $('#groupList1').append("<option value=''>All Groups</option>");
            $('#groupList1').selectmenu('refresh');
        }
        tipOutSetupObj.changePer();
    },
    //读取全部roles begin
    listAllRoles : function(flag){
        var soapType = new ListRolesType();
        if(flag == 'saveOrupdate'){
            callWebService(soapType,tipOutSetupObj.listAllRolesTextHandler);//新增或修改需要的roles
        }else{
            callWebService(soapType, tipOutSetupObj.listAllRolesHandler);
        }
    },
    listAllRolesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listrolesresponsetype)) {
            var rolesElement = document.getElementById("roles");
            tipOutSetupObj.roleList = [];
            var roleListResponse = util.getElementsArray(jsonObj.listrolesresponsetype.roles);
            for (var i = 0; i < roleListResponse.length; i++) {
                var role = roleListResponse[i];
                tipOutSetupObj.roleList.push(role);
            }
            tipOutSetupObj.setRolesCombo(tipOutSetupObj.roleList);
        }
    },
    listAllRolesTextHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listrolesresponsetype)) {
            var rolesElement = document.getElementById("roles");
            tipOutSetupObj.roleList = [];
            var roleListResponse = util.getElementsArray(jsonObj.listrolesresponsetype.roles);
            for (var i = 0; i < roleListResponse.length; i++) {
                var role = roleListResponse[i];
                tipOutSetupObj.roleList.push(role);
            }
            var $table = $("#rolesTable");
            $table.empty();
            //遍历内容部分
            for(var i = 0; i <tipOutSetupObj.roleList.length; i++ ){
                var role = tipOutSetupObj.roleList[i];
                $('#rolesDiv').append('<li><a href="#">'+role.name+'</a></li>');
                var bgstyle = '#f5f5f5';
                if((i+1) % 2 == 0){
                    bgstyle = "#fff";
                }
                //遍历子项值
                var subId = '';
                var subPercentage = '';
                for(var n in tipOutSetupObj.roleTipOutDistributionDTOs){
                    var dtos = tipOutSetupObj.roleTipOutDistributionDTOs[n];
                    if(dtos.roleId == role.id){
                        subId = dtos.id;
                        subPercentage = dtos.percentageDistribution;
                        break;
                    }
                }
                var $tr = $("<tr style='background:"+bgstyle+"'>"+
                    "<td><input type='hidden' name='roleTipOutDistributionId' value='"+subId+"'><input type='hidden' name='roleId' value='"+role.id+"'>"+role.name+"</td>"+
                    "<td><input type=\"text\" name='percentage' value='"+subPercentage+"' id='Percentage_'"+i+" onblur='/*tipOutSetupObj.checkPercentage(this)*/'/></td>"+
                    "</tr>");
                $table.append($tr);
                $('#Percentage_'+i).textinput();//刷新为jquery-mob样式
            }
        }
    },
    setRolesCombo:function(roleList){
        $('#rolesList').empty();
        $('#rolesList').append("<option value=''>All Roles</option>");
        if(null != roleList){
            for(var i = 0; i < roleList.length; i++) {
                var role = roleList[i];
                //$('#menu-selection').append("<option value='" + menu.id + "'>" + menu.name + "</option>").trigger("create");
                $('#rolesList').append("<option value='" + role.id + "'>" + role.name + "</option>").trigger("create");
            }
        }
    },
    //读取全部roles end

    //读取全部Type begin
    listOrderType : function (flag){
        var soapType = new ListOrderTypeSettingsType();
        if(flag == 'ORDER_TYPE'){
            callWebService(soapType, tipOutSetupObj.listOrderTypeByPopuHandler);
        }else{
            callWebService(soapType, tipOutSetupObj.listOrderTypeHandler);
        }
    },
    listOrderTypeByPopuHandler : function (jsonObj) {
        //在窗体中替代menuList1属性值
        $('#menuList1').empty();
        // $('#menuList1').append("<option value=''>All Order Type</option>");
        $('#menuList1 option:first').prop('selected', 'selected');
        $('#menuList1').selectmenu('refresh');
        if (util.isSuccessfulResponse(jsonObj.listordertypesettingsresponsetype)) {
            tipOutSetupObj.elementList = util.getElementsArray(jsonObj.listordertypesettingsresponsetype.ordertypesettings);
            for (var i = 0; i < tipOutSetupObj.elementList.length; i++) {
                var orderType = tipOutSetupObj.elementList[i];
                $('#menuList1').append("<option value='" + orderType.id + "'>" + orderType.name + "</option>").trigger("create");
            }
            var val = $('#menuList11').val();
            if(undefined != val && null != val && '' != val){
                $('#menuList1').val(val);
            }
            $('#menuList1').selectmenu('refresh');
            //判断Dine_In
            var menuList1Text =  $("#menuList1").find("option:selected").text();
            if(menuList1Text == 'DINE_IN'){
                //显示出最后一级为AreaList
                tipOutSetupObj.clearGrayDisplay();
                tipOutSetupObj.listSeatingAreas('ORDER_TYPE');
                return;
            }else{
                $('#groupList1').empty();
                $('#groupList1').append("<option value=''>All Areas</option>");
                tipOutSetupObj.openGrayDisplay();
                $('#groupList1').selectmenu('refresh');
                return;
            }
        }
    },
    listOrderTypeHandler : function (jsonObj) {
        $('#orderTypeList').empty();
        $('#orderTypeList').append("<option value=''>All Order Type</option>");
        if (util.isSuccessfulResponse(jsonObj.listordertypesettingsresponsetype)) {
            tipOutSetupObj.elementList = util.getElementsArray(jsonObj.listordertypesettingsresponsetype.ordertypesettings);
            for (var i = 0; i < tipOutSetupObj.elementList.length; i++) {
                var orderType = tipOutSetupObj.elementList[i];
                $('#orderTypeList').append("<option value='" + orderType.id + "'>" + orderType.name + "</option>").trigger("create");
            }
        }
    },
    areaOrGroupList:function(thiz){
        //弹窗中menu或type联动产生最后一级变化
        var val = thiz.value;
        var typeOrMenuVal = $('#orderTypeList1').val();
        var menuList1Text =  $("#menuList1").find("option:selected").text();
        if(typeOrMenuVal == null || typeOrMenuVal == ''){
            //清空最后一级下拉框即groupList或areaList
            $('#groupList1').empty();
            $("#groupList11").val('');
            return;
        }
        if(typeOrMenuVal == 'ORDER_TYPE'){
            if(menuList1Text == 'DINE_IN'){
                //显示出最后一级为AreaList
                tipOutSetupObj.clearGrayDisplay();
                tipOutSetupObj.listSeatingAreas('ORDER_TYPE');
                return;
            }else{
                $('#groupList1').empty();
                $('#groupList1').append("<option value=''>All Areas</option>");
                tipOutSetupObj.openGrayDisplay();
                $('#groupList1').selectmenu('refresh');
                return;
            }
        }
        if(typeOrMenuVal == 'MENU_GROUP'){
            tipOutSetupObj.listGroups($('#menuList1'),'groupList1');
        }
    },
    //读取全部Type end
    listSeatingAreas : function(flag) {
        var soapType = new ListAreasType(false);
        if(flag == 'ORDER_TYPE'){
            callWebService(soapType, tipOutSetupObj.listSeatingAreasByPopuHandler);
        }else{
            callWebService(soapType, tipOutSetupObj.listSeatingAreasHandler);
        }
    },
    listSeatingAreasHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listareasresponsetype)) {
            areaList = util.getElementsArray(jsonObj.listareasresponsetype.areas);
            //设置值
            $('#areaList').empty();
            $('#areaList').append("<option value=''>All Areas</option>");
            for(var i = 0; i < areaList.length; i++){
                var area = areaList[i];
                $('#areaList').append("<option value='" + area.id + "'>" + area.name + "</option>").trigger("create");
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed to load seating areas!", jsonObj.listareasresponsetype.result);
        }
    },
    listSeatingAreasByPopuHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listareasresponsetype)) {
            areaList = util.getElementsArray(jsonObj.listareasresponsetype.areas);
            //设置值
            $('#groupList1').empty();
            $('#groupList1').append("<option value=''>All Areas</option>");
            $('#groupList1').selectmenu('refresh');
            for(var i = 0; i < areaList.length; i++){
                var area = areaList[i];
                $('#groupList1').append("<option value='" + area.id + "'>" + area.name + "</option>").trigger("create");
            }
            var val = $('#groupList11').val();
            if(undefined != val && null != val && '' != val){
                $('#groupList1').val(val);
                $('#groupList1').selectmenu('refresh');
                $("#groupList11").val('');
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed to load seating areas!", jsonObj.listareasresponsetype.result);
        }
    }
};

function ListRolesType() {
    this.getXML = function() {
        var xml = soapXMLBegin;
        xml += "<app:ListRolesType/>";
        xml += soapXMLEnd;
        return xml;
    }
}