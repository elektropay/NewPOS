var discount = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        discount.listAllElements();
        uiBaseObj.addDeleteConfirmDialog("discountPage", "deleteDiscountConfirmationDialog", "Discount", "discount.deleteRow();");
    },
    clearDetails : function() {
        document.getElementById("discountName").value = "";
        document.getElementById("discountName").readOnly = false;
        document.getElementById("discountDescription").value = "";
        document.getElementById("discountDescription").readOnly = false;
        document.getElementById("discountRate").value = "";
        document.getElementById("discountRate").readOnly = false;
        document.getElementById("discountRateType").readOnly = false;
        discount.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        discount.clearDetails();
        discount.v_selected_rowid = "";
        document.getElementById("curDiscountId").value = "";
    },
    listAllElements : function (){
        discount.clearDetails();
        var soapType = new ListDiscountRatesType();
        callWebService(soapType, discount.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listdiscountratesresponsetype)) {
            //Clear the table
            document.getElementById("discount").innerHTML = "";
            discount.elementList = util.getElementsArray(jsonObj.listdiscountratesresponsetype.discounts);
            for (var i = 0; i < discount.elementList.length; i++) {
                discount.addRow("discount", discount.elementList[i], "discount.selectRow", "discount.deleteWithConfirmationDialog");
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
                var curr_discount = discount.elementList[i];
                if (curr_discount != null) {
                    document.getElementById("curDiscountId").value = curr_discount.id;
                    document.getElementById("discountName").value = curr_discount.name;
                    document.getElementById("discountName").readOnly = false;
                    document.getElementById("discountRate").value = curr_discount.rate;
                    document.getElementById("discountRate").readOnly = false;
                    $("#discountRateType").val(curr_discount.ratetype).selectmenu("refresh");
                    document.getElementById("discountDescription").value = util.getStringValue(curr_discount.description);
                    document.getElementById("discountDescription").readOnly = false;
                }
                document.getElementById("btnSave").disabled = false;
            }
        }
        discount.action = uiBaseObj.UPDATE;
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
        if (discount.toBeDeletedElementID && discount.toBeDeletedElementID >=0) {
            var soapType = new DeleteDiscountType(discount.toBeDeletedElementID);
            callWebService(soapType, discount.deleteElementHandler);
        }
        discount.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        discount.toBeDeletedElementID = id;
        discount.v_selected_rowid = "";
        document.getElementById("curDiscountId").value = "";
        $('#deleteDiscountConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletediscountrateresponsetype)) {
            discount.listAllElements();
            document.getElementById("btnSave").disabled = false;
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete discount!", jsonObj.deletediscountrateresponsetype.result);
        }
    },
    validateInput : function() {
        var rateValue = document.getElementById("discountRate").value;
        if (rateValue == null || rateValue.trim() == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_RATE, "Rate cannot be empty!");
            return false;
        }
        if (!util.isNumber(rateValue)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NOT_NUMBER, "Rate must be a number!");
            return false;
        }
        if (rateValue < 0) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NUMBER_NOT_POSITIVE, "Rate cannot be negative!");
            return false;
        }
        var type = document.getElementById('discountRateType');
        if (type.selectedIndex == 1) {
            if (rateValue > 100) {
                uiBaseObj.alert(systemLanguage.msgCodeList.RATE_NOT_PERCENTAGE, "Rate percentage cannot be more than 100!");
                return false;
            }
        }
        return true;
    },
    saveElement : function () {
        $("#btnSave").prop("disabled", true);
        if (!discount.validateInput()) {
            $("#btnSave").prop("disabled", false);
            return;
        }
        var discountId = document.getElementById("curDiscountId").value;
        var aName = document.getElementById("discountName").value;
        var aRate = document.getElementById("discountRate").value;
        var aRateType = document.getElementById("discountRateType").value;
        var aDescription = document.getElementById("discountDescription").value;
        var soapType = new SaveDiscountType(discountId, aRate, aRateType, aName, aDescription);
        callWebService(soapType, discount.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savediscountrateresponsetype)) {
            if(discount.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(discount.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            discount.listAllElements();
            if (discount.v_selected_rowid) {
                var selectedRow = document.getElementById(discount.v_selected_rowid);
                discount.selectRow("discount", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save discount!", jsonObj.savediscountrateresponsetype.result);
        }
        $("#btnSave").prop("disabled", false);
    }
};