var staffPage = {
    init : function() {
        staffObj.init();
        staffAttendance.init();
        role.init();
        uiBaseObj.addDeleteConfirmDialog("staffPage", "deleteStaffConfirmationDialog", "Staff", "staffObj.deleteStaffRow();");
        uiBaseObj.addDeleteConfirmDialog("staffPage", "deleteConfirmationDialog", "Staff Attendance", "staffAttendance.deleteAttendance();");
        uiBaseObj.addDeleteConfirmDialog("staffPage", "deleteStaffBreakConfirmationDialog", "Staff Break", "staffAttendance.deleteStaffBreak();", "staffAttendance.cancelStaffBreak();");
        uiBaseObj.addDeleteConfirmDialog("staffPage", "deleteRoleConfirmationDialog", "Role", "role.deleteRecord();");
    }
};

var staffObj = {
    staffMembers : [],
    functionModules : [],
    staffList : [],
    roleList : [],
    operation : "",
    selectedRoles : [],
    selectedUserLevelFunctions : [],
    roleMapById : {},
    functionMapById : {},
    toBeDeletedElementID : -1,
    showStaffPassword : false,
    init : function() {
        $("#staffDetailMainDiv :input").prop("disabled", false);
        var findShowStaffPasswordConfig = new FindSystemConfigurationsType('SHOW_STAFF_PASSWORD', false);
        callWebService(findShowStaffPasswordConfig, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
                var configList = util.getElementsArray(jsonObj.listsystemconfigurationsresponsetype.systemconfiguration);
                if (configList.length > 0) {
                    staffObj.showStaffPassword = util.isBooleanTrue(configList[0].value);
                    if (staffObj.showStaffPassword  && staffObj.hasSuperUserManagementPermission()) {
                        $("#passcode").prop("type", "text");
                    }
                }
                staffObj.listAllStaff();
            }
        });
        staffObj.listAllFunctionModules();
        staffObj.listAllRoles();
        staffObj.listAllMessageTopics();
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
                $("#staffAge").val(staff.age);
                $("#staffWage").val(staff.wage);
                $("#staffWageType").val(staff.wageType);
                $("#requireClockInOut").prop("checked", staff.requireClockInOut == "true").checkboxradio("refresh");
                $("#requireCashInOut").prop("checked", staff.requireCashInOut == "true").checkboxradio("refresh");
                $("#requireReportCashTips").prop("checked", staff.requireInputCashTips == "true").checkboxradio("refresh");

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

                var userFunctionModules = util.getElementsArray(staffObj.staffList[selectedIndex].user.functions);
                var userRoles = util.getElementsArray(staffObj.staffList[selectedIndex].user.roles);
                var userTopics = util.getElementsArray(staffObj.staffList[selectedIndex].user.subscribedtopics)
                staffObj.selectedUserLevelFunctions = userFunctionModules;
                staffObj.selectedRoles = userRoles;

                var selectedRoleLevelFunctions = [];
                for (var j = 0; j  < staffObj.selectedRoles.length; j ++) {
                    var targetRole = staffObj.roleMapById[staffObj.selectedRoles[j].id];
                    var roleFunctionList = util.getElementsArray(targetRole.function);
                    for (var k = 0; k < roleFunctionList.length; k++) {
                        selectedRoleLevelFunctions.push(roleFunctionList[k]);
                    }
                }

                $("#roles :checked").prop("checked", false);
                uiBaseObj.updateCheckBoxListBySelections("roles", userRoles);

                $("#staff-permission-tabs :checked").prop("checked", false);
                uiBaseObj.updateCheckBoxListBySelections("staff-permission-tabs", selectedRoleLevelFunctions);
                uiBaseObj.updateCheckBoxListBySelections("staff-permission-tabs", staffObj.selectedUserLevelFunctions);

                $("#topics :checked").prop("checked", false);
                uiBaseObj.updateCheckBoxListBySelections("topics", userTopics);

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
        return staff.user != null && (util.isBooleanTrue(staff.user.systemuser) || util.isBooleanTrue(staff.user.systemUser));
    },
    isOnlineOrderUser : function(staff) {
        return staffObj.isSystemUser(staff) && staff.name == 'OnlineOrder';
    },
    isSelfOrderUser : function(staff) {
        return staffObj.isSystemUser(staff) && staff.name == 'SelfOrder';
    },
    listAllFunctionModules : function() {
        var listPrivilegesType = new ListPrivilegesType();
        callWebService(listPrivilegesType, staffObj.listAllFunctionModulesHandler, {isAsync: false});
    },
    listAllFunctionModulesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listprivilegesresponsetype)) {
            staffObj.functionModules = util.getElementsArray(jsonObj.listprivilegesresponsetype.function);
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
        }
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

        if (staffObj.showStaffPassword  && staffObj.hasSuperUserManagementPermission()) {
            var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+index+"\");'>" + staff.name + " " + util.getEmptyValueIfInvalid(staff.lastname) + "</td> " +
                "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+index+"\");'>" + staff.user.passcode +"</td>";
        } else {
            var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+index+"\");'>" + staff.name + " " + util.getEmptyValueIfInvalid(staff.lastname) + "</td>";
        }

        var deleteTdContent;
        if (staffObj.isSystemUser(staff)) {
            deleteTdContent = "<td class=\"delete-icon-td\"></td>";
        } else if(staff.active == "true"){
            deleteTdContent = "<td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+staff.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        } else if(staff.active == "false") {
            deleteTdContent = "<td class=\"check-icon-td\"><a href='javascript:"+deleteRowFunc+"("+staff.id+");'><img src=\"css\\images\\check-icon-small.png\"/></a></td>";
        }
        innerHTML += deleteTdContent;
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    bringBackStaff : function() {
        var passcode = $("#passcode").val();
        var name = $("#staffName").val();
        if (name == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PERSON_NAME, "Name cannot be empty");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (passcode == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PASSCODE, "Passcode cannot be empty");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (name == passcode) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NAME_PASSCODE_SAME, "Name cannot be the same as passcode");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        var staffType = staffObj.convertStaff();
        if (staffType != null) {
            var soapType = new SaveStaffType(staffType);
            callWebService(soapType, staffObj.saveStaffHandler);
        }
    },
    deleteWithConfirmationDialog : function(id) {
        staffObj.toBeDeletedElementID = id;
        $('#deleteStaffConfirmationDialog').popup('open');
    },
    deleteStaffRow : function() {
        if (staffObj.toBeDeletedElementID && staffObj.toBeDeletedElementID >=0) {
            var deleteStaffType = new DeleteStaffType(staffObj.toBeDeletedElementID);
            callWebService(deleteStaffType, staffObj.deleteStaffHandler);
        }
        staffObj.toBeDeletedElementID = -1;
    },
    deleteStaffHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletestaffresponsetype)) {
            staffObj.listAllStaff();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete staff!", jsonObj.deletestaffresponsetype.result);
        }
        staffObj.deletedRowId = "";
    },
    clearForm : function(isReadOnly) {
        $("#staffId").val("");
        $("#userId").val("");
        $("#staffName").val("");
        $("#lastName").val("");
        $("#staffAge").val("");
        $("#staffWage").val("");
        $("#staffWageType").val("1");
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
        $("#topics :checked").prop("checked", false);
        staffObj.selectedRoles = [];
        staffObj.selectedUserLevelFunctions = [];
        staffObj.operation = uiBaseObj.ADD;
    },
    newStaffEntry : function() {
        staffObj.clearForm(false);
        $("#staffName").focus();
    },
    convertStaff : function() {
        var name = $("#staffName").val();
        var lastName = $("#lastName").val();
        var age = $("#staffAge").val();
        var wage = $("#staffWage").val();
        var wageType = $("#staffWageType").val();
        var requireClockInOut = $("#requireClockInOut").prop("checked");
        var requireCashInOut = $("#requireCashInOut").prop("checked");
        var requireReportCashTips = $("#requireReportCashTips").prop("checked");
        var cellPhone = $("#cellPhone").val();
        var homePhone = $("#homePhone").val();
        var street = $("#street").val();
        var city = $("#city").val();
        var state = $("#state").val();
        var zipcode = $("#zipcode").val();
        var notes = $("#staffNotes").val();
        var id = $("#staffId").val();
        var userId = $("#userId").val();
        var passcode = $("#passcode").val();
        var swipeData = $("#swipeData").val();
        var earliestClockInTime = $("#earliestClockInTime").val();
        var userType = new UserType(userId, passcode, swipeData);

        userType.modules = [];
        $("#staff-permission-tabs :checked").each(function() {
            userType.modules.push(new FunctionModuleType($(this).val(), ""));
        });

        userType.roles = [];
        $("#roles :checked").each(function() {
            userType.roles.push(new RoleType($(this).val(), ""));
        });

        userType.subscribedTopics = [];
        $("#topics :checked").each(function() {
            userType.subscribedTopics.push(new SubscribedTopics(null, $(this).val()));
        });

        var staffType = new StaffType(id, name, lastName, age, wage, wageType, requireClockInOut, requireCashInOut, requireReportCashTips, homePhone, cellPhone, street, city, state, zipcode, notes, userType, earliestClockInTime);
        return staffType;
    },
    saveStaffInfo : function() {
        $("#save-staff-btn").prop("disabled", true);
        var passcode = $("#passcode").val();
        var name = $("#staffName").val();
        if (name == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PERSON_NAME, "Name cannot be empty");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (passcode == "") {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_PASSCODE, "Passcode cannot be empty");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        if (name == passcode) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NAME_PASSCODE_SAME, "Name cannot be the same as passcode");
            $("#save-staff-btn").prop("disabled", false);
            return;
        }
        var staffType = staffObj.convertStaff();
        if (staffType != null) {
            if (util.isValidVariable(staffType.earliestClockInTime) && !staffObj.isValidTimeFormat(staffType.earliestClockInTime)) {
                uiBaseObj.alert(systemLanguage.msgCodeList.HOURS_FORMAT, "Time format has to be: (hh:mm)!");
                $("#save-staff-btn").prop("disabled", false);
                return;
            }
            var soapType = new SaveStaffType(staffType);
            callWebService(soapType, staffObj.saveStaffHandler);
        }
    },
    isValidTimeFormat : function(input) {
        var pattern = /^[0-2][0-9]:[0-5][0-9]$/;
        return input.match(pattern) != null;
    },
    saveStaffHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savestaffresponsetype)) {
            if(staffObj.operation == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if (staffObj.operation == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            staffObj.listAllStaff();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to save staff", jsonObj.savestaffresponsetype.result);
        }
        $("#save-staff-btn").prop("disabled", false);
    },
    listAllStaff : function(isShowPrevStaff){
        staffObj.clearForm();
        document.getElementById("staffList").innerHTML = "";
        if(isShowPrevStaff == true) {
            $("#newStaffButton").hide();
        } else{
            $("#newStaffButton").show();
        }
        var soapType;
        if(staffObj.hasSuperUserManagementPermission()) {
            soapType = new ListStaffType(null, true, isShowPrevStaff, true, true);
        } else {
            soapType = new ListStaffType(null, true, isShowPrevStaff, false, true);
        }
        callWebService(soapType, staffObj.listAllStaffHandler);
    },
    inputPasscode : function(obj) {
        if (obj.value == "***") {
            obj.value = "";
        }
    },
    hasRole: function(staff, roleName) {
        if (!util.isValidVariable(staff.user)) {
            return false;
        }
        var roleList = util.getElementsArray(staff.user.roles);
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
        if (util.isSuccessfulResponse(jsonObj.liststaffresponsetype)) {
            var staffListResponse = util.getElementsArray(jsonObj.liststaffresponsetype.staff);
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
                if (s.user != null) {
                    if (!staffObj.showStaffPassword  || !staffObj.hasSuperUserManagementPermission()) {
                        s.user.passcode = "***";
                        if (s.user.swipedata == null || s.user.swipedata == "") {
                            s.user.swipeData = "";
                        } else {
                            s.user.swipeData = "********"
                        }
                    } else {
                        if (s.user.swipedata == null || s.user.swipedata == "") {
                            s.user.swipeData = "";
                        }
                    }
                    userType = new UserType(s.user.id, s.user.passcode, s.user.swipeData, s.user.systemuser);
                } else {
                    userType = null;
                }
                staffType = new StaffType(s.id, s.name, s.lastname, s.age, s.wage, s.wagetype, s.requireclockinout, s.requirecashinout, s.requireinputcashtips, s.homephone, s.cellphone, s.street, s.city, s.state, s.zipcode, s.notes, userType, s.earliestclockintime);
                staffObj.staffMembers.push(staffType);
                staffObj.staffList.push(s);
                if (s.active == "true") {
                    staffObj.addStaffRow("staffList", s, "staffObj.selectRow", "staffObj.deleteWithConfirmationDialog", staffObj.staffMembers.length - 1);
                } else if(s.active == "false") {
                    staffObj.addStaffRow("staffList", s, "staffObj.selectRow", "staffObj.bringBackStaff", staffObj.staffMembers.length - 1);
                }
                staffObj.functionMapById[s.id] = s;
            }
        }
    },
    listAllRoles : function(){
        var soapType = new ListRolesType();
        callWebService(soapType, staffObj.listAllRolesHandler);
    },
    listAllRolesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listrolesresponsetype)) {
            var rolesElement = document.getElementById("roles");
            staffObj.roleList = [];
            var roleListResponse = util.getElementsArray(jsonObj.listrolesresponsetype.roles);
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
        }
    },
    listAllMessageTopics : function() {
        var findMessageTopics = new FindSystemConfigurationsType('MESSAGE_CENTER_TOPICS', true);
        callWebService(findMessageTopics, function(jsonObj) {
            if (util.isSuccessfulResponse(jsonObj.listsystemconfigurationsresponsetype)) {
                staffObj.topicList = [];
                var config = jsonObj.listsystemconfigurationsresponsetype.systemconfiguration;

                if (config.value != null && config.value != "") {
                    for (var i = 0; i < config.restrictions.length; i++) {
                        var topic = config.restrictions[i];
                        if (config.value.indexOf(topic.value) !== -1) {
                            staffObj.topicList.push(topic);
                        }
                    }
                }
                if (staffObj.topicList.length > 0) {
                    $("#topics").html(staffObj.getStaffTopicsTableHTML(staffObj.topicList));
                } else {
                    document.getElementById('staff-announcement-table-header').style.display = 'none';
                    $('#topics').hide();
                }
            }
        });
    },
    getStaffTopicsTableHTML : function(topicList) {
        return uiBaseObj.getAlignedTableContentHTML(topicList, 4, staffObj.getStaffTopicsTableCellHTML);
    },
    getStaffTopicsTableCellHTML : function(topicElement) {
        return '<input type="checkbox" name="staff-topics" class="staffRolesCheckbox" data-enhanced="true" value="' + topicElement.value + '">' + topicElement.name;
    },
    getStaffRolesTableHTML : function(roleList) {
        return uiBaseObj.getAlignedTableContentHTML(roleList, 4, staffObj.getStaffRolesTableCellHTML);
    },
    getStaffRolesTableCellHTML : function(roleElement) {
        return '<input type="checkbox" name="staff-roles" class="staffRolesCheckbox" data-enhanced="true" id="staff-roles_' + roleElement.id + '" value="' + roleElement.id + '" onchange="staffObj.addToRoleList(this);">' + roleElement.name;
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
            var roleFunctionList = util.getElementsArray(targetRole.function);
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
        this.bundleSortBy();
    },
    bundleSortBy: function () {
        $('#staffAttendanceTable th').each(function(col) {
            $(this).hover(
                function() {
                    $(this).addClass('focus');
                },
                function() {
                    $(this).removeClass('focus');
                }
            );


            $(this).click(function() {
                staffAttendance.sortbyClick(this, '#staffAttendanceTable', col);
            });
        });        
    },
    sortbyClick : function (obje, tableid, col) {
        if ($(obje).is('.asc')) {
            $(obje).removeClass('asc');
            $(obje).addClass('desc selected');
            sortOrder = -1;
          } else {
            $(obje).addClass('asc selected');
            $(obje).removeClass('desc');
            sortOrder = 1;
          }
          $(obje).siblings().removeClass('asc selected');
          $(obje).siblings().removeClass('desc selected');
          var arrData = $(tableid).find('tbody >tr:has(td)').get();
          arrData.sort(function(a, b) {
            var val1 = $(a).children('td').eq(col).text().toUpperCase();
            var val2 = $(b).children('td').eq(col).text().toUpperCase();
            if ($.isNumeric(val1) && $.isNumeric(val2))
              return sortOrder == 1 ? val1 - val2 : val2 - val1;
            else
              return (val1 < val2) ? -sortOrder : (val1 > val2) ? sortOrder : 0;
          });
          $.each(arrData, function(index, row) {
            $('#staffAttendanceTable > tbody').append(row);
          });        
    },
    fetchAttendance: function () {
        var fromDate = $("#fromDatePicker").val();
        var toDate = $("#toDatePicker").val();
        var staffId = $("#staff-filter-list").val();
        if (fromDate && toDate) {
            var soapType = new FetchAttendanceType(fromDate, toDate, staffId);
            callWebService(soapType, this.fetchAttendanceHandler, this);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_FROM_TO_DATE, "FromDate and ToDate not selected!");
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
                $("#" + attendancesTableId + " tbody").append(attendanceHTML);
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
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete attendance", response.deleteattendanceresponsetype.result);
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
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_STAFF, "Please select staff member!");
            return;
        }

        if (!startTime) {
            uiBaseObj.alert(systemLanguage.msgCodeList.NO_START_TIME, "Please select start time!");
            return;
        }

        var startTimeStr = this.formatJsDate(startTime);
        var endTimeStr = null;

        if (endTime) {
            if (endTime.localeCompare(startTime) < 0) {
                uiBaseObj.alert(systemLanguage.msgCodeList.START_TIME_LATER_THAN_END_TIME, "End Time has to be later than Start Time");
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
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to add attendance record!", response.addattendanceresponsetype.result);
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
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to update attendance record!", response.updateattendanceresponsetype.result);
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
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to save staff break record!", response.savestaffbreakresponsetype.result);
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
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "Failed to delete staff break", response.deletestaffbreakresponsetype.result);
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
            uiBaseObj.alertMsg("Print successfully!");
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.PRINT_FAILED, "Print failed!", response.printreceiptresponsetype.result);
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
                $("#roleName").attr("readOnly", selectedRole.readOnly == "true");
                $("#roleId").val(selectedRole.id);

                var soapType = new ListPrivilegesType(selectedRole.id);
                callWebService(soapType, role.listRoleFunctionModulesHandler);
            } else {
                row.style.background = ''; //'#f0c992';
                row.cells[0].style.background = ''; //'#f0c992';
                row.cells[1].style.background = ''; //'#f0c992';
            }
        }
    },
    listRoleFunctionModulesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listprivilegesresponsetype)) {
            var roleFunctionList = util.getElementsArray(jsonObj.listprivilegesresponsetype.function);
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
        }
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

        var deleteFunctionObj = roleObj.readonly == "false" && roleObj.syn2csm == "false" ? "<a href='javascript:"+deleteRowFunc+"("+roleObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a>" : "";
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
            var deleteRoleType = new DeleteRoleType(role.currentRoleId);
            callWebService(deleteRoleType, role.deleteRoleHandler);
            role.currentRoleId = null;
        }
    },
    deleteRoleHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deleteroleresponsetype)) {
            role.clearForm(true);
            role.listAllRoles();
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete role!", response.deleteroleresponsetype.result);
        }
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
        var roleType = new RoleType(roleIdVal, roleNameVal);

        roleType.functionIds = [];
        $("#role-staff-permission-tabs .rolePrivilegesCheckbox:checked").each(function() {
            roleType.functionIds.push($(this).val());
        });
        var soapType = new SaveRoleType(roleType);
        callWebService(soapType, role.saveRoleHandler);
    },
    saveRoleHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.saveroleresponsetype)) {
            if(role.operation == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if (role.operation == uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            role.clearForm(true);
            role.listAllRoles();
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "Failed to save role!", jsonObj.saveroleresponsetype.result);
        }
        role.operation = "";
        $(".btn-save").prop("disabled", false);
    },
    listAllRoles : function(){
        var soapType = new ListRolesType();
        callWebService(soapType, role.listAllRolesHandler);
    },
    listAllRolesHandler : function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.listrolesresponsetype)) {
            document.getElementById("rolesList").innerHTML = "";
            role.roles = [];
            var rolesList = util.getElementsArray(jsonObj.listrolesresponsetype.roles);
            var s, roleType;
            s = rolesList[0];
            $("#notAllow-role-modify-tips").html(systemLanguage.getMsgContent(systemLanguage.msgCodeList.NOT_ALLOW_MODIFY_ROLE, 'You have turned on the synchronous CSM feature. To modify role, please go to CMS system for modification!'));
            if (s.syn2csm == "true"){
                $("#saveRole").hide();
                $("#newRole").hide();
                $("#notAllow-role-modify-tips").show();
            } else{
                $("#saveRole").show();
                $("#newRole").show();
                $("#notAllow-role-modify-tips").hide();
            }
            for (var i = 0; i < rolesList.length; i++) {
                s = rolesList[i];
                roleType = new RoleType(s.id, s.name, s.readonly);
                role.roles.push(roleType);
                role.addRoleRow("rolesList", s, "role.selectRow", "role.deleteRoleRow", i);
            }
        }
    }
}
