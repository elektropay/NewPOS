var globalOptionsPage = {
    init : function() {
        modifierAction.init();
        uiBaseObj.addDeleteConfirmDialog("globalOptionsPage", "deleteModifierActionConfirmationDialog", "Modifier Action", "modifierAction.deleteModifierAction();");
    }
};

var modifierAction = {
    action : "",
    toBeDeletedModifierId : -1,
    init : function() {
        modifierAction.listAllModifierActions();
    },
    resetModifierActionForm : function(disabled) {
        $("#modifierActionId").val("");
        $("#modifierActionId").attr("disabled", disabled);
        $("#modifierActionName").val("");
        $("#modifierActionName").attr("disabled", disabled);
        $("#modifierActionShortName").val("");
        $("#modifierActionShortName").attr("disabled", disabled);
        $("#modifierActionCode").val("");
        $("#modifierActionCode").attr("disabled", disabled);
        $("#priceMultiplier").val("");
        $("#priceMultiplier").attr("disabled", disabled);
        $("#modifierActionDescription").val("");
        $("#modifierActionDescription").attr("disabled", disabled);
    },
    listAllModifierActions : function() {
        var soapType = new ListModifierActionsType();
        callWebService(soapType, modifierAction.listModifierActionsHandler);
    },
    listModifierActionsHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listmodifieractionsresponsetype)) {
            document.getElementById("modifierActions").innerHTML = "";
            var modifierActionArray = util.getElementsArray(jsonObj.listmodifieractionsresponsetype.modifieraction);
            for (var i = 0; i < modifierActionArray.length; i++) {
                modifierAction.addModifierActionRow("modifierActions", modifierActionArray[i], "modifierAction.fetchModifierAction", "modifierAction.deleteModifierActionWithConfirmationDialog");
            }
            modifierAction.resetModifierActionForm(true);
        }
    },
    newModifierAction : function() {
        modifierAction.resetModifierActionForm(false);
        $("#priceMultiplier").val("1");
        $("#modifierActionName").focus();
        modifierAction.action = uiBaseObj.ADD;
    },
    saveModifierAction : function() {
        if (modifierAction.action == uiBaseObj.ADD) {
            uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            modifierAction.createModifierAction();
        } else if (modifierAction.action == uiBaseObj.UPDATE) {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            modifierAction.updateModifierAction();
        }
    },
    createModifierAction : function() {
        if ($("#modifierActionId").val() == null || $("#modifierActionId").val() == "") {
            var name = util.getXMLSafeValue($("#modifierActionName").val());
            var shortName = util.getXMLSafeValue($("#modifierActionShortName").val());
            var modifierCode = $("#modifierActionCode").val();
            var priceMultiplier = $("#priceMultiplier").val();
            var description = util.getXMLSafeValue($("#modifierActionDescription").val());
            var soapType = new CreateModifierActionType(name, shortName, modifierCode, priceMultiplier, description);
            callWebService(soapType, modifierAction.createModifierActionHandler);
        }
    },
    createModifierActionHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.addmodifieractionresponsetype)) {
            $("#modifierActionId").val(jsonObj.addmodifieractionresponsetype.id);
            modifierAction.listAllModifierActions();
            uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to add modifier action", jsonObj.addmodifieractionresponsetype.result);
        }
    },
    updateModifierAction : function() {
        if ($("#modifierActionId").val() != null && $("#modifierActionId").val() != "") {
            var id = $("#modifierActionId").val();
            var name = util.getXMLSafeValue($("#modifierActionName").val());
            var shortName = util.getXMLSafeValue($("#modifierActionShortName").val());
            var modifierCode = $("#modifierActionCode").val();
            var priceMultiplier = $("#priceMultiplier").val();
            var description = util.getXMLSafeValue($("#modifierActionDescription").val());
            var soapType = new UpdateModifierActionType(id, name, shortName, modifierCode, priceMultiplier, description);
            callWebService(soapType, modifierAction.updateModifierActionHandler);
        }
    },
    updateModifierActionHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.updatemodifieractionresponsetype)) {
            modifierAction.listAllModifierActions();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to update modifier action!", jsonObj.updatemodifieractionresponsetype.result);
        }
    },
    fetchModifierAction : function(id) {
        var soapType = new FetchModifierActionType(id);
        callWebService(soapType, modifierAction.fetchModifierActionHandler);
    },
    fetchModifierActionHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.fetchmodifieractionresponsetype)) {
            var modifierActionObj = jsonObj.fetchmodifieractionresponsetype.modifieraction;
            $("#modifierActionId").val(modifierActionObj.id);
            $("#modifierActionName").val(systemLanguage.getLanguageNames(modifierActionObj,'name','en'));
            $("#modifierActionShortName").val(systemLanguage.getLanguageNames(modifierActionObj,'shortName','en'));
            $("#modifierActionCode").val(modifierActionObj.modifiercode);
            $("#priceMultiplier").val(modifierActionObj.pricemultiplier);
            if (modifierActionObj.description != null && typeof modifierActionObj.description != "undefined") {
                $("#modifierActionDescription").val(modifierActionObj.description);
            }
            $("#modifierActionName").attr("disabled", false);
            $("#modifierActionShortName").attr("disabled", false);
            $("#modifierActionCode").attr("disabled", false);
            $("#priceMultiplier").attr("disabled", false);
            $("#modifierActionDescription").attr("disabled", false);
            modifierAction.action = uiBaseObj.UPDATE;
        }
    },
    deleteModifierAction : function() {
        if (util.isValidVariable(modifierAction.toBeDeletedModifierId)) {
            var soapType = new DeleteModifierActionType(modifierAction.toBeDeletedModifierId);
            callWebService(soapType, modifierAction.deleteModifierActionHandler);
            modifierAction.toBeDeletedModifierId = -1;
        }
    },
    deleteModifierActionWithConfirmationDialog : function(id) {
        modifierAction.toBeDeletedModifierId = id;
        $('#deleteModifierActionConfirmationDialog').popup('open');
    },
    deleteModifierActionHandler : function(jsonObj){
        if (util.isSuccessfulResponse(jsonObj.deletemodifieractionresponsetype)) {
            modifierAction.listAllModifierActions();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete modifier action!", jsonObj.deletemodifieractionresponsetype.result);
        }
    },
    addModifierActionRow : function(tableID, modifierActionObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        var innerHTML = "<td onclick='"+selectRowFunc+"("+modifierActionObj.id+");'>" + systemLanguage.getLanguageNames(modifierActionObj,'name','en') + "</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+modifierActionObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    }
};