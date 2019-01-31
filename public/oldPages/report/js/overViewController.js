angular.module('reportApp').controller('OverViewController', ['$scope', '$http', 'ngTableParams', '$filter', 
    function($scope, $http, ngTableParams, $filter) {
    var hasConfig = getSystemConfigurationValue("SESSION_MODE");
    $scope.userFilterOptions = 'staff';
    $scope.menuGroup;
    $scope.orderType;
    $scope.paymentType;
    $scope.comparisonDateStr; //$scope.comparisonDateStr represents the same day in last week

    $('#fromDatePreview-div').datetimepicker({
        sideBySide: true,
    });

    $('#toDatePreview-div').datetimepicker({
        sideBySide: true,
    });

    $('#break-down').selectpicker({
        style: 'btn-info',
        width: 'fit'
    });

    $('#break-down').on('changed.bs.select', function(e) {
        if ($('#break-down').val() === "PAYMENT") {
            $scope.generateSalesBreakDownGraph($scope.paymentType);
        } else if ($('#break-down').val() === "ORDER") {
            $scope.generateSalesBreakDownGraph($scope.orderType);
        } else if ($('#break-down').val() === "MENU") {
            $scope.generateSalesBreakDownGraph($scope.menuGroup);
        };
    })

    $('#users-select-choice').on('changed.bs.select', function(e, clickedIndex) {
        if (!biscuitHelper.hasPermission(biscuit.u(), "TOTAL_REPORT") && biscuitHelper.hasPermission(biscuit.u(), "REPORT")) {
           setTimeout(function() {
               var clickedValue = $('#users-select-choice option').eq(clickedIndex).val();
               $('#users-select-choice').selectpicker('Deselect All');
               $('#users-select-choice').selectpicker('val', clickedValue);
               $('#users-select-choice').selectpicker('refresh');
           }, 50);
        }
    })

    $('#drivers-select-choice').on('changed.bs.select', function(e, clickedIndex) {
        if (!biscuitHelper.hasPermission(biscuit.u(), "TOTAL_REPORT") && biscuitHelper.hasPermission(biscuit.u(), "REPORT")) {
           setTimeout(function() {
               var clickedValue = $('#drivers-select-choice option').eq(clickedIndex).val();
               $('#drivers-select-choice').selectpicker('Deselect All');
               $('#drivers-select-choice').selectpicker('val', clickedValue);
               $('#drivers-select-choice').selectpicker('refresh');
           }, 50);
           
        }
    })

    $('#fromDate').datetimepicker({
    });

    $('#fromTime').datetimepicker({
    });

    $('#toTime').datetimepicker({
    });

    $('#orderType').selectpicker({
        actionsBox: true,
        style: 'btn-info',
        width: '100%'
    });

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    $("#combineReportItem").on('switchChange.bootstrapSwitch', function (e, data) {
        console.log(data);
        $scope.overviewInfo();
     });

    $scope.init = function() {
        renderOrderTypeSelectDiv();
        var currentUser = biscuitf.u();

        if (biscuitf.m() == 'lite') {
			$('#orderType').find('[value=GIFT_CARD]').remove();
			$('#orderType').find('[value=LOYALTY_CARD]').remove();
        }
        $('#orderType').selectpicker('refresh');

        if (biscuitHelper.hasPermission(currentUser, "TOTAL_REPORT")) {
            $('#personalReport').val(false);
        } else if (biscuitHelper.hasPermission(currentUser, "REPORT")) {
            $('#personalReport').val(false);
            $('#userIds').val(currentUser.userid);
            $('#users-select-choice').find('option:eq(0)').remove();
            $('#drivers-select-choice').find('option:eq(0)').remove();
        } else if (biscuitHelper.hasPermission(currentUser, "PERSONAL_REPORT")) {
            $('#personalReport').val(true);
            if (biscuitHelper.hasRole(currentUser, 'DRIVER') || biscuitHelper.hasRole(currentUser, 'DRIVER ROLE')) {
                $('#driverIds').val(currentUser.staffid);
            } else {
                $('#userIds').val(currentUser.userid);
            }
            $('#employee-name-tag').show();
            $('#staff-list-div').hide();
            $('#staffNameDisplay').html('Staff: ' + currentUser.info.name);
        }

        if (!biscuitHelper.hasPermission(biscuit.u(), 'VIEW_HISTORY_ORDERS')) {
            $('#fromDate').hide();
            $('#fromDate-icon').hide();
            $('#fromDatePreview-container-div').hide();
            $('#toDatePreview-container-div').hide();
        }

        var restaurantHour = getRestaurantHour();
        $('#fromDate').data("DateTimePicker").defaultDate(getCurrentDate(restaurantHour));
        $('#fromDate').data("DateTimePicker").format('YYYY-MM-DD');

        var stringToHour = convertStringToTime(restaurantHour, 'HH:mm') 
        $('#fromTime').data("DateTimePicker").defaultDate(stringToHour);
        $('#fromTime').data("DateTimePicker").format('HH:mm');

        $('#toTime').data("DateTimePicker").defaultDate(stringToHour);
        $('#toTime').data("DateTimePicker").format('HH:mm');


        var lang = biscuit.l();
        if (util.isValidVariable(lang)) {
            loadLanguageForPages(lang);
        } else {
            loadLanguageForPages("en");
        }

        $('#fromDate').on('dp.change', function(e){
            $scope.overviewInfo();
        })

        $('#fromTime').on('dp.hide', function(e){
            if ($('#toTime').val() !== null && $('#toTime').val() !== '') {
                $scope.overviewInfo();
            };
        })

        $('#toTime').on('dp.hide', function(e){
            if ($('#fromTime').val() !== null && $('#fromTime').val() !== '') {
                $scope.overviewInfo();
            };
        })

        $("#combineReportItem").bootstrapSwitch('disabled',false);
        $scope.overviewInfo();
    }

    $scope.overviewInfo = function() {
        var restaurantHour = getRestaurantHour();
        var todayString = $('#fromDate').val();
        var today = moment(todayString, 'YYYY-MM-DD');
        today.subtract(7, 'days');
        $scope.comparisonDateStr = today.format('YYYY-MM-DD');

        var dateTimeRange = $scope.getReportDateTimeRange(todayString);
        var todayFromTime =  dateTimeRange.from.format('YYYY-MM-DDTHH:mm');
        var todayToTime =  dateTimeRange.to.format('YYYY-MM-DDTHH:mm');

        var currentUser = biscuit.u();
        var userId;
        if (!biscuitHelper.hasPermission(currentUser, "TOTAL_REPORT")) {
            userId = biscuit.u().userid;
        }

        var newReportForm = {
            from : todayFromTime,
            to :  todayToTime,
            userId : userId,
            merchantIds: $scope.$parent.currentMerchantIds,
            combineReport : $('#combineReportItem').bootstrapSwitch('state'),
            operationHour: getRestaurantHourInDecimalFormat()
        }

        var response = $http.post(getServerUrl() + "/kpos/webapp/report/overview", newReportForm);
        response.success(function(data, status, headers, config) {
            $scope.grandTotal = response.$$state.value.data.grandTotal;
            $scope.orderAvg = response.$$state.value.data.subTotal / response.$$state.value.data.orderCount;
            $scope.tipTotal = response.$$state.value.data.tipsTotal;
            $scope.voidTotal = response.$$state.value.data.voidTotal;
            $scope.subtotal = response.$$state.value.data.subTotal;
            $scope.shareTip = response.$$state.value.data.shareTips;
            $scope.transactionFee = response.$$state.value.data.transactionFee;
            $scope.paidOutTotal = response.$$state.value.data.paidOutTotal;
            $scope.chargeTotal = response.$$state.value.data.chargeTotal;
            $scope.discountTotal = response.$$state.value.data.discountTotal;
            $scope.taxTotal = response.$$state.value.data.taxTotal;
            $scope.giftCardSales = response.$$state.value.data.giftCardSaleTotal;
            $scope.loyaltyCardSales = response.$$state.value.data.loyaltyCardSaleTotal;

            $scope.tipList = response.$$state.value.data.tipSummaryList;
            $scope.taxList = response.$$state.value.data.taxSummaryList;

            $scope.menuGroup = response.$$state.value.data.orderItemMapByMenuGroup;
            $scope.orderType = response.$$state.value.data.orderTypeSummaryList;
            $scope.paymentType = response.$$state.value.data.paymentSummaryList;
            $scope.paidTotal = response.$$state.value.data.paidTotal;
            $scope.numOfVoid = response.$$state.value.data.voidCount;
            $scope.numOfOrder = response.$$state.value.data.orderCount;
            $scope.expectedCash = response.$$state.value.data.expectedCashInDrawer;

            $scope.generateSalesBreakDownGraph($scope.paymentType);
            $scope.generateTimeTable(response.$$state.value.data.staffAttendanceMap);
            $scope.tableParams = new ngTableParams({}, {dataset: response.$$state.value.data.orderSummaryList});
            $scope.generateYesterdayOverviewInfo(response.$$state.value.data, restaurantHour);
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });        
    };

    $scope.generateSalesByPeriodGraph = function(todayHourlySalesMap, yesterdayHourlySalesMap) {

        var ONE_HOUR_IN_MILLISECONDS = 3600000;
        var fromDateStr = $('#fromDate').val();
        var fromTimeStr = $('#fromTime').val();

        var todayInterval = moment(fromDateStr + 'T' + fromTimeStr, 'YYYY-MM-DDTHH:mm');
        var todayInUTCWithoutMinutes = $scope.getNormalizedTimeInterval(todayInterval);
        var startingPointsForChartInMilliseconds = todayInUTCWithoutMinutes;

        var data1 = [];
        angular.forEach(todayHourlySalesMap, function(value, key) {
            if (todayInUTCWithoutMinutes > value.timeInMillisecond) {
                return;
            }
            while (todayInUTCWithoutMinutes !== value.timeInMillisecond) {
                data1.push(0);
                todayInUTCWithoutMinutes += ONE_HOUR_IN_MILLISECONDS;
            }
            data1.push(value.total);
            todayInUTCWithoutMinutes += ONE_HOUR_IN_MILLISECONDS;
        });

        var yesterdayInterval = moment($scope.comparisonDateStr + 'T' + fromTimeStr, 'YYYY-MM-DDTHH:mm');
        var yesterdayInUTCWithoutMinutes = $scope.getNormalizedTimeInterval(yesterdayInterval);

        var data2 = [];
        angular.forEach(yesterdayHourlySalesMap, function(value, key) {
            if (yesterdayInUTCWithoutMinutes > value.timeInMillisecond) {
                return;
            }
            while (yesterdayInUTCWithoutMinutes !== value.timeInMillisecond) {
                data2.push(0);
                yesterdayInUTCWithoutMinutes += ONE_HOUR_IN_MILLISECONDS;
            }
            data2.push(value.total);
            yesterdayInUTCWithoutMinutes += ONE_HOUR_IN_MILLISECONDS;
        });

        $('#hourly-sales-div').highcharts({
            chart: {
                type: 'area'
            },
            title: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                allowDecimals: false,
                labels: {
                    overflow: 'justify'
                },
                dateTimeLabelFormats: {
                    hour: '%H:%M'
                }
            },
            yAxis: {
                title: {
                    text: 'Amount'
                },
                labels: {
                    formatter: function () {
                        return '$' + this.value;
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name} {point.x:%H:%M}</b><br>',
                pointFormat: 'made $<b>{point.y:,.0f}</b> dollars'
            },
            plotOptions: {
                area: {
                    pointInterval: 3600000,
                    pointStart: startingPointsForChartInMilliseconds,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: [{
                name: fromDateStr,
                data: data1
            }, {
                name: $scope.comparisonDateStr,
                data: data2
            }]
        });
    }

    $scope.getNormalizedTimeInterval = function(date) {
        var dateInMillis = date.valueOf();
        var dateInMillisWithoutMinutes = dateInMillis - dateInMillis % 3600000;
        console.log("NormalizedTimeInterval: ", moment(dateInMillisWithoutMinutes).format());
        return dateInMillisWithoutMinutes;
    }

    $scope.generateSalesBreakDownGraph = function(breakDown) {
        var type = [];
        var breakDownGraphData = [];
        angular.forEach(breakDown, function(value, key) {
            if (biscuitf.m() == 'lite') {
                if (value.name != 'Gift Card' && value.name != 'Loyalty Card') {
                    var name;
                    if (value.name != null) {
                        name = value.name;
                    } else if (value.orderType != null) {
                        name = value.orderType;
                    }
                    type.push(name);

                    var total;
                    if (value.total != null) {
                        total = value.total;
                    } else if (value.amount != null) {
                        total = value.amount;
                    }
                    total = ($filter('number')(total, 2).replace(',', '')) * 1;

                    breakDownGraphData.push({
                        drilldown: {
                            categories: [name + " $" + total],
                            data: [total]
                        }
                    });
                }
            } else {
                var name;
                if (value.name != null) {
                    name = value.name;
                } else if (value.orderType != null) {
                    name = value.orderType;
                }
                type.push(name);

                var total;
                if (value.total != null) {
                    total = value.total;
                } else if (value.amount != null) {
                    total = value.amount;
                }
                total = ($filter('number')(total, 2).replace(',', '')) * 1;

                breakDownGraphData.push({
                    drilldown: {
                        categories: [name + " $" + total],
                        data: [total]
                    }
                });
            }
        }) 
        var colors = Highcharts.getOptions().colors,
            categories = type,
            data = breakDownGraphData,
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
                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
            }
        }

        // Create the chart
        $('#sales-break-down').highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: ''
            },
            plotOptions: {
                pie: {
                    shadow: false,
                    size: '100%',
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
                valuePrefix: '$'
            },
            series: [ {
                name: 'Amount',
                data: versionsData,
                size: '100%',
                innerSize: '60%',
                dataLabels: {
                    formatter: function () {
                        // display only if larger than 1
                        return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null;
                    }
                }
            }]
        });
    }

    $scope.generateTopSellingItemGraph = function(todaySalesItems, yesterdaySalesItems) {
        //move these data manipulation to it own method????
        todaySalesItems.sort(function(a,b) {
            return b.count - a.count;
        })

        $scope.topFiveItems = [];
        var topFiveItemsName = [];
        var topFiveItemsAmount = [];
        var yesterdaySameTopFiveItemsSales = [0, 0, 0, 0, 0];
        angular.forEach(todaySalesItems, function(value, key) {
            if (topFiveItemsName.length < 5) {
                $scope.topFiveItems.push(value);
                topFiveItemsName.push(value.name);
                topFiveItemsAmount.push($filter('number')(value.total, 2).replace(',', '') * 1);
            };
        })

        for (var i = 0; i <topFiveItemsName.length; i++) {
            angular.forEach(yesterdaySalesItems, function(value, key) {
                if (topFiveItemsName[i] === value.name) {
                    yesterdaySameTopFiveItemsSales[i] = $filter('number')(value.total, 2).replace(',', '') * 1;
                };
            })
        };

        $('#top-sales-bar-graph').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: topFiveItemsName,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Amount (dollars)',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' dollars'
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
                align: 'center',
                verticalAlign: 'top',
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [{
                name: $('#fromDate').val(),
                data: topFiveItemsAmount
            }, {
                name: $scope.comparisonDateStr,
                data: yesterdaySameTopFiveItemsSales
            }]
        });
    }

    $scope.generateTimeTable = function(staffAttendanceMap) {
        var staffNames = Object.keys(staffAttendanceMap);
        var timetable = new Timetable();
        var hourInDecimal = getRestaurantHourInDecimalFormat();
        timetable.setScope(hourInDecimal, hourInDecimal);
        timetable.addLocations(staffNames);
        angular.forEach(staffAttendanceMap, function(value, key) {
            angular.forEach(value, function(innerValue, innerKey) {
                var start;
                var end;
                angular.forEach(innerValue, function(mostInnerValue, mostInnerKey) {
                    if (mostInnerValue !== null) {
                        mostInnerValue = mostInnerValue.replace(" ", "T");
                        if (mostInnerKey === 'inTime') {
                            start = new Date(mostInnerValue);
                        } else {
                            if (mostInnerValue !== '') {
                                end = new Date(mostInnerValue);
                            } else {
                                end = new Date();
                            } 
                        };
                    };
                })
                timetable.addEvent('', key, new Date(start.getTime() + start.getTimezoneOffset() * 60000), 
                    new Date(end.getTime() + end.getTimezoneOffset() * 60000));
            }) 
        })
        var renderer = new Timetable.Renderer(timetable);
        renderer.draw('.timetable'); // any css selector
    }

    $scope.generateYesterdayOverviewInfo = function(todayOverviewInfo, restaurantHour) {
        var dateTimeRange = $scope.getReportDateTimeRange($scope.comparisonDateStr);
        var yesterdayFromTime =  dateTimeRange.from.format('YYYY-MM-DDTHH:mm');
        var yesterdayToTime =  dateTimeRange.to.format('YYYY-MM-DDTHH:mm');


        var currentUser = biscuit.u();
        var userId;
        if (!biscuitHelper.hasPermission(currentUser, "TOTAL_REPORT")) {
            userId = biscuit.u().userid;
        }

        var user = $('#userIds').val();

        var newReportForm = {
            from : yesterdayFromTime,
            to : yesterdayToTime,
            userId : userId,
            merchantIds: $scope.$parent.currentMerchantIds,
            combineReport : $('#combineReportItem').bootstrapSwitch('state'),
            operationHour: getRestaurantHourInDecimalFormat()
        }

        var yesterdayResponse = $http.post(getServerUrl() + "/kpos/webapp/report/overview", newReportForm);
        yesterdayResponse.success(function(data, status, headers, config) {
            $scope.totalSalesPercentage = $filter('number')((todayOverviewInfo.subTotal - 
                yesterdayResponse.$$state.value.data.subTotal) * 100 / yesterdayResponse.$$state.value.data.subTotal, 2) + '%';
            $scope.averageSalesPercentage = $filter('number')((todayOverviewInfo.subTotal / 
                todayOverviewInfo.orderCount - yesterdayResponse.$$state.value.data.subTotal / 
                yesterdayResponse.$$state.value.data.orderCount) * 100 / (yesterdayResponse.$$state.value.data.subTotal / 
                yesterdayResponse.$$state.value.data.orderCount), 2) + '%'
            $scope.totalTipPercentage = $filter('number')((todayOverviewInfo.tipsTotal - 
                yesterdayResponse.$$state.value.data.tipsTotal) * 100 / yesterdayResponse.$$state.value.data.tipsTotal, 2) + '%';
            $scope.voidTotalPercentage = $filter('number')((todayOverviewInfo.voidTotal - 
                yesterdayResponse.$$state.value.data.voidTotal) * 100 / yesterdayResponse.$$state.value.data.voidTotal, 2) + '%';
            $scope.generateTopSellingItemGraph(todayOverviewInfo.orderItemMapBySaleItem, yesterdayResponse.$$state.value.data.orderItemMapBySaleItem);
            $scope.generateSalesByPeriodGraph(todayOverviewInfo.hourlySaleMap, yesterdayResponse.$$state.value.data.hourlySaleMap, restaurantHour);  
        });

        yesterdayResponse.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    }

    $scope.getReportDateTimeRange = function(dateStr) {
        var startHours = $('#fromTime').val();
        var endHours = $('#toTime').val();

        var todayDateString = dateStr;
        var tomorrowDateString = moment(dateStr, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
        var todayFromTime = todayDateString + 'T' + startHours;
        var todayToTime = (startHours.localeCompare(endHours) < 0 ? todayDateString : tomorrowDateString) + 'T' + endHours;

        return {
            'from': moment(todayFromTime, 'YYYY-MM-DDTHH:mm'),
            'to': moment(todayToTime, 'YYYY-MM-DDTHH:mm')
        };
    };

    $scope.openReportPreview = function() {
        if (hasConfig != null && hasConfig) {
            var from = findOpenSessionStartTime();
            if (from != null) {
                $('#fromDatePreview').val(moment(from).format('MM/DD/YYYY hh:mm A'));
            } else {
                $('#fromDatePreview').val(moment(new Date()).format('MM/DD/YYYY hh:mm A'));
            }
            $('#toDatePreview').val(moment(new Date()).format('MM/DD/YYYY hh:mm A'));
        } else {
            var dateTimeRange = $scope.getReportDateTimeRange($('#fromDate').val());
            $('#fromDatePreview').val(dateTimeRange.from.format('MM/DD/YYYY hh:mm A'));
            $('#toDatePreview').val(dateTimeRange.to.format('MM/DD/YYYY hh:mm A'));
        }
        $scope.listAllStaffsType(false);
        $scope.listAvailablePrinters();
        $scope.listAllAreasType();
        $scope.listAllRestaurantHoursType();
        $scope.submitReportPreview(false, false, null, null, true);
    }

    $scope.submitReportPreview = function(printReport, exportReport, printerName, exportType, init) {
        var currentUser = biscuitf.u();
        var fromTime = moment($('#fromDatePreview').val(), 'MM/DD/YYYY hh:mm A').format('YYYY-MM-DDTHH:mm');
        var toTime = moment($('#toDatePreview').val(), 'MM/DD/YYYY hh:mm A').format('YYYY-MM-DDTHH:mm');

        setFormActionUrl('overviewform', '/kpos/webapp/report/totalsReport');
        $('#previewFrom').val(fromTime);
        $('#previewTo').val(toTime);
        $('#printReport').val(printReport);
        $('#exportReport').val(exportReport);
        $('#printerName').val(printerName);
        $('#exportFileName').val(exportType);

        if ($('#personalReport').val() === 'true') {
            $('#reportName').val('PersonalReport');
        } else {
            $('#reportName').val('TotalReport');
            if (!init) {
                // No need to change the userId during init process
                if ($scope.userFilterOptions == 'staff') {
                    if ($('#users-select-choice').val() == null) {
                        $('#userIds').val(0);
                    } else {
                        $('#userIds').val($('#users-select-choice').val());
                    }
                    $('#driverIds').val('');
                } else {
                    if ($('#drivers-select-choice').val() == null) {
                        $('#driverIds').val(0);
                    } else {
                        $('#driverIds').val($('#drivers-select-choice').val());
                    }
                    $('#userIds').val('');
                }
            } else if (biscuitHelper.hasPermission(currentUser, "TOTAL_REPORT")) {
                if ($scope.userFilterOptions == 'staff') {
                    $('#userIds').val(-1);
                    $('#driverIds').val('');
                } else {
                    $('#driverIds').val(-1);
                    $('#userIds').val('');
                }
            } else if (biscuitHelper.hasPermission(currentUser, "REPORT")) {
                if ($scope.userFilterOptions == 'staff') {
                    $('#userIds').val(currentUser.userid);
                    $('#driverIds').val('');
                } else {
                    if (biscuitHelper.hasRole(currentUser, 'DRIVER') || biscuitHelper.hasRole(currentUser, 'DRIVER ROLE')) {
                        $('#driverIds').val(currentUser.staffid);
                    } else {
                        $('#driverIds').val(0);
                    }
                    $('#userIds').val('');
                }
            }
        }

        $('#orderTypeData').val($('#orderType').val());
        $('#hourIdData').val($('#hours-select-choice').val());
        $('#areaIdData').val($('#areas-select-choice').val());

        if ($('#combineLinkedItem').is(':checked')) {
            $('#combineLinkedItemData').val(true);
        } else {
            $('#combineLinkedItemData').val(false);
        }
        if ($('#showStaffAttendance').is(':checked')) {
            $('#showStaffAttendanceData').val(true);
        } else {
            $('#showStaffAttendanceData').val(false);
        }
        if ($('#showOrderSummary').is(':checked')) {
            $('#showOrderSummaryData').val(true);
        } else {
            $('#showOrderSummaryData').val(false);
        }
        if ($('#showPaidOutDetails').is(':checked')) {
            $('#showPaidOutDetailsData').val(true);
        } else {
            $('#showPaidOutDetailsData').val(false);
        }
        if ($('#useAttendanceCheckbox').is(':checked')) {
            $('#useAttendanceCheckboxData').val(true);
        } else {
            $('#useAttendanceCheckboxData').val(false);
        }
        if ($('#printSpreadsheet').is(':checked')) {
            $('#printSpreadSheetData').val(true);
        } else {
            $('#printSpreadSheetData').val(false);
        }
        $('#reportLanguage').val(biscuit.l());
        $('#operationHour').val(getRestaurantHourInDecimalFormat());

        $('#appInstanceName').val(biscuit.c());
        document.overviewform.submit();
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

    $scope.listAllStaffsType = function(isShowFormerEmployee) {
        var soapBody = "<app:ListStaffType><app:showPrevStaff>" + isShowFormerEmployee + "</app:showPrevStaff></app:ListStaffType>"
        var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;

        var response =  $http.post(serverUrl, soapXMLRequest);

        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data)
            $scope.staffList = jsonObj.ListStaffResponseType.staff;
            $scope.driversList = [];
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
            $('#users-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            $('#drivers-select-choice').selectpicker({
                style: 'btn-info',
                width: '100%'
            });

            var currentUser = biscuit.u();
            if (biscuitHelper.hasPermission(currentUser, "TOTAL_REPORT")) {
                setTimeout(function() {
                    $('#users-select-choice').selectpicker('val', -1);
                    $('#users-select-choice').selectpicker('refresh');
                }, 50);
                setTimeout(function() {
                    $('#drivers-select-choice').selectpicker('val', -1);
                    $('#drivers-select-choice').selectpicker('refresh');
                }, 50);
            } else {
                setTimeout(function() {
                    $('#users-select-choice').selectpicker('val', biscuit.u().userid);
                    $('#users-select-choice').selectpicker('refresh');
                }, 50);
                setTimeout(function() {
                    $('#drivers-select-choice').selectpicker('val', biscuit.u().userid);
                    $('#drivers-select-choice').selectpicker('refresh');
                }, 50);
            }
        })

        response.error(function(data, status, headers, config) {
            console.log("Data:" + data + " " + "Status:" + status);
        })
    };

    $scope.listAllAreasType = function() {
        var soapXMLRequest = soapXMLBegin + "<app:ListAreasType/>" + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);
        
        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data);
            $scope.areasList = [];
            if (jsonObj.ListAreasResponseType.areas != null) {
                if (jsonObj.ListAreasResponseType.areas instanceof Array) {
                    $scope.areasList = jsonObj.ListAreasResponseType.areas;
                } else {
                    $scope.areasList.push(jsonObj.ListAreasResponseType.areas);
                }
            }
            $("#areas-select-choice").selectpicker({
               style: 'btn-info',
               width: '100%'
            });
            setTimeout(function() {$("#areas-select-choice").selectpicker('refresh');}, 50);
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };


    $scope.listAllRestaurantHoursType = function() {
        var soapXMLRequest = soapXMLBegin + "<app:ListRestaurantHoursType/>" + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);
        
        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data);
            $scope.hoursList = [];
            if (jsonObj.ListRestaurantHoursResponseType.hours != null) {
                if (jsonObj.ListRestaurantHoursResponseType.hours instanceof Array) {
                    $scope.hoursList = jsonObj.ListRestaurantHoursResponseType.hours;
                } else {
                    $scope.hoursList.push(jsonObj.ListRestaurantHoursResponseType.hours);
                }
            }
            $("#hours-select-choice").selectpicker({
                style: 'btn-info',
                width: '100%'
            });
            setTimeout(function() {$("#hours-select-choice").selectpicker('refresh');}, 50);
        });

        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };
    
    $scope.setDatetimeBasedOnAttendance = function() {
        var staffId = $("#users-select-choice").val();
        if (staffId == "") {
            staffId = $("#drivers-select-choice").val();
        }
        if (staffId == "") {
            var staffId = biscuit.u().userid;
        }
        var fromTime = moment($('#fromDatePreview').val(), 'MM/DD/YYYY hh:mm A').format('YYYY-MM-DDTHH:mm');
        var toTime = moment($('#toDatePreview').val(), 'MM/DD/YYYY hh:mm A').format('YYYY-MM-DDTHH:mm');
        var soapXMLRequest = soapXMLBegin + "<app:FetchAttendanceType><app:fromDate>" + fromTime + "</app:fromDate><app:toDate>" + toTime + "</app:toDate><app:staffId> " + staffId + "</app:staffId></app:FetchAttendanceType>" + soapXMLEnd;
        var response = $http.post(serverUrl, soapXMLRequest);
        
        response.success(function(data, status, headers, config) {
            var jsonObj = xml2Json(data);
            if (jsonObj != undefined && jsonObj != null && jsonObj.FetchAttendanceResponseType != undefined && 
            jsonObj.FetchAttendanceResponseType != null && jsonObj.FetchAttendanceResponseType.Result.successful == 'true') {
                var attendances = util.getElementsArray(jsonObj.FetchAttendanceResponseType.attendance);
                if (attendances.length > 0) {
                    var fromDate = attendances[0].startTime;
                    $('#fromDatePreview').val(moment(fromDate).format('MM/DD/YYYY hh:mm A'));
                };
            }
        });
        
        response.error(function(data, status, headers, config){
            console.log("Data:" + data + " " + "Status:" + status);
        });
    };

    $scope.getSystemLanguageDisplayVal = function(id, defaultDisplayVal) {
        var lang = biscuit.l();
        return getDataDisplayValueByElementId(id, lang, defaultDisplayVal);
    }

    $scope.init();
}])