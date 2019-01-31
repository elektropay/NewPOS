var giftCardObj = {
    giftCardList: [],
    giftCardListByElementId: {},
    currentEntryId: null,
    currentEntryCardNumber: null,
    currentEntrySyncFromCloud: null,
    canSave: true,
    init: function () {
        var todayDate = converter.getTodayDate();
        $("#fromDatePicker").val(todayDate);
        $("#toDatePicker").val(todayDate);
        //giftCardObj.fetchEntry();
        uiBaseObj.addDeleteConfirmDialog("giftCard-page", "deleteConfirmationDialog", "Gift Card", "giftCardObj.deleteEntry();");
    },
    fetchEntry: function () {
        var cardNumber = $("#cardNumberFilterInput").val();
        var issuedTo = $("#issuedToFilterInput").val();
        var fromDatePicker = $("#fromDatePicker").val();
        var toDatePicker = $("#toDatePicker").val();
		var soapType = new FindGiftCardsType(null, issuedTo, cardNumber,fromDatePicker,toDatePicker);
		callWebService(soapType, giftCardObj.fetchEntryHandler);
    },
    fetchEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.findgiftcardsresponsetype)) {
            var giftCards = util.getElementsArray(response.findgiftcardsresponsetype.giftcards);
            var giftCardsTableId = "giftCardTable";
            var remainTotal = 0;
            giftCardObj.removeAllRows(giftCardsTableId);
            giftCardObj.giftCardList = [];
            giftCardObj.giftCardListByElementId = {};
            for (var i = 0; i < giftCards.length; i++) {
                if (giftCards[i].enabled == 'true') {
                    var elementId = "row_" + i;
                    giftCardObj.giftCardList.push(giftCards[i]);
                    giftCardObj.giftCardListByElementId[elementId] = giftCards[i];
                }
                remainTotal = remainTotal + giftCards[i].balance;
            }
            $('#remainTotal').text("$" + remainTotal.toFixed(2));
            giftCardObj.initPagination();
        }
    },
    removeAllRows : function (tableId) {
        $("#" + tableId + " tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    },
    getTableRowHTML: function (elementId, elementJsonObj) {
        return "<tr id='" + elementId + "' class='detailTableRow'>" +
			"<td class='detailTableRowCell td-cardNumber'>" + elementJsonObj.number + "</td>" +
            "<td class='detailTableRowCell td-issuedTo'>" + (elementJsonObj.issuedto == null ? "" : elementJsonObj.issuedto) + "</td>" +
            "<td class='detailTableRowCell td-exipreTime'>" + (elementJsonObj.expiretime == null ? "" : elementJsonObj.expiretime.substring(0, 10)) + "</td>" +
            "<td class='detailTableRowCell td-balance'>" + elementJsonObj.balance + "</td>" +
            "<td class='detailTableRowCell td-consumptionTimes'>" + elementJsonObj.consumptiontimes + "</td>" +
            "<td class='detailTableRowCell td-rechargeAmount'>" + elementJsonObj.rechargeamount + "</td>" +
            "<td class='detailTableRowCell td-amountSpent'>" + elementJsonObj.amountspent + "</td>" +
            "<td class='detailTableRowCell td-endingBalance'>" + elementJsonObj.endingbalance + "</td>" +
            "<td class=\"delete-icon-td\"><a href=\"javascript:giftCardObj.openDeletePanel('" + elementId + "');\"><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>" + "</tr>";
    },
    
    openDeletePanel: function (rowElementId) {
        var entry = giftCardObj.giftCardListByElementId[rowElementId];
        giftCardObj.currentEntryId = entry.id;
        giftCardObj.currentEntryCardNumber = entry.number;
        giftCardObj.currentEntrySyncFromCloud = entry.syncfromcloud;
        $('#deleteConfirmationDialog').popup('open');
    },
    selectEntry: function (tblRowObj) {        
        giftCardObj.clearEntryDetails();
		var cardName = $(tblRowObj).find("td.td-cardNumber").text();
        var issuedTo = $(tblRowObj).find("td.td-issuedTo").text();
        var exipreTime = $(tblRowObj).find('td.td-exipreTime').text();
        var balance = $(tblRowObj).find('td.td-balance').text();

        $("#cardNumberInput").val(cardName);
        $("#issuedToInput").val(issuedTo);
        $("#expireDatePicker").val(exipreTime);
		$("#balanceInput").val(balance);
		var entry = giftCardObj.giftCardListByElementId[$(tblRowObj).attr("id")];
		
        giftCardObj.currentEntryId = entry.id;
        giftCardObj.currentEntryCardNumber = entry.number;
        giftCardObj.currentEntrySyncFromCloud = entry.syncfromcloud;
        $('#editGiftCardDetailPopup').popup('open');
        if (entry.syncfromcloud == 'true') {
            $("#cardNumberInput").attr('readOnly', true);
        } else {
            $("#cardNumberInput").attr('readOnly', false);
            $("#cardNumberInput").focus();
        }
    },
    deleteEntry: function () {
        $('#deleteConfirmationDialog').popup('close');
        if (giftCardObj.currentEntryId != null || util.isValidVariable(giftCardObj.currentEntryCardNumber)) {
            var userAuth = admin.getUserAuthInfo();
            var soapType = new DeleteGiftCardType(giftCardObj.currentEntryId, giftCardObj.currentEntryCardNumber, userAuth);
            callWebService(soapType, giftCardObj.deleteEntryHandler);
            giftCardObj.currentEntryId = null;
            giftCardObj.currentEntryCardNumber = null;
            giftCardObj.currentEntrySyncFromCloud = null;
        }
    },
    deleteEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.deletegiftcardresponsetype)) {
            giftCardObj.fetchEntry();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete gift card", response.deletegiftcardresponsetype.result);
        }
    },
    newEntry: function () {
        giftCardObj.clearEntryDetails();
        var today = new Date();
        today.setFullYear(today.getFullYear() + 1);
        $('#expireDatePicker').val(baseReportObj.parseReportDate(today));
        $('#editGiftCardDetailPopup').popup('open');
        $("#cardNumberInput").attr('readOnly', false);
        $("#cardNumberInput").focus();
    },
    clearEntryDetails: function () {
        $("#cardNumberInput").val('');
        $("#issuedToInput").val('');
        $("#expireDatePicker").val('');
		$("#balanceInput").val('');
		$("#message").html("");
		
        giftCardObj.currentEntryId = null;
        giftCardObj.currentEntryCardNumber = null;
        giftCardObj.currentEntrySyncFromCloud = null;
    },
    save: function () {
        var cardNumber = $("#cardNumberInput").val();
        var issuedTo = $("#issuedToInput").val();
        var expireDate = $("#expireDatePicker").val();
		var balance = $("#balanceInput").val();
        var id = giftCardObj.currentEntryId;
        
        cardNumber = cardNumber.replace(/[&<]/g, "");
        if (cardNumber === '' || cardNumber === undefined) {
            $('#editGiftCardDetailPopup').effect("shake");
            $('#message').html("Card number cannot be empty!");
            giftCardObj.canSave = true;
            return;
        }

        if (cardNumber.length > 17) {
            $('#editGiftCardDetailPopup').effect("shake");
            $('#message').html("Maximum length of Card number is 17!");
            giftCardObj.canSave = true;
            return;
        }

        if (!balance) {
            $('#editGiftCardDetailPopup').effect("shake");
            $('#message').html("Balance cannot be empty!");
            giftCardObj.canSave = true;
            return;
        }
        
        var userAuth = admin.getUserAuthInfo();

        var soapType = new SaveGiftCardType(id, null, cardNumber, null, balance, expireDate, true, issuedTo, null, giftCardObj.currentEntrySyncFromCloud, userAuth);
        if (!giftCardObj.canSave) {
            return;
        }
		giftCardObj.canSave = false;
		callWebService(soapType, giftCardObj.saveGiftCardHandler);
    },
    refreshWithoutChanges: function () {
        $('#editGiftCardDetailPopup').popup('close');
        giftCardObj.clearEntryDetails();
    },
    saveGiftCardHandler: function (response) {
        if (util.isSuccessfulResponse(response.savegiftcardresponsetype)) {
            giftCardObj.fetchEntry();
			$('#editGiftCardDetailPopup').popup('close');
        } else {
            $('#editGiftCardDetailPopup').effect("shake");
            if(!util.isNullOrEmpty(response.savegiftcardresponsetype.result)) {
                $('#message').html(response.savegiftcardresponsetype.result.failurereason);
            }
        }
        giftCardObj.canSave = true;
    },
    initPagination : function() {
        $('table#giftCardTable').each(function() {
            var currentPage = 0;
            var numPerPage = 50;
            var $table = $(this);
            var numRows = giftCardObj.giftCardList.length;
            var numPages = Math.ceil(numRows / numPerPage);
            $('.pager').empty();
            var $pager = $('<div class="pager"></div>');
            for (var page = 0; page < numPages; page++) {
                $('<span class="page-number"></span>').text(page+1).bind('click', {
                    newPage: page
                }, function(event) {
                    currentPage = event.data['newPage'];
                    $(this).addClass('active').siblings().removeClass('active');
                    $table.find('tbody').empty();
                    var subGCList = giftCardObj.giftCardList.slice(currentPage*numPerPage, (currentPage+1)*numPerPage);
                    for (var i = 0; i < subGCList.length; i++) {
                        var element = subGCList[i];
                        var elementId = "row_" + (i + currentPage*numPerPage);
                        var tableRowHTML = giftCardObj.getTableRowHTML(elementId, element);
                        $("#giftCardTable tbody").append(tableRowHTML);  
                    }
                    $("#giftCardTable .detailTableRowCell").click(giftCardObj, function () {
                        giftCardObj.selectEntry($(this).closest("tr"));
                    });  
                }).appendTo($pager).addClass('clickable');
            }
            $pager.insertAfter($table).find('span.page-number:first').trigger('click');
        });
    },
    prepareExportData : function() {
        baseReportObj.setFormActionUrl("giftCardform", "/kpos/webapp/data/exportGiftCard");
        var cardNumberFilterInput = $("#cardNumberFilterInput").val();
        var issuedToFilterInput = $("#issuedToFilterInput").val();
        var fromDatePicker = $("#fromDatePicker").val();
        var toDatePicker = $("#toDatePicker").val()
        $("#cardNumber").val(cardNumberFilterInput);
        $("#issuedTo").val(issuedToFilterInput);
        $("#transactionFromDate").val(fromDatePicker);
        $("#transactionToDate").val(toDatePicker);
        document.giftCardform.submit();
     }
};

var loyaltyCardObj = {
    loyaltyCardList: [],
    loyaltyCardListByElementId: {},
    loyaltyCardListById: {},
    currentEntryId: null,
    currentEntryCardNumber: null,
    currentEntrySyncFromCloud: null,
    levelUpdatedByPoint: null,
    selectedCustomerEntry : null,
    canSave: true,
//    validCardNumberPattern : /^M*[a-zA-Z0-9]+$/g,
    init: function () {
        loyaltyCardObj.listAllMembershipLevels();
        uiBaseObj.addDeleteConfirmDialog("loyaltyCard-page", "deleteLoyaltyCardConfirmationDialog", "Loyalty Card", "loyaltyCardObj.deleteEntry();");
        var searchCustomerInputObj = $("#searchSelectCustomerInput");
        autocomplete.typedict[3] = "customer";
        autocomplete.dsplrule['3'] = function(str){
             var displayText = util.getEmptyValueIfInvalid(str.firstName) + " " + util.getEmptyValueIfInvalid(str.lastName);
             if (util.isValidVariable(str.phoneNumber)) {
                displayText += "(" + str.phoneNumber + ")";
             }
             return displayText;
        }
        autocomplete.fullrule['3'] = function(str){
             return loyaltyCardObj.getCustomerSummary(str);
        }
        autocomplete.add(searchCustomerInputObj, 3, null, loyaltyCardObj.onSelectCustomer);
    },
    fetchEntry: function () {
        var cardNumber = $("#cardNumberFilterInput").val();
        var issuedTo = $("#issuedToFilterInput").val();
		var soapType = new FindLoyaltyCardsType(null, true, false, issuedTo, cardNumber);
		callWebService(soapType, loyaltyCardObj.fetchEntryHandler);
    },
    fetchEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.findloyaltycardsresponsetype)) {
            var loyaltyCards = util.getElementsArray(response.findloyaltycardsresponsetype.loyaltycards);
            var loyaltyCardsTableId = "loyaltyCardTable";
            loyaltyCardObj.removeAllRows(loyaltyCardsTableId);
            loyaltyCardObj.loyaltyCardList = [];
            loyaltyCardObj.loyaltyCardListByElementId = {};
            loyaltyCardObj.loyaltyCardListById = {};
            for (var i = 0; i < loyaltyCards.length; i++) {
                if (loyaltyCards[i].enabled == 'true') {
                    var elementId = "row_" + i;
                    loyaltyCardObj.loyaltyCardList.push(loyaltyCards[i]);
                    loyaltyCardObj.loyaltyCardListByElementId[elementId] = loyaltyCards[i];
                    loyaltyCardObj.loyaltyCardListById[loyaltyCards[i].id] = loyaltyCards[i];
                }
            }
            loyaltyCardObj.initPagination();
        }
    },
    listAllMembershipLevels: function() {
        var soapType = new FindMembershipLevelsType(null);
        callWebService(soapType, loyaltyCardObj.listAllMembershipLevelsHandler);
    },
    listAllMembershipLevelsHandler : function(response) {
        if (util.isSuccessfulResponse(response.findmembershiplevelsresponsetype)) {
            loyaltyCardObj.levelUpdatedByPoint = response.findmembershiplevelsresponsetype.levelupdatedbypoint;
            $('#membership-level-select-list').find('option:gt(0)').remove();
            var membershipLevelList = util.getElementsArray(response.findmembershiplevelsresponsetype.membershiplevels);
            for (var i = 0; i < membershipLevelList.length; i++) {
                var membershipLevel = membershipLevelList[i];
                $("#membership-level-select-list").append("<option value='" + membershipLevel.id + "'>" + membershipLevel.name + "</option>").trigger("create");
            }
        }
    },
    removeAllRows : function (tableId) {
        $("#" + tableId + " tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    },
    getTableRowHTML: function (elementId, elementJsonObj) {
        return "<tr id='" + elementId + "' class='detailTableRow'>" +
			"<td class='detailTableRowCell td-cardNumber'>" + elementJsonObj.number + "</td>" +
            "<td class='detailTableRowCell td-issuedTo'>" + loyaltyCardObj.getCustomerSummary(elementJsonObj.customer) + "</td>" +
            "<td class='detailTableRowCell td-exipreTime'>" + (elementJsonObj.expiretime == null ? "" : elementJsonObj.expiretime.substring(0, 10)) + "</td>" +
            "<td class='detailTableRowCell td-balance'>" + elementJsonObj.balance + "</td>" +
            "<td class='detailTableRowCell td-points'>" + elementJsonObj.points + "</td>" +
            "<td class='detailTableRowCell td-allTimePoints'>" + elementJsonObj.alltimepoints + "</td>" +
            "<td class='detailTableRowCell td-membershipLevel'>" + util.getEmptyValueIfInvalid(elementJsonObj.membershiplevelname) + "</td>" +
            "<td class=\"delete-icon-td\"><a href=\"javascript:loyaltyCardObj.openDeletePanel('" + elementId + "');\"><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>" + "</tr>";
    },
    getCustomerSummary: function(jsonObj) {
        if (util.isValidVariable(jsonObj)) {
            return (util.getEmptyValueIfInvalid(jsonObj.firstname) + " " + util.getEmptyValueIfInvalid(jsonObj.lastname)).trim();
        }
        return "";
    },
    openDeletePanel: function (rowElementId) {
        var entry = loyaltyCardObj.loyaltyCardListByElementId[rowElementId];
        loyaltyCardObj.currentEntryId = entry.id;
        loyaltyCardObj.currentEntryCardNumber = entry.number;
        loyaltyCardObj.currentEntrySyncFromCloud = entry.syncfromcloud;
        $('#deleteLoyaltyCardConfirmationDialog').popup('open');
    },
    selectEntry: function (tblRowObj) {        
		var issuedTo = $(tblRowObj).find("td.td-issuedTo").text();

        var entry = loyaltyCardObj.loyaltyCardListByElementId[$(tblRowObj).attr("id")];
        loyaltyCardObj.currentEntryId = entry.id;
        loyaltyCardObj.currentEntryCardNumber = entry.number;
        loyaltyCardObj.currentEntrySyncFromCloud = entry.syncfromcloud;

        $("#cardNumberInput").val(entry.number);
        $("#membership-level-select-list").val(entry.membershiplevelid).selectmenu("refresh");
        if (entry.syncfromcloud == 'true') {
            $("#cardNumberInput").attr('readOnly', true);
            if (loyaltyCardObj.levelUpdatedByPoint == 'true') {
                $("#membership-level-select-list").prop('disabled', true);    
            }
            $("#allTimePointsInput").prop('disabled', true);
        } else {
            $("#cardNumberInput").attr('readOnly', false);
            $("#cardNumberInput").focus();
            $("#membership-level-select-list").prop('disabled', false);
            $("#allTimePointsInput").prop('disabled', false);
        }
        $("#pointsInput").prop('disabled', false);
        $("#issuedToInput").val(issuedTo);
        $("#lc-customer-name-div").text(": " + issuedTo);
        if (util.isValidVariable(entry.expiretime)) {
            $("#expireDatePicker").val(entry.expiretime.split(' ')[0]);
        } else {
            $("#expireDatePicker").val('');
        }
		$("#balanceInput").val(entry.balance);
		$("#pointsInput").val(entry.points);
        $("#allTimePointsInput").val(entry.alltimepoints);

        if (util.isValidVariable(entry.customer)) {
            customerObj.populateDetail(entry.customer);
            loyaltyCardObj.selectedCustomerEntry = entry.customer;
        } else {
            customerObj.clearEntryDetails();
            loyaltyCardObj.selectedCustomerEntry = null;
        }

        uiBaseObj.resetAllAlertDivs();
        $('#editLoyaltyCardDetailPopup').popup('open');
        $("#cardNumberInput").focus();
    },
    deleteEntry: function () {
        $('#deleteLoyaltyCardConfirmationDialog').popup('close');
        if (loyaltyCardObj.currentEntryId != null || util.isValidVariable(loyaltyCardObj.currentEntryCardNumber)) {
            var userAuth = admin.getUserAuthInfo();
            var soapType = new DeleteLoyaltyCardType(loyaltyCardObj.currentEntryId, loyaltyCardObj.currentEntryCardNumber, userAuth);
            callWebService(soapType, loyaltyCardObj.deleteEntryHandler);
            loyaltyCardObj.currentEntryId = null;
            loyaltyCardObj.currentEntryCardNumber = null;
            loyaltyCardObj.currentEntrySyncFromCloud = null;
        }
    },
    deleteEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.deleteloyaltycardresponsetype)) {
            loyaltyCardObj.fetchEntry();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete loyalty card", response.deleteloyaltycardresponsetype.result);
        }
    },
    newEntry: function () {
        loyaltyCardObj.clearEntryDetails();
        $("#lc-customer-name-div").text("");
        $("#searchSelectCustomerInput").val("");
        $('#editLoyaltyCardDetailPopup').popup('open');
        $("#cardNumberInput").attr('readOnly', false);
        if (loyaltyCardObj.levelUpdatedByPoint == 'true') {
            $("#membership-level-select-list").prop('disabled', true);    
        }
        $("#pointsInput").prop('disabled', true);
        $("#allTimePointsInput").prop('disabled', true);
        $("#cardNumberInput").focus();
    },
    clearEntryDetails: function () {
        $('#message').html("");
        $("#cardNumberInput").val('');
        $("#issuedToInput").val('');
        $("#expireDatePicker").val('');
		$("#balanceInput").val('');
		$("#pointsInput").val('');
		$("#allTimePointsInput").val('');
		$("#membership-level-select-list").val('').selectmenu("refresh");
		$("#membership-level-select-list").prop('disabled', false);
        $("#pointsInput").prop('disabled', false);
        $("#allTimePointsInput").prop('disabled', false);
        loyaltyCardObj.currentEntryId = null;
        loyaltyCardObj.currentEntryCardNumber = null;
        loyaltyCardObj.currentEntrySyncFromCloud = null;
        loyaltyCardObj.selectedCustomerEntry = null;
        customerObj.clearEntryDetails();
        uiBaseObj.resetAllAlertDivs();
    },
    save: function () {
        $('#message').html("");
        uiBaseObj.resetAllAlertDivs();
        var cardNumber = $("#cardNumberInput").val();
        var customerFirstName = $("#firstNameInput").val();
        var customerLastName = $("#lastNameInput").val();
        var issuedTo = (util.getEmptyValueIfInvalid(customerFirstName) + " " + util.getEmptyValueIfInvalid(customerLastName)).trim();
        var expireDate = $("#expireDatePicker").val();
		var balance = $("#balanceInput").val();
		var points = $("#pointsInput").val();
		var allTimePoints = $("#allTimePointsInput").val();
		var membershipLevelId = $("#membership-level-select-list").val();

        cardNumber = cardNumber.replace(/[&<]/g, "");
		if (cardNumber === "") {
            $('#editLoyaltyCardDetailPopup').effect("shake");
            uiBaseObj.alertDiv("cardNumberInput-container-div", systemLanguage.msgCodeList.EMPTY_CARD_NUMBER);
            loyaltyCardObj.canSave = true;
            return;
		}

        if (cardNumber.indexOf('%') !== 0 && cardNumber.indexOf(';') !== 0 || cardNumber.lastIndexOf('?') !== cardNumber.length - 1) {
            if (cardNumber.length > 17) {
                $('#editLoyaltyCardDetailPopup').effect("shake");
                uiBaseObj.alertDiv('cardNumberInput-container-div', systemLanguage.msgCodeList.INVALID_LOYALTY_CARD_NUMBER, "Invalid card number. Max Length is 17.");
                loyaltyCardObj.canSave = true;
                return;
            }
        }
        
        if (loyaltyCardObj.levelUpdatedByPoint == 'false') {
            if (!membershipLevelId || membershipLevelId == '-1') {
                $('#editLoyaltyCardDetailPopup').effect("shake");
                uiBaseObj.alertDiv('membershipLevelSelect-container-div', systemLanguage.msgCodeList.EMPTY_MEMBERSHIP_LEVEL, "Membership level is required");
                loyaltyCardObj.canSave = true;
                return;
            }
        }

        var userAuth = admin.getUserAuthInfo();

        var id = loyaltyCardObj.currentEntryId;
        var customerInfoSoapRequestType = customerObj.getCustomerInfoSoapRequestType(loyaltyCardObj.selectedCustomerEntry);

        var soapType = new SaveLoyaltyCardType(id, null, cardNumber, points, allTimePoints, balance, expireDate, true, issuedTo, membershipLevelId, customerInfoSoapRequestType, loyaltyCardObj.currentEntrySyncFromCloud, userAuth);
        if (!loyaltyCardObj.canSave) {
            return;
        }
        loyaltyCardObj.canSave = false;
		callWebService(soapType, loyaltyCardObj.saveLoyaltyCardHandler);
    },
    refreshWithoutChanges: function () {
        $('#editLoyaltyCardDetailPopup').popup('close');
        loyaltyCardObj.clearEntryDetails();
    },
    saveLoyaltyCardHandler: function (response) {
        if (util.isSuccessfulResponse(response.saveloyaltycardresponsetype)) {
            loyaltyCardObj.fetchEntry();
            $('#editLoyaltyCardDetailPopup').popup('close');
        } else {
            $('#editLoyaltyCardDetailPopup').effect("shake");
            if(!util.isNullOrEmpty(response.saveloyaltycardresponsetype.result)) {
                $('#message').html(response.saveloyaltycardresponsetype.result.failurereason);
            }
        }
        loyaltyCardObj.canSave = true;
    },
    onSelectCustomer : function(result, obj) {
        loyaltyCardObj.selectedCustomerEntry = null;
        var customerId = result.id;
        var soapType = new FindCustomerInfoType(customerId);
        callWebService(soapType, loyaltyCardObj.onSelectCustomerHandler);
    },
    onSelectCustomerHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findcustomerinforesponsetype)) {
            var customer = jsonObj.findcustomerinforesponsetype.customers;
            loyaltyCardObj.selectedCustomerEntry = customer;
            customerObj.populateDetail(customer);
            $("#lc-customer-name-div").text(": " + loyaltyCardObj.getCustomerSummary(customer));
        }
    },
    addNewCustomer : function() {
        loyaltyCardObj.selectedCustomerEntry = null;
        customerObj.clearEntryDetails();
        $("#lc-customer-name-div").text("");
        $("#searchSelectCustomerInput").val("");
    },
    clearSelectedCustomer : function() {
        var deletedCustomerEntry = {};
        deletedCustomerEntry.id = -1;
        loyaltyCardObj.selectedCustomerEntry = deletedCustomerEntry;
        customerObj.clearEntryDetails();
        $("#lc-customer-name-div").text("");
        $("#searchSelectCustomerInput").val("");
    },
    initPagination : function() {
        $('table#loyaltyCardTable').each(function() {
            var currentPage = 0;
            var numPerPage = 50;
            var $table = $(this);
            var numRows = loyaltyCardObj.loyaltyCardList.length;
            var numPages = Math.ceil(numRows / numPerPage);
            $('.pager').empty();
            var $pager = $('<div class="pager"></div>');
            for (var page = 0; page < numPages; page++) {
                $('<span class="page-number"></span>').text(page+1).bind('click', {
                    newPage: page
                }, function(event) {
                    currentPage = event.data['newPage'];
                    $(this).addClass('active').siblings().removeClass('active');
                    $table.find('tbody').empty();
                    var subLCList = loyaltyCardObj.loyaltyCardList.slice(currentPage*numPerPage, (currentPage+1)*numPerPage);
                    for (var i = 0; i < subLCList.length; i++) {
                        var element = subLCList[i];
                        var elementId = "row_" + (i + currentPage*numPerPage);
                        var tableRowHTML = loyaltyCardObj.getTableRowHTML(elementId, element);
                        $("#loyaltyCardTable tbody").append(tableRowHTML);
                    }
                    $("#loyaltyCardTable .detailTableRowCell").click(loyaltyCardObj, function () {
                        loyaltyCardObj.selectEntry($(this).closest("tr"));
                    });  
                }).appendTo($pager).addClass('clickable');
            }
            $pager.insertAfter($table).find('span.page-number:first').trigger('click');
        });
    }
};

var customerObj = {
    customerList: [],
    customerListByElementId: {},
    customerListById: {},
    currentEntryId: null,
    init: function () {
        uiBaseObj.addDeleteConfirmDialog("customer-page", "deleteCustomerConfirmationDialog", "Customer", "customerObj.deleteEntry();");
        $('table').on('scroll', function () {
            $("table > *").width($("table").width() + $("table").scrollLeft());
        });
        $("form#exportCustomerData").submit(function(event) {
            $("#exportConfirmationPopup").popup("close");
            var query = $("#searchCustomerInput").val();
            var birthdayFrom = $("#birthdayFromInput").val();
            var birthdayTo = $("#birthdayToInput").val();
            $("#exportCustomerDataPopup").popup("open");
            $("#emailAddressOnly").val($("#emailAddressOnlyCheckBox").prop("checked"));
            $("#birthdayFromDate").val(birthdayFrom);
            $("#birthdayToDate").val(birthdayTo);
            $("#query").val(query);
            $("button[type='submit']").prop('disabled',true);

            $.fileDownload($(this).prop('action'), {
                preparingMessageHtml: "We are preparing your report, please wait...",
                failMessageHtml: "There was a problem generating your report, please try again.",
                httpMethod: "POST",
                successCallback: function (url) {
                    $("#exportCustomerDataPopup").popup("close");
                    $("button[type='submit']").prop('disabled',false);
                },
                failCallback: function (html, url) {
                    $("#exportCustomerDataPopup").popup("close");
                    $("button[type='submit']").prop('disabled',false);
                },
                data: $(this).serialize()
            });
            event.preventDefault(); //otherwise a normal form submit would occur
        });
    },
    fetchEntry: function () {
        var query = $("#searchCustomerInput").val();
        var birthdayFrom = $("#birthdayFromInput").val();
        var birthdayTo = $("#birthdayToInput").val();
        if (util.isValidVariable(birthdayFrom) && !customerObj.isValidBirthdayFormat(birthdayFrom)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.INVALID_SHORT_DATE_FORMAT, "Invalid Date format(mm-dd)");
            return;
        }
        if (util.isValidVariable(birthdayTo) && !customerObj.isValidBirthdayFormat(birthdayTo)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.INVALID_SHORT_DATE_FORMAT, "Invalid Date format(mm-dd)");
            return;
        }
        var soapType;
        if (util.isValidVariable(query) || (util.isValidVariable(birthdayFrom) && util.isValidVariable(birthdayTo))) {
            soapType = new FindCustomerInfoType(null, null, null, null, null, birthdayFrom, birthdayTo, query, true);
        } else {
            soapType = new FindCustomerInfoType();
        }
        callWebService(soapType, customerObj.fetchEntryHandler);
    },
    fetchEntryHandler: function (response) {
        var customersTableId = "customerTable";
        customerObj.removeAllRows(customersTableId);
        customerObj.customerList = [];
        customerObj.customerListByElementId = {};
        customerObj.customerListById = {};
        if (util.isSuccessfulResponse(response.findcustomerinforesponsetype)) {
            var customers = util.getElementsArray(response.findcustomerinforesponsetype.customers);
            for (var i = 0; i < customers.length; i++) {
                var elementId = "row_" + i;
                var tableRowHTML = customerObj.getTableRowHTML(elementId, customers[i]);
                $("#" + customersTableId + " tbody").append(tableRowHTML);
                customerObj.customerList.push(customers[i]);
                customerObj.customerListByElementId[elementId] = customers[i];
                customerObj.customerListById[customers[i].id] = customers[i];
            }
            $("#" + customersTableId + " .detailTableRowCell").click(customerObj, function () {
                customerObj.selectEntry($(this).closest("tr"));
            });
        }
    },
    syncCustomerData : function() {
        var soapType = new SyncCustomerDataType();
        callWebService(soapType, customerObj.syncCustomerDataHandler);
    },
    syncCustomerDataHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.synconlineordercustomerinforesponsetype)) {
            customerObj.fetchEntry();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SYNC_CUSTOMER_FAIL, "Failed to sync customer info with online order", jsonObj.synconlineordercustomerinforesponsetype.result);
        }
    },
    prepareExportData : function() {
        var birthdayFrom = $("#birthdayFromInput").val();
        var birthdayTo = $("#birthdayToInput").val();

        if (util.isValidVariable(birthdayFrom) && !customerObj.isValidBirthdayFormat(birthdayFrom)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.INVALID_SHORT_DATE_FORMAT, "Invalid Date format(mm-dd)");
            return;
        }
        if (util.isValidVariable(birthdayTo) && !customerObj.isValidBirthdayFormat(birthdayTo)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.INVALID_SHORT_DATE_FORMAT, "Invalid Date format(mm-dd)");
            return;
        }
        $("#exportConfirmationPopup").popup("open");
    },
    cancelExportData : function() {
        $("#exportConfirmationPopup").popup("close");
    },
    isValidBirthdayFormat : function(input) {
        // expected input : mm-dd
        if (!util.isValidVariable(input)) {
            return false;
        }
        var bits = input.split('-');
        if (bits.length != 2) {
            return false;
        }
        var month = bits[0];
        var day = bits[1];
        if (!util.isValidInteger(month) || month <= 0 || month > 12) {
            return false;
        }
        if (!util.isValidInteger(day) || day <= 0 || day > 31) {
            return false;
        }
        return true;
    },
    removeAllRows : function (tableId) {
        $("#" + tableId + " tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    },
    getTableRowHTML: function (elementId, elementJsonObj) {
        var html = "<tr id='" + elementId + "' class='detailTableRow'>" +
                        "<td class='detailTableRowCell td-firstName'>" + util.getEmptyValueIfInvalid(elementJsonObj.firstname) + "</td>" +
                       "<td class='detailTableRowCell td-lastName'>" + util.getEmptyValueIfInvalid(elementJsonObj.lastname) + "</td>";
        html += "<td class='detailTableRowCell td-phone'>" + phoneObj.getSummary(elementJsonObj.phone).toString().replace(/(\d{3})(\d{3})(\d{4})/, "($1)$2-$3") + "</td>" + //phoneObj.getSummary(elementJsonObj.phone)
            "<td class='detailTableRowCell td-address'>" + addressObj.getSummary(elementJsonObj.address) + "</td>" +
            "<td class='detailTableRowCell td-email'>" + util.getEmptyValueIfInvalid(elementJsonObj.email) + "</td>" +
            "<td class=\"delete-icon-td\"><a href=\"javascript:customerObj.openDeletePanel('" + elementId + "');\"><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>" + "</tr>";
        return html;
    },
    openDeletePanel: function (rowElementId) {
        var entry = customerObj.customerListByElementId[rowElementId];
        customerObj.currentEntryId = entry.id;
        $('#deleteCustomerConfirmationDialog').popup('open');
    },
    selectEntry: function (tblRowObj) {
        customerObj.clearEntryDetails();
		var entry = customerObj.customerListByElementId[$(tblRowObj).attr("id")];
        customerObj.currentEntryId = entry.id;
        customerObj.populateDetail(entry);

        $('#editCustomerDetailPopup').popup('open');
    },
    populateDetail : function(entry) {
        $("#firstNameInput").val(util.getEmptyValueIfInvalid(entry.firstname));
        $("#lastNameInput").val(util.getEmptyValueIfInvalid(entry.lastname));
        $("#prefixInput").val(util.getEmptyValueIfInvalid(entry.prefix));
        $("#birthdayInput").val(util.getEmptyValueIfInvalid(entry.birthday));
        $("#emailInput").val(util.getEmptyValueIfInvalid(entry.email));
        $("#descriptionInput").val(util.getEmptyValueIfInvalid(entry.description));
        $("#facebookInput").val(util.getEmptyValueIfInvalid(entry.facebook));
        $("#twitterInput").val(util.getEmptyValueIfInvalid(entry.twitter));
        $("#wechatInput").val(util.getEmptyValueIfInvalid(entry.wechat));

        phoneObj.populateDetail(entry.phone);
        addressObj.populateDetail(entry.address);
    },
    deleteEntry: function () {
        $('#deleteCustomerConfirmationDialog').popup('close');
        if (customerObj.currentEntryId != null) {
            var soapType = new DeleteCustomerInfoType(customerObj.currentEntryId);
            callWebService(soapType, customerObj.deleteEntryHandler);
            customerObj.currentEntryId = null;
        }
    },
    deleteEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.deletecustomerinforesponsetype)) {
            customerObj.fetchEntry();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete customer", response.deletecustomerinforesponsetype.result);
        }
    },
    newEntry: function () {
        customerObj.clearEntryDetails();
        $('#editCustomerDetailPopup').popup('open');
    },
    clearEntryDetails: function () {
        $("#error-message").hide();
        $("#firstNameInput").val("");
        $("#lastNameInput").val("");
        $("#prefixInput").val("");
        $("#birthdayInput").val("");
        $("#emailInput").val("");
        $("#descriptionInput").val("");
        $("#facebookInput").val("");
        $("#twitterInput").val("");
        $("#wechatInput").val("");
        $("#message").html("");
        customerObj.currentEntryId = null;
        phoneObj.clearEntryDetails();
        addressObj.clearEntryDetails();
    },
    validateInput: function() {
        var firstName = $("#firstNameInput").val();
        var lastName = $("#lastNameInput").val();
        var phone = $("#phoneInput").val();
        var email = $("#emailInput").val();
        if (!util.isValidVariable(firstName) && !util.isValidVariable(lastName) && !util.isValidVariable(phone) && !util.isValidVariable(email)) {
            return false;
        }
        return true;
    },
    save: function () {
        if(!customerObj.validateInput()) {
            $("#error-message").show();
            return;
        }
        var id = customerObj.currentEntryId;
        var entry = customerObj.customerListById[id];
        var name = $("#firstNameInput").val();
        var customerInfoSoapRequestType = customerObj.getCustomerInfoSoapRequestType(entry);
        var soapType = new SaveCustomerInfoType(customerInfoSoapRequestType);
		callWebService(soapType, customerObj.saveCustomerHandler);
    },
    getCustomerInfoSoapRequestType: function(entry) {
        var cardNumber = $("#cardNumberInput").val();
        var firstName = $("#firstNameInput").val();
        var lastName = $("#lastNameInput").val();
        var prefix = $("#prefixInput").val();
        var birthday = $("#birthdayInput").val();
        var email = $("#emailInput").val();
        var description = $("#descriptionInput").val();
        var facebook = $("#facebookInput").val();
        var twitter = $("#twitterInput").val();
        var wechat = $("#wechatInput").val();

        var id = null;
        if (util.isValidVariable(entry)) {
            id = entry.id;
        }

        var phoneSoapRequestType = [];
        if (util.isValidVariable(entry)) {
            var phoneSoapObjectList = util.getElementsArray(entry.phone);
            if (phoneSoapObjectList.length > 0) {
                for (var i = 0; i < phoneSoapObjectList.length; i++) {
                    var phoneSoapType;
                    if (i == 0) {
                        phoneSoapType = phoneObj.getSoapType();
                    } else {
                        phoneSoapType = phoneObj.getSoapType(phoneSoapObjectList[i]);
                    }
                    if (phoneSoapType != null) {
                        phoneSoapRequestType.push(phoneSoapType);
                    }
                }
            } else {
                var phoneSoapType = phoneObj.getSoapType();
                if (phoneSoapType != null) {
                    phoneSoapRequestType.push(phoneSoapType);
                }
            }
        } else {
            var phoneSoapType = phoneObj.getSoapType();
            if (phoneSoapType != null) {
                phoneSoapRequestType.push(phoneSoapType);
            }
        }

        var addressSoapRequestType = [];
        if (util.isValidVariable(entry)) {
            var addressSoapObjectList = util.getElementsArray(entry.address);
            if (addressSoapObjectList.length > 0) {
                for (var i = 0; i < addressSoapObjectList.length; i++) {
                    var addressSoapType;
                    if (i == 0) {
                        addressSoapType = addressObj.getSoapType();
                    } else {
                        addressSoapType = addressObj.getSoapType(addressSoapObjectList[i]);
                    }
                    if (addressSoapType != null) {
                        addressSoapRequestType.push(addressSoapType);
                    }
                }
            } else {
                var addressSoapType = addressObj.getSoapType();
                if (addressSoapType != null) {
                    addressSoapRequestType.push(addressSoapType);
                }
            }
        } else {
            var addressSoapType = addressObj.getSoapType();
            if (addressSoapType != null) {
                addressSoapRequestType.push(addressSoapType);
            }
        }

        var soapType = new CustomerInfoType(id, firstName, lastName, prefix, email, birthday, description, facebook, twitter, wechat, null, null, null, null, addressSoapRequestType, phoneSoapRequestType);
        return soapType;
    },
    refreshWithoutChanges: function () {
        $('#editCustomerDetailPopup').popup('close');
        customerObj.clearEntryDetails();
    },
    saveCustomerHandler: function (response) {
        if (util.isSuccessfulResponse(response.savecustomerinforesponsetype)) {
            customerObj.fetchEntry();
            $('#editCustomerDetailPopup').popup('close');
        } else {
            $("editCustomerDetailPopup").effect("shake");
            $("#message").html("Failed to save customer!")
        }
    },
    openManageAddressPanel: function () {
        $('#editAddressDetailPopup').popup('open');
    },
};

var phoneObj = {
    getSummary: function(jsonObj) {
        var phoneList = util.getElementsArray(jsonObj);
        if (phoneList.length > 0) {
            return util.getEmptyValueIfInvalid(phoneList[0].number);
        }
        return "";
    },
    populateDetail : function(entry) {
        var phoneList = util.getElementsArray(entry);
        if (phoneList.length > 0) {
            var phoneInfo = phoneList[0];
            $("#phoneInput").val(util.getEmptyValueIfInvalid(phoneInfo.number).toString().replace(/(\d{3})(\d{3})(\d{4})/, "($1)$2-$3"));
        }
    },
    clearEntryDetails: function () {
        $("#phoneInput").val("");
    },
    getSoapType : function(jsonObj) {
        var requestSoapType = null;
        if (util.isValidVariable(jsonObj)) {
            requestSoapType = new PhoneInfoType(jsonObj.id, jsonObj.number, jsonObj.extension, jsonObj.type, jsonObj.description, jsonObj.primaryuse);
        } else {
            var number = util.clearBlankSpace($("#phoneInput").val());
            if (util.isValidPhoneNumber(number)) {
                //id, number, extension, type, description, primaryUse
                number = number.replace(/\D/g,'');
                requestSoapType = new PhoneInfoType(null, number);
            } else if (util.isValidVariable(number)) {
                $('#editLoyaltyCardDetailPopup').effect("shake");
                $('#message').html("Invalid phone number format. Ex: (xxx)xxx-xxxx");
                throw "Invalid phone number format. Ex: (xxx)xxx-xxxx";
            }
        }
        return requestSoapType;
    }
};

var addressObj = {
    getSummary: function(elementJsonObj) {
        var addressList = util.getElementsArray(elementJsonObj);
        if (addressList.length > 0) {
            return util.getEmptyValueIfInvalid(addressList[0].address1) + "," + util.getEmptyValueIfInvalid(addressList[0].state) + ", "
                    + util.getEmptyValueIfInvalid(addressList[0].city) + " " + util.getEmptyValueIfInvalid(addressList[0].zipcode);
        }
        return "";
    },
    populateDetail : function(entry) {
        var addressList = util.getElementsArray(entry);
        if (addressList.length > 0) {
            var addressInfo = addressList[0];
            $("#address1Input").val(util.getEmptyValueIfInvalid(addressInfo.address1));
            $("#address2Input").val(util.getEmptyValueIfInvalid(addressInfo.address2));
            $("#stateInput").val(util.getEmptyValueIfInvalid(addressInfo.state));
            $("#cityInput").val(util.getEmptyValueIfInvalid(addressInfo.city));
            $("#zipcodeInput").val(util.getEmptyValueIfInvalid(addressInfo.zipcode));
        }
    },
    clearEntryDetails: function () {
        $("#address1Input").val("");
        $("#address2Input").val("");
        $("#stateInput").val("");
        $("#cityInput").val("");
        $("#zipcodeInput").val("");
    },
    getSoapType : function(jsonObj) {
        var requestSoapType = null;
        if (util.isValidVariable(jsonObj)) {
            requestSoapType = new AddressInfoType(jsonObj.id, jsonObj.address1, jsonObj.address2, jsonObj.state, jsonObj.city, jsonObj.zipcode, jsonObj.type, jsonObj.description, jsonObj.primaryuse);
        } else {
            var address1 = $("#address1Input").val();
            var address2 = $("#address2Input").val();
            var state = $("#stateInput").val();
            var city = $("#cityInput").val();
            var zipcode = $("#zipcodeInput").val();
            //id,address1, address2, state, city, zipcode, type, description, primaryuse
            if (util.isValidVariable(address1)) {
                requestSoapType = new AddressInfoType(null, address1, address2, state, city, zipcode);
            }
        }
        return requestSoapType;
    }
};


var membershipLevelObj = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    cloudServiceEnabled: false,
    init : function() {
        var findCloudLoyaltyProgramServiceEnabledSoapType = new FindSystemConfigurationsType('CLOUD_LOYALTY_PROGRAM_SERVICE_ENABLED', false);
        callWebService(findCloudLoyaltyProgramServiceEnabledSoapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
                var configList = util.getElementsArray(jsonObj.listsystemconfigurationsresponsetype.systemconfiguration);
                if (configList.length > 0) {
                    membershipLevelObj.cloudServiceEnabled = util.isBooleanTrue(configList[0].value);
                }
            }
        });
        membershipLevelObj.listAllElements();
        membershipLevelObj.listAllDiscounts();
        uiBaseObj.addDeleteConfirmDialog("loyaltyCard-page", "deleteMembershipLevelConfirmationDialog", "membershipLevelObj", "membershipLevelObj.deleteRow();");
    },
    clearDetails : function(disabled) {
        $("#membershipLevelName").val("");
        $("#membershipLevelDescription").val("");
        $("#discount-select-list").val("").selectmenu("refresh");
        $("#minPointsThreshold").val("");
        $("#btnSaveMembershipLevel").prop("disabled", disabled);
        $("#membershipLevelName").prop("disabled", disabled);
        $("#membershipLevelDescription").prop("disabled", disabled);
        $("#discount-select-list").prop("disabled", disabled);
        $("#minPointsThreshold").prop("disabled", disabled);
        membershipLevelObj.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        membershipLevelObj.clearDetails(false);
        membershipLevelObj.v_selected_rowid = "";
        $("#curMembershipLevelId").val("");
    },
    listAllElements : function (){
        membershipLevelObj.clearDetails(true);
        var soapType = new FindMembershipLevelsType();
        callWebService(soapType, membershipLevelObj.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findmembershiplevelsresponsetype)) {
            //Clear the table
            $("#membershipLevelsTable").empty();

            var membershipLevelSelectList = $('#membership-level-select-list');
            var isSelectListPresent = util.isValidVariable(membershipLevelSelectList);
            if (isSelectListPresent) {
                membershipLevelSelectList.find('option:gt(0)').remove();
            }

            var membershipLevelList = util.getElementsArray(jsonObj.findmembershiplevelsresponsetype.membershiplevels);
            membershipLevelObj.elementList = membershipLevelList;

            for (var i = 0; i < membershipLevelList.length; i++) {
                var membershipLevel = membershipLevelList[i];
                membershipLevelObj.addRow("membershipLevelsTable", membershipLevel, "membershipLevelObj.selectRow", "membershipLevelObj.deleteWithConfirmationDialog");
                if (isSelectListPresent) {
                    membershipLevelSelectList.append("<option value='" + membershipLevel.id + "'>" + membershipLevel.name + "</option>").trigger("create");
                }
            }
        }
    },
    listAllDiscounts : function() {
        if (!membershipLevelObj.cloudServiceEnabled) {
            var soapType = new ListDiscountRatesType();
            callWebService(soapType, membershipLevelObj.listAllDiscountsHandler);
        }
    },
    listAllDiscountsHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listdiscountratesresponsetype)) {
            $('#discount-select-list').find('option:gt(0)').remove();
            var discountList = util.getElementsArray(jsonObj.listdiscountratesresponsetype.discounts);
            for (var i = 0; i < discountList.length; i++) {
                var discount = discountList[i];
                $("#discount-select-list").append("<option value='" + discount.id + "'>" + discount.name + "</option>").trigger("create");
            }
        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        membershipLevelObj.action = uiBaseObj.UPDATE;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var curr_membershipLevel = membershipLevelObj.elementList[i];
                if (curr_membershipLevel != null) {
                    $("#curMembershipLevelId").val(curr_membershipLevel.id);
                    $("#discount-select-list").val(curr_membershipLevel.discountid).selectmenu("refresh");
                    $("#membershipLevelDescription").val(util.getEmptyValueIfInvalid(curr_membershipLevel.description));
                    $("#minPointsThreshold").val(util.getEmptyValueIfInvalid(curr_membershipLevel.minpointsthreshold));
                    $("#curMembershipLevelId").val(curr_membershipLevel.id);
                    $("#membershipLevelName").prop("disabled", false);
                    $("#membershipLevelDescription").prop("disabled", false);
                    $("#discount-select-list").prop("disabled", false);
                    $("#minPointsThreshold").prop("disabled", false);
                    
                    if (membershipLevelObj.cloudServiceEnabled) {
                        $("#membershipLevelName").val(membershipLevelObj.getCloudDiscountName(curr_membershipLevel.name));
                        $('#discount-select-list').empty();
                        $("#discount-select-list").append("<option value='-1'>" + membershipLevelObj.getCloudDiscount(curr_membershipLevel.name) + "</option>").trigger("create");
                        $("#discount-select-list").val('-1').selectmenu("refresh");
                    } else {
                        $("#membershipLevelName").val(curr_membershipLevel.name);
                        $("#discount-select-list").val(curr_membershipLevel.discountid).selectmenu("refresh");
                    }
                }
                $("#btnSaveMembershipLevel").prop("disabled", false);
            }
        }
    },
    addRow : function (tableID, elementObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.name = rowId;
        var displayName = membershipLevelObj.cloudServiceEnabled ? membershipLevelObj.getCloudDiscountName(elementObj.name) : elementObj.name;

        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+displayName+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (membershipLevelObj.toBeDeletedElementID && membershipLevelObj.toBeDeletedElementID >=0) {
            var soapType = new DeleteMembershipLevelType(membershipLevelObj.toBeDeletedElementID);
            callWebService(soapType, membershipLevelObj.deleteElementHandler);
        }
        membershipLevelObj.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        membershipLevelObj.toBeDeletedElementID = id;
        membershipLevelObj.v_selected_rowid = "";
        document.getElementById("curMembershipLevelId").value = "";
        $('#deleteMembershipLevelConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletemembershiplevelresponsetype)) {
            membershipLevelObj.listAllElements();
            $("#btnSaveMembershipLevel").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete membershipLevelObj!", jsonObj.deletemembershiplevelresponsetype.result);
        }
    },
    validateInput : function() {
        var name = $("#membershipLevelName").val();
        if (!util.isValidVariable(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        if (!membershipLevelObj.validateInput()) {
            return;
        }

        var id = $("#curMembershipLevelId").val();
        var name = $("#membershipLevelName").val();
        var description = $("#membershipLevelDescription").val();
        var discountId = $("#discount-select-list").val();
        var minPointsThreshold = $('#minPointsThreshold').val();
        var soapType = new SaveMembershipLevelType(id, name, description, discountId, minPointsThreshold);
        callWebService(soapType, membershipLevelObj.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savemembershiplevelresponsetype)) {
            if(membershipLevelObj.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            }else if(membershipLevelObj.action == uiBaseObj.UPDATE){
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            membershipLevelObj.listAllElements();
            if (membershipLevelObj.v_selected_rowid) {
                var selectedRow = document.getElementById(membershipLevelObj.v_selected_rowid);
                membershipLevelObj.selectRow("membershipLevelsTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Membership Level!", jsonObj.savemembershiplevelresponsetype.result);
        }
    },
    getCloudDiscount: function(str){
        var len = str.length;
        var dis = "";
        for(var i = len - 2; i >=0; i--){
            if(str[i] != '('){
                dis += str[i];
            }
            else {
                break;
            }
        }
        return dis.split("").reverse().join("");
    },
    getCloudDiscountName:function(str){
        var dis = membershipLevelObj.getCloudDiscount(str);
        var len = str.length - dis.length - 2;
        var disName = "";
        if(len <= 0) return "";
        else{
            for(var i = 0; i < len; i++){
                disName += str[i];
            }
        }
        return disName;
    }
};

var loyaltyCardPageObj = {
    init : function() {
        loyaltyCardObj.init();
        membershipLevelObj.init();
    }
}