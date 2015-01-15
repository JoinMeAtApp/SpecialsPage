Twitter = {
	TWITTER_TEST_CONSUMER_KEY: "zyeWSvwTzh7byVy9cAIfQsxql",
	TWITTER_TEST_CONSUMER_SECRET: "BSb5yVPqNsAi7CtOY9AzcVNwf9hjIzS3TPDe4Ep0RB9PvKTIKn",
	TWITTER_TEST_ACCESS_TOKEN: "2870148905-33AsepCQFe9t7wJoLDY6lMEipyIm7u1sINmPMQZ",
	TWITTER_TEST_ACCESS_SECRET: "CWvfcmf4NY1VaLohiQztUuJIRlRMCEJSJ1fN33k8aVJSX",
	TWITTER_TEST_ID: '2870148905l',

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

	oAuth: function() {
		var oauth = OAuth({
			consumer: {
				public: this.TWITTER_TEST_CONSUMER_KEY,
	    		secret: this.TWITTER_TEST_CONSUMER_SECRET,
			},
			signature_method: 'HMAC-SHA1'
		});

		var token = {
			public: this.TWITTER_TEST_ACCESS_TOKEN,
			secret: this.TWITTER_TEST_ACCESS_SECRET
		};

		var requestData = {
			url: 'https://api.twitter.com/oauth/request_token',
			method: 'post',
			/*data: {
				oauth_callback: 'http://google.com'
			}*/
		};

		var auth = oauth.authorize(requestData, token);
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

	}
}