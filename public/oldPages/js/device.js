var devicePage = {
    init : function() {
        printerObj.init();
        cashDrawerObj.init();
        $("#tabs").tabs({
            beforeActivate: function(event, ui) {
                var newTabDivId = ui.newPanel.attr("id");
                if (newTabDivId == "defaultDeviceTab") {
                    globalDeviceConfig.init();
                } else if (newTabDivId == "appDeviceConfigTab") {
                    appInstanceObj.init();
                } else if (newTabDivId == "otherDeviceTab") {
                    srm.init();
                    paymentTerminalObj.init();
                } else if (newTabDivId == "cashDrawerTab") {
                    cashDrawerObj.init();
                }
            }
        });
        $("#otherDeviceTypeRadioButtonDiv input").bind("change", function(event, ui) {
            var selectedVal = $(this).val();
            if (selectedVal == "PAYMENT_TERMINAL") {
                $("#paymentTerminalTab").removeClass("hidden");
                $("#srmTab").addClass("hidden");
            } else {
                $("#srmTab").removeClass("hidden");
                $("#paymentTerminalTab").addClass("hidden");
            }
        });
        uiBaseObj.addDeleteConfirmDialog("printers-page", "deletePrinterConfirmationDialog", "Printer", "printerObj.deletePrinterRow();");
        uiBaseObj.addDeleteConfirmDialog("printers-page", "deleteCashDrawerConfirmationDialog", "Cash Drawer", "cashDrawerObj.deleteCashDrawer();");
        uiBaseObj.addDeleteConfirmDialog("printers-page", "deleteSRMConfirmationDialog", "SRM", "srm.deleteSalesRecordingMachine();");
        uiBaseObj.addDeleteConfirmDialog("printers-page", "deletePaymentTerminalConfirmationDialog", "Payment Terminal", "paymentTerminalObj.deleteRow();");
        uiBaseObj.addDeleteConfirmDialog("printers-page", "deleteAppInstanceConfirmationDialog", "App Instance", "appInstanceObj.deleteAppInstance();");
    }
};

var printerObj = {
    action : "",
    v_selected_rowid : "",
    selectedPrinterId : -1,
    toBeDeletedPrinterID : -1,
    printerElements : [],
    init : function() {
        printerObj.listPrinters();
        printerObj.listAvailablePrinters();
        printerObj.listAllLanguages();
    },
    selectRow : function(tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        printerObj.v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if(row.id == selectedRowID) {
                row.style.background = '#dcfac9';
                row.cells[0].style.background = '#dcfac9';
                row.cells[1].style.background = '#dcfac9';
                row.cells[2].style.background = '#dcfac9';
                var curr_printer = printerObj.printerElements[i];
                if (curr_printer != null) {
                    printerObj.selectedPrinterId = curr_printer.id;
                    document.getElementById("printer_name").value = curr_printer.name;
                    $("#printer_list").val(curr_printer.realname).selectmenu("refresh");
                    document.getElementById("printer_name").readOnly = false;
                    document.getElementById("second-lang-name").readOnly = false;
                    $("#lang-setting-list").val(curr_printer.languagesetting).selectmenu("refresh");
                    $("#second-lang-list").val(curr_printer.secondlanguageid).selectmenu("refresh");
                    $("#third-lang-list").val(curr_printer.thirdlanguageid).selectmenu("refresh");
                    $("#second-lang-name").val(curr_printer.namesecondlanguage);
                    $("#backup-printer-list").val(curr_printer.backupprinterid).selectmenu("refresh");
                    $("#print-item-one-by-one").prop("checked", curr_printer.printoneitemperticket == "true").checkboxradio("refresh");
                    $("#printer_type").val(curr_printer.type).selectmenu("refresh");
                    $("#printer-model").val(curr_printer.model).selectmenu("refresh");
                    $("#ipAddress").val(util.getEmptyValueIfInvalid(curr_printer.ipaddr));
                    $("#ipAddress").prop('readOnly', false);
                    $("#printer_kitchenName").val(curr_printer.kitchenname);
                    $("#printer_kitchenName").prop('readOnly', false);
                }
            } else {
                row.style.background = ''; //'#f0c992';
                row.cells[0].style.background = ''; //'#f0c992';
                row.cells[1].style.background = ''; //'#f0c992';
                row.cells[2].style.background = ''; //'#f0c992';
            }
        }
        printerObj.action = uiBaseObj.UPDATE;
    },
    addPrinterRow : function(tableID, printerObj) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var row = table.insertRow(rowCount);
        var rowId = tableID + "_r" + rowCount;

        row.id = rowId;
        row.name = rowId;

        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };

        var cell1 = row.insertCell(0);
        cell1.style.color = 'color:#000';

        cell1.setAttribute('onclick', 'printerObj.selectRow("'+tableID+'", "'+rowId+'");');
        var element1 = document.createTextNode(printerObj.name); //document.createElement("th");
        cell1.appendChild(element1);//row.appendChild(element1);

        var cell2 = row.insertCell(1);
        cell2.style.color = 'color:#000';
        cell2.setAttribute('onclick', 'printerObj.selectRow("'+tableID+'", "'+rowId+'");');
        if (printerObj.realname == null || typeof printerObj.realname == "object") {
            printerObj.realname = '';
        }
        var element3 = document.createTextNode(printerObj.realname);
        cell2.appendChild(element3);

        var cell3 = row.insertCell(2);
        var temp = "<a href='javascript:printerObj.deletePrinterWithConfirmationDialog(\"" + printerObj.id +"\");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a>";
        cell3.className = "delete-icon-td";
        cell3.innerHTML = temp;

        return rowId;
    },
    deletePrinterWithConfirmationDialog : function(printerId) {
        printerObj.toBeDeletedPrinterID = printerId;
        $('#deletePrinterConfirmationDialog').popup('open');
    },
    deletePrinterRow : function() {
        if (printerObj.toBeDeletedPrinterID && printerObj.toBeDeletedPrinterID >=0) {
            var deletePrinterType = new DeletePrinterType(printerObj.toBeDeletedPrinterID);
            callWebService(deletePrinterType, printerObj.deletePrinterHandler);
            printerObj.toBeDeletedPrinterID = -1;
        }
    },
    deletePrinterHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteprinterresponsetype)) {
            printerObj.listPrinters();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete printer!", jsonObj.deleteprinterresponsetype.result);
        }
    },
    clearPrinterDetails : function() {
        document.getElementById("printer_name").value = "";
        document.getElementById("printer_name").readOnly = false;
        document.getElementById("printer_name").disabled = false;
        document.getElementById("second-lang-name").readOnly = false;
        document.getElementById("second-lang-name").disabled = false;
        $("#printer_list").val("").selectmenu("refresh");
        $("#lang-setting-list").val(0).selectmenu("refresh");
        $("#second-lang-list").val(-1).selectmenu("refresh");
        $("#third-lang-list").val(-1).selectmenu("refresh");
        $('#backup-printer-list').val(-1).selectmenu("refresh");
        $("#second-lang-name").val("");
        $('#print-item-one-by-one').prop("checked", false).checkboxradio("refresh");
        $("#printer_type").val("").selectmenu("refresh");
        $("#printer-model").val("").selectmenu("refresh");
        $("#ipAddress").val("");
        $("#ipAddress").prop('readOnly', false);
        $("#printer_kitchenName").val("");
        $("#printer_kitchenName").prop('readOnly', false);
        printerObj.action = uiBaseObj.ADD;
    },
    newPrinter : function() {
        printerObj.clearPrinterDetails();
        printerObj.selectedPrinterId = -1;
    },
    savePrinterInfo : function() {
        var name = document.getElementById("printer_name").value;
        var ip = $("#ipAddress").val();
        var realName = $("#printer_list").val();
        if (!realName) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_DEVICE_PRINTER, "No real printer is selected");
            return;
        }
        var languageSetting = $("#lang-setting-list").val();
        var secondLanguageId = $("#second-lang-list").val();
        var thirdLanguageId = $("#third-lang-list").val();
        var backupPrinterId = $('#backup-printer-list').val();
        var nameSecondLanguage = $("#second-lang-name").val();
        var printOneItemPerTicket = $("#print-item-one-by-one").prop("checked");
        var printerType = $("#printer_type").val();
        var model = $("#printer-model").val();
        var kitchenName = $("#printer_kitchenName").val();

        if (languageSetting == 1 || languageSetting == 3 || languageSetting == 5) {
            if (String(secondLanguageId) == '-1') {
                uiBaseObj.alert(systemLanguage.msgCodeList.SELECT_SECOND_LANGUAGE, 'Please Select Second Language');
                return;
            }
        }

        if (languageSetting == 2 || languageSetting == 4) {
            if (String(thirdLanguageId) == '-1') {
                uiBaseObj.alert(systemLanguage.msgCodeList.SELECT_THIRD_LANGUAGE, 'Please Select Third Language');
                return;
            }
        }

        if (languageSetting == 6) {
            if (String(secondLanguageId) == '-1' || String(thirdLanguageId) == '-1') {
                uiBaseObj.alert(systemLanguage.msgCodeList.SELECT_SECOND_AND_THIRD_LANGUAGE, 'Please Select Second And Third Language');
                return;
            }
        }

        var soapType;
        var requestType;
        if (printerObj.selectedPrinterId >= 0) {
            soapType = new UpdatePrinterType(printerObj.selectedPrinterId, name, ip, realName, languageSetting, nameSecondLanguage, secondLanguageId, thirdLanguageId, backupPrinterId, printOneItemPerTicket, printerType, model, kitchenName);
            requestType = "update";
        } else {
            soapType = new AddPrinterType(name, ip, realName, languageSetting, nameSecondLanguage, secondLanguageId, thirdLanguageId, backupPrinterId, printOneItemPerTicket, printerType, model, kitchenName);
            requestType = "create";
        }
        callWebService(soapType, printerObj.savePrinterHandler, requestType);
    },
    savePrinterHandler : function(jsonObj, requestType) {
        var responseType = requestType + "printerresponsetype";
        printerObj.selectedPrinterId = -1;
        if (util.isSuccessfulResponse(jsonObj[responseType])) {
            if(printerObj.action == uiBaseObj.ADD) {
                printerObj.v_selected_rowid = null;
                printerObj.clearPrinterDetails();
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if (printerObj.action ==  uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            printerObj.listPrinters();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save printer!", jsonObj[responseType].result);
        }
    },
    listAllLanguages : function() {
        var ListSystemLanguagesRequest = new ListSystemLanguagesType();
        callWebService(ListSystemLanguagesRequest, printerObj.ListSystemLanguagesHandler);
    },
    ListSystemLanguagesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listsystemlanguagesresponsetype)) {
             $('#second-lang-list').find('option:gt(0)').remove();
             $('#third-lang-list').find('option:gt(0)').remove();
             var languagesList = util.getElementsArray(jsonObj.listsystemlanguagesresponsetype.systemlanguage);
             for (var i = 0; i < languagesList.length; i++) {
                 var language = languagesList[i];
                 if (language.enabled == "true") {
                    $("#second-lang-list").append("<option value='" + language.id + "'>" + language.name + "</option>").trigger("create");
                    $("#third-lang-list").append("<option value='" + language.id + "'>" + language.name + "</option>").trigger("create");
                 }
             }
        }
    },
    listPrintersHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listprintersresponsetype)) {
            $("#printers tr").remove();
            var printers = util.getElementsArray(jsonObj.listprintersresponsetype.printers);
            printerObj.printerElements = printers;
            for(var i = 0; i < printers.length; i++) {
                printerObj.addPrinterRow("printers", printers[i]);
            }
            if ($("#receiptPrinter-select-choice").length > 0){
                $('#receiptPrinter-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#receiptPrinter-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#waitlistPrinter-select-choice").length > 0){
                $('#waitlistPrinter-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#waitlistPrinter-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#displays-select-choice").length > 0) {
                $("#displays-select-choice").find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    if (printer.realname === 'Display') {
                        $("#displays-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                    }
                }
            }
            if ($("#connectedPrinter-select-choice").length > 0){
                $('#connectedPrinter-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#connectedPrinter-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#defaultReceiptPrinter-select-choice").length > 0) {
                $('#defaultReceiptPrinter-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#defaultReceiptPrinter-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#defaultWaitlistPrint-select-choice").length > 0) {
                $('#defaultWaitlistPrint-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#defaultWaitlistPrint-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }           
             if ($("#defaultOpenFoodPrint-select-choice").length > 0) {
                $('#defaultOpenFoodPrint-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#defaultOpenFoodPrint-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#defaultPackagePrinter-select-choice").length > 0) {
                $('#defaultPackagePrinter-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#defaultPackagePrinter-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#defaultPackagePrinter2-select-choice").length > 0) {
                $('#defaultPackagePrinter2-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#defaultPackagePrinter2-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#defaultRunnerPrinter-select-choice").length > 0) {
                $('#defaultRunnerPrinter-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#defaultRunnerPrinter-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#defaultReportPrinter-select-choice").length > 0) {
                $('#defaultReportPrinter-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#defaultReportPrinter-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if ($("#backup-printer-list").length > 0) {
                $('#backup-printer-list').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#backup-printer-list").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
            if (printerObj.v_selected_rowid) {
                printerObj.selectRow("printers", printerObj.v_selected_rowid);
            }
        }
    },
    listPrinters : function() {
        var listPrinterSoapType = new ListPrintersType();
        callWebService(listPrinterSoapType, printerObj.listPrintersHandler);
    },
    listAvailablePrinters : function() {
        var listAvailablePrintersSoapType = new ListAvailablePrintersType();
        callWebService(listAvailablePrintersSoapType, printerObj.listAvailablePrintersHandler);
    },
    listAvailablePrintersHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listavailableprintersresponsetype)) {
            if ($("#printer_list").length > 0) {
                $('#printer_list').find('option:gt(1)').remove();
                var availablePrinters = util.getElementsArray(jsonObj.listavailableprintersresponsetype.printers);
                for (var i = 0; i < availablePrinters.length; i++) {
                    $("#printer_list").append("<option value='" + availablePrinters[i].realname + "'>" + availablePrinters[i].realname + "</option>").trigger("create");
                }
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "failed to load all available printer!", jsonObj.listavailableprintersresponsetype.result);
        }
    }
};

var paymentTerminalObj = {
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    globalDevice : null,
    init : function() {
        paymentTerminalObj.listAllElements();
    },
    clearDetails : function(disabled) {
        $("#paymentTerminalName").val("");
        $("#paymentTerminalIpAddress").val("");
        $("#paymentTerminalPort").val("");
        $("#paymentTerminalPinPadId").val("");
        $("#paymentTerminalPinPadToken").val("");
        $("#paymentTerminalModel").val("");
        $("#paymentTerminalAdditionalSetting").val("");
        $("#paymentTerminalPinPadTip").prop("checked", false).checkboxradio("refresh");
        $("#paymentTerminalPinPadSignature").prop("checked", false).checkboxradio("refresh");
        $("#paymentTerminalManufacturer-select-choice").val("").selectmenu('refresh');
        $("#paymentTerminalCommType-select-choice").val("").selectmenu('refresh');
        $("#paymentTerminalTable :input").prop("disabled", disabled);
        $("#paymentTerminalSaveBtn").prop("disabled", disabled);
        var manufacturerName = $("#paymentTerminalManufacturer-select-choice").val();
        paymentTerminalObj.showFieldsBasedOnManufacturer(manufacturerName);
    },
    newEntry : function () {
        paymentTerminalObj.clearDetails(false);
        paymentTerminalObj.v_selected_rowid = "";
        $("#paymentTerminalId").val("");
        $('#enablePinPadDiv').hide();
        $('#initDeviceDiv').hide();
    },
    listAllElements : function (){
        paymentTerminalObj.clearDetails(true);
        var soapType = new FindDevicesType(null, "PAYMENT_TERMINAL");
        callWebService(soapType, paymentTerminalObj.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finddevicesresponsetype)) {
            document.getElementById("paymentTerminals").innerHTML = "";
            $('#defaultPaymentTerminal-select-choice').find('option:gt(0)').remove();
            $('#paymentTerminal-select-choice').find('option:gt(0)').remove();
            paymentTerminalObj.elementList = util.getElementsArray(jsonObj.finddevicesresponsetype.devices);
            for (var i = 0; i < paymentTerminalObj.elementList.length; i++) {
                paymentTerminalObj.addRow("paymentTerminals", paymentTerminalObj.elementList[i], "paymentTerminalObj.selectRow", "paymentTerminalObj.deleteWithConfirmationDialog");
                $("#defaultPaymentTerminal-select-choice").append("<option value='" + paymentTerminalObj.elementList[i].id + "'>" + paymentTerminalObj.elementList[i].name + "</option>").trigger("create");
                $("#paymentTerminal-select-choice").append("<option value='" + paymentTerminalObj.elementList[i].id + "'>" + paymentTerminalObj.elementList[i].name + "</option>").trigger("create");
            }
            if (paymentTerminalObj.v_selected_rowid) {
                paymentTerminalObj.selectRow("paymentTerminals", paymentTerminalObj.v_selected_rowid);
            }
        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        paymentTerminalObj.v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var currPaymentTerminal = paymentTerminalObj.elementList[i];
                if (currPaymentTerminal != null) {
                    $("#paymentTerminalId").val(currPaymentTerminal.id);
                    $("#paymentTerminalIpAddress").val(util.getEmptyValueIfInvalid(currPaymentTerminal.ipaddress));
                    $("#paymentTerminalName").val(util.getEmptyValueIfInvalid(currPaymentTerminal.name));
                    $("#paymentTerminalPort").val(util.getEmptyValueIfInvalid(currPaymentTerminal.port));
                    $("#paymentTerminalModel").val(util.getEmptyValueIfInvalid(currPaymentTerminal.modelname));
                    $("#paymentTerminalPinPadId").val(util.getEmptyValueIfInvalid(currPaymentTerminal.terminalid));
                    $("#paymentTerminalPinPadToken").val(util.getEmptyValueIfInvalid(currPaymentTerminal.pairingtoken));
                    $("#paymentTerminalAdditionalSetting").val(util.getEmptyValueIfInvalid(currPaymentTerminal.additionalsettings));
                    var enablePinPadTip = (currPaymentTerminal.pinpadtipadjustment == "true");
                    $("#paymentTerminalPinPadTip").prop("checked", enablePinPadTip).checkboxradio("refresh");
                    var enablePinPadSignature = (currPaymentTerminal.pinpadsignatureadjustment == "true");
                    $("#paymentTerminalPinPadSignature").prop("checked", enablePinPadSignature).checkboxradio("refresh");
                    $("#paymentTerminalManufacturer-select-choice").val(currPaymentTerminal.manufacturername).selectmenu('refresh');
                    $("#paymentTerminalCommType-select-choice").val(currPaymentTerminal.communicationtype).selectmenu('refresh');
                    $("#paymentTerminalTable :input").prop("disabled", false);
                    $("#paymentTerminalTable :select").prop("disabled", false);
                    $("#paymentTerminalSaveBtn").prop("disabled", false);
                    paymentTerminalObj.showFieldsBasedOnManufacturer(currPaymentTerminal.manufacturername, currPaymentTerminal.status);
                }
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
        if (paymentTerminalObj.toBeDeletedElementID && paymentTerminalObj.toBeDeletedElementID >= 0) {
            var soapType = new DeleteDeviceType(paymentTerminalObj.toBeDeletedElementID);
            callWebService(soapType, paymentTerminalObj.deleteElementHandler);
            paymentTerminalObj.toBeDeletedElementID = -1;
        }
    },
    deleteWithConfirmationDialog : function (id) {
        paymentTerminalObj.toBeDeletedElementID = id;
        paymentTerminalObj.v_selected_rowid = "";
        $("#paymentTerminalId").val("");
        $('#deletePaymentTerminalConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletedeviceresponsetype)) {
            paymentTerminalObj.listAllElements();
            $("#paymentTerminalSaveBtn").prop("disabled", true);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Payment Terminal!", jsonObj.deletedeviceresponsetype.result);
        }
    },
    validateInput : function() {
        var name = $("#paymentTerminalName").val();
        if (name == null || name.trim() == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Payment Terminal Name cannot be empty!");
            return false;
        }
        if ($("#paymentTerminalManufacturer-select-choice").val() != 'MONERIS_CLOUD') {
            var ipAddress = $("#paymentTerminalIpAddress").val();
            if (!util.isValidVariable(ipAddress)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_IP_ADDRESS, "Payment Terminal IP Address cannot be empty!");
                return false;
            }
            var port = $("#paymentTerminalPort").val();
            if (!util.isValidVariable(port)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PORT, "Payment Terminal Port cannot be empty!");
                return false;
            }
        } else {
            var terminalId = $("#paymentTerminalPinPadId").val();
            if (!util.isValidVariable(terminalId)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_TERMINAL_ID, "Payment Terminal ID cannot be empty!");
                return false;
            }
            var pairingToken = $("#paymentTerminalPinPadToken").val();
            if (!util.isValidVariable(pairingToken)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PAIRING_TOKEN, "Payment Terminal Token cannot be empty!");
                return false;
            }
        }

        return true;
    },
    saveElement : function () {
        if (!paymentTerminalObj.validateInput()) {
            return;
        }
        var id = $("#paymentTerminalId").val();
        var ipAddress = $("#paymentTerminalIpAddress").val();
        var name = $("#paymentTerminalName").val();
        var realName = $("#paymentTerminalName").val();
        var port = $("#paymentTerminalPort").val();
        var terminalId = $("#paymentTerminalPinPadId").val();
        var pairingToken = $("#paymentTerminalPinPadToken").val();
        var manufacturerName = $("#paymentTerminalManufacturer-select-choice").val();
        var modelName = $("#paymentTerminalModel").val();
        var additionalSettings = $("#paymentTerminalAdditionalSetting").val();
        var pinPadTipAdjustment = $("#paymentTerminalPinPadTip").prop("checked");
        var pinPadSignatureAdjustment = $("#paymentTerminalPinPadSignature").prop("checked");
        var commType = $("#paymentTerminalCommType-select-choice").val();
        var soapType = new SaveDeviceType(id, name, realName, "PAYMENT_TERMINAL", manufacturerName, null, null, ipAddress, port, modelName, commType, additionalSettings, pinPadTipAdjustment, pinPadSignatureAdjustment, null, terminalId, pairingToken);
        callWebService(soapType, paymentTerminalObj.saveElementHandler);
    },
    saveElementHandler : function (jsonObj, callbackObj) {
        if (util.isSuccessfulResponse(jsonObj.savedeviceresponsetype)) {
            paymentTerminalObj.listAllElements();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alertMsg(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Payment Terminal!", jsonObj.savedeviceresponsetype.result);
        }
    },
    initTerminal : function(command) {
        $("#pairPinPadBtn").prop('disabled', true);
        $("#initPinPadBtn").prop('disabled', true);
        $("#unpairPinPadBtn").prop('disabled', true);

        var terminalId = $("#paymentTerminalId").val();
        var soapType = new SendCommandToDevice(terminalId, null, "PAYMENT_TERMINAL", command);
        callWebService(soapType, paymentTerminalObj.initTerminalHandler);
    },
    initTerminalHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.sendcommandtodeviceresponsetype)) {
            uiBaseObj.alertMsg("Successful send command to device!", uiBaseObj.SUCCESS);
            paymentTerminalObj.listAllElements();
        } else {
            uiBaseObj.alertMsg(jsonObj.sendcommandtodeviceresponsetype.result.failurereason, uiBaseObj.ERROR);
        }

        $("#pairPinPadBtn").prop('disabled', false);
        $("#initPinPadBtn").prop('disabled', false);
        $("#unpairPinPadBtn").prop('disabled', false);
    },
    showFieldsBasedOnManufacturer : function (manufacturerName, status) {
        $('#ipAddressDiv').show();
        $('#portNumberDiv').show();
        $('#enablePinPadDiv').hide();
        $('#initDeviceDiv').hide();
        $('#pairPinPadDiv').hide();
        $('#initUnpairPinPadDiv').hide();
        $('#terminalIdDiv').hide();
        $('#pairingTokenDiv').hide();
        if (manufacturerName == 'PAX') {
            $('#enablePinPadDiv').show();
        } else if (manufacturerName == 'MONERIS_INGENICO') {
            $('#initDeviceDiv').show();
        } else if (manufacturerName == 'MONERIS_CLOUD') {
            $('#ipAddressDiv').hide();
            $('#portNumberDiv').hide();
            $('#terminalIdDiv').show();
            $('#pairingTokenDiv').show();
            if (status != 'Paired') {
                $('#pairPinPadDiv').show();
                $('#initUnpairPinPadDiv').hide();
                $("#paymentTerminalPinPadToken").prop('disabled', false);
            } else {
                $("#paymentTerminalPinPadToken").prop('disabled', true);
                $('#pairPinPadDiv').hide();
                $('#initUnpairPinPadDiv').show();
            }
        }
    }
};


var srm = {
    action : "",
    toBeDeletedSrmID : -1,
    init : function() {
        var soapType = new FindSystemConfigurationsType("SRM_ENABLED");
        callWebService(soapType, srm.initSrmHandler);
    },
    initSrmHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
            systemConfigurationObj = jsonObj.listsystemconfigurationsresponsetype.systemconfiguration;
            if (typeof systemConfigurationObj != "undefined" && systemConfigurationObj != null) {
                if (util.isBooleanTrue(systemConfigurationObj.value)) {
                    srm.doInit();
                }
            }
        }
    },
    doInit : function() {
        srm.listAllSalesRecordingMachines();
        srm.listAllPrinters();
        srm.listAllTaxes();
    },
    resetSalesRecordingMachineForm : function (disabled) {
        $("#salesRecordingMachineId").val("");
        $("#srmDetailContentDiv :input").val("");
        $("#srmDetailContentDiv :checked").prop("checked", false);
        $("#srm-connected-printer-select-choice").val("").selectmenu("refresh");
        $("#srm-tps-select-choice").val("").selectmenu("refresh");
        $("#srm-tvq-select-choice").val("").selectmenu("refresh");
        srm.setEditingDetailsForm(disabled);
    },
    setEditingDetailsForm : function(disabled) {
        $("#salesRecordingMachineName").attr("disabled", disabled);
        $("#srmDeviceName").attr("disabled", disabled);
        $("#srmPort").attr("disabled", disabled);
        $("#srm-operating-mode-select-choice").attr("disabled", disabled);
        $("#srm-connection-type-select-choice").attr("disabled", disabled);
        $("#srm-connected-printer-select-choice").attr("disabled", disabled);
        $("#srm-counter-service-mode").attr("disabled", disabled);
        $("#srm-print-closing-receipt").attr("disabled", disabled);
        $("#srm-tps-select-choice").attr("disabled", disabled);
        $("#srm-tvq-select-choice").attr("disabled", disabled);
        $("#srm-enabled").attr("disabled", disabled);
    },
    listAllSalesRecordingMachines : function () {
        var showDetails = true;
        var soapType = new FindSalesRecordingMachinesType(null, showDetails);
        callWebService(soapType, srm.listAllSalesRecordingMachinesHandler);
    },
    listAllSalesRecordingMachinesHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findsalesrecordingmachinesresponsetype)) {
            $("#salesRecordingMachines").html("");
            var srms = util.getElementsArray(jsonObj.findsalesrecordingmachinesresponsetype.salesrecordingmachines);
            for (var i = 0; i < srms.length; i++) {
                srm.addSalesRecordingMachineRow("salesRecordingMachines", srms[i], "srm.fetchSalesRecordingMachine", "srm.deleteSrmWithConfirmationDialog");
            }
            srm.resetSalesRecordingMachineForm(true);
        }
    },
    newSalesRecordingMachine : function () {
        srm.resetSalesRecordingMachineForm(false);
        srm.action = uiBaseObj.ADD;
    },
    saveSalesRecordingMachine : function () {
        var id = $("#salesRecordingMachineId").val();
        var name = $("#salesRecordingMachineName").val();
        var srmDeviceName = $("#srmDeviceName").val();
        var operatingMode = $("#srm-operating-mode-select-choice").val();
        var connectionType = $("#srm-connection-type-select-choice").val();
        var port = $("#srmPort").val();
        var connectedPrinter = $("#srm-connected-printer-select-choice").val();
        var counterServiceMode = $("#srm-counter-service-mode").prop("checked");
        var printClosingReceipt = $("#srm-print-closing-receipt").prop("checked");
        var tpsId = $("#srm-tps-select-choice").val();
        var tvqId = $("#srm-tvq-select-choice").val();
        var enabled = $("#srm-enabled").prop("checked");
        var soapType = new SaveSalesRecordingMachineType(id, name, srmDeviceName, operatingMode, connectionType, null, port, connectedPrinter, counterServiceMode, printClosingReceipt, tpsId, tvqId, enabled);
        callWebService(soapType, srm.saveSalesRecordingMachineHandler);
    },
    saveSalesRecordingMachineHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savesalesrecordingmachineresponsetype)) {
            srm.resetSalesRecordingMachineForm(true);
            srm.listAllSalesRecordingMachines();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to save sales recording machine!", jsonObj.savesalesrecordingmachineresponsetype.result);
        }
    },
    fetchSalesRecordingMachine : function (id) {
        $("#salesRecordingMachineId").val("");
        if (id) {
            var showDetails = true;
            var soapType = new FindSalesRecordingMachinesType(id, showDetails);
            callWebService(soapType, srm.fetchSalesRecordingMachineHandler);
        }
    },
    fetchSalesRecordingMachineHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findsalesrecordingmachinesresponsetype)) {
            var salesRecordingMachine = jsonObj.findsalesrecordingmachinesresponsetype.salesrecordingmachines;
            $("#salesRecordingMachineId").val(salesRecordingMachine.id);
            $("#salesRecordingMachineName").val(salesRecordingMachine.name);
            $("#srmDeviceName").val(salesRecordingMachine.devicename);
            $("#srmPort").val(salesRecordingMachine.port);
            $("#srm-operating-mode-select-choice").val(salesRecordingMachine.operatingmode).selectmenu("refresh");
            $("#srm-connection-type-select-choice").val(salesRecordingMachine.connectiontype).selectmenu("refresh");
            $("#srm-connected-printer-select-choice").val(salesRecordingMachine.printerid).selectmenu("refresh");
            $("#srm-tps-select-choice").val(salesRecordingMachine.tpsid).selectmenu("refresh");
            $("#srm-tvq-select-choice").val(salesRecordingMachine.tvqid).selectmenu("refresh");
            $("#srm-counter-service-mode").prop("checked", salesRecordingMachine.counterservice == "true");
            $("#srm-print-closing-receipt").prop("checked", salesRecordingMachine.printclosingreceipt == "true");
            $("#srm-enabled").prop("checked", salesRecordingMachine.active == "true").checkboxradio("refresh");;
            srm.setEditingDetailsForm(false);
            srm.action = uiBaseObj.UPDATE;
        }
    },
    deleteSalesRecordingMachine : function () {
        if (srm.toBeDeletedSrmID && srm.toBeDeletedSrmID >= 0) {
            var soapType = new DeleteSalesRecordingMachineType(srm.toBeDeletedSrmID);
            callWebService(soapType, srm.deleteHandler);
            srm.toBeDeletedSrmID = -1;
        }
    },
    deleteSrmWithConfirmationDialog : function (id) {
        srm.toBeDeletedSrmID = id;
        $('#deleteSRMConfirmationDialog').popup('open');
    },
    deleteHandler : function (jsonObj){
        if (util.isSuccessfulResponse(jsonObj.deletesalesrecordingmachineresponsetype)) {
            srm.listAllSalesRecordingMachines();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete Sales Recording Machine!", jsonObj.deletesalesrecordingmachineresponsetype.result);
        }
    },
    addSalesRecordingMachineRow : function (tableID, srmObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        var innerHTML = "<td onclick='"+selectRowFunc+"("+srmObj.id+");'>"+srmObj.name+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+srmObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    listAllPrinters : function () {
        var soapType = new ListPrintersType();
        callWebService(soapType, srm.listPrintersHandler);
    },
    listPrintersHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listprintersresponsetype)) {
            var printers = util.getElementsArray(jsonObj.listprintersresponsetype.printers);
            if ($("#srm-connected-printer-select-choice").length > 0){
                $('#srm-connected-printer-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#srm-connected-printer-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
                $("#srm-connected-printer-select-choice").val("").selectmenu("refresh");
            }
        }
    },
    listAllTaxes : function () {
        var listTaxesType = new ListTaxesType();
        callWebService(listTaxesType, srm.listTaxesHandler);
    },
    listTaxesHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listtaxesresponsetype)) {
            var taxes = util.getElementsArray(jsonObj.listtaxesresponsetype.taxes);
            if ($("#srm-tps-select-choice").length > 0){
                $('#srm-tps-select-choice').find('option:gt(0)').remove();
                $('#srm-tvq-select-choice').find('option:gt(0)').remove();
                for(var i = 0; i < taxes.length; i++) {
                    var tax = taxes[i];
                    $("#srm-tps-select-choice").append("<option value='" + tax.id + "'>" + tax.name + "</option>").trigger("create");
                    $("#srm-tvq-select-choice").append("<option value='" + tax.id + "'>" + tax.name + "</option>").trigger("create");
                }
                $("#srm-tps-select-choice").val("").selectmenu("refresh");
                $("#srm-tvq-select-choice").val("").selectmenu("refresh");
            }
        }
    }
};

var cashDrawerObj = {
    action : "",
    toBeDeletedCashDrawerID : -1,
    init : function() {
        cashDrawerObj.listActiveStaffs();
        cashDrawerObj.listAllCashDrawers();
    },
    resetCashDrawerForm : function(disabled) {
        $("#cashDrawerId").val("");
        $("#cashDrawerId").attr("disabled", disabled);
        $("#cashDrawerName").val("");
        $("#cashDrawerName").attr("disabled", disabled);
        $("#realName").val("");
        $("#realName").attr("disabled", disabled);
        $("#cashDrawer-type-select-choice").val("").selectmenu("refresh");
        $("#cashDrawer-type-select-choice").attr("disabled", disabled);
        $("#connectedPrinter-select-choice").val("-1").selectmenu("refresh");
        $("#connectedPrinter-select-choice").attr("disabled", disabled);
        $("#staff-select-choice").val("-1").selectmenu("refresh");
//        $("#staff-select-choice").selectmenu( "disable" );
        $(".ui-checkbox-on").removeClass("ui-checkbox-on").addClass("ui-checkbox-off");
    },
    listActiveStaffs : function() {
        var soapType = new ListStaffType(false, false, false);
        callWebService(soapType, cashDrawerObj.listActiveStaffsHandler);
    },
    listActiveStaffsHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.liststaffresponsetype)) {
            document.getElementById("staff-select-choice").innerHTML = "";
            var staffList = util.getElementsArray(jsonObj.liststaffresponsetype.staff);
            var elementHtml = '<option data-placeholder="true" value="-1" class="select-list-option-value-select-one">Please select one</option>';
            for (var i = 0; i < staffList.length; i++) {
                elementHtml += '<option value="' + staffList[i].id + '">' + staffList[i].name + '</option>';
            }
            $("#staff-select-choice").append(elementHtml).trigger("create");
        }
    },
    listAllCashDrawers : function() {
        var soapType = new FindDevicesType(null, "CASH_DRAWER");
        callWebService(soapType, cashDrawerObj.listCashDrawersHandler);
    },
    listCashDrawersHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finddevicesresponsetype)) {
            document.getElementById("cashDrawers").innerHTML = "";
            var cashDrawers = util.getElementsArray(jsonObj.finddevicesresponsetype.devices);
            for (var i = 0; i < cashDrawers.length; i++) {
                cashDrawerObj.addCashDrawerRow("cashDrawers", cashDrawers[i], "cashDrawerObj.fetchCashDrawer", "cashDrawerObj.deleteCashDrawerWithConfirmationDialog");
            }
            cashDrawerObj.resetCashDrawerForm(true);
            if ($("#cashDrawer-select-choice").length > 0) {
                $('#cashDrawer-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < cashDrawers.length; i++) {
                    var cashDrawer = cashDrawers[i];
                    $("#cashDrawer-select-choice").append("<option value='" + cashDrawer.id + "'>" + cashDrawer.name + "</option>").trigger("create");
                }
                $("#cashDrawer-select-choice").val("-1").selectmenu("refresh");
            }

            if ($("#defaultCashDrawer-select-choice").length > 0) {
                $('#defaultCashDrawer-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < cashDrawers.length; i++) {
                    var cashDrawer = cashDrawers[i];
                    $("#defaultCashDrawer-select-choice").append("<option value='" + cashDrawer.id + "'>" + cashDrawer.name + "</option>").trigger("create");
                }
                $("#defaultCashDrawer-select-choice").val("").selectmenu("refresh");
            }
        }
    },
    newCashDrawer : function() {
        cashDrawerObj.resetCashDrawerForm(false);
        cashDrawerObj.action = uiBaseObj.ADD;
    },
    saveCashDrawer : function() {
        var id = $("#cashDrawerId").val();
        var name = $("#cashDrawerName").val();
        var realName = $("#realName").val();
        var manufacturerName = $("#cashDrawer-type-select-choice").val();
        var connectedPrinter = $("#connectedPrinter-select-choice").val();
        
         var staffList = [];
        $("#staff-select-choice option:selected").each(
           function() {
               var staff = new StaffType(this.value);
               staffList.push(staff);
            }
        );
        
        var soapType = new SaveDeviceType(id, name, realName, "CASH_DRAWER", manufacturerName, connectedPrinter, null, null, null, null, null, null, null, null, staffList);
        callWebService(soapType, cashDrawerObj.saveCashDrawerHandler);
    },
    saveCashDrawerHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savedeviceresponsetype)) {
            if(cashDrawerObj.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if (cashDrawerObj.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            cashDrawerObj.clearCashDrawer();
            cashDrawerObj.listAllCashDrawers();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to save cash drawer!", jsonObj.savedeviceresponsetype.result);
        }
    },
    fetchCashDrawer : function(id) {
        var soapType = new FindDevicesType(id);
        callWebService(soapType, cashDrawerObj.fetchCashDrawerHandler);
    },
    clearCashDrawer : function() {
        $("#cashDrawerName").val('');
        $("#realName.value").val('');
        $("#cashDrawer-type-select-choice").attr("disabled", true);
        $("#cashDrawer-type-select-choice").val('').selectmenu("refresh");
        $("#connectedPrinter-select-choice").attr("disabled", true);
        $("#connectedPrinter-select-choice").val('-1').selectmenu("refresh");
//        $("#staff-select-choice").selectmenu( "disable" );
        $("#staff-select-choice").val("-1").selectmenu("refresh");
        $(".ui-checkbox-on").removeClass("ui-checkbox-on").addClass("ui-checkbox-off");
    },
    fetchCashDrawerHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finddevicesresponsetype)) {
            var cashDrawer = jsonObj.finddevicesresponsetype.devices;
            $("#cashDrawerId").val(cashDrawer.id);
            $("#cashDrawerName").val(cashDrawer.name);
            $("#realName").val(cashDrawer.realname);
            $("#cashDrawerName").attr("disabled", false);
            $("#realName").attr("disabled", false);
            $("#cashDrawer-type-select-choice").attr("disabled", false);
            if (cashDrawer.manufacturername) {
                $("#cashDrawer-type-select-choice").val(cashDrawer.manufacturername).selectmenu("refresh");
            } else {
                $("#cashDrawer-type-select-choice").val("").selectmenu("refresh");
            }
            $("#connectedPrinter-select-choice").attr("disabled", false);
            if (cashDrawer.printerid) {
                $("#connectedPrinter-select-choice").val(cashDrawer.printerid).selectmenu("refresh");
            } else {
                $("#connectedPrinter-select-choice").val("-1").selectmenu("refresh");
            }
            
//            $("#staff-select-choice").selectmenu( "enable" );
            var staffList = util.getElementsArray(cashDrawer.staffs);
            if (util.isValidVariable(staffList)) {
                var staffIds = [];
                for (var i = 0; i <staffList.length; i++) {
                    staffIds.push(new String(staffList[i].id));
                }
                if (staffIds.length > 0) {
                    $("#staff-select-choice").val(staffIds).selectmenu("refresh");
                } else {
                    $("#staff-select-choice").val("-1").selectmenu("refresh");
                    $(".ui-checkbox-on").removeClass("ui-checkbox-on").addClass("ui-checkbox-off");
                }    
            }
            cashDrawerObj.action = uiBaseObj.UPDATE;
        }
    },
    deleteCashDrawer : function() {
        if ($("#cashDrawerId").val() != null && $("#cashDrawerId").val() != "") {
            var soapType = new DeleteDeviceType(cashDrawerObj.toBeDeletedCashDrawerID);
            callWebService(soapType, cashDrawerObj.deleteHandler);
            cashDrawerObj.toBeDeletedCashDrawerID = -1;
        }
    },
    deleteCashDrawerWithConfirmationDialog : function(id) {
        cashDrawerObj.toBeDeletedCashDrawerID = id;
        $('#deleteCashDrawerConfirmationDialog').popup('open');
    },
    deleteHandler : function(jsonObj){
        if (util.isSuccessfulResponse(jsonObj.deletedeviceresponsetype)) {
            cashDrawerObj.listAllCashDrawers();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete cash drawer!", jsonObj.deletedeviceresponsetype.result);
        }
    },
    addCashDrawerRow : function(tableID, cashDrawerObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        var innerHTML = "<td onclick='"+selectRowFunc+"("+cashDrawerObj.id+");'>"+cashDrawerObj.name+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+cashDrawerObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    listAllPrintersForCashDrawer : function() {
        var soapType = new ListPrintersType();
        callWebService(soapType, cashDrawerObj.listPrintersForCashDrawerHandler);
    },
    listPrintersForCashDrawerHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listprintersresponsetype)) {
            $("#printers tr").remove();
            var printers = util.getElementsArray(jsonObj.listprintersresponsetype.printers);
            if ($("#connectedPrinter-select-choice").length > 0){
                $('#connectedPrinter-select-choice').find('option:gt(0)').remove();
                for (var i = 0; i < printers.length; i++) {
                    var printer = printers[i];
                    $("#connectedPrinter-select-choice").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                }
            }
        }
    }
};

var globalDeviceConfig = {
    globalDevice : null,
    init : function() {
        globalDeviceConfig.listAllPaymentTerminals();
    },
    fetchGlobalDevice : function() {
        var soapType = new FindGlobalDevicesType(null);
        callWebService(soapType, globalDeviceConfig.fetchGlobalDeviceHandler);
    },
    fetchGlobalDeviceHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findglobaldevicesresponsetype)) {
            var globalDevices = util.getElementsArray(jsonObj.findglobaldevicesresponsetype.globaldevices);
            if (globalDevices.length > 0) {
                globalDeviceConfig.globalDevice = globalDevices[0];
                $("#defaultReceiptPrinter-select-choice").val(globalDeviceConfig.globalDevice.receiptprinterid).selectmenu("refresh");
                $("#defaultPackagePrinter-select-choice").val(globalDeviceConfig.globalDevice.packageprinterid).selectmenu("refresh");
                $("#defaultPackagePrinter2-select-choice").val(globalDeviceConfig.globalDevice.packageprinterid2).selectmenu("refresh");
                $("#defaultRunnerPrinter-select-choice").val(globalDeviceConfig.globalDevice.runnerprinterid).selectmenu("refresh");
                $("#defaultCashDrawer-select-choice").val(globalDeviceConfig.globalDevice.cashdrawerid).selectmenu("refresh");
                $("#defaultReportPrinter-select-choice").val(globalDeviceConfig.globalDevice.reportprinterid).selectmenu("refresh");
                $("#defaultWaitlistPrint-select-choice").val(globalDeviceConfig.globalDevice.waitlistprinterid).selectmenu("refresh");
                $("#defaultOpenFoodPrint-select-choice").val(globalDeviceConfig.globalDevice.openfoodprinterid).selectmenu("refresh");
            }
        }
    },
    listAllPaymentTerminals : function () {
        var soapType = new FindDevicesType(null, "PAYMENT_TERMINAL");
        callWebService(soapType, globalDeviceConfig.listAllPaymentTerminalsHandler);
    },
    listAllPaymentTerminalsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finddevicesresponsetype)) {
            $('#defaultPaymentTerminal-select-choice').find('option:gt(0)').remove();
            globalDeviceConfig.elementList = util.getElementsArray(jsonObj.finddevicesresponsetype.devices);
            for (var i = 0; i < globalDeviceConfig.elementList.length; i++) {
                $("#defaultPaymentTerminal-select-choice").append("<option value='" + globalDeviceConfig.elementList[i].id + "'>" + globalDeviceConfig.elementList[i].name + "</option>").trigger("create");
            }
            globalDeviceConfig.fetchGlobalDevice();
        }
    },
    saveDefaultDeviceConfig : function() {
        var defaultReceiptPrinterId = $("#defaultReceiptPrinter-select-choice").val();
        var defaultPackagePrinterId = $("#defaultPackagePrinter-select-choice").val();
        var defaultPackagePrinterId2 =  $("#defaultPackagePrinter2-select-choice").val();
        var defaultRunnerPrinterId = $("#defaultRunnerPrinter-select-choice").val();
        var defaultReportPrinterId = $("#defaultReportPrinter-select-choice").val();
        var defaultCashDrawerId = $("#defaultCashDrawer-select-choice").val();
        var defaultWaitlistPrinterId = $("#defaultWaitlistPrint-select-choice").val();
        var defaultOpenFoodPrinterId = $("#defaultOpenFoodPrint-select-choice").val();
        var defaultPaymentTerminalId = null;
        if (typeof $("#defaultPaymentTerminal-select-choice") != "undefined") {
            defaultPaymentTerminalId = $("#defaultPaymentTerminal-select-choice").val();
        }
        var saveGlobalDeviceType = new SaveGlobalDeviceType(globalDeviceConfig.globalDevice.id, defaultReceiptPrinterId, defaultPackagePrinterId, defaultPackagePrinterId2, defaultRunnerPrinterId, defaultCashDrawerId, null, defaultReportPrinterId, defaultPaymentTerminalId, defaultWaitlistPrinterId, defaultOpenFoodPrinterId);
        callWebService(saveGlobalDeviceType, globalDeviceConfig.saveGlobalDeviceHandler);
    },
    saveGlobalDeviceHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveglobaldeviceresponsetype)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to save changes!", jsonObj.saveglobaldeviceresponsetype.result);
        }
    }
}

var appInstanceObj = {
    toBeDeletedEntryID : null,
    appInstanceList : [],
    init : function() {
        appInstanceObj.listAllAppInstances();
        appInstanceObj.listAllPaymentTerminals();
        appInstanceObj.listAllSeatingAreas();
    },
    resetAppInstanceForm : function(disabled) {
        $("#appInstanceId").val("");
        $("#appInstanceId").attr("disabled", disabled);
        $("#appInstanceName").val("");
        $("#appInstanceName").attr("disabled", disabled);
        $("#cashDrawer-select-choice").attr("disabled", disabled);
        $("#receiptPrinter-select-choice").attr("disabled", disabled);
        $("#waitlistPrinter-select-choice").attr("disabled", disabled);
        $("#paymentTerminal-select-choice").attr("disabled", disabled);
        $("#callerIdEnabled-select-choice").attr("disabled", disabled);
        $("#weight-scale-enabled").attr("disabled", disabled);
        $("#customer-display-enabled").attr("disabled", disabled);
        $('#customer-display-model').attr("disabled", disabled);
        $('#wait-status-enabled').attr("disabled", disabled);
        $('#serve-status-enabled').attr("disabled", disabled);
        $('#modify-wait-enabled').attr("disabled", disabled);
        $('#modify-done-enabled').attr("disabled", disabled);
        $('#displays-select-choice').selectmenu("disable");
        $("#device-manager-port").val("");
        $("#display-forewarn").val("");
        $("#display-forewarn").attr("disabled", disabled);
        $("#seatingArea-select-choice").attr("disabled", disabled);
    },
    listAllAppInstances : function() {
        var soapType = new FindAppInstancesType();
        callWebService(soapType, appInstanceObj.listAppInstancesHandler);
    },
    listAppInstancesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findappinstancesresponsetype)) {
            document.getElementById("appInstances").innerHTML = "";
            var appInstances = util.getElementsArray(jsonObj.findappinstancesresponsetype.appinstances);
            for (var i = 0; i < appInstances.length; i++) {
                appInstanceObj.addAppInstanceRow("appInstances", appInstances[i], "appInstanceObj.fetchAppInstance", "appInstanceObj.deleteAppInstanceWithConfirmationDialog");
            }
            appInstanceObj.resetAppInstanceForm(true);
        }
    },
    listAllPaymentTerminals : function () {
        var soapType = new FindDevicesType(null, "PAYMENT_TERMINAL");
        callWebService(soapType, appInstanceObj.listAllPaymentTerminalsHandler);
    },
    listAllPaymentTerminalsHandler : function (jsonObj) {
        appInstanceObj.listAllHandler(jsonObj, 'finddevicesresponsetype', 'devices', '#paymentTerminal-select-choice');
    },
    listAllSeatingAreas : function () {
        var soapType = new ListAreasType(false);
        callWebService(soapType, appInstanceObj.listAllSeatingAreasHandler);
    },
    listAllSeatingAreasHandler : function (jsonObj) {
        appInstanceObj.listAllHandler(jsonObj, 'listareasresponsetype', 'areas', '#seatingArea-select-choice');
    },
    listAllHandler : function (jsonObj, vartype, varsection, htmltag) {
        if (util.isSuccessfulResponse(jsonObj[vartype])) {
            appInstanceObj.dropdownHandler(htmltag, util.getElementsArray(jsonObj[vartype][varsection]));
        }
    },	
    dropdownHandler: function(htmltag,varObj ){
        $(htmltag).find('option:gt(0)').remove();
            
        for (var i = 0; i < varObj.length; i++) {
            var areaHtml = '<option value="' + varObj[i].id + '">' + varObj[i].name + '</option>';
            $(htmltag).append(areaHtml).trigger("create");
        }		
    },
    dropdownHandler: function(htmltag,varObj ){
        $(htmltag).find('option:gt(0)').remove();

        for (var i = 0; i < varObj.length; i++) {
            var areaHtml = '<option value="' + varObj[i].id + '">' + varObj[i].name + '</option>';
            $(htmltag).append(areaHtml).trigger("create");
        }
     },
    saveAppDeviceConfig : function() {
        if ($("#appInstanceId").val() != null && $("#appInstanceId").val() != "") {
            var id = $("#appInstanceId").val();
            var displayName = $("#appInstanceName").val();
            var cashDrawerId = $("#cashDrawer-select-choice").val();
            var receiptPrinterId = $("#receiptPrinter-select-choice").val();
            var waitlistPrinterId = $("#waitlistPrinter-select-choice").val();
            var paymentTerminalId = $("#paymentTerminal-select-choice").val();
            var callerIdEnabled = $("#callerIdEnabled-select-choice").val();
            var weightScaleEnabled = $("#weight-scale-enabled").prop('checked');
            var customerDisplayEnabled = $("#customer-display-enabled").prop('checked');
            var customerDisplayModel = $('#customer-display-model').val();
            var deviceManagerPort = $("#device-manager-port").val();
            var waitStatusEnabled = $('#wait-status-enabled').prop('checked');
            var serveStatusEnabled = $('#serve-status-enabled').prop('checked');
            var modifyWaitEnabled = $('#modify-wait-enabled').prop('checked');
            var modifyDoneEnabled = $('#modify-done-enabled').prop('checked');
            var displaysValue = $('#displays-select-choice').val();
            var forewarn = $("#display-forewarn").val();
            var seatingAreaId = $("#seatingArea-select-choice").val();
            var soapType = new SaveAppInstanceType(id, receiptPrinterId, cashDrawerId, paymentTerminalId, callerIdEnabled, weightScaleEnabled, customerDisplayEnabled, customerDisplayModel, deviceManagerPort, null, null, null, waitStatusEnabled, serveStatusEnabled, modifyWaitEnabled, modifyDoneEnabled, displaysValue, forewarn, null, seatingAreaId, waitlistPrinterId);
            callWebService(soapType, appInstanceObj.updateAppInstanceHandler);
        }
    },
    updateAppInstanceHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveappinstanceresponsetype)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            appInstanceObj.listAllAppInstances();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to update app configuration!", jsonObj.saveappinstanceresponsetype.result);
        }
    },
    fetchAppInstance : function(id) {
        appInstanceObj.clearAppInstance();
        var soapType = new FindAppInstancesType(id);
        callWebService(soapType, appInstanceObj.fetchAppInstanceHandler);
    },
    clearAppInstance : function() {
        $("#appInstanceName").val('');
        $("#realName").val('');
        $("#cashDrawer-select-choice").attr("disabled", true);
        $("#cashDrawer-select-choice").val('').selectmenu("refresh");
        $("#receiptPrinter-select-choice").attr("disabled", true);
        $("#receiptPrinter-select-choice").val('').selectmenu("refresh");
        $("#waitlistPrinter-select-choice").attr("disabled", true);
        $("#waitlistPrinter-select-choice").val('').selectmenu("refresh");
        $("#paymentTerminal-select-choice").attr("disabled", true);
        $("#paymentTerminal-select-choice").val('').selectmenu("refresh");
        $("#callerIdEnabled-select-choice").attr("disabled", true);
        $("#callerIdEnabled-select-choice").val('').selectmenu("refresh");
        $("#weight-scale-enabled").attr("disabled", true);
        $("#weight-scale-enabled").prop('checked', false);
        $("#customer-display-enabled").attr("disabled", true);
        $("#customer-display-enabled").prop('checked', false);
        $('#customer-display-model').attr("disabled", true);
        $('#customer-display-model').prop('checked', false);
        $('#wait-status-enabled').attr("disabled", true);
        $('#wait-status-enabled').prop("checked", false);
        $('#serve-status-enabled').attr("disabled", true);
        $('#serve-status-enabled').prop("checked", false);
        $('#modify-wait-enabled').attr("disabled", true);
        $('#modify-wait-enabled').prop("checked", false);
        $('#modify-done-enabled').attr("disabled", true);
        $('#modify-done-enabled').prop("checked", false);
        $('#displays-select-choice').selectmenu("disable");
        $('#displays-select-choice').val('').selectmenu("refresh", true);
        $("#device-manager-port").val("");
        $("#display-forewarn").val('');
        $("#seatingArea-select-choice").attr("disabled", true);
        $("#seatingArea-select-choice").val('').selectmenu("refresh");
    },
    fetchAppInstanceHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findappinstancesresponsetype)) {
            var appInstance = jsonObj.findappinstancesresponsetype.appinstances;
            if (appInstance.type === 'KITCHEN_DISPLAY') {
                if($('#label-receiptPrinter-select-choice').text() === 'Receipt Printer') {
                    $('#label-receiptPrinter-select-choice').text('Connected Printer');
                } else if ($('#label-receiptPrinter-select-choice').text() === '收据打印机') {
                    $('#label-receiptPrinter-select-choice').text('连接打印机');
                }//there might be more language, for now just assume two for now and we really don't want to add any more code
                $('#pos-license-config').hide();
                $('#kitchen-display-config').show();
            } else {
                $('#pos-license-config').show();
                $('#kitchen-display-config').hide();
            }
            $("#appInstanceId").val(appInstance.id);
            $("#appInstanceName").val(appInstance.displayname);
            $("#appInstanceName").attr("disabled", false);
            $("#cashDrawer-select-choice").attr("disabled", false);
            $("#cashDrawer-select-choice").val(appInstance.cashdrawerid).selectmenu("refresh");
            $("#receiptPrinter-select-choice").attr("disabled", false);
            $("#receiptPrinter-select-choice").val(appInstance.printerid).selectmenu("refresh");
            $("#waitlistPrinter-select-choice").attr("disabled", false);
            $("#waitlistPrinter-select-choice").val(appInstance.waitlistprinterid).selectmenu("refresh");
            $("#paymentTerminal-select-choice").attr("disabled", false);
            $("#paymentTerminal-select-choice").val(appInstance.paymentterminalid).selectmenu("refresh");
            $("#callerIdEnabled-select-choice").attr("disabled", false);
            $("#callerIdEnabled-select-choice").val(appInstance.calleridenabled).selectmenu("refresh");
            $("#weight-scale-enabled").attr("disabled", false);
            $("#weight-scale-enabled").prop('checked', util.isBooleanTrue(appInstance.weightscaleenabled)).checkboxradio("refresh");
            $("#customer-display-enabled").attr("disabled", false);
            $("#customer-display-enabled").prop('checked', util.isBooleanTrue(appInstance.customerdisplayenabled)).checkboxradio("refresh");
            $('#customer-display-model').attr("disabled", false);
            $('#customer-display-model').val(util.getEmptyValueIfInvalid(appInstance.customerdisplaymodel)).selectmenu("refresh");;
            $("#device-manager-port").val(appInstance.devicemanagerport);
            $('#wait-status-enabled').attr("disabled", false);
            $('#wait-status-enabled').prop("checked", util.isBooleanTrue(appInstance.enablewait)).checkboxradio("refresh");
            $('#serve-status-enabled').attr("disabled", false);
            $('#serve-status-enabled').prop("checked", util.isBooleanTrue(appInstance.enableserve)).checkboxradio("refresh");
            $('#modify-wait-enabled').attr("disabled", false);
            $('#modify-wait-enabled').prop("checked", util.isBooleanTrue(appInstance.modifywait)).checkboxradio("refresh");
            $('#modify-done-enabled').attr("disabled", false);
            $('#modify-done-enabled').prop("checked", util.isBooleanTrue(appInstance.modifydone)).checkboxradio("refresh");
            $('#displays-select-choice').selectmenu("enable");
            if (appInstance.displaysname != null) {
                var displays = appInstance.displaysname.split(",");
                $('#displays-select-choice').val(displays).selectmenu("refresh", true);
            } else {
                $('#displays-select-choice').val('').selectmenu("refresh", true);
            }
            $("#display-forewarn").val(appInstance.forewarn);
            $('#display-forewarn').attr("disabled", false);
            $("#seatingArea-select-choice").attr("disabled", false);
            $("#seatingArea-select-choice").val(appInstance.areaid).selectmenu("refresh");
        }
    },
    addAppInstanceRow : function(tableID, appInstanceObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        var innerHTML = "<td onclick='"+selectRowFunc+"("+appInstanceObj.id+");'>"+appInstanceObj.displayname+"</td><td onclick='" + selectRowFunc +
        "("+appInstanceObj.id+");'>" + appInstanceObj.type + "</td><td class=\"delete-icon-td\"><a href='javascript:" + deleteRowFunc +
        "("+appInstanceObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteAppInstance : function() {
        if (util.isValidVariable(appInstanceObj.toBeDeletedEntryID) && appInstanceObj.toBeDeletedEntryID > 0) {
            var soapType = new DeleteAppInstanceType(appInstanceObj.toBeDeletedEntryID);
            callWebService(soapType, appInstanceObj.deleteHandler);
            appInstanceObj.toBeDeletedEntryID = -1;
        }
    },
    deleteAppInstanceWithConfirmationDialog : function(id) {
        appInstanceObj.toBeDeletedEntryID = id;
        $('#deleteAppInstanceConfirmationDialog').popup('open');
    },
    deleteHandler : function(jsonObj){
        if (util.isSuccessfulResponse(jsonObj.deleteappinstanceresponsetype)) {
            appInstanceObj.listAllAppInstances();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete app instance!", jsonObj.deleteappinstanceresponsetype.result);
        }
    },
    listAllCashDrawersForAppInstances : function() {
        var soapType = new FindDevicesType(null, "CASH_DRAWER");
        callWebService(soapType, appInstanceObj.listCashDrawersHandler);
    },
    listCashDrawersForAppInstancesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.finddevicesresponsetype)) {
            $('#cashDrawer-select-choice').find('option:gt(0)').remove();
            var cashDrawers = util.getElementsArray(jsonObj.finddevicesresponsetype.devices);
            for (var i = 0; i < cashDrawers.length; i++) {
                var cashDrawer = cashDrawers[i];
                $("#cashDrawer-select-choice").append("<option value='" + cashDrawer.id + "'>" + cashDrawer.name + "</option>").trigger("create");
            }
        }
    }
};