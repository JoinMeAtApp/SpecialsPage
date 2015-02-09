Twitter = {
	oAuthRequest: function() {

		$.ajax({
			url: App.constants.URL_GSON + 'Twitter/oauth',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/oauth',
			type: 'POST',
			dataType: 'json',
			success: function(data) {
				document.cookie = "token=" + data.token;
				document.cookie = "tokenSecret=" + data.tokenSecret;
				window.location = data.authURL;
			},
			error: function(error) {
				console.log('total failure, noob');
			}
		});
	},
	getUserInfo: function() {
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

		$.ajax({
			url: App.constants.URL_GSON + 'Twitter/user',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/user',
			type: 'POST',
			dataType: 'json',
			data: { verifier: verifier, token: oauthToken, tokenSecret: oauthSecret },
			success: function(data) {
				App.User = data;
			},
			error: function(error) {
				console.log('total failure, noob');
			}
		});
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
			url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/statusUpdate',
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
	confirmTweet: function() {

		return $.ajax({
			url: App.constants.URL_GSON + 'Twitter/confirm',
			//url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/confirm',
			type: 'POST',
			dataType: 'json',
			data: { senderID: App.User.id, merchantID: App.merchant.merchantID },
			success: function(data) {
				console.log('confirmTweet: ' + data);
				if (data > 0)
					return true
				else 
					return false;
			},
			error: function(error) {
				return false;
			}
		});
	}
}