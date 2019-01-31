var charge = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        charge.listAllElements();
        uiBaseObj.addDeleteConfirmDialog("chargePage", "deleteChargeConfirmationDialog", "Charge", "charge.deleteRow();");
    },
    clearDetails : function() {
        document.getElementById("chargeName").value = "";
        document.getElementById("chargeName").readOnly = false;
        document.getElementById("chargeDescription").value = "";
        document.getElementById("chargeDescription").readOnly = false;
        document.getElementById("chargeRate").value = "";
        document.getElementById("chargeRate").readOnly = false;
        document.getElementById("chargeRateType").selectedIndex = 0;
        document.getElementById("chargeRateType").readOnly = false;
        $("#chargeTypes").val("DEFAULT").selectmenu("refresh");
        document.getElementById("chargeTypes").readOnly = false;
        $('#chargeMinMileageDiv').removeClass("hidden").addClass("hidden");
        $('#chargeMinGuestDiv').removeClass("hidden").addClass("hidden");
        document.getElementById("chargeMinGuest").value = "";
        document.getElementById("chargeMinGuest").readOnly = false;
        document.getElementById("chargeMinMileage").readOnly = "";
        document.getElementById("chargeMinMileage").readOnly = false;
        document.getElementById("btnSave").readOnly = false;
        charge.action = uiBaseObj.ADD;
    },
    changeChargeType : function() {
        if ($('#chargeTypes').val() == "SERVICE") {
            $('#chargeMinGuestDiv').removeClass("hidden");
            $('#chargeMinMileageDiv').removeClass("hidden").addClass("hidden");
        } else if ($('#chargeTypes').val() == "DELIVERY") {
            $('#chargeMinMileageDiv').removeClass("hidden");
            $('#chargeMinGuestDiv').removeClass("hidden").addClass("hidden");
        } else {
            $('#chargeMinMileageDiv').removeClass("hidden").addClass("hidden");
            $('#chargeMinGuestDiv').removeClass("hidden").addClass("hidden");
        }
    },
    newEntry : function () {
        charge.clearDetails();
        charge.v_selected_rowid = "";
        document.getElementById("curChargeId").value = "";
    },
    listAllElements : function (){
        charge.clearDetails();
        var soapType = new ListChargesType();
        callWebService(soapType, charge.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listchargesresponsetype)) {
            //Clear the table
            document.getElementById("chargesTable").innerHTML = "";
            charge.elementList = util.getElementsArray(jsonObj.listchargesresponsetype.charge);
            for (var i = 0; i < charge.elementList.length; i++) {
                charge.addRow("chargesTable", charge.elementList[i], "charge.selectRow", "charge.deleteWithConfirmationDialog");
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
                var curr_charge = charge.elementList[i];
                if(curr_charge != null) {
                    document.getElementById("curChargeId").value = curr_charge.id;
                    document.getElementById("chargeName").value = curr_charge.name;
                    document.getElementById("chargeName").readOnly = false;
                    document.getElementById("chargeRate").value = curr_charge.rate;
                    document.getElementById("chargeRate").readOnly = false;
                    $("#chargeRateType").val(curr_charge.ratetype).selectmenu("refresh");
                    $("#chargeTypes").val(curr_charge.type).selectmenu("refresh");
                    if (curr_charge.type == "SERVICE") {
                        $('#chargeMinGuestDiv').removeClass("hidden");
                        $('#chargeMinMileageDiv').removeClass("hidden").addClass("hidden");
                    } else if (curr_charge.type == "DELIVERY") {
                        $('#chargeMinMileageDiv').removeClass("hidden");
                        $('#chargeMinGuestDiv').removeClass("hidden").addClass("hidden");
                    } else {
                        $('#chargeMinMileageDiv').removeClass("hidden").addClass("hidden");
                        $('#chargeMinGuestDiv').removeClass("hidden").addClass("hidden");
                    }
                    document.getElementById("chargeDescription").value = util.getStringValue(curr_charge.description);
                    document.getElementById("chargeDescription").readOnly = false;
                    $('#chargeMinGuest').val(curr_charge.minguest);
                    document.getElementById("chargeMinGuest").readOnly = false;
                    $('#chargeMinMileage').val(curr_charge.minmileage);
                    document.getElementById("chargeMinMileage").readOnly = false;
                }
                document.getElementById("btnSave").disabled = false;
            }
        }
        charge.action = uiBaseObj.UPDATE;
    },
    addRow : function (tableID, chargeElementObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.name = rowId;

        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+chargeElementObj.name+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+chargeElementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (charge.toBeDeletedElementID && charge.toBeDeletedElementID >=0) {
            var soapType = new DeleteChargeType(charge.toBeDeletedElementID);
            callWebService(soapType, charge.deleteElementHandler);
        }
        charge.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        charge.toBeDeletedElementID = id;
        charge.v_selected_rowid = "";
        document.getElementById("curChargeId").value = "";
        $('#deleteChargeConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletechargeresponsetype)) {
            charge.listAllElements();
            document.getElementById("btnSave").disabled = false;
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete charge!", jsonObj.deletechargeresponsetype.result);
        }
    },
    validateInput : function() {
        var rateValue = document.getElementById("chargeRate").value;
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
        if(!util.isNullOrEmpty($('#chargeMinGuest').val())) {
            if (!util.isNumber($('#chargeMinGuest').val())) {
                uiBaseObj.alertMsg("Minimum guest must be a number!");
                return false;
            }
        }
        if(!util.isNullOrEmpty($('#chargeMinMileage').val())) {
            if (!util.isNumber($('#chargeMinMileage').val())) {
                uiBaseObj.alertMsg("Minimum mileage must be a number!");
                return false;
            }
        }

        return true;
    },
    saveElement : function () {
        $("#btnSave").prop("disabled", true);
        if (!charge.validateInput()) {
            $("#btnSave").prop("disabled", false);
            return;
        }
        var chargeId = document.getElementById("curChargeId").value;
        var aName = document.getElementById("chargeName").value;
        var aRate = document.getElementById("chargeRate").value;
        var aRateType = document.getElementById("chargeRateType").value;
        var type = $("#chargeTypes").val();
        var aDescription = document.getElementById("chargeDescription").value;
        var minGuest = document.getElementById("chargeMinGuest").value;
        var minMileage = document.getElementById("chargeMinMileage").value;
        var soapType = new SaveChargeType(chargeId, aRate, aRateType, aName, aDescription, type, minGuest, minMileage);
        callWebService(soapType, charge.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savechargeresponsetype)) {
            if(charge.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if (charge.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS)
            }
            charge.listAllElements();
            if (charge.v_selected_rowid) {
                var selectedRow = document.getElementById(charge.v_selected_rowid);
                charge.selectRow("chargesTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save charge!", jsonObj.savechargeresponsetype.result);
        }
        $("#btnSave").prop("disabled", false);
    }
};