angular.module('reportApp').controller('DailyController', ['$scope', '$http', 'ngTableParams', '$filter',
	function($scope, $http, ngTableParams, $filter) {

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

        var lang = biscuitf.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }

        if (biscuitf.m() != 'lite') {
            $scope.isShowGiftAndLoyalty = true;
        } else {
            $scope.isHideGiftAndLoyalty = false;
        }
	}

	$scope.dailyInfo = function() {
		$('#daily-alert-sign').hide();
		$('#daily-loading-page').show();
		var restaurantHour = getRestaurantHour();
		var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
		var toDate = $('#toDate').val() + 'T' + restaurantHour;

		var newReportForm = {
			from : fromDate,
			to : toDate,
			merchantIds: $scope.$parent.currentMerchantIds,
			operationHour: getRestaurantHourInDecimalFormat()
		}

        var response = $http.post(getServerUrl() + "/kpos/webapp/report/daily", newReportForm);

        response.success(function(data, status, headers, config) {
            $scope.generateBarGraph(response.$$state.value.data.dailySummaryMapByDate);
            $scope.tableParams = new ngTableParams({}, {dataset: response.$$state.value.data.dailySummaryMapByDate});
            $('#daily-loading-page').hide();  
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
            $('#daily-loading-page').hide();  
        });
              
	};

	$scope.generateBarGraph = function(dailySummaryMap) {
		var wholeBarGraphData = [];
		angular.forEach(dailySummaryMap, function(value, key) {
			var barGraphData = {
				name : value.orderDate,
				y : value.grandTotal
			}
			wholeBarGraphData.push(barGraphData);
		}) 

		$('#daily-sales-bar-graph').highcharts({
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
	                text: 'Amount($)'
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
	                    format: '${point.y:.2f}',
	                    allowOverlap: true
	                }
	            }
	        },

	        tooltip: {
	            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
	            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:.2f}</b><br/>'
	        },

	        series: [{
	            name: 'Daily Total',
	            colorByPoint: true,
	            data: wholeBarGraphData
	        }]
	    });
	}

	$scope.submitReportPreview = function(printReport, exportReport, printerName, exportType) {
		var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
		var toDate = $('#toDate').val() + 'T' + restaurantHour;
        setFormActionUrl('dailyform', '/kpos/webapp/report/voidDiscountChargeReport');
        $('#previewFrom').val(fromDate);
        $('#previewTo').val(toDate);
        $('#printReport').val(printReport);
        $('#exportReport').val(exportReport);
        $('#printerName').val(printerName);
        $('#exportFileName').val(exportType);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.dailyform.submit();

        $scope.listAvailablePrinters();
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
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };
	$scope.init();
}]);

angular.module('reportApp').controller('HourlyController', ['$scope', '$http', 'ngTableParams', '$filter', 
	function($scope, $http, ngTableParams, $filter) {

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

	$scope.hourlyInfo = function() {
		$('#hourly-alert-sign').hide();
		$('#hourly-loading-page').show();
		var restaurantHour = getRestaurantHour();
		var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
		var toDate = $('#toDate').val() + 'T' + restaurantHour;

		var newReportForm = {
			from : fromDate,
			to : toDate,
			merchantIds: $scope.$parent.currentMerchantIds,
			operationHour: getRestaurantHourInDecimalFormat()
		}

        var response = $http.post("http://" + location.host + "/kpos/webapp/report/hourly", newReportForm);

        response.success(function(data, status, headers, config) {
            $scope.tableParams = new ngTableParams({}, {dataset: response.$$state.value.data.dailySummary});
            $scope.numOfSeat = response.$$state.value.data.numOfSeat;
            $scope.generateHeatMap(response.$$state.value.data.dailySummary);
            $('#hourly-loading-page').hide(); 
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
            $('#hourly-loading-page').hide(); 
        });       
	};

	$scope.generateHeatMap = function(dailySummary) {
        var yAxis = [];
        var dataSet = [];
        var y = 0;
        angular.forEach(dailySummary, function(value, key) {
            angular.forEach(value.hourlySaleMap, function(innerValue, innerKey) {
                var realData = [];
                if (innerValue.name * 1 >= getRestaurantHourInDecimalFormat()) {//the date here just use for 24 hour format only
                    realData = [moment('2017-06-15').add(innerValue.name * 1, 'h').valueOf(), y, $filter('number')(innerValue.total, 2).replace(',', '') * 1];
                } else {
                    realData = [moment('2017-06-16').add(innerValue.name * 1, 'h').valueOf(), y, $filter('number')(innerValue.total, 2).replace(',', '') * 1];
                }
                dataSet.push(realData)
            })
            y++;
            yAxis.push(value.orderDate);
        })


        $('#hourly-sales-heat-graph').highcharts({
            chart: {
                type: 'heatmap',
                marginTop: 40,
                marginBottom: 80,
                plotBorderWidth: 1
            },

            title: {
                text: ''
            },

            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                   day: '%H'
                },
                tickInterval:3600 * 1000,
                startOnTick: true
            },

            yAxis: [{
                categories: yAxis,
                title: null
            }, {
                title: {
                    text: 'Amount ($)'
                },
                opposite: true
            }],

            colorAxis: {
                min: 0,
                minColor: '#FFFFFF',
                maxColor: Highcharts.getOptions().colors[0]
            },

            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },

            tooltip: {
                formatter: function () {
                    return 'At <b>' + moment(this.point.x).format("HH:mm") + '</b> sold <br><b>$' +
                        this.point.value + '</b> worth of items<br><b>';
                }
            },

            series: [{
                colsize: 3600000,
                borderWidth: 1,
                data: dataSet,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    allowOverlap: true
                }
            }]

        });
    };
	
	$scope.submitReportPreview = function(printReport, exportReport, printerName, exportType) {
		var restaurantHour = getRestaurantHour();
        var fromDate = $('#fromDate').val() + 'T' + restaurantHour;
		var toDate = $('#toDate').val() + 'T' + restaurantHour;
        setFormActionUrl('hourlyform', '/kpos/webapp/report/hourlyReport');
        $('#previewFrom').val(fromDate);
        $('#previewTo').val(toDate);
        $('#printReport').val(printReport);
        $('#exportReport').val(exportReport);
        $('#printerName').val(printerName);
        $('#exportFileName').val(exportType);
        $('#reportLanguage').val(biscuit.l());
        $('#appInstanceName').val(biscuit.c());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());
        document.hourlyform.submit();

        $scope.listAvailablePrinters();
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
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };
	$scope.init();
}]);