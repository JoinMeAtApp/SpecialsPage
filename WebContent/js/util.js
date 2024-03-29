Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 1; i <= n; ++i)
        accum += block.fn(i);
    return accum;
});

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
	getCookies: function() {
		var deferred = $.Deferred();

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

		deferred.resolve({ 
			oauthToken: oauthToken, 
			oauthSecret: oauthSecret,
			verifier: verifier
		});

		return deferred.promise();
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
	},
	charCounter: function() {
		var charCount = $('#txtMessage').val().length;
		var $handles = $('.handleDiv');
		charCount += 10 + App.merchant.twitterHandle.length;	// 10 == #JoinMeAt + a space

		for (var i = 0; i < $handles.length; i ++) {
			charCount += $($handles[i]).attr('handle').length;
		}

		$('#twitterCounter').html(charCount + '/140');
	},
	removeHandle: function (el) {
		// Remove item from selectedHandles array & remove HTML div

		var handle = $(el).attr('handle');
		var newArray = new Array();

		for (var i = 0; i < App.selectedHandles.length; i ++) {
			if (App.selectedHandles[i].value !== handle)
				newArray.push(App.selectedHandles[i]);
		}

		App.selectedHandles = newArray;
		if (App.selectedHandles.length > 0)
			App.curLabel = App.selectedHandles[App.selectedHandles.length - 1].label;
		else
			App.curLabel = '';

		var $fullCounter = $('.counter-div-full-animate');
		if (App.selectedHandles.length < $fullCounter.length) {
			$($fullCounter[$fullCounter.length - 1])
				.removeClass('counter-div-full-animate')
				.addClass('counter-div-empty-animate').addClass('counter-div');
		}

		$(el).remove();

		this.charCounter();
	},
	placeCaretAtEnd: function (el) {
	    el.focus();
	    if (typeof window.getSelection != "undefined"
	            && typeof document.createRange != "undefined") {
	        var range = document.createRange();
	        range.selectNodeContents(el);
	        range.collapse(false);
	        var sel = window.getSelection();
	        sel.removeAllRanges();
	        sel.addRange(range);
	    } else if (typeof document.body.createTextRange != "undefined") {
	        var textRange = document.body.createTextRange();
	        textRange.moveToElementText(el);
	        textRange.collapse(false);
	        textRange.select();
	    }
	}
}