var coursePage = {
    init : function() {
        course.init();
        uiBaseObj.addDeleteConfirmDialog("coursePage", "deleteCourseConfirmationDialog", "Course", "course.deleteRow();");
    }
};

var course = {
    action : "",
    elementList : [],
    v_selected_rowid : "",
    toBeDeletedElementID : -1,
    init : function() {
        course.listAllElements();
    },
    clearDetails : function(disableElements) {
        $("#courseName").val("");
        $("#courseName").prop("readOnly", disableElements);
        $("#courseNumber").val("");
        $("#courseNumber").prop("readOnly", disableElements);
        $("#btnSaveCourse").prop("disabled", disableElements);
        course.action = uiBaseObj.ADD;
    },
    newEntry : function () {
        course.clearDetails(false);
        course.v_selected_rowid = "";
        $("#curCourseEntryId").val("");
        $("#courseNumber").focus();
    },
    listAllElements : function (){
        course.clearDetails(true);
        var soapType = new FindCoursesType();
        callWebService(soapType, course.listAllElementsHandler);
    },
    listAllElementsHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.findcoursesresponsetype)) {
            //Clear the table
            $("#courseTable").empty();
            course.elementList = util.getElementsArray(jsonObj.findcoursesresponsetype.courses);
            for (var i = 0; i < course.elementList.length; i++) {
                course.addRow("courseTable", course.elementList[i], "course.selectRow", "course.deleteCourseConfirmationDialog");
            }

        }
    },
    selectRow : function (tableID, selectedRowID) {
        var table = document.getElementById(tableID);
        v_selected_rowid = selectedRowID;
        var rowCount = table.rows.length;
        course.action = uiBaseObj.UPDATE;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            if (row.id == selectedRowID) {
                var selectedElement = course.elementList[i];
                if (selectedElement != null) {
                    $("#curCourseEntryId").val(selectedElement.id);
                    $("#courseName").val(systemLanguage.getLanguageNames(selectedElement,'name','en'));
                    $("#courseName").prop("readOnly", false);
                    $("#courseNumber").val(selectedElement.number);
                    $("#courseNumber").prop("readOnly", false);
                }
                $("#btnSaveCourse").prop("disabled", false);
            }
        }
    },
    addRow : function (tableID, elementObj, selectRowFunc, deleteRowFunc) {
        var table = document.getElementById(tableID);

        var rowCount = table.rows.length;
        var rowId = tableID + "_r" + rowCount;

        var row = table.insertRow(rowCount);
        row.id = rowId;
        row.name = rowId;

        var innerHTML = "<td onclick='"+selectRowFunc+"(\""+tableID+"\", \""+rowId+"\");'>"+systemLanguage.getLanguageNames(elementObj,'name','en')+"</td><td class=\"delete-icon-td\"><a href='javascript:"+deleteRowFunc+"("+elementObj.id+");'><img src=\"css\\images\\delete-icon-small.jpg\"/></a></td>";
        row.innerHTML = innerHTML;
        row.onmouseover = function(){ uiBaseObj.highlightRow(this, true); };
        row.onmouseout = function(){ uiBaseObj.highlightRow(this, false); };
    },
    deleteRow : function () {
        if (course.toBeDeletedElementID && course.toBeDeletedElementID >=0) {
            var soapType = new DeleteCourseType(course.toBeDeletedElementID);
            callWebService(soapType, course.deleteElementHandler);
        }
        course.toBeDeletedElementID = -1;
    },
    deleteCourseConfirmationDialog : function (id) {
        course.toBeDeletedElementID = id;
        course.v_selected_rowid = "";
        $("#curCourseEntryId").val("");
        $('#deleteCourseConfirmationDialog').popup('open');
    },
    deleteElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.deletecourseresponsetype)) {
            course.listAllElements();
            $("#btnSaveCourse").prop("disabled", false);
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_SUCCESS);
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.DELETE_FAIL, "failed to delete course!", jsonObj.deletecourseresponsetype.result);
        }
    },
    validateInput : function() {
        var courseNumber = $("#courseNumber").val();
        if (util.isNullOrEmpty(courseNumber)) {
            uiBaseObj.alert(systemLanguage.msgCodeList.EMPTY_COURSE_NUMBER, "Course number cannot be empty!");
            return false;
        }
        return true;
    },
    saveElement : function () {
        if (!course.validateInput()) {
            return;
        }
        var entryId = $("#curCourseEntryId").val();
        var aName = $("#courseName").val();
        var number = $("#courseNumber").val();
        var soapType = new SaveCourseType(entryId, number, aName);
        callWebService(soapType, course.saveElementHandler);
    },
    saveElementHandler : function (jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.savecourseresponsetype)) {
            if(course.action == uiBaseObj.ADD) {
                uiBaseObj.alert(systemLanguage.msgCodeList.ADD_SUCCESS);
            } else if(course.action = uiBaseObj.UPDATE) {
                uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_SUCCESS);
            }
            course.listAllElements();
            if (course.v_selected_rowid) {
                var selectedRow = document.getElementById(course.v_selected_rowid);
                course.selectRow("courseTable", selectedRow);
            }
        } else {
            uiBaseObj.alert(systemLanguage.msgCodeList.SAVE_FAIL, "failed to save Course!", jsonObj.savecourseresponsetype.result);
        }
    }
};