Twitter = {
	TWITTER_TEST_CONSUMER_KEY: "zyeWSvwTzh7byVy9cAIfQsxql",
	TWITTER_TEST_CONSUMER_SECRET: "BSb5yVPqNsAi7CtOY9AzcVNwf9hjIzS3TPDe4Ep0RB9PvKTIKn",
	TWITTER_TEST_ACCESS_TOKEN: "2870148905-33AsepCQFe9t7wJoLDY6lMEipyIm7u1sINmPMQZ",
	TWITTER_TEST_ACCESS_SECRET: "CWvfcmf4NY1VaLohiQztUuJIRlRMCEJSJ1fN33k8aVJSX",
	TWITTER_TEST_ID: '2870148905l',
	
	USER_TOKEN: null,
	USER_SECRET: null,

	// IRL Data
	/*TWITTER_TEST_CONSUMER_KEY: "G8A0SlEYiwKD4ydEQeYIe3zZE",
	TWITTER_TEST_CONSUMER_SECRET: "gjWb2qxPOlzEyKUodNlkrDO5ZZbTwfpcDuY7umRCH9UsH3lfVT",
	TWITTER_TEST_ACCESS_TOKEN: "1649497638-1BjjkkhqqfWPsEvseUAJHAiVzoCDJSAlYTcvktN",
	TWITTER_TEST_ACCESS_SECRET: "gn92qQ53n0s6k07HT0Rb7QYHjLGGFYU9Q5AQyLVMHWMYT",
	TWITTER_TEST_ID: '1649497638',*/

	/*genNonce: function() {
		var chars = '01234567890abcdefghijklmnopqrstuvwxyzABCDEFTHIJKLMNOPQRSTUVWXYZ';
	    var result = '';
	    for (var i = 32; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
	    return result;
	},*/

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
	oAuthAccess: function() {
		var cookies = document.cookie.split(';');
		var oauthToken, oauthSecret;
		var yesterday = moment().subtract(1, 'days').utc();

		// Get the token & secret, the remove both cookies
		for (var i = 0; i < cookies.length; i ++) {
			if (cookies[i].indexOf('tokenSecret') !== -1) {
				oauthSecret = cookies[i].substring(13);
				document.cookie = "tokenSecret=; expires" + yesterday;
				this.USER_SECRET = oauthSecret;
			} else if (cookies[i].indexOf('token') !== -1) {
				oauthToken = cookies[i].substring(6);
				document.cookie = "token=; expires=" + yesterday;
				this.USER_TOKEN = oauthToken;
			}
		}

		$.ajax({
			url: 'http://localhost:8080/JoinMeAt_v2/rs/Twitter/user',
			type: 'POST',
			dataType: 'json',
			data: { verifier: App.oauth_verifier, token: oauthToken, tokenSecret: oauthSecret },
			success: function(data) {
				var User = data;
				App.User = data;
				// from here we need to send the tweet
				// we *could* insert the tweet intent here, but then it won't capture the tweet event
				Twitter.statusUpdate(Twitter.USER_TOKEN, Twitter.USER_SECRET);
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


		/*var oauth = OAuth({
		    consumer: {
		        public: this.TWITTER_TEST_CONSUMER_KEY,
		        secret: this.TWITTER_TEST_CONSUMER_SECRET
		    },
		    signature_method: 'HMAC-SHA1'
		});

		var token = {
		    public: this.TWITTER_TEST_ACCESS_TOKEN,
		    secret: this.TWITTER_TEST_ACCESS_SECRET
		};

		var request_data = {
		    url: 'https://api.twitter.com/oauth/request_token',
		    method: 'POST'
		};

		var auth = oauth.authorize(request_data, token);
		var authHeader = oauth.toHeader(auth);

		$.ajax({
		    url: request_data.url,
		    type: request_data.method,
		    data: request_data.data,
		    dataType: 'json',
		    headers: authHeader
		}).done(function(data) {
			console.log('done data: ' + data);
		    //process your data here
		});*/

		/*var auth = oauth.authorize(requestData, token);
		var testHeader = oauth.toHeader(auth);

		$.ajax({
			url: requestData.url,
			type: requestData.method,
			dataType: 'json',
			//headers: oauth.toHeader(oauth.authorize(requestData, token)),
			beforeSend: function(xhr) {
				xhr.setRequestHeader('Authorization', testHeader.Authorization);
				console.log('Authorization: ' + testHeader.Authorization);
			},
			success: function(data, status, xhr) {
				console.log('success!');
			},
			error: function(xhr, status, errorThrown) {
				console.log('error: ' + errorThrown);
			}
		}).done(function(data) {
			console.log("all!");
		});

	}*/
}