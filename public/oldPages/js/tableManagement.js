var tableManagementPage = {
    init : function() {
        tableManagement.init();
        tableCategory.init();
        uiBaseObj.addDeleteConfirmDialog("tableManagementPage", "deleteTableConfirmationDialog", "Table", "tableManagement.deleteTable();");
        uiBaseObj.addDeleteConfirmDialog("tableManagementPage", "deleteConfirmationDialog", "Area", "tableManagement.deleteArea();");
        uiBaseObj.addDeleteConfirmDialog("tableManagementPage", "deleteTableCategoryConfirmationDialog", "Table Category", "tableCategory.deleteRow();");
    }
};

var tableManagement = {
    DEFAULT_GUEST_COUNT_PER_TABLE : 4,
    DEFAULT_TABLE_TYPE : 'RECTANGLE',
    DEFAULT_TABLE_WIDTH : 0.05,
    DEFAULT_TABLE_HEIGHT : 0.05,
    TABLE_SIZE_PRECISION : 100000,
    areas : {},
    tables : {},
    selected : null,
    selectedArea : null,
    savedTable : null,
    container : null,
    operation : "",
    init : function() {
        tableManagement.container = document.getElementById('tablePageContainer');
        tableManagement.listSeatingAreas();
        tableManagement.listAllKTVItems();
        $('#tableName').bind('input', function() {
            var newVal = $(this).val().toUpperCase();
            $(this).val(newVal);
        });
        $('#tableTypeList').change(function() {
            var newVal = $(this).val();
            $('#hibachi-properties-div').hide();
            $('#defaultSaleItemList-div').hide();
            if (newVal == 'HIBACHI') {
                $('#hibachi-properties-div').show();
            } else if (newVal == 'KTV') {
                $('#defaultSaleItemList-div').show();
            }
        });
    },
    listAllKTVItems : function (){
        var soapType = new FindSaleItemsType(true);
        callWebService(soapType, tableManagement.listAllKTVItemsHandler);
    },
    listAllKTVItemsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findsaleitemsresponsetype)) {
            var defaultSaleItemList = $("#defaultSaleItemList");
            var saleItemList = util.getElementsArray(jsonObj.findsaleitemsresponsetype.saleitem);
            for (var i = 0; i < saleItemList.length; i++) {
                var saleItem = saleItemList[i];
                defaultSaleItemList.append('<option value="' + saleItem.id + '">' + saleItem.name + '</option>');
            }
            defaultSaleItemList.trigger("create");
        } else {
            console.log("Error getting sale item list");
        }
    },
    listSeatingAreas : function() {
        var soapType = new ListAreasType(false);
        callWebService(soapType, tableManagement.listSeatingAreasHandler);
    },
    loadTables : function(soapTables, areaID) {
        var tableList = util.getElementsArray(soapTables);
        for(var k = 0; k < tableList.length; k++) {
            var domainTable = tableList[k];
            tableManagement.tables[domainTable.name] = new Table(domainTable.id, domainTable.name, domainTable.x, domainTable.y, areaID,
                                            domainTable.defaultguestcount, domainTable.width, domainTable.height, domainTable.shape, domainTable.hibachitableshape, domainTable.seatingorientation,
                                            domainTable.defaultsaleitemid, domainTable.tablecategoryid);
        }
    },
    clearTables : function() {
        while (tableManagement.container.hasChildNodes()) {
            tableManagement.container.removeChild(tableManagement.container.lastChild);
        }
    },
    listSeatingAreasHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listareasresponsetype)) {
            var selectedAreaId = null;
            tableManagement.areas = {};
            tableManagement.tables = {};
            var areaSoapElements = util.getElementsArray(jsonObj.listareasresponsetype.areas);
            for (var i = 0; i < areaSoapElements.length; i++) {
                var name = areaSoapElements[i].name;
                var id = areaSoapElements[i].id;
                tableManagement.areas[id] = new SaveAreaType(name, id);
                var soapTables = util.getElementsArray(areaSoapElements[i].tables);
                tableManagement.loadTables(soapTables, id);
            }
            var areaCount = 0;
            var html = "<tr>";
            for (var areaId in tableManagement.areas) {
                var area = tableManagement.areas[areaId];
                var elementId = "area_" + areaId;
                html += "<td><input type='button' onclick='tableManagement.clickSeatingArea(\"" +areaId + "\")' value='" + area.name + "' id='" + elementId + "' class='groovybutton' data-enhanced='true'/></td>";
                if (++areaCount % 4 == 0) {
                    html += "</tr><tr>"
                }
            }
            html += "</tr>"
            document.getElementById("areaList").innerHTML = html;
            if (tableManagement.selectedArea != null && util.isValidVariable(tableManagement.areas[tableManagement.selectedArea.id])) {
                tableManagement.clickSeatingArea(tableManagement.selectedArea.id);
            } else {
                tableManagement.clearTables();
            }
            tableManagement.disableTables(true);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed to load seating areas!", jsonObj.listareasresponsetype.result);
        }
    },
    disableTables : function(isDisabled) {
        document.getElementById("saveTableButton").disabled = isDisabled;
        document.getElementById("deleteTableButton").disabled = isDisabled;
        document.getElementById("tableName").disabled = isDisabled;
        document.getElementById("guestCount").disabled = isDisabled;
        document.getElementById("tableTypeList").disabled = isDisabled;
        document.getElementById("tableWidth").disabled = isDisabled;
        document.getElementById("tableHeight").disabled = isDisabled;
        document.getElementById("tableCategoryList").disabled = isDisabled;
    },
    clickSeatingArea : function(id) {
        var elementId = "area_" + id;
        var button = document.getElementById(elementId);
        button.style.backgroundColor = "#2ECCFA";
        for (var k in tableManagement.areas) {
            if (k != id) {
                var elementId = "area_" + k;
                document.getElementById(elementId).style.backgroundColor = "#FFFF00";
            }
        }
        var area = tableManagement.areas[id];
        tableManagement.clearTables();
        tableManagement.selectedArea = area;

        tableManagement.clearEntryDetails();
        tableManagement.disableTables(false);
        var tableDiv, x, y, tWidth, tHeight;
        for (var t in tableManagement.tables) {
            if (tableManagement.tables[t].areaId == area.id) {
                var selectedTable = tableManagement.tables[t];
                tableDiv = document.createElement('div');
                //tableDiv.setAttribute('src', 'img/tan-square.png');
                x = tableManagement.container.offsetLeft + selectedTable.x * tableManagement.container.offsetWidth;
                y = tableManagement.container.offsetTop + selectedTable.y * tableManagement.container.offsetHeight;
                tWidth = selectedTable.width * tableManagement.container.offsetWidth;
                tHeight = selectedTable.height * tableManagement.container.offsetHeight;
                tableDiv.setAttribute('class', 'drag');
                tableDiv.setAttribute('id', selectedTable.name);
                tableDiv.setAttribute('style', 'border:solid black 1px;width:'+ tWidth +'px;height:' + tHeight + 'px;background-color:brown;left:' + x + 'px;top:' + y + 'px;');
                tableDiv.innerHTML = '<div class="middle-vertical-align-element center-horizontal-align-element table-name-div">' + selectedTable.name + '</div>';
                tableDiv.onclick = function() { tableManagement.clickTable(this); }
                tableManagement.container.appendChild(tableDiv);

                var tableDivObj = $('#' + selectedTable.name);
                tableDivObj.draggable({ containment: "parent" });
            }
        }
    },
    saveSeatingArea : function() {
        var areaName = $("#areaName").val();
        var areaId = null;
        if (tableManagement.operation == uiBaseObj.UPDATE && tableManagement.selectedArea != null) {
            areaId = tableManagement.selectedArea.id;
        } else if (tableManagement.operation == uiBaseObj.NEW) {
            tableManagement.selectedArea = null;
        } else {
            console.log("Error: " + areaName + " " + tableManagement.selectedArea);
            return;
        }
        if (areaName != null && areaName != "") {
            var soapType = new SaveAreaType(areaName, areaId);
            callWebService(soapType, tableManagement.saveSeatingAreaHandler);
            $('#editAreaDetailPopup').popup('close');
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Please enter a name for the area!");
        }
    },
    saveSeatingAreaHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveseatingarearesponsetype)) {
            tableManagement.listSeatingAreas();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "ERROR! Failed to save - " + jsonObj.saveseatingarearesponsetype.result.failurereason, jsonObj.saveseatingarearesponsetype.result);
        }
    },
    deleteSeatingAreaHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteseatingarearesponsetype)) {
            tableManagement.listSeatingAreas();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "ERROR! Failed to delete seating area - " + jsonObj.deleteseatingarearesponsetype.result.failurereason, jsonObj.deleteseatingarearesponsetype.result);
        }
    },
    saveAllTableLayoutChanges : function() {
        if (tableManagement.selectedArea != null) {
            var areaId = tableManagement.selectedArea.id;
            var areaName = tableManagement.selectedArea.name;
            var tableDivs = document.getElementsByClassName('drag');
            var soapType = new SaveAreaType(areaName, areaId);

            for (var i = 0; i < tableDivs.length; i++) {
                var tableDiv = tableDivs[i];
                var tId = tableDiv.id;
                var tableElement = tableManagement.tables[tId];
                if (tableElement.areaId == areaId) {
                    tableElement.x = util.getRoundupValue((tableDiv.offsetLeft - tableManagement.container.offsetLeft) / tableManagement.container.offsetWidth, tableManagement.TABLE_SIZE_PRECISION);
                    tableElement.y = util.getRoundupValue((tableDiv.offsetTop - tableManagement.container.offsetTop) / tableManagement.container.offsetHeight, tableManagement.TABLE_SIZE_PRECISION);

                    if (tableElement.resized) {
                        tableElement.width = util.getRoundupValue(tableDiv.offsetWidth / tableManagement.container.offsetWidth, tableManagement.TABLE_SIZE_PRECISION);
                        tableElement.height = util.getRoundupValue(tableDiv.offsetHeight / tableManagement.container.offsetHeight, tableManagement.TABLE_SIZE_PRECISION);
                    }

                    soapType.tables.push(tableElement);
                }
            }
            callWebService(soapType, tableManagement.saveSeatingAreaHandler);
        }
    },
    addTable : function() {
        var tableName = document.getElementById('tableName').value;
        var areaId = null;
        if (tableManagement.selectedArea != null) {
            areaId = tableManagement.selectedArea.id;
        }

        if (areaId != null && parseInt(areaId) > 0 && tableName != null && tableName != "") {
            if (tableManagement.tables[tableName] != null) {
                uiBaseObj.alert(systemLanguage.msgCodeList.DUPLICATE_TABLE_NAME, "Table name already exists!"); return;
            }
            var defaultGuestCount = $('#guestCount').val();
            var tableType = $('#tableTypeList').val();
            var tableWidth = $('#tableWidth').val();
            var tableHeight = $('#tableHeight').val();
            var defaultSaleItemId = $('#defaultSaleItemList').val();
            var tableCategoryId = $('#tableCategoryList').val();

            if (!defaultGuestCount) {
                defaultGuestCount = tableManagement.DEFAULT_GUEST_COUNT_PER_TABLE;
            }
            if (!tableType) {
                tableType = tableManagement.DEFAULT_TABLE_TYPE;
            }
            if (!tableWidth) {
                tableWidth = tableManagement.DEFAULT_TABLE_WIDTH;
            } else {
                tableWidth /= 100;
            }
            if (!tableHeight) {
                tableHeight = tableManagement.DEFAULT_TABLE_HEIGHT;
            } else {
                tableHeight /= 100;
            }
            if (tableWidth <= 0 || tableWidth > 100 || tableHeight <= 0 || tableHeight > 100) {
                uiBaseObj.alert(systemLanguage.msgCodeList.INVALID_TABLE_SIZE, "Invalid table width or height!");
                return;
            }

            var tableDiv = document.createElement('div');
            //tableDiv.setAttribute('src', 'img/tan-square.png');
            tableDiv.setAttribute('class', 'drag');
            var x = tableManagement.container.offsetLeft + 5;
            var top = tableManagement.container.offsetTop + 5;
            tWidth = tableWidth * tableManagement.container.offsetWidth;
            tHeight = tableHeight * tableManagement.container.offsetHeight;
            tableDiv.setAttribute('id', tableName);
            tableDiv.setAttribute('style', 'outline:solid black 1px; width:'+ tWidth +'px;height:'+ tHeight +'px; background-color: brown;left: '+x+'px;top: '+top+'px;');
            tableDiv.innerHTML = '<div class="middle-vertical-align-element center-horizontal-align-element  table-name-div">' + tableName + '</div>';
            tableDiv.onclick = function() { tableManagement.clickTable(this); }
            tableManagement.container.appendChild(tableDiv);

            var tableDivObj = $('#' + tableName);
            tableDivObj.draggable({ containment: "parent" });

            tableManagement.tables[tableName] = new Table(null, tableName, 5, 5, areaId, defaultGuestCount, tableWidth, tableHeight, tableType, null, null, defaultSaleItemId, tableCategoryId); //aId, aName, aX, aY, aAreaId, aDefaultGuestCount
            tableManagement.selected = tableName;
            tableManagement.clickTable(tableDiv);
            $("#tableName").focus();
       } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Please enter a table name");
       }
    },
    clickTable : function(tableDiv) {
        var tableElement = tableManagement.tables[tableDiv.id];
        $('#tableName').val(tableDiv.id);
        $('#guestCount').val(tableElement.defaultGuestCount);
        $('#tableTypeList').val(tableElement.shape).selectmenu("refresh");
        $('#hibachiTableShapeList').val(tableElement.hibachiTableShape).selectmenu("refresh");
        $('#seatingOrientationList').val(tableElement.seatingOrientation).selectmenu("refresh");
        $('#defaultSaleItemList').val(tableElement.defaultSaleItemId).selectmenu("refresh");
        $('#tableCategoryList').val(tableElement.tableCategoryId).selectmenu("refresh");

        var tableShape = tableElement.shape;
        $('#hibachi-properties-div').hide();
        $('#defaultSaleItemList-div').hide();
        if (tableShape == 'HIBACHI') {
            $('#hibachi-properties-div').show();
        } else if (tableShape == 'KTV') {
            $('#defaultSaleItemList-div').show();
        }

        var tableWidth = tableElement.width * 100;
        if (tableElement.resized) {
            tableWidth = util.getRoundupValue(tableDiv.offsetWidth / tableManagement.container.offsetWidth * 100, tableManagement.TABLE_SIZE_PRECISION);
        }

        var tableHeight = tableElement.height * 100;
        if (tableElement.resized) {
            tableHeight = util.getRoundupValue(tableDiv.offsetHeight / tableManagement.container.offsetHeight * 100, tableManagement.TABLE_SIZE_PRECISION);
        }

        $('#tableWidth').val(tableWidth);
        $('#tableHeight').val(tableHeight);
        tableManagement.disableTables(false);

        tableDiv.style.backgroundColor = "#2ECCFA";
        tableManagement.selected = tableDiv.id;
        for (var t in tableManagement.tables) {
            if (tableManagement.tables[t].name != tableDiv.id && document.getElementById(t)!=null) {
                document.getElementById(t).style.backgroundColor = "brown";
            }
        }
    },
    saveTable : function() {
        var tableDiv = document.getElementById(tableManagement.selected);
        if (tableDiv != null) {
            var table = tableManagement.tables[tableManagement.selected];
            var newTableName = document.getElementById("tableName").value;
            if(table.name != newTableName && tableManagement.tables[newTableName] != null) {
                uiBaseObj.alert(systemLanguage.msgCodeList.DUPLICATE_TABLE_NAME, "Table name already exists!");
                return;
            }
            table.name = newTableName;
            table.defaultGuestCount = document.getElementById("guestCount").value;
            table.shape = document.getElementById("tableTypeList").value;
            table.hibachiTableShape = document.getElementById("hibachiTableShapeList").value;
            table.seatingOrientation = document.getElementById("seatingOrientationList").value;
            table.width = document.getElementById('tableWidth').value;
            table.height = document.getElementById('tableHeight').value;
            table.tableCategoryId = document.getElementById("tableCategoryList").value;
            
            if (table.shape == "KTV") {
                table.defaultSaleItemId = document.getElementById("defaultSaleItemList").value;
            }

            if (!table.width || table.width <= 0 || table.width > 100 || !table.height || table.height <= 0 || table.height > 100) {
                uiBaseObj.alert(systemLanguage.msgCodeList.INVALID_TABLE_SIZE, "Invalid table width or height!");
                return;
            }

            table.width /= 100;
            table.height /= 100;
            table.x = (tableDiv.offsetLeft - tableManagement.container.offsetLeft) / tableManagement.container.offsetWidth;
            table.y = (tableDiv.offsetTop - tableManagement.container.offsetTop) / tableManagement.container.offsetHeight;
            document.getElementById("saveTableButton").disabled = true;
            document.getElementById("deleteTableButton").disabled = true;
            tableManagement.savedTable = table;
            var soapType = new SaveTableType(table);
            callWebService(soapType, tableManagement.saveTableHandler);
        }
    },
    saveTableHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savetableresponsetype)) {
            tableManagement.listSeatingAreas();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "ERROR! Failed to save table: " + jsonObj.savetableresponsetype.result.failurereason, jsonObj.savetableresponsetype.result);
            tableManagement.listSeatingAreas();
        }
        document.getElementById("saveTableButton").disabled = false;
        document.getElementById("deleteTableButton").disabled = false;
    },
    openDeleteTablePanel: function () {
        if (util.isValidVariable(tableManagement.selected)) {
            var tableDiv = document.getElementById(tableManagement.selected);
            if (tableDiv != null) {
                $('#deleteTableConfirmationDialog').popup('open');
            }
        }
    },
    deleteTable : function() {
        if (util.isValidVariable(tableManagement.selected)) {
            $('#deleteTableConfirmationDialog').popup('close');
            var tableDiv = document.getElementById(tableManagement.selected);
            if (tableDiv != null) {
                var table = tableManagement.tables[tableManagement.selected];
                tableManagement.savedTable = table;
                if (table.id != null) {
                    var soapType = new DeleteTableType(table.id);
                    callWebService(soapType, tableManagement.deleteTableHandler);
                } else {
                    tableDiv.parentNode.removeChild(tableDiv);
                    document.getElementById("tableName").value = "";
                    delete tableManagement.tables[tableManagement.selected];
                }
            }
        }
    },
    deleteTableHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletetableresponsetype)) {
            var tableDiv = document.getElementById(tableManagement.savedTable.name);
            tableDiv.parentNode.removeChild(tableDiv);
            delete tableManagement.tables[tableManagement.savedTable.name];
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "ERROR! Failed to delete table!", jsonObj.deletetableresponsetype.result);
        }
        $('#deleteTableConfirmationDialog').popup('close');
    },
    clearEntryDetails : function() {
        tableManagement.disableTables(true);
        $('#tableName').val("");
        $('#guestCount').val("");
        $('#tableTypeList').val("").selectmenu("refresh");
        $('#tableWidth').val("");
        $('#tableHeight').val("");
        $('#defaultSaleItemList').val("").selectmenu("refresh");
        $('#hibachiTableShapeList').val("").selectmenu("refresh");
        $('#hibachi-properties-div').hide();
        $('#defaultSaleItemList-div').hide();
        tableManagement.selected = null;
    },
    editArea: function () {
        if (tableManagement.selectedArea != null) {
            tableManagement.operation = uiBaseObj.UPDATE;
            $('#areaName').val(tableManagement.selectedArea.name);
            $('#editAreaDetailPopup').popup('open');
        }
    },
    newArea: function () {
        $('#areaName').val("");
        tableManagement.operation = uiBaseObj.NEW;
        $('#editAreaDetailPopup').popup('open');
    },
    openDeletePanel: function () {
        if (tableManagement.selectedArea != null) {
            $('#deleteConfirmationDialog').popup('open');
        }
    },
    deleteArea: function () {
        $('#deleteConfirmationDialog').popup('close');
        if (tableManagement.selectedArea != null) {
            var id = tableManagement.selectedArea.id;
            tableManagement.selectedArea = null;
            var soapType = new DeleteAreaType(id);
            callWebService(soapType, tableManagement.deleteSeatingAreaHandler);
        }
    },
    refreshWithoutChanges: function () {
        $('#editAreaDetailPopup').popup('close');
    },
    limitInput: function() {
        var x = document.getElementById("tableName");
        x.value =  x.value.replace(/[^A-Za-z\d]/, '');
    }
};

var tableCategory = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        tableCategory.listAllElements();
    },
    clearDetails : function(disableElements) {
        $("#name").val("");
        $("#name").prop("readOnly", disableElements);
        $("#description").val("");
        $("#description").prop("readOnly", disableElements);
        $("#minSeats").val("");
        $("#minSeats").prop("readOnly", disableElements);
        $("#maxSeats").val("");
        $("#maxSeats").prop("readOnly", disableElements);
        $("#btnSave").prop("disabled", disableElements);
        tableCategory.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        tableCategory.clearDetails(false);
        tableCategory.v_selected_rowid = "";
        $("#curEntryId").val("");
        $("#name").focus();
    },
    listAllElements : function (){
        tableCategory.clearDetails(true);
        var soapType = new FindTableCategoriesType();
        callWebService(soapType, tableCategory.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findtablecategoriesresponsetype)) {
            //Clear the table
            $("#tableCategoryTable").empty();
            $('#tableCategoryList').find('option').remove();
            tableCategory.elementList = util.getElementsArray(jsonObj.findtablecategoriesresponsetype.tablecategories);
            for (var i = 0; i < tableCategory.elementList.length; i++) {
                var element = tableCategory.elementList[i];
                tableCategory.addRow("tableCategoryTable", element, "tableCategory.selectRow", "tableCategory.deleteWithConfirmationDialog");
                $("#tableCategoryList").append("<option value='" + element.id + "'>" + element.name + "</option>").trigger("create");
            }
        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        tableCategory.action = uiBaseObj.UPDATE;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var selectedElement = tableCategory.elementList[i];
                if (selectedElement != null) {
                    $("#curEntryId").val(selectedElement.id);
                    $("#name").val(selectedElement.name);
                    $("#name").prop("readOnly", false);
                    $("#description").val(util.getStringValue(selectedElement.description));
                    $("#description").prop("readOnly", false);
                    $("#minSeats").val(util.getStringValue(selectedElement.minseats));
                    $("#minSeats").prop("readOnly", false);
                    $("#maxSeats").val(util.getStringValue(selectedElement.maxseats));
                    $("#maxSeats").prop("readOnly", false);
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

        var deleteIcon = "";
        if (elementObj.defaultcategory != "true") {
             deleteIcon = "<a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a>";
        }
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+elementObj.name+"</td><td class=\"delete-icon-td\">" + deleteIcon + "</td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (tableCategory.toBeDeletedElementID && tableCategory.toBeDeletedElementID >=0) {
            var soapType = new DeleteTableCategoryType(tableCategory.toBeDeletedElementID);
            callWebService(soapType, tableCategory.deleteElementHandler);
        }
        tableCategory.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        tableCategory.toBeDeletedElementID = id;
        tableCategory.v_selected_rowid = "";
        $("#curEntryId").val("");
        $('#deleteTableCategoryConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletetablecategoryresponsetype)) {
            tableCategory.listAllElements();
            $("#btnSave").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            setTimeout(function() {uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Table Category!", jsonObj.deletetablecategoryresponsetype.result);}, 100);
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
        if (!tableCategory.validateInput()) {
            return;
        }
        var entryId = $("#curEntryId").val();
        var name = $("#name").val();
        var description = $("#description").val();
        var minSeats = $("#minSeats").val();
        var maxSeats = $("#maxSeats").val();
        var soapType = new SaveTableCategoryType(entryId, name, description, minSeats, maxSeats);
        callWebService(soapType, tableCategory.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savetablecategoryresponsetype)) {
            if(tableCategory.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(tableCategory.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            tableCategory.listAllElements();
            if (tableCategory.v_selected_rowid) {
                var selectedRow = document.getElementById(tableCategory.v_selected_rowid);
                tableCategory.selectRow("tableCategoryTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Table Category!", jsonObj.savetablecategoryresponsetype.result);
        }
    }
};