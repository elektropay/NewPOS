angular.module('reportApp').controller('VoidOrderController', ['$scope', '$http', function($scope, $http) {

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
        setFormActionUrl('voidorderform', '/kpos/webapp/report/voidDiscountChargeReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.voidorderform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('VoidCreditController', ['$scope', '$http', function($scope, $http) {

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

    //submit form
    $scope.submitForm = function(isPrint, isExport) {
        /* if($('#isPersonalReport').val() === 'true') {
             $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
         }*/
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('voidcreditform', '/kpos/webapp/report/voidDiscountChargeReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.voidcreditform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('DiscountController', ['$scope', '$http', function($scope, $http) {

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
        setFormActionUrl('discountform', '/kpos/webapp/report/voidDiscountChargeReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.discountform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('ChargeController', ['$scope', '$http', function($scope, $http) {

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
        setFormActionUrl('chargeform', '/kpos/webapp/report/voidDiscountChargeReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.chargeform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('MenuController', ['$scope', '$http', function($scope, $http) {

    /*$('#fromDate-div').datetimepicker({
        sideBySide: true,
    });

    $('#toDate-div').datetimepicker({
        sideBySide: true,
    });*/

    $('#export-select-choice').selectpicker({
        style: 'btn-info',
        width: '100%'
    });

    /*$("[name='onlineOrderMenu']").bootstrapSwitch({
        onColor: 'info',
        offColor: 'default',
    });*/

    $scope.init = function() {
        /*var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');*/

        $scope.listAvailablePrinters();

        $scope.listMenus();


        /*if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
            $('#report-date-div').hide();
        }*/

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


    $scope.listMenus = function() {
        var response = $http.get(getMenuListUrl,{
            params: {
                "showInactive":true,
                "showDeleted":true
            }
        });

        response.success(function(data, status, headers, config) {
            //var jsonObj = JSON.parse(data);
            $scope.menuList = data.menus;

            $scope.inactiveMenus = [];
            $scope.activeMenus = [];

            angular.forEach(data.menus, function(data) {
                if (!data.active) {
                    $scope.inactiveMenus.push(data);
                } else {
                    $scope.activeMenus.push(data);
                }
            })
            $('#menu-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#menu-select-choice').selectpicker('refresh');}, 50);
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
        /*var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);*/
        setFormActionUrl('menuform', '/kpos/webapp/report/menuSummaryReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.menuform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('PurchaseOrderController', ['$scope', '$http', function($scope, $http) {

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

        var currentUser = biscuit.u();
        if (!biscuitHelper.hasPermission(currentUser, 'VIEW_HISTORY_ORDERS') && !biscuitHelper.hasPermission(currentUser, "REPORT_PURCHASE_ORDER")) {
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
        setFormActionUrl('purchaseorderform', '/kpos/webapp/report/purchaseOrderReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.purchaseorderform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('CustomerWaitTimeController', ['$scope', '$http', function($scope, $http) {
    $scope.orderInfoMap = {};
    $scope.customerWaitingTimeReportRecords = [];
    $scope.isRedrawZoomedInGraphDone = true;
    $scope.customerWaitTimeThreshold = 12;
    $scope.dataCache = [];
    $scope.currentSelectTimestamp = null;
    $scope.overviewSummary = '';

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

    $scope.init = function() {
        /*
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $('#fromDate-div').data("DateTimePicker").defaultDate(from);
        $('#fromDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        $('#toDate-div').data("DateTimePicker").defaultDate(to);
        $('#toDate-div').data("DateTimePicker").format('YYYY-MM-DD');
        */
      //  POS-4702
        var restaurantHour = getRestaurantHour();
        var now = getCurrentDate(restaurantHour);
       /*
        var stringToHour = convertStringToTime(restaurantHour, 'HH:mm')
        var today = getCurrentDate(getRestaurantHour());
        var tommorrow = getCurrentDate(getRestaurantHour());
        */

        var from = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':')), 00, 00));
        var to = new Date(now.setHours(restaurantHour.substr(0, restaurantHour.indexOf(':'))*1 + 24, 00, 00));
        $scope.listAvailablePrinters();
        var currentUser = biscuit.u();
        if (!biscuitHelper.hasPermission(currentUser, 'VIEW_HISTORY_ORDERS') || !biscuitHelper.hasPermission(currentUser, "REPORT_CUSTOMER_WAITING_TIME")) {
             //   $('#report-date-div').hide();.
            $('#fromDate').datetimepicker({
                defaultDate:from,
                format: 'hh:mm A',
            });
            $('#toDate').datetimepicker({
                defaultDate:to,
                format: 'hh:mm A'
            });
        }else{
            $('#fromDate').datetimepicker({
                defaultDate:from,
                format: 'YYYY-MM-DD HH:mm',
            });

            $('#toDate').datetimepicker({
                defaultDate:to,
                format: 'YYYY-MM-DD HH:mm',
            });
        }
        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }
        $scope.loadData();
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

    $scope.openReportPreview = function(isPrint, isExport) {
        $scope.listAvailablePrinters();
        $scope.submitReportPreview(false, false);
    }

    $scope.submitReportPreview = function(isPrint, isExport, printerName, exportType) {
        /*if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        setFormActionUrl('customerwaittimeform', '/kpos/webapp/report/customerWaitingTimeReport');
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val();
        var toDate = $('#toDate').val();
        $('#previewFrom').val(fromDate);
        $('#previewTo').val(toDate);
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#printerName').val(printerName);
        $('#exportFileName').val(exportType);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.customerwaittimeform.submit();
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

        setFormActionUrl('customerwaittimeform', '/kpos/webapp/report/customerWaitingTimeReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.customerwaittimeform.submit();
    };

    $scope.refreshChart = function() {
        $scope.generateGraph();
        if ($scope.currentSelectTimestamp) {
            $scope.showZoomedInGraph($scope.currentSelectTimestamp);
        } else {
            $scope.showZoomedInGraph(0);
        }
    };

    $scope.onPointSelected = function() {
        $scope.currentSelectTimestamp = this.x;
        $scope.showZoomedInGraph($scope.currentSelectTimestamp);
    };

    $scope.showZoomedInGraph = function(timeSelected) {
        if (!$scope.isRedrawZoomedInGraphDone) {
            return;
        }
        $scope.isRedrawZoomedInGraphDone = false
        var zoomedInWaitTimeList = [];
        var zoomedInOrderItemTotalQtyList = [];
        var zoomedInThresholdLineInMinutes = [];

        var timeStart = timeSelected - 30 * 60 * 1000;
        var timeEnd = timeSelected + 30 * 60 * 1000;
        for (var i = 0; i < $scope.customerWaitingTimeReportRecords.length; i++) {
            var wt = $scope.customerWaitingTimeReportRecords[i];
            if (wt.orderCreatedOnInMillis >= timeStart && wt.orderCreatedOnInMillis <= timeEnd) {
                zoomedInWaitTimeList.push([wt.orderCreatedOnInMillis, wt.duration]);
                zoomedInOrderItemTotalQtyList.push([wt.orderCreatedOnInMillis, wt.itemsQty]);
                zoomedInThresholdLineInMinutes.push([wt.orderCreatedOnInMillis, 12]);
            }
        }
        $('#customer-wait-time-zoomed-in-graph').highcharts({
            chart: {
                type: 'line',
                events: {
                    load: function(event) {
                        console.log('Chart is loaded.');
                        $scope.isRedrawZoomedInGraphDone = true;
                    }
                }
            },
            title: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                }
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}min',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'Wait Time',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                plotLines: [{
                    value: $scope.customerWaitTimeThreshold,
                    color: 'red',
                    dashStyle: 'shortdash',
                    width: 1,
                    label: {
                        text: 'Wait time threshold'
                    }
                }],
                opposite: true
            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Order QTY',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }
            }],
            plotOptions: {
                series: {
                    dashStyle: "Solid",
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                formatter: function () {
                    var orderSummary = $scope.orderInfoMap[this.x];
                    var s = '<b>' + moment(this.x).format('YYYY-MM-DD HH:mm:ss') + ' #' + orderSummary.num + ' ' + orderSummary.type + '</b>';

                    $.each(this.points, function () {
                        s += '<br/>' + this.series.name + ': ' + this.y;
                        if (this.series.name == 'Wait Time') {
                            s+= ' min';
                        }
                    });

                    return s;
                },
                shared: true
            },
            series: [{
                name: 'Order Qty',
                //type: 'line',
                type: 'column',
                yAxis: 1,
                data: zoomedInOrderItemTotalQtyList
            }, {
                name: 'Wait Time',
                type: 'line',
                data: zoomedInWaitTimeList
            }]
        });
    };

    $scope.generateGraph = function() {
        var data = $scope.dataCache;
        var waitTimeList = [];
        var orderItemTotalQtyList = [];
        var thresholdLineInMinutes = [];
        var totalWaitTime = 0;
        var highWaitTimeOrderCount = 0;
        var totalOrderCount = 0;
        $scope.overviewSummary = '';

        $scope.customerWaitingTimeReportRecords = [];
        $scope.orderInfoMap = {};
        if (data) {
            $scope.customerWaitingTimeReportRecords = data.customerWaitingTimeReportRecords;
            for (var i = 0; i < data.customerWaitingTimeReportRecords.length; i++) {
                var waitingTimeRecord = data.customerWaitingTimeReportRecords[i];
                var orderCreatedOnInMillis = moment(waitingTimeRecord.datetimeCreated, 'YYYY-MM-DD HH:mm:ss').valueOf();
                waitingTimeRecord.orderCreatedOnInMillis = orderCreatedOnInMillis;
                //waitTimeList.push([orderCreatedOn, waitingTimeRecord.duration]);
                waitTimeList.push({x: orderCreatedOnInMillis, y: waitingTimeRecord.duration, events: {mouseOver: $scope.onPointSelected}});
                orderItemTotalQtyList.push([orderCreatedOnInMillis, waitingTimeRecord.itemsQty]);
                thresholdLineInMinutes.push([orderCreatedOnInMillis, 12]);
                $scope.orderInfoMap[orderCreatedOnInMillis] = {'num': waitingTimeRecord.orderNum, 'type': waitingTimeRecord.orderType};
                totalWaitTime += waitingTimeRecord.duration;
                totalOrderCount++;
                if (waitingTimeRecord.duration >= $scope.customerWaitTimeThreshold) {
                    highWaitTimeOrderCount++;
                }
            }

            if (totalOrderCount > 0) {
                var averageWaitTime = Math.round(totalWaitTime / totalOrderCount * 100) / 100;
                $scope.overviewSummary = '(Average: ' + averageWaitTime + ' mins. Number of high wait time orders: ' + highWaitTimeOrderCount + ')';
            }
        }


        $('#customer-wait-time-graph').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                }
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}min',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'Wait Time',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                plotLines: [{
                    value: $scope.customerWaitTimeThreshold,
                    color: 'red',
                    dashStyle: 'shortdash',
                    width: 1,
                    label: {
                        text: 'Wait time threshold'
                    }
                }],
                opposite: true
            }, {
                gridLineWidth: 0,
                title: {
                    text: 'Order QTY',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }
            }],
            plotOptions: {
                series: {
                    dashStyle: "Solid",
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                formatter: function () {
                    var orderSummary = $scope.orderInfoMap[this.x];
                    var s = '<b>' + moment(this.x).format('YYYY-MM-DD HH:mm:ss') + ' #' + orderSummary.num + ' ' + orderSummary.type + '</b>';

                    $.each(this.points, function () {
                        s += '<br/>' + this.series.name + ': ' + this.y;
                        if (this.series.name == 'Wait Time') {
                            s+= ' min';
                        }
                    });

                    return s;
                },
                shared: true
            },
            series: [{
                name: 'Order Qty',
                type: 'column',
                yAxis: 1,
                data: orderItemTotalQtyList
            }, {
                name: 'Wait Time',
                type: 'line',
                data: waitTimeList
            }]
        });
    };

    $scope.clearLocalData = function() {
        $scope.dataCache = [];
        $scope.currentSelectTimestamp = null;
    };

    $scope.loadData = function() {
        $scope.clearLocalData();

        var restaurantHour = getRestaurantHour();
        var requestMerchantId = '';
        if ($scope.$parent.currentMerchantIds) {
            requestMerchantId = $scope.$parent.currentMerchantIds.split(',')[0];
        }
         //POS-4702
         if($('#fromDate').val().length == 8){
            var todayDateTime = moment(getCurrentDate(getRestaurantHour()));
            var todayDateString = todayDateTime.format('YYYY-MM-DD');
            var tomorrowDateString = todayDateTime.add(1, 'days').format('YYYY-MM-DD');
            var startHours = moment($('#fromDate').val(), 'hh:mm A').format("HH:mm:ss");
            var endHours = moment($('#toDate').val(), 'hh:mm A').format("HH:mm:ss");
            var adjustedFromDateTime = todayDateString + " " + startHours;
            var adjustedToDateTime = (startHours.localeCompare(endHours) < 0 ? todayDateString : tomorrowDateString) + ' ' + endHours;
            $('#inputFromDate').val(adjustedFromDateTime);
            $('#inputToDate').val(adjustedToDateTime);
        }else{
            $('#inputFromDate').val($('#fromDate').val());
            $('#inputToDate').val($('#toDate').val());
        }
        var newReportForm = {
            from : $('#inputFromDate').val(),
            to : $('#inputToDate').val(),
            merchantIds: requestMerchantId,
            reportLanguage : biscuit.l()
        }
        var response = $http.post("http://" + location.host + "/kpos/webapp/report/customerWaitingTimeData", newReportForm);

        response.success(function(data, status, headers, config) {
            $scope.dataCache = data;
            $scope.generateGraph();
            $scope.showZoomedInGraph(0);
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    }

    $scope.init();
}]);


var reportApp = angular.module('reportApp').controller('CategoryController', ['$scope', '$http', '$filter', 'ngTableParams', function($scope, $http, $filter, ngTableParams) {
    $scope.returnData;
    /*$scope.menuCategory;*/

    $scope.chartTypeOption = 'PIE';
    $scope.analysisOption = 'QUANTITY';

    $scope.quantityTotal = 0;
    $scope.netSaleTotal = 0;

    $scope.categoryReport = {
        menu: null,
        menuGroup: null,
        category: null
    };

    var restaurantHour = getRestaurantHour();
    var stringToHour = convertStringToTime(restaurantHour, 'HH:mm')
    var today = getCurrentDate(getRestaurantHour());
    $('#fromDate').datetimepicker({
        defaultDate: today.setHours(stringToHour.getHours(), stringToHour.getMinutes()),
        format: 'YYYY-MM-DD HH:mm',
    });

    var tommorrow = getCurrentDate(getRestaurantHour());
    tommorrow.setDate(tommorrow.getDate() + 1);
    $('#toDate').datetimepicker({
        defaultDate: tommorrow.setHours(stringToHour.getHours(), stringToHour.getMinutes()),
        format: 'YYYY-MM-DD HH:mm',
    });

    $("#combineReportItem").on('switchChange.bootstrapSwitch', function (e, data) {
        console.log(data);
        $scope.categoryInfo();
    });

    $("#combineSubItem").on('switchChange.bootstrapSwitch', function (e, data) {
        console.log(data);
        $scope.categoryInfo();
    });

    $('#chartType').on('changed.bs.select', function(e) {
        $scope.manipulateData();
    });

    $scope.chartTypeClick = function(chartType) {
        $scope.chartTypeOption = chartType;

        $scope.manipulateData();
    }

    $scope.analysisClick = function(analysis) {
        $scope.analysisOption = analysis;

        if ($scope.analysisOption == 'PRICE') {
            $("#combineSubItem").bootstrapSwitch('state', false, true);
            $("#combineSubItem").bootstrapSwitch('disabled',true);
        } else if ($scope.analysisOption == 'QUANTITY') {
            $("#combineSubItem").bootstrapSwitch('disabled',false);
        }

        $scope.categoryInfo();
    }

    $scope.init = function() {
        if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
            $('#report-date-div').hide();
        }

        $("#combineReportItem").bootstrapSwitch('disabled',false);

        if ($scope.analysisOption == 'PRICE') {
            $("#combineSubItem").bootstrapSwitch('state', false, true);
            $("#combineSubItem").bootstrapSwitch('disabled',true);
        } else if ($scope.analysisOption == 'QUANTITY') {
            $("#combineSubItem").bootstrapSwitch('disabled',false);
        }

        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }

        $scope.listOrderType();

        $scope.listStaffType();

        $scope.listMenu();

        if (!biscuitHelper.hasPermission(biscuit.u(), "TOTAL_REPORT") && biscuitHelper.hasPermission(biscuit.u(), "REPORT")) {
            setTimeout(function(){
                $('#staffType').selectpicker('val', biscuit.u().userid);

                $('#staffType').prop('disabled', true);
                $('#staffType').selectpicker('refresh');
            },100);
        }
    };

    $scope.categoryInfo = function() {
        $('#category-alert-sign').hide();
        $('#category-loading-page').show();

        var newReportForm = {
            from : $('#fromDate').val(),
            to : $('#toDate').val(),
            orderTypes : $('#orderType').val(),
            userId : $('#staffType').val(),
            merchantIds: $scope.$parent.currentMerchantIds,
            reportLanguage : biscuit.l(),
            combineReport : $('#combineReportItem').bootstrapSwitch('state'),
            combineSub : $('#combineSubItem').bootstrapSwitch('state')
        }
        var response = $http.post("http://" + location.host + "/kpos/webapp/report/category", newReportForm);

        response.success(function(data, status, headers, config) {
            $('#category-loading-page').hide();
            $scope.tableParams = data;
            $scope.returnData = data;
            $scope.manipulateData();
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
            $('#category-loading-page').hide();
        });
    }

    $scope.manipulateData = function() {
        $scope.topTenItems = [];

        $scope.menuName = [];

        $scope.menuOrderTypeCount = [];
        $scope.menuCount = [];
        $scope.menuOrderTypeAmount = [];
        $scope.menuAmount = [];

        $scope.menuGroupName = [];
        $scope.menuGroupOrderTypeCount = [];
        $scope.menuGroupCount = [];
        $scope.menuGroupOrderTypeAmount = [];
        $scope.menuGroupAmount = [];

        $scope.menuCategoryName = [];
        $scope.menuCategoryOrderTypeCount = [];
        $scope.menuCategoryCount = [];
        $scope.menuCategoryOrderTypeAmount = [];
        $scope.menuCategoryAmount = [];

        $scope.menuItemName = [];
        $scope.menuItemOrderTypeCount = [];
        $scope.menuItemCount = [];
        $scope.menuItemOrderTypeAmount = [];
        $scope.menuItemAmount = [];

        $scope.menuBarQuantity = [];
        $scope.menuBarAmount = [];

        $scope.menuGroupBarQuantity = [];
        $scope.menuGroupBarAmount = [];

        $scope.menuCategoryBarQuantity = [];
        $scope.menuCategoryBarAmount = [];

        $scope.menuItemBarQuantity = [];
        $scope.menuItemBarAmount = [];

        $scope.quantityTotal = 0;
        $scope.netSaleTotal = 0;

        angular.forEach($scope.returnData, function(value, key) {
            //循环处理menu层的数据
            $scope.menuName.push(value.menuName);
            $scope.menuCount.push(value.count);

            var menuOrderTypeCountDec = '';
            angular.forEach(value.orderTypeCountMap, function(countValue, countKey) {
                menuOrderTypeCountDec += (countKey + ":" + countValue + "<br>");
            })
            $scope.menuOrderTypeCount.push(menuOrderTypeCountDec);

            $scope.menuAmount.push($filter('number')(value.amount, 2).replace(',', '') * 1);

            var menuOrderTypeAmountDec = '';
            angular.forEach(value.orderTypeAmountMap, function(amountValue, amountKey) {
                menuOrderTypeAmountDec += (amountKey + ":" + $filter('number')(amountValue, 2).replace(',', '') * 1 + " dollars<br>");
            })
            $scope.menuOrderTypeAmount.push(menuOrderTypeAmountDec);

            $scope.quantityTotal += value.count;
            $scope.netSaleTotal += value.amount;

            var menuBarQuantityData = {
                name : value.menuName,
                des : menuOrderTypeCountDec,
                y : value.count
            }

            var menuBarAmountData = {
                name : value.menuName,
                des : menuOrderTypeAmountDec,
                y : $filter('number')(value.amount, 2).replace(',', '') * 1
            }
            $scope.menuBarQuantity.push(menuBarQuantityData);
            $scope.menuBarAmount.push(menuBarAmountData);

            //循环处理group层的数据
            angular.forEach(value.menuGroupSummaryMap, function(groupValue, groupKey) {
                //check with menu group
                if (util.isNullOrEmpty($('#menuType').val()) || $('#menuType option:selected').text() == value.menuName) {
                    $scope.menuGroupName.push(groupValue.groupName);
                    $scope.menuGroupCount.push(groupValue.count);
                    var menuGroupOrderTypeCountDec = '';
                    angular.forEach(groupValue.orderTypeCountMap, function(countValue, countKey) {
                        menuGroupOrderTypeCountDec += (countKey + ":" + countValue + "<br>");
                    })
                    $scope.menuGroupOrderTypeCount.push(menuGroupOrderTypeCountDec);

                    $scope.menuGroupAmount.push($filter('number')(groupValue.amount, 2).replace(',', '') * 1);

                    var menuGroupOrderTypeAmountDec = '';
                    angular.forEach(groupValue.orderTypeAmountMap, function(amountValue, amountKey) {
                        menuGroupOrderTypeAmountDec += (amountKey + ":" + $filter('number')(amountValue, 2).replace(',', '') * 1 + " dollars<br>");
                    })
                    $scope.menuGroupOrderTypeAmount.push(menuGroupOrderTypeAmountDec);

                    var groupBarQuantityData = {
                        name : groupValue.groupName,
                        des : menuGroupOrderTypeCountDec,
                        y : groupValue.count
                    }

                    var groupBarAmountData = {
                        name : groupValue.groupName,
                        des : menuGroupOrderTypeAmountDec,
                        y : $filter('number')(groupValue.amount, 2).replace(',', '') * 1
                    }
                    $scope.menuGroupBarQuantity.push(groupBarQuantityData);
                    $scope.menuGroupBarAmount.push(groupBarAmountData);
                }

                //循环处理Category层的数据
                angular.forEach(groupValue.menuCategorySummaryMap, function(categoryValue, categoryKey) {
                    //check with menu group
                    if (util.isNullOrEmpty($('#menuGroupType').val()) || $('#menuGroupType option:selected').text() == groupValue.groupName) {
                        $scope.menuCategoryName.push(categoryValue.categoryName);
                        $scope.menuCategoryCount.push(categoryValue.count);

                        var menuCategoryOrderTypeCountDec = '';
                        angular.forEach(categoryValue.orderTypeCountMap, function(countValue, countKey) {
                            menuCategoryOrderTypeCountDec += (countKey + ":" + countValue + "<br>");
                        })
                        $scope.menuCategoryOrderTypeCount.push(menuCategoryOrderTypeCountDec);

                        $scope.menuCategoryAmount.push($filter('number')(categoryValue.amount, 2).replace(',', '') * 1);

                        var menuCategoryOrderTypeAmountDec = '';
                        angular.forEach(categoryValue.orderTypeAmountMap, function(amountValue, amountKey) {
                            menuCategoryOrderTypeAmountDec += (amountKey + ":" + $filter('number')(amountValue, 2).replace(',', '') * 1 + " dollars<br>");
                        })
                        $scope.menuCategoryOrderTypeAmount.push(menuCategoryOrderTypeAmountDec);

                        var categoryBarQuantityData = {
                            name : categoryValue.categoryName,
                            des : menuCategoryOrderTypeCountDec,
                            y : categoryValue.count
                        }

                        var categoryBarAmountData = {
                            name : categoryValue.categoryName,
                            des : menuCategoryOrderTypeAmountDec,
                            y : $filter('number')(categoryValue.amount, 2).replace(',', '') * 1
                        }
                        $scope.menuCategoryBarQuantity.push(categoryBarQuantityData);
                        $scope.menuCategoryBarAmount.push(categoryBarAmountData);
                    }

                    //循环处理Item层的数据
                    angular.forEach(categoryValue.menuItemSummaryMap, function(itemValue, itemKey) {
                        //check menu category
                        if (util.isNullOrEmpty($('#menuCategoryType').val()) || $('#menuCategoryType option:selected').text() == categoryValue.categoryName) {
                            $scope.menuItemName.push(itemValue.itemName);
                            $scope.menuItemCount.push(itemValue.count);
                            var menuItemOrderTypeCountDec = '';
                            angular.forEach(itemValue.orderTypeCountMap, function(countValue, countKey) {
                                menuItemOrderTypeCountDec += (countKey + ":" + countValue + "<br>");
                            })
                            $scope.menuItemOrderTypeCount.push(menuItemOrderTypeCountDec);

                            $scope.menuItemAmount.push($filter('number')(itemValue.amount, 2).replace(',', '') * 1);

                            var menuItemOrderTypeAmountDec = '';
                            angular.forEach(itemValue.orderTypeAmountMap, function(amountValue, amountKey) {
                                menuItemOrderTypeAmountDec += (amountKey + ":" + $filter('number')(amountValue, 2).replace(',', '') * 1 + " dollars<br>");
                            })
                            $scope.menuItemOrderTypeAmount.push(menuItemOrderTypeAmountDec);

                            var itemBarQuantityData = {
                                name : itemValue.itemName,
                                des : menuItemOrderTypeCountDec,
                                y : itemValue.count
                            }

                            var itemBarAmountData = {
                                name : itemValue.itemName,
                                des : menuItemOrderTypeAmountDec,
                                y : $filter('number')(itemValue.amount, 2).replace(',', '') * 1
                            }
                            $scope.menuItemBarQuantity.push(itemBarQuantityData);
                            $scope.menuItemBarAmount.push(itemBarAmountData);
                        }

                        if (util.isNullOrEmpty($('#menuType').val()) ||
                            (!util.isNullOrEmpty($('#menuType').val()) && util.isNullOrEmpty($('#menuGroupType').val()) && $('#menuType').val() == itemValue.menuId)
                            || (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val())
                                && util.isNullOrEmpty($('#menuCategoryType').val()) && $('#menuGroupType').val() == itemValue.menuGroupId)
                            || (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val())
                                && !util.isNullOrEmpty($('#menuCategoryType').val()) && $('#menuCategoryType').val() == itemValue.categoryId)) {
                            $scope.topTenItems.push(itemValue);
                        }
                    })
                })
            })
        })

        if ($scope.analysisOption == 'PRICE') {
            if($scope.chartTypeOption == 'PIE') {
                if (util.isNullOrEmpty($('#menuType').val())) {
                    $scope.generatePieChart($scope.menuName, $scope.menuCount, $scope.menuOrderTypeCount, $scope.menuAmount, $scope.menuOrderTypeAmount, "Amount");
                } else if (!util.isNullOrEmpty($('#menuType').val()) && util.isNullOrEmpty($('#menuGroupType').val())) {
                    $scope.generatePieChart($scope.menuGroupName, $scope.menuGroupCount, $scope.menuGroupOrderTypeCount, $scope.menuGroupAmount, $scope.menuGroupOrderTypeAmount, "Amount");
                } else if (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val()) && util.isNullOrEmpty($('#menuCategoryType').val())) {
                    $scope.generatePieChart($scope.menuCategoryName, $scope.menuCategoryCount, $scope.menuCategoryOrderTypeCount, $scope.menuCategoryAmount, $scope.menuCategoryOrderTypeAmount, "Amount");
                } else if (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val()) && !util.isNullOrEmpty($('#menuCategoryType').val())) {
                    $scope.generatePieChart($scope.menuItemName, $scope.menuItemCount, $scope.menuItemOrderTypeCount, $scope.menuItemAmount, $scope.menuItemOrderTypeAmount, "Amount");
                }
            } else {
                if (util.isNullOrEmpty($('#menuType').val())) {
                    $scope.generateBarChart($scope.menuBarQuantity, $scope.menuBarAmount, 'Amount');
                } else if (!util.isNullOrEmpty($('#menuType').val()) && util.isNullOrEmpty($('#menuGroupType').val())) {
                    $scope.generateBarChart($scope.menuGroupBarQuantity, $scope.menuGroupBarAmount, 'Amount');
                } else if (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val()) && util.isNullOrEmpty($('#menuCategoryType').val())) {
                    $scope.generateBarChart($scope.menuCategoryBarQuantity, $scope.menuCategoryBarAmount, 'Amount');
                } else if (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val()) && !util.isNullOrEmpty($('#menuCategoryType').val())) {
                    $scope.generateBarChart($scope.menuItemBarQuantity, $scope.menuItemBarAmount, 'Amount');
                }
            }

            $scope.topTenItems.sort(function(a, b) {
                return b.amount - a.amount;
            })
            $scope.generateTopTenItems($scope.topTenItems.slice(0, 10), "Amount");
        } else {
            if($scope.chartTypeOption == 'PIE') {
                if (util.isNullOrEmpty($('#menuType').val())) {
                    $scope.generatePieChart($scope.menuName, $scope.menuCount, $scope.menuOrderTypeCount, $scope.menuAmount,  $scope.menuOrderTypeAmount, "Quantity");
                } else if (!util.isNullOrEmpty($('#menuType').val()) && util.isNullOrEmpty($('#menuGroupType').val())) {
                    $scope.generatePieChart($scope.menuGroupName, $scope.menuGroupCount, $scope.menuGroupOrderTypeCount, $scope.menuGroupAmount, $scope.menuGroupOrderTypeAmount, "Quantity");
                } else if (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val()) && util.isNullOrEmpty($('#menuCategoryType').val())) {
                    $scope.generatePieChart($scope.menuCategoryName, $scope.menuCategoryCount, $scope.menuCategoryOrderTypeCount, $scope.menuCategoryAmount, $scope.menuCategoryOrderTypeAmount, "Quantity");
                } else if (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val()) && !util.isNullOrEmpty($('#menuCategoryType').val())) {
                    $scope.generatePieChart($scope.menuItemName, $scope.menuItemCount, $scope.menuItemOrderTypeCount, $scope.menuItemAmount, $scope.menuItemOrderTypeAmount, "Quantity");
                }
            } else {
                if (util.isNullOrEmpty($('#menuType').val())) {
                    $scope.generateBarChart($scope.menuBarQuantity, $scope.menuBarAmount, 'Quantity');
                } else if (!util.isNullOrEmpty($('#menuType').val()) && util.isNullOrEmpty($('#menuGroupType').val())) {
                    $scope.generateBarChart($scope.menuGroupBarQuantity, $scope.menuGroupBarAmount, 'Quantity');
                } else if (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val()) && util.isNullOrEmpty($('#menuCategoryType').val())) {
                    $scope.generateBarChart($scope.menuCategoryBarQuantity, $scope.menuCategoryBarAmount, 'Quantity');
                } else if (!util.isNullOrEmpty($('#menuType').val()) && !util.isNullOrEmpty($('#menuGroupType').val()) && !util.isNullOrEmpty($('#menuCategoryType').val())) {
                    $scope.generateBarChart($scope.menuItemBarQuantity, $scope.menuItemBarAmount, 'Quantity');
                }
            }

            $scope.topTenItems.sort(function(a, b) {
                return b.count - a.count;
            })
            $scope.generateTopTenItems($scope.topTenItems.slice(0, 10), "Quantity");
        }
    }

    $scope.isEmpty = function(obj) {
        return angular.equals({}, obj);
    }

    $scope.generateBarChart = function(barQuantity, barAmount, filterType) {
        $('#category-general-chart').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text:  filterType == 'Amount'? 'Amount($)' : 'Quantity'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: filterType == 'Amount' ? '{point.y:.2f}' : '{point.y:.0f}',
                        allowOverlap: true
                    }
                }
            },

            tooltip: {
                headerFormat: '{point.key}<br>',
                pointFormat: (filterType == 'Amount' ? '<b>$ {point.y:.2f}</b><br/>' : '<b>{point.y:.0f}</b><br/>') + '{point.des}<br>'
            },

            series: [{
                colorByPoint: true,
                data: filterType == 'Amount'? barAmount : barQuantity
            }]
        });
    }

    $scope.generatePieChart = function(menuGroupNames, menuGroupCount, menuGroupOrderTypeCount, menuGroupAmount, menuGroupOrderTypeAmount, filterType) {
        var colors = ['#03A9F4', '#673AB7', '#673AB7', '#4CAF50', '#FF9800', '#F44336', '#673AB7'],
            data = [{
                //color: colors[0],
                drilldown: {
                    categories: menuGroupNames,
                    data: filterType == 'Amount'? menuGroupAmount : menuGroupCount,
                    des: filterType == 'Amount'? menuGroupOrderTypeAmount : menuGroupOrderTypeCount
                }
            }],
            versionsData = [],
            i,
            j,
            dataLen = data.length,
            drillDataLen,
            brightness;

        for (i = 0; i < dataLen; i += 1) {
            drillDataLen = data[i].drilldown.data.length;
            for (j = 0; j < drillDataLen; j += 1) {
                brightness = 0.2 - (j / drillDataLen) / 5;
                versionsData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    des: data[i].drilldown.des[j],
                    color: Highcharts.Color(colors[j]).brighten(brightness).get()
                });
            }
        }

        // Create the chart
        $('#category-general-chart').highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: ''
            },
            plotOptions: {
                pie: {
                    shadow: false,
                    center: ['50%', '50%'],
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: 'right',
                verticalAlign: 'middle',
                layout: 'vertical'
            },
            tooltip: {
                headerFormat: '<b>{point.key}</b><br>',
                pointFormat: '<b>{series.name}:{point.y}</b><br>{point.des}',
                valueSuffix: filterType == 'Amount'? ' dollars' : ''
            },
            series: [{
                name: filterType == 'Amount'? 'Amount' : 'Quantity',
                data: versionsData,
                size: '100%',
                innerSize: '60%',
                id: 'versions'
            }]
        });
    }

    $scope.generateTopTenItems = function(topTenItems, filterType) {

        var itemNames = [];
        var itemCounts = [];
        var itemAmounts = [];
        angular.forEach(topTenItems, function(value, key) {
            itemNames.push(value.itemName);
            itemCounts.push(value.count);
            itemAmounts.push($filter('number')(value.amount, 2).replace(',', '') * 1);
        })

        $('#category-top-ten-chart').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: itemNames,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: filterType == 'Amount'? 'Amount ($)' : 'Quantity',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: filterType == 'Amount'? ' dollars' : ''
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                },
                series: {
                    dataLabels: {
                        allowOverlap: true
                    }
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [{
                name: filterType == 'Amount'? 'Amount' : 'Quantity',
                data: filterType == 'Amount'? itemAmounts : itemCounts
            }]
        });
    }

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

    $scope.listOrderType = function() {
        var response = $http.get(getOrderTypeListUrl);

        response.success(function(data, status, headers, config) {
            $scope.orderTypeList = data.orderTypeSettingList;

            $('#orderType').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#orderType').selectpicker('refresh');}, 50);
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };

    $scope.listStaffType = function() {
        var response = $http.get(getStaffTypeUrl);

        response.success(function(data, status, headers, config) {
            $scope.staffList = data.staffMemberList;

            $('#staffType').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#staffType').selectpicker('refresh');}, 50);
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };



    $scope.listMenu = function() {
        var response = $http.get(getMenuListUrl,{
            params: {
                "showInactive":false,
                "showDeleted":false
            }
        });

        response.success(function(data, status, headers, config) {
            //var jsonObj = JSON.parse(data);
            $scope.menuList = data.menus;

            $scope.inactiveMenus = [];
            $scope.activeMenus = [];


            angular.forEach(data.menus, function(data) {
                var isPushed = false;
                if ("fieldDisplayNameGroups" in data) {
                    angular.forEach(data.fieldDisplayNameGroups, function(fieldDisplayValue, fieldDisplayKey) {
                        if (!isPushed) {
                            if (fieldDisplayValue.fieldName == 'name') {
                                angular.forEach(fieldDisplayValue.fieldDisplayNames, function (displayNameValue, displayNameKey) {
                                    if (biscuit.l() == displayNameValue.languageCode) {
                                        if (!util.isNullOrEmpty(displayNameValue.name)) {

                                            data.name = displayNameValue.name;
                                            if (data.productLine == null || angular.equals("", data.productLine)) {
                                                $scope.inactiveMenus.push(data);
                                            } else if (data.deleted) {
                                                $scope.inactiveMenus.push(data);
                                            } else {
                                                $scope.activeMenus.push(data);
                                            }
                                            isPushed = true;
                                        }
                                    }
                                });
                            }
                        }
                    });

                }

                if (!isPushed) {
                    if (data.productLine==null||angular.equals("", data.productLine)) {
                        $scope.inactiveMenus.push(data);
                    } else if (data.deleted) {
                        $scope.inactiveMenus.push(data);
                    } else {
                        $scope.activeMenus.push(data);
                    }
                };


            })
            $('#menuType').selectpicker({
                actionsBox: true,
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#menuType').selectpicker('refresh');}, 50);

            $('#menuGroupType').selectpicker({
                actionsBox: true,
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#menuGroupType').selectpicker('refresh');}, 50);

            $('#menuCategoryType').selectpicker({
                actionsBox: true,
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$('#menuCategoryType').selectpicker('refresh');}, 50);
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    }


    $scope.populateGroupBasedOnMenu = function() {
        $scope.menuGroupList = [];
        if (!util.isNullOrEmpty($('#menuType').val())) {
            var response = $http.get(getMenuUrl + $('#menuType').val() + "?expandMenuLevel=1");

            response.success(function(data, status, headers, config) {
                //var jsonObj = JSON.parse(data);
                //$scope.menuGroups = data.menu.menuGroups;

                angular.forEach(data.menu.menuGroups, function(data) {

                    if (!data.systemGenerated) {
                        var isPushed = false;

                        angular.forEach(data.fieldDisplayNameGroups, function(fieldDisplayValue, fieldDisplayKey) {
                            if (!isPushed) {
                                if (fieldDisplayValue.fieldName == 'name') {
                                    angular.forEach(fieldDisplayValue.fieldDisplayNames, function (displayNameValue, displayNameKey) {
                                        if (biscuit.l() == displayNameValue.languageCode) {
                                            if (!util.isNullOrEmpty(displayNameValue.name)) {
                                                $scope.menuGroupList.push({
                                                    'name': displayNameValue.name,
                                                    'id': data.id
                                                });

                                                isPushed = true;
                                            }
                                        }
                                    })
                                }
                            }

                        })

                        if (!isPushed) {
                            $scope.menuGroupList.push({
                                'name': data.name,
                                'id': data.id
                            });
                        }
                    }
                })
            });

            response.error(function(data, status, headers, config){
                console.log("Data:" + data + " " + "Status:" + status);
            });
        }

        setTimeout(function() {$('#menuGroupType').selectpicker('refresh');}, 50);

        $scope.menuCategoryList = [];
        setTimeout(function() {$('#menuCategoryType').selectpicker('refresh');}, 50);

        $scope.categoryReport.menuGroup = null;
        $scope.categoryReport.category = null;
        $('#menuGroupType').val('');
        $('#menuCategoryType').val('');
        $scope.manipulateData();
    }

    $scope.populateCategoryBasedOnGroup = function() {
        $scope.menuCategoryList = [];
        if (!util.isNullOrEmpty($('#menuGroupType').val())) {
            var response = $http.get(getMenuGroupUrl + $('#menuGroupType').val() + "?expandMenuLevel=1");

            response.success(function(data, status, headers, config) {
                $scope.menuCategories = data.group.menuCategories;

                angular.forEach($scope.menuCategories, function(data) {

                    var isPushed = false;
                    angular.forEach(data.fieldDisplayNameGroups, function(fieldDisplayValue, fieldDisplayKey) {
                        if (!isPushed) {
                            if (fieldDisplayValue.fieldName == 'name') {
                                angular.forEach(fieldDisplayValue.fieldDisplayNames, function(displayNameValue, displayNameKey) {
                                    if (biscuit.l() == displayNameValue.languageCode) {
                                        if (!util.isNullOrEmpty(displayNameValue.name)) {
                                            $scope.menuCategoryList.push({
                                                'name' : displayNameValue.name,
                                                'id' : data.id
                                            });

                                            isPushed = true;};
                                    }
                                })
                            }
                        }
                    })

                    if (!isPushed) {
                        $scope.menuCategoryList.push({
                            'name' : data.name,
                            'id' : data.id
                        });
                    };
                });
            });

            response.error(function(data, status, headers, config){
                console.log("Data:" + data + " " + "Status:" + status);
            });
        }
        setTimeout(function() {$('#menuCategoryType').selectpicker('refresh');}, 50);

        $('#menuCategoryType').val('');
        $scope.categoryReport.category = null;

        $scope.manipulateData();
    }

    $scope.openReportPreview = function(isPrint, isExport) {
        $scope.listAvailablePrinters();
        $scope.submitReportPreview(false, false);
    }

    $scope.submitReportPreview = function(isPrint, isExport, printerName, exportType) {
        /*if($('#isPersonalReport').val() === 'true') {
            $('#staffs-select-choice').val(baseReportObj.userIdToStaffIdMapping[baseReportObj.currentUser.userid]);
        }*/
        setFormActionUrl('categoryform', '/kpos/webapp/report/categoryItemReport');
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val();
        var toDate = $('#toDate').val();
        $('#previewFrom').val(fromDate);
        $('#previewTo').val(toDate);
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#printerName').val(printerName);
        $('#exportFileName').val(exportType);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());


        $('#userId').val($('#staffType').val());
        $('#orderTypes').val($('#orderType').val());
        $('#combineSub').val($('#combineSubItem').bootstrapSwitch('state'));
        $('#combineReport').val($('#combineReportItem').bootstrapSwitch('state'));
        document.categoryform.submit();
    };

    $scope.renderFinish = function(selectId){
        $('#' + selectId).val("");
        setTimeout(function() {$('#' + selectId).selectpicker('refresh');}, 50);
    }

    $scope.init();
}]);

reportApp.directive('repeatFinish',function(){
    return {
        link: function(scope,element,attr){
            if(scope.$last == true){
                scope.$eval(attr.repeatFinish);
            }
        }
    }
})

angular.module('reportApp').controller('OrderAmountRoundingDetailController', ['$scope', '$http', function($scope, $http) {

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
        var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
        var toDate = $('#toDate').val() + 'T' + restaurantHour;
        $('#fromDateToSubmit').val(fromDate);
        $('#toDateToSubmit').val(toDate);
        setFormActionUrl('orderamountroundingform', '/kpos/webapp/report/orderAmountRoundingReport');
        $('#printReport').val(isPrint);
        $('#exportReport').val(isExport);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        document.voidorderform.submit();
    };

    $scope.init();
}]);

angular.module('reportApp').controller('AuditController', ['$scope', '$http', '$q', 'ngTableParams', function($scope, $http, $q, ngTableParams) {
    var today = getCurrentDate(getRestaurantHour());
    $('#fromDate').datetimepicker({
        defaultDate: today,
        format: 'YYYY-MM-DD',
    });

    var tommorrow = getCurrentDate(getRestaurantHour());
    tommorrow.setDate(tommorrow.getDate() + 1);
    $('#toDate').datetimepicker({
        defaultDate: tommorrow,
        format: 'YYYY-MM-DD',
    });

    $scope.tableParams;
    $scope.init = function() {
        $scope.generateAuditLogs();

        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }
    };

    $scope.generateAuditLogs = function() {

        var soapBody = "<app:FindAuditLogType><app:from>" + $('#fromDate').val() + "</app:from><app:to>" + $('#toDate').val() + "</app:to></app:FindAuditLogType>";
        var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);

        response.success(function(data, status, headers, config){
            var jsonObj = xml2Json(data);
            if (jsonObj.FindAuditLogResponseType.Result.successful == 'true') {
                $scope.auditList = jsonObj.FindAuditLogResponseType.AuditLogReport;
                $scope.tableParams = new ngTableParams({}, {dataset: jsonObj.FindAuditLogResponseType.AuditLogReport});
            } else {
                console.log("Data:" + data + " Status:" + status);
            }
        })

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " Status:" + status);
        });
    };

    $scope.displayNameFilter = function() {
        var def = $q.defer(),
            arr = [],
            names = [];

        $scope.auditList = "",
            $scope.$watch('auditList', function() {
                angular.forEach($scope.auditList, function(log){
                    if (log.displayName != null) {
                        if ($scope.inArray(log.displayName, arr) === -1) {
                            arr.push(log.displayName);
                            names.push({
                                'id': log.displayName,
                                'title': log.displayName
                            });
                        }
                    }
                })
            })

        def.resolve(names);
        return def;
    };

    $scope.byFilter = function() {
        var def = $q.defer(),
            arr = [],
            names = [];

        $scope.auditList = "",
            $scope.$watch('auditList', function() {
                angular.forEach($scope.auditList, function(log){
                    if (log.updateBy != null) {
                        if ($scope.inArray(log.updateBy, arr) === -1) {
                            arr.push(log.updateBy);
                            names.push({
                                'id': log.updateBy,
                                'title': log.updateBy
                            });
                        }
                    }
                })
            })

        def.resolve(names);
        return def;
    }

    $scope.authorizedByFilter = function() {
        var def = $q.defer(),
            arr = [],
            names = [];

        $scope.auditList = "",
            $scope.$watch('auditList', function() {
                angular.forEach($scope.auditList, function(log){
                    if (log.authorizedBy != null) {
                        if ($scope.inArray(log.authorizedBy, arr) === -1) {
                            arr.push(log.authorizedBy);
                            names.push({
                                'id': log.authorizedBy,
                                'title': log.authorizedBy
                            });
                        }
                    }
                })
            })

        def.resolve(names);
        return def;
    }

    $scope.deviceFilter = function() {
        var def = $q.defer(),
            arr = [],
            names = [];

        $scope.auditList = "",
            $scope.$watch('auditList', function() {
                angular.forEach($scope.auditList, function(log){
                    if (log.deviceName != null) {
                        if ($scope.inArray(log.deviceName, arr) === -1) {
                            arr.push(log.deviceName);
                            names.push({
                                'id': log.deviceName,
                                'title': log.deviceName
                            });
                        }
                    }
                })
            })

        def.resolve(names);
        return def;
    }

    $scope.inArray = function (val, arr) {
        return arr.indexOf(val)
    }

    $scope.getSystemLanguageDisplayVal = function(id, defaultDisplayVal) {
        var lang = biscuit.l();
        return getDataDisplayValueByElementId(id, lang, defaultDisplayVal);
    }

    $scope.init();

}]);

angular.module('reportApp').controller('SystemSettingAuditController', ['$scope', '$http', '$q', 'ngTableParams', function($scope, $http, $q, ngTableParams) {
    var today = getCurrentDate(getRestaurantHour());
    $('#fromDate').datetimepicker({
        defaultDate: today,
        format: 'YYYY-MM-DD',
    });

    var tommorrow = getCurrentDate(getRestaurantHour());
    tommorrow.setDate(tommorrow.getDate() + 1);
    $('#toDate').datetimepicker({
        defaultDate: tommorrow,
        format: 'YYYY-MM-DD',
    });

    $scope.tableParams;
    $scope.init = function() {
        $scope.generateSystemSettingAuditLogs();

        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }
    };

    $scope.generateSystemSettingAuditLogs = function() {
        var soapBody = "<app:FindAuditLogType><app:from>" + $('#fromDate').val() + "</app:from><app:to>" + $('#toDate').val() + "</app:to><app:logType>SYSTEM_SETTING</app:logType></app:FindAuditLogType>";
        var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);

        response.success(function(data, status, headers, config){
            var jsonObj = xml2Json(data);
            if (jsonObj.FindAuditLogResponseType.Result.successful == 'true') {
                if (jsonObj.FindAuditLogResponseType.AuditLogReport instanceof Array) {
                    $scope.systemSettingAuditList = jsonObj.FindAuditLogResponseType.AuditLogReport;
                } else {
                    $scope.systemSettingAuditList = [jsonObj.FindAuditLogResponseType.AuditLogReport];
                }
                $scope.tableParams = new ngTableParams({}, {dataset: $scope.systemSettingAuditList});
            } else {
                console.log("Data:" + data + " Status:" + status);
            }
        })

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " Status:" + status);
        });
    };

    $scope.settingGroupFilter = function() {
        var def = $q.defer(),
            arr = [],
            names = [];

        $scope.systemSettingAuditList = "",
            $scope.$watch('systemSettingAuditList', function() {
                angular.forEach($scope.systemSettingAuditList, function(log){
                    if (log.settingGroup != null) {
                        if ($scope.inArray(log.settingGroup, arr) === -1) {
                            arr.push(log.settingGroup);
                            names.push({
                                'id': log.settingGroup,
                                'title': log.settingGroup
                            });
                        }
                    }
                })
            })

        def.resolve(names);
        return def;
    }

    $scope.byFilter = function() {
        var def = $q.defer(),
            arr = [],
            names = [];

        $scope.systemSettingAuditList = "",
            $scope.$watch('systemSettingAuditList', function() {
                angular.forEach($scope.systemSettingAuditList, function(log){
                    if (log.updateBy != null) {
                        if ($scope.inArray(log.updateBy, arr) === -1) {
                            arr.push(log.updateBy);
                            names.push({
                                'id': log.updateBy,
                                'title': log.updateBy
                            });
                        }
                    }
                })
            })

        def.resolve(names);
        return def;
    }

    $scope.categoryFilter = function() {
        var def = $q.defer(),
            arr = [],
            names = [];

        $scope.systemSettingAuditList = "",
            $scope.$watch('systemSettingAuditList', function() {
                angular.forEach($scope.systemSettingAuditList, function(log){
                    if (log.category != null) {
                        if ($scope.inArray(log.category, arr) === -1) {
                            arr.push(log.category);
                            names.push({
                                'id': log.category,
                                'title': log.category
                            });
                        }
                    }
                })
            })

        def.resolve(names);
        return def;
    }

    $scope.inArray = function (val, arr) {
        return arr.indexOf(val)
    }

    $scope.getSystemLanguageDisplayVal = function(id, defaultDisplayVal) {
        var lang = biscuit.l();
        return getDataDisplayValueByElementId(id, lang, defaultDisplayVal);
    }

    $scope.init();

}]);