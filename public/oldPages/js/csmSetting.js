var csmServerUrl="http://34.192.101.119:8080/csm";
var headerToken ;
var cmsSettingPage = {
    init : function() {
        loadCompanyInfo.init();
        uiBaseObj.addDeleteConfirmDialog("cmsSettingPage", "deleteStaffConfirmationDialog", "Staff", "staffObj.deleteStaffRow();");
        uiBaseObj.addDeleteConfirmDialog("cmsSettingPage", "deleteRoleConfirmationDialog", "Role", "role.deleteRecord();");
        uiBaseObj.addDeleteConfirmDialog("cmsSettingPage", "deleteLocationConfirmationDialog", "Location", "locationCsm.deleteRow();");
    }
};
var  loadCompanyInfo = {
    companyInfo: null,
    init: function () {
        /* var currentUser = biscuit.u();
          var merchantId  ;
          if (util.isValidVariable(currentUser)) {
              var merchantInfo = biscuitHelper.getMerchantInfo(currentUser);
              merchantId =  merchantInfo.merchantIds;
          }*/
        var soapType = new FetchCompanyProfileType();
        callWebService(soapType, loadCompanyInfo.loadCompanyProfileHandler);
    },
    loadCompanyProfileHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.fetchcompanyprofileresponsetype)) {
            loadCompanyInfo.companyInfo = jsonObj.fetchcompanyprofileresponsetype.company;
            var merchantId = loadCompanyInfo.companyInfo.merchantid  ;
            headerToken=merchantId;
            $("#createdBy").val(merchantId);
            if(merchantId != null && merchantId!=''){
                $.ajax({
                    type: 'get',
                    url: csmServerUrl+"/company/queryCompanyId/"+merchantId,
                    contentType: "application/json",
                    beforeSend: function(request) {
                        request.setRequestHeader("Token", headerToken);
                    },
                    datatype: "json",
                    success: function(data){
                        if(data!=null){
                            if(data.companyDTO!=null){
                                $("#pubCompanyId").val(data.companyDTO.id);
                                $("#companyId").val(data.companyDTO.id);
                            }
                            company.init();
                            locationCsm.init();
                            staffObj.init();
                            role.init();
                            syncSetting.init();
                        }
                    },
                    error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To Load Company Id!", doc.responseJSON.errorMsg);}

                })
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To Load Company Info!", jsonObj.fetchcompanyprofileresponsetype.result);
        }
    },
};

var staffObj = {
    staffMembers : [],
    functionModules : [],
    staffList : [],
    roleList : [],
    locationList : [],
    operation : "",
    selectedRoles : [],
    selectedLocation : [],
    selectedUserLevelFunctions : [],
    roleMapById : {},
    locationMapById : {},
    functionMapById : {},
    toBeDeletedElementID : -1,
    showStaffPassword : false,
    currentOrPast:"CURRENT",
    init : function() {
        $("#staffDetailMainDiv :input").prop("disabled", false);
        var findShowStaffPasswordConfig = new FindSystemConfigurationsType('SHOW_STAFF_PASSWORD', false);
        callWebService(findShowStaffPasswordConfig, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
                var configList = util.getElementsArray(jsonObj.listsystemconfigurationsresponsetype.systemconfiguration);
                if (configList.length > 0) {
                    staffObj.showStaffPassword = util.isBooleanTrue(configList[0].value);
                    if (staffObj.showStaffPassword  && staffObj.hasSuperUserManagementPermission()) {
                        document.getElementById("passcode").setAttribute("type", "text");
                    }
                }
            }
        });
        staffObj.listAllFunctionModules();
        staffObj.listAllStaff();
        staffObj.listAllRoles();
        staffObj.listAllLocation();
    },
    selectRow : function(tableID, selectedIndex) {
        var table = document.getElementById(tableID);
        var staff = staffObj.staffMembers[selectedIndex];
        var rowCount = table.rows.length;
        staffObj.operation = uiBaseObj.UPDATE;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if(i == selectedIndex) {
                row.style.background = '#dcfac9';
                row.cells[0].style.background = '#dcfac9';
                row.cells[1].style.background = '#dcfac9';

                $("#staffDetailMainDiv :input").prop("disabled", false);
                $("#staffName").val(staff.name);
                $("#lastName").val(staff.lastName);
                if (staff.skillLevel == null || staff.skillLevel ==""){
                    $("#staffSkillLevel").val(1);
                }else {
                    $("#staffSkillLevel").val(staff.skillLevel).selectmenu("refresh");
                }
                $("#joinDate").val(staff.joinDate);
                $("#birthday").val(staff.birthday);
                $("#thirdPartyPunchCode").val(staff.thirdPartyPunchCode);
                $("#mappingId").val(staff.mappingId);
                $("#maxWeeklyHours").val(staff.maxWeeklyHours);
                $("#email").val(staff.email);
                $("#staffWage").val(staff.wage);
                $("#staffWageType").val(staff.wageType).selectmenu("refresh");
                $("#requireClockInOut").prop("checked", staff.requireClockInOut == "1").checkboxradio("refresh");
                $("#requireCashInOut").prop("checked", staff.requireCashInOut == "1").checkboxradio("refresh");
                $("#requireReportCashTips").prop("checked", staff.requireInputCashTips == "1").checkboxradio("refresh");

                if (staff.notes && typeof staff.notes != "undefined") {
                    $("#staffNotes").val(staff.notes);
                } else {
                    $("#staffNotes").val("");
                }
                if (staff.homePhone != null) {
                    $("#homePhone").val(staff.homePhone);
                } else {
                    $("#homePhone").val("");
                }
                if (staff.cellPhone != null) {
                    $("#cellPhone").val(staff.cellPhone);
                } else {
                    $("#cellPhone").val("");
                }

                $("#street").val(staff.street==null?"":staff.street);
                $("#city").val(staff.city==null?"":staff.city);
                $("#state").val(staff.state==null?"":staff.state);
                $("#zipcode").val(staff.zipcode==null?"":staff.zipcode);
                $("#passcode").val(staff.user==null?"":staff.user.passcode);
                $("#swipeData").val(staff.user==null?"":staff.user.swipeData);

                $("#staffId").val(staff.id);
                $("#userId").val(staff.user==null?"" : staff.user.id);

                $("#earliestClockInTime").val(staff.earliestClockInTime);

                var userFunctionModules = util.getElementsArray(staffObj.staffList[selectedIndex].permissionDTOList);
                var userRoles = util.getElementsArray(staffObj.staffList[selectedIndex].roleDTOList);
                var userLocation = util.getElementsArray(staffObj.staffList[selectedIndex].locationDTOList);
                staffObj.selectedUserLevelFunctions = userFunctionModules;
                staffObj.selectedRoles = userRoles;

                var selectedRoleLevelFunctions = [];
                for (var j = 0; j  < staffObj.selectedRoles.length; j ++) {
                    var targetRole = staffObj.roleMapById[staffObj.selectedRoles[j].id];
                    var roleFunctionList = util.getElementsArray(targetRole.permissionDTOList);
                    for (var k = 0; k < roleFunctionList.length; k++) {
                        selectedRoleLevelFunctions.push(roleFunctionList[k]);
                    }
                }

                $("#roles :checked").prop("checked", false);
                uiBaseObj.updateCheckBoxListBySelections("roles", userRoles);

                $("#staff-permission-tabs :checked").prop("checked", false);
                uiBaseObj.updateCheckBoxListBySelections("staff-permission-tabs", selectedRoleLevelFunctions);
                uiBaseObj.updateCheckBoxListBySelections("staff-permission-tabs", staffObj.selectedUserLevelFunctions);

                $("#stores :checked").prop("checked", false);
                uiBaseObj.updateCheckBoxListBySelections("stores", userLocation);

                if (staffObj.isSelfOrderUser(staff)) {
                    $("#staffDetailMainDiv :input").prop("disabled", true);
                    $("#staff-permission-tabs :checkbox").prop("disabled", false);
                    $("#save-staff-btn").prop("disabled", false);
                }

            } else {
                row.style.background = ''; //'#f0c992';
                row.cells[0].style.background = ''; //'#f0c992';
                row.cells[1].style.background = ''; //'#f0c992';
            }
        }
    },
    isSystemUser : function(staff) {
        return staff.systemUser != null && staff.systemUser == 1;
    },
    isOnlineOrderUser : function(staff) {
        return staffObj.isSystemUser(staff) && staff.name == 'OnlineOrder';
    },
    isSelfOrderUser : function(staff) {
        return staffObj.isSystemUser(staff) && staff.name == 'SelfOrder';
    },
    listAllFunctionModules : function() {
        $.ajax({
            url:csmServerUrl + "/permission",
            type:'GET',
            beforeSend: function(request) {
                request.setRequestHeader("Token",headerToken);
            },
            dataType:'json',
            success:function(doc){staffObj.listAllFunctionModulesHandler(doc)},
        });
    },
    listAllFunctionModulesHandler : function(jsonObj) {
        staffObj.functionModules = jsonObj.permissionDTOList;
        var adminPrivileges = [];
        var reportPrivileges = [];
        var orderingFoodPrivileges = [];
        var editOrderPrivileges = [];
        var paymentPrivileges = [];
        var operationPrivileges = [];
        for (var i = 0; i < staffObj.functionModules.length; i++) {
            var fm = staffObj.functionModules[i];
            var type = String(fm.type);
            if (type == 'ORDERING_FOOD') {
                orderingFoodPrivileges.push(fm);
            } else if (type == 'EDIT_ORDER') {
                editOrderPrivileges.push(fm);
            } else if (type == 'PAYMENT') {
                paymentPrivileges.push(fm);
            } else if (type == 'OPERATION') {
                operationPrivileges.push(fm);
            } else if (type == 'ADMIN') {
                adminPrivileges.push(fm);
            } else if (type == 'REPORT') {
                reportPrivileges.push(fm);
            }
        }
        $("#adminPrivilegesTable").html(staffObj.getStaffPrivilegesTableHTML(adminPrivileges));
        $("#reportPrivilegesTable").html(staffObj.getStaffPrivilegesTableHTML(reportPrivileges));
        $("#orderingFoodPrivilegesTable").html(role.getFunctionsTableHTML(orderingFoodPrivileges));
        $("#editOrderPrivilegesTable").html(role.getFunctionsTableHTML(editOrderPrivileges));
        $("#paymentPrivilegesTable").html(role.getFunctionsTableHTML(paymentPrivileges));
        $("#operationPrivilegesTable").html(role.getFunctionsTableHTML(operationPrivileges));




    },
    getStaffPrivilegesTableHTML : function(functionList) {
        return uiBaseObj.getAlignedTableContentHTML(functionList, 4, staffObj.getStaffPrivilegesTableCellHTML);
    },
    getStaffPrivilegesTableCellHTML : function(functionElement) {
        return '<input type="checkbox" name="staff-functions" class="staffFunctionsCheckbox" data-enhanced="true"  id="staff-functions_' + functionElement.id + '" value="' + functionElement.id + '" onchange="staffObj.addToFunctionList(this);"><label class="no-br-label func-div-' + functionElement.name + '">' + systemLanguage.getDisplayValueForDataFromApi(functionElement.name) + '</label>';
    },
    addStaffRow : function(tableID, staff, selectRowFunc, deleteRowFunc, index) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;
        var row = table.insertRow(rowCount);

        row.id = rowId;
        row.name = rowId;
        var isPassword = staff.posPasscode1 ;

        if (staffObj.showStaffPassword  && staffObj.hasSuperUserManagementPermission()) {
            var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+index+"\");'>" + staff.name + " " + util.getEmptyValueIfInvalid(staff.lastName) +"</td> " +
                "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+index+"\");'>" + staff.posPasscode1 +"</td>";
        } else {
            var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+index+"\");'>" + staff.name + " " + util.getEmptyValueIfInvalid(staff.lastName) + "</td>";
        }

        var noPasswordHtml="";
        if(currentOrPast=="CURRENT") {
             if(isPassword==null || isPassword==""){
                noPasswordHtml = "<td class=\"delete-icon-td\"><img src=\"css\\images\\new.png\"/></td>";
            }else{
                noPasswordHtml = "<td class=\"delete-icon-td\"></td>";
            }
        }
        var deleteTdContent;
        if (staffObj.isSystemUser(staff)) {
            deleteTdContent = "<td class=\"delete-icon-td\"></td>";
        } else if(staff.active == 1){
            deleteTdContent = "<td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+staff.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        } else if(staff.active == 0) {
            deleteTdContent = "<td class=\"check-icon-td\"><a href='javascript:"+deleteRowFunc+"("+staff.id+");'><img src=\"css\\images\\check-icon-small.png\"/></a></td>";
        }
        innerHTML  =innerHTML+noPasswordHtml+ deleteTdContent;
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    bringBackStaff : function() {
        $("#save-staff-btn").prop("disabled", true);
        var posPasscode1 = $("#passcode").val();
        var name = $("#staffName").val();
        var lastName = $("#lastName").val();
        var joinDate = $("#joinDate").val();
        var birthday = $("#birthday").val();
        var mappingId =  $("#mappingId").val();
        var maxWeeklyHours = $("#maxWeeklyHours").val();
        var email = $("#email").val();
        var description = $("#staffNotes").val();
        var street = $("#street").val();
        var city = $("#city").val();
        var state = $("#state").val();
        if (mappingId!=null && mappingId!="" &&  !staffObj.checkNumber(mappingId)){
            uiBaseObj.alert("","Mapping Id Must Be Number!");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (email!=null && email!="" &&  !staffObj.checkEmail(email)){
            uiBaseObj.alert("","Email Format Error!");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (maxWeeklyHours!=null && maxWeeklyHours!="" &&  !staffObj.checkNumber(maxWeeklyHours)){
            uiBaseObj.alert("","Max Weekly Hours Must Be Number!");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }

        if (joinDate != "" && !staffObj.checkDate(joinDate)){
            uiBaseObj.alert("", "Join Date Format is yyyy-HH-dd (e.g. 2015-03-21)");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (birthday != "" && !staffObj.checkDate(birthday)){
            uiBaseObj.alert("","Birthday Format is yyyy-HH-dd (e.g. 1995-03-21)");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (name == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PERSON_NAME, "Name Cannot Be Empty");
            $("#save-staff-btn").prop("disabled", false);
            return;
        } else if (!staffObj.checkSpecialChar(name)){
            return;
        }
        if (!staffObj.checkSpecialChar(lastName)){
            return;
        }
        if (!staffObj.checkSpecialChar(description)){
            return;
        }
        if (!staffObj.checkSpecialChar(street)){
            return;
        }
        if (!staffObj.checkSpecialChar(city)){
            return;
        }
        if (!staffObj.checkSpecialChar(state)){
            return;
        }

        if (posPasscode1 == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PASSCODE, "Passcode Cannot Be Empty");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (name == posPasscode1) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NAME_PASSCODE_SAME, "Name Cannot Be The Same As Passcode");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        var userDTO = staffObj.convertStaff();
        if (userDTO != null) {
            var saveUserRequestDTO = new SaveUserRequestDTO(userDTO);
            var staffId = $("#staffId").val();
            if (staffId > 0) {
                $.ajax({
                    url: csmServerUrl + "/user",
                    type: 'PUT',
                    dataType: 'json',
                    beforeSend: function (request) {
                        request.setRequestHeader("Token", headerToken);
                    },
                    contentType: "application/json",
                    data: JSON.stringify(saveUserRequestDTO),
                    success: function (doc) {
                        staffObj.saveStaffHandler(doc);
                    },
                    error: function (doc) {
                        uiBaseObj.alert("", "Failed To Save Staff:" + doc.responseJSON.errorMsg);
                        staffObj.operation = "";
                        $("#save-staff-btn").prop("disabled", false);
                    }
                });
            }
        }
    },
    deleteWithConfirmationDialog : function(id) {
        staffObj.toBeDeletedElementID = id;
        $('#deleteStaffConfirmationDialog').popup('open');
    },
    deleteStaffRow : function() {
        if (staffObj.toBeDeletedElementID && staffObj.toBeDeletedElementID >=0) {
            var userId = staffObj.toBeDeletedElementID;
            var companyId = $("#pubCompanyId").val();
            var active = 0;
            var updateUserStatusRequestDTO = new UpdateUserStatusRequestDTO(userId, companyId, active);
            $.ajax({
                url:csmServerUrl+"/user/userStatus",
                type:'PUT',
                dataType:'json',
                beforeSend: function(request) {
                    request.setRequestHeader("Token", headerToken);
                },
                contentType: "application/json",
                data:  JSON.stringify(updateUserStatusRequestDTO),
                success:function(doc){staffObj.deleteStaffHandler(doc);},
                error:function(doc){uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed To Delete Staff!", doc.responseJSON.errorMsg); staffObj.deletedRowId = "";}
            });
        }
        staffObj.toBeDeletedElementID = -1;
    },
    deleteStaffHandler : function(jsonObj) {
        staffObj.listAllStaff();
        uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        staffObj.deletedRowId = "";
    },
    clearForm : function(isReadOnly) {
        $("#staffId").val("");
        $("#userId").val("");
        $("#staffName").val("");
        $("#lastName").val("");
        $("#staffWage").val("");
        $("#staffWageType").val("1");
        $("#staffSkillLevel").val("1");
        $("#joinDate").val("");
        $("#birthday").val("");
        $("#thirdPartyPunchCode").val("");
        $("#mappingId").val("");
        $("#maxWeeklyHours").val("");
        $("#email").val("");
        $("#requireClockInOut").prop("checked", false).checkboxradio("refresh");
        $("#requireCashInOut").prop("checked", false).checkboxradio("refresh");
        $("#requireReportCashTips").prop("checked", false).checkboxradio("refresh");
        $("#staffNotes").val("");
        $("#homePhone").val("");
        $("#cellPhone").val("");
        $("#street").val("");
        $("#city").val("");
        $("#state").val("");
        $("#zipcode").val("");
        $("#passcode").val("");
        $("#swipeData").val("");
        $("#earliestClockInTime").val("");
        $("#staffDetailMainDiv :input").prop("disabled", isReadOnly);
        $("#staff-permission-tabs :checked").prop("checked", false);
        $("#roles :checked").prop("checked", false);
        $("#stores :checked").prop("checked", false);
        staffObj.selectedRoles = [];
        staffObj.selectedUserLevelFunctions = [];
        staffObj.selectedLocation = [],
            staffObj.operation = uiBaseObj.ADD;
    },
    newStaffEntry : function() {
        staffObj.clearForm(false);
        $("#staffName").focus();
    },
    convertStaff : function() {
        var name = $("#staffName").val();
        var lastName = $("#lastName").val();
        var wage = $("#staffWage").val();
        var wageType = $("#staffWageType").val();
        var skillLevel = $("#staffSkillLevel").val();
        var companyId = $("#pubCompanyId").val();
        var joinDate = $("#joinDate").val();
        var birthday = $("#birthday").val();
        var thirdPartyPunchCode = $("#thirdPartyPunchCode").val();
        var mappingId =  $("#mappingId").val();
        var maxWeeklyHours = $("#maxWeeklyHours").val();
        var email = $("#email").val();
        var requireClockInOut = 0;
        if ($("#requireClockInOut").prop("checked"))
        {
            requireClockInOut = 1;
        }
        var requireCashInOut = 0;
        if ($("#requireCashInOut").prop("checked"))
        {
            requireCashInOut = 1;
        }
        var requireReportCashTips = 0;
        if ($("#requireReportCashTips").prop("checked"))
        {
            requireReportCashTips = 1;
        }
        var cellPhone = $("#cellPhone").val();
        var homePhone = $("#homePhone").val();
        var street = $("#street").val();
        var city = $("#city").val();
        var state = $("#state").val();
        var zipcode = $("#zipcode").val();
        var notes = $("#staffNotes").val();
        var id = $("#staffId").val();
        var posPasscode1;
        var posPasscode2;
        if ($("#passcode").val() !=  null && $("#passcode").val() != "***") {
            posPasscode1 = $("#passcode").val();
        }
        if($("#swipeData").val() != null && $("#swipeData").val() != "********") {
            posPasscode2 = $("#swipeData").val();
        }
        var earliestClockInTime = $("#earliestClockInTime").val();
        if ($("#earliestClockInTime").prop("checked"))
        {
            earliestClockInTime = 1;
        }
        var permissionDTOList = [];
        $("#staff-permission-tabs :checked").each(function() {
            permissionDTOList.push(new PermissionDTO($(this).val(), ""));
        });

        var roleDTOList = [];
        $("#roles :checked").each(function() {
            roleDTOList.push(new RoleDTO($(this).val(), ""));
        });

        var locationDTOList = [];
        $("#stores :checked").each(function() {
            locationDTOList.push(new LocationDTO($(this).val(), ""));
        });

        var userDTO = new UserDTO(id, name, lastName, posPasscode1, posPasscode2, wage, wageType, companyId, requireClockInOut, requireCashInOut, requireReportCashTips, homePhone, cellPhone, street, city, state, zipcode, notes, earliestClockInTime, skillLevel, joinDate, birthday, thirdPartyPunchCode, mappingId, maxWeeklyHours, email, permissionDTOList, roleDTOList, locationDTOList)
        userDTO.active = 1;
        return userDTO;
    },
    checkSpecialChar : function (str) {
        if(str.indexOf("<") > -1 || str.indexOf("&") > -1){
            uiBaseObj.alert("", "'<' and' &' are not allowed to be entered!");
            $("#save-staff-btn").prop("disabled", false);
            return false;
        }
        return true;
    },
    saveStaffInfo : function() {
        $("#save-staff-btn").prop("disabled", true);
        var posPasscode1 = $("#passcode").val();
        var name = $("#staffName").val();
        var lastName = $("#lastName").val();
        var joinDate = $("#joinDate").val();
        var birthday = $("#birthday").val();
        var mappingId =  $("#mappingId").val();
        var maxWeeklyHours = $("#maxWeeklyHours").val();
        var email = $("#email").val();
        var description = $("#staffNotes").val();
        var street = $("#street").val();
        var city = $("#city").val();
        var state = $("#state").val();
        if (mappingId!=null && mappingId!="" &&  !staffObj.checkNumber(mappingId)){
            uiBaseObj.alert("","Mapping Id Must Be Number!");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (email!=null && email!="" &&  !staffObj.checkEmail(email)){
            uiBaseObj.alert("","Email Format Error!");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (maxWeeklyHours!=null && maxWeeklyHours!="" &&  !staffObj.checkNumber(maxWeeklyHours)){
            uiBaseObj.alert("","Max Weekly Hours Must Be Number!");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }

        if (joinDate != "" && !staffObj.checkDate(joinDate)){
            uiBaseObj.alert("", "Join Date Format is yyyy-HH-dd (e.g. 2015-03-21)");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (birthday != "" && !staffObj.checkDate(birthday)){
            uiBaseObj.alert("","Birthday Format is yyyy-HH-dd (e.g. 1995-03-21)");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (name == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PERSON_NAME, "Name Cannot Be Empty");
            $("#save-staff-btn").prop("disabled", false);
            return;
        } else if (!staffObj.checkSpecialChar(name)){
            return;
        }
        if (!staffObj.checkSpecialChar(lastName)){
            return;
        }
        if (!staffObj.checkSpecialChar(description)){
            return;
        }
        if (!staffObj.checkSpecialChar(street)){
            return;
        }
        if (!staffObj.checkSpecialChar(city)){
            return;
        }
        if (!staffObj.checkSpecialChar(state)){
            return;
        }

        if (posPasscode1 == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PASSCODE, "Passcode Cannot Be Empty");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (name == posPasscode1) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NAME_PASSCODE_SAME, "Name Cannot Be The Same As Passcode");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        var userDTO = staffObj.convertStaff();
        if (userDTO != null) {
            if (util.isValidVariable(userDTO.earliestClockInTime) && !staffObj.isValidTimeFormat(userDTO.earliestClockInTime)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "Time Format Has To Be: (hh:mm)!");
                $("#save-staff-btn").prop("disabled", false);
                return;
            }
           var companyId= userDTO.companyId;
            if (companyId == null || companyId==''){
                uiBaseObj.alert("companyId", "CompanyId Id is Null, Please Add Company Information First!");
                return;
            }
            var saveUserRequestDTO = new SaveUserRequestDTO(userDTO);
            var staffId = $("#staffId").val();
            if (staffId>0) {
                $.ajax({
                    url:csmServerUrl+"/user",
                    type:'PUT',
                    dataType:'json',
                    beforeSend: function(request) {
                        request.setRequestHeader("Token", headerToken);
                    },
                    contentType: "application/json",
                    data:  JSON.stringify(saveUserRequestDTO),
                    success:function(doc){staffObj.saveStaffHandler(doc);},
                    error:function(doc){uiBaseObj.alert("", "Failed To Save Staff:" + doc.responseJSON.errorMsg );
                        $("#save-staff-btn").prop("disabled", false);
                        return;
                    }
                });
            } else{
                $.ajax({
                    url:csmServerUrl+"/user",
                    type:'POST',
                    dataType:'json',
                    contentType: "application/json",
                    beforeSend: function(request) {
                        request.setRequestHeader("Token", headerToken);
                    },
                    data:  JSON.stringify(saveUserRequestDTO),
                    success:function(doc){staffObj.saveStaffHandler(doc);},
                    error:function(doc){uiBaseObj.alert("", "Failed To Save Staff:" + doc.responseJSON.errorMsg );
                        $("#save-staff-btn").prop("disabled", false);
                    }
                });
            }
        }
    },
    checkDate : function (value){
        var DATE_FORMAT = /^[0-9]{4}-[0-1]?[0-9]{1}-[0-3]?[0-9]{1}$/;
        if(DATE_FORMAT.test(value)){
            return true;
        } else {
            return false;
        }
    },
    checkNumber : function (value) {
        var NUMBER_FORMAT = /(^[1-9]\d*$)/;
        if(NUMBER_FORMAT.test(value)){
            return true;
        } else {
            return false;
        }
    },
    checkEmail : function(obj){
        var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        if(!reg.test(obj)){
            return false;
        }else{
            return true;
        }
    },
    isValidTimeFormat : function(input) {
        var pattern = /^[0-2][0-9]:[0-5][0-9]$/;
        return input.match(pattern) != null;
    },
    saveStaffHandler : function(jsonObj) {
        if(staffObj.operation == uiBaseObj.ADD) {
            uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
        } else if (staffObj.operation == uiBaseObj.UPDATE) {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        }
        staffObj.listAllStaff();
        staffObj.operation = "";
        $("#save-staff-btn").prop("disabled", false);
    },
    listAllStaff : function(isShowPrevStaff){
        staffObj.clearForm();
        document.getElementById("staffList").innerHTML = "";
        var currOrPast = "";
        if(isShowPrevStaff == true) {
            currOrPast = "PAST";
            $("#newStaffButton").hide();
            currentOrPast="PAST";
        } else{
            currOrPast = "CURRENT";
            $("#newStaffButton").show();
            currentOrPast="CURRENT";
        }
        var soapType;
        if(staffObj.hasSuperUserManagementPermission()) {
            soapType = new ListStaffType(null, true, isShowPrevStaff, true, true);
        } else {
            soapType = new ListStaffType(null, true, isShowPrevStaff, false, true);
        }
        var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
        if(companyId==null || companyId=="") return ;
        $.ajax({
            url:csmServerUrl +"/user/" + companyId + "/"+currOrPast,
            type:'GET',
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            dataType:'json',
            success:function(doc){staffObj.listAllStaffHandler(doc)},
        });

    },
    inputPasscode : function(obj) {
        if (obj.value == "***") {
            obj.value = "";
        }
    },
    hasRole: function(staff, roleName) {
        var roleList = util.getElementsArray(staff.roleDTOList);
        for (var i = 0; i < roleList.length; i++) {
            var role = roleList[i];
            if (roleName == role.name) {
                return true;
            }
        }
        return false;
    },
    hasSuperUserManagementPermission: function() {
        var currentUser = biscuit.u();
        return biscuitHelper.hasRole(currentUser, "Boss") || currentUser.userid == 'wisdomount';
    },
    listAllStaffHandler : function(jsonObj) {
        var staffListResponse = util.getElementsArray(jsonObj.userDTOList);
        document.getElementById("staffList").innerHTML = "";
        staffObj.staffMembers = [];
        staffObj.staffList = [];
        staffObj.functionMapById = {};
        var s, userType, staffType;
        for (var i = 0; i < staffListResponse.length; i++) {
            s = staffListResponse[i];
            if (staffObj.isSystemUser(s)) {
                continue;
            }
            if (!staffObj.hasSuperUserManagementPermission() && staffObj.hasRole(s, "Boss")) {
                // If current user does not have Boss role, boss users will be hidden for him/her
                continue;
            }
            if (staffObj.isOnlineOrderUser(s)) {
                continue;
            }

            if (!staffObj.showStaffPassword  || !staffObj.hasSuperUserManagementPermission()) {

                if (s.posPasscode1 == null || s.posPasscode1 == "") {
                    s.posPasscode1 = "";
                } else {
                    s.posPasscode1 = "***";
                }


                if (s.posPasscode2 == null || s.posPasscode2 == "") {
                    s.posPasscode2 = "";
                } else {
                    s.posPasscode2 = "********"
                }
            } else {
                if (s.posPasscode2 == null || s.posPasscode2 == "") {
                    s.posPasscode2 = "";
                }
            }
            userType = new UserType(s.id, s.posPasscode1, s.posPasscode2, s.systemUser);

            staffType = new StaffType(s.id, s.name, s.lastName, s.age, s.wage, s.wageType, s.requireClockInOut, s.requireCashInOut, s.requireInputCashTips, s.homePhone, s.cellPhone, s.street, s.city, s.state, s.zipcode, s.notes, userType, s.earliestClockInTime, s.skillLevel, s.joinDate, s.birthday, s.thirdPartyPunchCode, s.mappingEmployeeId, s.maxWeeklyHours, s.email);
            staffObj.staffMembers.push(staffType);
            staffObj.staffList.push(s);
            if (s.active == 1) {
                staffObj.addStaffRow("staffList", s, "staffObj.selectRow", "staffObj.deleteWithConfirmationDialog", staffObj.staffMembers.length - 1);
            } else if(s.active == 0) {
                staffObj.addStaffRow("staffList", s, "staffObj.selectRow", "staffObj.bringBackStaff", staffObj.staffMembers.length - 1);
            }
            staffObj.functionMapById[s.id] = s;
        }

    },
    listAllRoles : function(){
        var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
        if(companyId==null || companyId=="") return ;
        $.ajax({
            url:csmServerUrl+ "/role/" + companyId,
            type:'GET',
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            dataType:'json',
            success:function(doc){staffObj.listAllRolesHandler(doc)},
        });
    },
    listAllRolesHandler : function(jsonObj) {
        var rolesElement = document.getElementById("roles");
        staffObj.roleList = [];
        var roleListResponse = util.getElementsArray(jsonObj.roleDTOList);
        for (var i = 0; i < roleListResponse.length; i++) {
            var role = roleListResponse[i];
            if (!staffObj.hasSuperUserManagementPermission() && role.name == 'Boss') {
                // If current user does not have Boss role, boss role will be hidden for him/her
                continue;
            }
            staffObj.roleList.push(role);
        }

        staffObj.roleMapById = {};
        $("#roles").html(staffObj.getStaffRolesTableHTML(staffObj.roleList));
        for (var i = 0; i < staffObj.roleList.length; i++) {
            var roleElement = staffObj.roleList[i];
            staffObj.roleMapById[roleElement.id] = roleElement;
        }
    },
    listAllLocation : function(){
        var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
        if(companyId==null || companyId=="") return ;
        $.ajax({
            url:csmServerUrl+"/location/active/" + companyId,
            type:'GET',
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            dataType:'json',
            success:function(doc){staffObj.listAllLocationHandler(doc)},
        });
    },
    listAllLocationHandler : function(jsonObj) {
        var locationElement = document.getElementById("stores");
        staffObj.locationList = [];
        var locationListResponse = util.getElementsArray(jsonObj.locationDTOList);
        for (var i = 0; i < locationListResponse.length; i++) {
            var location = locationListResponse[i];
            staffObj.locationList.push(location);
        }

        staffObj.locationMapById = {};
        $("#stores").html(staffObj.getStaffLocationTableHTML(staffObj.locationList));
        for (var i = 0; i < staffObj.locationList.length; i++) {
            var locationElement = staffObj.locationList[i];
            staffObj.locationMapById[locationElement.id] = locationElement;
        }
    },
    getStaffRolesTableHTML : function(roleList) {
        return uiBaseObj.getAlignedTableContentHTML(roleList, 4, staffObj.getStaffRolesTableCellHTML);
    },
    getStaffLocationTableHTML : function(locationList) {
        return uiBaseObj.getAlignedTableContentHTML(locationList, 4, staffObj.getStaffLocationTableCellHTML);
    },
    getStaffRolesTableCellHTML : function(roleElement) {
        return '<input type="checkbox" name="staff-roles" class="staffRolesCheckbox" data-enhanced="true" id="staff-roles_' + roleElement.id + '" value="' + roleElement.id + '" onchange="staffObj.addToRoleList(this);">' + roleElement.name;
    },
    getStaffLocationTableCellHTML : function(locationElement) {
        return '<input type="checkbox" name="staff-stores" class="staffStoresCheckbox" data-enhanced="true" id="staff-stores_' + locationElement.id + '" value="' + locationElement.id + '">' + locationElement.name;
    },
    addToFunctionList : function(funCheckBoxElement) {
        var funcId = $(funCheckBoxElement).val();
        var checkedFunc = staffObj.functionMapById[funcId];
        if (typeof checkedFunc != "undefined" && checkedFunc) {
            var currentlyChecked = false;
            var currentIndex = -1;
            for (var i = 0; i < staffObj.selectedUserLevelFunctions.length; i++) {
                var targetFunc = staffObj.selectedUserLevelFunctions[i];
                if (targetFunc.id == checkedFunc.id) {
                    currentlyChecked = true;
                    currentIndex = i;
                }
            }
            if (!funCheckBoxElement.checked && currentIndex >= 0) {
                staffObj.splice(currentIndex);
            } else if (funCheckBoxElement.checked && currentIndex < 0) {
                staffObj.selectedUserLevelFunctions.push(checkedFunc);
            }
        }
    },
    addToRoleList : function(roleCheckBoxElement) {
        staffObj.selectedRoles = [];
        $("#roles :checked").each(function() {
            var roleId = $(this).val();
            staffObj.selectedRoles.push(staffObj.roleMapById[roleId]);
        });

        var selectedRoleLevelFunctions = [];
        for (var i = 0; i < staffObj.selectedRoles.length; i++) {
            var targetRole = staffObj.roleMapById[staffObj.selectedRoles[i].id];
            var roleFunctionList = util.getElementsArray(targetRole.permissionDTOList);
            for (var j = 0; j < roleFunctionList.length; j++) {
                selectedRoleLevelFunctions.push(roleFunctionList[j]);
            }
        }

        $("#staff-permission-tabs :checked").prop("checked", false);
        uiBaseObj.updateCheckBoxListBySelections("staff-permission-tabs", selectedRoleLevelFunctions);
        uiBaseObj.updateCheckBoxListBySelections("staff-permission-tabs", staffObj.selectedUserLevelFunctions);
    }
};

var staffAttendance = {
    attendanceList: [],
    attendanceListByElementId: {},
    staffListById: {},
    roleListById: {},
    currentAttendanceId: null,
    selectedRowId: null,
    init: function () {
        var todayDate = converter.getTodayDate();
        $("#fromDatePicker").val(todayDate);
        $("#toDatePicker").val(todayDate);
        this.loadAllStaff();
        this.loadAllRoles();
    },
    fetchAttendance: function () {
        var fromDate = $("#fromDatePicker").val();
        var toDate = $("#toDatePicker").val();
        var staffId = $("#staff-filter-list").val();
        if (fromDate && toDate) {
            var soapType = new FetchAttendanceType(fromDate, toDate, staffId);
            callWebService(soapType, this.fetchAttendanceHandler, this);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_FROM_TO_DATE, "FromDate And ToDate Not Selected!");
        }
    },
    fetchAttendanceHandler: function (response, callBackObj) {
        if (util.isSuccessfulResponse(response.fetchattendanceresponsetype)) {
            var attendances = util.getElementsArray(response.fetchattendanceresponsetype.attendance);
            var attendancesTableId = "staffAttendanceTable";
            callBackObj.removeAllRows(attendancesTableId);
            callBackObj.attendanceList = [];
            callBackObj.attendanceListByElementId = {};
            var totalBreakingHour = 0;
            var totalWorkingHour = 0;
            for (var i = 0; i < attendances.length; i++) {
                var elementId = "row_" + i;
                var attendanceHTML = callBackObj.getAttendanceRowHTML(elementId, attendances[i]);
                $("#" + attendancesTableId + " tbody").after(attendanceHTML);
                callBackObj.attendanceList.push(attendances[i]);
                callBackObj.attendanceListByElementId[elementId] = attendances[i];
                totalWorkingHour += staffAttendance.getTotalWorkingHour(attendances[i]);
                totalBreakingHour += staffAttendance.getTotalBreakHour(attendances[i]);
            }
            $("#" + attendancesTableId + " .attnRowCell").click(callBackObj, function () {
                if ($(this).hasClass('atdc-totalbreaktime')) {
                    callBackObj.selectTotalBreakTime($(this).closest("tr"));
                } else {
                    callBackObj.selectAttendance($(this).closest("tr"));
                }
            });
            $('#attdn-table-footer-total-working-hour').text(staffAttendance.timeConversion(totalWorkingHour));
            $('#attdn-table-footer-total-breaking-hour').text(staffAttendance.timeConversion(totalBreakingHour));
        }
    },
    timeConversion : function(inputTime) {
        var hours = parseInt(inputTime / 3600);
        var minutes = parseInt((inputTime % 3600) / 60);
        var seconds = inputTime % 60;
        hours = util.getLeftPaddedStr(hours, "0", 2);
        minutes = util.getLeftPaddedStr(minutes, "0", 2);
        seconds = util.getLeftPaddedStr(seconds, "0", 2);
        return hours + ":" + minutes + ":" + seconds;
    },
    getTotalWorkingHour : function (attendanceJsonObj) {
        if (attendanceJsonObj.endtime == null || attendanceJsonObj.endtime === "") {
            return 0;
        }
        var fromTimeISOFormat = attendanceJsonObj.starttime.replace(" ", "T");
        var toTimeISOFormat = attendanceJsonObj.endtime.replace(" ", "T");
        var totalWorkingHour = parseInt((new Date(toTimeISOFormat).getTime() - new Date(fromTimeISOFormat).getTime()) / 1000);
        return totalWorkingHour;
    },
    getTotalBreakHour : function (attendanceJsonObj) {
        var breakList = util.getElementsArray(attendanceJsonObj.breaks);
        var totalBreakTime = 0;
        for (var i = 0; i < breakList.length; i++) {
            if (breakList[i].endtime == null || breakList[i].endtime === "") {
                continue;
            }
            var fromTimeISOFormat = breakList[i].starttime.replace(" ", "T");
            var toTimeISOFormat = breakList[i].endtime.replace(" ", "T");
            totalBreakTime += parseInt((new Date(toTimeISOFormat).getTime() - new Date(fromTimeISOFormat).getTime()) / 1000);
        }
        return totalBreakTime;
    },
    removeAllRows : function (tableId) {
        $("#" + tableId + " tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    },
    filterAttendance: function () {
        var totalWorkingHourInSec = 0;
        var totalBreakHourInSec = 0;
        $("#staffAttendanceTable .attnRow").each(function() {
            var rowStaffId = $(this).find("td.atdc-staff").data("staffid");
            if ($("#staff-filter-list").val() !== "" && rowStaffId != $("#staff-filter-list").val()) {
                $(this).hide();
            } else {
                $(this).show();
                var workingHour = $(this).find("td.atdc-workinghours").text().split(':');
                var breakingHour = $(this).find("td.atdc-totalbreaktime").text().split(':');
                if (workingHour != null && workingHour != "") {
                    totalWorkingHourInSec += ((+workingHour[0]) * 60 * 60 + (workingHour[1]) * 60 + (+workingHour[2]));
                }
                if (breakingHour != null && breakingHour != "") {
                    totalBreakHourInSec += ((+breakingHour[0]) * 60 * 60 + (breakingHour[1]) * 60 + (+breakingHour[2]));
                }
            }
        });
        $('#attdn-table-footer-total-working-hour').text(staffAttendance.timeConversion(totalWorkingHourInSec));
        $('#attdn-table-footer-total-breaking-hour').text(staffAttendance.timeConversion(totalBreakHourInSec));
    },
    getAttendanceRowHTML: function (elementId, attendanceJsonObj) {
        var staff = this.staffListById[attendanceJsonObj.staffid];
        var breakTimeList = util.getElementsArray(attendanceJsonObj.breaks);
        return "<tr id='" + elementId + "' class='attnRow'>" +
            "<td class='attnRowCell atdc-staff' data-staffid='" + attendanceJsonObj.staffid + "'>" + staff.name + " " + (staff.lastname == null ? "" : staff.lastname) + "</td>" +
            "<td class='attnRowCell atdc-starttime'>" + attendanceJsonObj.starttime + "</td>" +
            "<td class='attnRowCell atdc-endtime'>" + (attendanceJsonObj.endtime == null ? "" : attendanceJsonObj.endtime) + "</td>" +
            "<td class='attnRowCell atdc-workinghours'>" + this.getTimeDisplayText(attendanceJsonObj.starttime, attendanceJsonObj.endtime) + "</td>" +
            "<td class='attnRowCell atdc-totalbreaktime'>" + this.getTotalBreakTime(breakTimeList) + "</td>" +
            "<td class='attnRowCell atdc-cashTipsAmount'>" + util.getEmptyValueIfInvalid(attendanceJsonObj.totalcashtips) + "</td>" +
            "<td class='attnRowCell atdc-role' data-roleid='" + this.getRoleId(attendanceJsonObj) + "'>" + this.getRoleName(attendanceJsonObj) + "</td>" +
            "<td class=\"delete-icon-td\"><a href=\"javascript:staffAttendance.printAttendanceRecord('" + elementId + "');\"><img src=\"css\\images\\print_icon&30.png\"/></a></td>" +
            "<td class=\"delete-icon-td\"><a href=\"javascript:staffAttendance.openDeletePanel('" + elementId + "');\"><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>" + "</tr>";
    },
    openDeletePanel : function (rowElementId) {
        var attendanceRecord = this.attendanceListByElementId[rowElementId];
        this.currentAttendanceId = attendanceRecord.id;
        $('#deleteConfirmationDialog').popup('open');
    },
    openStaffBreakDeletePanel : function () {
        $('#editBreakTimeDetailPopup').popup('close');
        setTimeout(function() {
            $('#deleteStaffBreakConfirmationDialog').popup('open');
        }, 100);
    },
    getRoleName : function(obj) {
        if (typeof obj.roleid != "undefined") {
            var role = this.roleListById[obj.roleid];
            if (role != null) {
                return role.name;
            }
        }
        return "";
    },
    getRoleId : function(obj) {
        if (typeof obj.roleid != "undefined") {
            return obj.roleid;
        }
        return "";
    },
    getTimeDisplayText: function (fromTime, toTime) {
        if (toTime == null || toTime === "") {
            return "";
        }
        var fromTimeISOFormat = fromTime.replace(" ", "T");
        var toTimeISOFormat = toTime.replace(" ", "T");

        var elapsedTimeInSeconds = parseInt((new Date(toTimeISOFormat).getTime() - new Date(fromTimeISOFormat).getTime()) / 1000);
        var hours = parseInt(elapsedTimeInSeconds / 3600);
        var minutes = parseInt((elapsedTimeInSeconds % 3600) / 60);
        var seconds = elapsedTimeInSeconds % 60;
        hours = util.getLeftPaddedStr(hours, "0", 2);
        minutes = util.getLeftPaddedStr(minutes, "0", 2);
        seconds = util.getLeftPaddedStr(seconds, "0", 2);
        return hours + ":" + minutes + ":" + seconds;
    },
    getTotalBreakTime : function (breakTimeList) {
        var totalBreakTime = 0;
        var showTime = false;
        for (var i = 0; i < breakTimeList.length; i++) {
            if (breakTimeList[i].endtime == null || breakTimeList[i].endtime === "") {
                continue;
            }
            showTime = true;
            var fromTimeISOFormat = breakTimeList[i].starttime.replace(" ", "T");
            var toTimeISOFormat = breakTimeList[i].endtime.replace(" ", "T");

            totalBreakTime += parseInt((new Date(toTimeISOFormat).getTime() - new Date(fromTimeISOFormat).getTime()) / 1000);

        }
        var hours = parseInt(totalBreakTime / 3600);
        var minutes = parseInt((totalBreakTime % 3600) / 60);
        var seconds = totalBreakTime % 60;
        hours = util.getLeftPaddedStr(hours, "0", 2);
        minutes = util.getLeftPaddedStr(minutes, "0", 2);
        seconds = util.getLeftPaddedStr(seconds, "0", 2);
        return showTime == true ? hours + ":" + minutes + ":" + seconds : '';
    },
    selectAttendance: function (tblRowObj) {
        this.selectedRowId = $(tblRowObj).attr("id");
        var attendanceRecord = this.attendanceListByElementId[$(tblRowObj).attr("id")];
        var staffCell = $(tblRowObj).find("td.atdc-staff");
        var startTime = $(tblRowObj).find('td.atdc-starttime').text();
        var endTime = $(tblRowObj).find('td.atdc-endtime').text();
        var staffId = staffCell.data("staffid");

        var roleCell = $(tblRowObj).find("td.atdc-role");
        var roleId = roleCell.data("roleid");

        $("#staff-select-list").val(staffId).selectmenu("refresh");
        $("#role-select-list").val(roleId).selectmenu("refresh");
        $("#fromDatetimePicker").val(startTime.replace(" ", "T"));
        $("#toDatetimePicker").val(endTime.replace(" ", "T"));
        $("#totalCashTips").val(attendanceRecord.totalcashtips);
        $("#memo").val(attendanceRecord.memo);
        this.currentAttendanceId = attendanceRecord.id;
        $('#editAttendanceDetailPopup').popup('open');
    },
    selectTotalBreakTime: function (tblRowObj) {
        this.selectedRowId = $(tblRowObj).attr("id");
        var attendanceRecord = this.attendanceListByElementId[$(tblRowObj).attr("id")];
        var breakTimeList = util.getElementsArray(attendanceRecord.breaks);
        $("#breakTimeDetail-div").empty();
        for (var i = 0; i < breakTimeList.length; i++) {
            if (breakTimeList[i].endtime == null || breakTimeList[i].endtime === "") {
                continue;
            }
            var breakTime = breakTimeList[i];
            var breakTimeHtml = '<div data-role="content" class="ui-corner-bottom ui-content align-element"><div data-role="fieldcontain">' +
                '<input id="breakTime-checkbox-' + breakTime.id + '" type="checkbox"/>' +
                '<div style="margin-left:8%;">' +
                '<label class="select" for="staff-select-list">' + this.getTimeDisplayText(breakTime.starttime, breakTime.endtime) + '</label>' +
                '<div data-role="fieldcontain"><label for="fromDatetimePicker" class="detail-input-from">From</label>' +
                '<input id="breakTime-startTime-' + breakTime.id + '" type="datetime-local" name="fromDatetimePicker" value=""/></div>' +
                '<div data-role="fieldcontain"><label for="toDatetimePicker" class="detail-input-to">To</label>' +
                '<input id="breakTime-endTime-' + breakTime.id + '" type="datetime-local" name="toDatetimePicker" value=""/></div>' +
                '<div data-role="fieldcontain"><label class="adjustmentReason" for="adjustmentReasonInput-' + breakTime.id +'">Reason</label>' +
                '<input id="adjustmentReasonInput-' + breakTime.id + '" list="adjustmentReasonList" name="adjustmentReason" class="form-control input-sm"/></div></div></div>';
            $("#breakTimeDetail-div").append(breakTimeHtml).trigger('create');
            $("#breakTime-startTime-"+breakTime.id).val(breakTime.starttime.replace(" ", "T"));
            $("#breakTime-endTime-"+breakTime.id).val(breakTime.endtime.replace(" ", "T"));
        }
        systemLanguage.loadLanguageForPage(staffPage);
        this.currentAttendanceId = attendanceRecord.id;
        $('#editBreakTimeDetailPopup').popup('open');
    },
    deleteAttendance: function () {
        $('#deleteConfirmationDialog').popup('close');
        if (this.currentAttendanceId != null) {
            var userAuth = admin.getUserAuthInfo();
            var soapType = new DeleteAttendanceType(this.currentAttendanceId, userAuth);
            callWebService(soapType, this.deleteAttendanceHandler, this);
        }

    },
    deleteAttendanceHandler: function (response, callBackObj) {
        if (util.isSuccessfulResponse(response.deleteattendanceresponsetype)) {
            callBackObj.fetchAttendance();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed To Delete Attendance", response.deleteattendanceresponsetype.result);
        }
    },
    newAttendance: function () {
        this.clearAttendanceDetails();
        $('#editAttendanceDetailPopup').popup('open');
    },
    clearAttendanceDetails: function () {
        $("#staff-select-list").val('').selectmenu("refresh");
        $("#role-select-list").val('').selectmenu("refresh");
        $("#fromDatetimePicker").val('');
        $("#toDatetimePicker").val('');
        $("#adjustmentReasonInput").val('');
        this.currentAttendanceId = null;
        this.selectedRowId = null;
    },
    formatJsDate : function(jsDate) {
        return jsDate.replace("T", " ") + ":00";
    },
    saveAttendance: function () {
        var staffId = $("#staff-select-list").val();
        var roleId = $("#role-select-list").val();
        var startTime = $("#fromDatetimePicker").val();
        var endTime = $("#toDatetimePicker").val();
        var attendanceId = this.currentAttendanceId;
        var totalCashTips = $("#totalCashTips").val();
        var adjustmentReason = $("#adjustmentReasonInput").val();
        var notes = $("#memo").val();

        if (staffId === '') {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_STAFF, "Please Select Staff Member!");
            return;
        }

        if (!startTime) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_START_TIME, "Please Select Start Time!");
            return;
        }

        var startTimeStr = this.formatJsDate(startTime);
        var endTimeStr = null;

        if (endTime) {
            if (endTime.localeCompare(startTime) < 0) {
                uiBaseObj.alert(systemLanguage.msgCodeList.START_TIME_LATER_THAN_END_TIME, "End Time Has To Be Later Than Start Time");
                return;
            }
            endTimeStr = this.formatJsDate(endTime);
        }

        var userAuth = admin.getUserAuthInfo();

        var attType = new StaffAttendanceType(attendanceId, staffId, startTimeStr, endTimeStr, roleId, totalCashTips, notes);
        if (attendanceId != null) {
            var soapType = new UpdateAttendanceType(attType, userAuth, adjustmentReason);
            callWebService(soapType, this.updateAttendanceHandler, this);
        } else {
            var soapType = new AddAttendanceType(attType, userAuth, adjustmentReason);
            callWebService(soapType, this.addAttendanceHandler, this);
        }
    },
    refreshWithoutChanges: function () {
        $('#editAttendanceDetailPopup').popup('close');
        $('#editBreakTimeDetailPopup').popup('close');
        this.clearAttendanceDetails();
    },
    addAttendanceHandler: function (response, callBackObj) {
        $('#editAttendanceDetailPopup').popup('close');
        if (util.isSuccessfulResponse(response.addattendanceresponsetype)) {
            callBackObj.fetchAttendance();
            setTimeout(function() {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            }, 100);
        } else {
            setTimeout(function() {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed To Udd Attendance Record!", response.addattendanceresponsetype.result);
            }, 100);
        }
    },
    updateAttendanceHandler: function (response, callBackObj) {
        $('#editAttendanceDetailPopup').popup('close');
        if (util.isSuccessfulResponse(response.updateattendanceresponsetype)) {
            callBackObj.fetchAttendance();
            setTimeout(function() {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }, 100);
        } else {
            setTimeout(function() {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed To Update Attendance Record!", response.updateattendanceresponsetype.result);
            }, 100);
        }
    },
    loadAllStaff: function () {
        var soapType = new ListStaffType();
        callWebService(soapType, this.loadAllStaffHandler, this);
    },
    loadAllStaffHandler: function (jsonObj, callBackObj) {
        if (util.isSuccessfulResponse(jsonObj.liststaffresponsetype)) {
            staffList = jsonObj.liststaffresponsetype.staff;
            staffList = util.getElementsArray(staffList);
            var staffDropDownElementId = "staff-filter-list";
            var staffSelectDropDownElementId = "staff-select-list";
            callBackObj.staffListById = {};
            $("#" + staffDropDownElementId).find('option').remove();
            $("#" + staffDropDownElementId).append("<option value=''>All</option>").trigger("create");
            $("#" + staffSelectDropDownElementId).find('option').remove();
            $("#" + staffSelectDropDownElementId).append("<option value=''>  </option>").trigger("create");
            for (var i = 0; i < staffList.length; i++) {
                var staff = staffList[i];
                $("#" + staffDropDownElementId).append("<option value='" + staff.id + "'>" + staff.name + "</option>").trigger("create");
                $("#" + staffSelectDropDownElementId).append("<option value='" + staff.id + "'>" + staff.name + "</option>").trigger("create");
                callBackObj.staffListById[staff.id] = staff;
            }
        }
    },
    loadAllRoles: function () {
        var soapType = new ListRolesType();
        callWebService(soapType, this.loadAllRolesHandler, this);
    },
    loadAllRolesHandler: function (jsonObj, callBackObj) {
        if (util.isSuccessfulResponse(jsonObj.listrolesresponsetype)) {
            roleList = util.getElementsArray(jsonObj.listrolesresponsetype.roles);
            var roleSelectDropDownElementId = "role-select-list";
            $("#" + roleSelectDropDownElementId).find('option').remove();
            $("#" + roleSelectDropDownElementId).append("<option value=''>  </option>").trigger("create");
            for (var i = 0; i < roleList.length; i++) {
                var role = roleList[i];
                $("#" + roleSelectDropDownElementId).append("<option value='" + role.id + "'>" + role.name + "</option>").trigger("create");
                callBackObj.roleListById[role.id] = role;
            }
        }
    },
    newBreakTime : function () {
        $('#editBreakTimeDetailPopup').popup('close');
        setTimeout(function() {
            $('#addBreakTimeDetailPopup').popup('open');
        }, 100);
    },
    cancelAddPopup : function () {
        $('#addBreakTimeDetailPopup').popup('close');
        setTimeout(function() {
            $('#editBreakTimeDetailPopup').popup('open');
        }, 100);
    },
    saveStaffBreak: function () {
        var attendanceRecord = this.attendanceListByElementId[this.selectedRowId];
        var attendanceId = attendanceRecord.id;
        var staffId = attendanceRecord.staffid;
        var staffBreakList = [];
        var breakTimeList = util.getElementsArray(attendanceRecord.breaks);
        for (var i = 0; i < breakTimeList.length; i++) {
            var breakTime = breakTimeList[i];
            var from = $("#breakTime-startTime-"+breakTime.id).val();
            var to = $("#breakTime-endTime-"+breakTime.id).val();
            var adjustmentReason = $("#adjustmentReasonInput-"+breakTime.id).val();
            if (breakTime.starttime.replace(" ", "T") == from && breakTime.endtime.replace(" ", "T") == to) continue; // skpi unchanged staff break record
            staffBreakList.push(new StaffBreak(breakTime.id, this.formatJsDate(from), this.formatJsDate(to), staffId, attendanceId, adjustmentReason));
        }
        var userAuth = admin.getUserAuthInfo();
        var soapType = new SaveStaffBreakType(staffBreakList, userAuth);
        callWebService(soapType, this.saveStaffBreakHandler, this);
    },
    addStaffBreak: function () {
        var attendanceRecord = this.attendanceListByElementId[this.selectedRowId];
        var attendanceId = attendanceRecord.id;
        var staffId = attendanceRecord.staffid;
        var from = $("#fromDatetimePicker-addStaffBreak").val();
        var to = $("#toDatetimePicker-addStaffBreak").val();
        var adjustmentReason = $("#adjustmentReasonInput-addStaffBreak").val();
        var staffBreakList = [];
        staffBreakList.push(new StaffBreak(null, this.formatJsDate(from), this.formatJsDate(to), staffId, attendanceId, adjustmentReason));
        var userAuth = admin.getUserAuthInfo();
        var soapType = new SaveStaffBreakType(staffBreakList, userAuth);
        callWebService(soapType, this.saveStaffBreakHandler, this);
    },
    saveStaffBreakHandler : function (response, callBackObj) {
        if (util.isSuccessfulResponse(response.savestaffbreakresponsetype)) {
            callBackObj.fetchAttendance();
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed To Save Staff Break Record!", response.savestaffbreakresponsetype.result);
        }
        $('#addBreakTimeDetailPopup').popup('close');
        $('#editBreakTimeDetailPopup').popup('close');
        $("#fromDatetimePicker-addStaffBreak").val('');
        $("#toDatetimePicker-addStaffBreak").val('');
        $("#adjustmentReasonInput-addStaffBreak").val('');
    },
    deleteStaffBreak : function() {
        $('#deleteStaffBreakConfirmationDialog').popup('close');
        var attendanceRecord = this.attendanceListByElementId[this.selectedRowId];
        var staffBreakList = [];
        var breakTimeList = util.getElementsArray(attendanceRecord.breaks);
        var idList = [];
        for (var i = 0; i < breakTimeList.length; i++) {
            var breakTime = breakTimeList[i];
            if ($("#breakTime-checkbox-"+breakTime.id).prop("checked")) {
                idList.push(breakTime.id);
            }
        }
        var userAuth = admin.getUserAuthInfo();
        var soapType = new DeleteStaffBreakType(idList, userAuth);
        callWebService(soapType, this.deleteStaffBreakHandler, this);
    },
    deleteStaffBreakHandler : function(response, callBackObj) {
        if (util.isSuccessfulResponse(response.deletestaffbreakresponsetype)) {
            callBackObj.fetchAttendance();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed To Delete Staff Break", response.deletestaffbreakresponsetype.result);
        }
    },
    cancelStaffBreak : function() {
        $('#deleteStaffBreakConfirmationDialog').popup('close');
        setTimeout(function() {
            $('#editBreakTimeDetailPopup').popup('open');
        }, 100);
    },
    printAttendanceRecord : function (rowElementId) {
        var attendanceRecord = this.attendanceListByElementId[rowElementId];
        this.currentAttendanceId = attendanceRecord.id;
        //PrintReceiptType
        ////var userAuth = admin.getUserAuthInfo();
        var soapType = new PrintReceiptType(null, attendanceRecord.id);
        callWebService(soapType, this.printAttendanceRecordHandler);
    },
    printAttendanceRecordHandler : function (response) {
        if (util.isSuccessfulResponse(response.printreceiptresponsetype)) {
            uiBaseObj.alertMsg("Print Successfully!");
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.PRINT_FAILED, "Print Failed!", response.printreceiptresponsetype.result);
        }
    }

};

var role = {
    roles : [],
    operation : "",
    currentRoleId : null,
    init : function() {
        role.clearForm(true);
        role.listAllRoles();
        role.listAllFunctionModules();
    },
    selectRow : function(tableID, selectedIndex) {
        var table = document.getElementById(tableID);
        var selectedRole = role.roles[selectedIndex];
        var rowCount = table.rows.length;
        role.operation = uiBaseObj.UPDATE;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (i == selectedIndex) {
                row.style.background = '#dcfac9';
                row.cells[0].style.background = '#dcfac9';
                row.cells[1].style.background = '#dcfac9';

                $("#roleName").val(selectedRole.name);
                $("#roleName").attr("readOnly", selectedRole.readOnly == 1);
                $("#roleId").val(selectedRole.id);
                var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
                if(companyId==null || companyId=="") return ;
                $.ajax({
                    url:csmServerUrl+"/permission/"+companyId+"/"+selectedRole.id,
                    type:'GET',
                    dataType:'json',
                    beforeSend: function(request) {
                        request.setRequestHeader("Token", headerToken);
                    },
                    success:function(doc){role.listRoleFunctionModulesHandler(doc)},
                });
            } else {
                row.style.background = ''; //'#f0c992';
                row.cells[0].style.background = ''; //'#f0c992';
                row.cells[1].style.background = ''; //'#f0c992';
            }
        }
    },
    listRoleFunctionModulesHandler : function(jsonObj) {
        var roleFunctionList = util.getElementsArray(jsonObj.permissionDTOList);
        var currentIndex = 0;
        $("#role-staff-permission-tabs .rolePrivilegesCheckbox").each(function() {
            $(this).prop("checked", false);
            for (var i = currentIndex; i < roleFunctionList.length; i++) {
                if (roleFunctionList[i].id == $(this).val()) {
                    $(this).prop("checked", true);
                    break;
                }
            }
        });
    },
    listAllFunctionModules : function() {
        var soapType = new ListPrivilegesType();
        callWebService(soapType, role.listAllFunctionModulesHandler, "", false);
    },
    listAllFunctionModulesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listprivilegesresponsetype)) {
            var functionList = util.getElementsArray(jsonObj.listprivilegesresponsetype.function);
            var adminPrivileges = [];
            var reportPrivileges = [];
            var orderingFoodPrivileges = [];
            var editOrderPrivileges = [];
            var paymentPrivileges = [];
            var operationPrivileges = [];
            for (var i = 0; i < functionList.length; i++) {
                var fm = functionList[i];
                var type = String(fm.type);
                if (type == 'ORDERING_FOOD') {
                    orderingFoodPrivileges.push(fm);
                } else if (type == 'EDIT_ORDER') {
                    editOrderPrivileges.push(fm);
                } else if (type == 'PAYMENT') {
                    paymentPrivileges.push(fm);
                } else if (type == 'OPERATION') {
                    operationPrivileges.push(fm);
                } else if (type == 'ADMIN') {
                    adminPrivileges.push(fm);
                } else if (type == 'REPORT') {
                    reportPrivileges.push(fm);
                }
            }
            $("#roleAdminPrivilegesTable").html(role.getFunctionsTableHTML(adminPrivileges));
            $("#roleReportPrivilegesTable").html(role.getFunctionsTableHTML(reportPrivileges));
            $("#roleOrderingFoodPrivilegesTable").html(role.getFunctionsTableHTML(orderingFoodPrivileges));
            $("#roleEditOrderPrivilegesTable").html(role.getFunctionsTableHTML(editOrderPrivileges));
            $("#rolePaymentPrivilegesTable").html(role.getFunctionsTableHTML(paymentPrivileges));
            $("#roleOperationPrivilegesTable").html(role.getFunctionsTableHTML(operationPrivileges));
        }
    },
    getFunctionsTableHTML : function(functionList) {
        return uiBaseObj.getAlignedTableContentHTML(functionList, 4, role.getFunctionsTableCellHTML);
    },
    getFunctionsTableCellHTML : function(funcModule) {
        return '<input type="checkbox" name="privileges" class="rolePrivilegesCheckbox" data-enhanced="true" id="privileges_' + funcModule.id + '" value="' + funcModule.id + '"><label class="no-br-label func-div-' + funcModule.name + '">' + systemLanguage.getDisplayValueForDataFromApi(funcModule.name) + "</label>";
    },
    addRoleRow : function(tableID, roleObj, selectRowFunc, deleteRowFunc, index) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.name = rowId;

        var deleteFunctionObj = roleObj.readOnly == 0 ? "<a href='javascript:"+deleteRowFunc+"("+roleObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a>" : "";
        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+index+"\");'>"+roleObj.name+"</td><td class=\"delete-icon-td\">" + deleteFunctionObj + "</td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRoleRow : function(roleId) {
        role.currentRoleId = roleId;
        $('#deleteRoleConfirmationDialog').popup('open');
    },
    deleteRecord : function() {
        $('#deleteRoleConfirmationDialog').popup('close');
        if (role.currentRoleId != null) {
            var companyId = parseInt($("#pubCompanyId").val());
            var roleDTO = new RoleDTO(role.currentRoleId,"",companyId);
            $.ajax({
                url:csmServerUrl+"/role/"+companyId+"/"+role.currentRoleId,
                type:'DELETE',
                beforeSend: function(request) {
                    request.setRequestHeader("Token", headerToken);
                },
                contentType: "application/json",
                data: JSON.stringify(roleDTO),
                success:function(doc){ role.deleteRoleHandler(doc);},
                error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed To Delete Role!", doc.responseJSON.errorMsg);}
            });

            role.currentRoleId = null;
        }
    },
    deleteRoleHandler : function(jsonObj) {
        role.clearForm(true);
        role.listAllRoles();
        uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
    },
    clearForm : function(isReadOnly) {
        $("#roleId").val("");
        $("#roleName").val("");
        $("#roleName").attr("readOnly", isReadOnly);
        $("#role-staff-permission-tabs :checked").prop("checked", false);
        role.operation = uiBaseObj.ADD;
    },
    validateInput : function() {
        var name = $("#roleName").val();
        if(util.isNullOrEmpty(name)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_NAME);
            return false;
        }
        return true;
    },
    saveRole : function() {
        $(".btn-save").prop("disable", true);
        if(!role.validateInput()){
            $(".btn-save").prop("disable", false);
            return;
        }
        var roleIdVal = $("#roleId").val();
        var roleNameVal = $("#roleName").val();
        var companyId = $("#pubCompanyId").val();
        if (companyId == null || companyId==''){
            uiBaseObj.alert("companyId", "CompanyId Id is Null, Please Add Company Information First!");
            return;
        }
        var roleDTO = new RoleDTO(roleIdVal, roleNameVal, companyId);

        roleDTO.permissionDTOList = [];
        $("#role-staff-permission-tabs .rolePrivilegesCheckbox:checked").each(function() {
            var permissionDTO = new PermissionDTO($(this).val(), "");
            roleDTO.permissionDTOList.push(permissionDTO);
        });
        if (!staffObj.checkSpecialChar(roleNameVal)){
            return;
        }
        var saveRoleRequestDTO = new SaveRoleRequestDTO(roleDTO);
        if (roleIdVal > 0){
            $.ajax({
                url:csmServerUrl+"/role",
                type:'PUT',
                dataType:'json',
                beforeSend: function(request) {
                    request.setRequestHeader("Token", headerToken);
                },
                contentType: "application/json",
                data:  JSON.stringify(saveRoleRequestDTO),
                success:function(doc){role.saveRoleHandler(doc);},
                error: function(doc){
                    uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed To Save Role!",doc.responseJSON.errorMsg);
                    role.operation = "";
                    $(".btn-save").prop("disabled", false);
                },
            });
        } else{
            $.ajax({
                url:csmServerUrl+"/role",
                type:'POST',
                dataType:'json',
                contentType: "application/json",
                beforeSend: function(request) {
                    request.setRequestHeader("Token", headerToken);
                },
                data:  JSON.stringify(saveRoleRequestDTO),
                success:function(doc){role.saveRoleHandler(doc);},
                error: function(doc){
                    uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed To Save Role!",doc.responseJSON.errorMsg);
                    role.operation = "";
                    $(".btn-save").prop("disabled", false);
                },
            });
        }
    },
    saveRoleHandler : function(jsonObj) {
        if(role.operation == uiBaseObj.ADD) {
            uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
        } else if (role.operation == uiBaseObj.UPDATE) {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
        }
        role.clearForm(true);
        role.listAllRoles();
        role.operation = "";
        $(".btn-save").prop("disabled", false);
    },
    listAllRoles : function(){
        var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
        if(companyId==null || companyId=="") return ;
        $.ajax({
            url:csmServerUrl+"/role/"+companyId,
            type:'GET',
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            dataType:'json',
            success:function(doc){role.listAllRolesHandler(doc)},
        });
    },
    listAllRolesHandler : function(jsonObj) {
        document.getElementById("rolesList").innerHTML = "";
        role.roles = [];
        var rolesList = util.getElementsArray(jsonObj.roleDTOList);
        var s, roleType;
        for (var i = 0; i < rolesList.length; i++) {
            s = rolesList[i];
            roleType = new RoleType(s.id, s.name, s.readonly);
            role.roles.push(roleType);
            role.addRoleRow("rolesList", s, "role.selectRow", "role.deleteRoleRow", i);
        }
    }
}



var company = {
    init : function() {
        company.loadCompany();
    },

    loadCompany : function() {
        var companyId = $("#pubCompanyId").val();
        var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
        if(companyId==null || companyId=="") return ;
        $.ajax({
            type: 'get',
            url: csmServerUrl+"/company/"+companyId,
            contentType: "application/json",
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            datatype: "json",
            success: function(data){
                if(data!=null && data.companyDTO!=null){
                    var  companyDto = data.companyDTO ;
                    $("#company_id").val(companyDto.id);
                    $("#companyName").val(companyDto.name);
                    $("#merchantGroupId").val(companyDto.merchantGroupId);
                    $("#apiToken").val(companyDto.apiToken);
                    $("#mappingCompanyId").val(companyDto.mappingId);
                }
            },
            error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To Load Company   !", doc.responseJSON.errorMsg);}

        })

    },

    saveCompany : function() {
        $("#btnSave").prop("disabled", true);
        var aName = $("#companyName").val().trim();
        var aMerchantGroupId = $("#merchantGroupId").val().trim();
        if (!util.isValidVariable(aName)) {
            uiBaseObj.alert("companyName", "Company Name is Required!");
            return
        }
        if (!util.isValidVariable(aMerchantGroupId)) {
            uiBaseObj.alert("merchantGroupId", "Merchant Group Id is Required!");
            return;
        }

        var company_id = util.getNullValueIfInvalid($("#company_id").val());
        var companyName = util.getNullValueIfInvalid($("#companyName").val());
        var merchantGroupId = util.getNullValueIfInvalid($("#merchantGroupId").val());
        var apiToken = util.getNullValueIfInvalid($("#apiToken").val());
        var mappingId  = util.getNullValueIfInvalid($("#mappingCompanyId").val());
        var companyId =  $("#pubCompanyId").val().trim();
        var createdBy =  $("#createdBy").val().trim();;
        var lastUpdatedBy ;

        /*  var currentUser = biscuit.u();
          if (util.isValidVariable(currentUser)) {
              var merchantInfo = biscuitHelper.getMerchantInfo(currentUser);
              lastUpdatedBy =  merchantInfo.merchantIds;
              if(companyId==null || companyId=='') {
                  createdBy = merchantInfo.merchantIds;
              }
          }*/

        var companyInfo = {
            id:companyId,
            name: companyName,
            merchantGroupId:merchantGroupId,
            apiToken:apiToken,
            mappingId:mappingId,
            createdBy:createdBy,
            lastUpdatedBy:lastUpdatedBy
        };
        $.ajax({
            type: 'POST',
            url: csmServerUrl+"/company",
            data: JSON.stringify(companyInfo),
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            contentType: "application/json",
            datatype: "json",
            success: function(data){
                if(data.errorCode==null){
                    if(data.companyDTO!=null){
                        $("#pubCompanyId").val(data.companyDTO.id);
                        $("#companyId").val(data.companyDTO.id);
                    }
                    uiBaseObj.alertMsg("Save Success !");
                }else{
                    uiBaseObj.alertMsg("Save Fail !");
                }
            },
            error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To Load Company   !", doc.responseJSON.errorMsg);}
        })
    }
};




var locationCsm = {
    action : "",
    locations : [],
    locationId : null,
    delFlag:null,
    selectMerchantId:"",
    init : function() {
        locationCsm.loadLocation();
    },
    resetlocationCsmForm : function(disabled) {
        $("#locationId").val("");
        $("#locationName").val("");
        $("#merchantId").val("");
        $("#mappingId1").val("");
        $("#mappingId2").val("");
        locationCsm.selectMerchantId = "";
        //  $("#delFlag").prop("checked", false).checkboxradio("refresh");
    },
    newlocationCsm : function() {
        $(".btn-save").prop("disabled", false);
        locationCsm.resetlocationCsmForm(false);
        locationCsm.action = uiBaseObj.ADD;
    },
    loadLocation : function() {
        var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
        if(companyId==null || companyId=="") return ;
        locationCsm.locations = [];
        $.ajax({
            type: 'get',
            url: csmServerUrl+"/location/active/"+companyId,
            contentType: "application/json",
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            datatype: "json",
            success: function(data){
                var s;
                document.getElementById('locationList').innerHTML=null;
                var tableID = "locationList" ;
                var deleteRowFunc="locationCsm.deleteRowFunc";
                var selectRowFunc = "locationCsm.selectRow" ;
                for (var i = 0; i < data.locationDTOList.length; i++) {
                    s=data.locationDTOList[i];
                    locationCsm.locations.push(s);
                    var table = document.getElementById('locationList');
                    var rowCount = table.rows.length;
                    var rowId = "locationList" + "_r" + rowCount;
                    var row = table.insertRow(rowCount);
                    row.id = rowId;
                    row.name = rowId;
                    var deleteFunctionObj = s.delFlag? "<a href='javascript:"+selectRowFunc+"(\""+tableID+"\", \""+i+"\");'><img src=\"css\\images\\check-icon-small.png\"/></a>" : "<a href='javascript:"+deleteRowFunc+"("+s.id+",1);'><img src=\"css\\images\\delete-icon-small.jpg\"/></a>";
                    var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+i+"\");'>"+s.name+"</td><td class=\"delete-icon-td\">" + deleteFunctionObj +"</td>";
                    row.innerHTML = innerHTML;
                }
            },
            error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To Load Location !", doc.responseJSON.errorMsg);}

        })
    },

    saveLocation : function() {
        $("#save-location-btn").prop("disabled", true);
        var aName = $("#locationName").val().trim();
        var aMerchantId = $("#merchantId").val().trim();
        if (!util.isValidVariable(aName)) {
            uiBaseObj.alert("locationName", "Location Name is Required!");
            return
        }
        if (!util.isValidVariable(aMerchantId)) {
            uiBaseObj.alert("merchantId", "Merchant Id is Required!");
            return;
        }

        var locationId = util.getNullValueIfInvalid($("#locationId").val());
        var locationName = util.getNullValueIfInvalid($("#locationName").val());
        var merchantId = util.getNullValueIfInvalid($("#merchantId").val());
        var mappingId1 = util.getNullValueIfInvalid($("#mappingId1").val());
        var mappingId2 = util.getNullValueIfInvalid($("#mappingId2").val());
        var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
        if (companyId == null){
            uiBaseObj.alert("companyId", "CompanyId Id is Null, Please Add Company Information First!");
            return;
        }
        var delFlag =false ;  //$("#delFlag").prop("checked");
        var locationInfo = {
            id:locationId,
            name: locationName,
            merchantId:merchantId,
            mappingId1:mappingId1,
            mappingId2:mappingId2,
            delFlag:delFlag,
            companyId:companyId,
            posSyncFlag:false
        };
        $.ajax({
            type: 'POST',
            async: false,
            url: csmServerUrl+"/location",
            data: JSON.stringify(locationInfo),
            contentType: "application/json",
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            datatype: "json",
            success: function(data){
                if(data.errorCode==null){
                    if(data.msg!=null){
                        uiBaseObj.alertMsg(data.msg);
                    }else{
                        locationCsm.resetlocationCsmForm();
                        locationCsm.loadLocation();
                        uiBaseObj.alertMsg("Save Success !");
                    }
                    $("#save-location-btn").prop("disabled", false);
                }else{
                    uiBaseObj.alertMsg("Save Fail !");
                }

            },
            error:function (doc) {
                uiBaseObj.alert("", "Failed To Save Location !"+ doc.responseJSON.errorMsg);
                $("#save-location-btn").prop("disabled", false);
            }
        });
        if((locationId!=null&& merchantId != locationCsm.selectMerchantId) || (locationId==null && merchantId!=null )){
            var userRoleSyncDTO ={
                companyId:companyId,
                locationId:locationId,
                csmUrl : csmServerUrl
            };
            $.ajax({
                type: 'POST',
                async: false,
                url: csmServerUrl+"/systemLog/"+ merchantId,
                data: JSON.stringify(userRoleSyncDTO),
                contentType: "application/json",
                beforeSend: function(request) {
                    request.setRequestHeader("Token", headerToken);
                },
                datatype: "json",
                success: function(data){
                    if(data.errorCode!=null){
                        uiBaseObj.alertMsg("Synchronize POS Data To CSM Failed !");
                    }
                },
                error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Synchronize POS Data To CSM Failed !", doc.responseJSON.errorMsg);}
            });
        }
    },selectRow : function(tableID, selectedIndex) {
        var table = document.getElementById(tableID);
        var location = locationCsm.locations[selectedIndex];
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];

            if(i == selectedIndex) {
                $("#locationDetailMainDiv :input").prop("disabled", false);
                $("#locationId").val(location.id);
                $("#locationName").val(location.name);
                $("#merchantId").val(location.merchantId);
                $("#mappingId1").val(location.mappingId1);
                $("#mappingId2").val(location.mappingId2);
                $("#companyId").val(location.companyId);
                locationCsm.selectMerchantId = location.merchantId;
                //  $("#delFlag").prop("checked", location.delFlag).checkboxradio("refresh");
            } else {
                row.style.background = ''; //'#f0c992';
                row.cells[0].style.background = ''; //'#f0c992';
                row.cells[1].style.background = ''; //'#f0c992';
            }
        }
    },deleteRowFunc:function(id,delFlag){
        $('#deleteLocationConfirmationDialog').popup('open');
        locationCsm.locationId =id ;
        locationCsm.delFlag  = delFlag ;
    },
    deleteRow:function() {
        var id = locationCsm.locationId ;
        var flag =   locationCsm.delFlag ;
        $.ajax({
            type: 'DELETE',
            url: csmServerUrl + "/location/updateDelById/" + id  ,
            contentType: "application/json",
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            datatype: "json",
            success: function (data) {
                locationCsm.resetlocationCsmForm();
                locationCsm.loadLocation();
                uiBaseObj.alertMsg("Delete Success !");
            },
            error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To Delete Location !", doc.responseJSON.errorMsg);}
        })
    },
};

var syncSetting = {
    action: "",
    locations: [],
    init: function () {
        syncSetting.loadConfig();
    },
    loadConfig:function () {
        var companyId = util.getNullValueIfInvalid($("#pubCompanyId").val());
        var locationId = util.getNullValueIfInvalid($("#locationId").val());
        if(companyId==null || companyId=="") return ;
        var s ;
        $.ajax({
            type: 'get',
            url: csmServerUrl+"/systemConfig/"+companyId,
            contentType: "application/json",
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            datatype: "json",
            success: function(data){
                var rowCount =  data.systemConfigList.length ;
                for (var i = 0; i < rowCount; i++) {
                    s = data.systemConfigList[i];
                    var name= s.name ;
                    var val = s.val=='1'?true:false ;
                    if(name=='COMPANY_SYNC'){
                        $("#companySync").prop("checked", val).checkboxradio("refresh");
                    }else if(name=='LOCATION_SYNC'){
                        $("#locationSync").prop("checked", val).checkboxradio("refresh");
                    }else if(name=='USER_SYNC'){
                        $("#userSync").prop("checked", val).checkboxradio("refresh");
                    }

                }
            },
            error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To Load Config!", doc.responseJSON.errorMsg);}

        })
    },
    saveSync:function () {
        var companySync =    $("#companySync").prop("checked")==true?'1':'0';
        var locationSync =    $("#locationSync").prop("checked")==true?'1':'0' ;
        var userSync =    $("#userSync").prop("checked")==true?'1':'0' ;
        var companyId = $("#pubCompanyId").val();
        if (companyId == null || companyId==''){
            uiBaseObj.alert("companyId", "CompanyId Id is Null, Please Add Company Information First!");
            return;
        }
        $.ajax({
            type: 'post',
            url: csmServerUrl+"/systemConfig/"+companyId+"/"+companySync+"/"+locationSync+"/"+userSync,
            contentType: "application/json",
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            datatype: "json",
            success: function(data){
                if(data.errorCode==null){
                    uiBaseObj.alertMsg("Save Success!");
                }else{
                    uiBaseObj.alertMsg("Save Fail!");
                }
            },
            error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To Save Config!", doc.responseJSON.errorMsg);}

        })

    },
    matchUser:function () {
        var companyId = $("#pubCompanyId").val();
        if (companyId == null || companyId==''){
            uiBaseObj.alert("companyId", "CompanyId Id is Null, Please Add Company Information First!");
            return;
        }
        $.ajax({
            type: 'post',
            url: csmServerUrl+"/matchingUser/"+companyId,
            contentType: "application/json",
            beforeSend: function(request) {
                request.setRequestHeader("Token", headerToken);
            },
            datatype: "json",
            success: function(data){
                if(data.errorCode==null){
                    uiBaseObj.alertMsg("match Success!");
                }else{
                    uiBaseObj.alertMsg("match Fail!");
                }
            },
            error:function (doc) {uiBaseObj.alert(systemLanguage.msgCodeList.LOAD_FAIL, "Failed To match user!", doc.responseJSON.errorMsg);}

        })

    }


}
//cmsSettingPage.init();