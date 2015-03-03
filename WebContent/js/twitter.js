Twitter = {
	oAuthRequest: function() {

		return $.ajax({
			url: App.constants.URL_GSON + 'Twitter/oauth',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/oauth',
			type: 'POST',
			dataType: 'json',
			success: function(url) {
				document.cookie = "twitterID=" + data.twitterID;
				window.location = data.authURL;
				return true;
			},
			error: function(error) {
				console.log('total failure, noob');
				return false;
			}
		});
	},
	getUserInfo: function() {
		Util.getCookies().then( function(cookies) {
			$.ajax({
				url: App.constants.URL_GSON + 'Twitter/user',
				//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/user',
				type: 'POST',
				dataType: 'json',
				data: { twitterID: cookies.twitterID },
				success: function(data) {
					App.User = data;
				},
				error: function(error) {
					console.log('total failure, noob');
				}
			});
		},
	function() { /* do nothing */ });
	},
	statusUpdate: function(_status) {
		var cookies = document.cookie.split(';');
		var twitterID;

		// Get the token & secret, the remove both cookies
		for (var i = 0; i < cookies.length; i ++) {
			if (cookies[i].indexOf('twitterID') !== -1) {
				twitterID = cookies[i].substring(13);
			}
		}
		return $.ajax({
			url: App.constants.URL_GSON + 'Twitter/statusUpdate',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/statusUpdate',
			type: 'POST',
			dataType: 'json',
			data: { 
				twitterID: twitterID, 
				senderID: App.User.id,
				merchantID: App.merchant.merchantID,
				status: _status },
			success: function(status) {
				console.log(status);
			},
			error: function(error) {
				console.log('total failure, noob');
			}
		});
	},
	getFriends: function(_query) {
		var deferred = $.Deferred();

		Util.getCookies().then(
			function(cookies) {

				return $.ajax({
					url: App.constants.URL_GSON + 'Twitter/users/search',
					//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/users/search',
					type: 'POST',
					dataType: 'json',
					data: { 
						token: cookies.oauthToken, 
						tokenSecret: cookies.oauthSecret, 
						verifier: cookies.verifier,
						query: _query,
					},
					success: function(data) {
						if (!data.isJMAException && data.length > 0)
							deferred.resolve(data);
						else 
							deferred.reject();
					},
					error: function(error) {
						deferred.reject();
					}
				});
			},
			function(error) { /* do nothing */ });

		return deferred.promise();
	}
}