var itemSizePage = {
    init : function() {
        itemSize.init();
        itemUnit.init();
        uiBaseObj.addDeleteConfirmDialog("itemSizePage", "deleteConfirmationDialog", "Item Size", "itemSize.deleteRow();");
        uiBaseObj.addDeleteConfirmDialog("itemSizePage", "deleteItemUnitConfirmationDialog", "Item Unit", "itemUnit.deleteRow();");
    }
};

var itemSize = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    validSizeNamePattern : /^[A-Za-z0-9\[\]]+$/,
    init : function() {
        itemSize.listAllElements();
    },
    clearDetails : function(disableElements) {
        $("#name").val("");
        $("#name").prop("readOnly", disableElements);
        $("#shortName").val("");
        $("#shortName").prop("readOnly", disableElements);
        $("#btnSave").prop("disabled", disableElements);
        itemSize.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        itemSize.clearDetails(false);
        itemSize.v_selected_rowid = "";
        $("#curEntryId").val("");
        $("#name").focus();
    },
    listAllElements : function (){
        itemSize.clearDetails(true);
        var soapType = new FindItemSizesType();
        callWebService(soapType, itemSize.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finditemsizesresponsetype)) {
            //Clear the table
            $("#itemSizeTable").empty();
            itemSize.elementList = util.getElementsArray(jsonObj.finditemsizesresponsetype.itemsizes);
            for (var i = 0; i < itemSize.elementList.length; i++) {
                itemSize.addRow("itemSizeTable", itemSize.elementList[i], "itemSize.selectRow", "itemSize.deleteWithConfirmationDialog");
            }

        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        itemSize.action = uiBaseObj.UPDATE;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var selectedElement = itemSize.elementList[i];
                if (selectedElement != null) {
                    $("#curEntryId").val(selectedElement.id);
                    $("#name").val(systemLanguage.getLanguageNames(selectedElement,'name','en'));
                    $("#name").prop("readOnly", false);
                    $("#shortName").val(util.getStringValue(selectedElement.shortname));
                    $("#shortName").prop("readOnly", false);
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
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+systemLanguage.getLanguageNames(elementObj,'name','en')+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (itemSize.toBeDeletedElementID && itemSize.toBeDeletedElementID >=0) {
            var soapType = new DeleteItemSizeType(itemSize.toBeDeletedElementID);
            callWebService(soapType, itemSize.deleteElementHandler);
        }
        itemSize.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        itemSize.toBeDeletedElementID = id;
        itemSize.v_selected_rowid = "";
        $("#curEntryId").val("");
        $('#deleteConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteitemsizeresponsetype)) {
            itemSize.listAllElements();
            $("#btnSave").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            setTimeout(function() {uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Item Size!", jsonObj.deleteitemsizeresponsetype.result);}, 100);
        }
    },
    validateInput : function() {
        var name = $("#name").val();
        if (util.isNullOrEmpty(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        var match = itemSize.validSizeNamePattern.test(name);
        if (!match) {
            uiBaseObj.alert(systemLanguage.msgCodeList.ALPHANUMERIC_INPUT_ONLY, "Alphanumeric input only");
            return false;
        }
        return true;
    },
    saveElement : function () {
        if (!itemSize.validateInput()) {
            return;
        }
        var entryId = $("#curEntryId").val();
        var aName = $("#name").val();
        var aShortName = $("#shortName").val();
        var soapType = new SaveItemSizeType(entryId, aName, aShortName);
        callWebService(soapType, itemSize.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveitemsizeresponsetype)) {
            if(itemSize.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(itemSize.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            itemSize.listAllElements();
            if (itemSize.v_selected_rowid) {
                var selectedRow = document.getElementById(itemSize.v_selected_rowid);
                itemSize.selectRow("itemSizeTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Item Size!", jsonObj.saveitemsizeresponsetype.result);
        }
    }
};

var itemUnit = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        itemUnit.listAllElements();
    },
    clearDetails : function(disableElements) {
        $("#unitName").val("");
        $("#unitName").prop("readOnly", disableElements);
        $("#btnSaveItemUnit").prop("disabled", disableElements);
        itemUnit.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        itemUnit.clearDetails(false);
        itemUnit.v_selected_rowid = "";
        $("#curItemUnitEntryId").val("");
        $("#unitName").focus();
    },
    listAllElements : function (){
        itemUnit.clearDetails(true);
        var soapType = new FindItemUnitsType();
        callWebService(soapType, itemUnit.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finditemunitsresponsetype)) {
            //Clear the table
            $("#itemUnitTable").empty();
            itemUnit.elementList = util.getElementsArray(jsonObj.finditemunitsresponsetype.itemunits);
            for (var i = 0; i < itemUnit.elementList.length; i++) {
                itemUnit.addRow("itemUnitTable", itemUnit.elementList[i], "itemUnit.selectRow", "itemUnit.deleteItemUnitConfirmationDialog");
            }

        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        itemUnit.action = uiBaseObj.UPDATE;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var selectedElement = itemUnit.elementList[i];
                if (selectedElement != null) {
                    $("#curItemUnitEntryId").val(selectedElement.id);
                    $("#unitName").val(selectedElement.name);
                    $("#unitName").prop("readOnly", false);
                }
                $("#btnSaveItemUnit").prop("disabled", false);
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
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+elementObj.name+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (itemUnit.toBeDeletedElementID && itemUnit.toBeDeletedElementID >=0) {
            var soapType = new DeleteItemUnitType(itemUnit.toBeDeletedElementID);
            callWebService(soapType, itemUnit.deleteElementHandler);
        }
        itemUnit.toBeDeletedElementID = -1;
    },
    deleteItemUnitConfirmationDialog : function (id) {
        itemUnit.toBeDeletedElementID = id;
        itemUnit.v_selected_rowid = "";
        $("#curItemUnitEntryId").val("");
        $('#deleteItemUnitConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteitemunitresponsetype)) {
            itemUnit.listAllElements();
            $("#btnSaveItemUnit").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Item Unit!", jsonObj.deleteitemunitresponsetype.result);
        }
    },
    validateInput : function() {
        var name = $("#unitName").val();
        if (util.isNullOrEmpty(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        if (!itemUnit.validateInput()) {
            return;
        }
        var entryId = $("#curItemUnitEntryId").val();
        var aName = $("#unitName").val();
        var soapType = new SaveItemUnitType(entryId, aName);
        callWebService(soapType, itemUnit.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveitemunitresponsetype)) {
            if(itemUnit.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(itemUnit.action = uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            itemUnit.listAllElements();
            if (itemUnit.v_selected_rowid) {
                var selectedRow = document.getElementById(itemUnit.v_selected_rowid);
                itemUnit.selectRow("itemUnitTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Item Unit!", jsonObj.saveitemunitresponsetype.result);
        }
    }
};