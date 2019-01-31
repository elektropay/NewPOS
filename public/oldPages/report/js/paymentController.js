angular.module('reportApp').controller('AllController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();
        $scope.listAllTerminalsType();

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

    $scope.listAllTerminalsType = function() {
        var soapBody = "<app:FindDevicesType><app:type>" + "PAYMENT_TERMINAL" + "</app:type></app:FindDevicesType>";
        var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);

        response.success(function(data, status, headers, config){
            var jsonObj = xml2Json(data);
            $scope.terminalList = jsonObj.FindDevicesResponseType.devices;
            $('#paymentTerminal').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#paymentTerminal').selectpicker('refresh');}, 50);
        })

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    }

    $scope.submitForm = function(isPrint, isExport) {
        /*if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('allform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.allform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('CashController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();

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
        setFormActionUrl('cashform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.cashform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('CreditController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();
        $scope.listAllTerminalsType();

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

    $scope.listAllTerminalsType = function() {
        var soapBody = "<app:FindDevicesType><app:type>" + "PAYMENT_TERMINAL" + "</app:type></app:FindDevicesType>";
        var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);

        response.success(function(data, status, headers, config){
            var jsonObj = xml2Json(data);
            $scope.terminalList = jsonObj.FindDevicesResponseType.devices;
            $('#paymentTerminal').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#paymentTerminal').selectpicker('refresh');}, 50);
        })

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    }

    $scope.submitForm = function(isPrint, isExport) {
/*        if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('creditform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.creditform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('GiftCardController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();

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

    //submit form
    $scope.submitForm = function(isPrint, isExport) {
        /*if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('giftcardform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.giftcardform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('LoyaltyCardController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();

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
/*        if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('loyaltycardform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.loyaltycardform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('OtherController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();

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
/*        if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('otherform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.otherform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('BatchController', ['$scope', '$http', function($scope, $http) {

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

    $("[name='report-type-settle-choice']").bootstrapSwitch({
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

        $scope.listAvailablePrinters();

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
        setFormActionUrl('batchform', '/kpos/webapp/report/creditCardReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.batchform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('AliController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();

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
/*        if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('alipayform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.alipayform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('WeChatController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();

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
/*        if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('wechatpayform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.wechatpayform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('LevelUpController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();

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
/*        if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('leveluppayform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.wechatpayform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('CashTipController', ['$scope', '$http', function($scope, $http) {

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

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');

        $scope.listAvailablePrinters();

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
/*        if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('cashtipform', '/kpos/webapp/report/cashCreditDelivery');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.cashtipform.submit();
    };

    $scope.init();
}]);