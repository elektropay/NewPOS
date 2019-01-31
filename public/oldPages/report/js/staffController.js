angular.module('reportApp').controller('StaffController', ['$scope', '$http', function($scope, $http) {
    var hasConfig = getSystemConfigurationValue("SESSION_MODE");
    $('#fromDate-div').datetimepicker({
        sideBySide: true,
    });

    $('#toDate-div').datetimepicker({
        sideBySide: true,
    });

    $('input[name="formerEmployee"]').on('switchChange.bootstrapSwitch', function(event, state) {
        if (state == true) {
            $scope.listAllStaffsType(true);
        } else {
            $scope.listAllStaffsType(false);
        }
    });

    $("[name='formerEmployee']").bootstrapSwitch({
        onColor: 'info',
        offColor: 'default',
    });

    $("[name='showOrderSummary']").bootstrapSwitch({
        onColor: 'info',
        offColor: 'default',
    });

    $("[name='showTipsTotal']").bootstrapSwitch({
        onColor: 'info',
        offColor: 'default',
    });

    $('#export-select-choice').selectpicker({
        style: 'btn-info',
        width: '100%'
    });

    $scope.init = function() {
        $scope.listAllStaffsType(false);
        $scope.listAvailablePrinters();
        if (biscuitHelper.hasPermission(biscuit.u(), "TOTAL_REPORT")) {
            $('#personalReport').val(false);
        } else if (biscuitHelper.hasPermission(biscuit.u(), "REPORT")) {
            $('#personalReport').val(false);
            $('#staffs-select-choice').find('option:eq(0)').remove();
        } else if (biscuitHelper.hasPermission(biscuit.u(), "PERSONAL_REPORT")) {
            $('#personalReport').val(true);
            $('#employee-name-tag').show();
            $('#staff-list-div').hide();
            $('#staffNameDisplay').html("Staff: " + biscuit.u().info.name);
        }

        $('#fromDate-div').data("DateTimePicker").clear();
        $('#toDate-div').data("DateTimePicker").clear();
        if (hasConfig != null && hasConfig) {
            var from = findOpenSessionStartTime();
            if (from != null) {
                $('#fromDate-div').data("DateTimePicker").defaultDate(moment(from).format('MM/DD/YYYY hh:mm A'));
            } else {
                $('#fromDate-div').data("DateTimePicker").defaultDate(new Date());
            }   
            $('#toDate-div').data("DateTimePicker").defaultDate(new Date());
            $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD hh:mm:ss A');
            $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD hh:mm:ss A');
            if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
                $('#report-date-div').hide();
            }
        } else {
            var restaurantHour = getRestaurantHour();
            var now = getCurrentDate(restaurantHour);
            var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
            var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
            //console.log(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24)
            //console.log(to);
            $('#fromDate-div').data("DateTimePicker").defaultDate(from);
            $('#toDate-div').data("DateTimePicker").defaultDate(to);
            if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
                $('#fromDate-div').data("DateTimePicker").format('hh:mm:ss A');
                $("#toDate-div").data("DateTimePicker").format('hh:mm:ss A');
            } else {
                $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD hh:mm:ss A');
                $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD hh:mm:ss A');
            }
        }

        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }
    };

    $scope.listAllStaffsType = function(isShowFormerEmployee) {
        $scope.staffList = [];
        var soapBody = "<app:ListStaffType><app:showPrevStaff>" + isShowFormerEmployee + "</app:showPrevStaff></app:ListStaffType>"
        var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;

        var response =  $http.post(serverUrl, soapXMLRequest);

        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data)
            if (jsonObj.ListStaffResponseType.staff != null) {
                if (jsonObj.ListStaffResponseType.staff instanceof Array) {
                    $scope.staffList = jsonObj.ListStaffResponseType.staff;
                } else {
                    $scope.staffList.push(jsonObj.ListStaffResponseType.staff);
                }
            }
            staffIdMap.userIdToStaffIdMapping = {};

            for (var i = 0; i < $scope.staffList.length; i++) {
                if ($scope.staffList[i].user != null) {
                    staffIdMap.userIdToStaffIdMapping[$scope.staffList[i].user.id] = $scope.staffList[i].id;
                };
            }

            $('#staffs-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#staffs-select-choice').selectpicker('refresh');}, 50);
        })

        response.error(function(data, status, headers, config) {
            console.log("Data:" + data + " " + "Status:" + status);
        })
    };

    $scope.listAvailablePrinters = function() {
        var soapXMLRequest = soapXMLBegin + "<app:ListPrintersType/>" + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);
        
        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data);
            $scope.printerList = [];
            angular.forEach(jsonObj.ListPrintersResponseType.printers, function(value, key) {
                if (value.realName != 'Display') {
                    $scope.printerList.push(value);
                }
            })
            $('#printer-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#printer-select-choice').selectpicker('refresh');}, 50); 
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };

    $scope.submitForm = function(isPrint, isExport) {
        var restaurantHour = getRestaurantHour();
        if($('#personalReport').val() === 'true') {
            $('#staffs-select-choice').val(staffIdMap.userIdToStaffIdMapping[biscuit.u().userid]);
        }
        setFormActionUrl('staffform', '/kpos/webapp/report/staffReport');
        if ($('#fromDate-div').data("DateTimePicker").format() === 'hh:mm:ss A') {         
            var fromDate = getCurrentDate(getRestaurantHour());
            var from = $('#fromDate').val().split(':');
            if (restaurantHour.substr(0, restaurantHour.indexOf(':')) <= 12 && ((parseInt(from[0]) < restaurantHour.substr(0, restaurantHour.indexOf(':')) || parseInt(from[0]) ==12) && $('#fromDate').val().indexOf('AM') > -1)) {
                var tomorrow = new Date(fromDate.setDate(fromDate.getDate() + 1));
                $('#inputFromDate').val(parseReportDate(tomorrow) + " " + $('#fromDate').val());
            } else {
                $('#inputFromDate').val(parseReportDate(fromDate) + " " + $('#fromDate').val());
            }
            var to = $('#toDate').val().split(':');
            var toDate = getCurrentDate(getRestaurantHour());
            if (restaurantHour.substr(0, restaurantHour.indexOf(':')) <= 12 && ((parseInt(to[0]) <= restaurantHour.substr(0, restaurantHour.indexOf(':')) || parseInt(to[0]) == 12) && $('#toDate').val().indexOf('AM') > -1)) {
                var tomorrow = new Date(toDate.setDate(toDate.getDate() + 1));
                $('#inputToDate').val(parseReportDate(tomorrow) + " " + $('#toDate').val());
            } else {
                $('#inputToDate').val(parseReportDate(toDate) + " " + $('#toDate').val());
            }
        } else {
            $('#inputFromDate').val($('#fromDate').val());
            $('#inputToDate').val($('#toDate').val());
        }


        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.staffform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('DeliveryController', ['$scope', '$http', function($scope, $http) {

    $('#fromDate-div').datetimepicker({
        sideBySide: true,
    });

    $('#toDate-div').datetimepicker({
        sideBySide: true,
    });

    $('#export-select-choice').selectpicker({
        style: 'btn-info',
        width: '100%'
    });

    $('input[name="formerEmployee"]').on('switchChange.bootstrapSwitch', function(event, state) {
        if (state == true) {
            $scope.listAllStaffsType(true);
        } else {
            $scope.listAllStaffsType(false);
        }
    });

    $("[name='formerEmployee']").bootstrapSwitch({
        onColor: 'info',
        offColor: 'default',
    });

    $scope.init = function() {
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAllStaffsType(false);
        $scope.listAvailablePrinters();
        if (biscuitHelper.hasPermission(biscuit.u(), "TOTAL_REPORT")) {
            //do nothing
        } else if (biscuitHelper.hasPermission(biscuit.u(), "REPORT")) {
            $('#drivers-select-choice').find('option:eq(0)').remove();
        }

        if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
            $('#report-date-div').hide();
        }

        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }
    };

    $scope.listAllStaffsType = function(isShowFormerEmployee) {
        $scope.staffList = [];
        var soapBody = "<app:ListStaffType><app:showPrevStaff>" + isShowFormerEmployee + "</app:showPrevStaff></app:ListStaffType>"
        var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;

        var response =  $http.post(serverUrl, soapXMLRequest);
        $scope.driversList = [];
        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data)
            if (jsonObj.ListStaffResponseType.staff != null) {
                if (jsonObj.ListStaffResponseType.staff instanceof Array) {
                    $scope.staffList = jsonObj.ListStaffResponseType.staff;
                } else {
                    $scope.staffList.push(jsonObj.ListStaffResponseType.staff);
                }
            }
            for (var i = 0; i < $scope.staffList.length; i++) {
                if ($scope.staffList[i].user != null ) {
                    var roleList = util.getElementsArray($scope.staffList[i].user.roles);
                    for (var j = 0; j < roleList.length; j++) {
                        if (roleList[j].name.toUpperCase() === "DRIVER ROLE" || roleList[j].name.toUpperCase() === "DRIVER") {
                            $scope.driversList.push($scope.staffList[i]);
                        }
                    }
                }
            }
            $('#drivers-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#drivers-select-choice').selectpicker('refresh');}, 50);
        })

        response.error(function(data, status, headers, config) {
            console.log("Data:" + data + " " + "Status:" + status);
        })
    };

    $scope.listAvailablePrinters = function() {
        var soapXMLRequest = soapXMLBegin + "<app:ListPrintersType/>" + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);
        
        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data);
            $scope.printerList = [];
            angular.forEach(jsonObj.ListPrintersResponseType.printers, function(value, key) {
                if (value.realName != 'Display') {
                    $scope.printerList.push(value);
                }
            })
            $('#printer-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#printer-select-choice').selectpicker('refresh');}, 50); 
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };

    $scope.submitForm = function(isPrint, isExport) {
        /*if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('deliveryform', '/kpos/webapp/report/voidDiscountChargeReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.deliveryform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('AttendanceEditRecordController', ['$scope', '$http', 'ngTableParams', 
    function($scope, $http, ngTableParams) {

    var lastWeek = getCurrentDate(getRestaurantHour());
    lastWeek.setDate(lastWeek.getDate() - 6);
    $('#fromDate').datetimepicker({
        defaultDate: lastWeek,
        format: 'YYYY-MM-DD',
    });

    var tommorrow = getCurrentDate(getRestaurantHour());
    tommorrow.setDate(tommorrow.getDate() + 1);
    $('#toDate').datetimepicker({
        defaultDate: tommorrow,
        format: 'YYYY-MM-DD',
    });

    $scope.init = function() {
        if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
            $('#report-date-div').hide();
        }

        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }
    }
    
    $scope.fetchAttendanceEditRecord = function() {
        $('#attendanceEditRecord-alert-sign').hide();
        $('#attendanceEditRecord-loading-page').show(); 
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;

        var newReportForm = {
            from : fromDate,
            to : toDate,
            merchantIds: $scope.$parent.currentMerchantIds
        }
        
        var response = $http.post(getServerUrl() + "/kpos/webapp/report/attendanceEditRecord", newReportForm);

        response.success(function(data, status, headers, config) {
            $scope.tableParams = new ngTableParams({}, {dataset: response.$$state.value.data.attendanceEditRecord});
            $('#attendanceEditRecord-loading-page').hide();  
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
            $('#attendanceEditRecord-loading-page').hide();  
        });
    }
    
    $scope.submitReportPreview = function(printReport, exportReport, printerName, exportType) {
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        setFormActionUrl('attendanceeditrecordform', '/kpos/webapp/report/attendanceEditRecordReport');
        $('#previewFrom').val(fromDate);
        $('#previewTo').val(toDate);
        $('#printReport').val(printReport);
        $('#exportReport').val(exportReport);
        $('#exportFileName').val(exportType);
        $('#appInstanceName').val(biscuit.c());
        document.attendanceeditrecordform.submit();
    }

    $scope.init();
}]);

function selectOnchange(thiz){
    if(thiz.options[0].value == -1 && thiz.options[0].selected){
        $('#showEmployeeTipOutDetails').bootstrapSwitch('state',false);
        $('#showEmployeeTipOutDetails').bootstrapSwitch('disabled', false);
    }else {
        $('#showEmployeeTipOutDetails').bootstrapSwitch('state',true);
        $('#showEmployeeTipOutDetails').bootstrapSwitch('disabled', true);
    }
};

angular.module('reportApp').controller('TipOutController', ['$scope', '$http', function($scope, $http) {
    var hasConfig = getSystemConfigurationValue("SESSION_MODE");
    $('#fromDate-div').datetimepicker({
        sideBySide: true,
    });

    $('#toDate-div').datetimepicker({
        sideBySide: true,
    });

    $('input[name="formerEmployee"]').on('switchChange.bootstrapSwitch', function(event, state) {
        if (state == true) {
            $scope.listAllStaffsType(true);
        } else {
            $scope.listAllStaffsType(false);
        }
    });


    $("[id='showEmployeeTipOutDetails']").bootstrapSwitch({
        onColor: 'info',
        offColor: 'default',
    });


    $('#export-select-choice').selectpicker({
        style: 'btn-info',
        width: '100%'
    });

    $scope.init = function() {
        $scope.listAllStaffsType(false);
        $scope.listAvailablePrinters();
        if (biscuitHelper.hasPermission(biscuit.u(), "TOTAL_REPORT")) {
            $('#personalReport').val(false);
        } else if (biscuitHelper.hasPermission(biscuit.u(), "REPORT")) {
            $('#personalReport').val(false);
            $('#staffs-select-choice').find('option:eq(0)').remove();
            $("#staffs-select-choice").removeAttr("multiple");
            $('#showEmployeeTipOutDetails').bootstrapSwitch('state',true);
            $('#showEmployeeTipOutDetails').bootstrapSwitch('disabled',true);
        } else if (biscuitHelper.hasPermission(biscuit.u(), "PERSONAL_REPORT")) {
            $('#personalReport').val(true);
            $('#employee-name-tag').show();
            $('#staff-list-div').hide();
            $('#staffNameDisplay').html("Staff: " + biscuit.u().info.name);
            $('#showEmployeeTipOutDetails').bootstrapSwitch('state',true);
            $('#showEmployeeTipOutDetails').bootstrapSwitch('disabled',true);
        }

        $('#fromDate-div').data("DateTimePicker").clear();
        $('#toDate-div').data("DateTimePicker").clear();
        if (hasConfig != null && hasConfig) {
            var from = findOpenSessionStartTime();
            if (from != null) {
                $('#fromDate-div').data("DateTimePicker").defaultDate(moment(from).format('MM/DD/YYYY hh:mm A'));
            } else {
                $('#fromDate-div').data("DateTimePicker").defaultDate(new Date());
            }
            $('#toDate-div').data("DateTimePicker").defaultDate(new Date());
            $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD hh:mm:ss A');
            $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD hh:mm:ss A');
            if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
                $('#report-date-div').hide();
            }
        } else {
            var restaurantHour = getRestaurantHour();
            var now = getCurrentDate(restaurantHour);
            var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
            var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
            $('#fromDate-div').data("DateTimePicker").defaultDate(from);
            $('#toDate-div').data("DateTimePicker").defaultDate(to);
            if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
                $('#fromDate-div').data("DateTimePicker").format('hh:mm:ss A');
                $("#toDate-div").data("DateTimePicker").format('hh:mm:ss A');
            } else {
                $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD hh:mm:ss A');
                $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD hh:mm:ss A');
            }
        }

        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }
        setTimeout(function() {$('#staffs-select-choice').selectpicker('refresh');}, 100);
    };

    $scope.listAllStaffsType = function(isShowFormerEmployee) {
        $scope.staffList = [];
        var soapBody = "<app:ListStaffType><app:showPrevStaff>" + isShowFormerEmployee + "</app:showPrevStaff></app:ListStaffType>"
        var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;

        var response =  $http.post(serverUrl, soapXMLRequest);

        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data)
            if (jsonObj.ListStaffResponseType.staff != null) {
                if (jsonObj.ListStaffResponseType.staff instanceof Array) {
                    $scope.staffList = jsonObj.ListStaffResponseType.staff;
                } else {
                    $scope.staffList.push(jsonObj.ListStaffResponseType.staff);
                }
            }
            staffIdMap.userIdToStaffIdMapping = {};

            for (var i = 0; i < $scope.staffList.length; i++) {
                if ($scope.staffList[i].user != null) {
                    staffIdMap.userIdToStaffIdMapping[$scope.staffList[i].user.id] = $scope.staffList[i].id;
                };
            }

            $('#staffs-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#staffs-select-choice').selectpicker('refresh');}, 50);
        })

        response.error(function(data, status, headers, config) {
            console.log("Data:" + data + " " + "Status:" + status);
        })
    };

    $scope.listAvailablePrinters = function() {
        var soapXMLRequest = soapXMLBegin + "<app:ListPrintersType/>" + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);

        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data);
            $scope.printerList = [];
            angular.forEach(jsonObj.ListPrintersResponseType.printers, function(value, key) {
                if (value.realName != 'Display') {
                    $scope.printerList.push(value);
                }
            })
            $('#printer-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#printer-select-choice').selectpicker('refresh');}, 50);
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };

    $scope.submitForm = function(isPrint, isExport) {
        var restaurantHour = getRestaurantHour();
        if($('#personalReport').val() === 'true') {
            $('#staffs-select-choice').val(staffIdMap.userIdToStaffIdMapping[biscuit.u().userid]);
        }
        setFormActionUrl('tipoutform', '/kpos/webapp/report/tipOutReport');
        if ($('#fromDate-div').data("DateTimePicker").format() === 'hh:mm:ss A') {
            var fromDate = getCurrentDate(getRestaurantHour());
            var from = $('#fromDate').val().split(':');
            if (restaurantHour.substr(0, restaurantHour.indexOf(':')) <= 12 && ((parseInt(from[0]) < restaurantHour.substr(0, restaurantHour.indexOf(':')) || parseInt(from[0]) ==12) && $('#fromDate').val().indexOf('AM') > -1)) {
                var tomorrow = new Date(fromDate.setDate(fromDate.getDate() + 1));
                $('#inputFromDate').val(moment(parseReportDate(tomorrow) + " " + $('#fromDate').val(), 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DDTHH:mm'));
            } else {
                $('#inputFromDate').val(moment(parseReportDate(fromDate) + " " + $('#fromDate').val(), 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DDTHH:mm'));
            }
            var to = $('#toDate').val().split(':');
            var toDate = getCurrentDate(getRestaurantHour());
            if (restaurantHour.substr(0, restaurantHour.indexOf(':')) <= 12 && ((parseInt(to[0]) <= restaurantHour.substr(0, restaurantHour.indexOf(':')) || parseInt(to[0]) == 12) && $('#toDate').val().indexOf('AM') > -1)) {
                var tomorrow = new Date(toDate.setDate(toDate.getDate() + 1));
                $('#inputToDate').val(moment(parseReportDate(tomorrow) + " " + $('#toDate').val(), 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DDTHH:mm'));
            } else {
                $('#inputToDate').val(moment(parseReportDate(toDate) + " " + $('#toDate').val(), 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DDTHH:mm'));
            }
        } else {
            $('#inputFromDate').val(moment($('#fromDate').val(), 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DDTHH:mm'));
            $('#inputToDate').val(moment($('#toDate').val(), 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DDTHH:mm'));
        }

        var obj = document.getElementById("staffs-select-choice");
        var userIds = [];
        if(obj.options[0].selected && obj.options[0].value == -1) {
            for(var i=1;i<obj.options.length;i++) {
                userIds.push(obj.options[i].value);// 收集选中项
            }
            $('#userIds').val(userIds);
        }else {
            $('#userIds').val($('#staffs-select-choice').val());

        }

        if($('#showEmployeeTipOutDetails').bootstrapSwitch('state')) {
            $('#showEmployeeTipOutDetailsForm').val(true);
        } else{
            $('#showEmployeeTipOutDetailsForm').val(false);
        }


        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.tipoutform.submit();
    };

    $scope.init();
}]);
