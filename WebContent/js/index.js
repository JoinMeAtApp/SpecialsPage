twttr.ready(
	function (twttr) {
		twttr.events.bind(
		'tweet',
		function (event) {
			console.log('tweet occurred');
		    Twitter.confirmTweet().then(
		    	function(data) {
		    		if (data) {
		    			App.tweetSuccess = true;

						var withinTimeFrame = false;
		    			var now = moment();
		    			var start = moment.utc(App.special.fStartTimeUTC).local();
		    			var end = moment.utc(App.special.fStopTimeUTC).local();

		    			if (now.isBetween(start, end)) {
		    				withinTimeFrame = true;
		    			}

		    			var friendsArr = new Array();
		    			for (var i = 0; i < App.special.unlockQuantity; i ++) 
		    				friendsArr[i] = '@';

					    var pageData = {
							hashtag: '#', 
							friends: friendsArr,
							merchHandle: 'M',
					    	helperText: "You've Tweeted successfully!  Redeem your offer now!",
					    	specialTitle: App.special.fDeal,
							restrictions: App.special.fRestrictions,
							image: App.constants.IMG_LOC + App.special.image,
							startTime: start.format('MMM Do, h:mm a'),
							endTime: end.format('MMM Do, h:mm a'),
							isWithinTimeFrame: withinTimeFrame,
							isDisabled: withinTimeFrame ? '' : 'disabled',
							oauthSuccess: App.oauthSuccess,
							tweetSuccess: App.tweetSuccess
					    };

					    var midHtml = midTemplate(pageData);
					    $('.main').html(midHtml);
					    $('.helperText').hide();

					    var timer = 500;
						$('.hashtag').addClass('animated bounceIn');
						for (var i = 0; i < friendsArr.length; i ++) {
							window.setTimeout(function() { $('.friend' + i).addClass('animated bounceIn'); }, timer);
							timer += 500;
						}
						window.setTimeout(function() { $('.merchHandle').addClass('animated bounceIn'); }, timer);
						timer += 500;

						window.setTimeout(function() { $('.svgAnimations').addClass('animated fadeOut'); }, timer);
						timer += 500;

						window.setTimeout(function() { $('.helperText').show().addClass('animated fadeIn'); }, timer);

		    		} else {
		    			// Tell user they eff'd up.
		    		}
		    	},
		    	function(error) {

		    	}
		    );
		});
	}
);

App = {	
	constants: {
		URL_GSON: 'https://app.joinmeatapp.com/Prod/rs/',
		IMG_LOC: 'https://s3.amazonaws.com/joinmeatapp.images/',
		LOGO_LOC: 'https://s3.amazonaws.com/joinmeatapp.logos/'
	},
	special: null,
	merchant: null,
	pageData: null,
	topTemplate: null,
	midTemplate: null,
	oauthSuccess: false,
	tweetSuccess: false,
	redeemSuccess: false,
	oauth_verifier: null,
	oauth_token: null,
	getMerchant: function(merchantID) {
		var self = this;
		Services.getMerchant(merchantID).then(
			function(data) {
				if (data) {
					App.merchant = data;
					var pageData = {
						helperText: 'Tweet to friends about ' + App.merchant.name + ' to immediately use this offer!',
						restrictions: self.special.fRestrictions,
						unlockQuantity: self.special.unlockQuantity,
						image: self.constants.IMG_LOC + self.special.image,
						startTime: moment.utc(self.special.fStartTimeUTC).local().format('MMM Do, h:mm a'),
						endTime: moment.utc(self.special.fStopTimeUTC).local().format('MMM Do, h:mm a'),
						oauthSuccess: self.oauthSuccess,
						tweetSuccess: self.tweetSuccess,
						redeemSuccess: self.redeemSuccess,
						// Must use "text" param here instead of "hashtags" to force proper ordering
						tweetIntentHref: "https://twitter.com/intent/tweet?text=%23jmatest+%40" + data.twitterHandle
					}
					var topHtml = topTemplate({
						name: data.name,
						specialTitle: self.special.fDeal
					});
					var midHtml = midTemplate(pageData);
					$('.top').html(topHtml);
					$('.main').html(midHtml);
				} 
			},
			function(error) {

			});
	},
	logTweetClick: function() {
		console.log('Twitter was was clicked');
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
	redeem: function() {
		var  yesno = confirm("You are about to use " + App.special.fDeal + ".  Please show this to your server.");

		if (yesno) {
			var cookies = document.cookie.split(';');
			var code = null;
			for (var i = 0; i < cookies.length; i ++) {
				if (cookies[i].indexOf('specialCode') !== -1) {
					code = cookies[i].substring(12);
					break;
				}
			}

			var self = this;
			Services.redeem(code).then(
				function(data) {
					if (data) {
						App.redeemSuccess = true;
						var pageData = {
							helperText: 'Enjoy your offer!',
							specialTitle: self.special.fDeal,
							restrictions: self.special.fRestrictions,
							unlockQuantity: self.special.unlockQuantity,
							image: self.constants.IMG_LOC + self.special.image,
							startTime: moment.utc(self.special.fStartTimeUTC).local().format('MMM Do, h:mm a'),
							endTime: moment.utc(self.special.fStopTimeUTC).local().format('MMM Do, h:mm a'),
							oauthSuccess: self.oauthSuccess,
							tweetSuccess: self.tweetSuccess,
							redeemSuccess: self.redeemSuccess
						}
						var topHtml = topTemplate({
							name: App.merchant.name,
							specialTitle: self.special.fDeal
						});
						var midHtml = midTemplate(pageData);
						$('.top').html(topHtml);
						$('.main').html(midHtml);
					} else {
						// do something to alert user to failure
					}
						
				},
				function(error) {

				});
		}
	},
}

$(document).ready(function() {
	var url = window.location.search.substring(1);
	var vars = url.split("=");
	var code = vars[1];

	var topSource = $('#top').html();
	var midSource = $('#main-body').html();
	topTemplate = Handlebars.compile(topSource);
	midTemplate = Handlebars.compile(midSource);

	// If the user has successfully authorized our app...
	if (code.indexOf('success') !== -1) {
		// 1. Get the oauth token & token secret saved into cookies, use to call getUserInfo
		document.cookie = "verifier=" + vars[3];
		App.oauthSuccess = true;
		Twitter.getUserInfo();

		// 2. Get the special code saved into cookies to pull down the Special
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i ++) {
			if (cookies[i].indexOf('specialCode') !== -1) {
				code = cookies[i].substring(12);
				break;
			}
		}

		// 3. Get the Special & Merchant objects for display
		Services.getSpecial(code).then(
			function(data) {
				if (data) {
					App.special = data;
					App.getMerchant(data.placeID);
				}
			},
			function(error) {

			});


	} else {	// Else...
		// 1. Save the special code into a cookie for page reload
		document.cookie = "specialCode=" + code;

		// 2. Get Special & Merchant objects for display
		Services.getSpecial(code).then(
		function(data) {
			if (data) {
				App.special = data;
				App.getMerchant(data.placeID);
				Services.logPageView(code, data.placeID, 2);
			}
		},
		function(error) {

		});
	}

	
});