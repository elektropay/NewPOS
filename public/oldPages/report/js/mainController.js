var mainPageApp = angular.module('reportApp', ['ngRoute', 'ngTable', 'ui.bootstrap'])

mainPageApp.config(function($routeProvider, $httpProvider) {
	$routeProvider
		.when('/overView', {
			templateUrl: 'overView.html',
			controller: 'OverViewController'
		})
		.when('/daily', {
			templateUrl: 'daily.html',
			controller: 'DailyController'
		})
		.when('/hourlySales', {
			templateUrl: 'hourlySales.html',
			controller: 'HourlyController'
		})
		.when('/staff', {
			templateUrl: 'staff.html',
			controller: 'StaffController'
		})
		.when('/delivery', {
			templateUrl: 'delivery.html',
			controller: 'DeliveryController'	
		})
		.when('/all', {
			templateUrl: 'all.html',
			controller: 'AllController'
		})
		.when('/cash', {
			templateUrl: 'cash.html',
			controller: 'CashController'
		})
		.when('/credit', {
			templateUrl: 'credit.html',
			controller: 'CreditController'
		})
		.when('/giftCard', {
			templateUrl: 'giftCard.html',
			controller: 'GiftCardController'
		})
		.when('/loyaltyCard', {
			templateUrl: 'loyaltyCard.html',
			controller: 'LoyaltyCardController'
		})
		.when('/other', {
			templateUrl: 'other.html',
			controller: 'OtherController'
		})
		.when('/batch', {
			templateUrl: 'batch.html',
			controller: 'BatchController'
		})
		.when('/voidOrder', {
			templateUrl: 'voidOrder.html',
			controller: 'VoidOrderController'
		})
		.when('/voidCredit', {
			templateUrl: 'voidCredit.html',
			controller: 'VoidCreditController'
		})
		.when('/discount', {
			templateUrl: 'discount.html',
			controller: 'DiscountController'
		})
		.when('/charge', {
			templateUrl: 'charge.html',
			controller: 'ChargeController'
		})
		.when('/menu', {
			templateUrl: 'menu.html',
			controller: 'MenuController'
		})
		.when('/cashIO', {
			templateUrl: 'cashIO.html',
			controller: 'CashIOController'
		})
		.when('/purchaseOrder', {
			templateUrl: 'purchaseOrder.html',
			controller: 'PurchaseOrderController'
		})
		.when('/customerWaitTime', {
			templateUrl: 'customerWaitTime.html',
			controller: 'CustomerWaitTimeController'
		})
		.when('/registerActivity', {
			templateUrl: 'registerActivity.html',
			controller: 'RegisterActivityController'
		})
		.when('/category', {
			templateUrl: 'category.html',
			controller: 'CategoryController'
		})
		.when('/ali', {
			templateUrl: 'ali.html',
			controller: 'AliController'
		})
		.when('/weChat', {
			templateUrl: 'weChat.html',
			controller: 'WeChatController'
		})
		.when('/attendanceEditRecord', {
            templateUrl: 'attendanceEditRecord.html',
            controller: 'AttendanceEditRecordController'
        })
        .when('/cashTip', {
            templateUrl: 'cashTip.html',
            controller: 'CashTipController'
        })
        .when('/audit', {
            templateUrl: 'audit.html',
            controller: 'AuditController'
        })
        .when('/systemSettingAudit', {
            templateUrl: 'systemSettingAudit.html',
            controller: 'SystemSettingAuditController'
        })
        .when('/orderAmountRoundingDetail', {
            templateUrl: 'orderAmountRounding.html',
            controller: 'OrderAmountRoundingDetailController'
        })
        .when('/tipOut', {
            templateUrl: 'tipOut.html',
            controller: 'TipOutController'
        })
        .when('/levelUp', {
            templateUrl: 'levelUp.html',
            controller: 'LevelUpController'
        })
		.otherwise({
			redirectTo: '/overView'
		});
		var currentUser = biscuit.u();
		if (util.isValidVariable(currentUser)) {
		    $httpProvider.defaults.headers.post['Merchant-ID'] = biscuitHelper.getMerchantInfo(currentUser).merchantIds;
		}
});

mainPageApp.controller('IndexPageController', ['$scope', '$http', '$location', function($scope, $http, $location) {
	$scope.currentMerchantIds = '';
	$scope.currentMerchantName = '';

	$scope.reportPermissions = {
	    'overview': {
	        'enabled': true
	    },
	    'operation': {
            'enabled': true,
            'daily': { 'enabled': true },
            'hourly': { 'enabled': true }
        },
	    'staff': {
            'enabled': true,
            'staff': { 'enabled': true },
            'delivery': { 'enabled': true },
            'tipOut': { 'enabled': true },
            'attendanceEditRecord': { 'enabled': true }
        },
	    'payment': {
            'enabled': true,
            'all': { 'enabled': true },
            'cash': { 'enabled': true },
            'credit': { 'enabled': true },
            'giftCard': { 'enabled': true },
            'loyaltyCard': { 'enabled': true },
            'ali': { 'enabled': true },
            'weChat': { 'enabled': true },
            'levelUp': { 'enabled': true },
            'cashTip': { 'enabled': true},
            'other': { 'enabled': true },
            'batch': { 'enabled': true }
        },
	    'cashFlow': {
            'enabled': true,
            'cashInOut': { 'enabled': true },
            'cashRegisterActivity': { 'enabled': true }
        },
	    'other': {
            'enabled': true,
            'voidOrder': { 'enabled': true },
            'voidCredit': { 'enabled': true },
            'discount': { 'enabled': true },
            'charge': { 'enabled': true },
            'orderAmountRounding': { 'enabled': true },
            'category': { 'enabled': true },
            'menu': { 'enabled': true },
            'purchaseOrder': { 'enabled': true },
            'customerWaitTime': { 'enabled': true },
            'audit': {'enabled': true},
            'systemSettingAudit': {'enabled': true}
        },
	    'delivery': {
            'enabled': true
        }
	};

	$("#sidebar-toggle").click(function(e) {
        e.preventDefault();
        $("#page-wrapper").toggleClass("toggled");
    });

    $('#operation-page-tag').mouseover(function() {
    	var sidebarPosition = $('#operation-tab').position().top;
    	var subMenuHeight = $('#operation-tab .sub-menu').height();
    	var windowHeight = $(window).height();
    	if (sidebarPosition + subMenuHeight > windowHeight) {
    		var newTop = sidebarPosition + subMenuHeight - windowHeight + 34
    		$('#operation-tab .sub-menu').css("top", -newTop)
    	}
	});

	$('#staff-page-tag').mouseover(function() {
    	var sidebarPosition = $('#staff-tab').position().top;
    	var subMenuHeight = $('#staff-tab .sub-menu').height();
    	var windowHeight = $(window).height();
    	if (sidebarPosition + subMenuHeight > windowHeight) {
    		var newTop = sidebarPosition + subMenuHeight - windowHeight + 34
    		$('#staff-tab .sub-menu').css("top", -newTop)
    	}
	});

	$('#payment-page-tag').mouseover(function() {
    	var sidebarPosition = $('#payment-tab').position().top;
    	var subMenuHeight = $('#payment-tab .sub-menu').height();
    	var windowHeight = $(window).height();
    	if (sidebarPosition + subMenuHeight > windowHeight) {
    		var newTop = sidebarPosition + subMenuHeight - windowHeight + 34
    		$('#payment-tab .sub-menu').css("top", -newTop)
    	}
	});

	$('#cash-flow-page-tag').mouseover(function() {
    	var sidebarPosition = $('#cash-flow-tab').position().top;
    	var subMenuHeight = $('#cash-flow-tab .sub-menu').height();
    	var windowHeight = $(window).height();
    	if (sidebarPosition + subMenuHeight > windowHeight) {
    		var newTop = sidebarPosition + subMenuHeight - windowHeight + 34
    		$('#cash-flow-tab .sub-menu').css("top", -newTop)
    	}
	});

	$('#other-page-tag').mouseover(function() {
    	var sidebarPosition = $('#other-tab').position().top;
    	var subMenuHeight = $('#other-tab .sub-menu').height();
    	var windowHeight = $(window).height();
    	if (sidebarPosition + subMenuHeight > windowHeight) {
    		var newTop = sidebarPosition + subMenuHeight - windowHeight + 34
    		$('#other-tab .sub-menu').css("top", -newTop)
    	}
	});

    $scope.init = function() {
        var currentUser = biscuit.u();
        if (biscuitHelper.hasPermission(currentUser, "REPORT") || biscuitHelper.hasPermission(currentUser, "TOTAL_REPORT")) {
        	//do nothing
        } else if (biscuitHelper.hasPermission(currentUser, "PERSONAL_REPORT")) {
        	//hide necessary tab
        	$scope.reportPermissions.operation.enabled = false;
        	$scope.reportPermissions.payment.enabled = false;
        	$scope.reportPermissions.staff.delivery.enabled = false;
        	$scope.reportPermissions.staff.attendanceEditRecord.enabled = false;
        	$scope.reportPermissions.cashFlow.cashRegisterActivity.enabled = false;
        	$scope.reportPermissions.other.enabled = false;
            $scope.reportPermissions.other.voidOrder.enabled = false;
            $scope.reportPermissions.other.voidCredit.enabled = false;
            $scope.reportPermissions.other.discount.enabled = false;
            $scope.reportPermissions.other.charge.enabled = false;
            $scope.reportPermissions.other.orderAmountRounding.enabled = false;
            $scope.reportPermissions.other.category.enabled = false;
            $scope.reportPermissions.other.menu.enabled = false;
            $scope.reportPermissions.other.purchaseOrder.enabled = false;
            $scope.reportPermissions.other.customerWaitTime.enabled = false;
            $scope.reportPermissions.other.audit.enabled = false;
            $scope.reportPermissions.other.systemSettingAudit.enabled = false;

            if (biscuitHelper.hasPermission(currentUser, "REPORT_PURCHASE_ORDER")) {
                $scope.reportPermissions.other.enabled = true;
                $scope.reportPermissions.other.purchaseOrder.enabled = true;
            }

            if (biscuitHelper.hasPermission(currentUser, "REPORT_CUSTOMER_WAITING_TIME")) {
                $scope.reportPermissions.other.enabled = true;
                $scope.reportPermissions.other.customerWaitTime.enabled = true;
            }

            if (biscuitHelper.hasPermission(currentUser, "REPORT_CASH_IN_OUT")) {
                $scope.reportPermissions.cashFlow.enabled = true;
                $scope.reportPermissions.cashFlow.cashInOut.enabled = true;
            }
        } else if (biscuitHelper.hasPermission(currentUser, "REPORT_PURCHASE_ORDER")
            || biscuitHelper.hasPermission(currentUser, "REPORT_CUSTOMER_WAITING_TIME") || biscuitHelper.hasPermission(currentUser, "REPORT_CASH_IN_OUT")) {
            $scope.reportPermissions.overview.enabled = false;
            $scope.reportPermissions.operation.enabled = false;
            $scope.reportPermissions.staff.enabled = false;
            $scope.reportPermissions.payment.enabled = false;
            $scope.reportPermissions.cashFlow.enabled = false;
            $scope.reportPermissions.cashFlow.cashInOut.enabled = false;
            $scope.reportPermissions.cashFlow.cashRegisterActivity.enabled = false;
            $scope.reportPermissions.other.enabled = false;
            $scope.reportPermissions.other.voidOrder.enabled = false;
            $scope.reportPermissions.other.voidCredit.enabled = false;
            $scope.reportPermissions.other.discount.enabled = false;
            $scope.reportPermissions.other.charge.enabled = false;
            $scope.reportPermissions.other.orderAmountRounding.enabled = false;
            $scope.reportPermissions.other.category.enabled = false;
            $scope.reportPermissions.other.menu.enabled = false;
            $scope.reportPermissions.other.purchaseOrder.enabled = false;
            $scope.reportPermissions.other.customerWaitTime.enabled = false;
            $scope.reportPermissions.other.audit.enabled = false;
            $scope.reportPermissions.other.systemSettingAudit.enabled = false;
            if (biscuitHelper.hasPermission(currentUser, "REPORT_PURCHASE_ORDER")) {
                $scope.reportPermissions.other.enabled = true;
                $scope.reportPermissions.other.purchaseOrder.enabled = true;
                $location.path('/purchaseOrder');
            }

            if (biscuitHelper.hasPermission(currentUser, "REPORT_CUSTOMER_WAITING_TIME")) {
                $scope.reportPermissions.other.enabled = true;
                $scope.reportPermissions.other.customerWaitTime.enabled = true;
                $location.path('/customerWaitTime');
            }

            if (biscuitHelper.hasPermission(currentUser, "REPORT_CASH_IN_OUT")) {
                $scope.reportPermissions.cashFlow.enabled = true;
                $scope.reportPermissions.cashFlow.cashInOut.enabled = true;
                $location.path('/cashIO');
            }
        } else {
            // No permission. Supposed to block everything. But let's wait until user permission is added into CMS
        }

        if (biscuitf.m() == 'lite') {
            $scope.reportPermissions.operation.hourly.enabled = false;
            $scope.reportPermissions.payment.giftCard.enabled = false;
            $scope.reportPermissions.payment.loyaltyCard.enabled = false;
            $scope.reportPermissions.other.purchaseOrder.enabled = false;
            $scope.reportPermissions.other.customerWaitTime.enabled = false;
        };

        if (!biscuitHelper.hasPermission(currentUser, "SHOW_CASH_AMOUNT_BEFORE_CASHED_OUT")) {
        	var soapBody = "<app:BalanceCashDrawerType><app:userId>" + currentUser.userid + "</app:userId></app:BalanceCashDrawerType>";
        	var soapXMLRequest = soapXMLBegin + soapBody + soapXMLEnd;

        	var response = $http.post(serverUrl, soapXMLRequest);

        	response.success(function(data, status, headers, config){
        		var jsonObj = xml2Json(data);
        		if (jsonObj.BalanceCashDrawerResponseType.expectedType === 'CASH_OUT') {
        			document.body.style.overflow = 'hidden';
        			$('#alert-page').show();
        		};
        	})

        	response.error(function(data, status, headers, config){
        		console.log("Data:" + data + " " + "Status:" + status);
        	})
        };

        if (util.isValidVariable(currentUser)) {
            var merchantInfo = biscuitHelper.getMerchantInfo(currentUser);
            $scope.currentMerchantIds = merchantInfo.merchantIds;
            $scope.currentMerchantName = merchantInfo.merchantName;
        }
    };
    $scope.init();
}]);