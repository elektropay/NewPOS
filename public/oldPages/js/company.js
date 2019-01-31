var companyPage = {
    init : function() {
        restaurantHoursObj.init();
        company.init();
        uploadAddressDataObj.init();
        dataManagerObj.init();
        uiBaseObj.addDeleteConfirmDialog("companyPage", "deleteRestaurantHourConfirmationDialog", "Restaurant Hour", "restaurantHoursObj.deleteRestaurantHours();");
        uiBaseObj.addConfirmDialog("companyPage", "confirmDeleteAllOrdersDialog", "Warning", "Are you sure you want to delete all orders?", "This operation cannot be undone!", "dataManagerObj.deleteOrders();");
        uiBaseObj.addConfirmDialog("companyPage", "confirmPrintAllReceiptsDialog", "Warning", "Are you sure you want to print receipts for all selected orders?", "", "dataManagerObj.printAllReceipts();");
        uiBaseObj.addConfirmDialog("companyPage", "confirmDeleteAllSaleItemReviewsDialog", "Warning", "Are you sure you want to delete all selected sale item reviews?", "This operation cannot be undone!", "dataManagerObj.deleteSaleItemReviews();");
        uiBaseObj.addConfirmDialog("companyPage", "confirmActivateLicenseDialog", "Confirm License Activation", "Are you sure you want to send license activation request?",
                    "Your restaurant name, address and phone number cannot be modified after activation.", "company.registerProduct();");
    },
    afterInit : function() {
        company.displayLicenseRelatedInfo();
    }
};

var company = {
    companyProfile : null,
    licenseStatus : null,
    connectedToCloudService : null,
    init : function() {
        restaurantHoursObj.listAllRestaurantHours();
        company.loadCompanyProfile();
    },
    openRegisterProductDialog : function() {
        company.saveProfile();
        $("#confirmActivateLicenseDialog").popup("open");
    },
    displayLicenseRelatedInfo : function() {
        $('#btnRegisterProduct').hide();
        $('#btnConnectToCloudServer').hide();
        $('#btnDisconnectFromCloudServer').hide();
        if (company.licenseStatus == 'ACTIVATED') {
            if (company.connectedToCloudService) {
                $('#btnDisconnectFromCloudServer').show();
            } else {
                $('#btnConnectToCloudServer').show();
            }
        } else {
            $('#btnRegisterProduct').show();
        }
    },
    registerProduct : function() {
        $("#confirmActivateLicenseDialog").popup("close");
        var registerServerInstanceType = new RegisterServerInstanceType();
        callWebService(registerServerInstanceType, company.registerServerInstanceHandler);
    },
    registerServerInstanceHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.registerserverinstanceresponsetype)) {
            uiBaseObj.alertDiv("licenseBtnDiv", systemLanguage.msgCodeList.LICENSE_ACTIVATION_SUCCESS, "Registration request is successfully sent!");
            company.loadCompanyProfile();
        } else {
            uiBaseObj.alertDiv("licenseBtnDiv", systemLanguage.msgCodeList.LICENSE_ACTIVATION_FAIL, "Registration failed! Please contact our support team for assistance.");
        }
    },
    loadCompanyProfile : function() {
        var soapType = new FetchCompanyProfileType(true);
        callWebService(soapType, company.loadCompanyProfileHandler);
    },
    loadCompanyProfileHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.fetchcompanyprofileresponsetype)) {
            company.companyProfile = jsonObj.fetchcompanyprofileresponsetype.company;

            $("#companyId").val(company.companyProfile.id);
            if (util.isValidVariable(company.companyProfile.name)) {
                $("#restaurantName").val(util.getXMLDisplayValue(company.companyProfile.name));
            }
            if (util.isValidVariable(company.companyProfile.website)) {
                $("#website").val(util.getXMLDisplayValue(company.companyProfile.website));
            }
            if (util.isValidVariable(company.companyProfile.email)) {
                $("#email").val(util.getXMLDisplayValue(company.companyProfile.email));
            }
            if (util.isValidVariable(company.companyProfile.merchantid)) {
                $("#merchantId").val(util.getXMLDisplayValue(company.companyProfile.merchantid));
            }
            if (util.isValidVariable(company.companyProfile.merchantgroupid)) {
                $("#merchantGroupId").val(util.getXMLDisplayValue(company.companyProfile.merchantgroupid));
            }
            if (util.isValidVariable(company.companyProfile.storeid)) {
                $("#storeId").val(util.getXMLDisplayValue(company.companyProfile.storeid));
            }
            if (util.isValidVariable(company.companyProfile.merchantcode)) {
                $("#merchantCode").val(util.getXMLDisplayValue(company.companyProfile.merchantcode));
            }
            if (util.isValidVariable(company.companyProfile.address1)) {
                $("#address1").val(util.getXMLDisplayValue(company.companyProfile.address1));
            }
            if (util.isValidVariable(company.companyProfile.address2)) {
                $("#address2").val(util.getXMLDisplayValue(company.companyProfile.address2));
            }
            if (util.isValidVariable(company.companyProfile.city)) {
                $("#city").val(util.getXMLDisplayValue(company.companyProfile.city));
            }
            if (util.isValidVariable(company.companyProfile.state)) {
                $("#state").val(util.getXMLDisplayValue(company.companyProfile.state));
            }
            if (util.isValidVariable(company.companyProfile.zipcode)) {
                $("#zipcode").val(util.getLeftPaddedStr(company.companyProfile.zipcode, '0', 5));
            }
            if (util.isValidVariable(company.companyProfile.telephone1)) {
                $("#telephone1").val(company.companyProfile.telephone1);
            }
            if (util.isValidVariable(company.companyProfile.telephone2)) {
                $("#telephone2").val(company.companyProfile.telephone2);
            }
            if (util.isValidVariable(company.companyProfile.fax)) {
                $("#fax").val(company.companyProfile.fax);
            }
            if (util.isValidVariable(company.companyProfile.reseller)) {
                $("#reseller").val(company.companyProfile.reseller);
            }
            if (util.isValidVariable(company.companyProfile.region)) {
                $("#region").val(company.companyProfile.region);
            }

            var curHours = util.getElementsArray(company.companyProfile.hours);
            var curHoursIdList = [];
            for (var i = 0; i < curHours.length; i++) {
                var curHoursObj = curHours[i];
                curHoursIdList.push(curHoursObj.id);
            }
            $("#restaurant-hours-select-choice").val(curHoursIdList).selectmenu("refresh");
            company.licenseStatus = company.companyProfile.appinfo.licensestatus;
            company.connectedToCloudService = util.isBooleanTrue(company.companyProfile.connectedtocloudservice);

            var licenseStatusDetails = company.companyProfile.appinfo.licensestatus;
            if (util.isValidVariable(company.companyProfile.appinfo.licenseexpirationtime)) {
                licenseStatusDetails += ". Expires on " + company.companyProfile.appinfo.licenseexpirationtime;
            }
            licenseStatusDetails += ". " + company.companyProfile.appinfo.licenseinfo;
            $('#licenseInfo').val(licenseStatusDetails);

            if (company.companyProfile.appinfo.registered == "true") {
                $("#restaurantName").prop("disabled", true);
                $("#address1").prop("disabled", true);
                $("#address2").prop("disabled", true);
                $("#city").prop("disabled", true);
                $("#state").prop("disabled", true);
                $("#zipcode").prop("disabled", true);
                $("#telephone1").prop("disabled", true);
                $("#telephone2").prop("disabled", true);
                $("#reseller").prop("disabled", true);
                $("#region").prop("disabled", true);
            }

            company.displayLicenseRelatedInfo();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed to fetch company info!", jsonObj.fetchcompanyprofileresponsetype.result);
        }
    },
    saveProfile : function() {
        $("#btnSave").prop("disabled", true);
        var aId = $("#companyId").val();
        var aName = $("#restaurantName").val();
        var aAddress1 = $("#address1").val();
        if (!util.isValidVariable(aName)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name is required!");
            return
        }
        if (!util.isValidVariable(aAddress1)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_ADDRESS, "Address is required!");
            return;
        }
        var aAddress2 = util.getNullValueIfInvalid($("#address2").val());
        var aCity = util.getNullValueIfInvalid($("#city").val());
        var aState = util.getNullValueIfInvalid($("#state").val());
        var aZipcode = util.getNullValueIfInvalid($("#zipcode").val());
        var aEmail = util.getNullValueIfInvalid($("#email").val());
        var aWebsite = util.getNullValueIfInvalid($("#website").val());
        var aTelephone1 = util.getNullValueIfInvalid($("#telephone1").val());
        var aTelephone2 = util.getNullValueIfInvalid($("#telephone2").val());
        var aFax = util.getNullValueIfInvalid($("#fax").val());
        var reseller = util.getNullValueIfInvalid($("#reseller").val());
        var merchantGroupId = util.getNullValueIfInvalid($("#merchantGroupId").val());
        var storeId = util.getNullValueIfInvalid($("#storeId").val());
        var merchantCode = util.getNullValueIfInvalid($("#merchantCode").val());
        var region = util.getNullValueIfInvalid($("#region").val());
        var hoursIdList = $("#restaurant-hours-select-choice").val();
        var hoursRequestList = [];
        if (hoursIdList) {
            for (var i = 0; i < hoursIdList.length; i++) {
                var hoursId = hoursIdList[i];
                hoursRequestList.push(new RestaurantHoursType(hoursId));
            }
        }

        var soapType = new SaveCompanyProfileType(aId, aName, aAddress1, aAddress2, aCity, aState, aZipcode, aTelephone1, aTelephone2, aEmail, aWebsite, aFax, reseller, region, merchantGroupId, storeId, hoursRequestList, merchantCode);
        callWebService(soapType, company.saveProfileHandler);
    },
    saveProfileHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savecompanyprofileresponsetype)) {
            company.loadCompanyProfile();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Could not save company info!", jsonObj.savecompanyprofileresponsetype.result);
        }
        $("#btnSave").prop("disabled", false);
    },
    connectToCloudService : function() {
        var soapType = new UpdateSystemStatusType('START');
        callWebService(soapType, company.connectToCloudServiceHandler);
    },
    connectToCloudServiceHandler : function(jsonObj) {
        if (util.isBooleanTrue(jsonObj.updatesystemstatusresponsetype.updatecloudservicestatusresult.successful)) {
            $('#btnRegisterProduct').hide();
            $('#btnConnectToCloudServer').hide();
            $('#btnDisconnectFromCloudServer').show();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.FAIL_TO_CONNECT_TO_CLOUD_SERVICE, "Could not connect to cloud service!", jsonObj.updatesystemstatusresponsetype.result);
        }
    },
    disconnectFromCloudService : function() {
        var soapType = new UpdateSystemStatusType('STOP');
        callWebService(soapType, company.disconnectFromCloudServiceHandler);
    },
    disconnectFromCloudServiceHandler : function(jsonObj) {
        if (util.isBooleanTrue(jsonObj.updatesystemstatusresponsetype.updatecloudservicestatusresult.successful)) {
            $('#btnRegisterProduct').hide();
            $('#btnConnectToCloudServer').show();
            $('#btnDisconnectFromCloudServer').hide();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.FAIL_TO_DISCONNECT_FROM_CLOUD_SERVICE, "Could not disconnect from cloud service!", jsonObj.updatesystemstatusresponsetype.result);
        }
    }
};

var uploadAddressDataObj = {
    init : function() {
        $("form#uploadAddressDataForm").submit(function(event){
          //disable the default form submission
          event.preventDefault();

          //grab all form data
          var formData = new FormData($(this)[0]);

          $.ajax({
            url: '/kpos/webapp/file/address/upload',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 120000,
            success: function (returndata) {
                $("#uploadAddressDataPopup").popup("close");
            },
            beforeSend: function () {
                $("button[type='submit']").prop('disabled',true);
                $("#uploadAddressDataPopup").popup("open");
            },
            complete: function(jqXHR, status) {
                $("button[type='submit']").prop('disabled',false);
                $("#uploadAddressDataPopup").popup("close");
            },
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload){ // Check if upload property exists
                    //myXhr.upload.addEventListener('progress',uploadAddressDataObj.progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            }
          });
          return false;
        });
    },
    progressHandlingFunction : function(e){
        if(e.lengthComputable){
            $('progress').attr({value:e.loaded,max:e.total});
        }
    },
    eraseAddressInfo : function() {
      $.ajax({
        url: '/kpos/webapp/file/address/erase',
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000,
        success: function (returndata) {
            $("#uploadAddressDataPopup").popup("close");
        },
        beforeSend: function () {
            $("button[type='button']").prop('disabled',true);
            $("#eraseAddressDataPopup").popup("open");
        },
        complete: function(jqXHR, status) {
            $("button[type='button']").prop('disabled',false);
            $("#eraseAddressDataPopup").popup("close");
        },
        xhr: function() {  // Custom XMLHttpRequest
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload){ // Check if upload property exists
                //myXhr.upload.addEventListener('progress',uploadAddressDataObj.progressHandlingFunction, false); // For handling the progress of the upload
            }
            return myXhr;
        }
      });
    }
};

var dataManagerObj = {
    init : function() {
        var currentUser = biscuit.u();
        if (!util.isValidVariable(currentUser) || !biscuitHelper.hasRole(currentUser, "Boss")) {
            $('#tabList').find('#dataManagementTabListItem').remove();
            $('#tabList').navbar();
            $("#dataManagementTab").hide();
            //$("#tabs").tabs("disable", 3);
            return;
        } else {
            //$('#tabList ul').append('<li><a id="navbar-dataManagementTab" href="#dataManagementTab">Data Management</a></li>').trigger('create');
            //$('#tabList').navbar();
            //$("#tabs").tabs();
            //$('#companyMainDiv').trigger('create');
        }
        
        var soapType = new FindSystemConfigurationsType('ENABLE_RECOVER_ORDER', false);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
                var configList = util.getElementsArray(jsonObj.listsystemconfigurationsresponsetype.systemconfiguration);
                if (configList.length > 0) {
                    if (util.isBooleanTrue(configList[0].value)) {
                        $("#importingOrderDiv").show();
                    } else {
                        $("#importingOrderDiv").hide();
                    }
                }
            }
        });
        
        baseReportObj.setReportDateBasedOnSystemDate("fromDate", "toDate");
        baseReportObj.setReportDateBasedOnSystemDate("fromDate1", "toDate1");
        baseReportObj.setReportDateBasedOnSystemDate("fromDate2", "toDate2");
        baseReportObj.setFormActionUrl("exportReportForm", "/kpos/webapp/data/exportOrderData");
        /////////////////////////////////////////////////////////////////////////////
        $('#onLineOrder').change(function(){
            $("#excludeOnlineOrders").val(this.checked);
        });
        $("form#importOrdersForm").submit(function(event){

          $("#recoverOrdersPopupContent").html("Recovering order data, please wait..");
          $("#recoverOrdersPopup").popup("open");
          $("button[type='submit']").prop('disabled',true);
          //disable the default form submission
          event.preventDefault();

          //grab all form data
          var formData = new FormData($(this)[0]);

          $.ajax({
            url: '/kpos/webapp/data/importOrderData',
            type: 'POST',
            data: formData,
            async: true,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 600000,
            success: function (returndata) {
                $("#recoverOrdersPopup").popup("close");
                window.setTimeout(function() {dataManagerObj.completeJob(returndata);}, 500);
            },
            beforeSend: function () {
                $("button[type='submit']").prop('disabled',true);
            },
            complete: function(jqXHR, status) {
                $("#recoverOrdersPopup").popup("close");
                window.setTimeout(function() {dataManagerObj.completeJob("Complete");}, 200);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $("#recoverOrdersPopup").popup("close");
                window.setTimeout(function() {dataManagerObj.completeJob("Fail to recover data, error: " + errorThrown);}, 200);
            }
          });

          return false;
        });

        $("form#exportReportForm").submit(function(event){
            $("#recoverOrdersPopupContent").html("Backing up order data, please wait..");
            $("#recoverOrdersPopup").popup("open");
            $("button[type='submit']").prop('disabled',true);

            $.fileDownload($(this).prop('action'), {
                preparingMessageHtml: "We are preparing your report, please wait...",
                failMessageHtml: "There was a problem generating your report, please try again.",
                httpMethod: "POST",
                successCallback: function (url) {
                    $("#recoverOrdersPopup").popup("close");
                    $("button[type='submit']").prop('disabled',false);
                },
                failCallback: function (html, url) {
                    $("#recoverOrdersPopup").popup("close");
                    $("button[type='submit']").prop('disabled',false);
                },
                data: $(this).serialize()
            });
            event.preventDefault(); //otherwise a normal form submit would occur

        });
    },
    openClearAllOrdersDialog : function() {
        $("#confirmDeleteAllOrdersDialog").popup("open");
    },
    deleteOrders : function() {
        var currentUser = biscuit.u();
        var userId = currentUser.id;
        var fromDate = $("#fromDate1").val();
        var toDate = $("#toDate1").val();
        var userAuth = admin.getUserAuthInfo();
        var deleteOrdersType = new DeleteOrdersType(userAuth, fromDate, toDate);
        callWebService(deleteOrdersType, dataManagerObj.deleteOrdersHandler);
        $("#confirmDeleteAllOrdersDialog").popup("close");
    },
    deleteOrdersHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteordersresponsetype)) {
            uiBaseObj.alertMsg(jsonObj.deleteordersresponsetype.count + " orders have been successfully deleted");
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Delete failed!", jsonObj.deleteordersresponsetype.result);
        }
    },
    openDeleteSaleItemReviewsDialog : function() {
        $("#confirmDeleteAllSaleItemReviewsDialog").popup("open");
    },
    deleteSaleItemReviews : function() {
        var fromDate = util.formatJsDate($("#fromDate2").val());
        var toDate = util.formatJsDate($("#toDate2").val());
        var deleteSaleItemReviewsType = new DeleteSaleItemReviewsType(fromDate, toDate);
        callWebService(deleteSaleItemReviewsType, dataManagerObj.deleteSaleItemReviewsHandler);
        $("#confirmDeleteAllSaleItemReviewsDialog").popup("close");
    },
    deleteSaleItemReviewsHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletesaleitemreviewresponsetype)) {
            uiBaseObj.alertMsg(jsonObj.deletesaleitemreviewresponsetype.count + " reviews have been successfully deleted");
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Delete failed!", jsonObj.deletesaleitemreviewresponsetype.result);
        }
    },
    completeJob : function(data) {
        uiBaseObj.alert(systemLanguage.msgCodeList.DEFAULT, data);
        $("button[type='submit']").prop('disabled', false);
    },
    submitForm : function() {
    },
    openPrintAllReceiptsDialog : function() {
        $("#confirmPrintAllReceiptsDialog").popup("open");
    },
    printAllReceipts : function() {
        $("#btn-print-receipts").prop('disabled', true);
        $("#printingReceiptsText").show();
        var fromDate = $("#fromDate").val();
        var toDate = $("#toDate").val();
        //var userAuth = admin.getUserAuthInfo();
        var batchPrintReceiptsType = new BatchPrintReceiptsType(null, fromDate, toDate);
        callWebService(batchPrintReceiptsType, dataManagerObj.batchPrintReceiptsTypeHandler);
        $("#confirmPrintAllReceiptsDialog").popup("close");
    },
    batchPrintReceiptsTypeHandler : function(jsonObj) {
        $("#printingReceiptsText").hide();
        $("#btn-print-receipts").prop('disabled', false);
        if (util.isSuccessfulResponse(jsonObj.printreceiptresponsetype)) {
            uiBaseObj.alertMsg("Printed " + jsonObj.printreceiptresponsetype.numofprintedreceipts + " receipts. Number of failed receipts: " + jsonObj.printreceiptresponsetype.numoffailedreceipts);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.PRINT_FAILED, "Print failed!", jsonObj.printreceiptresponsetype.result);
        }
    }
};

var restaurantHoursObj = {
    action : "",
    toBeDeletedHoursId : -1,
    init : function() {
        restaurantHoursObj.listAllRestaurantHours();
    },
    resetRestaurantHoursForm : function(disabled) {
        $("#restaurantHoursId").val("");
        $("#restaurantHoursId").attr("disabled", disabled);
        $("#restaurantHoursName").val("");
        $("#restaurantHoursName").attr("disabled", disabled);
        $("#from").val("");
        $("#from.disabled").attr("disabled", disabled);
        $("#to").val("");
        $("#to.disabled").attr("disabled", disabled);
        $("#fromDayOfWeek").val("").selectmenu("refresh");
        $("#fromDayOfWeek.disabled").attr("disabled", disabled);
        $("#toDayOfWeek").val("").selectmenu("refresh");
        $("#toDayOfWeek.disabled").attr("disabled", disabled);
        $("#hoursDescription").val("");
        $("#hoursDescription").attr("disabled", disabled);
    },
    listAllRestaurantHours : function() {
        var soapType = new ListAllRestaurantHoursType();
        callWebService(soapType, restaurantHoursObj.listRestaurantHoursHandler);
    },
    listRestaurantHoursHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listrestauranthoursresponsetype)) {
            document.getElementById("restaurantHours").innerHTML = "";
            var restaurantHoursArray = util.getElementsArray(jsonObj.listrestauranthoursresponsetype.hours);
            $('#restaurant-hours-select-choice').find('option').remove();
            $("#restaurant-hours-select-choice").append("<option value=''>    </option>").trigger("create");
            for(var i = 0; i < restaurantHoursArray.length; i++) {
                var hours = restaurantHoursArray[i];
                if (util.isBooleanTrue(hours.systemGenerated)) continue;
                $("#restaurant-hours-select-choice").append("<option value='" + hours.id + "'>" + restaurantHoursObj.getRestaurantHourDisplayName(hours) + "</option>").trigger("create");
                restaurantHoursObj.addRestaurantHoursRow("restaurantHours", hours, "restaurantHoursObj.fetchRestaurantHours", "restaurantHoursObj.deleteRestaurantHoursWithConfirmationDialog");
            }
            restaurantHoursObj.resetRestaurantHoursForm(true);
        }
    },
    newRestaurantHours : function() {
        $(".btn-save").prop("disabled", false);
        restaurantHoursObj.resetRestaurantHoursForm(false);
        restaurantHoursObj.action = uiBaseObj.ADD;
    },
    validateInput : function() {
        var name = $("#restaurantHoursName").val();
        if(util.isNullOrEmpty(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME, "Name cannot be empty!");
            return false;
        }
        var from = $("#from").val();
        var to = $("#to").val();
        if(util.isNullOrEmpty(from) || util.isNullOrEmpty(to)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_FROM_TO_DATE, "From and To date cannot be empty!")
            return false;
        }
        return true;
    },
    getRestaurantHourDisplayName : function(hours) {
        var displayName = util.getEmptyValueIfInvalid(hours.name) + ": " + util.getEmptyValueIfInvalid(hours.from) + "-" + util.getEmptyValueIfInvalid(hours.to);
        if (util.isValidVariable(hours.fromdayofweek) && util.isValidVariable(hours.todayofweek)) {
            displayName += "(" + hours.fromdayofweek + "-" + hours.todayofweek + ")";
        }
        return displayName;
    },
    saveRestaurantHours : function() {
        $(".btn-save").prop("disabled", true);
        if(!restaurantHoursObj.validateInput()) {
            $(".btn-save").prop("disabled", false);
            return false;
        }
        if (restaurantHoursObj.action == uiBaseObj.ADD) {
            restaurantHoursObj.createRestaurantHours();
        } else if (restaurantHoursObj.action == uiBaseObj.UPDATE) {
            restaurantHoursObj.updateRestaurantHours();
        } else {
            $(".btn-save").prop("disabled", false);
        }
    },
    createRestaurantHours : function() {
        if ($("#restaurantHoursId").val() == null || $("#restaurantHoursId").val() == "") {
            var name = $("#restaurantHoursName").val();
            var from = $("#from").val();
            if (!restaurantHoursObj.isValidDateFormat(from)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "From format has to be: (hh:mm)!");
                $(".btn-save").prop("disabled", false);
                return;
            }
            var to = $("#to").val();
            if (!restaurantHoursObj.isValidDateFormat(to)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "To format has to be: (hh:mm)!");
                $(".btn-save").prop("disabled", false);
                return;
            }
            var fromDayOfWeek = $("#fromDayOfWeek").val();
            var toDayOfWeek = $("#toDayOfWeek").val();
            var description = $("#hoursDescription").val();
            var soapType = new CreateRestaurantHoursType(name, from, to, fromDayOfWeek, toDayOfWeek, description);
            callWebService(soapType, restaurantHoursObj.createRestaurantHoursHandler);
        }
    },
    createRestaurantHoursHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.addrestauranthoursresponsetype)) {
            $("#restaurantHoursId").val(jsonObj.addrestauranthoursresponsetype.id);
            restaurantHoursObj.listAllRestaurantHours();
            uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to add restaurant hours", jsonObj.addrestauranthoursresponsetype.result);
        }
        $(".btn-save").prop("disabled", false);
    },
    updateRestaurantHours : function() {
        if ($("#restaurantHoursId").val() != null && $("#restaurantHoursId").val() != "") {
            var id = $("#restaurantHoursId").val();
            var name = $("#restaurantHoursName").val();
            var from = $("#from").val();
            if (!restaurantHoursObj.isValidDateFormat(from)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "From format has to be: (hh:mm)!");
                $(".btn-save").prop("disabled", false);
                return;
            }
            var to = $("#to").val();
            if (!restaurantHoursObj.isValidDateFormat(to)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "To format has to be: (hh:mm)!");
                $(".btn-save").prop("disabled", false);
                return;
            }
            var fromDayOfWeek = $("#fromDayOfWeek").val();
            var toDayOfWeek = $("#toDayOfWeek").val();
            var description = $("#hoursDescription").val();
            var soapType = new UpdateRestaurantHoursType(id, name, from, to, fromDayOfWeek, toDayOfWeek, description);
            callWebService(soapType, restaurantHoursObj.updateRestaurantHoursHandler);
        }
    },
    isValidDateFormat : function(input) {
        var pattern = /^[0-2][0-9]:[0-5][0-9]$/;
        return input.match(pattern) != null;
    },
    updateRestaurantHoursHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.updaterestauranthoursresponsetype)) {
            restaurantHoursObj.listAllRestaurantHours();
            company.loadCompanyProfile();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to update restaurant hours!", jsonObj.updaterestauranthoursresponsetype.result);
        }
        $(".btn-save").prop("disabled", false);
    },
    fetchRestaurantHours : function(id) {
        var soapType = new FetchRestaurantHoursType(id);
        callWebService(soapType, restaurantHoursObj.fetchRestaurantHoursHandler);
    },
    fetchRestaurantHoursHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.fetchrestauranthoursresponsetype)) {
            var restaurantHours = jsonObj.fetchrestauranthoursresponsetype.hours;
            $("#restaurantHoursId").val(restaurantHours.id);
            $("#restaurantHoursName").val(restaurantHours.name);
            $("#from").val(restaurantHours.from);
            $("#to").val(restaurantHours.to);
            $("#fromDayOfWeek").val(restaurantHours.fromdayofweek).selectmenu("refresh");
            $("#toDayOfWeek").val(restaurantHours.todayofweek).selectmenu("refresh");
            $("#hoursDescription").val(util.getEmptyValueIfInvalid(restaurantHours.description));

            $("#restaurantHoursName").attr("disabled", false);
            $("#from").attr("disabled", false);
            $("#to").attr("disabled", false);
            $("#fromDayOfWeek").attr("disabled", false);
            $("#toDayOfWeek").attr("disabled", false);
            $("#hoursDescription").attr("disabled", false);
            restaurantHoursObj.action = uiBaseObj.UPDATE;
        }
    },
    deleteRestaurantHours : function() {
        if ($("#restaurantHoursId").val() != null && $("#restaurantHoursId").val() != "") {
            var soapType = new DeleteRestaurantHoursType(restaurantHoursObj.toBeDeletedHoursId);
            callWebService(soapType,restaurantHoursObj. deleteRestaurantHoursHandler);
            restaurantHoursObj.toBeDeletedHoursId = -1;
        }
    },
    deleteRestaurantHoursWithConfirmationDialog : function(id) {
        restaurantHoursObj.toBeDeletedHoursId = id;
        $('#deleteRestaurantHourConfirmationDialog').popup('open');
    },
    deleteRestaurantHoursHandler : function(jsonObj){
        if (util.isSuccessfulResponse(jsonObj.deleterestauranthoursresponsetype)) {
            restaurantHoursObj.listAllRestaurantHours();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete restaurant hours!", jsonObj.deleterestauranthoursresponsetype.result);
        }
    },
    addRestaurantHoursRow : function(tableID, restaurantHours, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        var innerHTML = "<td onclick='"+selectRowFunc+"("+restaurantHours.id+");'>"+restaurantHours.name+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+restaurantHours.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    }
}
