Twitter = {
	oAuthRequest: function() {

		return $.ajax({
			url: App.constants.URL_GSON + 'Twitter/oauth',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/oauth',
			type: 'POST',
			dataType: 'json',
			success: function(data) {
				document.cookie = "token=" + data.token;
				document.cookie = "tokenSecret=" + data.tokenSecret;
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
				//url: App.constants.URL_GSON + 'Twitter/user',
				url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/user',
				type: 'POST',
				dataType: 'json',
				data: { verifier: cookies.verifier, token: cookies.oauthToken, tokenSecret: cookies.oauthSecret },
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
		var oauthToken, oauthSecret, verifier;

		// Get the token & secret, the remove both cookies
		for (var i = 0; i < cookies.length; i ++) {
			if (cookies[i].indexOf('tokenSecret') !== -1) {
				oauthSecret = cookies[i].substring(13);
			} else if (cookies[i].indexOf('token') !== -1) {
				oauthToken = cookies[i].substring(7);
			} else if (cookies[i].indexOf('verifier') !== -1) {
				verifier = cookies[i].substring(10);

			}
		}
		return $.ajax({
			url: App.constants.URL_GSON + 'Twitter/statusUpdate',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/statusUpdate',
			type: 'POST',
			dataType: 'json',
			data: { 
				twitterToken: oauthToken, 
				twitterSecret: oauthSecret, 
				verifier: verifier, 
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
					//url: App.constants.URL_GSON + 'Twitter/confirm',
					url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/users/search',
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