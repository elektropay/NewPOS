var inventoryInfoPage = {
    init : function() {        
        inventoryVendor.init();
        inventoryLocation.init();
        uiBaseObj.addDeleteConfirmDialog("inventoryInfoPage", "deleteInventoryVendorConfirmationDialog", "Inventory Vendor", "inventoryVendor.deleteRow();");
        uiBaseObj.addDeleteConfirmDialog("inventoryInfoPage", "deleteConfirmationDialog", "Inventory Location", "inventoryLocation.deleteRow();");        
    }
};

var inventoryVendor = {
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        inventoryVendor.listAllElements();
    },
    clearDetails : function(disableElements) {
        $("#vendorName").val("");
        $("#vendorName").prop("readOnly", disableElements);
        $("#vendorPhoneNum").val("");
        $("#vendorPhoneNum").prop("readOnly", disableElements);
        $("#vendorDescription").val("");
        $("#vendorDescription").prop("readOnly", disableElements);
        $("#btnVendorSave").prop("disabled", disableElements);
    },
    newEntry : function () {
        inventoryVendor.clearDetails(false);
        inventoryVendor.v_selected_rowid = "";
        $("#curVendorEntryId").val("");
        $("#vendorName").focus();
    },
    listAllElements : function (){
        inventoryVendor.clearDetails(true);
        var soapType = new FindInventoryVendorsType();
        callWebService(soapType, inventoryVendor.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findinventoryvendorsresponsetype)) {
            //Clear the table
            $("#inventoryVendorTable").empty();
            inventoryVendor.elementList = util.getElementsArray(jsonObj.findinventoryvendorsresponsetype.inventoryvendors);
            for (var i = 0; i < inventoryVendor.elementList.length; i++) {
                inventoryVendor.addRow("inventoryVendorTable", inventoryVendor.elementList[i], "inventoryVendor.selectRow", "inventoryVendor.deleteWithConfirmationDialog");
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
                var selectedElement = inventoryVendor.elementList[i];
                if (selectedElement != null) {
                    $("#curVendorEntryId").val(selectedElement.id);
                    $("#vendorName").val(selectedElement.name);
                    $("#vendorName").prop("readOnly", false);
                    $("#vendorPhoneNum").val(util.getStringValue(selectedElement.phonenum));
                    $("#vendorPhoneNum").prop("readOnly", false);
                    $("#vendorDescription").val(util.getStringValue(selectedElement.description));
                    $("#vendorDescription").prop("readOnly", false);
                }
                $("#btnVendorSave").prop("disabled", false);
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

        var displayValue = elementObj.name;
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+displayValue+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (inventoryVendor.toBeDeletedElementID && inventoryVendor.toBeDeletedElementID >=0) {
            var soapType = new DeleteInventoryVendorType(inventoryVendor.toBeDeletedElementID);
            callWebService(soapType, inventoryVendor.deleteElementHandler);
        }
        inventoryVendor.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        inventoryVendor.toBeDeletedElementID = id;
        inventoryVendor.v_selected_rowid = "";
        $("#curVendorEntryId").val("");
        $('#deleteInventoryVendorConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteinventoryvendorresponsetype)) {
            inventoryVendor.listAllElements();
            $("#btnVendorSave").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Inventory Vendor!", jsonObj.deleteinventoryvendorresponsetype.result);
        }
    },
    validateInput : function() {
        var vendorName = $("#vendorName").val();
        if (util.isNullOrEmpty(vendorName)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        if (!inventoryVendor.validateInput()) {
            return;
        }
        var entryId = $("#curVendorEntryId").val();
        var vendorName = util.getXMLSafeValue($("#vendorName").val());
        var vendorPhoneNum = $("#vendorPhoneNum").val();
        var vendorDescription = util.getXMLSafeValue($("#vendorDescription").val());
        var soapType = new SaveInventoryVendorType(entryId, vendorName, vendorPhoneNum, vendorDescription);
        callWebService(soapType, inventoryVendor.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveinventoryvendorresponsetype)) {
            inventoryVendor.listAllElements();
            if (inventoryVendor.v_selected_rowid) {
                var selectedRow = document.getElementById(inventoryVendor.v_selected_rowid);
                inventoryVendor.selectRow("inventoryVendorTable", selectedRow);
            }
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Inventory Vendor!", jsonObj.saveinventoryvendorresponsetype.result);
        }
    }
};

var inventoryLocation = {
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        inventoryLocation.listAllElements();
    },
    clearDetails : function(disableElements) {
        $("#name").val("");
        $("#name").prop("readOnly", disableElements);
        $("#contactInfo").val("");
        $("#contactInfo").prop("readOnly", disableElements);
        $("#address1").val("");
        $("#address1").prop("readOnly", disableElements);
        $("#address2").val("");
        $("#address2").prop("readOnly", disableElements);
        $("#city").val("");
        $("#city").prop("readOnly", disableElements);
        $("#state").val("");
        $("#state").prop("readOnly", disableElements);
        $("#zipCode").val("");
        $("#zipCode").prop("readOnly", disableElements);
        $("#phoneNum").val("");
        $("#phoneNum").prop("readOnly", disableElements);
        $("#description").val("");
        $("#description").prop("readOnly", disableElements);
        $("#btnSave").prop("disabled", disableElements);
    },
    newEntry : function () {
        inventoryLocation.clearDetails(false);
        inventoryLocation.v_selected_rowid = "";
        $("#curEntryId").val("");
        $("#name").focus();
    },
    listAllElements : function (){
        inventoryLocation.clearDetails(true);
        var soapType = new FindInventoryLocationsType();
        callWebService(soapType, inventoryLocation.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findinventorylocationsresponsetype)) {
            //Clear the table
            $("#inventoryLocationTable").empty();
            inventoryLocation.elementList = util.getElementsArray(jsonObj.findinventorylocationsresponsetype.inventorylocations);
            for (var i = 0; i < inventoryLocation.elementList.length; i++) {
                inventoryLocation.addRow("inventoryLocationTable", inventoryLocation.elementList[i], "inventoryLocation.selectRow", "inventoryLocation.deleteWithConfirmationDialog");
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
                var selectedElement = inventoryLocation.elementList[i];
                if (selectedElement != null) {
                    $("#curEntryId").val(selectedElement.id);
                    $("#name").val(selectedElement.name);
                    $("#name").prop("readOnly", false);
                    $("#contactInfo").val(util.getStringValue(selectedElement.contactinfo));
                    $("#contactInfo").prop("readOnly", false);
                    $("#address1").val(util.getStringValue(selectedElement.address1));
                    $("#address1").prop("readOnly", false);
                    $("#address2").val(util.getStringValue(selectedElement.address2));
                    $("#address2").prop("readOnly", false);
                    $("#city").val(selectedElement.city);
                    $("#city").prop("readOnly", false);
                    $("#state").val(util.getStringValue(selectedElement.state));
                    $("#state").prop("readOnly", false);
                    $("#zipCode").val(util.getStringValue(selectedElement.zipcode));
                    $("#zipCode").prop("readOnly", false);
                    $("#phoneNum").val(util.getStringValue(selectedElement.phonenum));
                    $("#phoneNum").prop("readOnly", false);
                    $("#description").val(util.getStringValue(selectedElement.description));
                    $("#description").prop("readOnly", false);
                }
                $("#btnSave").prop("disabled", false);
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

        var displayValue = elementObj.name;
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+displayValue+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (inventoryLocation.toBeDeletedElementID && inventoryLocation.toBeDeletedElementID >=0) {
            var soapType = new DeleteInventoryLocationType(inventoryLocation.toBeDeletedElementID);
            callWebService(soapType, inventoryLocation.deleteElementHandler);
        }
        inventoryLocation.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        inventoryLocation.toBeDeletedElementID = id;
        inventoryLocation.v_selected_rowid = "";
        $("#curEntryId").val("");
        $('#deleteConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteinventorylocationresponsetype)) {
            inventoryLocation.listAllElements();
            $("#btnSave").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Inventory Location!", jsonObj.deleteinventorylocationresponsetype.result);
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
        if (!inventoryLocation.validateInput()) {
            return;
        }
        var entryId = $("#curEntryId").val();
        var name = util.getXMLSafeValue($("#name").val());
        var contactInfo = util.getXMLSafeValue($("#contactInfo").val());
        var address1 = util.getXMLSafeValue($("#address1").val());
        var address2 = util.getXMLSafeValue($("#address2").val());
        var city = $("#city").val();
        var state = $("#state").val();
        var zipCode = $("#zipCode").val();
        var phoneNum = $("#phoneNum").val();
        var description = util.getXMLSafeValue($("#description").val());
        var soapType = new SaveInventoryLocationType(entryId, name, contactInfo, address1, address2, city, state, zipCode, phoneNum, description);
        callWebService(soapType, inventoryLocation.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveinventorylocationresponsetype)) {
            inventoryLocation.listAllElements();
            if (inventoryLocation.v_selected_rowid) {
                var selectedRow = document.getElementById(inventoryLocation.v_selected_rowid);
                inventoryLocation.selectRow("inventoryLocationTable", selectedRow);
            }
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Inventory Location!", jsonObj.saveinventorylocationresponsetype.result);
        }
    }
};