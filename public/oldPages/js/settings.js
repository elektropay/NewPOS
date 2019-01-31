var settingsObj = {
    init : function() {}
};

var settingApp = angular.module('settingApp', []);

settingApp.directive('autoWidth', ['$timeout', function($timeout) {
    return {
        link: function(scope, elm, attrs, controller){
            $timeout(function(){
                var parentWidth = $(elm).parent().width();
                var prevWidth = $(elm).prev().width();
                var remainWidth = parentWidth - prevWidth;
                $(elm).width(remainWidth-46);
            });  
        }
    };
}]);

settingApp.directive('myCheckboxTrigger', [function() {
    return {
        link: function(scope, elm, attrs, controller){
            elm.bind('click', function() {
                var attributes = scope.$eval(attrs.myCheckboxTrigger);
                var prefix = attributes.type + '_';
                var id = prefix + attrs.id.split('_')[1];
                var isChecked = false;
                if ($('#'+id).prop('checked')) {
                    $(elm).removeClass("ui-checkbox-on");
                    $(elm).addClass("ui-checkbox-off");
                    $('#'+id).prop('checked', false);
                    isChecked = false;
                } else {
                    $(elm).removeClass("ui-checkbox-off");
                    $(elm).addClass("ui-checkbox-on");
                    $('#'+id).prop('checked', true);  
                    isChecked = true;
                }
                $('#'+id).val(isChecked).trigger('change');
            });
        }
    };
}]);

settingApp.directive('myCheckboxDefaultValueSetter', ['$timeout', function($timeout){
    return {
        link: function(scope, elm, attrs, controller) {
            $timeout(function(){
                var attributes = scope.$eval(attrs.myCheckboxDefaultValueSetter);
                var config = attributes.config;
                if (config.value == 'true') {
                    var prefix = attributes.type + 'Label_';
                    var id = prefix + attrs.id.split('_')[1];
                    $('#'+id).removeClass("ui-checkbox-off");
                    $('#'+id).addClass("ui-checkbox-on"); 
                    $(elm).prop('checked', true);         
                }
            });  
        }
    };
}]);

settingApp.directive('myMultiCheckboxDefaultValueSetter', ['$timeout', function($timeout){
    return {
        link: function(scope, elm, attrs, controller) {
            $timeout(function(){
                var attributes = scope.$eval(attrs.myMultiCheckboxDefaultValueSetter);
                var config = attributes.config;
                var res = attributes.res;
                var prefix = attributes.type + 'Label_';   
                var vals = util.getStringValue(config.value).split(",");
                for (var val in vals) {
                    if (vals[val] == res.value) {
                        var id = prefix + attrs.id.split('_')[1];
                        $('#'+id).removeClass("ui-checkbox-off");
                        $('#'+id).addClass("ui-checkbox-on"); 
                        $(elm).prop('checked', true);         
                        break;
                    }
                }
            });  
        }
    };
}]);

settingApp.directive('mySelectDefaultValueSetter', ['$timeout', function($timeout){
    return {
        link: function(scope, elm, attrs, controller) {
            $timeout(function(){
                var attributes = scope.$eval(attrs.mySelectDefaultValueSetter);
                var config = attributes.config;
                var res = attributes.res;
                if (scope.$last) {
                    scope.selectValueSetter(config, attributes.type);
                }
            });  
        }
    };
}]);

settingApp.directive('myConfigValueChange', [function(){
    return {
        link: function(scope, elm, attrs, controller) {
            elm.bind('change', function() {
                var attributes = scope.$eval(attrs.myConfigValueChange);
                var config;
                if (scope.pendingSaveList[attributes.config.name] != undefined) {
                    config = scope.pendingSaveList[attributes.config.name];
                } else {
                    config = jQuery.extend(true, {}, attributes.config);
                }
                var res = attributes.res;
                var range = attributes.range;
                
                if (attributes.type.indexOf('input') > -1) {
                    config.value = $(elm).val();
                } else if (attributes.type.indexOf('select') > -1) {
                    config.value = $(elm).val();
                    var isDefaultValue = true;
                    for (var i in config.restrictions) {
                        if (config.restrictions[i].value == config.value) {
                            $("#"+attributes.type+"_"+config.id).prev().text(config.restrictions[i].name);
                            isDefaultValue = false;
                            break;
                        }
                    }
                    if (isDefaultValue) {
                        $("#"+attributes.type+"_"+config.id).prev().text("Default");
                        $("#"+attributes.type+"_"+config.id).val(''); 
                        config.value = '';
                    }
                } else if (attributes.type.indexOf('checkbox') > -1) {
                    config.value = $(elm).prop('checked')+'';
                } else if (attributes.type.indexOf('multiCheckbox') > -1) {
                    if ($(elm).prop('checked')) {
                        if (util.isValidVariable(config.value)) {
                            var tmpVals = util.getStringValue(config.value).split(',');
                            tmpVals.push(res.value);
                            config.value = tmpVals.sort().join(',');
                        } else {
                            config.value = res.value;    
                        }
                    } else {
                        var vals = util.getStringValue(config.value).split(",").sort();
                        var tmpVals = [];
                        for (var val in vals) {
                            if (vals[val] != res.value) {
                                tmpVals.push(vals[val]);
                            }
                        }
                        config.value = tmpVals.length > 0 ? tmpVals.join(',') : undefined;
                    }
                }
                scope.pendingSaveList[config.name] = config;
            });
        }
    };
}]);

settingApp.controller('settingController', ['$scope', '$http', '$compile', function($scope, $http, $compile) { 
    $scope.range = 'global';
    $scope.systemConfigurationMap = {};
    $scope.systemConfigurationMap.global = {};
    $scope.systemConfigurationMap.user = {};
    $scope.systemConfigurationMap.app = {}; // {category: {secondLevelCategoryDisplayName: {configName: config}}}
    $scope.categoryList = [];
    $scope.pendingSaveList = {};
    $scope.searchResultList = [];
    $scope.isSearchMode = false;
    
    $scope.configListMapBySecondLevelCategory = {};
    $scope.userConfigListMapBySecondLevelCategory = {};
    $scope.appConfigListMapBySecondLevelCategory = {};
    
    $scope.categorySystemLanguageDisplayValueMap = {};
    $scope.slcSystemLanguageDisplayValueMap = {};
    
    $scope.trackByValueAndId = function(config) {
        return util.getStringValue(config.value) + config.id;
    }
    
    var clear = function() {
        $scope.configListMapBySecondLevelCategory = {};
        $scope.pendingSaveList = {};
        $scope.searchResultList = [];
        $('#configs-category-list').find('li').removeClass("config-category-selected");
        $('#staff-list').find('li').removeClass("config-category-selected");
        $('#app-list').find('li').removeClass("config-category-selected");
        $scope.isSearchMode = false;
        $scope.searchBoxValue = undefined;
        
        paymentConfigObj.clear();
    }
    
    $scope.getCategorySystemLanguageDisplayVal = function(cName) {
        return $scope.categorySystemLanguageDisplayValueMap[cName];
    }
    
    $scope.getSlcSystemLanguageDisplayVal = function(slc) {
        return $scope.slcSystemLanguageDisplayValueMap[slc];
    }
    
    $scope.selectValueSetter = function(config, idPrefix) {
        var prefix = idPrefix + "_";
        var hasDefaultValue = false;

        if (!(config.restrictions instanceof Array) && config.restrictions != null) {
            var restrictions = [];
            restrictions.push(config.restrictions);
            config.restrictions = restrictions;
        }

        for (var i in config.restrictions) {
            var res = config.restrictions[i];
            if (res.name.toUpperCase() === 'DEFAULT' || util.isBooleanTrue(res.defaultoption)) {
                hasDefaultValue = true;
                break;
            }
        }
        if (!hasDefaultValue && $("#"+prefix+config.id).find('.default-option').length == 0) {
            var optionHtml = '<option value="" class="default-option">Default</option>';
            $("#"+prefix+config.id).prepend(optionHtml).trigger('create');
        }
        $("#"+prefix+config.id).prev().text("Default");
        $("#"+prefix+config.id).val(''); 
        for (var i in config.restrictions) {
            var res = config.restrictions[i];
            if (res.value == config.value) {
                $("#"+prefix+config.id).prev().text(res.name);
                $("#"+prefix+config.id).val(config.value);   
                break;
            }
        }
    }
    
    var fetchAllSystemConfigurations = function() {
        var soapType = new FindSystemConfigurationsType(null, true);
        var nextgo = function(jsonObj){
            fetchAllSystemConfigurationsHandler(jsonObj);
//            if (settingsObj.currentGlobalCategoryName == 'Membership Program') { // only accept this category for now
//                settingsObj.populateSettingDetails("settingsDetail", settingsObj.currentGlobalCategoryName, "global");    
//            }
        }
        callWebService(soapType, nextgo, {$http: $http});
    };
    
    var fetchAllSystemConfigurationsHandler = function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
            $scope.categoryList = [];
            var systemConfigurationList = util.getElementsArray(jsonObj.listsystemconfigurationsresponsetype.systemconfiguration);
            for (var i = 0; i < systemConfigurationList.length; i++) {
                var config = systemConfigurationList[i];
                if (config.secondlevelcategory == undefined) {
                    continue;
                }
                if ($scope.categorySystemLanguageDisplayValueMap[config.category] == undefined) {
                    $scope.categorySystemLanguageDisplayValueMap[config.category] = systemLanguage.getDataDisplayValue(config, config.category, config.category, 'SYSTEM_CONFIG_CATEGORY');
                }
                if ($scope.slcSystemLanguageDisplayValueMap[config.secondlevelcategory] == undefined) {
                    $scope.slcSystemLanguageDisplayValueMap[config.secondlevelcategory] = systemLanguage.getDataDisplayValue(config, config.secondlevelcategory, config.secondlevelcategorydisplayname, 'SYSTEM_CONFIG_SECOND_LEVEL_CATEGORY');
                }
                if (config.globalsetting == "true") {
                    if (biscuitf.m() == 'lite') {
                        if (config.category != "Gift Card" && config.category != "Inventory" && config.category != "Membership Program") {
                            if (config.secondlevelcategory != "Order_Number_Display" && config.secondlevelcategory != "Message_Center") {
                                if (["IS_SHOW_COURSE", "SESSION_MODE", "TOTAL_REPORT_INCLUDE_GIFT_CARD_TOTAL",
                                "TOTAL_REPORT_SHOW_GIFT_CARD_SOLD_TOTAL", "AUTO_SET_OUT_OF_STOCK_FOR_SALE_ITEM",
                                "TOTAL_REPORT_SHOW_SALE_ITEMS_COST", "IS_HIDE_PAGER_BUTTON", "IS_HIDE_CALLOFF_BUTTON"].indexOf(config.name) < 0) {
                                    if (config.name == "PRINT_PAYMENT_RECEIPT") {
                                        var objToArray = [];
                                        objToArray.push(config.restrictions);
                                        config.restrictions = objToArray;
                                    }
                                    buildSystemConfigMap(config, $scope.systemConfigurationMap.global);
                                }
                            }
                        }
                    } else {
                        buildSystemConfigMap(config, $scope.systemConfigurationMap.global);
                    }
                }
                if (config.usersetting == "true") {
                    buildSystemConfigMap(config, $scope.systemConfigurationMap.user);
                }
                if (config.appsetting == "true") {
                    buildSystemConfigMap(config, $scope.systemConfigurationMap.app);
                }
            }
            for (var cName in $scope.systemConfigurationMap.global) {
                $scope.categoryList.push(cName);
            }
            $scope.categoryList.sort();
        }
    };
    
    var buildSystemConfigMap = function(config, map) {
        var secondLevelCategoryList = map[config.category];
        if (typeof secondLevelCategoryList == "undefined") {
            secondLevelCategoryList = {};
            map[config.category] = secondLevelCategoryList;
        }
        var configMap = map[config.category][config.secondlevelcategory];
        if (typeof configMap == "undefined") {
            configMap = {};
            map[config.category][config.secondlevelcategory] = configMap;
        }
        config.configSystemLanguageDisplayValue = systemLanguage.getDataDisplayValue(config, config.name, config.displayname, 'SYSTEM_CONFIG');
        configMap[config.name] = config;
    };
    
    $scope.showConfigByConfigRange = function(range) {
        if ($scope.range == range) {
            return;
        } 
        clear();
        $scope.range = range;
        
        $('#navbar-globalSettingsTab').css('border-bottom-color', '#ddd');
        $('#navbar-userSettingsTab').css('border-bottom-color', '#ddd');
        $('#navbar-appSettingsTab').css('border-bottom-color', '#ddd');
        
        $('#navbar-globalSettingsTab').removeClass('ui-btn-active');
        $('#navbar-userSettingsTab').removeClass('ui-btn-active');
        $('#navbar-appSettingsTab').removeClass('ui-btn-active');
        
        $('#globalSettingsTab').hide();
        $('#userSettingsTab').hide();
        $('#appSettingsTab').hide();
        
        if ($scope.range == 'global') {
            $('#globalSettingsTab').show();
            $('#navbar-globalSettingsTab').css('border-bottom-color', '#459DE4');
            $("#search-box").textinput('enable');
            $('#settingsDetail').hide();
        } else if ($scope.range == 'user') {
            $('#userSettingsTab').show();
            $('#navbar-userSettingsTab').css('border-bottom-color', '#459DE4');
            $("#search-box").textinput('disable');
            $('#userSettingsDetail').hide();
        } else if ($scope.range == 'app') {
            $('#appSettingsTab').show();
            $('#navbar-appSettingsTab').css('border-bottom-color', '#459DE4');
            $("#search-box").textinput('disable');
            $('#appSettingsDetail').hide();
        }
    }
    
    $scope.generateGlobalConfigDetail = function($event, categoryName) {
        if ($($event.target).hasClass('config-category-selected')) {
            return;
        }
        clear();
        if (categoryName == 'Payment') {
            paymentConfigObj.addPaymentSettingDiv($('#settings-detail-content'));
        }
        $($event.target).addClass('config-category-selected');
        $('#settingsDetail').show();
        $scope.configListMapBySecondLevelCategory = $scope.systemConfigurationMap.global[categoryName];
    };
    
    $scope.saveConfigChanges = function() {
        var configurationList = [];
        for (var key in $scope.pendingSaveList) {
            var config = $scope.pendingSaveList[key];
            var systemConfigurationSoapType = getSystemConfigurationSoapType(config, 'global');
//                if (elementObj.data("configType") == "TIME" && !settingsObj.isValidDateFormat(systemConfigurationSoapType.value)) {
//                    uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "Time format has to be: (hh:mm)!");
//                    return;
//                }
            configurationList.push(systemConfigurationSoapType);
        }
        if (configurationList.length > 0 || paymentConfigObj.paymentServiceConfigChanged) {
            if (configurationList.length > 0) {
                var userAuth = biscuit.u().userid == 'wisdomount' ? undefined : new UserAuthenticationType(biscuit.u().userid);
                var soapType = new UpdateSystemConfigurationsType(configurationList, userAuth);
                var bool = validateWaitlistFormat(configurationList);
                if(validateGlobalUnitMeasureFormat(configurationList) == false){
                    return;
                }
                if (bool) return;
                $("#saveSettingsPopup").popup("open");
                $("button[type='submit']").prop('disabled',true);
                window.setTimeout(function() {callWebService(soapType, updateSystemConfigurationsHandler);}, 500);  
            }   
            if (paymentConfigObj.paymentServiceConfigChanged) {
                paymentConfigObj.savePaymentServiceProviderConfig();
            }  
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.NOTHING_TO_UPDATE, null, null, uiBaseObj.WARN);    
        }  
    };

    var validateWaitlistFormat = function(configurationList){
        for (var i=0; i<configurationList.length; i++){
            var configuration = configurationList[i];
            if (configuration.name == 'PARTY_INITIALS' || configuration.name == 'PARTY_SIZE') {
                var partyInitialsValue = document.getElementById("input_"+$scope.systemConfigurationMap.global.Device.Waitlist.PARTY_INITIALS.id).value.trim();
                var partySizeValue = document.getElementById("input_"+$scope.systemConfigurationMap.global.Device.Waitlist.PARTY_SIZE.id).value.trim();
                if(util.isNullOrEmpty(partyInitialsValue) && util.isNullOrEmpty(partySizeValue)) return false;// 两个值都不存在，保存成功
                var partyInitials = partyInitialsValue.split(",");
                var partySize = partySizeValue.split(",")
                if (partyInitials.length != partySize.length){// 数量不一致
                    uiBaseObj.alert(systemLanguage.msgCodeList.WAITLIST_NUMBER_MATCH, null, null, uiBaseObj.WARN);
                    return true;
                }
                if (partyInitials.length > 6 || partySize.length >6){// 数量超过6
                    uiBaseObj.alert(systemLanguage.msgCodeList.WAITLIST_MAX_SIX_NUMBER, null, null, uiBaseObj.WARN);
                    return true;
                }
                for(var i=0;i<partySize.length;i++){
                    var size = partySize[i].trim();
                    var lastSize = -1;
                    if(i>0) lastSize = partySize[i - 1].trim();
                    if(!util.isPositiveInteger(size)){// partySize 必须正整数
                        uiBaseObj.alert(systemLanguage.msgCodeList.WAITLIST_ONLY_NUMBER, null, null, uiBaseObj.WARN);
                        return true;
                    }
                    if(parseInt(size)<=parseInt(lastSize)) {// partySize需要递增
                        uiBaseObj.alert(systemLanguage.msgCodeList.WAITLIST_SIZE_INCREMENT, null, null, uiBaseObj.WARN);
                        return true;
                    }
                    var initial = partyInitials[i].trim();
                    if(!util.isValidVariable(initial) || initial.length > 6){// partyInitial不可以存在空格且长度需小于等于6
                        uiBaseObj.alert(systemLanguage.msgCodeList.WAITLIST_INITIAL_EXIST_SPACES, null, null, uiBaseObj.WARN);
                        return true;
                    }
                }
                var firstPartySize = parseInt(partySize[0].trim());
                var lastPartySize = parseInt(partySize[partySize.length-1].trim());
                if(firstPartySize != 0 || lastPartySize>99){
                    uiBaseObj.alert(systemLanguage.msgCodeList.WAITLIST_SIZE_VALIDATE, null, null, uiBaseObj.WARN);
                    return true;
                }
            }else if (configuration.name == 'WRAPPING_COINS_COUNT') {
                    var wrappingCoinsCount = document.getElementById("input_"+$scope.systemConfigurationMap.global.Management.Cash_Drawer.WRAPPING_COINS_COUNT.id).value.trim();
                    if(null!=wrappingCoinsCount && wrappingCoinsCount!=''){
                        var wrappingCoins = wrappingCoinsCount.split(",");
                        if (wrappingCoins.length!=6){// 数量6
                            uiBaseObj.alert(systemLanguage.msgCodeList.WRAPPING_COINS_COUNT_SIX_NUMBER, null, null, uiBaseObj.WARN);
                            return true;
                        }
                        for(var i=0;i<wrappingCoins.length;i++){
                            var size = wrappingCoins[i].trim();
                            if(!util.isPositiveInteger(size.trim())){// wrappingCoins 必须正整数
                                uiBaseObj.alert(systemLanguage.msgCodeList.WRAPPING_COINS_COUNT_ONLY_NUMBER, null, null, uiBaseObj.WARN);
                                return true;
                            }
                        }
                    }
            }
        }
        return false;
    };

    //验证global unit of measure 为英文
    var validateGlobalUnitMeasureFormat = function(configurationList){
        for (var i=0; i<configurationList.length; i++){
            var configuration = configurationList[i];
            if (configuration.name == 'GLOBAL_UNIT_OF_MEASURE' || configuration.name == 'GLOBAL_UNIT_OF_MEASURE') {
                console.log("RECEIPT_PRINT.Receipt_Layout.GLOBAL_UNIT_OF_MEASURE.id",$scope.systemConfigurationMap.global['Receipt Printing'].Receipt_Layout.GLOBAL_UNIT_OF_MEASURE)
                var unitMeasureVal = document.getElementById("input_"+$scope.systemConfigurationMap.global['Receipt Printing'].Receipt_Layout.GLOBAL_UNIT_OF_MEASURE.id).value.trim();
                console.log("unitMeasureVal",unitMeasureVal)
                var reg=/^[a-zA-Z]*$/;
                if(!reg.test(unitMeasureVal))
                {
                    uiBaseObj.alert(systemLanguage.msgCodeList.GLOBAL_UNIT_OF_MEASURE, null, null, uiBaseObj.WARN);
                    return false;
                }

            }
            return true;
        }
    };

    $scope.saveSearchConfigChange = function(config) {
        var copyConfig;
        if (config.configtype == 'CHECK' || (config.configtype=='INPUT' && config.datatype=='Boolean')) {
            var id = '#search-checkbox_' + config.id;
            if ($(id).val() != config.value) {
                copyConfig = jQuery.extend(true, {}, config);
                copyConfig.value = $(id).val();
                config.value = $(id).val();
            }
        } else if (config.configtype == 'SELECT') {
            var id = '#search-select_' + config.id;
            if ($(id).val() != config.value) {
                copyConfig = jQuery.extend(true, {}, config);
                copyConfig.value = $(id).val();
                config.value = $(id).val();
            }
        } else if (config.configtype == 'INPUT' && config.datatype != 'Boolean') {
            var id = '#search-input_' + config.id;
            if ($(id).val() != config.value) {
                copyConfig = jQuery.extend(true, {}, config);
                copyConfig.value = $(id).val();
                config.value = $(id).val();
            }
        } else if (config.configtype == 'MULTI_SELECT') {
            var idPrefix = '#search-multiCheckbox_';
            var newConfigVal = [];
            for (var i in config.restrictions) {
                var res = config.restrictions[i];
                if ($(idPrefix+res.id).prop('checked')) {
                    newConfigVal.push(res.value);
                }
            }
            var originalConfigVal = util.isValidVariable(config.value) ? util.getStringValue(config.value).split(',').sort().join(',') : '';    
            newConfigVal = newConfigVal.sort().join(',');
            if (originalConfigVal != newConfigVal) {
                copyConfig = jQuery.extend(true, {}, config);
                copyConfig.value = newConfigVal;
                config.value = newConfigVal;
            }
        }
        
        if (!!copyConfig) {
            var systemConfigurationSoapType = getSystemConfigurationSoapType(copyConfig, 'GLOBAL');
//                if (elementObj.data("configType") == "TIME" && !settingsObj.isValidDateFormat(systemConfigurationSoapType.value)) {
//                    uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "Time format has to be: (hh:mm)!");
//                    return;
//                }
            var configurationList = [];
            configurationList.push(systemConfigurationSoapType);
            var userAuth = biscuit.u().userid == 'wisdomount' ? undefined : new UserAuthenticationType(biscuit.u().userid);
            var soapType = new UpdateSystemConfigurationsType(configurationList, userAuth);
            $("#saveSettingsPopup").popup("open");
            $("button[type='submit']").prop('disabled',true);
            window.setTimeout(function() {callWebService(soapType, updateSystemConfigurationsHandler);}, 500);  
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.NOTHING_TO_UPDATE, null, null, uiBaseObj.WARN);    
        }
    };
    
    var updateSystemConfigurationsHandler = function (jsonObj) {
        $("#saveSettingsPopup").popup("close");
        $("button[type='submit']").prop('disabled',false);
        window.setTimeout(function() {
            if (util.isSuccessfulResponse(jsonObj.updatesystemconfigurationresponsetype)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS, null, null, uiBaseObj.SUCCESS);
            } else {
                if(jsonObj.updatesystemconfigurationresponsetype.result.failurereason =='You Have Joined The CMS System, If You Need to Cancel The Synchronization Settings, Please Go to CMS Delete Location!'){
                    $("#checkboxLabel_"+jsonObj.updatesystemconfigurationresponsetype.failedsystemconfigurationids).removeClass("ui-checkbox-off");
                    $("#checkboxLabel_"+jsonObj.updatesystemconfigurationresponsetype.failedsystemconfigurationids).addClass("ui-checkbox-on");
                }
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Fail to save all configuration changes!", jsonObj.updatesystemconfigurationresponsetype.result, uiBaseObj.ERROR);
            }
            
//            $scope.pendingSaveList = {};
            fetchAllSystemConfigurations();
        }, 300);
    };

    var getSystemConfigurationSoapType = function(config, configLevel) {
        var id = config.id;
        var name = config.name;
        var value = config.value;
        var dataType = config.datatype;
        
        var configSoapType;
        if (configLevel == 'user') {
            configSoapType = new UserConfigurationType(id, name, value, dataType);
        } else if (configLevel == 'app') {
            configSoapType = new AppConfigurationType(id, name, value, dataType);
        } else {
            configSoapType = new SystemConfigurationType(id, name, value, dataType);
        }
        return configSoapType;
    };
    
    $scope.cancelConfigChanges = function() {
        clear();
        $('#settingsDetail').hide();
        $('#userSettingsDetail').hide();
        $('#appSettingsDetail').hide();
    };
    
    $scope.cancelSearchConfigChange = function(config) {
        $scope.configListMapBySecondLevelCategory = {};
        $scope.pendingSaveList = {};
        var val = $scope.systemConfigurationMap.global[config.category][config.secondlevelcategorydisplayname][config.name].value;
        if (config.configtype == 'CHECK' || config.configtype == 'SELECT' || config.configtype == 'INPUT') {
            var id = '#search-input_' + config.id;
            $(id).val(val).trigger('change');
        } else if (config.configtype == 'MULTI_SELECT') {
            var idPrefix = '#search-multiCheckbox_';
            val = util.isValidVariable(val) ? val : '';
            var configValList = val.split(',');
            var idMapByResValue = {};
            for (var i in config.restrictions) {
                idMapByResValue[config.restrictions[i].value] = config.restrictions[i].id;
            }
            for (var i in configValList) {
                var resId = idPrefix + idMapByResValue[configValList[i]];
                $(resId).val(configValList[i]).trigger('change');
            }
        }
    };
    
    $scope.showSearchDetail = function($event, configId) {
        $('#search-result-div-detail_'+configId).toggle();
        $($event.target).toggleClass('ui-icon-carat-d');
        $($event.target).toggleClass('ui-icon-carat-u');
    }
    
    $scope.showAdvanceSettings = function($event) {
        $($event.target).parent().parent().next().next().toggleClass('ng-hide');
        $($event.target).toggleClass('ui-icon-carat-d');
        $($event.target).toggleClass('ui-icon-carat-u');
    }
        
    $scope.searchConfig = function(searchBoxValue) {
        $scope.searchResultList = [];
        $scope.configListMapBySecondLevelCategory = {};
        $scope.pendingSaveList = {};
        $('#configs-category-list').find('li').removeClass("config-category-selected");
        $('#settingsDetail').hide();
        if (util.isValidVariable(searchBoxValue)) {
            $scope.isSearchMode = true;
            for (var c in $scope.systemConfigurationMap[$scope.range]) {
                var configMapBySLC = $scope.systemConfigurationMap[$scope.range][c];
                for (var slc in configMapBySLC) {
                    var configMapByName = configMapBySLC[slc];
                    for (var configName in configMapByName) {
                        var config = configMapByName[configName];
                        if (util.getStringValue(config.configSystemLanguageDisplayValue).toLowerCase().indexOf(searchBoxValue.toLowerCase()) !== -1
                            || util.getStringValue(config.description).toLowerCase().indexOf(searchBoxValue.toLowerCase()) !== -1
                            || util.getStringValue(config.displayname).toLowerCase().indexOf(searchBoxValue.toLowerCase()) !== -1) {
                            $scope.searchResultList.push(jQuery.extend(true, {}, config));
                        }
                    }
                }
            }
        } else {
            $scope.isSearchMode = false;
        }
    }
    
    $scope.showConfigDescription = function(config) {
        $('#popupConfigDetail').find("p").text(util.getStringValue(config.description));
    }


// user setting page
    $scope.staffMapByName = {};
    $scope.currentUser;
    
    var listAllStaff = function () {
        var soapType = new ListStaffType(true);
        callWebService(soapType, listAllStaffHandler, {$http: $http});
    };
    
    var listAllStaffHandler = function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.liststaffresponsetype)) {
            $scope.staffMapByName = {};
            var staffList = util.getElementsArray(jsonObj.liststaffresponsetype.staff);
            for (var i in staffList) {
                $scope.staffMapByName[staffList[i].name] = staffList[i];
            }
        }
    };

    $scope.generateUserConfigDetail = function($event, staff) {
        $scope.currentUser = staff;
        $scope.userConfigListMapBySecondLevelCategory = {};
        $scope.pendingSaveList = [];
        $('#staff-list').find('li').removeClass("config-category-selected");
        $($event.target).addClass('config-category-selected');
        $('#userSettingsDetail').show();

        
        var userConfigMapByConfigId = {};
        var userConfigList = staff.user.settings;
        if (!(userConfigList instanceof Array)) {
            userConfigList = userConfigList == undefined ? [] : [userConfigList];
        }   
        
        for (var i in userConfigList) {
            var userConfig = userConfigList[i];
            userConfigMapByConfigId[userConfig.id] = userConfig;
        }
        for (var c in $scope.systemConfigurationMap.user) {
            for (var slc in $scope.systemConfigurationMap.user[c]) {
                if (!$scope.userConfigListMapBySecondLevelCategory[slc]) {
                    $scope.userConfigListMapBySecondLevelCategory[slc] = {};
                }
                for (var name in $scope.systemConfigurationMap.user[c][slc]) {
                    var config = jQuery.extend(true, {}, $scope.systemConfigurationMap.user[c][slc][name]);
                    if (!!userConfigMapByConfigId[config.id]) {
                        config.value = userConfigMapByConfigId[config.id].value;
                    } else {
                        if (config.configtype=='CHECK' || (config.configtype=='INPUT' && config.datatype=='Boolean')) {
                            config.value = undefined;    
                        } else {
                            config.value = undefined;
                        }
                    }
                    $scope.userConfigListMapBySecondLevelCategory[slc][name] = config;
                    $scope.pendingSaveList[name] = config;
                }
            }
        }
    }
    
    $scope.saveUserConfigChanges = function() {
        var configurationList = [];
        for (var key in $scope.pendingSaveList) {
            var config = $scope.pendingSaveList[key];
            var systemConfigurationSoapType = getSystemConfigurationSoapType(config, 'user');
            if (util.isValidVariable(systemConfigurationSoapType)) {
                configurationList.push(systemConfigurationSoapType);
            }
        }
        var userAuth = biscuit.u().userid == 'wisdomount' ? undefined : new UserAuthenticationType(biscuit.u().userid);
        var soapType = new SaveStaffUserConfigType($scope.currentUser.id, $scope.currentUser.user.id, configurationList, true, userAuth);
        $("#saveSettingsPopup").popup("open");
        $("button[type='submit']").prop('disabled',true);
        window.setTimeout(function() {callWebService(soapType, saveUserConfigChangesHandler);}, 500);    
    };
    
    var saveUserConfigChangesHandler = function(jsonObj) {
        $("#saveSettingsPopup").popup("close");
        $("button[type='submit']").prop('disabled',false);
        window.setTimeout(function() {
            if (util.isSuccessfulResponse(jsonObj.savestaffresponsetype)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS, null, null, uiBaseObj.SUCCESS);
            } else {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Fail to save staff configuration changes!", jsonObj.savestaffresponsetype.result, uiBaseObj.ERROR);
            }
            
            $scope.pendingSaveList = {};
            listAllStaff();
            fetchAllSystemConfigurations();
        }, 300);
    };
    
// app setting page
    $scope.appInstanceList;
    $scope.currentApp;
    
    var listAllAppInstances = function() {
        var soapType = new FindAppInstancesType();
        callWebService(soapType, listAppInstancesHandler, {$http: $http});
    };
    
    var listAppInstancesHandler = function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findappinstancesresponsetype)) {
            $scope.appInstanceList = util.getElementsArray(jsonObj.findappinstancesresponsetype.appinstances);
        }
    };
    
    $scope.generateAppConfigDetail = function($event, app) {
        $scope.currentApp = app;
        $scope.pendingSaveList = [];
        $scope.appConfigListMapBySecondLevelCategory = {};
        $('#app-list').find('li').removeClass("config-category-selected");
        $($event.target).addClass('config-category-selected');
        $('#appSettingsDetail').show();
        
        var appConfigMapByConfigId = {};
        var appConfigList = app.settings;
        if (!(appConfigList instanceof Array)) {
            appConfigList = appConfigList == undefined ? [] : [appConfigList];
        }   
        
        for (var i in appConfigList) {
            var appConfig = appConfigList[i];
            appConfigMapByConfigId[appConfig.id] = appConfig;
        }
        
        for (var c in $scope.systemConfigurationMap.app) {
            for (var slc in $scope.systemConfigurationMap.app[c]) {
                if (!$scope.appConfigListMapBySecondLevelCategory[slc]) {
                    $scope.appConfigListMapBySecondLevelCategory[slc] = {};
                }
                for (var name in $scope.systemConfigurationMap.app[c][slc]) {
                    var config = jQuery.extend(true, {}, $scope.systemConfigurationMap.app[c][slc][name]);
                    if (!!appConfigMapByConfigId[config.id]) {
                        config.value = appConfigMapByConfigId[config.id].value;
                    } else {
                        if (config.configtype=='CHECK' || (config.configtype=='INPUT' && config.datatype=='Boolean')) {
                            config.value = 'false';    
                        } else {
                            config.value = undefined;
                        }
                    }
                    $scope.appConfigListMapBySecondLevelCategory[slc][name] = config;
                    $scope.pendingSaveList[name] = config;
                }
            }
        }
    }
    
    $scope.saveAppConfigChanges = function() {
        var configurationList = [];
        for (var key in $scope.pendingSaveList) {
            var config = $scope.pendingSaveList[key];
            var systemConfigurationSoapType = getSystemConfigurationSoapType(config, 'app');
            if (util.isValidVariable(systemConfigurationSoapType)) {
                configurationList.push(systemConfigurationSoapType);
            }
        }
        var userAuth = biscuit.u().userid == 'wisdomount' ? undefined : new UserAuthenticationType(biscuit.u().userid);
        var soapType = new SaveAppInstanceType($scope.currentApp.id, null, null, null, null, null, null, null, null, null, null, configurationList, null, null, null, null, null, null, userAuth);
        $("#saveSettingsPopup").popup("open");
        $("button[type='submit']").prop('disabled',true);
        window.setTimeout(function() {callWebService(soapType, saveAppConfigChangesHandler);}, 500);
    };
    
    var saveAppConfigChangesHandler = function(jsonObj) {
        $("#saveSettingsPopup").popup("close");
        $("button[type='submit']").prop('disabled',false);
        window.setTimeout(function() {
            if (util.isSuccessfulResponse(jsonObj.saveappinstanceresponsetype)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS, null, null, uiBaseObj.SUCCESS);
            } else {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Fail to save app configuration changes!", jsonObj.saveappinstanceresponsetype.result, uiBaseObj.ERROR);
            }
            
            $scope.pendingSaveList = {};
            listAllAppInstances();
            fetchAllSystemConfigurations();
        }, 300);
    };
    
    var validValue = function(value, elmId) {
        if (elementObj.data("configType") == "TIME" && !settingsObj.isValidDateFormat(systemConfigurationSoapType.value)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "Time format has to be: (hh:mm)!");
            return;
        }
    }
  
    $scope.init = function() {
        $scope.currentMerchantIds = null;
        var currentUser = biscuit.u();
        if (util.isValidVariable(currentUser)) {
            var merchantInfo = biscuitHelper.getMerchantInfo(currentUser);
            $scope.currentMerchantIds = merchantInfo.merchantIds;
        }
        fetchAllSystemConfigurations();
        listAllStaff();
        listAllAppInstances();
        systemLanguage.loadLanguageForPage('settings-page');
    };
    $scope.init();
}]);

var paymentConfigObj = {
    companyInfo: null,
    paymentServiceConfigChanged : false,
    paymentServiceProviderMapById : {},
    addPaymentSettingDiv : function(parentObj) {
        var divHtml = '';
        divHtml += '<div data-role="fieldcontain"><label style="font-weight:normal;" id="label-payment-service-provider-select" for="payment-service-provider-select" class="select">Payment Service</label>'
                   + '<select name="payment-service-provider-select" id="payment-service-provider-select" onchange="paymentConfigObj.onPaymentServiceProviderChange();"></select></div>';
        divHtml += '<div id="MerchantNameDiv" data-role="fieldcontain"><label style="font-weight:normal;" id="label-merchantNameInput" for="merchantNameInput" class="select">Merchant Name</label>' +
                    '<input id="merchantNameInput" name="merchantNameInput" value="" onchange="paymentConfigObj.onPaymentServiceConfigChange();"/></div>';
        divHtml += '<div id="MerchantIdDiv" data-role="fieldcontain"><label style="font-weight:normal;" id="label-merchantIdInput" for="merchantIdInput" class="select">Merchant ID</label>' +
                    '<input id="merchantIdInput" name="merchantIdInput" value="" onchange="paymentConfigObj.onPaymentServiceConfigChange();"/></div>';
        divHtml += '<div id="MerchantKeyDiv" data-role="fieldcontain"><label style="font-weight:normal;" id="label-merchantKeyInput" for="merchantKeyInput" class="select">Merchant Key</label>' +
                    '<input id="merchantKeyInput" name="merchantKeyInput" value="" onchange="paymentConfigObj.onPaymentServiceConfigChange();"/></div>';
        divHtml += '<div id="urlDisplayOption" data-role="fieldcontain"><label style="font-weight:normal;" id="label-merchantUrlInput" for="merchantUrlInput" class="select">Merchant URL</label>' +
                    '<input id="merchantUrlInput" name="merchantUrlInput" value="" onchange="paymentConfigObj.onPaymentServiceConfigChange();"/></div>';
        divHtml += '<div id="setupPasswordDiv" data-role="fieldcontain"><label style="font-weight:normal;" id="label-setupPassword" for="setupPassword" class="select">Setup Password</label>' +
                            '<input id="setupPassword" name="setupPassword" type="password" value=""/></div>';
        divHtml += '<div id="terminalAuthoDiv" data-role="fieldcontain" style="display: none"><label style="font-weight:normal;" id="label-terminalAutho" for="terminalAutho" class="select">Authorization</label>' +
                            '<input id="terminalAutho" name="terminalAutho" value="" onchange="paymentConfigObj.onPaymentServiceConfigChange();"/></div>';

        var parentHtml = '<div id="payment-service-setting-div"><h1 style="margin-bottom:0px;">Payment Service Settings</h1>'
                    + '<div id="payment-service-setting-detail" style="margin-bottom:30px;"></div></div>';

        parentObj.prepend(parentHtml).trigger("create");
        $('#payment-service-setting-detail').append(divHtml).trigger("create");
        paymentConfigObj.listAllPaymentServiceProviders();
        paymentConfigObj.loadCompanyProfile();
    },
    clear : function() {
        $('#payment-service-setting-div').remove();
        paymentConfigObj.resetPaymentServiceConfigChangeStatus();
    },
    resetPaymentServiceConfigChangeStatus : function() {
        paymentConfigObj.paymentServiceConfigChanged = false;
    },
    onPaymentServiceConfigChange : function() {
        paymentConfigObj.paymentServiceConfigChanged = true;
    },
    listAllPaymentServiceProviders: function() {
        var soapType = new FindPaymentServiceProvidersType();
        callWebService(soapType, paymentConfigObj.listAllPaymentServiceProvidersHandler);
    },
    listAllPaymentServiceProvidersHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findpaymentserviceprovidersresponsetype)) {
            paymentConfigObj.paymentServiceProviderMapById = {};
            $('#payment-service-provider-select').find('option').remove();
            $("#payment-service-provider-select").append("<option value='-1'>None</option>").trigger("create");
            var paymentServiceProviders = util.getElementsArray(jsonObj.findpaymentserviceprovidersresponsetype.paymentserviceproviders);
            for (var i = 0; i < paymentServiceProviders.length; i++) {
                var paymentServiceProvider = paymentServiceProviders[i];
                paymentConfigObj.paymentServiceProviderMapById[paymentServiceProvider.id] = paymentServiceProvider;
                $("#payment-service-provider-select").append("<option value='" + paymentServiceProvider.id + "'>" + paymentServiceProvider.displayname + "</option>").trigger("create");
            }
        }
    },
    loadCompanyProfile : function() {
        var soapType = new FetchCompanyProfileType();
        callWebService(soapType, paymentConfigObj.loadCompanyProfileHandler);
    },
    loadCompanyProfileHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.fetchcompanyprofileresponsetype)) {
            paymentConfigObj.companyInfo = jsonObj.fetchcompanyprofileresponsetype.company;
            $("#payment-service-provider-select").val(paymentConfigObj.companyInfo.paymentserviceproviderid).selectmenu("refresh");
            if (util.isValidVariable(paymentConfigObj.companyInfo.reseller)) {
                $('#setupPasswordDiv').show();
                $('#terminalAuthoDiv').show();
            } else {
                $('#setupPasswordDiv').hide();
                $('#terminalAuthoDiv').hide();
            }
            paymentConfigObj.populateServiceProviderDetails(paymentConfigObj.companyInfo.paymentserviceproviderid);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed to obtain company info!", jsonObj.fetchcompanyprofileresponsetype.result);
        }
    },
    onPaymentServiceProviderChange: function() {
        paymentConfigObj.onPaymentServiceConfigChange();
        paymentConfigObj.populateServiceProviderDetails($("#payment-service-provider-select").val());
    },
    populateServiceProviderDetails : function(objId) {
        var paymentServiceProvider = paymentConfigObj.paymentServiceProviderMapById[objId];
        if (paymentServiceProvider != null) {
            $('#urlDisplayOption').hide();
            if(paymentServiceProvider.name =="PAX"){
                //$('#terminalAuthoDiv').show();
                $('#MerchantNameDiv').hide();
                $('#MerchantIdDiv').hide();
                $('#MerchantKeyDiv').hide();
            }else{
                 //$('#terminalAuthoDiv').hide();
                 $('#MerchantNameDiv').show();
                 $('#MerchantIdDiv').show();
                 $('#MerchantKeyDiv').show();
            }
            $("#merchantNameInput").val(paymentServiceProvider.merchantname);
            $("#merchantIdInput").val(paymentServiceProvider.merchantid);
            $("#merchantKeyInput").val(paymentServiceProvider.merchantkey);
            $("#merchantUrlInput").val(paymentServiceProvider.merchanturl)
            $("#terminalAutho").val(paymentServiceProvider.resellerinfor);

        } else {
            $('#urlDisplayOption').hide();
            $("#merchantNameInput").val("");
            $("#merchantIdInput").val("");
            $("#merchantKeyInput").val("");
            $("#merchantUrlInput").val("");

            //$('#terminalAuthoDiv').hide();
            $('#MerchantNameDiv').show();
            $('#MerchantIdDiv').show();
            $('#MerchantKeyDiv').show();
            $("#terminalAutho").val("");
        }
    },
    savePaymentServiceProviderConfig : function() {
        var id = $('#payment-service-provider-select').val();
        var merchantName = $("#merchantNameInput").val();
        var merchantId = $("#merchantIdInput").val();
        var merchantKey = $("#merchantKeyInput").val();
        var merchantUrl = $("#merchantUrlInput").val();
        var setupPassword = $('#setupPassword').val();
        var resellerInfor = $('#terminalAutho').val();

        var userAuth = biscuit.u().userid == 'wisdomount' ? undefined : new UserAuthenticationType(biscuit.u().userid);
        var soapType = new SavePaymentServiceProviderType(id, null, null, merchantName, merchantId, merchantKey, merchantUrl, setupPassword,resellerInfor, userAuth);
        callWebService(soapType, this.savePaymentServiceProviderConfigHandler);
    },
    savePaymentServiceProviderConfigHandler : function(jsonObj) {
        paymentConfigObj.resetPaymentServiceConfigChangeStatus();
        if (util.isSuccessfulResponse(jsonObj.savepaymentserviceproviderresponsetype)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS, null, null, "Payment service changes saved successfully");
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Could not change payment service provider!", jsonObj.savepaymentserviceproviderresponsetype.result, uiBaseObj.ERROR);
        }
    }
};