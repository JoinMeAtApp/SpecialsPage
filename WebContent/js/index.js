twttr.events.bind(
  'tweet',
  function (event) {
    // Do something there
    console.log('tweet occurred!');
    console.log('cookies: ' + document.cookie);
  }
);

App = {
	special: null,
	merchant: null,
	pageData: null,
	topTemplate: null,
	midTemplate: null,
	oauthSuccess: false,
	oauth_verifier: null,
	oauth_token: null,
	specialCallback: function(merchantID) {
		var self = this;
		Services.getMerchant(merchantID).then(
			function(data) {
				if (data) {
					App.merchant = data;
					pageData = {
						specialTitle: App.special.fDeal,
						image: self.constants.IMG_LOC + App.special.image,
						startTime: self.special.fStartTimeUTC,
						endTime: self.special.fStopTimeUTC,
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

	if (code.indexOf('success') !== -1) {
		this.oauthSuccess = true;
		oauth_token = vars[2].substring(0, 32);
		App.oauth_verifier = vars[3];
		Twitter.oAuthAccess();
	} else {
		Services.getSpecial(code).then(
		function(data) {
			if (data) {
				App.special = data;
				App.specialCallback(data.placeID)
			}
		},
		function(error) {

		});
	}

	
});