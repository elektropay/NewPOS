var languageManagement = {
    languageColumns : [],
    languageIDByColumnIndex : [],
    initNumberOfColumn : 1,
    initNumberOfRows : 2,
    nextLanguageColumnIdx : null,
    editedCells : [],
    fieldDisplayNameFieldItemList : [],
    fieldDisplayNameFieldTypeGroups : [],
    systemLanguages : [],
    allSystemLanguages : [],
    selectedFieldDisplayNameFieldItemTypeList : [],
    languageColumnsPopulated : false,
    toBeDeletedLanguageColumns : [],
    currentEditedLanguageColIndex : -1,
    baseUrl: getServerUrl() + '/kpos/webapp/languageManage/',          // 请求地址
    MenuRelated: null,                                                 // menu相关数据
    isFirstLoadData: true,                                             // 是否是首次加载数据
    selectedField: {                                                    // 保存每个tab下，表格数据
        menuRelated: { languageColumnsPopulated: false,selectedFieldDisplayNameFieldItemTypeList:[]},
        systemRelated: { languageColumnsPopulated: false,selectedFieldDisplayNameFieldItemTypeList:[]},
        other: { languageColumnsPopulated: false,selectedFieldDisplayNameFieldItemTypeList:[]}
    },
    tabType: 'menuRelated', //当前选中的tab
    languageColumn: { },
    fieldTypeIndex: 0,      // 保存左侧垂直菜单索引(当前激活菜单的索引)
    selectedIndex: 1,       //  保存menuRelated下选中下拉列表索引
    verticalMenuSelectedIndex: 0,   // 左侧选中的垂直菜单索引

    init : function() {
        languageManagement.nextLanguageColumnIdx = languageManagement.initNumberOfColumn;
        languageManagement.clear();
        languageManagement.loadData();
        uiBaseObj.addDeleteConfirmDialog("language-page", "deleteConfirmationDialog", "Language", "languageManagement.deleteLanguageColumns('languageTable-0');");
        $(".searchInput").keyup(function() {
            var searchVal = $(this).val().toLowerCase();
            $('.language-tab tbody tr').each(function() {
                var match = false;
                var elements = $(this).find('input');
                for (var i = 0; i < elements.length; i++) {
                    var val = $(elements[i]).val().toLowerCase();
                    if (val.indexOf(searchVal) > -1) {
                        match = true;
                        break;
                    }
                }
                if (match) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });
        // tab绑定事件
        this.tabBindEvent();
    },
    saveColumn : function() {
        // 获得当前选中tab下的表格的id
        var tableID = $("#"+this.tabType+' .language-tab').attr("id");
        var addLangId = $('#add-language-select').val();
        var updateSystemLanguageRequest = new UpdateSystemLanguageType(addLangId, null, null, true);
        callWebService(updateSystemLanguageRequest, languageManagement.updateSystemLanguageHandler, tableID);
    },
    addColumn : function(tblId, languageCode, languageID, languageName, languageIndex, addByUser) {
        languageManagement.languageColumn[languageCode] = languageIndex+1;
        var tblHeadObj = document.getElementById(tblId).tHead;
        // 表头创建语言节点
        for (var h = 0; h < tblHeadObj.rows.length; h++) {
            var newTH = document.createElement('th');
            tblHeadObj.rows[h].appendChild(newTH);
            if (languageID != null) {
                newTH.id = 'lang-header-' + languageID;
            }
            //var elementName = 'checkbox-lang-header-' + languageID;
            var elementName = 'checkbox-lang-header';
            newTH.innerHTML = '<fieldset data-role="controlgroup" data-enhanced="true"><input data-enhanced="true" type="radio" name="' + elementName + '" data-mini="true" onclick="languageManagement.markAsToBeDeleted(this)" data-langIndex="' + languageIndex + '"/>'
                + '<label for="' + elementName + '" data-langIndex="' + languageIndex + '" class="lang-table-column-header">' + languageName + '</label></fieldset>';
        }

        var tblBodyObj = document.getElementById(tblId).tBodies[0];
        var newCell = tblBodyObj.rows[0].insertCell(-1);
        for (var i = 1; i < tblBodyObj.rows.length; i++) {
            var newCell = tblBodyObj.rows[i].insertCell(-1);
            newCell.innerHTML = "<td><input type='text' id='editable-cell" + i + "_" + languageIndex +"' value='' onchange='languageManagement.markAsEdited(this);' data-id=''/></td>";
        }
        if (addByUser) {
            languageManagement.nextLanguageColumnIdx++;
        }
    },
    markAsToBeDeleted : function(obj) {
        languageManagement.toBeDeletedLanguageColumns = [];
        var langIndex = parseInt($(obj).attr('data-langIndex'), 10);
        if ($(obj).prop("checked")){
            languageManagement.toBeDeletedLanguageColumns.push(langIndex)
        }
    },
    openDeletePanel : function() {
        if (languageManagement.toBeDeletedLanguageColumns.length > 0) {
            $('#deleteConfirmationDialog').popup('open');
        }
    },
    deleteLanguageColumns : function(tblId) {
        // 获取当前tab下的表格id
        var tblId = $("#"+this.tabType+' .language-tab').attr("id");
        var allRows = document.getElementById(tblId).rows;
        // languageManagement.toBeDeletedLanguageColumns: 保存当前勾选需要删除语言的索引
        for (var k = 0; k < languageManagement.toBeDeletedLanguageColumns.length; k++) {
            var langIndex = languageManagement.toBeDeletedLanguageColumns[k];
            languageManagement.deleteSystemLanguage(languageManagement.systemLanguages[langIndex].id, tblId);
        }
    },
    deleteSystemLanguage : function(id, tableID) {
        var deleteSystemLanguageRequest = new UpdateSystemLanguageType(id, null, null, false);
        callWebService(deleteSystemLanguageRequest, languageManagement.deleteSystemLanguageHandler, tableID);
    },
    deleteSystemLanguageHandler : function(jsonObj, tableID) {
        // 获取请求参数
        var params = languageManagement.getTabParams();
        if (util.isSuccessfulResponse(jsonObj.updatesystemlanguageresponsetype)) {
            languageManagement.loadLanguageData(false);
            languageManagement.populateFieldDisplayNameDetails(tableID, 0,languageManagement.tabType);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
            // 点击删除后，待删除列表要清空
            languageManagement.toBeDeletedLanguageColumns = [];
            languageManagement.getMenuRelated(params.menuId,params.tabType,params.$container,params.tableID);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete system language", jsonObj.updatesystemlanguageresponsetype.result);
        }
    },
    markAsEdited : function(obj) {
        var cellAlreadyEdited = false;
        for (var i = 0; i < languageManagement.editedCells.length; i++) {
            var cellInput = languageManagement.editedCells[i];
            if (obj.id == cellInput.id) {
                cellAlreadyEdited = true;
                break;
            }
        }
        if (!cellAlreadyEdited) {
            languageManagement.editedCells.push(obj);
        }
    },
    clear : function() {
        languageManagement.languageColumns = [];
        languageManagement.languageIDByColumnIndex = [];
        languageManagement.nextLanguageColumnIdx = languageManagement.initNumberOfColumn;
        languageManagement.editedCells = [];
        languageManagement.fieldDisplayNameFieldItemList = [];
        languageManagement.fieldDisplayNameFieldTypeGroups = [];
        languageManagement.systemLanguages = [];
        languageManagement.allSystemLanguages = [];
        languageManagement.toBeDeletedLanguageColumns = [];
        languageManagement.currentEditedLanguageColIndex = -1;
    },
    loadData : function() {
        languageManagement.loadLanguageData(true);
        // 加载menu相关数据，参数为需要插入数据的容器和表格id
        // 参数分别为：menuId,请求路径，需要添加数据的容器对象，表格id
        this.getMenuRelated('','menuRelated',$("#menuRelated > .ui-block-a"),'languageTable-0');
    },
    // 构造请求参数
    getTabParams: function(){
        // 获取当前tab下请求参数
        var tabType = languageManagement.tabType;
        var $select = $("#"+tabType).find("#menuLists");
        var menuId = "";
        // menuRelated tab下才会有下拉列表
        if($select.length > 0){
            menuId = $select.children('option').eq(languageManagement.selectedIndex).val()
        }
        var params = {
            menuId: menuId,
            tabType: tabType,
            $container: $("#"+tabType+" > .ui-block-a"),
            tableID: $("#"+tabType).find(".language-tab").attr("id")
        };
        return params;
    },
    saveChanges : function() {
        var params = languageManagement.getTabParams();
        for (var i = 0; i < languageManagement.editedCells.length; i++) {
            var cellInput = $(languageManagement.editedCells[i]);
            var id = cellInput.data('id');
            var value = cellInput.val();
            if (typeof id == "undefined" || id == "") {
                if (value.trim() != '') {
                    var cellAndRow = cellInput.parents('td,tr');
                    var cellIndex = cellAndRow[0].cellIndex;
                    var rowIndex = cellAndRow[1].rowIndex;
                    var selectedLanguage = languageManagement.systemLanguages[cellIndex - languageManagement.initNumberOfColumn];
                    var selectedFieldDisplayNameItem = languageManagement.fieldDisplayNameFieldItemList[rowIndex - languageManagement.initNumberOfRows];
                    languageManagement.addFieldDisplayName(selectedLanguage, selectedFieldDisplayNameItem, value, cellInput);
                }
            } else if (value.trim() == '') {
                languageManagement.deleteFieldDisplayName(id, cellInput);
            } else {
                languageManagement.updateFieldDisplayName(id, value, cellInput);
            }
        }
        setTimeout(function(){
            languageManagement.getMenuRelated(params.menuId,params.tabType,params.$container,params.tableID);
        },500)
        languageManagement.editedCells = [];
    },
    addFieldDisplayName : function(selectedLanguage, selectedFieldDisplayNameItem, value, cellElement,params) {
        var addFieldDisplayNameRequest = new AddFieldDisplayNameType(value, selectedFieldDisplayNameItem.itemID,
            selectedFieldDisplayNameItem.fieldName, selectedLanguage.id, selectedFieldDisplayNameItem.fieldType);
        callWebService(addFieldDisplayNameRequest, languageManagement.addFieldDisplayNameHandler, cellElement,params);
    },
    addFieldDisplayNameHandler : function(jsonObj, cellElement) {
        if (util.isSuccessfulResponse(jsonObj.addfielddisplaynameresponsetype)) {
            var fieldDisplayName = jsonObj.addfielddisplaynameresponsetype.fielddisplayname;
            cellElement.data("id", fieldDisplayName.id);
            uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to add field display name!", jsonObj.addfielddisplaynameresponsetype.result);
        }
    },
    updateFieldDisplayName : function(id, updatedValue, cellElement) {
        var updateFieldDisplayNameResponse = new UpdateFieldDisplayNameType(id, updatedValue);
        callWebService(updateFieldDisplayNameResponse, languageManagement.updateFieldDisplayNameHandler, cellElement);
    },
    updateFieldDisplayNameHandler : function(jsonObj, cellElement) {
        if (util.isSuccessfulResponse(jsonObj.updatefielddisplaynameresponsetype)) {
            //TODO
            var fieldDisplayName = jsonObj.updatefielddisplaynameresponsetype.fielddisplayname;
            cellElement.data("id", fieldDisplayName.id);
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save field display name!", jsonObj.updatefielddisplaynameresponsetype.result);
        }
    },
    deleteFieldDisplayName : function(id, cellElement) {
        var deleteFieldDisplayNameResponse = new DeleteFieldDisplayNameType(id);
        callWebService(deleteFieldDisplayNameResponse, languageManagement.deleteFieldDisplayNameHandler, cellElement);
    },
    deleteFieldDisplayNameHandler : function(jsonObj, cellElement) {
        if (util.isSuccessfulResponse(jsonObj.deletefielddisplaynameresponsetype)) {
            cellElement.data("id", "");
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete field display name", response.deletefielddisplaynameresponsetype.result);
        }
    },
    cancelChanges : function() {
        languageManagement.editedCells = [];
        languageManagement.toBeDeletedLanguageColumns = [];
        languageManagement.currentEditedLanguageColIndex = -1;
        $(".language-tab input[type='checkbox']").prop("checked", false);

        // 重新请求数据-实现整体全部撤销
        var params = languageManagement.getTabParams();
        languageManagement.getMenuRelated(params.menuId,params.tabType,params.$container,params.tableID);
    },
    updateSystemLanguageHandler : function(jsonObj, tableID) {
        if (util.isSuccessfulResponse(jsonObj.updatesystemlanguageresponsetype)) {
            languageManagement.loadLanguageData(false, tableID);
            languageManagement.populateFieldDisplayNameDetails(tableID, 0,languageManagement.tabType);
            $('#popupAddLanguageColumn').popup('close');
            setTimeout(function() {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }, 100);
            // 添加语言后重新请求数据
            var params = languageManagement.getTabParams();
            languageManagement.getMenuRelated(params.menuId,params.tabType,params.$container,params.tableID);
        } else {
            $('#popupAddLanguageColumn').popup('close');
            setTimeout(function() {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to add language!", jsonObj.updatesystemlanguageresponsetype.result);
            }, 100);
        }
        $('#edit-language-id').val('');
        languageManagement.currentEditedLanguageColIndex = -1;
    },
    loadFieldDisplayNameData : function() {
        var listFieldDisplayNamesGroupResponse = new ListFieldDisplayNamesGroupType();
        callWebService(listFieldDisplayNamesGroupResponse, languageManagement.loadFieldDisplayNameDataHandler);
    },

    loadFieldDisplayNameDataHandler : function(jsonObj,tableID,tabType,fieldTypeIndex) {
        // fieldTypeIndex 兼容处理
        if(fieldTypeIndex =="" || fieldTypeIndex == undefined || fieldTypeIndex == null){
            fieldTypeIndex = 0;
        }
        languageManagement.fieldDisplayNameFieldTypeGroups = jsonObj.fieldDisplayNameList;
        languageManagement.populateFieldDisplayNameDetails(tableID, fieldTypeIndex,tabType);
    },
    clearFieldDisplayNameDetails : function(tableID,tabType) {
        var tableObj = document.getElementById(tableID);
        for (var i = 0; i < languageManagement.selectedField[tabType].selectedFieldDisplayNameFieldItemTypeList.length; i++) {
            tableObj.deleteRow(-1);
        }
        if (languageManagement.selectedField[tabType].languageColumnsPopulated) {
            var langColCount = tableObj.rows[0].cells.length - languageManagement.initNumberOfColumn;
            for (var i = 0; i < langColCount; i++) {
                var allRows = tableObj.rows;
                for (var j = 0; j < allRows.length; j++) {
                    if (allRows[j].cells.length > 1) {
                        allRows[j].deleteCell(-1);
                    }
                }
            }
            //languageManagement.languageColumnsPopulated = false;
            languageManagement.selectedField[tabType].languageColumnsPopulated = false;
        }
        languageManagement.selectedField[tabType].selectedFieldDisplayNameFieldItemTypeList = [];
        languageManagement.fieldDisplayNameFieldItemList = [];
    },
    populateFieldDisplayNameDetails : function(tableID, fieldTypeIndex,tabType) {
        // 保存左侧激活菜单索引
        languageManagement.fieldTypeIndex = fieldTypeIndex;
        languageManagement.clearFieldDisplayNameDetails(tableID,tabType);
        var fieldDisplayNameFieldTypeGroupResponse = languageManagement.fieldDisplayNameFieldTypeGroups[fieldTypeIndex];
        if(fieldDisplayNameFieldTypeGroupResponse){
            var fieldDisplayNameFieldItemTypeList = util.getElementsArray(fieldDisplayNameFieldTypeGroupResponse.fieldDisplayNameGroups);
        }else{
            fieldDisplayNameFieldItemTypeList = [];
        }

        languageManagement.selectedField[tabType].selectedFieldDisplayNameFieldItemTypeList = fieldDisplayNameFieldItemTypeList;
        // 显示表头fieldName
        fieldDisplayNameFieldItemTypeList.length > 0 && $(".table-title").show();
        // 加载表格第一列，字段信息
        for (var i = 0; i < fieldDisplayNameFieldItemTypeList.length; i++) {
            var fieldDisplayNamesHTML = "";
            var fieldDisplayNameGroupResponse = fieldDisplayNameFieldItemTypeList[i];
            var fieldName = fieldDisplayNameGroupResponse.fieldName;
            // menuRelated菜单下shortName替换成kitchenName
            fieldName = (tabType === 'menuRelated' && fieldName=='shortName') ? 'kitchenName' : fieldName;
            fieldDisplayNamesHTML += "<tr id='row_" + i +"'><td>" + systemLanguage.getTxtById(fieldName, window.parent.pwipt.lan) + "</td>";
            fieldDisplayNamesHTML += "</tr>";
            $("#" + tableID + " tr:last").after(fieldDisplayNamesHTML);
        }
        // 加载表格表头和表格中input框
        languageManagement.populateLanguageColumns(tableID,tabType);
        // 加载表格中文本框中字段的值
        languageManagement.populateLanguageColumnsValue(fieldDisplayNameFieldItemTypeList);
    },
    // 加载表格中文本框中字段的值
    populateLanguageColumnsValue: function(fieldDisplayNameFieldItemTypeList){
        var tabType = languageManagement.tabType;
        for (var i = 0; i < fieldDisplayNameFieldItemTypeList.length; i++) {
            var fieldDisplayNames = fieldDisplayNameFieldItemTypeList[i].fieldDisplayNames;
            var fieldType = fieldDisplayNameFieldItemTypeList[i].fieldType;
            var fieldName = fieldDisplayNameFieldItemTypeList[i].fieldName;
            for (var j = 0; j < fieldDisplayNames.length; j++) {
                // 获取当前已经创建input的id
                var id = $('#'+tabType+' .language-tab tbody tr').eq(i+1).find("td").eq(j+1).find("input").attr("id");
                var languageID = fieldDisplayNames[j].languageId;
                var languageCode = fieldDisplayNames[j].languageCode;
                if (typeof languageManagement.languageColumns[languageID] != 'undefined') {
                    var targetCellObj = $('#'+tabType+ ' #row_' + i + ' td').eq(languageManagement.languageColumns[languageID]);
                    //targetCellObj.html("<input type='text' id='editable-cell" + i + "_" + languageManagement.languageColumns[languageID] +"' value='' onchange='languageManagement.markAsEdited(this);' data-id='"
                    targetCellObj.html("<input type='text' id='"+id+"' value='' onchange='languageManagement.markAsEdited(this);' data-id='"
                        + fieldDisplayNames[j].id + "'/>");
                    targetCellObj.find('input').val(fieldDisplayNames[j].name);
                    // 设置item/option/caterogy的posName最多输入字符个数,
                    var enRow = languageManagement.languageColumn['en'],          // 英文所在列
                        zhRow = languageManagement.languageColumn['zh-cn'],        // 中文所在列
                        zhHantRow = languageManagement.languageColumn['zh-Hant'],  // 繁体中文所在列
                        $posNameRow = $('#'+tabType+' #row_'+ i);
                    if(fieldName =="posName"){
                        this.setInputMaxLen(fieldType,$posNameRow,enRow,zhRow,zhHantRow);
                    }
                    // 设置systemRelated下的course name
                    if(fieldName =="name" && tabType == 'systemRelated' && fieldType=='COURSE'){
                        var $inputCourseEn  =  $("td", $posNameRow).eq(enRow).find("input");
                        var $inputCourseZh  =  $("td", $posNameRow).eq(zhRow).find("input");
                        var $inputCourseZhH  =  $("td", $posNameRow).eq(zhHantRow).find("input");
                        $inputCourseEn.attr("maxLength",9)
                        // 中文course
                        $inputCourseZh.attr("maxLength",4)
                        // 繁体中文course
                        $inputCourseZhH.attr("maxLength",4)
                    }
                }
            }
            languageManagement.fieldDisplayNameFieldItemList.push(fieldDisplayNameFieldItemTypeList[i]);
        }
    },
    // 计算指定的输入框最多能输入字符个数
    // $posNameRow: posName所在行Dom对象
    // fieldType： 字段类型：（SALE_ITEM、 CATEGORY、ITEM_OPTION）
    // enRow: 英文所在列索引
    // zhRow: 中文所在列索引
    // zhHantRow: 繁体中文所在列索引
    setInputMaxLen:function(fieldType,$posNameRow,enRow,zhRow,zhHantRow){
        var $inputEn  =  $("td",$posNameRow).eq(enRow).find("input"),
            $inputZh  =  $("td",$posNameRow).eq(zhRow).find("input"),
            $inputZhH  =  $("td",$posNameRow).eq(zhHantRow).find("input");
        switch (fieldType){
            case 'SALE_ITEM':
                $inputEn.attr("maxLength",20)
                $inputZh.attr("maxLength",10)
                $inputZhH.attr("maxLength",10)
                break;
            case 'CATEGORY':
            case 'GLOBAL_OPTION_CATEGORY':
                $inputEn.attr("maxLength",15)
                $inputZh.attr("maxLength",7)
                $inputZhH.attr("maxLength",7)
                break;
            case 'ITEM_OPTION':
            case 'ITEM_SUB_OPTION':
            case 'GLOBAL_OPTION':
                $inputEn.attr("maxLength",8)
                $inputZh.attr("maxLength",5)
                $inputZhH.attr("maxLength",5)
                break;
            default: ''
        }

    },
    populateLanguageColumns : function(tableID,tabType) {
        if ($("#add-language-select").length > 0) {
            $('#add-language-select').find('option').remove();
        }
        for (var i = 0; i < languageManagement.systemLanguages.length; i++) {
            var systemLanguage = languageManagement.systemLanguages[i];
            if (systemLanguage.enabled == "true") {
                languageManagement.addColumn(tableID, systemLanguage.code, systemLanguage.id, systemLanguage.name, i);
            }
        }
        for (var i = 0; i < languageManagement.allSystemLanguages.length; i++) {
            var systemLanguage = languageManagement.allSystemLanguages[i];
            $("#add-language-select").append("<option value='" + systemLanguage.id + "'>" + systemLanguage.name + "</option>").trigger("create");
        }
        $("#add-language-select").selectmenu("refresh");
        //languageManagement.languageColumnsPopulated = true;
        languageManagement.selectedField[tabType].languageColumnsPopulated = true;
    },
    loadLanguageData : function(isLoadFieldDisplayNameData, tableID) {
        var listSystemLanguagesRequest = new ListSystemLanguagesType(true);
        callWebService(listSystemLanguagesRequest,languageManagement.listSystemLanguagesHandler, isLoadFieldDisplayNameData);
    },
    listSystemLanguagesHandler : function(jsonObj, isLoadFieldDisplayNameData) {
        if (util.isSuccessfulResponse(jsonObj.listsystemlanguagesresponsetype)) {
            languageManagement.nextLanguageColumnIdx = languageManagement.initNumberOfColumn;
            languageManagement.systemLanguages = [];
            languageManagement.languageColumns = [];
            languageManagement.languageIDByColumnIndex = [];
            languageManagement.allSystemLanguages = util.getElementsArray(jsonObj.listsystemlanguagesresponsetype.systemlanguage);
            for (var i = 0; i < languageManagement.allSystemLanguages.length; i++) {
                if (languageManagement.allSystemLanguages[i].enabled == "true") {
                    languageManagement.systemLanguages.push(languageManagement.allSystemLanguages[i]);
                }
            }
            for (var i = 0; i < languageManagement.systemLanguages.length; i++) {
                languageManagement.languageColumns[languageManagement.systemLanguages[i].id] = languageManagement.nextLanguageColumnIdx;
                languageManagement.languageIDByColumnIndex[languageManagement.nextLanguageColumnIdx] = languageManagement.systemLanguages[i].id;
                languageManagement.nextLanguageColumnIdx++;
            }
            if (isLoadFieldDisplayNameData) {
                //languageManagement.loadFieldDisplayNameData();
            }
        }
    },
    // 菜单相关数据
    getMenuRelated: function( menuId,path,$container,tableID ){
        var self = this;
        $.ajax({
            url: this.baseUrl + path + '?menuId=' + menuId,
            type: 'get',
            dataType:'json',
            beforeSend: function(){
                // 为了防止网络请求慢导致切换tab时数据显示上一个tab数据
                // 显示loading和遮罩
                $('.overlay').show();
                //$(window.parent.document).find('.ui-loader').show();
                $('.ui-loader').css({'display':'block'})
            },
            success: function(data){
                self.MenuRelated = data;
                // 这里的path参数当做tab的type类型来使用：
                self.setMenuRelatedMenu( data.fieldDisplayNameList,$container,tableID,path )
                // system related和other 下没有menuList下拉列表
                if(data.menuList && data.menuList.length>0){
                    self.setMenuList( data.menuList,path,tableID,$("#menuLists"));
                }
                // 隐藏loading和遮罩
                $('.overlay').hide();
                //$(window.parent.document).find('.ui-loader').hide();
                $('.ui-loader').css({'display':'none'})
            },
            error: function(){
                console.log("数据加载失败！！")
            }
        })
    },
    // 设置Menu Related左侧菜单
    setMenuRelatedMenu: function( menuLists,$container,tableID,tabType ){
        // 隐藏表头fieldName
        $(".table-title").hide();
        // 清除search输入框内容
        $(".searchInput").val("")
        var fieldTypeListHtml = "<ul data-role='listview' data-inset='true' id='fieldType-list'>";
        for (var i = 0,len=menuLists.length; i <len; i++) {
            if(i==languageManagement.verticalMenuSelectedIndex){
                // 默认选中第一个左侧菜单
                fieldTypeListHtml += "<li><a href='#'+tabType class='active'>" + systemLanguage.getTxtById(menuLists[i].fieldType, window.parent.pwipt.lan) + "</a></li>";
            }else{
                fieldTypeListHtml += "<li><a href='#'+tabType>" + systemLanguage.getTxtById(menuLists[i].fieldType, window.parent.pwipt.lan)  + "</a></li>";
            }

        }
        fieldTypeListHtml += "</ul>";
        $container.empty().append(fieldTypeListHtml).trigger("create");
        $container.off('click').on('click', '#fieldType-list li a',function(){
            // 清除search输入框内容
            $(".searchInput").val("")
            // 切换tab后：当前编辑的文本框记录清空
            languageManagement.editedCells = [];
            // 控制当前左侧tab选中，其他取消选中
            $(".ui-btn",$container).removeClass("active");
            $(this).addClass("active")
            languageManagement.populateFieldDisplayNameDetails(tableID,$(this).parent().index(),tabType)
            // 保存当前选中的左侧菜单索引
            languageManagement.verticalMenuSelectedIndex = $(this).parent().index();
        })
        // 渲染右侧主体内容
        this.loadFieldDisplayNameDataHandler(this.MenuRelated,tableID,tabType,languageManagement.verticalMenuSelectedIndex)
    },
    // 设置Menu Related下的menulist
    setMenuList: function( data,path,tableID,$menuList ){
        var self = this;
        // 为了解决jquery mobile动态生成option，第一个option不能选中，所以新增一个空的option
        var html = "<option value='-1' style='display: none'></option>";
        for( var i=0, len=data.length; i<len; i++){
            html += '<option value="'+data[i].id+'">'+data[i].name+'</option>'
        }
        $menuList.empty().append(html)
        self.isFirstLoadData && $menuList.val(languageManagement.selectedIndex).selectmenu('refresh', true);
        self.isFirstLoadData = false;
        // 事件绑定
        $menuList.off().change(function(){
            var menuId = $(this).children('option:selected').val();
            var val = $(this).children('option:selected').text();
            // 加载menu相关数据，参数为需要插入数据的容器和表格id
            self.getMenuRelated(menuId,path,$("#menuRelated > .ui-block-a"),tableID);
            $menuList.val(this.selectedIndex).selectmenu('refresh', true);
            // 保存selectedIndex
            languageManagement.selectedIndex = this.selectedIndex;
            // 切换select后：左侧选中垂直菜单索引设置为0
            languageManagement.verticalMenuSelectedIndex = 0;
            // 切换tab后：当前编辑的文本框记录清空
            languageManagement.editedCells = [];
        })
    },
    // tab绑定的事件
    tabBindEvent: function(){
        var self = this;
        $("#tabList ul").on("click","li",function(){
            // 隐藏表头fieldName
            $(".table-title").hide();
            // 所有左侧tab取消选中
            $("#tabs .ui-btn").removeClass("active");
            // 切换tab后：左侧选中垂直菜单索引设置为0
            languageManagement.verticalMenuSelectedIndex = 0;
            // 切换tab后：当前编辑的文本框记录清空
            languageManagement.editedCells = [];

            var index = $(this).index();
            // 如果点击的是menuRelated，下拉框默认选择第一个
            if( index == 0){
                $("#menuLists").val(1).selectmenu('refresh', true);
            }
            var $container = $("#tabs .menubox-"+index+" > .ui-block-a");
            // 请求路径，用于区分是menu、system、other这三个tab下的数据请求
            var path = $(this).data("path");
            self.tabType = path;
            self.getMenuRelated('',path,$container,'languageTable-'+index);
        })
    }

};