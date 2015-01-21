twttr.events.bind(
  'tweet',
	function (event) {
	    console.log('cookies: ' + document.cookie);
	    App.tweetSuccess = true;

	    var pageData = {
	    	specialTitle: App.special.fDeal,
			image: App.constants.IMG_LOC + App.special.image,
			startTime: moment.utc(App.special.fStartTimeUTC).local(),
			endTime: moment.utc(App.special.fStopTimeUTC).local(),
			oauthSuccess: App.oauthSuccess,
			tweetSuccess: App.tweetSuccess
	    }

	    var midHtml = midTemplate(pageData);
	    $('.main').html(midHtml);

	    Twitter.confirmTweet();
	}
);

App = {
	special: null,
	merchant: null,
	pageData: null,
	topTemplate: null,
	midTemplate: null,
	oauthSuccess: false,
	tweetSuccess: false,
	oauth_verifier: null,
	oauth_token: null,
	getMerchant: function(merchantID) {
		var self = this;
		Services.getMerchant(merchantID).then(
			function(data) {
				if (data) {
					App.merchant = data;
					var pageData = {
						specialTitle: self.special.fDeal,
						image: self.constants.IMG_LOC + self.special.image,
						startTime: moment.utc(self.special.fStartTimeUTC).local(),
						endTime: moment.utc(self.special.fStopTimeUTC).local(),
						oauthSuccess: self.oauthSuccess,
						tweetSuccess: self.tweetSuccess
					}
					var topHtml = topTemplate({name: data.name});
					var midHtml = midTemplate(pageData);
					$('.top').html(topHtml);
					$('.main').html(midHtml);
				}
			},
			function(error) {

			})
	},
	constants: {
		URL_GSON: 'https://app.joinmeatapp.com/Prod/rs/',
		IMG_LOC: 'https://s3.amazonaws.com/joinmeatapp.images/',
		LOGO_LOC: 'https://s3.amazonaws.com/joinmeatapp.logos/'
	}
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
		/*App.oauth_token = vars[2].substring(0, 32);*/
		document.cookie = "verifier=" + vars[3];
		//App.oauth_verifier = vars[3];
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

		// 3. Get the Special & Merchant objects, & get Twitter User's information
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
				App.getMerchant(data.placeID)
			}
		},
		function(error) {

		});
	}

	
});