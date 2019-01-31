var paymentAccount = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        paymentAccount.listAllElements();
        uiBaseObj.addDeleteConfirmDialog("paymentAccountPage", "deleteConfirmationDialog", "payment Account", "paymentAccount.deleteRow();");
    },
    clearDetails : function() {
        $("#name").val("");
        $("#name").prop("readOnly", false);
        $("#description").val("");
        $("#description").prop("readOnly", false);
        $("#billedToSelf").prop('checked', false).checkboxradio("refresh");
        $("#billedToSelf").prop("readOnly", false);
        $("#btnSave").prop("disabled", false);
        paymentAccount.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        paymentAccount.clearDetails();
        paymentAccount.v_selected_rowid = "";
        $("#curEntryId").val("");
    },
    listAllElements : function (){
        paymentAccount.clearDetails();
        var soapType = new FindPaymentAccountsType();
        callWebService(soapType, paymentAccount.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findpaymentaccountsresponsetype)) {
            //Clear the table
            $("#paymentAccountTable").empty();
            paymentAccount.elementList = util.getElementsArray(jsonObj.findpaymentaccountsresponsetype.paymentaccounts);
            for (var i = 0; i < paymentAccount.elementList.length; i++) {
                paymentAccount.addRow("paymentAccountTable", paymentAccount.elementList[i], "paymentAccount.selectRow", "paymentAccount.deleteWithConfirmationDialog");
            }

        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var selectedElement = paymentAccount.elementList[i];
                if (selectedElement != null) {
                    $("#curEntryId").val(selectedElement.id);
                    $("#name").val(selectedElement.name);
                    $("#name").prop("readOnly", false);
                    $("#billedToSelf").prop('checked', util.isBooleanTrue(selectedElement.billedtoself)).checkboxradio("refresh");
                    $("#description").val(util.getStringValue(selectedElement.description));
                    $("#description").prop("readOnly", false);
                }
                $("#btnSave").prop("disabled", false);
            }
        }
        paymentAccount.action = uiBaseObj.UPDATE;
    },
    addRow : function (tableID, elementObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.name = rowId;

        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+elementObj.name+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (paymentAccount.toBeDeletedElementID && paymentAccount.toBeDeletedElementID >=0) {
            var soapType = new DeletePaymentAccountType(paymentAccount.toBeDeletedElementID);
            callWebService(soapType, paymentAccount.deleteElementHandler);
        }
        paymentAccount.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        paymentAccount.toBeDeletedElementID = id;
        paymentAccount.v_selected_rowid = "";
        $("#curEntryId").val("");
        $('#deleteConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletepaymentaccountresponsetype)) {
            paymentAccount.listAllElements();
            $("#btnSave").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Payment Account!", jsonObj.deletepaymentaccountresponsetype.result);
        }
    },
    validateInput : function() {
        var name = $("#name").val();
        if (util.isNullOrEmpty(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        $("#btnSave").prop("disabled", true);
        if (!paymentAccount.validateInput()) {
            $("#btnSave").prop("disabled", false);
            return;
        }
        var entryId = $("#curEntryId").val();
        var aName = $("#name").val();
        var aDescription = $("#description").val();
        var billedToSelf = $("#billedToSelf").prop('checked');
        var soapType = new SavePaymentAccountType(entryId, aName, aDescription, billedToSelf);
        callWebService(soapType, paymentAccount.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savepaymentaccountresponsetype)) {
            if(paymentAccount.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(paymentAccount.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            paymentAccount.listAllElements();
            if (paymentAccount.v_selected_rowid) {
                var selectedRow = document.getElementById(paymentAccount.v_selected_rowid);
                paymentAccount.selectRow("paymentAccountTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Payment Account!", jsonObj.savepaymentaccountresponsetype.result);
        }
        $("#btnSave").prop("disabled", false);
    }
};