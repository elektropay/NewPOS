var printingSetupPageObj = {
    init : function() {
        receiptFooterObj.init();
        printJobRoutingRuleObj.init();
    },
    afterInit : function() {
    }
};

var printingSetupObj = {
    receiptFooterContentList : [],
    init : function() {
        printingSetupObj.fetchConfig();
    },
    fetchConfig : function() {
        var soapType = new FetchPrintingConfigType();
        callWebService(soapType, printingSetupObj.fetchConfigHandler);
    },
    fetchConfigHandler : function(jsonObj) {
        $('#receiptTemplate-select-choice').find('option').remove();
        $("#packageTemplate-select-choice").find('option').remove();
        $("#kitchenTicketTemplate-select-choice").find('option').remove();
        $("#paymentReceiptTemplate-select-choice").find('option').remove();
        $("#kitchenLabelTemplate-select-choice").find('option').remove();
        if (util.isSuccessfulResponse(jsonObj.fetchprintingconfigresponsetype)) {
            var templates = util.getElementsArray(jsonObj.fetchprintingconfigresponsetype.templates);
            for (var i = 0; i < templates.length; i++) {
                if (biscuitf.m() == 'lite') {
                    var template = templates[i];
                    var reportName = template.reporttype;
                    var selected = util.isBooleanTrue(template.selected);
                    if(reportName == 'RECEIPT') {
                        if (template.value.toString().indexOf("1_") >= 0) {
                            $("#receiptTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        }
                    } else if (reportName == 'PACKAGE') {
                        if (template.value.toString().indexOf("1_") >= 0) {
                            $("#packageTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        }
                    } else if (reportName == 'KITCHEN') {
                        if (template.value.toString().indexOf("1_") >= 0) {
                            $("#kitchenTicketTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        }
                    } else if (reportName == 'PAYMENT') {
                        if (template.value.toString() == "1") {
                            $("#paymentReceiptTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        }
                    } else if (reportName == 'KITCHEN_LABEL') {
                        $("#kitchenLabelTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                    }
                } else {
                    var template = templates[i];
                    var reportName = template.reporttype;
                    var selected = util.isBooleanTrue(template.selected);
                    if(reportName == 'RECEIPT') {
                        $("#receiptTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                    } else if (reportName == 'PACKAGE') {
                        $("#packageTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                    } else if (reportName == 'KITCHEN') {
                        $("#kitchenTicketTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                    } else if (reportName == 'PAYMENT') {
                        $("#paymentReceiptTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                    } else if (reportName == 'KITCHEN_LABEL') {
                        $("#kitchenLabelTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                    }
                }
            }
        }
        $("#receiptTemplate-select-choice").selectmenu("refresh");
        $("#packageTemplate-select-choice").selectmenu("refresh");
        $("#kitchenTicketTemplate-select-choice").selectmenu("refresh");
        $("#paymentReceiptTemplate-select-choice").selectmenu("refresh");
        $("#kitchenLabelTemplate-select-choice").selectmenu("refresh");

        $("#report-type-old-choice").click(function() {
            $('#receiptTemplate-select-choice').find('option').remove();
            $("#packageTemplate-select-choice").find('option').remove();
            $("#kitchenTicketTemplate-select-choice").find('option').remove();
            if (util.isSuccessfulResponse(jsonObj.fetchprintingconfigresponsetype)) {
                var templates = util.getElementsArray(jsonObj.fetchprintingconfigresponsetype.templates);
                for (var i = 0; i < templates.length; i++) {
                    var template = templates[i];
                    var reportName = template.reporttype;
                    var selected = util.isBooleanTrue(template.selected);
                    $("#report-type-old-choice").prop("checked", true);
                    $("#report-type-new-choice").prop("checked", false);
                    if($("#report-type-old-choice").is(':checked')) {
                        if(reportName == 'RECEIPT' && $.isNumeric(template.value)) {
                            $("#receiptTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        } else if (reportName == 'PACKAGE' && $.isNumeric(template.value)) {
                            $("#packageTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        } else if (reportName == 'KITCHEN') {
                            $("#kitchenTicketTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        }
                    } else if($("#report-type-new-choice").is(':checked')) {
                        if (reportName == 'RECEIPT' && template.value.length == 3) {
                            $("#receiptTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        } else if (reportName == 'PACKAGE' && template.value.length ==3) {
                            $("#packageTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        } else if(reportName == 'KITCHEN') {
                            $("#kitchenTicketTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        }
                    }
                }
            }
            $("#receiptTemplate-select-choice").selectmenu("refresh");
            $("#packageTemplate-select-choice").selectmenu("refresh");
            $("#kitchenTicketTemplate-select-choice").selectmenu("refresh");

        });

        $("#report-type-new-choice").click(function() {
            $('#receiptTemplate-select-choice').find('option').remove();
            $("#packageTemplate-select-choice").find('option').remove();
            $("#kitchenTicketTemplate-select-choice").find('option').remove();
            if (util.isSuccessfulResponse(jsonObj.fetchprintingconfigresponsetype)) {
                var templates = util.getElementsArray(jsonObj.fetchprintingconfigresponsetype.templates);
                for (var i = 0; i < templates.length; i++) {
                    var template = templates[i];
                    var reportName = template.reporttype;
                    var selected = util.isBooleanTrue(template.selected);
                    $("#report-type-new-choice").prop("checked", true);
                    $("#report-type-old-choice").prop("checked", false);
                    if($("#report-type-old-choice").is(':checked')) {
                        if(reportName == 'RECEIPT' && $.isNumeric(template.value)) {
                            $("#receiptTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        } else if (reportName == 'PACKAGE' && $.isNumeric(template.value)) {
                            $("#packageTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        } else if (reportName == 'KITCHEN') {
                            $("#kitchenTicketTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        }
                    } else if($("#report-type-new-choice").is(':checked')) {

                        if (reportName == 'RECEIPT' && template.value.length == 3) {
                            $("#receiptTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        } else if (reportName == 'PACKAGE' && template.value.length ==3) {
                            $("#packageTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        } else if(reportName == 'KITCHEN') {
                            $("#kitchenTicketTemplate-select-choice").append("<option value='" + template.value + "'" + (selected ? " selected" : "") + ">" + template.value + "</option>").trigger("create");
                        }
                    }
                }
            }
            $("#receiptTemplate-select-choice").selectmenu("refresh");
            $("#packageTemplate-select-choice").selectmenu("refresh");
            $("#kitchenTicketTemplate-select-choice").selectmenu("refresh");
        });

        $("#receiptFooterContent-select-choice").val(jsonObj.fetchprintingconfigresponsetype.footertemplateid).selectmenu('refresh');
        if (util.isValidVariable(jsonObj.fetchprintingconfigresponsetype.footerpart2templateid)) {
            $("#receiptFooterContent2-select-choice").val(jsonObj.fetchprintingconfigresponsetype.footerpart2templateid).selectmenu('refresh');
        } else {
            $("#receiptFooterContent2-select-choice").val('-1').selectmenu('refresh');
        }
        if (util.isValidVariable(jsonObj.fetchprintingconfigresponsetype.paymentreceiptfootertemplateid)) {
            $("#paymentReceiptFooterContent-select-choice").val(jsonObj.fetchprintingconfigresponsetype.paymentreceiptfootertemplateid).selectmenu('refresh');
        } else {
            $("#paymentReceiptFooterContent-select-choice").val('-1').selectmenu('refresh');
        }
        if (util.isValidVariable(jsonObj.fetchprintingconfigresponsetype.waitlistticketfootertemplateid)) {
            $("#waitlistTicketFooterContent-select-choice").val(jsonObj.fetchprintingconfigresponsetype.waitlistticketfootertemplateid).selectmenu('refresh');
        } else {
            $("#waitlistTicketFooterContent-select-choice").val('-1').selectmenu('refresh');
        }
    },
    saveConfig : function() {
        var templateList = [];
        var receiptTemplate = new PrintingTemplateType($("#receiptTemplate-select-choice").val(), 'RECEIPT', true);
        var packageTemplate = new PrintingTemplateType($("#packageTemplate-select-choice").val(), 'PACKAGE', true);
        var kitchenTemplate = new PrintingTemplateType($("#kitchenTicketTemplate-select-choice").val(), 'KITCHEN', true);
        var paymentTemplate = new PrintingTemplateType($("#paymentReceiptTemplate-select-choice").val(), 'PAYMENT', true);
        var labelTemplate = new PrintingTemplateType($("#kitchenLabelTemplate-select-choice").val(), 'KITCHEN_LABEL', true);
        templateList.push(receiptTemplate);
        templateList.push(packageTemplate);
        templateList.push(kitchenTemplate);
        templateList.push(paymentTemplate);
        templateList.push(labelTemplate);
        var receiptFooterTemplateId = $("#receiptFooterContent-select-choice").val();
        var receiptFooterTemplatePart2Id = $("#receiptFooterContent2-select-choice").val();
        var paymentReceiptFooterTemplateId = $("#paymentReceiptFooterContent-select-choice").val();
        var waitlistTicketFooterTemplateId = $("#waitlistTicketFooterContent-select-choice").val();
        var soapType = new SavePrintingConfigType(templateList, receiptFooterTemplateId, receiptFooterTemplatePart2Id, paymentReceiptFooterTemplateId, waitlistTicketFooterTemplateId);
        callWebService(soapType, printingSetupObj.saveConfigHandler);
    },
    saveConfigHandler : function(jsonObj) {
        if (!util.isSuccessfulResponse(jsonObj.saveprintingconfigresponsetype)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save printing config changes!", jsonObj.saveprintingconfigresponsetype.result);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        }
        printingSetupObj.fetchConfig();
    }
};

var receiptFooterObj = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        receiptFooterObj.listAllElements();
        uiBaseObj.addDeleteConfirmDialog("printingSetupPage", "deleteConfirmationDialog", "Receipt Footer", "receiptFooterObj.deleteRow();");
    },
    clearDetails : function() {
        $("#footerName").val("");
        $("#footerName").prop("readOnly", false);
        $("#footerContent").val("");
        $("#footerContent").prop("readOnly", false);
        $("#qrCodeUrl").val("");
        $("#qrCodeUrl").prop("readOnly", false);
        $("#btnSave").prop("disabled", false);
        receiptFooterObj.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        receiptFooterObj.clearDetails();
        receiptFooterObj.v_selected_rowid = "";
        $("#curEntryId").val("");
    },
    listAllElements : function (){
        receiptFooterObj.clearDetails();
        var soapType = new FetchReceiptFooterContentType();
        callWebService(soapType, receiptFooterObj.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        $("#receiptFooterContentTable").empty();
        $('#receiptFooterContent-select-choice').find('option').remove();
        $('#receiptFooterContent2-select-choice').find('option:gt(0)').remove();
        $("#paymentReceiptFooterContent-select-choice").find('option:gt(0)').remove();
        $("#waitlistTicketFooterContent-select-choice").find('option:gt(0)').remove();
        receiptFooterObj.elementList = [];
        if (util.isSuccessfulResponse(jsonObj.fetchreceiptfootercontentresponsetype)) {
            receiptFooterObj.elementList = util.getElementsArray(jsonObj.fetchreceiptfootercontentresponsetype.footercontent);
            for (var i = 0; i < receiptFooterObj.elementList.length; i++) {
                var receiptFooterContent = receiptFooterObj.elementList[i];
                if('WAITLIST_TICKET_FOOTER'==receiptFooterContent.name){
                    $("#waitlistTicketFooterContent-select-choice").append("<option value='" + receiptFooterContent.id + "'>" + receiptFooterContent.displayname + "</option>").trigger("create");
                } else{
                    $("#receiptFooterContent-select-choice").append("<option value='" + receiptFooterContent.id + "'>" + receiptFooterContent.displayname + "</option>").trigger("create");
                    $("#receiptFooterContent2-select-choice").append("<option value='" + receiptFooterContent.id + "'>" + receiptFooterContent.displayname + "</option>").trigger("create");
                    $("#paymentReceiptFooterContent-select-choice").append("<option value='" + receiptFooterContent.id + "'>" + receiptFooterContent.displayname + "</option>").trigger("create");
                }
                receiptFooterObj.addRow("receiptFooterContentTable", receiptFooterContent, "receiptFooterObj.selectRow", "receiptFooterObj.deleteWithConfirmationDialog");
            }
            $("#receiptFooterContent-select-choice").selectmenu("refresh");
            $("#receiptFooterContent2-select-choice").selectmenu("refresh");
            $("#paymentReceiptFooterContent-select-choice").selectmenu("refresh");
            $("#waitlistTicketFooterContent-select-choice").selectmenu("refresh");
        }
        printingSetupObj.init();
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var selectedElement = receiptFooterObj.elementList[i];
                if (selectedElement != null) {
                    $("#curEntryId").val(selectedElement.id);
                    $("#footerName").val(selectedElement.displayname);
                    $("#footerName").prop("readOnly", false);
                    $("#footerContent").val(util.getStringValue(selectedElement.content));
                    $("#footerContent").prop("readOnly", false);
                    $("#qrCodeUrl").val(util.getStringValue(selectedElement.qrcodeurl));
                    $("#qrCodeUrl").prop("readOnly", false);
                }
                $("#btnSave").prop("disabled", false);
            }
        }
        receiptFooterObj.action = uiBaseObj.UPDATE;
    },
    addRow : function (tableID, elementObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.name = rowId;

        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+elementObj.displayname+"</td><td></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (receiptFooterObj.toBeDeletedElementID && receiptFooterObj.toBeDeletedElementID >=0) {
            var soapType = new DeleteReceiptFooterContentType(receiptFooterObj.toBeDeletedElementID);
            callWebService(soapType, receiptFooterObj.deleteElementHandler);
        }
        receiptFooterObj.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        receiptFooterObj.toBeDeletedElementID = id;
        receiptFooterObj.v_selected_rowid = "";
        $("#curEntryId").val("");
        $('#deleteConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletereceiptfootercontentresponsetype)) {
            receiptFooterObj.listAllElements();
            $("#btnSave").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete Receipt Footer!", jsonObj.deletereceiptfootercontentresponsetype.result);
        }
    },
    validateInput : function() {
        var name = $("#footerName").val();
        if (util.isNullOrEmpty(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function (id) {
        $("#btnSave").prop("disabled", true);
        if (!receiptFooterObj.validateInput()) {
            $("#btnSave").prop("disabled", false);
            return;
        }
        var entryId = $("#curEntryId").val();
        var aName = $("#footerName").val();
        var aContent = $("#footerContent").val();
        var qrCodeUrl = $("#qrCodeUrl").val();
        aContent = util.getXMLSafeValue(aContent);
        var receiptFooterTemplateList = [];
        var receiptFooterTemplate = new ReceiptFooterContentType(entryId, aName, aContent, qrCodeUrl);
        receiptFooterTemplateList.push(receiptFooterTemplate);
        var soapType = new SaveReceiptFooterContentType(receiptFooterTemplateList);
        callWebService(soapType, receiptFooterObj.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savereceiptfootercontentresponsetype)) {
            if(receiptFooterObj.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(receiptFooterObj.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            receiptFooterObj.listAllElements();
            if (receiptFooterObj.v_selected_rowid) {
                var selectedRow = document.getElementById(receiptFooterObj.v_selected_rowid);
                receiptFooterObj.selectRow("receiptFooterContentTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Receipt Footer!", jsonObj.savereceiptfootercontentresponsetype.result);
        }
        $("#btnSave").prop("disabled", false);
    }
};

var printJobRoutingRuleObj = {
    printJobRoutingRuleList: [],
    printJobRoutingRuleListByElementId: {},
    hoursMapById: {},
    currentEntryId: null,
    init: function () {
        printJobRoutingRuleObj.listAllRestaurantHours();
        printJobRoutingRuleObj.listPrinters();
        printJobRoutingRuleObj.listAllAppInstances();
        uiBaseObj.addDeleteConfirmDialog("printingSetupPage", "deletePrintJobRoutingRuleConfirmationDialog", "Print Job Routing Rule", "printJobRoutingRuleObj.deleteEntry();");

        $("#checkbox-ALL").change(function() {
            if ($(this).prop('checked')) {
                $("#orderTypeCheckboxList :checked:not(#checkbox-ALL)").prop('checked', false).checkboxradio('refresh');
            }
        });
        $("#orderTypeCheckboxList :not(:checked):not(#checkbox-ALL)").change(function() {
            if ($(this).prop('checked')) {
                $("#checkbox-ALL").prop('checked', false).checkboxradio('refresh');
            }
        });
    },
    listPrinters : function(){
        var soapType = new ListPrintersType();
        callWebService(soapType, printJobRoutingRuleObj.listPrintersHandler);
    },
    listPrintersHandler : function(jsonObj) {
        $('#sourcePrinterId').find('option:gt(0)').remove();
        $('#targetPrinterId').find('option:gt(0)').remove();
        if (util.isSuccessfulResponse(jsonObj.listprintersresponsetype)) {
            var printerList = util.getElementsArray(jsonObj.listprintersresponsetype.printers);
            for (var i = 0; i < printerList.length; i++) {
                var printer = printerList[i];
                $("#sourcePrinterId").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
                $("#targetPrinterId").append("<option value='" + printer.id + "'>" + printer.name + "</option>").trigger("create");
            }
        }
    },
    listAllRestaurantHours : function() {
        var soapType = new ListAllRestaurantHoursType();
        callWebService(soapType, printJobRoutingRuleObj.listRestaurantHoursHandler);
    },
    listRestaurantHoursHandler : function(jsonObj) {
        $('#hoursId').find('option:gt(0)').remove();
        if (util.isSuccessfulResponse(jsonObj.listrestauranthoursresponsetype)) {
            var hoursList = util.getElementsArray(jsonObj.listrestauranthoursresponsetype.hours);
            for (var i = 0; i < hoursList.length; i++) {
                var hours = hoursList[i];
                $("#hoursId").append("<option value='" + hours.id + "'>" + printJobRoutingRuleObj.getRestaurantHourDisplayName(hours) + "</option>").trigger("create");
                printJobRoutingRuleObj.hoursMapById[hours.id] = hours;
            }
            printJobRoutingRuleObj.fetchEntry();
        }
    },
    listAllAppInstances : function() {
        var soapType = new FindAppInstancesType();
        callWebService(soapType, printJobRoutingRuleObj.listAppInstancesHandler);
    },
    listAppInstancesHandler : function(jsonObj) {
        $('#devicesId').find('option:gt(0)').remove();
        if (util.isSuccessfulResponse(jsonObj.findappinstancesresponsetype)) {
            var appInstanceList = util.getElementsArray(jsonObj.findappinstancesresponsetype.appinstances);
            for (var i = 0; i < appInstanceList.length; i++) {
                var appInstance = appInstanceList[i];
                $('#devicesId').append("<option value='" + appInstance.id + "'>" + appInstance.displayname + "</option>").trigger("create");
            }
        }
    },
    getRestaurantHourDisplayName : function(hours) {
        var displayName = util.getEmptyValueIfInvalid(hours.name) + ": " + util.getEmptyValueIfInvalid(hours.from) + "-" + util.getEmptyValueIfInvalid(hours.to);
        if (util.isValidVariable(hours.fromdayofweek) && util.isValidVariable(hours.todayofweek)) {
            displayName += " (" + hours.fromdayofweek + "-" + hours.todayofweek + ")";
        }
        return displayName;
    },
    fetchEntry: function () {
        var soapType = new FindPrintJobRoutingRulesType();
        callWebService(soapType, printJobRoutingRuleObj.fetchEntryHandler);
    },
    fetchEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.findprintjobroutingrulesresponsetype)) {
            var printJobRoutingRules = util.getElementsArray(response.findprintjobroutingrulesresponsetype.printjobroutingrules);
            var printJobRoutingRulesTableId = "printJobRoutingRuleTable";
            printJobRoutingRuleObj.removeAllRows(printJobRoutingRulesTableId);
            printJobRoutingRuleObj.printJobRoutingRuleList = [];
            printJobRoutingRuleObj.printJobRoutingRuleListByElementId = {};
            for (var i = 0; i < printJobRoutingRules.length; i++) {
                var elementId = "row_" + i;
                var tableRowHTML = printJobRoutingRuleObj.getTableRowHTML(elementId, printJobRoutingRules[i]);
                $("#" + printJobRoutingRulesTableId + " tr:last").after(tableRowHTML);
                printJobRoutingRuleObj.printJobRoutingRuleList.push(printJobRoutingRules[i]);
                printJobRoutingRuleObj.printJobRoutingRuleListByElementId[elementId] = printJobRoutingRules[i];
            }
            $("#" + printJobRoutingRulesTableId + " .detailTableRowCell").click(printJobRoutingRuleObj, function () {
                printJobRoutingRuleObj.selectEntry($(this).closest("tr"));
            });
        }
    },
    removeAllRows : function (tableId) {
        $("#" + tableId + " tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    },
    getTableRowHTML: function (elementId, elementJsonObj) {
        return "<tr id='" + elementId + "' class='detailTableRow'>" +
			"<td class='detailTableRowCell'>" + elementJsonObj.sourceprintername + "</td>" +
            "<td class='detailTableRowCell'>" + elementJsonObj.targetprintername + "</td>" +
            "<td class='detailTableRowCell'>" + (util.isValidVariable(elementJsonObj.ordertypes) ? elementJsonObj.ordertypes : 'All') + "</td>" +
            "<td class='detailTableRowCell'>" + (elementJsonObj.hoursid ? printJobRoutingRuleObj.getRestaurantHourDisplayName(printJobRoutingRuleObj.hoursMapById[elementJsonObj.hoursid]) : "All") + "</td>" +
            "<td class='detailTableRowCell'>" + (elementJsonObj.appinstanceid != null ? elementJsonObj.appinstancename : "All") + "</td>" +
            "<td class=\"delete-icon-td\"><a href=\"javascript:printJobRoutingRuleObj.openDeletePanel('" + elementId + "');\"><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>" + "</tr>";
    },
    openDeletePanel: function (rowElementId) {
        var entry = printJobRoutingRuleObj.printJobRoutingRuleListByElementId[rowElementId];
        printJobRoutingRuleObj.currentEntryId = entry.id;
        $('#deletePrintJobRoutingRuleConfirmationDialog').popup('open');
    },
    selectEntry: function (tblRowObj) {
        printJobRoutingRuleObj.clearEntryDetails();
		var entry = printJobRoutingRuleObj.printJobRoutingRuleListByElementId[$(tblRowObj).attr("id")];
        printJobRoutingRuleObj.currentEntryId = entry.id;
        $("#sourcePrinterId").val(entry.sourceprinterid).selectmenu('refresh');
        $("#targetPrinterId").val(entry.targetprinterid).selectmenu('refresh');
        $("#orderTypes").val(entry.ordertypes).selectmenu('refresh');
        var orderTypeList = util.getEmptyValueIfInvalid(entry.ordertypes).split(',');
        $("#orderTypeCheckboxList :checked").prop('checked', false).checkboxradio('refresh');
        for (var i = 0; i < orderTypeList.length; i++) {
            var orderType = orderTypeList[i];
            if (orderType == "") orderType = 'ALL';
            $("#checkbox-" + orderType).prop('checked', true).checkboxradio('refresh');
        }
        $("#hoursId").val(entry.hoursid != null ? entry.hoursid : -1).selectmenu('refresh');
        $("#devicesId").val(entry.appinstanceid != null ? entry.appinstanceid : -1).selectmenu('refresh')
        $('#editPrintJobRoutingRuleDetailPopup').popup('open');
    },
    deleteEntry: function () {
        $('#deletePrintJobRoutingRuleConfirmationDialog').popup('close');
        if (printJobRoutingRuleObj.currentEntryId != null) {
            var soapType = new DeletePrintJobRoutingRuleType(printJobRoutingRuleObj.currentEntryId);
            callWebService(soapType, printJobRoutingRuleObj.deleteEntryHandler);
            printJobRoutingRuleObj.currentEntryId = null;
        }
    },
    deleteEntryHandler: function (response) {
        if (util.isSuccessfulResponse(response.deleteprintjobroutingruleresponsetype)) {
            printJobRoutingRuleObj.fetchEntry();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete print job routing rule", response.deleteprintjobroutingruleresponsetype.result);
        }
    },
    newEntry: function () {
        printJobRoutingRuleObj.clearEntryDetails();
        $('#editPrintJobRoutingRuleDetailPopup').popup('open');
    },
    clearEntryDetails: function () {
        $("#sourcePrinterId").val("").selectmenu('refresh');
        $("#targetPrinterId").val("").selectmenu('refresh');
        $("#orderTypeCheckboxList :checked").prop('checked', false).checkboxradio('refresh');
        $("#hoursId").val("-1").selectmenu('refresh');
        $('#devicesId').val("-1").selectmenu('refresh');
        $('#message').html("");
        printJobRoutingRuleObj.currentEntryId = null;
    },
    save: function () {
        var sourcePrinterId = $("#sourcePrinterId").val();
        var targetPrinterId = $("#targetPrinterId").val();
        if (sourcePrinterId == "" || targetPrinterId == "") {
             $('#message').html("Source and Target Printer cannot by empty");
            return;
        }
        var orderTypeValues = '';
        $("#orderTypeCheckboxList :checked").each(function() {
            orderTypeValues += $(this).val() + ",";
        });
        if (orderTypeValues.length > 0) {
            orderTypeValues = orderTypeValues.substring(0, orderTypeValues.length - 1);
        }
        var hoursId = $("#hoursId").val();
        var appInstanceId = $('#devicesId').val();
        var entryId = printJobRoutingRuleObj.currentEntryId;
        var soapType = new SavePrintJobRoutingRuleType(entryId, sourcePrinterId, targetPrinterId, orderTypeValues, hoursId, appInstanceId);
		callWebService(soapType, printJobRoutingRuleObj.savePrintJobRoutingRuleHandler);
    },
    refreshWithoutChanges: function () {
        $('#editPrintJobRoutingRuleDetailPopup').popup('close');
        printJobRoutingRuleObj.clearEntryDetails();
    },
    savePrintJobRoutingRuleHandler: function (response) {
        if (util.isSuccessfulResponse(response.saveprintjobroutingruleresponsetype)) {
            printJobRoutingRuleObj.fetchEntry();
			$('#editPrintJobRoutingRuleDetailPopup').popup('close');
        } else {
            $('#editPrintJobRoutingRuleDetailPopup').effect("shake");
            if(!util.isNullOrEmpty(response.saveprintjobroutingruleresponsetype.result)) {
                $('#message').html(response.saveprintjobroutingruleresponsetype.result.failurereason);
            }
        }
    }

};