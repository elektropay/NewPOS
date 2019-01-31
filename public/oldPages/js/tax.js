var tax = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        tax.listAllElements();
        uiBaseObj.addDeleteConfirmDialog("taxPage", "deleteTaxConfirmationDialog", "Tax", "tax.deleteRow();");
    },
    clearDetails : function() {
        document.getElementById("taxName").value = "";
        document.getElementById("taxName").readOnly = false;
        document.getElementById("taxRate").value = "";
        document.getElementById("taxRate").readOnly = false;
        document.getElementById("taxDescription").value = "";
        document.getElementById("taxDescription").readOnly = false;
        document.getElementById("taxFileNumber").value = "";
        document.getElementById("taxFileNumber").readOnly = false;
        $("#taxIncreases").val("DEFAULT").selectmenu("refresh");
        document.getElementById("taxIncreases").readOnly = false;
        document.getElementById("priceLimit").value = "";
        document.getElementById("priceLimit").readOnly = false;
        document.getElementById("taxIncreaseName").value = "";
        document.getElementById("taxIncreaseName").readOnly = false;
        document.getElementById("taxIncreaseRate").value = "";
        document.getElementById("taxIncreaseRate").readOnly = false;

        tax.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        tax.clearDetails();
        tax.v_selected_rowid = "";
        document.getElementById("curTaxId").value = "";
        //新建 taxIncreases 类型为  DEFAULT
        $('#chargePriceLimitTDiv').removeClass("hidden").addClass("hidden");
        $('#chargeTaxIncreaseNameDiv').removeClass("hidden").addClass("hidden");
        $('#chargeTaxIncreaseRateDiv').removeClass("hidden").addClass("hidden");
    },
    listAllElements : function (){
        tax.clearDetails();
        var listTaxesType = new ListTaxesType();
        callWebService(listTaxesType, tax.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listtaxesresponsetype)) {
            //Clear the table
            document.getElementById("tax").innerHTML = "";

            var tmpList = util.getElementsArray(jsonObj.listtaxesresponsetype.taxes);
            tax.elementList = [];
            for (i = 0; i < tmpList.length; i++) {
              if (!util.isBooleanTrue(tmpList[i].systemgenerated)) {
                tax.elementList.push(tmpList[i]);
              }
            }
            for (i = 0; i<tax.elementList.length; i++) {
                tax.addRow("tax", tax.elementList[i], "tax.selectRow", "tax.deleteWithConfirmationDialog");
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
                var curr_tax = tax.elementList[i];
                if (curr_tax != null) {
                    document.getElementById("curTaxId").value = curr_tax.id;
                    document.getElementById("taxName").value = curr_tax.name;
                    document.getElementById("taxName").readOnly = false;
                    document.getElementById("taxRate").value = curr_tax.rate;
                    document.getElementById("taxRate").readOnly = false;
                    document.getElementById("taxDescription").value = util.getStringValue(curr_tax.description);
                    document.getElementById("taxDescription").readOnly = false;
                    document.getElementById("taxFileNumber").value = util.getStringValue(curr_tax.taxfilenumber);
                    document.getElementById("taxFileNumber").readOnly = false;

                    $("#taxIncreases").val(curr_tax.taxincrease).selectmenu("refresh");
                    if(curr_tax.taxincrease==  "ON_PRICE_LIMIT") {
                        $('#chargePriceLimitTDiv').removeClass("hidden");
                        $('#chargeTaxIncreaseNameDiv').removeClass("hidden");
                        $('#chargeTaxIncreaseRateDiv').removeClass("hidden");
                    }else{
                        $('#chargePriceLimitTDiv').removeClass("hidden").addClass("hidden");
                        $('#chargeTaxIncreaseNameDiv').removeClass("hidden").addClass("hidden");
                        $('#chargeTaxIncreaseRateDiv').removeClass("hidden").addClass("hidden");
                    }
                    document.getElementById("priceLimit").value = curr_tax.pricelimit;
                    document.getElementById("priceLimit").readOnly = false;
                    document.getElementById("taxIncreaseName").value = util.getStringValue(curr_tax.taxincreasename);;
                    document.getElementById("taxIncreaseName").readOnly = false;
                    document.getElementById("taxIncreaseRate").value = curr_tax.taxincreaserate;
                    document.getElementById("taxIncreaseRate").readOnly = false;
                }
                document.getElementById("btnSave").disabled = false;
            }
        }
        tax.action = uiBaseObj.UPDATE;
    },
    addRow : function (tableID, taxElementObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.name = rowId;
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+taxElementObj.name+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+taxElementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (tax.toBeDeletedElementID && tax.toBeDeletedElementID >=0) {
            var deleteTax = new DeleteTaxType(tax.toBeDeletedElementID);
            callWebService(deleteTax, tax.deleteElementHandler);
        }
        tax.toBeDeletedElementID = -1;
    },
    deleteWithConfirmationDialog : function (id) {
        tax.toBeDeletedElementID = id;
        tax.v_selected_rowid = "";
        document.getElementById("curTaxId").value = "";
        $('#deleteTaxConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletetaxresponsetype)) {
            tax.listAllElements();
            document.getElementById("btnSave").disabled = false;
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete tax!", jsonObj.deletetaxresponsetype.result);
        }
    },
    validateInput : function() {
        var name = $("#taxName").val();
        if(util.isNullOrEmpty(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        var rate = $("#taxRate").val();
        if(util.isNullOrEmpty(rate)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_RATE, "Rate cannot be empty!");
            return false;
        }
        if(!util.isNumber(rate)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NOT_A_NUMBER, "Invalid nuber!");
            return false;
        }
        if (rate < 0 || rate > 100) {
            uiBaseObj.alert(systemLanguage.msgCodeList.INVALID_TAX_RATE, "Tax rate must be between 0 and 100");
            return false;
        }
        var taxIncreases = $('#taxIncreases').val()  ;
       if(taxIncreases == "ON_PRICE_LIMIT"){
            var priceLimit = $("#priceLimit").val();
            var taxIncreaseName = $("#taxIncreaseName").val();
            var taxIncreaseRate = $("#taxIncreaseRate").val();
            if(util.isNullOrEmpty(priceLimit)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PRICE_LIMIT, "priceLimit cannot be empty!");
                return false;
            }
            if(!util.isNumber(priceLimit)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.NOT_A_NUMBER, "Invalid priceLimit nuber!");
                return false;
            }

            if(util.isNullOrEmpty(taxIncreaseName)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_TAXINCREASENAME, "taxIncreaseName cannot be empty!");
                return false;
            }

            if(util.isNullOrEmpty(taxIncreaseRate)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_TAXINCREASERATE, "taxIncreaseRate cannot be empty!");
                return false;
            }
            if(!util.isNumber(taxIncreaseRate)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.NOT_A_NUMBER, "taxIncreaseRate Invalid nuber!");
                return false;
            }
            if (taxIncreaseRate < 0 || taxIncreaseRate > 100) {
                uiBaseObj.alert(systemLanguage.msgCodeList.INVALID_TAXINCREASERATE, "taxIncreaseRate must be between 0 and 100");
                return false;
            }
            var totalTax = parseFloat(rate) + parseFloat(taxIncreaseRate) ;
            if(totalTax>=100){
                uiBaseObj.alert(systemLanguage.msgCodeList.TOTAL_TAX_RATE_TAXINCREASERATE, "rate added taxIncreaseRate cannot be greater than 100");
                return false;
            }

        }

        return true;
    },
    saveElement : function () {
        $("#btnSave").prop("disabled", true);
        if(!tax.validateInput()) {
            $("#btnSave").prop("disabled", false);
            return;
        }
        var taxId = document.getElementById("curTaxId").value;
        var name = document.getElementById("taxName").value;
        var description = document.getElementById("taxDescription").value;
        var rate = document.getElementById("taxRate").value;
        var outRate = rate;
        var taxFileNumber = document.getElementById("taxFileNumber").value;
        var taxIncreases =$("#taxIncreases").val();
        var priceLimit = document.getElementById("priceLimit").value;
        var taxIncreaseName = document.getElementById("taxIncreaseName").value;
        var taxIncreaseRate = document.getElementById("taxIncreaseRate").value;
        var saveTaxType = new SaveTaxType(taxId, rate, outRate, name, description, taxFileNumber,taxIncreases,priceLimit,taxIncreaseName,taxIncreaseRate);
        callWebService(saveTaxType, tax.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savetaxresponsetype)) {
            if(tax.action == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            } else if(tax.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            }
            tax.listAllElements();
            if (tax.v_selected_rowid) {
                var selectedRow = document.getElementById(tax.v_selected_rowid);
                tax.selectRow("tax", selectedRow);
            }
        } /*else {
           uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save tax!", jsonObj.savetaxresponsetype.result);
        }*/
        $("#btnSave").prop("disabled", false);
    }, changeTaxIncrease : function() {
        if ($('#taxIncreases').val() == "ON_PRICE_LIMIT") {
            $('#chargePriceLimitTDiv').removeClass("hidden");
            $('#chargeTaxIncreaseNameDiv').removeClass("hidden");
            $('#chargeTaxIncreaseRateDiv').removeClass("hidden");
        }else {
            $('#chargePriceLimitTDiv').removeClass("hidden").addClass("hidden");
            $('#chargeTaxIncreaseNameDiv').removeClass("hidden").addClass("hidden");
            $('#chargeTaxIncreaseRateDiv').removeClass("hidden").addClass("hidden");
        }
    },
};