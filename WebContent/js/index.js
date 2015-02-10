$(document).ready(function() {
	var url = window.location.search.substring(1);
	var vars = url.split("=");
	var code = vars[1];

	var topSource = $('#top').html();
	var midSource = $('#main-body').html();
	topTemplate = Handlebars.compile(topSource);
	midTemplate = Handlebars.compile(midSource);

	// If the user hasn't successfully authorized our app...
	if (code.indexOf('success') === -1) {
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

	} else {	// Else...
		App.isLoginPage = false;
		App.isTweetPage = true;
		App.isRedeemPage = false;
		App.isFinishPage = false;

		// 1. Save verifier into cookies, call getUserInfo
		document.cookie = "verifier=" + vars[3];
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
				if (!data.isJMAException) {
					App.special = data;
					App.getMerchant(data.placeID, 2);
				} else {

				}
			},
			function(error) {
				console.log('there was an error getting the specialCode')
			});
	}
});

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
	isLoginPage: true,
	isTweetPage: false,
	isRedeemPage: false,
	isFinishPage: false,
	oAuthRequest: function() {
		var spinner = Ladda.create(document.querySelector('button'));
		spinner.start();

		Twitter.oAuthRequest();
		// Stopping the spinner here is unnecessary b/c we do a Twitter redirect
	},
	getMerchant: function(merchantID, textCode) {
		var self = this;
		Services.getMerchant(merchantID).then(
			function(data) {
				if (data) {
					App.merchant = data;

					var isRedeemed = false;
					var cookies = document.cookie.split(';');
					for (var i = 0; i < cookies.length; i ++) {
						if (cookies[i].indexOf('redeemed' + App.special.specialCode) !== -1) {
							isRedeemed = true;
							break;
						}
					}

					var _helperText = 'Tweet to friends about ' + App.merchant.name + ' to immediately use this offer!';
					if (textCode === 2)
						_helperText = 'Make sure you include the phrase "#JoinMeAt @' + App.merchant.twitterHandle + '"'
							+ '\n and Tweet at ' + self.special.unlockQuantity + ' friends!';
					else if (isRedeemed) {
						self.redeemSuccess = true;
						_helperText = '';
					}

					var pageData = {
						helperText: _helperText,
					    tweetStatus: "#jmatest @" + App.merchant.twitterHandle,
						restrictions: self.special.fRestrictions,
						unlockQuantity: self.special.unlockQuantity,
						image: self.constants.IMG_LOC + self.special.image,
						startTime: moment.utc(self.special.fStartTimeUTC).local().format('MMM Do, h:mm a'),
						endTime: moment.utc(self.special.fStopTimeUTC).local().format('MMM Do, h:mm a'),
						isLoginPage: App.isLoginPage,
						isTweetPage: App.isTweetPage,
						isRedeemPage: false,
						isFinishPage: false,
					}
					var topHtml = topTemplate({
						name: data.name,
						specialTitle: self.special.fDeal
					});
					var midHtml = midTemplate(pageData);
					$('.top').html(topHtml);
					$('.main').html(midHtml);

					if ($('textarea').length > 0)
						Util.charCounter();
				} 
			},
			function(error) {

			});
	},
	updateStatus: function() {
		// Log the Tweet button click
		Util.logTweetClick();

		var spinner = Ladda.create(document.querySelector('button'));
		spinner.start();

		Util.validateTweet($('textarea').val()).then(
			function() {
				Twitter.statusUpdate($('textarea').val()).then(
					function(data) {
						if (!data.isJMAException) {
							Util.logTweetClick();

							console.log('new updateStatus stuff works like a charm!');

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
								hashtag: '#JoinMeAt', 
								friends: friendsArr,
								merchHandle: '@' + App.merchant.twitterHandle,
						    	helperText: "You've Tweeted successfully!  Redeem your offer now!",
						    	specialTitle: App.special.fDeal,
								restrictions: App.special.fRestrictions,
								image: App.constants.IMG_LOC + App.special.image,
								startTime: start.format('MMM Do, h:mm a'),
								endTime: end.format('MMM Do, h:mm a'),
								isWithinTimeFrame: withinTimeFrame,
								isDisabled: withinTimeFrame ? '' : 'disabled',
								isLoginPage: false,
								isTweetPage: false,
								isRedeemPage: true,
								isFinishPage: false,
						    };

						    var midHtml = midTemplate(pageData);
						    $('.main').html(midHtml);
						    $('.helperText').hide();

						    var timer = 500;
							$('.hashtag').addClass('animated bounceIn');
							for (var i = 0; i < friendsArr.length; i ++) {
								var $friend = $('#friend' + i);
								window.setTimeout(function() { $friend.addClass('animated bounceIn'); }, timer);
								timer += 500;
							}
							window.setTimeout(function() { $('.merchHandle').addClass('animated bounceIn'); }, timer);
							timer += 500;

							window.setTimeout(function() { $('.svgAnimations').addClass('animated fadeOut'); }, timer);
							timer += 700;

							window.setTimeout(function() {
								$('.svgAnimations')
								.html("<p>You've Tweeted successfully!  Redeem your offer now!</p>")
								.removeClass('fadeOut')
								.addClass('animated fadeIn');
							}, timer);

						} else {
							// handle exceptions
						}
					}, function(error) { /* do nothing */  });
			},
			function(error) { alert(error);  });
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
							image: self.constants.IMG_LOC + self.special.image,
							startTime: moment.utc(self.special.fStartTimeUTC).local().format('MMM Do, h:mm a'),
							endTime: moment.utc(self.special.fStopTimeUTC).local().format('MMM Do, h:mm a'),
							isLoginPage: false,
							isTweetPage: false,
							isRedeemPage: false,
							isFinishPage: true,
						}
						var topHtml = topTemplate({
							name: App.merchant.name,
							specialTitle: self.special.fDeal
						});
						var midHtml = midTemplate(pageData);
						$('.top').html(topHtml);
						$('.main').html(midHtml);

						document.cookie = 'redeemed' + code + '=true';
					} else {
						// do something to alert user to failure
					}
						
				},
				function(error) {

				});
		}
	},
}