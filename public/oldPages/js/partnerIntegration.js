var partnerIntegrationPage = {
	init : function() {
		partnerIntegrationObj.init();
	}
}

var partnerIntegrationObj = {
	currentEntry: null,
	partnerIntegrationList: [],

	init : function() {
		partnerIntegrationObj.listPartnerIntegrations();
	},

	listPartnerIntegrations : function() {
		$.ajax({
			url: "/kpos/webapp/admin/partnerIntegrations",
			type: "GET",
			cache: false,
			timeout: 60000,
			dataType: "json",
			contentType: "application/json",
			success: function(result, status, xhr) {
				if (result.partnerIntegrations != undefined && result.partnerIntegrations.length != 0) {
					partnerIntegrationList = util.getElementsArray(result.partnerIntegrations);
					$('#partner-integration-list').empty();
					for (var i = 0; i < partnerIntegrationList.length; i++) {
						var partnerIntegration = partnerIntegrationList[i];

						$('#partner-integration-list').append('<a href="javascript:partnerIntegrationObj.selectEntry(' + i
							+')" class="list-group-item">' + partnerIntegration.name + '</a>').trigger("create");

					}
				}
			},
			error: function(xhr, status, error) {
				console.log("Error occur when try to fetch all partner integration list." + error);
			}
		})
	},

	selectEntry : function(index) {
		currentEntry = partnerIntegrationList[index];
		$('#enable-service').prop('checked', currentEntry.enabled);
		$('#partner-integration-detail').show();
		if (currentEntry.enabled) {
		    partnerIntegrationObj.managedLocations();
		    $('#partner-key-password').show();
			$('#partner-detail').show();
			$('#api-key-input').val(currentEntry.apiKey);
		} else {
		    $('#api-key-input').prop('disabled', false);
            $('#partner-key-password').hide();
            $('#login-form').hide();
            $('#partner-detail').hide();
		}
	},

	enableService : function() {
		if ($('#enable-service').is(':checked')) {
		    $('#api-key-input').val('');
		    $('#userName').val('');
		    $('#password').val('');
		    $('#partner-key-password').show();
			$('#login-form').show();
		} else {
			$('#partner-key-password').hide();
			$('#login-form').hide();
			$('#partner-detail').hide();
			partnerIntegrationObj.update();
		}
	},

	authentication : function() {
		if ($('#userName').val() == "") {
		    partnerIntegrationObj.alert("User name is missing!");
			return;
		}
		if ($('#password').val() == "") {
		    partnerIntegrationObj.alert("Password is missing!");
			return;
		}
		if ($('#api-key-input').val() == "") {
		    partnerIntegrationObj.alert("API Key is missing!");
		}
		var data = {
            partnerName : currentEntry.name,
            userName : $('#userName').val(),
            password : $('#password').val(),
            apiKey : $('#api-key-input').val()
		}

		$.ajax({
            url: "/kpos/webapp/admin/partnerIntegration/authenticate",
            type: "POST",
            cache: false,
            timeout: 60000,
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: "application/json",
            Accept: "application/json",
            success: function(result, status, xhr) {
                if (result.successful) {
                    partnerIntegrationObj.managedLocations();
                } else {
		            partnerIntegrationObj.alert(result.errorMessage);
                    return;
                }
                console.log(result);
            },
            error: function (xhr, status, error) {
                console.log("Error occur when trying to sign in. " + error);
            }
        });
	},

	managedLocations : function() {
	    $.ajax({
            url: "/kpos/webapp/admin/partnerIntegration/" + currentEntry.name +"/locations",
            type: "GET",
            cache: false,
            timeout: 60000,
            dataType: 'json',
            contentType: "application/json",
            Accept: "application/json",
            success: function(result, status, xhr) {
                var locationList = JSON.parse(result.locations);
				if (locationList != undefined && locationList.length != 0) {
				    $('#location-list').empty();
				    $('#location-list').append('<option value="" selected disabled>Please select</option>');
				    for (var i = 0; i < locationList.length; i++) {
                        var location = locationList[i];
                        $('#location-list').append('<option value="' + location.location.id + '">' + location.location.name + '</option>').trigger("create");
                    }
                    if (currentEntry.storeId) {
                        $('#location-list').val(currentEntry.storeId);
                    }
                    $('#api-key-input').prop('disabled', true);
                    $('#login-form').hide();
                    $('#partner-detail').show();
				} else {
				    partnerIntegrationObj.alert(result.errorMessage);
				}
            },
            error: function (xhr, status, error) {
                console.log("Error occur when trying to fetch locations data. " + error);
            }
        });
	},

	update : function() {
	    console.log(currentEntry);
	    var data = {
	        id: currentEntry.id,
	        enabled: $('#enable-service').is(':checked'),
	        storeName: $("#location-list option:selected").text(),
	        storeId: $('#location-list').val(),
	        apiKey: $('#api-key-input').val()
	    }

        $.ajax({
            url: "/kpos/webapp/admin/partnerIntegration",
            type: "PUT",
            cache: false,
            timeout: 60000,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: "application/json",
            Accept: "application/json",
            success: function(result, status, xhr) {
                partnerIntegrationObj.listPartnerIntegrations();
                $('#partner-integration-detail').hide();
            },
            error: function (xhr, status, error) {
                console.log("Error occur when trying to update partner integration. " + error);
                partnerIntegrationObj.alert("Unexpected error occur when trying to update.");
            }
        });
	},

	alert : function(msg) {
        $("#error-msg").html(msg);
        $('#error-msg-modal').modal("show");
	}
}