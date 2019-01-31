var inventoryItemPage = {
    init : function() {        
        inventoryItemGroup.init();
        inventoryItem.init();
        uiBaseObj.addDeleteConfirmDialog("inventoryItemPage", "deleteInventoryItemGroupConfirmationDialog", "Inventory Vendor", "inventoryItemGroup.deleteRow();");
        uiBaseObj.addDeleteConfirmDialog("inventoryItemPage", "deleteConfirmationDialog", "Inventory Location", "inventoryItem.deleteRow();");        
    }
};

var inventoryItem = {
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    selectedItemGroupId : "",
    searchItemInput: "",
    init : function() {
        inventoryItem.listAllElements();
        inventoryItem.listAllInventoryLocations();
        inventoryItem.listAllInventoryVendors();
        inventoryItem.listAllItemUnits();
        $('#searchInventoryItemInput').on('keydown', function() {
            inventoryItem.searchItemInput = this.value;
            inventoryItem.showEntries();
        });
    },
    clearDetails : function(disableElements) {
        $("#name").val("");
        $("#name").prop("readOnly", disableElements);
        $("#sku").val("");
        $("#sku").prop("readOnly", disableElements);
        $("#defaultPurchasePrice").val("");
        $("#defaultPurchasePrice").prop("readOnly", disableElements);
        $("#baseUnit").val("");
        $("#baseUnit").prop("readOnly", disableElements);
        $("#purchaseUnit").val("");
        $("#purchaseUnit").prop("readOnly", disableElements);
        $("#productionUnit").val("");
        $("#productionUnit").prop("readOnly", disableElements);
        $("#baseUnitToProductionUnitRatio").val("");
        $("#baseUnitToProductionUnitRatio").prop("readOnly", disableElements);
        $("#purchaseUnitToBaseUnitRatio").val("");
        $("#purchaseUnitToBaseUnitRatio").prop("readOnly", disableElements);
        $("#defaultPurchaseQty").val("");
        $("#defaultPurchaseQty").prop("readOnly", disableElements);
        $("#targetStockQty").val("");
        $("#targetStockQty").prop("readOnly", disableElements);
        $("#lowStockAlertThreshold").val("");
        $("#lowStockAlertThreshold").prop("readOnly", disableElements);
        $("#displayPriority").val("");
        $("#displayPriority").prop("readOnly", disableElements);
        $("#defaultShippingAddressSelectList").val("").selectmenu('refresh');
        $("#baseItemSelectList").val("").selectmenu('refresh');
        $("#defaultVendorSelectList").val("").selectmenu('refresh');
        $("#btnSaveNew").prop("disabled", disableElements);
        $("#btnSaveUpdate").prop("disabled", disableElements);
        $("#inventoryCountUnitSelectList").val("BASE_UNIT").selectmenu('refresh');
        $("#replenishTypeSelectList").val("MANUAL").selectmenu('refresh');
        $("#targetStockQTYCalculationList").val("MANUAL").selectmenu('refresh');
    },
    listAllItemUnits : function () {
        var soapType = new FindItemUnitsType();
        callWebService(soapType, inventoryItem.listAllItemUnitsHandler);
    },
    listAllItemUnitsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finditemunitsresponsetype)) {
            var itemUnitSelectList = $('#itemUnitSelectList');
            itemUnitSelectList.find('option').remove();
            var itemUnitList = util.getElementsArray(jsonObj.finditemunitsresponsetype.itemunits);
            for (var i = 0; i < itemUnitList.length; i++) {
                var itemUnit = itemUnitList[i];
                itemUnitSelectList.append("<option value='" + itemUnit.name + "'>");
            }
        }
    },
    listAllInventoryLocations : function () {
        var soapType = new FindInventoryLocationsType();
        callWebService(soapType, inventoryItem.listAllInventoryLocationsHandler);
    },
    listAllInventoryLocationsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findinventorylocationsresponsetype)) {
            $('#defaultShippingAddressSelectList').find('option:gt(0)').remove();
            var inventoryLocationList = util.getElementsArray(jsonObj.findinventorylocationsresponsetype.inventorylocations);
            for (var i = 0; i < inventoryLocationList.length; i++) {
                var inventoryLocation = inventoryLocationList[i];
                $("#defaultShippingAddressSelectList").append("<option value='" + inventoryLocation.id + "'>" + inventoryLocation.name + "</option>").trigger("create");
            }
        }
    },
    listAllInventoryVendors : function () {
        var soapType = new FindInventoryVendorsType();
        callWebService(soapType, inventoryItem.listAllInventoryVendorsHandler);
    },
    listAllInventoryVendorsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findinventoryvendorsresponsetype)) {            
            $('#defaultVendorSelectList').find('option:gt(0)').remove();
            var inventoryVendorList = util.getElementsArray(jsonObj.findinventoryvendorsresponsetype.inventoryvendors);
            for (var i = 0; i < inventoryVendorList.length; i++) {
                var inventoryVendor = inventoryVendorList[i];
                $("#defaultVendorSelectList").append("<option value='" + inventoryVendor.id + "'>" + inventoryVendor.name + "</option>").trigger("create");
            }
        }
    },
    filterEntries : function(obj) {
        inventoryItem.selectedItemGroupId = obj.value;
        inventoryItem.showEntries();
        inventoryItem.clearDetails(true);
        $('#itemGroupSelectList').val(inventoryItem.selectedItemGroupId).selectmenu('refresh');
    },
    showEntries : function() {
        var itemGroupId = inventoryItem.selectedItemGroupId;
        var searchItemInput = inventoryItem.searchItemInput;
        $('#baseItemSelectList').find('option:gt(0)').remove();
        for (var i = 0; i < inventoryItem.elementList.length; i++) {
            var inventoryItemObj = inventoryItem.elementList[i];
            var rowId = inventoryItem.getRowId("inventoryItemTable", inventoryItemObj);
            var targetRowObj = $('#' + rowId);
            if (util.isValidVariable(itemGroupId) && itemGroupId != inventoryItemObj.groupid) {
                targetRowObj.hide();
            } else if (util.isValidVariable(searchItemInput) && inventoryItemObj.name.toUpperCase().indexOf(searchItemInput.toUpperCase()) <= -1) {
                targetRowObj.hide();
            } else {
                targetRowObj.show();
                $("#baseItemSelectList").append("<option value='" + inventoryItemObj.id + "'>" + inventoryItemObj.name + "</option>").trigger("create");
            }
        }
    },
    newEntry : function () {
        inventoryItem.clearDetails(false);
        inventoryItem.v_selected_rowid = "";
        $("#curEntryId").val("");
        $("#name").focus();
        $("#btn-div-new").show();
        $("#btn-div-update").hide();

    },
    listAllElements : function () {
        inventoryItem.clearDetails(true);
        var soapType = new FindInventoryItemsType();
        callWebService(soapType, inventoryItem.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findinventoryitemsresponsetype)) {
            //Clear the table
            $("#inventoryItemTable").empty();
            inventoryItem.elementList = util.getElementsArray(jsonObj.findinventoryitemsresponsetype.inventoryitems);
            for (var i = 0; i < inventoryItem.elementList.length; i++) {
                inventoryItem.addRow("inventoryItemTable", inventoryItem.elementList[i], "inventoryItem.selectRow", "inventoryItem.deleteWithConfirmationDialog");
            }
            inventoryItem.showEntries();
        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var selectedElement = inventoryItem.elementList[i];
                if (selectedElement != null) {
                    $("#curEntryId").val(selectedElement.id);
                    $("#name").val(selectedElement.name);
                    $("#name").prop("readOnly", false);
                    $("#sku").val(util.getStringValue(selectedElement.sku));
                    $("#sku").prop("readOnly", false);
                    $("#defaultPurchasePrice").val(util.getStringValue(selectedElement.defaultpurchaseprice));
                    $("#defaultPurchasePrice").prop("readOnly", false);
                    $("#baseUnit").val(util.getStringValue(selectedElement.baseunit));
                    $("#baseUnit").prop("readOnly", false);
                    $("#purchaseUnit").val(util.getStringValue(selectedElement.purchaseunit));
                    $("#purchaseUnit").prop("readOnly", false);
                    $("#purchaseUnitToBaseUnitRatio").val(util.getStringValue(selectedElement.purchaseunittobaseunitratio));
                    $("#purchaseUnitToBaseUnitRatio").prop("readOnly", false);
                    $("#productionUnit").val(util.getStringValue(selectedElement.productionunit));
                    $("#productionUnit").prop("readOnly", false);
                    $("#baseUnitToProductionUnitRatio").val(util.getStringValue(selectedElement.baseunittoproductionunitratio));
                    $("#baseUnitToProductionUnitRatio").prop("readOnly", false);
                    $("#targetStockQty").val(selectedElement.targetstockqty);
                    $("#targetStockQty").prop("readOnly", false);
                    $("#defaultPurchaseQty").val(selectedElement.defaultpurchaseqty);
                    $("#defaultPurchaseQty").prop("readOnly", false);
                    $("#lowStockAlertThreshold").val(selectedElement.lowstockalertthreshold);
                    $("#lowStockAlertThreshold").prop("readOnly", false);
                    $("#displayPriority").val(util.getStringValue(selectedElement.displaypriority));
                    $("#displayPriority").prop("readOnly", false);
                    $("#itemGroupSelectList").val(selectedElement.groupid).selectmenu('refresh');
                    $("#defaultShippingAddressSelectList").val(selectedElement.defaultshippingaddressid).selectmenu('refresh');
                    $("#defaultVendorSelectList").val(selectedElement.defaultvendorid).selectmenu('refresh');
                    $("#baseItemSelectList").val(selectedElement.baseitemid).selectmenu('refresh');
                    $("#inventoryCountUnitSelectList").val(selectedElement.inventorycountunit).selectmenu('refresh');
                    $("#replenishTypeSelectList").val(selectedElement.replenishtype).selectmenu('refresh');
                    $("#targetStockQTYCalculationList").val(selectedElement.targetstockqtycalculation).selectmenu('refresh');
                }
                $("#btnSaveUpdate").prop("disabled", false);
                $("#btn-div-update").show();
                $("#btn-div-new").hide();
                $("#createAnotherEntry-cb").prop('checked', false).checkboxradio("refresh");
            }
        }
    },
    getRowId: function(tableID, elementObj) {
        return tableID + "_r" + elementObj.id;
    },
    addRow : function (tableID, elementObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = inventoryItem.getRowId(tableID, elementObj);

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
        if (inventoryItem.toBeDeletedElementID && inventoryItem.toBeDeletedElementID >=0) {
            var soapType = new DeleteInventoryItemType(inventoryItem.toBeDeletedElementID);
            callWebService(soapType, inventoryItem.deleteElementHandler);
        }
        inventoryItem.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        inventoryItem.toBeDeletedElementID = id;
        inventoryItem.v_selected_rowid = "";
        $("#curEntryId").val("");
        $('#deleteConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteinventoryitemresponsetype)) {
            inventoryItem.listAllElements();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Inventory Item!", jsonObj.deleteinventoryitemresponsetype.result);
        }
    },
    validateInput : function() {
        var name = $("#name").val();
        if (util.isNullOrEmpty(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        var groupId = $("#itemGroupSelectList").val();
        if (util.isNullOrEmpty(groupId)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_INVENTORY_GROUP_SELECTED, "Group cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        if (!inventoryItem.validateInput()) {
            return;
        }
        var entryId = $("#curEntryId").val();
        var name = util.getXMLSafeValue($("#name").val());
        var sku = $("#sku").val();
        var defaultPurchasePrice = $("#defaultPurchasePrice").val();
        var baseUnit = $("#baseUnit").val();
        var purchaseUnit = $("#purchaseUnit").val();
        var purchaseUnitToBaseUnitRatio = $("#purchaseUnitToBaseUnitRatio").val();
        var productionUnit = $("#productionUnit").val();
        var baseUnitToProductionUnitRatio = $("#baseUnitToProductionUnitRatio").val();
        var lowStockAlertThreshold = $("#lowStockAlertThreshold").val();
        var targetStockQty = $("#targetStockQty").val();
        var defaultPurchaseQty = $("#defaultPurchaseQty").val();
        var displayPriority = $("#displayPriority").val();
        var groupId = $("#itemGroupSelectList").val();
        var defaultShippingAddressId = $("#defaultShippingAddressSelectList").val();
        var defaultVendorId = $("#defaultVendorSelectList").val();
        var baseItemId = $("#baseItemSelectList").val();
        var inventoryCountUnit = $("#inventoryCountUnitSelectList").val();
        var replenishType = $("#replenishTypeSelectList").val();
        var targetStockQTYCalculation = $("#targetStockQTYCalculationList").val();
        var soapType = new SaveInventoryItemType(entryId, name, sku, defaultPurchasePrice, baseUnit, purchaseUnit, purchaseUnitToBaseUnitRatio, productionUnit, baseUnitToProductionUnitRatio,
                        lowStockAlertThreshold, targetStockQty, defaultPurchaseQty, displayPriority, groupId, defaultShippingAddressId, defaultVendorId, baseItemId, inventoryCountUnit, replenishType, 
                        targetStockQTYCalculation);
        callWebService(soapType, inventoryItem.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveinventoryitemresponsetype)) {
            inventoryItem.listAllElements();
            var createAnotherEntry = $("#createAnotherEntry-cb").prop('checked');
            if (createAnotherEntry) {
                inventoryItem.newEntry();
            } else if (inventoryItem.v_selected_rowid) {
                var selectedRow = document.getElementById(inventoryItem.v_selected_rowid);
                inventoryItem.selectRow("inventoryItemTable", selectedRow);
            }
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Inventory Item!", jsonObj.saveinventoryitemresponsetype.result);
        }
    }
};

var inventoryItemGroup = {
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        inventoryItemGroup.listAllElements();
    },
    clearDetails : function(disableElements) {
        $("#groupName").val("");
        $("#groupName").prop("readOnly", disableElements);
        $("#groupDisplayPriority").val("");
        $("#groupDisplayPriority").prop("readOnly", disableElements);
        $("#btnItemGroupSave").prop("disabled", disableElements);
    },
    newEntry : function () {
        inventoryItemGroup.clearDetails(false);
        inventoryItemGroup.v_selected_rowid = "";
        $("#curGroupEntryId").val("");
        $("#groupName").focus();
    },
    listAllElements : function (){
        inventoryItemGroup.clearDetails(true);
        var soapType = new FindInventoryItemGroupsType();
        callWebService(soapType, inventoryItemGroup.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findinventoryitemgroupsresponsetype)) {
            //Clear the table
            var inventoryItemGroupTableObj = $("#inventoryItemGroupTable");
            var itemGroupSelectListObj = $('#itemGroupSelectList');
            var inventoryItemFilterListObj = $('#inventoryItem-filter-list');
            inventoryItemGroupTableObj.empty();
            itemGroupSelectListObj.find('option:gt(0)').remove();
            inventoryItemFilterListObj.find('option:gt(0)').remove();
            inventoryItemGroup.elementList = util.getElementsArray(jsonObj.findinventoryitemgroupsresponsetype.inventoryitemgroups);
            for (var i = 0; i < inventoryItemGroup.elementList.length; i++) {
                var entry = inventoryItemGroup.elementList[i];
                inventoryItemGroup.addRow("inventoryItemGroupTable", entry, "inventoryItemGroup.selectRow", "inventoryItemGroup.deleteWithConfirmationDialog");
                itemGroupSelectListObj.append("<option value='" + entry.id + "'>" + entry.name + "</option>").trigger("create");
                inventoryItemFilterListObj.append("<option value='" + entry.id + "'>" + entry.name + "</option>").trigger("create");
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
                var selectedElement = inventoryItemGroup.elementList[i];
                if (selectedElement != null) {
                    $("#curGroupEntryId").val(selectedElement.id);
                    $("#groupName").val(selectedElement.name);
                    $("#groupName").prop("readOnly", false);
                    $("#groupDisplayPriority").val(util.getStringValue(selectedElement.displaypriority));
                    $("#groupDisplayPriority").prop("readOnly", false);
                }
                $("#btnItemGroupSave").prop("disabled", false);
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
        if (inventoryItemGroup.toBeDeletedElementID && inventoryItemGroup.toBeDeletedElementID >=0) {
            var soapType = new DeleteInventoryItemGroupType(inventoryItemGroup.toBeDeletedElementID);
            callWebService(soapType, inventoryItemGroup.deleteElementHandler);
        }
        inventoryItemGroup.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        inventoryItemGroup.toBeDeletedElementID = id;
        inventoryItemGroup.v_selected_rowid = "";
        $("#curGroupEntryId").val("");
        $('#deleteInventoryItemGroupConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteinventoryitemgroupresponsetype)) {
            inventoryItemGroup.listAllElements();
            $("#btnItemGroupSave").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Item Group!", jsonObj.deleteinventoryitemgroupresponsetype.result);
        }
    },
    validateInput : function() {
        var groupName = $("#groupName").val();
        if (util.isNullOrEmpty(groupName)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        if (!inventoryItemGroup.validateInput()) {
            return;
        }
        var entryId = $("#curGroupEntryId").val();
        var name = util.getXMLSafeValue($("#groupName").val());
        var displayPriority = $("#groupDisplayPriority").val();
        var soapType = new SaveInventoryItemGroupType(entryId, name, displayPriority);
        callWebService(soapType, inventoryItemGroup.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveinventoryitemgroupresponsetype)) {
            inventoryItemGroup.listAllElements();
            if (inventoryItemGroup.v_selected_rowid) {
                var selectedRow = document.getElementById(inventoryItemGroup.v_selected_rowid);
                inventoryItemGroup.selectRow("inventoryItemGroupTable", selectedRow);
            }
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Inventory Item Group!", jsonObj.saveinventoryitemgroupresponsetype.result);
        }
    }
};