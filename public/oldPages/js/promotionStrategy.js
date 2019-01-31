var promotionObj = {
    pricingRules : [],
    addPricingRuleMode : false,
    curSelectedItemIdx : -1, 
    defaultSelectedMenuId : -1,
    
    init : function() {
        promotionObj.clear();
        promotionObj.loadPricingRuleData();
        promotionObj.loadDiscountRate();
        $("#pricingRuleDetailPanel-add-header").show();
        $("#pricingRuleDetailPanel-edit-header").hide();
        uiBaseObj.addDeleteConfirmDialog("promotionStrategy-page", "deleteConfirmationDialog", "Pricing Rule", "promotionObj.deletePricingRule();");
        $("#pricingRule-dateFrom").datepicker({
            dateFormat: "mm-dd",
            changeMonth: true,
            changeYear: false,
        });
        $("#pricingRule-dateTo").datepicker({
            dateFormat: "mm-dd",
            changeMonth: true,
            changeYear: false,
        });
    },
    getItemId : function(id) {
        return "saleItem_" + id;
    },
    clear : function() {
        promotionObj.pricingRules = [];
        $("#pricingRuleDetailPanel input").prop('disabled', true);
        $("#pricingRuleDetailPanel select").prop('disabled', true);
    },
    loadDiscountRate: function() {
        var listDiscountRatesRequest = new ListDiscountRatesType();
        callWebService(listDiscountRatesRequest, promotionObj.listDiscountRateHandler);
    },
    listDiscountRateHandler: function(jsonObj) {
        if(util.isSuccessfulResponse(jsonObj.listdiscountratesresponsetype)) {
            var discountRates = util.getElementsArray(jsonObj.listdiscountratesresponsetype.discounts);
            for (var i = 0; i < discountRates.length; i++) {
                var discountRate = discountRates[i];
                if (discountRate.ratetype == 1) { // $
                    $("#pricingRule-discountCash").append("<option value='" + discountRate.id + "'>" + discountRate.name + "</option>");
                    $("#pricingRule-discountCashWhenHasThreshold").append("<option value='" + discountRate.id + "'>" + discountRate.name + "</option>");
                } else if (discountRate.ratetype == 2) {
                    $("#pricingRule-discountPercentage").append("<option value='" + discountRate.id + "'>" + discountRate.name + "</option>");
                    $("#pricingRule-discountPercentageWhenHasThreshold").append("<option value='" + discountRate.id + "'>" + discountRate.name + "</option>");
                }
            }
        }
    },
    loadPricingRuleData : function() {
        var listPricingRulesRequest = new ListPricingRuleType();
        callWebService(listPricingRulesRequest, promotionObj.listPricingRuleHandler);
        
        $.ajax({
            url: getServerUrl() + '/kpos/webapp/menu/menus?showInactive=false',
            type: "GET",
            contentType: "application/json",
            success: function(res, status, xhr) {
                var menuList = util.getElementsArray(res.menus);
                for (var i = 0; i < menuList.length; i++) {
                    var menu = menuList[i];
                    $("#pricingRule-menu").append("<option value='" + menu.id + "'>" + menu.name + "</option>");
                    if (promotionObj.defaultSelectedMenuId == -1 && menu.productLine === 'POS') {
                        promotionObj.defaultSelectedMenuId = menu.id;
                    }
                    // fetch categories by menu id
                    $("#saleitem-set").append("<div class='menu-category-div' id='menu-category-div" + menu.id + "' style='display:none;'>").trigger('create');
                    promotionObj.loadCategoriesByMenuId(menu.id);
                }
                $("#pricingRule-menu").change(function (){
                    $(".menu-category-div").each(function() {
                        $(this).hide();
                    });
                    $("#menu-category-div" + $(this).val()).show();
                });
                $("#pricingRule-menu").val(promotionObj.defaultSelectedMenuId).selectmenu("refresh");
                $("#pricingRule-menu").trigger("change");
            },
            error: function (xhr, status, error) {
                uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed to load menus!", error.error);
            }
        });
    },
    loadCategoriesByMenuId : function(menuId) {
        $.ajax({
            url: getServerUrl() + '/kpos/webapp/menu/menu/' + menuId + '/menuCategories?expandMenuLevel=1',
            type: "GET",
            contentType: "application/json",
            success: function(res, status, xhr) {
                var categoryList = util.getElementsArray(res.menuCategories);
                for (var i = 0; i < categoryList.length; i++) {
                    if (categoryList[i].discountAllowed != true) {
                        continue;
                    }
                    var category = categoryList[i];
                    $("#menu-category-div"+menuId).append(promotionObj.getCategoryDiv(category)).trigger("create");
                    var divId = "saleItem-select" + category.id;
                    promotionObj.listSaleItemsByCategory(category);
                    $("#" + divId).on("collapsibleexpand", function(event, ui) {
                        var thisElementId = $(this).attr("id");
                        $("#menu-category-div"+menuId+ " > .sale-item-select-collapsible-div").each(function() {
                            var elementId = $(this).attr("id");
                            if (elementId != thisElementId) {
                                $(this).hide();
                            }
                        });
                    }).on("collapsiblecollapse", function(event, ui) {
                        var thisElementId = $(this).attr("id");
                        $("#menu-category-div"+menuId+ " > .sale-item-select-collapsible-div").each(function() {
                            var elementId = $(this).attr("id");
                            if (elementId != thisElementId) {
                                $(this).show();
                            }
                        });
                    });
                }
            },
            error: function (xhr, status, error) {
                uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed to load categories", error.error);
            }
        });
    },
    listPricingRuleHandler : function(jsonObj) {
        if(util.isSuccessfulResponse(jsonObj.listpricingruleresponsetype)) {
            promotionObj.pricingRules = util.getElementsArray(jsonObj.listpricingruleresponsetype.pricingrule);
            var tempHtml = "<ul data-role='listview' data-inset='true' id='pricingRule-list'>";

            for (var i = 0; i < promotionObj.pricingRules.length; i++) {
                var pricingRule = promotionObj.pricingRules[i];
                tempHtml += "<li><a href='javascript:promotionObj.populatePricingRuleDetails(" + i + ")'>" + pricingRule.name + "</a></li>";
            }
            tempHtml += "</ul>";
            $("#pricingRule-set").append(tempHtml).trigger("create");
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed to load pricing rule items!", jsonObj.listpricingruleresponsetype.result);
        }
    },
    reloadPricingRuleData : function() {
        $("#pricingRule-set").empty();
        promotionObj.pricingRules = [];
        promotionObj.clearPricingRuleDetails();
        var listPricingRuleType = new ListPricingRuleType();
        callWebService(listPricingRuleType, promotionObj.listPricingRuleHandler);
        $("#pricingRule-menu").val(promotionObj.defaultSelectedMenuId).selectmenu("refresh");
    },
    getCategoryDiv : function(category) {
        var categoryDiv = "<div data-role='collapsible' id='saleItem-select" + category.id + "' data-collapsed='true' class='sale-item-select-collapsible-div'>";
        categoryDiv += "<h3>" + category.name + "</h3><ul data-role='listview' id='categoryDiv" + category.id + "'></ul></div>";
        return categoryDiv;
    },
    listSaleItemsByCategory : function(category) {
        var saleItemList = category.saleItems;
        if(saleItemList != null) {
            for (var i = 0; i < saleItemList.length; i++) {
                var saleItem = saleItemList[i];
                if (saleItem.itemType != "COMBO_SALE_ITEM") {
                    var saleItemElement = "<li><div class='li-item-detail-div'>"  + saleItem.name + "</div><div class='li-item-checkbox-div'><input id='" + promotionObj.getItemId("checkbox_" + saleItem.id) + "' type='checkbox' data-enhanced='true'></div></li>";
                    $("#categoryDiv" + category.id).append(saleItemElement);
                }
            }
        }
            
        var selectAllElement = "<li class='item-select-all-li'><div class='li-item-detail-div'>All</div><div class='li-item-checkbox-div'><input class='item-select-all-checkbox' type='checkbox' data-enhanced='true'></div></li>";
        $("#categoryDiv" + category.id).prepend(selectAllElement);
        $("#categoryDiv" + category.id).on('change', ':checkbox', function() {
            if ($(this).hasClass("item-select-all-checkbox")) {
                $("#categoryDiv" + category.id + " input:checkbox").prop('checked', $(this).prop("checked"));
            }
            promotionObj.markCategoryDiv(category.id);
            $("#promotionTypeDetail input[type='text']").textinput('enable');
            $("#promotionTypeDetail select").selectmenu('enable');
            if ($(this).prop('checked')) {
                $("#pricingRule-thresholdPrice").textinput('disable');
            } else {
                $("#pricingRule-thresholdPrice").textinput('enable');
            }
            if ($(this).prop('checked')) {
                $("#pricingRule-discountCashWhenHasThreshold").selectmenu('disable');
            } else {
                $("#pricingRule-discountCashWhenHasThreshold").selectmenu('enable');
            }
            if ($(this).prop('checked')) {
                $("#pricingRule-discountPercentageWhenHasThreshold").selectmenu('disable');
            } else {
                $("#pricingRule-discountPercentageWhenHasThreshold").selectmenu('enable');
            }
            $("#pricingRule-thresholdPrice").val('');
            $("#pricingRule-discountCashWhenHasThreshold").val('');
            $("#pricingRule-discountPercentageWhenHasThreshold").val('');
        });
    },
    undoAddMode : function() {
        $("#toBeAddPricingRuleElement").remove();
        $("#pricingRule-list").listview('refresh');
        promotionObj.addPricingRuleMode = false;
        $("#pricingRuleDetailPanel input").prop('disabled', false);
        $("#pricingRuleDetailPanel select").prop('disabled', false);
    },
    openDeleteConfirmDialog : function() {
        if (promotionObj.curSelectedItemIdx != null) {
            $('#deleteConfirmationDialog').popup('open');
        }
    },
    populatePricingRuleDetails : function(idx) {
        //清除保存失败的按钮
        $("#save-edit-btn").prop("disabled", false);
        $("#discount-div .error-msg-div").remove();
        $("#discount-div").css('border', '');

        promotionObj.clearPricingRuleDetails();
        promotionObj.triggerAppliedOnOrderButton();
        promotionObj.undoAddMode();
        $("#pricingRuleDetailPanel-add-header").hide();
        $("#pricingRuleDetailPanel-edit-header").show();
        promotionObj.addPricingRuleMode = false;
        
        var currentPricingRule = promotionObj.pricingRules[idx];
        $("#pricingRuleDetailPanel").data("pricingRuleId", currentPricingRule.id);
        $("#pricingRule-name").val(currentPricingRule.name);
        $("#pricingRule-dateFrom").val(currentPricingRule.datefrom);
        $("#pricingRule-dateTo").val(currentPricingRule.dateto);
        $("#pricingRule-hourFrom").val(currentPricingRule.hourfrom);
        $("#pricingRule-hourTo").val(currentPricingRule.hourto);
        $("#pricingRule-thresholdPrice").val(currentPricingRule.thresholdprice);
        $("#pricingRule-thresholdQty").val(currentPricingRule.thresholdqty);
        $("#pricingRule-orderType").val(currentPricingRule.ordertype).selectmenu("refresh");
        $("#pricingRule-promotionPrice").val(currentPricingRule.promotionprice);
        $("#pricingRule-promotionQty").val(currentPricingRule.promotionqty);
        
        if (!util.isValidVariable(currentPricingRule.thresholdprice)) {
            $("#pricingRule-discountCash").val(currentPricingRule.discountcashid).selectmenu("refresh");
            $("#pricingRule-discountPercentage").val(currentPricingRule.discountpercentageid).selectmenu("refresh");
        } else {
            $("#pricingRule-discountCashWhenHasThreshold").val(currentPricingRule.discountcashid).selectmenu("refresh");
            $("#pricingRule-discountPercentageWhenHasThreshold").val(currentPricingRule.discountpercentageid).selectmenu("refresh");
        }
        
        $("#pricingRule-appliedOnOrder").prop("checked", util.isBooleanTrue(currentPricingRule.appliedonorder)).checkboxradio("refresh");
                
        var weekdays = Number(currentPricingRule.weekdays);
        var weekdayList = [Math.pow(2,0), Math.pow(2,1), Math.pow(2,2), Math.pow(2,3), Math.pow(2,4), Math.pow(2,5), Math.pow(2,6)];
        for (var i=0; i<weekdayList.length; i++) {
            var isSelected = weekdayList[i] & weekdays;
            if (isSelected > 0) {
                $("#weekdays-"+i).prop("checked", true).checkboxradio("refresh");
            }
        }
        
        $("#pricingRule-menu").val(promotionObj.defaultSelectedMenuId).selectmenu("refresh");
        $("#pricingRule-menu").trigger("change");
        var saleItemList = util.getElementsArray(currentPricingRule.saleitem);
        if (util.isValidVariable(saleItemList)) {
            for (var i = 0; i < saleItemList.length; i++) {
                $("#" + promotionObj.getItemId("checkbox_" + saleItemList[i].id)).prop('checked', true);
            }
        }
        $("#saleitem-set input").prop('disabled', $("#pricingRule-appliedOnOrder").prop('checked'));
        if (!$("#pricingRule-appliedOnOrder").prop('checked')) {
            if (saleItemList.length > 0) {
                $("#promotionTypeDetail input[type='text']").textinput('enable');
                $("#promotionTypeDetail select").selectmenu('enable');
                $("#pricingRule-thresholdPrice").textinput('disable');
                $("#pricingRule-discountCashWhenHasThreshold").selectmenu('disable');
                $("#pricingRule-discountPercentageWhenHasThreshold").selectmenu('disable');
                $("#pricingRule-thresholdPrice").val('');
                $("#pricingRule-discountCashWhenHasThreshold").val('');
                $("#pricingRule-discountPercentageWhenHasThreshold").val('');
            }
            promotionObj.markAllCategoryDivs();
        } else {
            promotionObj.triggerAppliedOnOrderButton();
        }
        promotionObj.curSelectedItemIdx = idx;
    },
    clearPricingRuleDetails : function() {
        //清除保存失败的按钮
        $("#save-edit-btn").prop("disabled", false);
        $("#discount-div .error-msg-div").remove();
        $("#discount-div").css('border', '');

        $("#pricingRuleDetailPanel input[type='text']").val('');
        $("#pricingRuleDetailPanel input[type='date']").val('');
        $("#pricingRuleDetailPanel input[type='checkbox']").attr('checked', false).checkboxradio("refresh");
        $("#pricingRule-appliedOnOrder").attr('checked', false).checkboxradio("refresh");
        $("#pricingRuleDetailPanel select").val('').selectmenu('refresh');
        $("#pricingRuleDetailPanel").data("pricingRuleId", "");
        $("#promotionTypeDetail input[type='text']").textinput('enable');
        $("#promotionTypeDetail select").selectmenu('enable');
        $("#pricingRule-detail-form-div").show();
    },
    triggerAppliedOnOrderButton : function() {
        var isAppliedOnOrder = $("#pricingRule-appliedOnOrder").prop('checked');
        if (isAppliedOnOrder || promotionObj.curSelectedItemIdx == -1) {
            promotionObj.clearSaleItemCheckboxes();    
        } else {
            var pricingRule = promotionObj.pricingRules[promotionObj.curSelectedItemIdx];
            console.log(promotionObj.curSelectedItemIdx);
            console.log(pricingRule);
            if (!util.isBooleanTrue(pricingRule.appliedonorder)) {
                var saleItemList = util.getElementsArray(pricingRule.saleitem);
                if (util.isValidVariable(saleItemList)) {
                    for (var i = 0; i < saleItemList.length; i++) {
                        $("#" + promotionObj.getItemId("checkbox_" + saleItemList[i].id)).prop('checked', true);
                    }
                }
                promotionObj.markAllCategoryDivs();
            }
        }
        $("#promotionTypeDetail input[type='text']").textinput('enable');
        $("#promotionTypeDetail select").selectmenu('enable');
        $("#saleitem-set input").prop('disabled', isAppliedOnOrder);
        $("#pricingRule-menu").prop('disabled', isAppliedOnOrder);
        if (isAppliedOnOrder) {
            $("#pricingRule-menu").val(-1).selectmenu("refresh");
            $("#pricingRule-menu").trigger("change");
        } else {
            $("#pricingRule-menu").val(promotionObj.defaultSelectedMenuId).selectmenu("refresh");
            $("#pricingRule-menu").trigger("change");
        }
        
        $("#pricingRule-discountCash").prop('disabled', isAppliedOnOrder);
        if (isAppliedOnOrder) {
            $("#pricingRule-discountCash").selectmenu('disable');
        } else {
            $("#pricingRule-discountCash").selectmenu('enable');
        }
        $("#pricingRule-promotionPrice").prop('disabled', isAppliedOnOrder);
        if (isAppliedOnOrder) {
            $("#pricingRule-promotionPrice").textinput('disable');
        } else {
            $("#pricingRule-promotionPrice").textinput('enable');
        }
        $("#pricingRule-thresholdQty").prop('disabled', isAppliedOnOrder);
        if (isAppliedOnOrder) {
            $("#pricingRule-thresholdQty").textinput('disable');
        } else {
            $("#pricingRule-thresholdQty").textinput('enable');
        }
        $("#pricingRule-promotionQty").prop('disabled', isAppliedOnOrder);
        if (isAppliedOnOrder) {
            $("#pricingRule-promotionQty").textinput('disable');
        } else {
            $("#pricingRule-promotionQty").textinput('enable');
        }
        
        $("#pricingRule-thresholdQty").val('');
        $("#pricingRule-promotionQty").val('');
        $("#pricingRule-discountCash").val('');
        $("#pricingRule-promotionPrice").val('');
    },
    clearSaleItemCheckboxes : function() {
        $("#saleitem-set input[type='checkbox']").attr('checked', false);
        promotionObj.unMarkCategoryDivs();
    },
    unMarkCategoryDivs : function() {
        $("#saleitem-set a").css("background-color", "#f6f6f6");
    },
    switchToAddPricingRuleMode : function() {
        promotionObj.clearPricingRuleDetails();
        $("#pricingRuleDetailPanel-add-header").show();
        $("#pricingRuleDetailPanel-edit-header").hide();
        if (!promotionObj.addPricingRuleMode) {
            $("#pricingRule-list").append("<li id='toBeAddPricingRuleElement'><a href='#'>New Pricing Rule</a></li>").listview('refresh');
            promotionObj.addPricingRuleMode = true;
            $("#pricingRuleDetailPanel input").prop('disabled', false);
            $("#pricingRuleDetailPanel select").prop('disabled', false);
        }
        promotionObj.clearSaleItemCheckboxes();
        $("#pricingRule-menu").val(promotionObj.defaultSelectedMenuId).selectmenu("refresh");
        $("#pricingRule-menu").trigger("change");
    },
    deletePricingRule : function() {
        var deletePricingRuleRequest = new DeletePricingRuleType(promotionObj.pricingRules[promotionObj.curSelectedItemIdx].id);
        callWebService(deletePricingRuleRequest, promotionObj.deletePricingRuleHandler);
        $('#deleteConfirmationDialog').popup('close');
    },
    isValidTimeFormat : function(input) {
        var pattern = /^[0-2][0-9]:[0-5][0-9]$/;
        return input.match(pattern) != null;
    },
    savePricingRule : function() {
        var promotionDetail = promotionObj.pricingRules[promotionObj.curSelectedItemIdx];
        var name = $("#pricingRule-name").val();
        var dateFrom = $("#pricingRule-dateFrom").val();
        var dateTo = $("#pricingRule-dateTo").val();
        var hourFrom = $("#pricingRule-hourFrom").val();
        var hourTo = $("#pricingRule-hourTo").val();
        var thresholdPrice = $("#pricingRule-thresholdPrice").val() == "" ? null : $("#pricingRule-thresholdPrice").val();
        var thresholdQty = $("#pricingRule-thresholdQty").val();
        var orderType = $("#pricingRule-orderType").val() == "" ? null : $("#pricingRule-orderType").val();
        var promotionPrice = $("#pricingRule-promotionPrice").val();
        var promotionQty = $("#pricingRule-promotionQty").val();
        var appliedOnOrder = $("#pricingRule-appliedOnOrder").prop("checked");
        var discountCashId = null;
        var discountPercentageId = null;
        if (!util.isValidVariable(thresholdPrice)) {
            discountCashId = $("#pricingRule-discountCash").val() == "" ? null : $("#pricingRule-discountCash").val();
            discountPercentageId = $("#pricingRule-discountPercentage").val() == "" ? null : $("#pricingRule-discountPercentage").val();
        } else {
            discountCashId = $("#pricingRule-discountCashWhenHasThreshold").val() == "" ? null : $("#pricingRule-discountCashWhenHasThreshold").val();
            discountPercentageId = $("#pricingRule-discountPercentageWhenHasThreshold").val() == "" ? null : $("#pricingRule-discountPercentageWhenHasThreshold").val();
        }
        var weekdays = 0;
        for (var i=0; i<=6; i++) {
            if ($("#weekdays-"+i).prop("checked")) {
                weekdays += Math.pow(2, i);
            }
        }
        weekdays = weekdays == 0 ? null : weekdays;
        
        // validate form
        if ((util.isValidVariable(dateFrom) || util.isValidVariable(dateTo)) && util.isValidVariable(weekdays)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.DATE_AND_WEEKDAY_CONFLICT, "Date and Weekday can not be used in the same time!");
            return;
        }
        if (util.isValidVariable(dateFrom) || util.isValidVariable(dateTo)) {
            if (!util.isValidVariable(dateFrom) || !util.isValidVariable(dateTo)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.DATE_PERIOD_USE_ILLEGAL, "From Date and To Date have to be used together!");
                return;
            }
            var to = dateTo.split(":");
            var from = dateFrom.split(":");
            if (to[0] < from[0]) {
                uiBaseObj.alert(systemLanguage.msgCodeList.DATE_COMPARISON_ERROR, "To Date has to be larger than From Date!");
                return;
            } else if (to[0] == from[0]) {
                if (to[1] < from[1]) {
                    uiBaseObj.alert(systemLanguage.msgCodeList.DATE_COMPARISON_ERROR, "To Date has to be larger than From Date!");
                    return;
                }
            }
        }
        
        if (util.isValidVariable(hourFrom) || util.isValidVariable(hourTo)) {
            if (!promotionObj.isValidTimeFormat(hourFrom) || !promotionObj.isValidTimeFormat(hourTo)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "Time format has to be: (hh:mm)!");
                return;
            } 
            if (hourFrom == hourTo) {
                uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_COMPARISON_ERROR, "To has to be larger than From!");
                return;
            }
            var from = hourFrom.split(":");
            var to = hourTo.split(":");
            if (to[0] == "00" && from[0] == "00") {
                if (to[1] < from[1]) {
                    uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_COMPARISON_ERROR, "To has to be larger than From!");
                    return;
                }
            } else {
                to[0] = to[0] == "00" ? 24 : to[0];
                if (to[0] < from[0]) {
                    uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_COMPARISON_ERROR, "To has to be larger than From!");
                    return;
                } else if (to[0] == from[0]) {
                    if (to[1] < from[1]) {
                        uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_COMPARISON_ERROR, "To has to be larger than From!");
                        return;
                    }
                }
                if (to[0] == 24 && to[1] > 0) {
                    uiBaseObj.alert(systemLanguage.msgCodeList.TIME_RANGE_INCORRECT, "Hour Range has to be in one day!");
                    return;                    
                }
                to[0] = to[0] == 24 ? "00" : to[0];    
            }
            if (!util.isValidVariable(dateFrom) && !util.isValidVariable(weekdays)) {
                dateFrom = "01-01";
                dateTo = "12-31";
            }
        }
        
        if (!util.isValidVariable(dateFrom) && !util.isValidVariable(weekdays) && !util.isValidVariable(hourFrom)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.MISS_TIME_RANGE, "Pricing rule need a time range!");
            return;
        }
        
        if (util.isValidVariable(thresholdPrice) && util.isValidVariable(thresholdQty)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.THRESHOLD_PRICE_AND_THRESHOLD_QTY_CONFLICT, "Threshold Price and Threshold Qty can not be used in the same time!");
            return;
        }
        
        if (util.isValidVariable(thresholdPrice)) {
            if (!appliedOnOrder) {
                uiBaseObj.alert(systemLanguage.msgCodeList.THRESHOLD_PRICE_USE_ILLEGAL, "(Threshold price only can be used when the pricing rule is applied on order!");
                return;
            }
            if (thresholdPrice <= 0) {
                uiBaseObj.alert(systemLanguage.msgCodeList.THRESHOLD_PRICE_INCORRECT, "Threshold Price has to be larger than 0!");
                return;
            }
        }
        
        if (util.isValidVariable(thresholdQty)) {
            if (appliedOnOrder) {
                uiBaseObj.alert(systemLanguage.msgCodeList.THRESHOLD_QTY_USE_ILLEGAL, "(Threshold Qty can not be used when the pricing rule is applied on order!");
                return;
            }
            if (thresholdQty <= 0) {
                uiBaseObj.alert(systemLanguage.msgCodeList.THRESHOLD_QTY_INCORRECT, "Threshold Qty has to be larger than 0!");
                return;
            }
        }
        
        if (util.isValidVariable(promotionPrice) && promotionPrice < 0) {
            uiBaseObj.alert(systemLanguage.msgCodeList.PRICE_INCORRECT, "Promotion price has to be larger than 0!");
            return;
        }
        
        var countChecked = 0;
        if (util.isValidVariable(promotionQty)) countChecked += 1;
        if (util.isValidVariable(discountPercentageId) && discountPercentageId != "")   countChecked += 1;
        if (util.isValidVariable(promotionPrice)) countChecked += 1;
        if (util.isValidVariable(discountCashId) && discountCashId != "") countChecked += 1;
        if (countChecked > 1) {
            uiBaseObj.alert(systemLanguage.msgCodeList.PARAMETER_CONFLICT, "(Promotion_Price, Promotion_Qty, Discount_Percentage, Discount_Cash), only one of them can be used per time!");
            return;
        }
        
        countChecked = 0;
        var discountCashIdTmp = $("#pricingRule-discountCash").val() == "" ? null : $("#pricingRule-discountCash").val();
        var discountPercentageIdTmp = $("#pricingRule-discountPercentage").val() == "" ? null : $("#pricingRule-discountPercentage").val();
        var discountCashWhenHasThresholdIdTmp = $("#pricingRule-discountCashWhenHasThreshold").val() == "" ? null : $("#pricingRule-discountCashWhenHasThreshold").val();
        var discountPercentageWhenHasThresholdIdTmp = $("#pricingRule-discountPercentageWhenHasThreshold").val() == "" ? null : $("#pricingRule-discountPercentageWhenHasThreshold").val();  
        if (util.isValidVariable(promotionPrice) || util.isValidVariable(discountCashIdTmp) || util.isValidVariable(discountPercentageIdTmp)) countChecked += 1;  
        if (util.isValidVariable(thresholdQty) || util.isValidVariable(promotionQty)) countChecked += 1;   
        if (util.isValidVariable(discountPercentageWhenHasThresholdIdTmp) || util.isValidVariable(discountCashWhenHasThresholdIdTmp) || util.isValidVariable(thresholdPrice)) countChecked += 1;  
        if (countChecked > 1) {
            uiBaseObj.alert(systemLanguage.msgCodeList.PROMOTION_TYPE_ILLEGAL_USE, "One promotion rule only can use one promotion type!");
            return;
        }
        
        if (util.isValidVariable(discountCashWhenHasThresholdIdTmp) || util.isValidVariable(discountPercentageWhenHasThresholdIdTmp)) {
            if (appliedOnOrder) {
                if (!util.isValidVariable(thresholdPrice)) {
                    uiBaseObj.alert(systemLanguage.msgCodeList.MISS_THRESHOLD_PRICE, "Threshold Price has to be configured!");
                    return;
                } 
                if (thresholdPrice <= 0) {
                    uiBaseObj.alert(systemLanguage.msgCodeList.THRESHOLD_PRICE_INCORRECT, "Threshold Price has to be larger than 0!");
                    return;
                } 
            }
        }
        
        if (util.isValidVariable(promotionPrice)) {
            if (appliedOnOrder) {
                uiBaseObj.alert(systemLanguage.msgCodeList.PROMOTION_PRICE_USE_ILLEGAL, "Promotion Price can not be used when the pricing rule is applied on order!");
                return;
            }
        }
        
        if (util.isValidVariable(promotionQty)) {
            if (!util.isValidVariable(thresholdQty)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.MISS_THRESHOLD_QTY, "Threshold Qty has to be configured!");
                return;
            } 
            if (thresholdQty <= 0) {
                uiBaseObj.alert(systemLanguage.msgCodeList.THRESHOLD_QTY_INCORRECT, "Threshold Qty has to be larger than 0!");
                return;
            } 
            if (appliedOnOrder) {
                uiBaseObj.alert(systemLanguage.msgCodeList.PROMOTION_QTY_USE_ILLEGAL, "Promotion Qty can not be used when the pricing rule is applied on order!");
                return;
            }
        }
        
        // saleitem
        var saleItemList = [];
        $("#saleitem-set input:checkbox").each(
           function() {
               if (!$(this).hasClass("item-select-all-checkbox") && $(this).prop("checked")) {
                   var id = $(this).prop('id').split('_')[2];
                   var saleItem = new SaleItem(id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
                           null, null, null, null, null, null, null, null, null, null, null, null, null);
                   saleItemList.push(saleItem);
               }
            }
        );
       
        var pricingRuleRequest;
        if (promotionObj.addPricingRuleMode) {                
            pricingRuleRequest = new SavePricingRuleType(null, name, appliedOnOrder, dateFrom, dateTo, weekdays, hourFrom, hourTo, thresholdPrice,
                thresholdQty, orderType, discountCashId, discountPercentageId, promotionPrice, promotionQty, saleItemList);
            callWebService(pricingRuleRequest, promotionObj.addPricingRuleHandler);
        } else {
            pricingRuleRequest = new SavePricingRuleType($("#pricingRuleDetailPanel").data("pricingRuleId"), name, appliedOnOrder, dateFrom, dateTo, weekdays, 
                hourFrom, hourTo, thresholdPrice, thresholdQty, orderType, discountCashId, discountPercentageId, promotionPrice, promotionQty, saleItemList);
            callWebService(pricingRuleRequest, promotionObj.updatePricingRuleHandler);
        }
    },
    onFocus2EditButt : function () {
        $("#save-edit-btn").prop("disabled", false);
    },
    addPricingRuleHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savepricingruleresponsetype)) {
            promotionObj.curSelectedItemIdx = -1;
            promotionObj.reloadPricingRuleData();
            promotionObj.triggerAppliedOnOrderButton();
            uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
        } else {
            if (promotionObj.validFailureReasonCode(jsonObj.savepricingruleresponsetype, 3, 4 ,5)){
                $("#save-edit-btn").prop("disabled", true);
                if ($("#discount-div .error-msg-div").length > 0){
                    $("#discount-div .error-msg-div")[0].innerHTML = jsonObj.savepricingruleresponsetype.result.failurereason;
                    return;
                }
                uiBaseObj.alertDiv('discount-div', "", jsonObj.savepricingruleresponsetype.result.failurereason);
            } else {
                uiBaseObj.alert(-1, "Failed to add pricing rule!", jsonObj.savepricingruleresponsetype.result);
            }
        }
    },
    validFailureReasonCode : function (responsetype, failureReasonCode1, failureReasonCode2, failureReasonCode3) {
        if(util.isValidVariable(responsetype) && util.isValidVariable(responsetype.result) &&
            (responsetype.result.failurereasoncode == failureReasonCode1 || responsetype.result.failurereasoncode == failureReasonCode2 || responsetype.result.failurereasoncode == failureReasonCode3)) {
            return true;
        }
        return false;
    },
    updatePricingRuleHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savepricingruleresponsetype )) {
            promotionObj.curSelectedItemIdx = -1;
            promotionObj.reloadPricingRuleData();
            promotionObj.triggerAppliedOnOrderButton();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            if (promotionObj.validFailureReasonCode(jsonObj.savepricingruleresponsetype, 3, 4 ,5)){
                $("#save-edit-btn").prop("disabled", true);
                if ($("#discount-div .error-msg-div").length > 0){
                    $("#discount-div .error-msg-div")[0].innerHTML = jsonObj.savepricingruleresponsetype.result.failurereason;
                    return;
                }
                uiBaseObj.alertDiv('discount-div', "", jsonObj.savepricingruleresponsetype.result.failurereason);
            } else {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to update pricing rule!", jsonObj.savepricingruleresponsetype.result);
            }
        }
    },
    deletePricingRuleHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletepricingruleresponsetype )) {
            promotionObj.curSelectedItemIdx = -1;
            promotionObj.reloadPricingRuleData();
            promotionObj.triggerAppliedOnOrderButton();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete pricing rule!", jsonObj.deletepricingruleresponsetype.result);
        }
    },
    markCategoryDiv : function(categoryDivID) {
        var shouldMark = false;
        $("#categoryDiv" + categoryDivID + " input:checkbox").each(function() {
            if (!$(this).hasClass("item-select-all-checkbox")) {
                if ($(this).prop('checked')) {
                    shouldMark = true;
                    return false;
                }    
            }
        });
        if (shouldMark) {
            $("#saleItem-select" + categoryDivID + " a").css("background-color", "#D2EDD5");
        } else {
            $("#saleItem-select" + categoryDivID + " a").css("background-color", "#f6f6f6");
        }
    },
    markAllCategoryDivs : function() {
        $(".sale-item-select-collapsible-div").each(function() {
            var shouldMark = false;
            $(this).children("div").find("input:checkbox").each(function() {
                if (!$(this).hasClass("item-select-all-checkbox")) {
                    if ($(this).prop('checked')) {
                        shouldMark = true;
                        return false;
                    }    
                }     
            });
            if (shouldMark) {
                $(this).children("h3").children("a").css("background-color", "#D2EDD5");
            } else {
                $(this).children("h3").children("a").css("background-color", "#f6f6f6");
            }
        });
    }
};
