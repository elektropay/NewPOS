var galleryPage = {
    disableCustomAlertPopup: true,
    init : function() {
        if (biscuitf.m() == 'lite') {
            dualDisplayObj.init();
            $("#call-display-tab").removeClass('active');
            $("#dual-display-tab").addClass('active');
            $("#call-tab-li").css({"display": "none"});
            $("#company-tab-li").css({"display": "none"});
        } else {
            galleryObj.init();
        }
    }
};

var galleryObj = {
    init : function () {
        galleryObj.listGalleryImages();
    },
    submit : function() {
        $("form#call-display-img-form").unbind("submit");
        $("form#call-display-img-form").submit(function(event){
            //disable the default form submission
            event.preventDefault();             
            uiBaseObj.resetAllAlertDivs();

            //grab all form data
            var formData = new FormData($(this)[0]);
            var imageName = $("#call-display-upload").val().replace("C:\\fakepath\\", "");

            var size = document.getElementById("call-display-upload").files[0].size;
            if (size > 512000) {
                uiBaseObj.alertDiv('call-display-img-form', systemLanguage.msgCodeList.IMAGE_TOO_LARGE, "Image size is limited to 500kB");
                return false;
            }

            galleryObj.uploadImage(formData, imageName);
            return false;
        });
    },
    sliderUpdate : function(value) {
        $('#call-display-sec').prop('value', value);
        if($('#call-display-img-list').children().length > 0) {
            galleryObj.saveGalleryImage($("#call-display-img").attr("value"));//thumb, galleryList, displayOrder, displaytime, id, transitioneffect
        }
    },
    listGalleryImages : function() {
        $("#call-display-img-list").find('li').remove();
        var soapType = new FindGalleryType(null, 'CALL');
        callWebService(soapType, galleryObj.listGalleryImagesHandler);
    },
    listGalleryImagesHandler : function(jsonObj) {
        var sortedList = [];
        if(util.isSuccessfulResponse(jsonObj.findgalleryresponsetype)) {
            var images = util.getElementsArray(jsonObj.findgalleryresponsetype.gallery);

            images.sort(function(a, b) {
                return a.displayorder - b.displayorder;
            })
            if (images.length > 0) {
                $("#call-display-time").prop("value", images[0].displaytime);
                $("#call-display-img").prop("src", images[0].thumbpath);
                $("#call-display-img").attr("value", images[0].id);
                $("#call-display-effect").val(images[0].transitioneffect);
                $('#call-display-sec').prop('value', images[0].displaytime);
            }
            for(var i=0; i<images.length; i++) {
                var image = images[i];
                $("#call-display-img-list").append("<li><img id='" + image.id + "'  src='" + image.thumbpath + "' class='img-thumbnail' onclick=galleryObj.display(" + image.id + ")></li>");

                $("#call-display-img-list").sortable({
                    revert: true,
                    update: function(event,ui) {
                       $("#call-display-img-list li").each(function(index) {
                            var gallerySetupType = new GalleryImage (this.firstChild.id, null, index, null, null);
                            sortedList.push(gallerySetupType);
                       });
                       var updateGalleryOrderType = new SaveGalleryImage(null, sortedList, null, null, null, null);
                       sortedList = [];
                       callWebService(updateGalleryOrderType, galleryObj.saveGalleryImageHandler);
                    }
                });
            }
            $("#call-display-img-list").sortable();
        }
    },
    transitionEffectUpdate : function() {
        if($('#call-display-img-list').children().length > 0) {
            galleryObj.saveGalleryImage($("#call-display-img").attr("value"));
        } 
    },
    saveGalleryImage : function(id) {
        if (id == null){
            var displayOrder = $("#call-display-img-list").children().length;
        }
        var displayTime = $("#call-display-time").val();
        var thumb = $("#call-display-img").attr("src");
        var transitionEffect = $("#call-display-effect").val();
        var soapType = new SaveGalleryImage(thumb, null, displayOrder, displayTime, id, transitionEffect, 'CALL');
        callWebService(soapType, galleryObj.saveGalleryImageHandler);
    },
    saveGalleryImageHandler : function(jsonObj) {
        if(util.isSuccessfulResponse(jsonObj.savegalleryresponsetype)){
            galleryObj.listGalleryImages();
        }
    },
    uploadImage : function(formData, imageName) {
        $.ajax({
            url: '/kpos/webapp/file/image/upload/call',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000,
            success: function (returndata) {
                $('#call-display-response-text').text(returndata);
                $('#call-display-response-text').show();
                $('#call-display-img').prop("src", "img/gallery/gallery/call/" + imageName);
                galleryObj.saveGalleryImage();
            },
            beforeSend: function () {
                $('#call-display-waiting-text').show();
                $("button[type='submit']").prop('disabled',true);
            },
            complete: function(jqXHR, status) {
                $('#call-display-waiting-text').hide();
                $("button[type='submit']").prop('disabled',false);
            },
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload){ // Check if upload property exists
                    //myXhr.upload.addEventListener('progress',uploadAddressDataObj.progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            }
        });
    },
    deleteImage : function() {
        re=/(.*)kpos\/img\/gallery\/gallery\/call\//;
        var imageName = $("#call-display-img").prop("src").replace(re, "");
        $.ajax({
            url: '/kpos/webapp/file/image/delete/call?name=' + imageName,
            type: 'GET',
            cache: false,
            contentType: false,
            processData: false,
            timeout: 5000,
            success: function (returndata) {
                $('#call-display-response-text').text(returndata);
                $('#call-display-response-text').show();
                galleryObj.listGalleryImages();
                if($("#call-display-img-list").children().length > 0){
                    $("#call-display-img").prop("src", $("#call-display-img-list").children().first()[0].firstChild.src);
                } else {
                    $("#call-display-img").prop("src", "");
                }
            },
            beforeSend: function () {
                $('#call-display-waiting-text').show();
                $("button[type='button']").prop('disabled',true);
            },
            complete: function(jqXHR, status) {
                $('#call-display-waiting-text').hide();
                $("button[type='button']").prop('disabled',false);
            },
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload){ // Check if upload property exists
                    //myXhr.upload.addEventListener('progress',uploadAddressDataObj.progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            }
        });
    },
    deleteSelectedImage : function() {
        var id = $("#call-display-img").attr("value");
        var soapType = new DeleteGalleryImage(id);
        callWebService(soapType, galleryObj.deleteSelectedImagehandler);
    },
    deleteSelectedImagehandler : function(jsonObj) {
        if(util.isSuccessfulResponse(jsonObj.deletegalleryresponsetype)){
            galleryObj.deleteImage();
        }
    },
    display : function(imageId) {
        $("#call-display-img").attr("value", imageId);
        var soapType = new FindGalleryType(imageId);
        callWebService(soapType, galleryObj.displayHandler)
    },
    displayHandler : function(jsonObj) {
        if(util.isSuccessfulResponse(jsonObj.findgalleryresponsetype)){
            var imagePaths = util.getElementsArray(jsonObj.findgalleryresponsetype.gallery);
            var imagePath = imagePaths[0];
            $("#call-display-img").prop("src", imagePath.thumbpath);
            $("#call-display-time").prop("value", imagePath.displaytime);
            $("#call-display-effect").val(imagePath.transitioneffect);
            $('#call-display-sec').prop('value', imagePath.displaytime);
        }
    }
}

var dualDisplayObj = {
    init : function () {
        dualDisplayObj.listGalleryImages();
    },
    submit : function() {
        $("form#dual-display-img-form").unbind("submit");
        $("form#dual-display-img-form").submit(function(event){
            //disable the default form submission
            event.preventDefault();
            uiBaseObj.resetAllAlertDivs();

            //grab all form data
            var formData = new FormData($(this)[0]);
            var imageName = $("#dual-display-upload").val().replace("C:\\fakepath\\", "");

            var size = document.getElementById("dual-display-upload").files[0].size;
            if (size > 512000) {
                uiBaseObj.alertDiv('dual-display-img-form', systemLanguage.msgCodeList.IMAGE_TOO_LARGE, "Image size is limited to 500kB");
                return false;
            }

             dualDisplayObj.uploadImage(formData, imageName);

             return false;
        });
    },
    sliderUpdate : function(value) {
        $('#dual-display-sec').prop('value', value);
        if($('#dual-display-img-list').children().length > 0) {
            dualDisplayObj.saveGalleryImage($("#dual-display-img").attr("value"));//thumb, galleryList, displayOrder, displaytime, id, transitioneffect
        }
    },
    listGalleryImages : function() {
        $("#dual-display-img-list").find('li').remove();
        var soapType = new FindGalleryType(null, 'DUAL');
        callWebService(soapType, dualDisplayObj.listGalleryImagesHandler);
    },
    listGalleryImagesHandler : function(jsonObj) {
        var sortedList = [];
        if(util.isSuccessfulResponse(jsonObj.findgalleryresponsetype)) {
            var images = util.getElementsArray(jsonObj.findgalleryresponsetype.gallery);

            images.sort(function(a, b) {
                return a.displayorder - b.displayorder;
            })
            if (images.length > 0) {
                $("#dual-display-time").prop("value", images[0].displaytime);
                $("#dual-display-img").prop("src", images[0].thumbpath);
                $("#dual-display-img").attr("value", images[0].id);
                $("#dual-display-effect").val(images[0].transitioneffect);
                $('#dual-display-sec').prop('value', images[0].displaytime);
            }
            for(var i=0; i<images.length; i++) {
                var image = images[i];
                $("#dual-display-img-list").append("<li><img id='" + image.id + "'  src='" + image.thumbpath + "' class='img-thumbnail' onclick=dualDisplayObj.display(" + image.id + ")></li>");

                $("#dual-display-img-list").sortable({
                    revert: true,
                    update: function(event,ui) {
                       $("#dual-display-img-list li").each(function(index) {
                            var gallerySetupType = new GalleryImage (this.firstChild.id, null, index, null, null);
                            sortedList.push(gallerySetupType);
                       });
                       var updateGalleryOrderType = new SaveGalleryImage(null, sortedList, null, null, null, null);
                       sortedList = [];
                       callWebService(updateGalleryOrderType, dualDisplayObj.saveGalleryImageHandler);
                    }
                });
            }
            $("#dual-display-img-list").sortable();
        }
    },
    transitionEffectUpdate : function() {
        if($('#dual-display-img-list').children().length > 0) {
            dualDisplayObj.saveGalleryImage($("#dual-display-img").attr("value"));
        } 
    },
    saveGalleryImage : function(id) {
        if (id == null){
            var displayOrder = $("#dual-display-img-list").children().length;
        }
        var displayTime = $("#dual-display-time").val();
        var thumb = $("#dual-display-img").attr("src");
        var transitionEffect = $("#dual-display-effect").val();
        var soapType = new SaveGalleryImage(thumb, null, displayOrder, displayTime, id, transitionEffect, 'DUAL');
        callWebService(soapType, dualDisplayObj.saveGalleryImageHandler);
    },
    saveGalleryImageHandler : function(jsonObj) {
        if(util.isSuccessfulResponse(jsonObj.savegalleryresponsetype)){
            dualDisplayObj.listGalleryImages();
        }
    },
    uploadImage : function(formData, imageName) {
        $.ajax({
            url: '/kpos/webapp/file/image/upload/dual',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000,
            success: function (returndata) {
                $('#dual-display-response-text').text(returndata);
                $('#dual-display-response-text').show();
                $('#dual-display-img').prop("src", "img/gallery/gallery/dual/" + imageName);
                dualDisplayObj.saveGalleryImage();
            },
            beforeSend: function () {
                $('#dual-display-waiting-text').show();
                $("button[type='submit']").prop('disabled',true);
            },
            complete: function(jqXHR, status) {
                $('#dual-display-waiting-text').hide();
                $("button[type='submit']").prop('disabled',false);
            },
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload){ // Check if upload property exists
                    //myXhr.upload.addEventListener('progress',uploadAddressDataObj.progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            }
        });
    },
    deleteImage : function() {
        re=/(.*)kpos\/img\/gallery\/gallery\/dual\//;
        var imageName = $("#dual-display-img").prop("src").replace(re, "");
        $.ajax({
            url: '/kpos/webapp/file/image/delete/dual?name=' + imageName,
            type: 'GET',
            cache: false,
            contentType: false,
            processData: false,
            timeout: 5000,
            success: function (returndata) {
                $('#dual-display-response-text').text(returndata);
                $('#dual-display-response-text').show();
                dualDisplayObj.listGalleryImages();
                if($("#dual-display-img-list").children().length > 0){
                    $("#dual-display-img").prop("src", $("#dual-display-img-list").children().first()[0].firstChild.src);
                } else {
                    $("#dual-display-img").prop("src", "");
                }
            },
            beforeSend: function () {
                $('#dual-display-waiting-text').show();
                $("button[type='button']").prop('disabled',true);
            },
            complete: function(jqXHR, status) {
                $('#dual-display-waiting-text').hide();
                $("button[type='button']").prop('disabled',false);
            },
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload){ // Check if upload property exists
                    //myXhr.upload.addEventListener('progress',uploadAddressDataObj.progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            }
        });
    },
    deleteSelectedImage : function() {
        var id = $("#dual-display-img").attr("value");
        var soapType = new DeleteGalleryImage(id);
        callWebService(soapType, dualDisplayObj.deleteSelectedImagehandler);
    },
    deleteSelectedImagehandler : function(jsonObj) {
        if(util.isSuccessfulResponse(jsonObj.deletegalleryresponsetype)){
            dualDisplayObj.deleteImage();
        }
    },
    display : function(imageId) {
        $("#dual-display-img").attr("value", imageId);
        var soapType = new FindGalleryType(imageId);
        callWebService(soapType, dualDisplayObj.displayHandler)
    },
    displayHandler : function(jsonObj) {
        if(util.isSuccessfulResponse(jsonObj.findgalleryresponsetype)){
            var imagePaths = util.getElementsArray(jsonObj.findgalleryresponsetype.gallery);
            var imagePath = imagePaths[0];
            $("#dual-display-img").prop("src", imagePath.thumbpath);
            $("#dual-display-time").prop("value", imagePath.displaytime);
            $("#dual-display-effect").val(imagePath.transitioneffect);
            $('#dual-display-sec').prop('value', imagePath.displaytime);
        }
    }
}

var companyCoverObj = {
    init : function() {
        companyCoverObj.listCompanyProfile();

        $("form#upload-company-cover-form").submit(function(event){
            //disable the default form submission
            event.preventDefault();
            uiBaseObj.resetAllAlertDivs();

            //grab all form data
            var formData = new FormData($(this)[0]);
            var imageName = $("#upload-company-image").val().replace("C:\\fakepath\\", "");

             companyCoverObj.uploadCover(formData, imageName);

             return false;
        });
    },

    listCompanyProfile: function() {
        var soapType = new FetchCompanyProfileType(true);
        callWebService(soapType, companyCoverObj.listCompanyProfileHandler);
    },

    listCompanyProfileHandler: function(jsonObj) {
        if (util.isSuccessfulResponse(jsonObj.fetchcompanyprofileresponsetype)) {
            var companyProfile = jsonObj.fetchcompanyprofileresponsetype.company;
            $("#company-cover-image").prop("src", companyProfile.coverimage);
        }
    },

    uploadCover : function(formData, imageName) {
        $.ajax({
            url: '/kpos/webapp/file/image/store/coverImage',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000,
            success: function (returndata) {
                $('#upload-company-cover-result-text').text(returndata);
                $('#upload-company-cover-result-text').show();
                $('#company-cover-image').prop("src", "img/gallery/store/" + imageName);
            },
            beforeSend: function () {
                $("button[type='submit']").prop('disabled',true);
            },
            complete: function(jqXHR, status) {
                $("button[type='submit']").prop('disabled',false);
                $("#upload-company-cover-result-text").hide();
            },
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload){ // Check if upload property exists
                    //myXhr.upload.addEventListener('progress',uploadAddressDataObj.progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            }
        });
    },

    deleteCover : function() {
        re=/(.*)kpos\/img\/gallery\/store\//;
        var imageName = $("#company-cover-image").prop("src").replace(re, "");
        $.ajax({
            url: '/kpos/webapp/file/image/store/coverImage?name=' + imageName,
            type: 'DELETE',
            cache: false,
            contentType: false,
            processData: false,
            timeout: 5000,
            success: function (returndata) {
                $('#upload-company-cover-result-text').text(returndata);
                $('#upload-company-cover-result-text').show();
                $('#company-cover-image').prop("src", "");
            },
            beforeSend: function() {
                $("button[type='button']").prop('disabled',true);
            },
            complete: function() {
                $("button[type='button']").prop('disabled',false);
                $("#upload-company-cover-result-text").hide();
            },
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload){ // Check if upload property exists
                    //myXhr.upload.addEventListener('progress',uploadAddressDataObj.progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            }
        });
    },
}


