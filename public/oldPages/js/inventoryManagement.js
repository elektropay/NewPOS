var inventoryManagementPage = {
    disableCustomAlertPopup: true,
    init : function() {
    }
};

var inventoryManagementApp = angular.module('inventoryManagementApp', [ 'ngRoute' ]);

inventoryManagementApp.config(function($routeProvider, $httpProvider) {
    $routeProvider.when('/inventoryCount', {
        templateUrl : 'inventoryCount.html',
        controller : 'inventoryCountCtrlObj'
    }).when('/inventoryReview', {
        templateUrl : 'inventoryReview.html',
        controller : 'inventoryReviewCtrlObj'
    }).when('/', {
        templateUrl : 'inventoryCount.html',
        controller : 'inventoryCountCtrlObj'
    }).when('/inventoryPurchaseOrder', {
        templateUrl : 'inventoryPurchaseOrder.html',
        controller : 'inventoryPurchaseOrderCtrlObj'
    }).when('/inventoryReceivedItems', {
        templateUrl : 'inventoryReceivedItems.html',
        controller : 'inventoryReceivedItemsCtrlObj'
    }).when('/menuRecipes', {
        templateUrl : 'menuRecipes.html',
        controller : 'menuRecipesCtrlObj'
    }).otherwise('/');

    var currentUser = biscuit ? biscuit.u(): null;
    if (util.isValidVariable(currentUser) && biscuitHelper) {
        $httpProvider.defaults.headers.post['Merchant-ID'] = biscuitHelper.getMerchantInfo(currentUser).merchantIds;
    } else {
        console.log('biscuit.js or util.js is not properly loaded!!!');
    }
});

inventoryManagementApp.directive('mnsfSelectOnFocus', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.focus(function() {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    //this.setSelectionRange(0, this.value.length);
                    this.select();
                }
            });
        }
    };
}]);

inventoryManagementApp.directive('mnsfAutoFocus', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch(attrs.mnsfAutoFocus, function(value) {
                if (value === true) {
                    element[0].focus();
                    scope[attrs.mnsfAutoFocus] = false;
                }
            });
        }
    };
}]);

inventoryManagementApp.filter('customerInventoryItemFilter', function () {
    return function (items, itemFilter) {
        var filtered = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (util.isValidVariable(itemFilter.groupid) && item.groupid != itemFilter.groupid) {
                continue;
            }
            if (util.isValidVariable(itemFilter.name)) {
                if (item.name.toUpperCase().indexOf(itemFilter.name.toUpperCase()) <= -1 && (!util.isValidVariable(item.sku) || item.sku.toUpperCase().indexOf(itemFilter.name.toUpperCase()) <= -1)) {
                    continue;
                }
            }
            filtered.push(item);
        }
        return filtered;
    };
});

inventoryManagementApp.filter('customerMenuItemFilter', function () {
    return function (items, itemFilter) {
        var filtered = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (util.isValidVariable(itemFilter.categoryId) && item.categoryId != itemFilter.categoryId) {
                continue;
            }
            if (util.isValidVariable(itemFilter.name) && item.name.toUpperCase().indexOf(itemFilter.name.toUpperCase()) <= -1) {
                continue;
            }
            filtered.push(item);
        }
        return filtered;
    };
});

inventoryManagementApp.factory('inventoryItemService', [function() {
    var thisService = {
        getItemDisplayName : function(inventoryItem) {
            var displayName = util.getStringValue(inventoryItem.name);
            if (util.isValidVariable(inventoryItem.baseunit)) {
                displayName += ' (' + util.getStringValue(inventoryItem.baseunit) + ')';
            }
            return displayName;
        },
        getOrderItemDisplayName : function(orderItem) {
            var displayName = util.getStringValue(orderItem.name);
            if (util.isValidVariable(orderItem.purchaseunittype)) {
                displayName += ' (' + util.getStringValue(orderItem.purchaseunittype) + ')';
            }
            return displayName;
        },
        getPurchaseItemDisplayName : function(inventoryItem) {
            var displayName = util.getStringValue(inventoryItem.name);
            if (util.isValidVariable(inventoryItem.purchaseunit)) {
                displayName += ' (' + util.getStringValue(inventoryItem.purchaseunit) + ')';
            } else if (util.isValidVariable(inventoryItem.baseunit)) {
                displayName += ' (' + util.getStringValue(inventoryItem.baseunit) + ')';
            }
            return displayName;
        },
        getRecipeItemDisplayName : function(inventoryItem) {
            var displayName = util.getStringValue(inventoryItem.name);
            if (util.isValidVariable(inventoryItem.productionunit)) {
                displayName += ' (' + util.getStringValue(inventoryItem.productionunit) + ')';
            } else if (util.isValidVariable(inventoryItem.baseunit)) {
                displayName += ' (' + util.getStringValue(inventoryItem.baseunit) + ')';
            }
            return displayName;
        }
    };

    return thisService;
}]);

inventoryManagementApp.factory('purchaseOrderService', [function() {
    var thisService = {
        getPurchaseOrderSoapRequest : function(purchaseOrder, isSendEmail) {
            var soapOrderItemList = [];
            for (var i = 0; i < purchaseOrder.orderItemList.length; i++) {
                var item = purchaseOrder.orderItemList[i];
                if (!angular.isNumber(item.qty)) {
                    item.qty = 0;
                }
                if (!angular.isNumber(item.priceperunit)) {
                    item.priceperunit = 0;
                }
                var qty = parseFloat(item.qty);
                var pricePerUnit = parseFloat(item.priceperunit);
                if (util.isValidVariable(item.instocktopurchaseqtyratio)) {
                    var inStockToPurchaseQtyRatio = parseFloat(item.instocktopurchaseqtyratio);
                }
                var orderItemSoapType = new PurchaseOrderItemType(item.id, item.name, item.sku, qty, item.purchaseunittype, item.instockunittype, inStockToPurchaseQtyRatio, pricePerUnit, item.itemid);
                soapOrderItemList.push(orderItemSoapType);
            }

            var id = null, subtotal = 0, tax = 0, paidAmount = 0, notes = null, type = null, status = null, vendorOrderId = null, shippingAddressId = null, vendorId = null;
            id = purchaseOrder.id;
            if (util.isValidVariable(purchaseOrder.subtotal)) {
                subtotal = parseFloat(purchaseOrder.subtotal);
            }
            if (util.isValidVariable(purchaseOrder.tax)) {
                tax = purchaseOrder.tax;
            }
            if (util.isValidVariable(purchaseOrder.paidamount)) {
                paidAmount = purchaseOrder.paidamount;
            }
            notes = purchaseOrder.notes;
            type = purchaseOrder.type;
            status = purchaseOrder.status;
            vendorOrderId = purchaseOrder.vendororderid;
            shippingAddressId = purchaseOrder.shippingaddressid;
            vendorId = purchaseOrder.vendorid;
            var userAuth = admin.getUserAuthInfo();
            var soapType = new SavePurchaseOrderType(id, subtotal, tax, paidAmount, notes, type, status, vendorOrderId, shippingAddressId, vendorId, soapOrderItemList, userAuth, isSendEmail);
            return soapType;
        }
    };

    return thisService;
}]);

inventoryManagementApp.controller('inventoryMainController', ['$scope', function($scope) {
    $scope.init = function() {
        $scope.currentMerchantIds = null;
        var currentUser = biscuit.u();
        if (util.isValidVariable(currentUser)) {
            var merchantInfo = biscuitHelper.getMerchantInfo(currentUser);
            $scope.currentMerchantIds = merchantInfo.merchantIds;
        }
        systemLanguage.loadLanguageForPage('inventoryManagementPage');
    };
    $scope.init();
}]);

inventoryManagementApp.controller('inventoryCountCtrlObj', ['$scope', '$http', 'inventoryItemService', function($scope, $http, inventoryItemService) {
    $scope.sortType     = 'displaypriority'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order

    $scope.estimatedTotalStockValue = 0;
    $scope.actualTotalStockValue = 0;
    $scope.totalAdjustmentAmount = 0;

    $scope.submitResult = {
        error: false,
        success : false,
        errorMessage: ''
    };

    $scope.itemFilter = {
        selectedInventoryItemGroupId: null,
        searchText: ''
    };

    $scope.adjustmentDecreaseReasonList = [];
    $scope.adjustmentIncreaseReasonList = [];
    $scope.inventoryItemGroupList = [];
    $scope.inventoryItemList = [];
    $scope.inventoryCountData = [];
    $scope.selectedInventoryItem = null;

    $scope.init = function() {
        $scope.getAdjustmentReasons();
        $scope.listItemGroups();
        $scope.listInventoryItems();
        systemLanguage.loadLanguageForPage('inventoryCountPage');
    };

    $scope.clearMessages = function() {
        $scope.submitResult.error = false;
        $scope.submitResult.success = false;
        $scope.submitResult.errorMessage = '';
    };

    $scope.exportDataCount = function() {
        alasql('SELECT * INTO XLSX("Inventory_Count.xlsx",{headers:true}) FROM ?',[$scope.inventoryCountData]);
    }

    $scope.getAdjustmentReasons = function() {
        var findAdjustmentDecreaseReasonListSoapType = new FindSystemConfigurationsType('INVENTORY_COUNT_DECREASE_ADJUSTMENT_REASON', false);
        callWebService(findAdjustmentDecreaseReasonListSoapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
                var configList = util.getElementsArray(jsonObj.listsystemconfigurationsresponsetype.systemconfiguration);
                if (configList.length > 0) {
                    var configValue = util.getStringValue(configList[0].value);
                    $scope.adjustmentDecreaseReasonList = configValue.split(',');
                }
            }
        }, {$http: $http});
        var findAdjustmentIncreaseReasonListSoapType = new FindSystemConfigurationsType('INVENTORY_COUNT_INCREASE_ADJUSTMENT_REASON', false);
        callWebService(findAdjustmentIncreaseReasonListSoapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
                var configList = util.getElementsArray(jsonObj.listsystemconfigurationsresponsetype.systemconfiguration);
                if (configList.length > 0) {
                    var configValue = util.getStringValue(configList[0].value);
                    $scope.adjustmentIncreaseReasonList = configValue.split(',');
                }
            }
        }, {$http: $http});
    };

    $scope.listItemGroups = function() {
        var soapType = new FindInventoryItemGroupsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemgroupsresponsetype)) {
                $scope.inventoryItemGroupList = util.getElementsArray(jsonObj.findinventoryitemgroupsresponsetype.inventoryitemgroups);
            } else {
                console.log("Error getting inventory item group list");
            }
        }, {$http: $http});
    };

    $scope.listInventoryItems = function() {
        var soapType = new FindInventoryItemsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemsresponsetype)) {
                $scope.estimatedTotalStockValue = 0;
                var inventoryItemDbList = util.getElementsArray(jsonObj.findinventoryitemsresponsetype.inventoryitems);
                for (var i = 0; i < inventoryItemDbList.length; i++) {
                    var inventoryItem = inventoryItemDbList[i];
                    if (angular.isNumber(inventoryItem.stockqty) && angular.isNumber(inventoryItem.estimatedusedqty)) {
                        var estimatedStockQty = util.getFloatValue(inventoryItem.stockqty - inventoryItem.estimatedusedqty);
                        inventoryItem.estimatedstockqty = estimatedStockQty;
                    }
                    if (angular.isNumber(inventoryItem.stocktotalvalue)) {
                        $scope.estimatedTotalStockValue += inventoryItem.stocktotalvalue;
                    }
                    inventoryItem.displayInfo = inventoryItemService.getItemDisplayName(inventoryItem);
                    if (inventoryItem.inventorycountunit == "PURCHASE_UNIT" && util.isValidVariable(inventoryItem.purchaseunit) && angular.isNumber(inventoryItem.purchaseunittobaseunitratio)) {
                        inventoryItem.actualEndingQTYUnit = inventoryItem.purchaseunit;
                    } else if (util.isValidVariable(inventoryItem.baseunit)) {
                        inventoryItem.actualEndingQTYUnit = inventoryItem.baseunit;               
                    }  else {
                        inventoryItem.actualEndingQTYUnit = "";
                    }
                    inventoryItem.itemCountRecord = {
                        actualStockQty : null,
                        adjustmentReason : null
                    };
                    $scope.inventoryCountData.push({
                        Number: inventoryItem.displaypriority,
                        Name: inventoryItem.displayInfo,
                        Cost: inventoryItem.averagecost,
                        Low_Stock_Alert_Threshold: inventoryItem.lowstockalertthreshold,
                        Stock_Value: inventoryItem.stocktotalvalue,
                        Starting_QTY: inventoryItem.stockqty,
                        Estimated_Used_QTY: inventoryItem.estimatedusedqty,
                        Estimated_Ending_QTY: inventoryItem.estimatedstockqty
                    });
                }
                $scope.inventoryItemList = inventoryItemDbList;
            } else {
                console.log("Error getting inventory item list");
            }
            $scope.updateTable();

            $scope.inventoryCountData.push({
                Number: "Estimated Current Total Value:",
                Name: $scope.estimatedTotalStockValue,
                Cost: "",
                Low_Stock_Alert_Threshold: "Actual Current Total Value:",
                Stock_Value: $scope.actualTotalStockValue,
                Starting_QTY: "",
                Estimated_Used_QTY: "Adjustment Value",
                Estimated_Ending_QTY: $scope.totalAdjustmentAmount
            });
        }, {$http: $http});
    };

    $scope.sortTable = function(sortType) {
        $scope.sortType = sortType;
        $scope.sortReverse = !$scope.sortReverse;
    };

    $scope.updateTable = function() {
        $scope.inventoryItemListInTable = [];
        for (var i = 0; i < $scope.inventoryItemList.length; i++) {
            var inventoryItem = $scope.inventoryItemList[i];
            if ($scope.itemFilter.selectedInventoryItemGroupId && $scope.itemFilter.selectedInventoryItemGroupId != inventoryItem.groupid) {
                continue;
            }
            $scope.inventoryItemListInTable.push(inventoryItem);
        }
        $scope.updateTotalStats();
        $scope.clearMessages();
    };

    $scope.updateTotalStats = function() {
        $scope.actualTotalStockValue = 0;
        $scope.estimatedTotalStockValue = 0;
        for (var i = 0; i < $scope.inventoryItemListInTable.length; i++) {
            var inventoryItem = $scope.inventoryItemListInTable[i];
            var estimatedStockQty = inventoryItem.estimatedstockqty;
            var actualStockQty = inventoryItem.itemCountRecord.actualStockQty;
            var averageCost = inventoryItem.averagecost;
            if (angular.isNumber(averageCost)) {
                var estimatedItemTotalValue = 0;
                if (angular.isNumber(estimatedStockQty)) {
                    estimatedItemTotalValue = estimatedStockQty * averageCost;
                }
                var actualItemTotalValue = 0;
                if (angular.isNumber(actualStockQty)) {
                    if (inventoryItem.inventorycountunit == "PURCHASE_UNIT") {
                        if (angular.isNumber(inventoryItem.purchaseunittobaseunitratio) && util.isValidVariable(inventoryItem.purchaseunit)) {
                            actualStockQty *= inventoryItem.purchaseunittobaseunitratio;
                        }
                    }
                    actualItemTotalValue = actualStockQty * averageCost;    
                } else {
                    actualItemTotalValue = estimatedItemTotalValue;
                }
                $scope.estimatedTotalStockValue += estimatedItemTotalValue;
                $scope.actualTotalStockValue += actualItemTotalValue;
            }
        }
        $scope.estimatedTotalStockValue = $scope.estimatedTotalStockValue.toFixed(2);
        $scope.actualTotalStockValue = $scope.actualTotalStockValue.toFixed(2);
        $scope.totalAdjustmentAmount = util.getMoneyAmount($scope.actualTotalStockValue - $scope.estimatedTotalStockValue);
    };

    $scope.submitInventoryCountResult = function() {
        $scope.clearMessages();
        var soapItemChangeRecordList = [];
        for (var i = 0; i < $scope.inventoryItemListInTable.length; i++) {
            var inventoryItem = $scope.inventoryItemListInTable[i];
            if (angular.isNumber(inventoryItem.itemCountRecord.actualStockQty)) {
                var actualStockQty = inventoryItem.itemCountRecord.actualStockQty;
                if (inventoryItem.inventorycountunit == "PURCHASE_UNIT") {
                    if (angular.isNumber(inventoryItem.purchaseunittobaseunitratio) && util.isValidVariable(inventoryItem.purchaseunit)) {
                        actualStockQty *= inventoryItem.purchaseunittobaseunitratio;
                    }
                }
                var actualUsedQty = util.getFloatValue(inventoryItem.stockqty - actualStockQty);
                var itemChangeRecordSoapType = new ItemChangeRecordType(null, inventoryItem.stockqty, util.getFloatValue(0 - actualUsedQty), inventoryItem.estimatedusedqty, util.getFloatValue(0 - inventoryItem.estimatedusedqty), 'COUNT', inventoryItem.itemCountRecord.adjustmentReason, inventoryItem.id);
                soapItemChangeRecordList.push(itemChangeRecordSoapType);
            }
        }

        if (soapItemChangeRecordList.length > 0) {
            var estimatedTotalStockValue = parseFloat($scope.estimatedTotalStockValue);
            var actualTotalStockValue = parseFloat($scope.actualTotalStockValue);
            var totalAdjustmentAmount = parseFloat($scope.totalAdjustmentAmount);
            var userAuth = admin.getUserAuthInfo();
            var soapType = new SaveInventoryCountRecordType(null, estimatedTotalStockValue, actualTotalStockValue, totalAdjustmentAmount, soapItemChangeRecordList, userAuth);
            callWebService(soapType, function(jsonObj) {
                if (util.isSuccessfulResponse(jsonObj.saveinventorycountrecordresponsetype)) {
                    $scope.listInventoryItems();
                    $scope.submitResult.success = true;
                } else {
                    $scope.submitResult.error = true;
                    $scope.submitResult.errorMessage = util.getStringValue(jsonObj.saveinventorycountrecordresponsetype.result.failurereason);
                    console.log("Error submitting inventory check request, error: " + util.getStringValue(jsonObj.saveinventorycountrecordresponsetype.result.failurereason));
                }
            }, {$http: $http});
        }
    };

    $scope.isItemUnitConvertible = function(inventoryItem) {
        return util.isValidVariable(inventoryItem.baseunit) && util.isValidVariable(inventoryItem.purchaseunit) && angular.isNumber(inventoryItem.purchaseunittobaseunitratio);
    };

    $scope.prepareUnitConversionForItemCount = function(inventoryItem) {
        $scope.selectedInventoryItem = inventoryItem;
        $scope.selectedInventoryItem.stockCountInPurchaseUnit = "";
        $scope.selectedInventoryItem.stockCountInBaseUnit = "";
        $scope.selectedInventoryItem.itemCountRecord.actualStockConvertedQty = null;
    };

    $scope.convertToBaseUnit = function() {
        var item = $scope.selectedInventoryItem;
        if (angular.isNumber(item.stockCountInPurchaseUnit) && angular.isNumber(item.purchaseunittobaseunitratio)) {
            item.itemCountRecord.actualStockConvertedQty = util.getFloatValue(item.stockCountInPurchaseUnit * item.purchaseunittobaseunitratio);
        }
    };
    
    $scope.convertToPurchaseUnit = function() {
        var item = $scope.selectedInventoryItem;
        if (angular.isNumber(item.stockCountInBaseUnit) && angular.isNumber(item.purchaseunittobaseunitratio)) {
            item.purchaseunittobaseunitratio = item.purchaseunittobaseunitratio <= 0 ? 1 : item.purchaseunittobaseunitratio;
            item.itemCountRecord.actualStockConvertedQty = util.getFloatValue(item.stockCountInBaseUnit / item.purchaseunittobaseunitratio);
        }
    };

    $scope.confirmUnitConversion = function() {
        var item = $scope.selectedInventoryItem;
        if (angular.isNumber(item.itemCountRecord.actualStockConvertedQty)) {
            item.itemCountRecord.actualStockQty = item.itemCountRecord.actualStockConvertedQty;
            $scope.updateTotalStats();
        }
    };

    $scope.init();
}]);
inventoryManagementApp.controller('inventoryPurchaseOrderCtrlObj', ['$scope', '$http', 'inventoryItemService', 'purchaseOrderService', function($scope, $http, inventoryItemService, purchaseOrderService) {
    $scope.sortType     = 'vendor'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.focusQtyInput = false;

    $scope.submitResult = {
        error: false,
        success : false,
        errorMessage: ''
    };

    $scope.saveOrderSubmitResult = {
        error: false,
        success : false,
        processing : false,
        errorMessage: ''
    };

    var now = new Date();
    var oneMonthBeforeNow = new Date();
    oneMonthBeforeNow.setDate(now.getDate() - 3);

    $scope.purchaseOrderFilter = {
        selectedInventoryVendorId: null,
        selectedOrderStatus: 'INIT,ORDERED',
        fromDate: oneMonthBeforeNow,
        toDate: now
    };

    $scope.inventoryItemFilter = {
        name: "",
        groupid: ""
    };

    $scope.orderStatusQueryList = [
        {name: 'INIT,ORDERED,RECEIVED', displayName: 'All'},
        {name: 'INIT,ORDERED', displayName: 'Not Received'},
        {name: 'RECEIVED', displayName: 'Received'},
        {name: 'CANCELED', displayName: 'Canceled'}
    ];
    $scope.orderStatusList = ['INIT', 'ORDERED', 'RECEIVED', 'CANCELED'];
    $scope.purchaseOrderList = [];
    $scope.inventoryVendorList = [];
    $scope.inventoryLocationList = [];
    $scope.inventoryItemList = [];
    $scope.inventoryItemGroupList = [];
    $scope.inventoryPurchaseData = [];
    $scope.currentPurchaseOrder = null;
    $scope.currentOrderItem = null;
    $scope.totalPurchaseOrderValue = 0;
    $scope.isShowEmailButton = false;
     $scope.canUseButton = true;

    $scope.init = function() {
        $scope.listInventoryVendors();
        $scope.listInventoryLocations();
        $scope.listInventoryItems();
        $scope.listInventoryItemGroups();
        systemLanguage.loadLanguageForPage('inventoryPurchaseOrderPage');
        $scope.purchaseOrderFilter.selectedOrderStatus = 'INIT,ORDERED';
        $scope.queryPurchaseOrders();
        $scope.hasEmailConfig();
        $scope.clearMessages();
    };
    
    $scope.hasEmailConfig = function() {
        var findToEmailAddressListSoapType = new FindSystemConfigurationsType('TO_EMAIL_ADDRESS_FOR_SEND_PURCHASE_ORDER', false);
        callWebService(findToEmailAddressListSoapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
                var configList = util.getElementsArray(jsonObj.listsystemconfigurationsresponsetype.systemconfiguration);
                if (configList.length > 0) {
                    var configValue = util.getStringValue(configList[0].value);
                    if (configValue != "" && configValue != null) {
                        $scope.isShowEmailButton = true;
                    }
                }
            }
        }, {$http: $http});
    }

    $scope.clearMessages = function() {
        $scope.saveOrderSubmitResult.error = false;
        $scope.saveOrderSubmitResult.success = false;
        $scope.saveOrderSubmitResult.errorMessage = '';
    };

    $scope.listInventoryItemGroups = function() {
        var soapType = new FindInventoryItemGroupsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemgroupsresponsetype)) {
                $scope.inventoryItemGroupList = util.getElementsArray(jsonObj.findinventoryitemgroupsresponsetype.inventoryitemgroups);
                for (var i = 0; i < $scope.inventoryItemGroupList.length; i++) {
                    var inventoryGroup = $scope.inventoryItemGroupList[i];
                    if (inventoryGroup.displaypriority == 0) {
                         $scope.inventoryItemFilter.groupid = inventoryGroup.id;
                    }
                }
            } else {
                console.log("Error getting inventory item group list");
            }
        }, {$http: $http});
    };

    $scope.listInventoryItems = function() {
        var soapType = new FindInventoryItemsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemsresponsetype)) {
                $scope.inventoryItemList = util.getElementsArray(jsonObj.findinventoryitemsresponsetype.inventoryitems);
                for (var i = 0; i < $scope.inventoryItemList.length; i++) {
                    var inventoryItem = $scope.inventoryItemList[i];
                    inventoryItem.displayInfo = inventoryItemService.getPurchaseItemDisplayName(inventoryItem);
                }
            } else {
                console.log("Error getting inventory item list");
            }
        }, {$http: $http});
    };

    $scope.listInventoryVendors = function() {
        var soapType = new FindInventoryVendorsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryvendorsresponsetype)) {
                $scope.inventoryVendorList = util.getElementsArray(jsonObj.findinventoryvendorsresponsetype.inventoryvendors);
            } else {
                console.log("Error getting inventory vendor list");
            }
        }, {$http: $http});
    };

    $scope.listInventoryLocations = function() {
        var soapType = new FindInventoryLocationsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventorylocationsresponsetype)) {
                $scope.inventoryLocationList = util.getElementsArray(jsonObj.findinventorylocationsresponsetype.inventorylocations);
            } else {
                console.log("Error getting inventory location list");
            }
        }, {$http: $http});
    };

    $scope.exportDataPurchase = function() {
        alasql('SELECT * INTO XLSX("Inventory_Purchase_Orders.xlsx",{headers:true}) FROM ?',[$scope.inventoryPurchaseData]);
    }

    $scope.queryPurchaseOrders = function() {
        $scope.purchaseOrderList = [];
        if (angular.isDate($scope.purchaseOrderFilter.fromDate)) {
            var fromDate = baseReportObj.parseReportDate($scope.purchaseOrderFilter.fromDate);
        }
        if (angular.isDate($scope.purchaseOrderFilter.toDate)) {
            var toDate = baseReportObj.parseReportDate($scope.purchaseOrderFilter.toDate);
        }
        var soapType = new FindPurchaseOrdersType(null, fromDate, toDate, $scope.purchaseOrderFilter.selectedOrderStatus, $scope.purchaseOrderFilter.selectedInventoryVendorId);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findpurchaseordersresponsetype)) {
                $scope.purchaseOrderList = util.getElementsArray(jsonObj.findpurchaseordersresponsetype.purchaseorders);
                for (var i = 0; i < $scope.purchaseOrderList.length; i++) {
                    var purchaseOrder = $scope.purchaseOrderList[i];
                    if (angular.isNumber(purchaseOrder.subtotal)) {
                        purchaseOrder.total = (purchaseOrder.subtotal + (angular.isNumber(purchaseOrder.tax) ? purchaseOrder.tax : 0)).toFixed(2);
                    }
                    purchaseOrder.orderItemList = util.getElementsArray(purchaseOrder.orderitems);
                    for (var j = 0; j < purchaseOrder.orderItemList.length; j++) {
                        var orderItem = purchaseOrder.orderItemList[j];
                        orderItem.displayInfo = inventoryItemService.getOrderItemDisplayName(orderItem);
                    }
                    var tempNotes = "";
                    var tempVendorName = "";
                    var tempVendorOrderNumber = "";
                    var tempShippingAddressName = "";

                    if(!angular.isUndefined(purchaseOrder.notes)) {
                        tempNotes = purchaseOrder.notes;
                    }
                    if(!angular.isUndefined(purchaseOrder.vendorname)) {
                        tempVendorName = purchaseOrder.vendorname;
                    }
                    if(!angular.isUndefined(purchaseOrder.vendororderid)) {
                        tempVendorOrderNumber = purchaseOrder.vendororderid;
                    }
                    if(!angular.isUndefined(purchaseOrder.shippingaddressname)) {
                        tempShippingAddressName = purchaseOrder.shippingaddressname;
                    }
                    $scope.inventoryPurchaseData.push({
                        Number: purchaseOrder.id,
                        Total: purchaseOrder.total,
                        Subtotal: purchaseOrder.subtotal,
                        Tax: purchaseOrder.tax,
                        Notes: tempNotes,
                        Status: purchaseOrder.status,
                        Vendor_Name: tempVendorName,
                        Vendor_Order_Number: tempVendorOrderNumber,
                        Shipping_Address_Name: tempShippingAddressName,
                        Last_Updataed: purchaseOrder.lastupdated
                    });
                }
                $scope.updateTotalPurchaseOrderValue();

                $scope.inventoryPurchaseData.push({
                    Number: "",
                    Total: "",
                    Subtotal: "",
                    Tax: "",
                    Notes: "",
                    Status: "",
                    Vendor_Name: "",
                    Vendor_Order_Number: "",
                    Shipping_Address_Name: "Total Order Value:",
                    Last_Updataed: $scope.totalPurchaseOrderValue
                });
            } else {
                $scope.submitResult.error = true;
                $scope.submitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.LOAD_FAIL, 'Error querying purchase order result');
                console.log("Error querying purchase order result");
            }
        }, {$http: $http});
    };

    $scope.updateTotalPurchaseOrderValue = function() {
        $scope.totalPurchaseOrderValue = 0;
        for (var i = 0; i < $scope.purchaseOrderList.length; i++) {
            var purchaseOrder = $scope.purchaseOrderList[i];
            var total = purchaseOrder.subtotal + (util.isValidVariable(purchaseOrder.tax) ? purchaseOrder.tax : 0);
            $scope.totalPurchaseOrderValue += total;
        }
        $scope.totalPurchaseOrderValue = $scope.totalPurchaseOrderValue.toFixed(2);
    };

    $scope.setCurrentPurchaseOrder = function(purchaseOrder) {
        $scope.currentPurchaseOrder = purchaseOrder;
        $scope.calculatePurchaseOrderSubtotal();
        $scope.clearMessages();
    };

    $scope.newPurchaseOrder = function() {
        $scope.currentPurchaseOrder = {
            status: "INIT",
            type: 'PO',
            orderItemList: []
        };
        $scope.calculatePurchaseOrderSubtotal();
        $scope.clearMessages();
    };

    $scope.addOrderItem = function(item) {
        if ($scope.currentPurchaseOrder == null) {
            console.log('Cannot add');
            return;
        }
        
        // prevent adding same item multiple time
        for (var i = 0; i < $scope.currentPurchaseOrder.orderItemList.length; i++) {
            if ($scope.currentPurchaseOrder.orderItemList[i].itemid == item.id) {
                return;
            }
        }

        var newOrderItem = {
            itemid: item.id,
            name: item.name,
            qty: item.defaultpurchaseqty,
            priceperunit: item.defaultpurchaseprice,
            purchaseunittype: item.purchaseunit,
            instockunittype: item.baseunit,
            instocktopurchaseqtyratio: 1
        };
        newOrderItem.displayInfo = inventoryItemService.getOrderItemDisplayName(newOrderItem);

        $scope.currentPurchaseOrder.orderItemList.push(newOrderItem);
        $scope['focusQtyInput' + ($scope.currentPurchaseOrder.orderItemList.length - 1)] = true;
        $scope.calculatePurchaseOrderSubtotal();
    };

    $scope.deleteOrderItem = function(itemIndex) {
        if ($scope.currentPurchaseOrder == null) {
            console.log('Cannot delete');
            return;
        }
        $scope.currentPurchaseOrder.orderItemList.splice(itemIndex, 1);
        $scope.calculatePurchaseOrderSubtotal();
    };

    $scope.calculatePurchaseOrderSubtotal = function() {
        if ($scope.currentPurchaseOrder == null) {
            return;
        }
        $scope.currentPurchaseOrder.subtotal = 0;
        for (var i = 0; i < $scope.currentPurchaseOrder.orderItemList.length; i++) {
            var orderItem = $scope.currentPurchaseOrder.orderItemList[i];
            if (angular.isNumber(orderItem.priceperunit) && angular.isNumber(orderItem.qty)) {
                $scope.currentPurchaseOrder.subtotal += orderItem.priceperunit * orderItem.qty;
            }
        }
        $scope.currentPurchaseOrder.subtotal = $scope.currentPurchaseOrder.subtotal.toFixed(2);
    };

    $scope.savePurchaseOrder = function(isSendEmail) {
        if ($scope.currentPurchaseOrder == null) {
            console.log('Cannot save');
            return;
        }
        if (!$scope.canUseButton) {
            return;
        }
        $scope.clearMessages();
        for (var i = 0; i < $scope.currentPurchaseOrder.orderItemList.length; i++) {
            var orderItem = $scope.currentPurchaseOrder.orderItemList[i];
            if (!angular.isNumber(orderItem.qty) || orderItem.qty <= 0) {
                $scope.saveOrderSubmitResult.error = true;
                $scope.saveOrderSubmitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.QTY_MUST_BE_GREATER_THAN_ZERO, 'QTY must be greater than 0') + ". Item: " + orderItem.displayInfo;
                return;
            }
        }
        $scope.canUseButton = false;
        var soapType = purchaseOrderService.getPurchaseOrderSoapRequest($scope.currentPurchaseOrder, isSendEmail);
        $scope.saveOrderSubmitResult.processing = true;
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.savepurchaseorderresponsetype)) {
                $scope.saveOrderSubmitResult.processing = false;
                $scope.saveOrderSubmitResult.success = true;
                $scope.queryPurchaseOrders();
                $('#purchaseOrderDetailsModal').modal('hide');
            } else {
                $scope.saveOrderSubmitResult.processing = false;
                $scope.saveOrderSubmitResult.error = true;
                $scope.saveOrderSubmitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.SAVE_FAIL, 'Error saving purchase order result') + ". Reason: " + util.getStringValue(jsonObj.savepurchaseorderresponsetype.result.failurereason);
                console.log("Error saving purchase order, error: " + util.getStringValue(jsonObj.savepurchaseorderresponsetype.result.failurereason));
            }
            $scope.canUseButton = true;
        }, {$http: $http});
    };
    
    $scope.showEmailButton = function() {
        return $scope.isShowEmailButton;
    }

    $scope.cancelPurchaseOrder = function() {
        if (!util.isValidVariable($scope.currentPurchaseOrder.id)) {
            return;
        }
        $scope.currentPurchaseOrder.status = 'CANCELED';
        var soapType = purchaseOrderService.getPurchaseOrderSoapRequest($scope.currentPurchaseOrder);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.savepurchaseorderresponsetype)) {
                $scope.saveOrderSubmitResult.success = true;
                $scope.queryPurchaseOrders();
            } else {
                $scope.saveOrderSubmitResult.error = true;
                $scope.saveOrderSubmitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.SAVE_FAIL, 'Error canceling purchase order result');
                console.log("Error canceling purchase order, error: " + util.getStringValue(jsonObj.savepurchaseorderresponsetype.result.failurereason));
            }
        }, {$http: $http});
    };

    $scope.sortTable = function(sortType) {
        $scope.sortType = sortType;
        $scope.sortReverse = !$scope.sortReverse;
    };

    $scope.init();
}]);

inventoryManagementApp.controller('inventoryReceivedItemsCtrlObj', ['$scope', '$http', '$filter', 'inventoryItemService', 'purchaseOrderService', function($scope, $http, $filter, inventoryItemService, purchaseOrderService) {
    $scope.sortType     = 'vendor'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.focusQtyInput = false;

    $scope.submitResult = {
        error: false,
        success : false,
        errorMessage: ''
    };

    $scope.inventoryItemFilter = {
        name: "",
        groupid: ""
    };

    $scope.purchaseOrderList = [];
    $scope.inventoryItemList = [];
    $scope.inventoryItemGroupList = [];
    $scope.currentPurchaseOrder = null;
    $scope.currentOrderItem = null;

    $scope.init = function() {
        $scope.listInventoryItems();
        $scope.listInventoryItemGroups();
        $scope.listOpenPurchaseOrders();
        systemLanguage.loadLanguageForPage('inventoryReceiveItemsPage');
        $scope.clearCurrentPurchaseOrder();
    };

    $scope.clearMessages = function() {
        $scope.submitResult.error = false;
        $scope.submitResult.success = false;
        $scope.submitResult.errorMessage = '';
    };

    $scope.clearCurrentPurchaseOrder = function() {
        $scope.currentPurchaseOrder = {
            status: "RECEIVED",
            type: 'RECEIVED_ITEMS',
            orderItemList: []
        };
    };

    $scope.listInventoryItemGroups = function() {
        var soapType = new FindInventoryItemGroupsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemgroupsresponsetype)) {
                $scope.inventoryItemGroupList = util.getElementsArray(jsonObj.findinventoryitemgroupsresponsetype.inventoryitemgroups);
            } else {
                console.log("Error getting inventory item group list");
            }
        }, {$http: $http});
    };

    $scope.onSearchInventoryItem = function() {
        var filteredList = $filter('customerInventoryItemFilter')($scope.inventoryItemList, $scope.inventoryItemFilter);
        if (filteredList.length == 1) {
            $scope.addOrderItem(filteredList[0]);
        }
    };

    $scope.listInventoryItems = function() {
        var soapType = new FindInventoryItemsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemsresponsetype)) {
                $scope.inventoryItemList = util.getElementsArray(jsonObj.findinventoryitemsresponsetype.inventoryitems);
                for (var i = 0; i < $scope.inventoryItemList.length; i++) {
                    var inventoryItem = $scope.inventoryItemList[i];
                    inventoryItem.displayInfo = inventoryItemService.getPurchaseItemDisplayName(inventoryItem);
                }
            } else {
                console.log("Error getting inventory item list");
            }
        }, {$http: $http});
    };

    $scope.listOpenPurchaseOrders = function() {
        $scope.purchaseOrderList = [];
        var soapType = new FindPurchaseOrdersType(null, null, null, 'INIT,ORDERED');
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findpurchaseordersresponsetype)) {
                $scope.purchaseOrderList = util.getElementsArray(jsonObj.findpurchaseordersresponsetype.purchaseorders);
                for (var i = 0; i < $scope.purchaseOrderList.length; i++) {
                    var purchaseOrder = $scope.purchaseOrderList[i];
                    if (angular.isNumber(purchaseOrder.subtotal)) {
                        purchaseOrder.total = (purchaseOrder.subtotal + (angular.isNumber(purchaseOrder.tax) ? purchaseOrder.tax : 0)).toFixed(2);
                    }
                    purchaseOrder.orderItemList = util.getElementsArray(purchaseOrder.orderitems);
                    for (var j = 0; j < purchaseOrder.orderItemList.length; j++) {
                        var orderItem = purchaseOrder.orderItemList[j];
                        orderItem.displayInfo = inventoryItemService.getOrderItemDisplayName(orderItem);
                    }
                    purchaseOrder.displayInfo = '#' + purchaseOrder.id + ' - ' + purchaseOrder.lastupdated;
                    if (util.isValidVariable(purchaseOrder.vendor)) {
                        purchaseOrder.displayInfo += ' - ' + purchaseOrder.vendor;
                    }
                }
            } else {
                $scope.submitResult.error = true;
                $scope.submitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.LOAD_FAIL, 'Error querying purchase order result');
                console.log("Error querying purchase order result");
            }
        }, {$http: $http});
    };

    $scope.addOrderItem = function(item) {
        if ($scope.currentPurchaseOrder == null) {
            console.log('Cannot Add');
            return;
        }
        
        // prevent adding same item multiple time
        for (var i = 0; i < $scope.currentPurchaseOrder.orderItemList.length; i++) {
            if ($scope.currentPurchaseOrder.orderItemList[i].itemid == item.id) {
                return;
            }
        }

        var newOrderItem = {
            itemid: item.id,
            name: item.name,
            qty: item.defaultpurchaseqty,
            priceperunit: item.defaultpurchaseprice,
            purchaseunittype: item.purchaseunit,
            instockunittype: item.baseunit,
            instocktopurchaseqtyratio: 1
        };
        newOrderItem.displayInfo = inventoryItemService.getOrderItemDisplayName(newOrderItem);

        $scope.currentPurchaseOrder.orderItemList.push(newOrderItem);
        $scope['focusQtyInput' + ($scope.currentPurchaseOrder.orderItemList.length - 1)] = true;
        $scope.calculatePurchaseOrderSubtotal();
        $scope.inventoryItemFilter.name = "";
    };

    $scope.deleteOrderItem = function(itemIndex) {
        if ($scope.currentPurchaseOrder == null) {
            console.log('Cannot delete');
            return;
        }
        $scope.currentPurchaseOrder.orderItemList.splice(itemIndex, 1);
        $scope.calculatePurchaseOrderSubtotal();
    };

    $scope.calculatePurchaseOrderSubtotal = function() {
        if ($scope.currentPurchaseOrder == null) {
            return;
        }
        $scope.currentPurchaseOrder.subtotal = 0;
        for (var i = 0; i < $scope.currentPurchaseOrder.orderItemList.length; i++) {
            var orderItem = $scope.currentPurchaseOrder.orderItemList[i];
            if (angular.isNumber(orderItem.priceperunit) && angular.isNumber(orderItem.qty)) {
                $scope.currentPurchaseOrder.subtotal += orderItem.priceperunit * orderItem.qty;
            }
        }
        $scope.currentPurchaseOrder.subtotal = $scope.currentPurchaseOrder.subtotal.toFixed(2);
    };

    $scope.submitReceivedInventoryItems = function() {
        if ($scope.currentPurchaseOrder == null) {
            console.log('Cannot save');
            return;
        }
        $scope.clearMessages();

        $scope.currentPurchaseOrder.status = 'RECEIVED';
        var soapType = purchaseOrderService.getPurchaseOrderSoapRequest($scope.currentPurchaseOrder);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.savepurchaseorderresponsetype)) {
                $scope.submitResult.success = true;
                $scope.listOpenPurchaseOrders();
                $scope.clearCurrentPurchaseOrder();
            } else {
                $scope.submitResult.error = true;
                $scope.submitResult.errorMessage = util.getStringValue(jsonObj.savepurchaseorderresponsetype.result.failurereason);
                $scope.submitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.SAVE_FAIL, 'Error saving purchase order result');
                console.log("Error submitting received inventory item request, error: " + util.getStringValue(jsonObj.savepurchaseorderresponsetype.result.failurereason));
            }
        }, {$http: $http});
    };

    $scope.sortTable = function(sortType) {
        $scope.sortType = sortType;
        $scope.sortReverse = !$scope.sortReverse;
    };

    $scope.init();
}]);

inventoryManagementApp.controller('menuRecipesCtrlObj', ['$scope', '$http', 'inventoryItemService', function($scope, $http, inventoryItemService) {
    $scope.sortType     = 'displaypriority'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.focusQtyInput = false;

    $scope.submitResult = {
        error: false,
        success : false,
        errorMessage: ''
    };

    $scope.menuItemFilter = {
        name: "",
        menuId: "",
        categoryId: ""
    };

    $scope.inventoryItemFilter = {
        name: "",
        groupid: ""
    };

    $scope.menuList = [];

    $scope.menuCategoryList = [];
    $scope.menuSaleItemList = [];

    $scope.globalOptionCategoryList = [];
    $scope.globalOptionList = [];

    $scope.menuCategoryFilterList = [];
    $scope.menuItemOptionList = [];
    $scope.menuItemSelectList = [];

    $scope.inventoryItemList = [];
    $scope.inventoryItemMapById = {};
    $scope.inventoryItemGroupList = [];
    $scope.currentMenuItemRecipe = null;
    $scope.currentInventoryItem = null;

    $scope.init = function() {
        $scope.itemType = 'SALE_ITEM';
        $scope.listAllMenus();
        $scope.listInventoryItems();
        $scope.listInventoryItemGroups();
        systemLanguage.loadLanguageForPage('menuRecipesPage');
    };

    $scope.clearMessages = function() {
        $scope.submitResult.error = false;
        $scope.submitResult.success = false;
        $scope.submitResult.errorMessage = '';
    };

    $scope.listAllMenus = function() {
        $http({
          method: 'GET',
          url: getServerUrl() + '/kpos/webapp/menu/menus'
        }).then(function successCallback(response) {
            $scope.menuList = util.getElementsArray(response.data.menus);
            for (var i = 0; i < $scope.menuList.length; i++) {
                var menu = $scope.menuList[i];
                if (menu.productLine === 'POS') {
                    $scope.menuItemFilter.menuId = menu.id;
                    $scope.refreshCategoriesBySelectedMenu();
                    break;
                }
            }
        }, function errorCallback(response) {
            $scope.submitResult.error = true;
            $scope.submitResult.errorMessage = util.getStringValue(response);
            $scope.submitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.LOAD_FAIL, 'Error loading menu list');
            console.log("Error loading menu list, error: " + util.getStringValue(response));
        });
    };

    $scope.refreshCategoriesBySelectedMenu = function() {
        if ($scope.itemType == 'SALE_ITEM') {
            $scope.listCategoriesByMenu();
        } else if ($scope.itemType == 'GLOBAL_OPTION') {
            $scope.listGlobalOptionCategoriesByMenu();
        }
    };

    $scope.listCategoriesByMenu = function() {
        var menuId = $scope.menuItemFilter.menuId;
        $scope.menuCategoryList = [];
        $scope.menuSaleItemList = [];
        $http({
          method: 'GET',
          url: getServerUrl() + '/kpos/webapp/menu/menu/' + menuId + '/menuCategories?expandMenuLevel=1'
        }).then(function successCallback(response) {
            var saleItemList = [];
            $scope.menuCategoryList = util.getElementsArray(response.data.menuCategories);
            for (var i = 0; i < $scope.menuCategoryList.length; i++) {
                var category = $scope.menuCategoryList[i];
                var saleItems = util.getElementsArray(category.saleItems);
                for (var j = 0; j < saleItems.length; j++) {
                    var saleItem = saleItems[j];
                    saleItemList.push(saleItem);
                }
            }
            $scope.menuSaleItemList = saleItemList;
            $scope.menuItemSelectList = $scope.menuSaleItemList;
            $scope.menuCategoryFilterList = $scope.menuCategoryList;
        }, function errorCallback(response) {
            $scope.submitResult.error = true;
            $scope.submitResult.errorMessage = util.getStringValue(response);
            $scope.submitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.LOAD_FAIL, 'Error listing categories');
            console.log("Error listing categories, error: " + util.getStringValue(response));
        });
    };

    $scope.listGlobalOptionCategoriesByMenu = function() {
        var menuId = $scope.menuItemFilter.menuId;
        $scope.globalOptionCategoryList = [];
        $scope.globalOptionList = [];
        $http({
          method: 'GET',
          url: getServerUrl() + '/kpos/webapp/menu/menu/' + menuId + '/globalOptionCategories?expandMenuLevel=1'
        }).then(function successCallback(response) {
            var globalOptionList = [];
            $scope.globalOptionCategoryList = util.getElementsArray(response.data.globalOptionCategories);
            for (var i = 0; i < $scope.globalOptionCategoryList.length; i++) {
                var globalOptionCategory = $scope.globalOptionCategoryList[i];
                var globalOptions = util.getElementsArray(globalOptionCategory.globalOptions);
                for (var j = 0; j < globalOptions.length; j++) {
                    var globalOption = globalOptions[j];
                    globalOption.categoryId = globalOptionCategory.id;
                    globalOptionList.push(globalOption);
                }
            }
            $scope.globalOptionList = globalOptionList;
            $scope.menuItemSelectList = $scope.globalOptionList;
            $scope.menuCategoryFilterList = $scope.globalOptionCategoryList;
        }, function errorCallback(response) {
            $scope.submitResult.error = true;
            $scope.submitResult.errorMessage = util.getStringValue(response);
            $scope.submitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.LOAD_FAIL, 'Error loading menu list');
            console.log("Error loading menu list, error: " + util.getStringValue(response));
        });
    };

    $scope.listInventoryItemGroups = function() {
        var soapType = new FindInventoryItemGroupsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemgroupsresponsetype)) {
                $scope.inventoryItemGroupList = util.getElementsArray(jsonObj.findinventoryitemgroupsresponsetype.inventoryitemgroups);
            } else {
                console.log("Error getting inventory item group list");
            }
        }, {$http: $http});
    };

    $scope.listInventoryItems = function() {
        $scope.inventoryItemMapById = {};
        var soapType = new FindInventoryItemsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemsresponsetype)) {
                $scope.inventoryItemList = util.getElementsArray(jsonObj.findinventoryitemsresponsetype.inventoryitems);
                for (var i = 0; i < $scope.inventoryItemList.length; i++) {
                    var inventoryItem = $scope.inventoryItemList[i];
                    inventoryItem.displayInfo = inventoryItemService.getRecipeItemDisplayName(inventoryItem);
                    $scope.inventoryItemMapById[inventoryItem.id] = inventoryItem;
                }
            } else {
                console.log("Error getting inventory item list");
            }
        }, {$http: $http});
    };

    $scope.setItemType = function(type) {
        $scope.itemType = type;
        $scope.refreshCategoriesBySelectedMenu();
    };

    $scope.loadMenuRecipe = function(menuItem) {
        var soapType = new FindMenuRecipeType(menuItem.id);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findmenurecipesresponsetype)) {
                var recipeList = util.getElementsArray(jsonObj.findmenurecipesresponsetype.menurecipes);
                
                if (recipeList.length >= 1) {
                    $scope.currentMenuItemRecipe = recipeList[0];
                    $scope.currentMenuItemRecipe.inventoryItemList = util.getElementsArray($scope.currentMenuItemRecipe.inventoryitems);
                    $scope.currentMenuItemRecipe.actualTotalCost = null;
                    $scope.currentMenuItemRecipe.estimatedCost = 0.0;
                    for (var i = 0; i < $scope.currentMenuItemRecipe.inventoryItemList.length; i++) {
                        var item = $scope.currentMenuItemRecipe.inventoryItemList[i];
                        var inventoryItem = $scope.inventoryItemMapById[item.id];
                        if (util.isValidVariable(inventoryItem)) {
                            item.displayInfo = inventoryItemService.getRecipeItemDisplayName(inventoryItem);
                        } else {
                            console.log("Inventory item not found by id " + item.id);
                        }
                    }
                } else {
                    $scope.currentMenuItemRecipe = {
                        itemid: menuItem.id,
                        inventoryItemList: [],
                        totalCost: 0,
                        actualTotalCost: null,
                        estimatedCost: 0.0
                    };
                }
                $scope.calculateMenuItemEstimatedCost();
                $scope.currentMenuItemRecipe.hasActualCost = util.isValidNumber(jsonObj.findmenurecipesresponsetype.saleitemcost) ? true : false;
                $scope.currentMenuItemRecipe.totalCost = $scope.currentMenuItemRecipe.hasActualCost ? jsonObj.findmenurecipesresponsetype.saleitemcost : $scope.currentMenuItemRecipe.estimatedCost;
            } else {
                $scope.currentMenuItemRecipe = {
                    itemid: menuItem.id,
                    inventoryItemList: [],
                    totalCost: 0,
                    actualTotalCost: null,
                    estimatedCost: 0.0
                };
                //console.log("Error loading menu recipe");
            }
        }, {$http: $http});
    };

    $scope.saveMenuRecipe = function() {
        if ($scope.currentMenuItemRecipe == null) {
            console.log('Cannot save');
            return;
        }
        $scope.clearMessages();
        var soapOrderItemList = [];
        for (var i = 0; i < $scope.currentMenuItemRecipe.inventoryItemList.length; i++) {
            var item = $scope.currentMenuItemRecipe.inventoryItemList[i];
            var units = parseFloat(item.units);
            var itemSoapType = new MenuRecipeInventoryItemType(item.id, units);
            soapOrderItemList.push(itemSoapType);
        }
        var itemId = $scope.currentMenuItemRecipe.itemid;
        var itemName = $scope.currentMenuItemRecipe.itemname;
        var itemSizeId = $scope.currentMenuItemRecipe.itemsizeid;
        var itemSizeName = $scope.currentMenuItemRecipe.itemsizename;
        var itemCost = $scope.currentMenuItemRecipe.actualTotalCost;
        if (util.isValidNumber(itemCost)) {
            $scope.currentMenuItemRecipe.hasActualCost = true;
        }
        var userAuth = admin.getUserAuthInfo();
        
        var soapType = new SaveMenuRecipeType(itemId, itemName, itemSizeId, itemSizeName, soapOrderItemList, userAuth, itemCost);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.savemenureciperesponsetype)) {
                $scope.submitResult.success = true;
                if ($scope.currentMenuItemRecipe.hasActualCost) {
                    $scope.currentMenuItemRecipe.totalCost = util.isValidNumber($scope.currentMenuItemRecipe.actualTotalCost) ? $scope.currentMenuItemRecipe.actualTotalCost : $scope.currentMenuItemRecipe.totalCost;
                } else {
                    $scope.currentMenuItemRecipe.totalCost = $scope.currentMenuItemRecipe.estimatedCost;
                }
                $scope.currentMenuItemRecipe.actualTotalCost = null;
            } else {
                $scope.submitResult.error = true;
                $scope.submitResult.errorMessage = util.getStringValue(jsonObj.savemenureciperesponsetype.result.failurereason);
                $scope.submitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.SAVE_FAIL, 'Error saving menu recipe');
                console.log("Error saving menu recipe, error: " + util.getStringValue(jsonObj.savemenureciperesponsetype.result.failurereason));
            }
        }, {$http: $http});
    };

    $scope.addInventoryItem = function(inventoryItem) {
        if ($scope.currentMenuItemRecipe == null) {
            console.log('Cannot add');
            return;
        }
        
        // prevent adding same item multiple time
        for (var i = 0; i < $scope.currentMenuItemRecipe.inventoryItemList.length; i++) {
            if ($scope.currentMenuItemRecipe.inventoryItemList[i].id == inventoryItem.id) {
                return;
            }
        }
        
        var inventoryRecipeItem = {
            id: inventoryItem.id,
            displayInfo: inventoryItemService.getRecipeItemDisplayName(inventoryItem),
            units: 1.0
        };
        $scope.currentMenuItemRecipe.inventoryItemList.push(inventoryRecipeItem);
        $scope['focusQtyInput' + ($scope.currentMenuItemRecipe.inventoryItemList.length - 1)] = true;
        $scope.calculateMenuItemEstimatedCost();
    };

    $scope.removeInventoryItem = function(itemIndex) {
        if ($scope.currentMenuItemRecipe == null) {
            console.log('Cannot delete');
            return;
        }
        $scope.currentMenuItemRecipe.inventoryItemList.splice(itemIndex, 1);
        $scope.calculateMenuItemEstimatedCost();
    };

    $scope.calculateMenuItemEstimatedCost = function() {
        $scope.currentMenuItemRecipe.estimatedCost = 0.0;
        for (var i = 0; i < $scope.currentMenuItemRecipe.inventoryItemList.length; i++) {
            var item = $scope.currentMenuItemRecipe.inventoryItemList[i];
            var inventoryItem = $scope.inventoryItemMapById[item.id];
            if (util.isValidVariable(inventoryItem)) {
                var averageCost = isNaN(inventoryItem.averagecost) ? 0 : inventoryItem.averagecost;
                var baseUnitToRecipeUnitRatio = isNaN(inventoryItem.baseunittoproductionunitratio) ? 1 : inventoryItem.baseunittoproductionunitratio;
                if (baseUnitToRecipeUnitRatio == 0) {
                    baseUnitToRecipeUnitRatio = 1;
                }
                $scope.currentMenuItemRecipe.estimatedCost += item.units * averageCost / baseUnitToRecipeUnitRatio;
            } else {
                console.log("Inventory item not found by id " + item.id);
            }
        }
        $scope.currentMenuItemRecipe.estimatedCost = $scope.currentMenuItemRecipe.estimatedCost.toFixed(2);
    };

    $scope.sortTable = function(sortType) {
        $scope.sortType = sortType;
        $scope.sortReverse = !$scope.sortReverse;
    };

    $scope.init();
}]);


inventoryManagementApp.controller('inventoryReviewCtrlObj', ['$scope', '$http', 'inventoryItemService', function($scope, $http, inventoryItemService) {
    $scope.sortType = 'itemid'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order

    $scope.submitResult = {
        error: false,
        success : false,
        errorMessage: ''
    };

    var now = new Date();
    var oneDayBeforeNow = new Date();
    oneDayBeforeNow.setDate(now.getDate() - 1);

    $scope.inventoryItemChangeRecordFilter = {
        selectedInventoryItemGroupId: null,
        selectedInventoryItemId: null,
        selectedInventoryChangeType: 'INVENTORY_COUNT',
        fromDate: oneDayBeforeNow,
        toDate: now,
        groupByItem: true,
        showItemChangeLogDetails: true
    };

    $scope.inventoryItemChangeRecordList = [];
    $scope.inventoryItemChangeSummaryList = {};
    $scope.inventoryItemList = [];
    $scope.inventoryItemGroupList = [];
    $scope.inventoryData = [];
    $scope.currentReportRecord = null;
    $scope.temp = "";
    $scope.saleItemTemp = "";
    $scope.changedStockQTY = "";

    $scope.init = function() {
        $scope.listInventoryItemGroups();
        $scope.listInventoryItems();
        systemLanguage.loadLanguageForPage('inventoryLevelReviewPage');
    };

    $scope.sortTable = function(sortType) {
        $scope.sortType = sortType;
        $scope.sortReverse = !$scope.sortReverse;
    };

    $scope.exportData = function () {
        alasql('SELECT * INTO XLSX("Inventory_Level_Review.xlsx",{headers:true}) FROM ?',[$scope.inventoryData]);
    };

    $scope.listInventoryItemGroups = function() {
        var soapType = new FindInventoryItemGroupsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemgroupsresponsetype)) {
                $scope.inventoryItemGroupList = util.getElementsArray(jsonObj.findinventoryitemgroupsresponsetype.inventoryitemgroups);
            } else {
                console.log("Error getting inventory item group list");
            }
        }, {$http: $http});
    };

    $scope.listInventoryItems = function() {
        var soapType = new FindInventoryItemsType();
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemsresponsetype)) {
                $scope.inventoryItemList = util.getElementsArray(jsonObj.findinventoryitemsresponsetype.inventoryitems);
                for (var i = 0; i < $scope.inventoryItemList.length; i++) {
                    var inventoryItem = $scope.inventoryItemList[i];
                    inventoryItem.displayInfo = inventoryItemService.getItemDisplayName(inventoryItem);
                }
            } else {
                console.log("Error getting inventory item list");
            }
        }, {$http: $http});
    };

    $scope.getFormattedDeltaValue = function(value) {
        if (value > 0.0) {
            return "+" + value;
        }
        return value;
    };

    $scope.updateValue = function(totalValue, value) {
        if (!totalValue) {
            totalValue = 0;
        }
        totalValue += value;
        return totalValue;
    };

    $scope.clearSearchResult = function() {
        $scope.inventoryItemChangeRecordList = [];
        $scope.inventoryItemChangeSummaryList = [];
        $scope.inventoryData = [];
        $scope.temp = "";
        $scope.saleItemTemp = "";
        if ($scope.inventoryItemChangeRecordFilter.selectedInventoryChangeType == "SALE_ITEM_OUT_OF_STOCK") {
            $("#inventoryReport-itemGroup").prop("disabled", true);
            $("#inventoryReport-itemId").prop("disabled", true);
            $("#inventoryReport-itemGroup").val("");
            $("#inventoryReport-itemId").val("");
        } else {
            $("#inventoryReport-itemGroup").prop("disabled", false);
            $("#inventoryReport-itemId").prop("disabled", false);
        }
    };

    $scope.generateInventoryItemChangeRecords = function() {
        $scope.clearSearchResult();

        if (angular.isDate($scope.inventoryItemChangeRecordFilter.fromDate)) {
            var fromDate = baseReportObj.parseReportDate($scope.inventoryItemChangeRecordFilter.fromDate);
        }
        if (angular.isDate($scope.inventoryItemChangeRecordFilter.toDate)) {
            var toDate = baseReportObj.parseReportDate($scope.inventoryItemChangeRecordFilter.toDate);
        }

        var groupBy = null;
        if ($scope.inventoryItemChangeRecordFilter.groupByItem && $scope.inventoryItemChangeRecordFilter.selectedInventoryChangeType=='SALE_ITEM_OUT_OF_STOCK') {
            groupBy = 'SALE_ITEM';
        } else if ($scope.inventoryItemChangeRecordFilter.groupByItem && $scope.inventoryItemChangeRecordFilter.selectedInventoryChangeType!='INVENTORY_COUNT') {
            groupBy = 'ITEM';
        }
        var soapType = new FindInventoryItemChangeRecordsType(null, fromDate, toDate, $scope.inventoryItemChangeRecordFilter.selectedInventoryItemId,
                            $scope.inventoryItemChangeRecordFilter.selectedInventoryItemGroupId, $scope.inventoryItemChangeRecordFilter.selectedInventoryChangeType, groupBy);
        callWebService(soapType, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.findinventoryitemchangerecordsresponsetype)) {
                if (util.isValidVariable(jsonObj.findinventoryitemchangerecordsresponsetype.inventoryreport)) {
                    $scope.inventoryItemChangeRecordList = util.getElementsArray(jsonObj.findinventoryitemchangerecordsresponsetype.inventoryreport.itemchangerecords);
                    for (var i = 0; i < $scope.inventoryItemChangeRecordList.length; i++) {
                        $scope.enrichItemChangeRecord($scope.inventoryItemChangeRecordList[i]);
                    }
                    $scope.inventoryItemChangeSummaryList = util.getElementsArray(jsonObj.findinventoryitemchangerecordsresponsetype.inventoryreport.itemchangesummaryrecords);
                    for (var i = 0; i < $scope.inventoryItemChangeSummaryList.length; i++) {
                        var inventoryItemChangeSummary = $scope.inventoryItemChangeSummaryList[i];
                        $scope.changedStockQTY = inventoryItemChangeSummary;
                        var itemChangeRecordList = util.getElementsArray(inventoryItemChangeSummary.itemchangerecords);
                        for (var j = 0; j < itemChangeRecordList.length; j++) {
                            $scope.enrichItemChangeRecord(itemChangeRecordList[j]);
                        }
                        inventoryItemChangeSummary.changedestimatedusedqty = $scope.getFormattedDeltaValue(inventoryItemChangeSummary.changedestimatedusedqty);
                        inventoryItemChangeSummary.changedstockqty = $scope.getFormattedDeltaValue(inventoryItemChangeSummary.changedstockqty);
                        inventoryItemChangeSummary.itemchangerecords = itemChangeRecordList;
                    }
                }
            } else {
                $scope.submitResult.error = true;
                $scope.submitResult.errorMessage = systemLanguage.getMsgContent(systemLanguage.msgCodeList.LOAD_FAIL, 'Error querying purchase order result');
                console.log("Error querying item change record result");
            }
        }, {$http: $http});
    };

    $scope.enrichItemChangeRecord = function(inventoryItemChangeRecord) {
        var otherInfo = "";
        switch (inventoryItemChangeRecord.type) {
            case "Count":
                if (util.isValidVariable(inventoryItemChangeRecord.adjustmentreason)) {
                    otherInfo += "Adjust Reason: " + inventoryItemChangeRecord.adjustmentreason;
                }
                inventoryItemChangeRecord.estimatedEndingStockQty = util.getFloatValue(inventoryItemChangeRecord.originalstockqty - inventoryItemChangeRecord.originalestimatedusedqty);
                inventoryItemChangeRecord.actualEndingStockQty = util.getFloatValue(inventoryItemChangeRecord.originalstockqty + inventoryItemChangeRecord.changedstockqty);
                break;
            case "Rcv Item":
                if (util.isValidVariable(inventoryItemChangeRecord.purchaseorderid)) {
                    otherInfo += "PO#" + inventoryItemChangeRecord.purchaseorderid;
                }
                inventoryItemChangeRecord.originalestimatedusedqty = "";
                inventoryItemChangeRecord.changedestimatedusedqty = "";
                break;
            case "Sold":
                if (util.isValidVariable(inventoryItemChangeRecord.ordernumber)) {
                    otherInfo += "#" + inventoryItemChangeRecord.ordernumber + " - ";
                }
                if (util.isValidVariable(inventoryItemChangeRecord.orderitemname)) {
                    otherInfo += inventoryItemChangeRecord.orderitemname;
                } else if (util.isValidVariable(inventoryItemChangeRecord.orderitemoptionname)) {
                    otherInfo += inventoryItemChangeRecord.orderitemoptionname;
                }
                inventoryItemChangeRecord.originalstockqty = "";
                inventoryItemChangeRecord.changedstockqty = "";
                break;
            case "Used":
                break;
            case "Sale Items Out Of Stock":
                otherInfo = inventoryItemChangeRecord.itemname == undefined ? "" : inventoryItemChangeRecord.itemname;
                break;
            default:
                break;
        }

        if($scope.inventoryItemChangeRecordFilter.selectedInventoryChangeType == "COST_OF_GOODS_SOLD") {
            if($scope.temp != inventoryItemChangeRecord.itemid || $scope.temp == "") {
                $scope.inventoryData.push({
                   Number: inventoryItemChangeRecord.itemid,
                   Name: inventoryItemChangeRecord.itemname,
                   Type: "",
                   Orig_Estimated_Used_QTY: inventoryItemChangeRecord.originalestimatedusedqty,
                   Changed_Estimated_Used_QTY:$scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedestimatedusedqty),
                   Extra_Info: "",
                   Updated_At: "",
                   Updated_By: ""
                }, {
                  Number: "",
                  Name: "",
                  Type: inventoryItemChangeRecord.type,
                  Orig_Estimated_Used_QTY: "",
                  Changed_Estimated_Used_QTY:$scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedestimatedusedqty),
                  Extra_Info: otherInfo,
                  Updated_At: inventoryItemChangeRecord.lastupdated,
                  Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
               });
            } else {
                $scope.inventoryData.push({
                    Number: "",
                    Name: "",
                    Type: inventoryItemChangeRecord.type,
                    Orig_Estimated_Used_QTY: "",
                    Changed_Estimated_Used_QTY:$scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedestimatedusedqty),
                    Extra_Info: otherInfo,
                    Updated_At: inventoryItemChangeRecord.lastupdated,
                    Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
                });
            }
            $scope.temp = inventoryItemChangeRecord.itemid;
        } else if($scope.inventoryItemChangeRecordFilter.selectedInventoryChangeType == "RECEIVED_ITEMS") {//ok
            if($scope.temp != inventoryItemChangeRecord.itemid || $scope.temp == "") {       //$scope.temp != inventoryItemChangeRecord.itemid
                $scope.inventoryData.push({
                   Number: inventoryItemChangeRecord.itemid,
                   Name: inventoryItemChangeRecord.itemname,
                   Type: "",
                   Orig_Stock_QTY: inventoryItemChangeRecord.originalstockqty,
                   Changed_Stock_QTY: $scope.getFormattedDeltaValue($scope.changedStockQTY.changedstockqty),
                   Extra_Info: "",
                   Updated_At: "",
                   Updated_By: ""
                },{
                       Number: "",
                       Name: "",
                       Type: inventoryItemChangeRecord.type,
                       Orig_Stock_QTY: "",
                       Changed_Stock_QTY: $scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedstockqty),
                       Extra_Info: otherInfo,
                       Updated_At: inventoryItemChangeRecord.lastupdated,
                       Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
                });
            } else {
                $scope.inventoryData.push({
                    Number: "",
                    Name: "",
                    Type: inventoryItemChangeRecord.type,
                    Orig_Stock_QTY: "",
                    Changed_Stock_QTY: $scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedstockqty),
                    Extra_Info: otherInfo,
                    Updated_At: inventoryItemChangeRecord.lastupdated,
                    Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
                });
            }
            $scope.temp = inventoryItemChangeRecord.itemid;
        } else if($scope.inventoryItemChangeRecordFilter.selectedInventoryChangeType == "INVENTORY_COUNT") {//count ok
            $scope.inventoryData.push({
               Number: inventoryItemChangeRecord.itemid,
               Name: inventoryItemChangeRecord.itemname,
               Type: inventoryItemChangeRecord.type,
               Orig_Stock_QTY: inventoryItemChangeRecord.originalstockqty,
               Estimated_Used_QTY: inventoryItemChangeRecord.originalestimatedusedqty,
               Estimated_Ending_Stock_QTY: inventoryItemChangeRecord.estimatedEndingStockQty,
               Actual_Stock_QTY: inventoryItemChangeRecord.actualEndingStockQty,
               Extra_Info: otherInfo,
               Updated_At: inventoryItemChangeRecord.lastupdated,
               Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
            });
        } else if ($scope.inventoryItemChangeRecordFilter.selectedInventoryChangeType == "SALE_ITEM_OUT_OF_STOCK") {
            if($scope.saleItemTemp != inventoryItemChangeRecord.saleitemid || $scope.saleItemTemp == "") {
                $scope.inventoryData.push({
                   Number: inventoryItemChangeRecord.saleitemid,
                   Name: inventoryItemChangeRecord.saleitemname,
                   Extra_Info: "",
                   Updated_At: "",
                   Updated_By: ""
                },{
                   Number: "",
                   Name: "",
                   Extra_Info: otherInfo,
                   Updated_At: inventoryItemChangeRecord.lastupdated,
                   Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
                });
            } else {
                $scope.inventoryData.push({
                    Number: "",
                    Name: "",
                    Extra_Info: otherInfo,
                    Updated_At: inventoryItemChangeRecord.lastupdated,
                    Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
                });
            }
            $scope.saleItemTemp = inventoryItemChangeRecord.saleitemid;
        } else {
            if($scope.temp != inventoryItemChangeRecord.itemid || $scope.temp == "") {
                $scope.inventoryData.push({
                   Number: inventoryItemChangeRecord.itemid,
                   Name: inventoryItemChangeRecord.itemname,
                   Type: "",
                   Orig_Stock_QTY: inventoryItemChangeRecord.originalstockqty,
                   Changed_Stock_QTY: $scope.getFormattedDeltaValue($scope.changedStockQTY.changedstockqty),
                   Orig_Estimated_Used_QTY: inventoryItemChangeRecord.originalestimatedusedqty,
                   Changed_Estimated_Used_QTY:$scope.getFormattedDeltaValue($scope.changedStockQTY.changedestimatedusedqty),
                   Extra_Info: "",
                   Updated_At: "",
                   Updated_By: ""
                }, {
                    Number: "",
                    Name: "",
                    Type: inventoryItemChangeRecord.type,
                    Orig_Stock_QTY: "",
                    Changed_Stock_QTY: $scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedstockqty),
                    Orig_Estimated_Used_QTY: "",
                    Changed_Estimated_Used_QTY: $scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedestimatedusedqty),
                    Extra_Info: otherInfo,
                    Updated_At: inventoryItemChangeRecord.lastupdated,
                    Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
                });
            } else{
                $scope.inventoryData.push({
                    Number: "",
                    Name: "",
                    Type: inventoryItemChangeRecord.type,
                    Orig_Stock_QTY: "",
                    Changed_Stock_QTY: $scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedstockqty),
                    Orig_Estimated_Used_QTY: "",
                    Changed_Estimated_Used_QTY: $scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedestimatedusedqty),
                    Extra_Info: otherInfo,
                    Updated_At: inventoryItemChangeRecord.lastupdated,
                    Updated_By: util.getStringValue(inventoryItemChangeRecord.lastupdatedusername)
                });
            }
            $scope.temp = inventoryItemChangeRecord.itemid;
        }

        inventoryItemChangeRecord.changedestimatedusedqty = $scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedestimatedusedqty);
        inventoryItemChangeRecord.changedstockqty = $scope.getFormattedDeltaValue(inventoryItemChangeRecord.changedstockqty);
        inventoryItemChangeRecord.otherinfo = otherInfo;
    }

    $scope.init();
}]);