function ImageManager(imageForm, fileElementId, uploadingImageText, uploadingImageResultText, imageElementId, thumbName) {
    this.imageForm = imageForm;
    this.fileElementId = fileElementId;
    this.uploadingImageText = uploadingImageText;
    this.uploadingImageResultText = uploadingImageResultText;
    this.imageElementId = imageElementId;
    this.thumbName = thumbName;
    this.init = function() {
        var requestDataObj = {imageManager: this};
        $('form#' + this.imageForm).submit(requestDataObj, function(event){
          //disable the default form submission
          event.preventDefault();
          var formData = new FormData($(this)[0]);
          requestDataObj.imageManager.uploadFile(formData);
          return false;
        });
        $('form#' + this.imageForm + " .detail-input-delete-image").click(requestDataObj, function() {
            requestDataObj.imageManager.deleteFile();
        });
    },
    this.uploadFile = function(formData) {
        uiBaseObj.resetAllAlertDivs();
        //grab all form data
        var imageElement = $('#' + this.fileElementId);
        var imageName = imageElement.val().replace("C:\\fakepath\\", "");
        var size = document.getElementById(this.fileElementId).files[0].size;
        if (size > 512000) {
            uiBaseObj.alertDiv(this.imageForm, systemLanguage.msgCodeList.IMAGE_TOO_LARGE, "Image size is limited to 500kB");
            return false;
        }
        var imageManager = this;
        $.ajax({
            url: '/kpos/webapp/file/image/upload',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000,
            success: function (returndata) {
                $('#' + imageManager.uploadingImageResultText).text(returndata);
                $('#' + imageManager.uploadingImageResultText).show();
                $('#' + imageManager.imageElementId).prop("src", "img/gallery/" + imageName);
            },
            beforeSend: function () {
                $('#' + imageManager.uploadingImageText).show();
                $("button[type='submit']").prop('disabled',true);
            },
            complete: function(jqXHR, status) {
                $('#' + imageManager.uploadingImageText).hide();
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
    };
    this.deleteFile = function() {
        var re = new RegExp("(.*)kpos(\/)+img(\/)+gallery(\/)+");
        var imageName = $('#' + this.imageElementId).prop("src").replace(re, "");
        var imageManager = this;
        $.ajax({
            url: '/kpos/webapp/file/image/delete?name=' + imageName,
            type: 'GET',
            cache: false,
            contentType: false,
            processData: false,
            timeout: 5000,
            success: function (returndata) {
                $('#' + imageManager.uploadingImageResultText).text(returndata);
                $('#' + imageManager.uploadingImageResultText).show();
                $('#' + imageManager.imageElementId).prop("src", "img/gallery/category.html");
            },
            beforeSend: function () {
                $('#' + imageManager.uploadingImageText).show();
                $("button[type='submit']").prop('disabled',true);
            },
            complete: function(jqXHR, status) {
                $('#' + imageManager.uploadingImageText).hide();
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
    };
    this.reset = function() {
        $('#' + this.thumbName).val("");
        $('#' + this.uploadingImageResultText).hide();
    };
    this.setValue = function(imageFileNameFullPath) {
        var n = imageFileNameFullPath.split("//");
        $('#' + this.thumbName).text(n[n.length - 1]);
        $('#' + this.imageElementId).prop('src', imageFileNameFullPath);
    };
}
