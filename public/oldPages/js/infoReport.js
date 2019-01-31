var reportMainPage = angular.module('reportApp',['ngRoute'])

reportMainPage.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'saleReport.html',
            controller: 'saleReportController'
        })
        .when('/salary', {
            templateUrl: 'salaryReport.html',
            controller: 'salaryReportController'
        })
        .otherwise({
            redirectTo: '/'
        });
});

reportMainPage.controller('saleReportController', ['$scope', '$http', function($scope, $http) {
    $scope.sortType1 = 'name';
    $scope.sortType2 = 'categoryName';
    $scope.sortReverseTable1 = false;
    $scope.sortReverseTable2 = false;

    $scope.sortTable1 = function(sortType1) {
        $scope.sortType1 = sortType1;
        $scope.sortReverseTable1 = !$scope.sortReverseTable1;
    };

    $scope.sortTable2 = function(sortType2) {
        $scope.sortType2 = sortType2;
        $scope.sortReverseTable2 = !$scope.sortReverseTable2;
    };


    var now = new Date();
    var oneDateAfterNow = new Date();
    oneDateAfterNow.setDate(now.getDate() + 1);

    $scope.menuGroupList = [];
    $scope.allCategoryList = [];
    $scope.categoryList = [];
    $scope.saleItemList = [];

    $scope.tempChartData = [];
    $scope.tempAllCategoryData = [];
    $scope.tempTableData = [];

    $scope.staffList = [];

    $scope.saleReportFilter = {
        fromDate: now,
        toDate: oneDateAfterNow,
        menuGroup: null,
        categories: null,
        saleItems: null
    };

    $scope.init = function() {
        $scope.listMenuGroup();
        $scope.listAllCategory();
        $scope.listGroupCategoryItems();
    };

    $scope.generateCategoryList = function(menuGroup) {
        $scope.categoryList = [];
        if (menuGroup != null) {
            for (var i = 0; i < $scope.allCategoryList.length; i++) {
                if (menuGroup == $scope.allCategoryList[i].groupid){
                    $scope.categoryList.push($scope.allCategoryList[i]);
                }
            }
        }
    };

    $scope.generateSaleItemList = function(category) {
        if (category != null) {
            $scope.listSaleItemsForCategory(category);
        } else {
            $scope.saleItemList = [];
        }
    };

    $scope.listMenuGroup = function() {
        var soapType = new ListCategoryGroupType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listcategorygroupresponsetype)) {
                $scope.menuGroupList = util.getElementsArray(jsonObj.listcategorygroupresponsetype.catgroup);
            } else {
                console.log("Error getting menu group list");
            }
        });
    };

    $scope.listAllCategory = function(menuGroup) {
        var soapType = new ListCategoriesType(menuGroup);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listcategoryresponsetype)) {
                $scope.allCategoryList = util.getElementsArray(jsonObj.listcategoryresponsetype.categories);
            } else {
                console.log("Error getting category list");
            }
        });
    };

    $scope.listSaleItemsForCategory = function(category) {
        var soapType = new ListSaleItemsForCategoryType(category);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsaleitemsforcategoryresponsetype)) {
                $scope.saleItemList = util.getElementsArray(jsonObj.listsaleitemsforcategoryresponsetype.saleitems);
                $scope.$apply();
            } else {
                console.log("Error getting sale item list");
            }
        });
    };

    $scope.listGroupCategoryItems = function() {
        if (angular.isDate($scope.saleReportFilter.fromDate)) {
            var fromDate = baseReportObj.parseReportDate($scope.saleReportFilter.fromDate);
        }
        if (angular.isDate($scope.saleReportFilter.toDate)) {
            var toDate = baseReportObj.parseReportDate($scope.saleReportFilter.toDate);
        }
        var groupCategoryItemData = {
            from : fromDate,
            to : toDate,
            menuGroupId : $scope.saleReportFilter.menuGroup,
            categoryId : $scope.saleReportFilter.categories,
            saleItemId : $scope.saleReportFilter.saleItems
        };

        var response = $http.post("/kpos/webapp/report/groupCategoryItems", groupCategoryItemData);
        response.success(function(data, status, headers, config) {
            $scope.tempChartData = util.getElementsArray(data);
            $scope.organizeChartData(data, null);
            $scope.generateAllStaffCategoryTable();
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };

    $scope.organizeChartData = function(data, type) {
        if ($scope.chartType == "pie") {
            var chartData = [];
            if (type == null) {
                for (var i = 0; i < data.length; i++) {
                    chartData.push([data[i].name, data[i].totalAmount]);
                }
            } else if (type == "quantity") {
                for (var i = 0; i < $scope.tempChartData.length; i++) {
                    chartData.push([$scope.tempChartData[i].name, $scope.tempChartData[i].count]);
                }
            } else if (type == "price") {
                for (var i = 0; i < $scope.tempChartData.length; i++) {
                    chartData.push([$scope.tempChartData[i].name, $scope.tempChartData[i].totalAmount]);
                }
            }
            $scope.generatePieChart(chartData);
        } else if ($scope.chartType == "bar") {
            var employeeName = [];
            var saleRecord = [];
            if (type == null) {
                for (var i = 0; i < data.length; i++) {
                    employeeName.push(data[i].name);
                    saleRecord.push(data[i].totalAmount);
                }
            } else if (type == "quantity") {
                for (var i = 0; i < $scope.tempChartData.length; i++) {
                    employeeName.push($scope.tempChartData[i].name);
                    saleRecord.push($scope.tempChartData[i].count);
                }
            } else if (type == "price") {
                for (var i = 0; i < $scope.tempChartData.length; i++) {
                    employeeName.push($scope.tempChartData[i].name);
                    saleRecord.push($scope.tempChartData[i].totalAmount);
                }
            }
            $scope.generateBarChart(employeeName, saleRecord);
        }
    };

    $scope.generateAllStaffCategoryTable = function() {
        $scope.tempAllCategoryData = [];
        if (angular.isDate($scope.saleReportFilter.fromDate)) {
            var fromDate = baseReportObj.parseReportDate($scope.saleReportFilter.fromDate);
        }
        if (angular.isDate($scope.saleReportFilter.toDate)) {
            var toDate = baseReportObj.parseReportDate($scope.saleReportFilter.toDate);
        }
        var groupCategoryItemData = {
            from : fromDate,
            to : toDate
        };

        var response = $http.post("/kpos/webapp/report/saleReportCategoryTable", groupCategoryItemData);
        response.success(function(data, status, headers, config) {
            $scope.staffList = [];
            $scope.tempAllCategoryData = util.getElementsArray(data);

            for (var i = 0; i < data.length; i++) {
                $scope.staffList.push(data[i].menuGroup);
            }
            if ($scope.staffList != null){
                $scope.staffMember = $scope.staffList[0];
                $scope.organizeStaffCategoryData($scope.staffList[0]);
            }
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };

    $scope.organizeStaffCategoryData = function(staff) {
        $scope.tempTableData = [];
        for (var i = 0; i < $scope.tempAllCategoryData.length; i++) {
            if (staff == $scope.tempAllCategoryData[i].menuGroup) {
                $scope.tempTableData = $scope.tempAllCategoryData[i].categoryList;
            }
        }
    };

    $scope.generatePieChart = function(chartData) {
        angular.element($('#sale-report-chart')).highcharts({
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },
            title: {
                text: 'Sale Between Employee'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }
            },
            series: [{
                name : 'Percentage',
                data : chartData}]
        });
    };

    $scope.generateBarChart = function(employeeName, saleRecord) {
        angular.element($('#sale-report-chart')).highcharts({
            chart: {
                type: 'column',
                margin: 75,
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 25,
                    depth: 70
                }
            },
            title: {
                text: 'Sale Between Employee'
            },
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            xAxis: {
                categories: employeeName
            },
            yAxis: {
                title: {
                    text: null
                }
            },
            series: [{
                name: 'Sales',
                data: saleRecord
            }]
        });
    };

    $scope.init();
}]);

reportMainPage.controller('salaryReportController', ['$scope', '$http', function($scope, $http) {
    var pieChartData = [];

    var now = new Date();
    var oneDateAfterNow = new Date();
    oneDateAfterNow.setDate(now.getDate() + 1);

    $scope.paidTotal = 0;
    $scope.staffList = [];
    $scope.roleList = [];
    $scope.salaryDetailInfo = [];
    $scope.paymentDetailInfo = [];
    $scope.creditPaymentDetailInfo = [];

    $scope.init = function() {
        $scope.listStaffSummary();
        $scope.listRoleSummary();
        $scope.listSalaryDetailInfo();
        angular.element($('#salaryReport-staffList-operation')).hide();
        angular.element($('#salaryReport-roleList-operation')).hide();
        $scope.removeWarning();
    };

    $scope.salaryReportFilter = {
        fromDate: now,
        toDate: oneDateAfterNow,
        comparisonType: null,
        all: null,
        staff: null,
        role: null
    };

    $scope.listStaffSummary = function() {
        var soapType = new ListStaffType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.liststaffresponsetype)) {
                $scope.staffList = util.getElementsArray(jsonObj.liststaffresponsetype.staff);
            } else {
                console.log("Error getting staff list");
            }
        });
    };

    $scope.listRoleSummary = function() {
        var soapType = new ListRolesType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listrolesresponsetype)) {
                $scope.roleList = util.getElementsArray(jsonObj.listrolesresponsetype.roles);
            } else {
                console.log("Error getting role list")
            }
        });
    };

    $scope.generateSelectOptionList = function() {
        $scope.clearSelection();
        if ($scope.salaryReportFilter.comparisonType.indexOf("Employee vs Role Total") == 0) {
            angular.element($('#salaryReport-staffList-operation')).show();
            angular.element($('#salaryReport-roleList-operation')).hide();
            angular.element($('#salaryReport-all-operation')).hide();
        } else {
            angular.element($('#salaryReport-staffList-operation')).hide();
            angular.element($('#salaryReport-roleList-operation')).hide();
            angular.element($('#salaryReport-all-operation')).show();
        }
    };

    $scope.clearSelection = function() {
        $scope.salaryReportFilter.all = null;
        $scope.salaryReportFilter.staff = null;
        $scope.salaryReportFilter.role = null;
        $scope.removeWarning();
    };

    $scope.removeWarning = function() {
        angular.element($('#alert-empty-employee')).hide();
    };

    $scope.listSalaryDetailInfo = function(getDetailData) {
        if (angular.isDate($scope.salaryReportFilter.fromDate)) {
            var fromDate = baseReportObj.parseReportDate($scope.salaryReportFilter.fromDate);
        }
        if (angular.isDate($scope.salaryReportFilter.toDate)) {
            var toDate = baseReportObj.parseReportDate($scope.salaryReportFilter.toDate);
        }
        if ($scope.salaryReportFilter.comparisonType != null && $scope.salaryReportFilter.comparisonType.indexOf("Employee vs Role Total") == 0 && $scope.salaryReportFilter.staff == null) {
            angular.element($('#alert-empty-employee')).show();
            return;
        }

        var dataToGenerateSalaryReport = {
            from : fromDate,
            to : toDate,
            type : $scope.salaryReportFilter.comparisonType,
            id : $scope.salaryReportFilter.staff
        }

        var response = $http.post("/kpos/webapp/report/salaryReportDetailInfo", dataToGenerateSalaryReport);

        response.success(function(data, status, headers, config) {
            $scope.paidTotal = 0;
            $scope.salaryDetailInfo = util.getElementsArray(data.salary);
            $scope.paymentDetailInfo = util.getElementsArray(data.paymentType);
            for (var i = 0; i < $scope.paymentDetailInfo.length; i++) {
                $scope.paidTotal = $scope.paidTotal + $scope.paymentDetailInfo[i].total;
            }
            $scope.creditPaymentDetailInfo = util.getElementsArray(data.cardType);
            $scope.modifyDataForChart($scope.salaryDetailInfo);
        });

        response.error(function(data, status, headers, config) {
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };

    $scope.modifyDataForChart = function(salaryDetailInfo) {
        pieChartData = [];
        for (var i = 0; i < salaryDetailInfo.length; i++) {
            pieChartData.push([salaryDetailInfo[i].name, salaryDetailInfo[i].salary]);
        }
        $scope.generateSalaryPieChart(pieChartData);
    };

    $scope.generateSalaryPieChart = function(pieChartData) {
        angular.element($('#salary-report-chart')).highcharts({
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },
            title: {
                text: ''
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }
            },
            series: [{
                name : 'Percentage',
                data : pieChartData}]
        });
    };
    $scope.init();
}]);