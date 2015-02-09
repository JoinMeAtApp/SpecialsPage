Util = {
	logTweetClick: function() {
		var cookies = document.cookie.split(';');
		var code = null;
		for (var i = 0; i < cookies.length; i ++) {
			if (cookies[i].indexOf('specialCode') !== -1) {
				code = cookies[i].substring(12);
				break;
			}
		}

		Services.logWebAction(code, App.special.placeID, 1);
	},
	validateTweet: function(tweet) {
		var deferred = $.Deferred();

		var regex = new RegExp('\@[a-zA-Z0-9]{1,15}', 'g');
		var count = (tweet.match(regex) || []);
		var result = null;

		if (tweet.indexOf('#jmatest') === -1)
			deferred.reject('You forgot to include #jmatest!');
		else if (tweet.indexOf('@' + App.merchant.twitterHandle) === -1)
			deferred.reject('You forgot to include @' + App.merchant.twitterHandle + '!');
		else if (count.length < App.special.unlockQuantity + 1)	// + 1 is for the required Merchant Twitter handle 
			deferred.reject('You need to include ' + App.special.unlockQuantity + ' friends in your tweet!');
		else 
			deferred.resolve();


		return deferred.promise();
	}
}