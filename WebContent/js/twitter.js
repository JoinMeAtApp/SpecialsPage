Twitter = {
	oAuthRequest: function() {

		$.ajax({
			url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/oauth',
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
		//var yesterday = moment().subtract(1, 'days').utc();

		// Get the token & secret, the remove both cookies
		for (var i = 0; i < cookies.length; i ++) {
			if (cookies[i].indexOf('tokenSecret') !== -1) {
				oauthSecret = cookies[i].substring(13);
				//document.cookie = "tokenSecret=; expires" + yesterday;
			} else if (cookies[i].indexOf('token') !== -1) {
				oauthToken = cookies[i].substring(7);
				//document.cookie = "token=; expires=" + yesterday;
			} else if (cookies[i].indexOf('verifier') !== -1) {
				verifier = cookies[i].substring(10);

			}
		}

		$.ajax({
			url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/user',
			type: 'POST',
			dataType: 'json',
			data: { verifier: verifier, token: oauthToken, tokenSecret: oauthSecret },
			success: function(data) {
				var User = data;
				App.User = data;

				// from here we need to send the tweet
				// we *could* insert the tweet intent here, but then it won't capture the tweet event
				//Twitter.statusUpdate(Twitter.USER_TOKEN, Twitter.USER_SECRET);
			},
			error: function(error) {
				console.log('total failure, noob');
			}
		});
	},
	statusUpdate: function(token, secret) {

		$.ajax({
			url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/statusUpdate',
			type: 'POST',
			dataType: 'json',
			data: { twitterToken: token, twitterSecret: secret },
			success: function(status) {
				console.log(status);
			},
			error: function(error) {
				console.log('total failure, noob');
			}
		});
	},
	confirmTweet: function() {
		var cookies = document.cookie.split(';');
		var oauthToken, oauthSecret;

		// Get the token & secret, the remove both cookies
		for (var i = 0; i < cookies.length; i ++) {
			if (cookies[i].indexOf('tokenSecret') !== -1) 
				oauthSecret = cookies[i].substring(13);
			else if (cookies[i].indexOf('token') !== -1) 
				oauthToken = cookies[i].substring(7);
			else if (cookies[i].indexOf('verifier') !== -1) 
				verifier = cookies[i].substring(10);
		}

		return $.ajax({
			url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/confirm',
			type: 'POST',
			dataType: 'json',
			data: { 
				verifier: verifier, 
				token: oauthToken, 
				tokenSecret: oauthSecret,
				username: App.User.screenName },
			success: function(data) {
				console.log('twitter confirm successfully returned');
			},
			error: function(error) {
				console.log('twitter confirm error');
			}

		})
	}
}