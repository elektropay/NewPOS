var merchantStorePage = {
    init : function() {
        merchantStore.init();
        uiBaseObj.addDeleteConfirmDialog("merchantStorePage", "deleteMerchantStoreConfirmationDialog", "MerchantStore", "merchantStore.deleteRow();");
    }
};

var merchantStore = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        merchantStore.listAllElements();
    },
    clearDetails : function(disableElements) {
        $("#merchantStoreName").val("");
        $("#merchantStoreName").prop("readOnly", disableElements);
        $("#merchantStoreId").val("");
        $("#merchantStoreId").prop("readOnly", disableElements);
        $("#merchantId").val("");
        $("#merchantId").prop("readOnly", disableElements);
        $("#busyIndicatorSetup").val("");
        $("#busyIndicatorSetup").prop("readOnly", disableElements);
        $("#btnSaveMerchantStore").prop("disabled", disableElements);
        merchantStore.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        merchantStore.clearDetails(false);
        merchantStore.v_selected_rowid = "";
        $("#curMerchantStoreEntryId").val("");
        $("#merchantStoreId").focus();
    },
    listAllElements : function (){
        merchantStore.clearDetails(true);
        var soapType = new FindMerchantStoresType();
        callWebService(soapType, merchantStore.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findmerchantstoresresponsetype)) {
            //Clear the table
            $("#merchantStoreTable").empty();
            merchantStore.elementList = util.getElementsArray(jsonObj.findmerchantstoresresponsetype.merchantstores);
            for (var i = 0; i < merchantStore.elementList.length; i++) {
                merchantStore.addRow("merchantStoreTable", merchantStore.elementList[i], "merchantStore.selectRow", "merchantStore.deleteMerchantStoreConfirmationDialog");
            }
        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        merchantStore.action = uiBaseObj.UPDATE;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var selectedElement = merchantStore.elementList[i];
                if (selectedElement != null) {
                    $("#curMerchantStoreEntryId").val(selectedElement.id);
                    $("#merchantStoreName").val(selectedElement.name);
                    $("#merchantStoreName").prop("readOnly", false);
                    $("#merchantStoreId").val(selectedElement.storeid);
                    $("#merchantStoreId").prop("readOnly", false);
                    $("#merchantId").val(selectedElement.merchantid);
                    $("#merchantId").prop("readOnly", false);
                    $("#busyIndicatorSetup").val(selectedElement.busystatussetup);
                    $("#busyIndicatorSetup").prop("readOnly", false);
                }
                $("#btnSaveMerchantStore").prop("disabled", false);
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

        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+elementObj.storeid+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (merchantStore.toBeDeletedElementID && merchantStore.toBeDeletedElementID >=0) {
            var soapType = new DeleteMerchantStoreType(merchantStore.toBeDeletedElementID);
            callWebService(soapType, merchantStore.deleteElementHandler);
        }
        merchantStore.toBeDeletedElementID = -1;
    },
    deleteMerchantStoreConfirmationDialog : function (id) {
        merchantStore.toBeDeletedElementID = id;
        merchantStore.v_selected_rowid = "";
        $("#curMerchantStoreEntryId").val("");
        $('#deleteMerchantStoreConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletemerchantstoreresponsetype)) {
            merchantStore.listAllElements();
            $("#btnSaveMerchantStore").prop("disabled", false);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete merchant store!", jsonObj.deletemerchantstoreresponsetype.result);
        }
    },
    validateInput : function() {
        var merchantStoreId = $("#merchantStoreId").val();
        var merchantId = $("#merchantId").val();
        if (util.isNullOrEmpty(merchantStoreId) || util.isNullOrEmpty(merchantId)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_MERCHANT_STORE_INFO, "Store ID and merchant ID cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        if (!merchantStore.validateInput()) {
            return;
        }
        var entryId = $("#curMerchantStoreEntryId").val();
        var merchantStoreName = $("#merchantStoreName").val();
        var storeId = $("#merchantStoreId").val();
        var merchantId = $("#merchantId").val();
        var busyIndicatorSetup = $("#busyIndicatorSetup").val();
        var soapType = new SaveMerchantStoreType(entryId, merchantId, merchantStoreName, storeId, busyIndicatorSetup);
        callWebService(soapType, merchantStore.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savemerchantstoreresponsetype)) {
            if(merchantStore.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(merchantStore.action = uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            merchantStore.listAllElements();
            if (merchantStore.v_selected_rowid) {
                var selectedRow = document.getElementById(merchantStore.v_selected_rowid);
                merchantStore.selectRow("merchantStoreTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save merchant store!", jsonObj.savemerchantstoreresponsetype.result);
        }
    }
};