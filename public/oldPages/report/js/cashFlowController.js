angular.module('reportApp').controller('CashIOController', ['$scope', '$http', function($scope, $http) {
    var hasConfig = getSystemConfigurationValue("SESSION_MODE");
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

    $('#orderType').selectpicker({
        actionsBox: true,
        style: 'btn-info',
        width: '100%'
    });

    $("[name='formerEmployee']").bootstrapSwitch({
        onColor: 'info',
        offColor: 'default',
    });

    $('input[name="formerEmployee"]').on('switchChange.bootstrapSwitch', function(event, state) {
        if (state == true) {
            $scope.listAllStaffsType(true);
        } else {
            $scope.listAllStaffsType(false);
        }
    });

    $scope.init = function() {
        $scope.listAvailablePrinters();
        $scope.listAllStaffsType();
        if (biscuitHelper.hasPermission(biscuit.u(), "TOTAL_REPORT")) {
            $('#personalReport').val(false);
        } else if (biscuitHelper.hasPermission(biscuit.u(), "REPORT")) {
            $('#personalReport').val(false);
            $('#users-select-choice').find('option:eq(0)').remove();
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
        } else  {
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
            
            $('#users-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#users-select-choice').selectpicker('refresh');}, 50);
        })

        response.error(function(data, status, headers, config) {
            console.log("Data:" + data + " " + "Status:" + status);
        })
    };


    $scope.submitForm = function(isPrint, isExport) {
        var restaurantHour = getRestaurantHour();
        if($('#personalReport').val() === 'true') {
            $('#users-select-choice').val(staffIdMap.userIdToStaffIdMapping[biscuit.u().userid]);
        }
        setFormActionUrl('cashIOform', '/kpos/webapp/report/cashInOut');
        if ($('#fromDate-div').data("DateTimePicker").format() === 'hh:mm:ss A') {         
            var todayDateTime = moment(getCurrentDate(getRestaurantHour()));
            var todayDateString = todayDateTime.format('YYYY-MM-DD');
            var tomorrowDateString = todayDateTime.add(1, 'days').format('YYYY-MM-DD');
            var startHours = moment($('#fromDate').val(), 'hh:mm:ss A').format("HH:mm:ss");
            var endHours = moment($('#toDate').val(), 'hh:mm:ss A').format("HH:mm:ss");
            var adjustedFromDateTime = todayDateString + " " + startHours;
            var adjustedToDateTime = (startHours.localeCompare(endHours) < 0 ? todayDateString : tomorrowDateString) + ' ' + endHours;
            $('#inputFromDate').val(adjustedFromDateTime);
            $('#inputToDate').val(adjustedToDateTime);
        } else {
            $('#inputFromDate').val($('#fromDate').val());
            $('#inputToDate').val($('#toDate').val());
        }

        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.cashIOform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('RegisterActivityController', ['$scope', '$http', function($scope, $http) {
    var hasConfig = getSystemConfigurationValue("SESSION_MODE");
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

    $('#orderType').selectpicker({
        actionsBox: true,
        style: 'btn-info',
        width: '100%'
    });

    $("[name='formerEmployee']").bootstrapSwitch({
        onColor: 'info',
        offColor: 'default',
    });

    $('input[name="formerEmployee"]').on('switchChange.bootstrapSwitch', function(event, state) {
        if (state == true) {
            $scope.listAllStaffsType(true);
        } else {
            $scope.listAllStaffsType(false);
        }
    });

    $scope.init = function() {
        $scope.listAvailablePrinters();
        $scope.listAllStaffsType();
        if (biscuitHelper.hasPermission(biscuit.u(), "TOTAL_REPORT")) {
            $('#personalReport').val(false);
        } else if (biscuitHelper.hasPermission(biscuit.u(), "REPORT")) {
            $('#personalReport').val(false);
            $('#users-select-choice').find('option:eq(0)').remove();
        } else if (biscuitHelper.hasPermission(biscuit.u(), "PERSONAL_REPORT")) {
            $('#personalReport').val(true);
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

            $('#users-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#users-select-choice').selectpicker('refresh');}, 50);
        })

        response.error(function(data, status, headers, config) {
            console.log("Data:" + data + " " + "Status:" + status);
        })
    };

    $scope.submitForm = function(isPrint, isExport) {
        var restaurantHour = getRestaurantHour();
        if($('#personalReport').val() === 'true') {
            $('#users-select-choice').val(staffIdMap.userIdToStaffIdMapping[biscuit.u().userid]);
        }
        setFormActionUrl('registeractivityform', '/kpos/webapp/report/cashRegisterActivityReport');
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
        document.registeractivityform.submit();
    };

    $scope.init();
}]);