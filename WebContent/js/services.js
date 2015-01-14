Services = {
	getSpecial: function(specialCode) {
		return $.ajax({
			url: 'http://localhost:8080/JoinMeAt_v2/rs/Special/code/' + specialCode,
			type: 'GET',
			dataType: 'json',
			success: function(data, status, xhr) {
				if (data.isJMAException)
					return false
				else
					return data;
			},
			error: function(status, xhr, errorText) {
				return false;
			}
		});
	},
	getMerchant: function(id) {
		return $.ajax({
			url: App.constants.URL_GSON + 'Place/retrieve',
			type: 'POST',
			dataType: 'json',
			data: { placeID: id },
			success: function(data, status, xhr) {
				if (data.isJMAException)
					return false;
				else
					return data;
			}, 
			error: function(status, xhr, errorText) {
				return false;
			}
		});
		
	}
}