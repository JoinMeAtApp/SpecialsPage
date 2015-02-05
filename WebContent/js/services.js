Services = {
	getSpecial: function(specialCode) {
		return $.ajax({
			url: App.constants.URL_GSON + 'Special/code/' + specialCode + '/1',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Special/code/' + specialCode,
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
	},
	redeem: function(code) {
		return $.ajax({
			url: App.constants.URL_GSON + 'Special/redeem/with/meta',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Special/redeem/with/meta',
			type: 'POST',
			dataType: 'json',
			data: { specialCode: code },
			success: function(data) {
				if (data === -1)
					return false;
				else
					return true;
			},
			error: function(error) {
				return false;
			}
		});
	},
	logPageView: function(code, _placeID, _type) {
		$.ajax({
			url: App.constants.URL_GSON + 'Stats/log/pageview',
			type: 'POST',
			dataType: 'text',
			data: { specialCode: code, placeID: _placeID, type: _type },
			success: function(data) {
				if (!data.isJMAException)
					return data;
				else
					return false;
			},
			error: function(error) {
				return false;
			}
		})
	},
	logWebAction: function(code, _placeID, _action) {
		$.ajax({
			url: App.constants.URL_GSON + 'Stats/web/action',
			type: 'POST',
			dataType: 'text',
			data: { specialCode: code, placeID: _placeID, type: _type },
			success: function(data) {
				if (!data.isJMAException)
					return data;
				else
					return false;
			},
			error: function(error) {
				return false;
			}
		})
	}

}