var deliveryArea = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        deliveryArea.listAllElements();
        uiBaseObj.addDeleteConfirmDialog("deliveryAreaPage", "deleteConfirmationDialog", "Delivery Area", "deliveryArea.deleteRow();");
    },
    clearDetails : function() {
        $("#city").val("");
        $("#city").prop("readOnly", false);
        $("#state").val("");
        $("#state").prop("readOnly", false);
        $("#zipCode").val("");
        $("#zipCode").prop("readOnly", false);
        $("#btnSave").prop("disabled", false);
        deliveryArea.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        deliveryArea.clearDetails();
        deliveryArea.v_selected_rowid = "";
        $("#curEntryId").val("");
    },
    listAllElements : function (){
        deliveryArea.clearDetails();
        var soapType = new FindDeliveryAreasType();
        callWebService(soapType, deliveryArea.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finddeliveryareasresponsetype)) {
            //Clear the table
            $("#deliveryAreaTable").empty();
            deliveryArea.elementList = util.getElementsArray(jsonObj.finddeliveryareasresponsetype.deliveryareas);
            for (var i = 0; i < deliveryArea.elementList.length; i++) {
                deliveryArea.addRow("deliveryAreaTable", deliveryArea.elementList[i], "deliveryArea.selectRow", "deliveryArea.deleteWithConfirmationDialog");
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
                var selectedElement = deliveryArea.elementList[i];
                if (selectedElement != null) {
                    $("#curEntryId").val(selectedElement.id);
                    $("#city").val(selectedElement.city);
                    $("#city").prop("readOnly", false);
                    $("#state").val(util.getStringValue(selectedElement.state));
                    $("#state").prop("readOnly", false);
                    $("#zipCode").val(util.getStringValue(selectedElement.zipcode));
                    $("#zipCode").prop("readOnly", false);
                }
                $("#btnSave").prop("disabled", false);
            }
        }
        deliveryArea.action = uiBaseObj.UPDATE;
    },
    addRow : function (tableID, elementObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.name = rowId;

        var displayValue = elementObj.city + ", " + elementObj.state + " " + elementObj.zipcode;
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+displayValue+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (deliveryArea.toBeDeletedElementID && deliveryArea.toBeDeletedElementID >=0) {
            var soapType = new DeleteDeliveryAreaType(deliveryArea.toBeDeletedElementID);
            callWebService(soapType, deliveryArea.deleteElementHandler);
        }
        deliveryArea.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        deliveryArea.toBeDeletedElementID = id;
        deliveryArea.v_selected_rowid = "";
        $("#curEntryId").val("");
        $('#deleteConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletedeliveryarearesponsetype)) {
            deliveryArea.listAllElements();
            $("#btnSave").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Delivery Area!", jsonObj.deletedeliveryarearesponsetype.result);
        }
    },
    validateInput : function() {
        var city = $("#city").val();
        if (util.isNullOrEmpty(city)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_CITY, "City cannot be empty!");
            return false;
        }
        var state = $("#state").val();
        if (util.isNullOrEmpty(state)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_STATE, "State cannot be empty!");
            return false;
        }
        var zipCode = $("#zipCode").val();
        if (util.isNullOrEmpty(zipCode)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_ZIP_CODE, "ZIP Code cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        $("#btnSave").prop("disabled", true);
        if (!deliveryArea.validateInput()) {
            $("#btnSave").prop("disabled", false);
            return;
        }
        var entryId = $("#curEntryId").val();
        var city = $("#city").val();
        var state = $("#state").val();
        var zipCode = $("#zipCode").val();
        var soapType = new SaveDeliveryAreaType(entryId, city, state, zipCode);
        callWebService(soapType, deliveryArea.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savedeliveryarearesponsetype)) {
            if(deliveryArea.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            } else if(deliveryArea.action = uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            }
            deliveryArea.listAllElements();
            if (deliveryArea.v_selected_rowid) {
                var selectedRow = document.getElementById(deliveryArea.v_selected_rowid);
                deliveryArea.selectRow("deliveryAreaTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Delivery Area!", jsonObj.savedeliveryarearesponsetype.result);
        }
        $("#btnSave").prop("disabled", false);
    }
};