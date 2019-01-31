var orderTypeSetting = {
    elementList : [],
//    non_custom_orderType_set : new Set(['DINE_IN', 'TOGO', 'DELIVERY', 'PICKUP']),
    init : function() {
        orderTypeSetting.listAllSeatingAreas();
        orderTypeSetting.listAllElements();
        $("#orderType").change(function (){
            if ("DINE_IN" == $("#orderType").val()) {
                $("#defaultArea-div").show();
            } else {
                $("#defaultArea-div").hide();
            }
        });
    },
    clearDetails : function() {
        document.getElementById("curOrderTypeSettingId").value = "";
        document.getElementById("curOrderTypeSettingType").value = "";
        document.getElementById("displayName").value = "";
        document.getElementById("shortName").value = "";
        $("#orderType").val("").selectmenu("refresh");
        $("#defaultArea").val("").selectmenu("refresh");
        document.getElementById("displayName").disabled = true;
        document.getElementById("shortName").disabled = true;
        document.getElementById("orderType").disabled = true;
        document.getElementById("btnSave").disabled = true;
    },
    listAllSeatingAreas : function () {
        var soapType = new ListAreasType(false);
        callWebService(soapType, orderTypeSetting.listAllSeatingAreasHandler);
    },
    listAllSeatingAreasHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listareasresponsetype)) {
            var areas = util.getElementsArray(jsonObj.listareasresponsetype.areas);
            for (var i = 0; i < areas.length; i++) {
                var areaHtml = '<option value="' + areas[i].id + '">' + areas[i].name + '</option>';
                $("#defaultArea").append(areaHtml).trigger("create");
            }
        }
    },
    listAllElements : function (){
        orderTypeSetting.clearDetails();
        var soapType = new ListOrderTypeSettingsType();
        callWebService(soapType, orderTypeSetting.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listordertypesettingsresponsetype)) {
            //Clear the table
            document.getElementById("orderTypeSetting").innerHTML = "";
            orderTypeSetting.elementList = util.getElementsArray(jsonObj.listordertypesettingsresponsetype.ordertypesettings);
            for (var i = 0; i < orderTypeSetting.elementList.length; i++) {
                orderTypeSetting.addRow("orderTypeSetting", orderTypeSetting.elementList[i], "orderTypeSetting.selectRow");
            }
        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var curr_orderTypeSetting = orderTypeSetting.elementList[i];
                if (curr_orderTypeSetting != null) {
                    document.getElementById("curOrderTypeSettingId").value = curr_orderTypeSetting.id;
                    document.getElementById("curOrderTypeSettingType").value = curr_orderTypeSetting.type;
                    $("#orderType").val(curr_orderTypeSetting.ordertype).selectmenu("refresh");
                    if (util.isValidVariable(curr_orderTypeSetting.displayname)) {
                        //curr_orderTypeSetting.displayname;
                        //document.getElementById("displayName").value = util.getXMLDisplayValue(curr_orderTypeSetting.displayname) ;
                        document.getElementById("displayName").value = util.getXMLDisplayValue(systemLanguage.getLanguageNames(curr_orderTypeSetting, 'displayname', 'en')) ;
                    } else {
                        document.getElementById("displayName").value = "";
                    }
                    if (util.isValidVariable(curr_orderTypeSetting.shortname)) {
                        //curr_orderTypeSetting.shortname;
                        //document.getElementById("shortName").value = util.getXMLDisplayValue(curr_orderTypeSetting.shortname) ;
                        document.getElementById("shortName").value = util.getXMLDisplayValue(systemLanguage.getLanguageNames(curr_orderTypeSetting, 'shortname', 'en')) ;
                    } else {
                        document.getElementById("shortName").value = "";
                    }
                    if (curr_orderTypeSetting.type == "DEFAULT") {
                        document.getElementById("displayName").disabled = true;
                        document.getElementById("shortName").disabled = true;
                        document.getElementById("orderType").disabled = true;
                    } else {
                        document.getElementById("displayName").disabled = false;
                        document.getElementById("shortName").disabled = false;
                        document.getElementById("orderType").disabled = false;
                    }
                    if ("DINE_IN" == curr_orderTypeSetting.ordertype) {
                        $("#defaultArea-div").show();
                        $("#defaultArea").val(curr_orderTypeSetting.defaultareaid).selectmenu("refresh");
                    } else {
                        $("#defaultArea-div").hide();
                        $("#defaultArea").val('').selectmenu("refresh");
                    }
                }
                document.getElementById("btnSave").disabled = false;
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
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+systemLanguage.getLanguageNames(elementObj, 'name', 'en')+"</td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    saveElement : function () {
        $("#btnSave").prop("disabled", true);
        var id = document.getElementById("curOrderTypeSettingId").value;
        var type = document.getElementById("curOrderTypeSettingType").value;
        var displayName =util.getXMLSafeValue($("#displayName").val());
        var shortName =util.getXMLSafeValue($("#shortName").val());
        var orderType = $("#orderType").val() == "" ? null : $("#orderType").val();
        var defaultArea;
        if (util.isValidVariable(orderType) && "DINE_IN" == orderType) {
            defaultArea = $("#defaultArea").val() == "" ? null : $("#defaultArea").val();
        }


        var soapType = new SaveOrderTypeSettingType(id, displayName, shortName, orderType, defaultArea, type);
        callWebService(soapType, orderTypeSetting.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveordertypesettingresponsetype)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            orderTypeSetting.listAllElements();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save orderTypeSetting!", jsonObj.saveordertypesettingresponsetype.result);
        }
        $("#btnSave").prop("disabled", false);
    }
};