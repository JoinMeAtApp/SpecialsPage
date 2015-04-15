$(document).ready(function() {
	var url = window.location.search.substring(1);
	var vars = url.split("=");
	var code, res, uamip, uamport, challenge, nasid, mac, refURL;
	code = vars[1].split('&')[0];

	if (vars.length > 2) {
		document.cookie = "res=" + vars[2].split('&')[0];		// User's status
		document.cookie = "uamip=" + vars[3].split('&')[0];		// AP IP
		document.cookie = "uamport=" + vars[4].split('&')[0];	// AP Port
		document.cookie = "challenge=" + vars[5].split('&')[0];	// Authentication
		document.cookie = "nasid=" + vars[6].split('&')[0];		// AP ID
		document.cookie = "mac=" + vars[7].split('&')[0]; 		// Mac from user
		document.cookie = "refURL=" + vars[8].split('&')[0];	// Referral URL
	}

	var topSource = $('#top').html();
	var midSource = $('#main-body').html();
	var snSource = $('#selectedNames-body').html();
	topTemplate = Handlebars.compile(topSource);
	midTemplate = Handlebars.compile(midSource);
	//snTemplate = Handlebars.compile(snSource);

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
		App.selectedNames = new Array();
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
	curLabel: '',
	selectedHandles: new Array(),
	topTemplate: null,
	midTemplate: null,
	isLoginPage: true,
	isTweetPage: false,
	isRedeemPage: false,
	selectedNames: new Array(),
	isFinishPage: false,
	oAuthRequest: function() {
		var spinner = Ladda.create(document.querySelector('button'));
		spinner.start();

		Twitter.oAuthRequest().then(
			function() {},
			function(error) {
				alert('There was a problem logging you in to Twitter.  Please try again!');
				spinner.stop();
		});
	},
	txtHandles_click: function() {
		if ($('#txtHandles').html().indexOf('Enter Twitter Handles') > -1)
			$('#txtHandles').html('');
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
						_helperText = 'Share this offer with ' + self.special.unlockQuantity + ' friend(s) to unlock!';
					else if (isRedeemed) {
						App.isLoginPage = false;
						_helperText = '';
					}

					var pageData = {
						helperText: _helperText,
					    merchHandle: '@' + App.merchant.twitterHandle,
						restrictions: self.special.fRestrictions,
						unlockQuantity: self.special.unlockQuantity,
						image: self.constants.IMG_LOC + self.special.image,
						startTime: moment.utc(self.special.fStartTimeUTC).local().format('MMM Do, h:mm a'),
						endTime: moment.utc(self.special.fStopTimeUTC).local().format('MMM Do, h:mm a'),
						isLoginPage: App.isLoginPage,
						isTweetPage: App.isTweetPage,
						selectedNames: App.selectedNames,
						isRedeemPage: false,
						isFinishPage: isRedeemed,
					}
					var topHtml = topTemplate({
						name: data.name,
						specialTitle: self.special.fDeal
					});
					var midHtml = midTemplate(pageData);
					$('.top').html(topHtml);
					$('.main').html(midHtml);

					if ($('#txtMessage').length > 0)
						Util.charCounter();
					
					$('#txtHandles').autocomplete({
						minlength: 4,
						delay: 300,
						source: function(request, response) {
							var newQuery = request.term;
							
							if (App.curLabel.length > 0)
								newQuery = newQuery.substring(newQuery.indexOf(App.curLabel) + App.curLabel.length);

							Twitter.getFriends(newQuery).then(
								function(friends) {
									response(friends);
								}, function() { 
									response(['No Matches Found']);
								});
						},
						select: function (event, ui) {

							// Mary's Updates
							App.selectedHandles[App.selectedHandles.length] = ui.item;
							var html = '';

							for (var i = 0; i < App.selectedHandles.length; i ++) {
								html +=
									'<div class="handleDiv" '
									+ 'onclick="Util.removeHandle(this)" '
									+ 'handle="' + App.selectedHandles[i].value + '" contenteditable="false">' 
									+  '<div class="handleText">' + App.selectedHandles[i].label + '</div>'
									+ '<img class="cancelImg" src="assets/glyphicons/glyphicons-208-remove-2.png">'
									+ '</div>';
							}

							$('#txtHandles').html(html);

							// End Mary's Updates

							App.curLabel = ui.item.label;
							Util.charCounter();
							var elementsArr = document.getElementsByClassName('handleDiv');
							Util.placeCaretAtEnd(elementsArr[elementsArr.length - 1]);

							var $counterDivs = $('.counter-div');
							if ($counterDivs.length > 0) {
								$($counterDivs[0]).removeClass('counter-div')
								.removeClass('counter-div-empty-animate').addClass('counter-div-full-animate');
							}

							return false;
						}
					});
				} 
			},
			function(error) { /* do nothing */ });
	},
	updateStatus: function() {
		// Log the Tweet button click
		Util.logTweetClick();

		var spinner = Ladda.create(document.querySelector('button'));
		spinner.start();

		if ($('#txtMessage').val().trim().length === 0) {
			alert('Make sure you include a message!');
			spinner.stop();
			return;
		} else if ($('.handleDiv').length < App.special.unlockQuantity) {
			alert('Make sure you Tweet to ' + App.special.unlockQuantity + ' friends!');
			spinner.stop();
			return;
		}

		var tweetText = '';
		var $handles = $('.handleDiv');
		for (var i = 0; i < $handles.length; i ++) {
			tweetText += $($handles[i]).attr('handle') + ' ';
		}

		tweetText += $('#txtMessage').val().trim() + ' #JoinMeAt @' + App.merchant.twitterHandle;

		Twitter.statusUpdate(tweetText).then(
			function(data) {
				if (!data.isJMAException) {
					Util.logTweetClick();

					// If the Special Type is the new type...
					if (App.special.type == 4) {
						// 1. Pull values from cookies
						// 2. Assemble URL
						// 3. Create div to load URL, then redirect
						var code, res, uamip, uamport, challenge, nasid, mac, refURL;
						var cookies = document.cookie.split(';');
						for (var i = 0; i < cookies.length; i ++) {
							if (cookies[i].indexOf('res') !== -1) {
								res = cookies[i].split('=')[1];
							} else if (cookies[i].indexOf('uamip') !== -1) {
								uamip = cookies[i].split('=')[1];
							} else if (cookies[i].indexOf('uamport') !== -1) {
								uamport = cookies[i].split('=')[1]; 
							} else if (cookies[i].indexOf('challenge') !== -1) {
								challenge = cookies[i].split('=')[1];
							} else if (cookies[i].indexOf('nasid') !== -1) {
								nasid = cookies[i].split('=')[1];
							}  else if (cookies[i].indexOf('mac') !== -1) {
								mac = cookies[i].split('=')[1];
							}  else if (cookies[i].indexOf('refURL') !== -1) {
								refURL = cookies[i].split('=')[1]; 
							}
						}

						var finalUrl = "http://geniusden.com/";
					 	var hostSpotURL = "http://" 
					 		+ uamip + ':' 
					 		+ uamport 
					 		+ "/logon?username=cocacola&"
					 		+ "password=" + challenge 
					 		+ "&userurl=" + refURL;

						var ddhs=document.createElement("div");
			            ddhs.setAttribute("id","ddhs"); 
			            ddhs.setAttribute("style","width:0px;height:0px;"); 
			            document.body.appendChild(ddhs); 
			            $('#ddhs-div').hide(); 
			            $("#ddhs").load(hostSpotURL, function(){ setTimeout("window.location='" + finalUrl + "'",1000); });

					} else {
						// Otherwise, go about our usual business.
						var withinTimeFrame = false;
		    			var now = moment();
		    			var start = moment.utc(App.special.fStartTimeUTC).local();
		    			var end = moment.utc(App.special.fStopTimeUTC).local();

		    			if (now.isBetween(start, end)) {
		    				withinTimeFrame = true;
		    			}

					    var pageData = {
							hashtag: '#JoinMeAt', 
							merchHandle: '@' + App.merchant.twitterHandle,
							unlockQuantity: App.special.unlockQuantity,
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
						for (var i = 1; i <= App.special.unlockQuantity; i ++) {
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
					}			
				} else {
					// handle exceptions
				}
			}, function(error) { /* do nothing */  });
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
	removeName: function(handle) {
		if (App.selectedNames == null)
			return;
		
		for (var i=App.selectedNames.length-1;i>=0;i--) {
			if (App.selectedNames[i].Handle == handle) {
				App.selectedNames.splice(i,1);
				break;
			}
		}
		
		/*var snHtml = snTemplate({
			isTweetPage: App.isTweetPage,
			selectedNames: App.selectedNames
		});
		$('.selectedNames').html(snHtml);*/
		
		App.updateFinal();
	},
	updateFinal: function() {
		var finalMessage = "#JoinMeAt @" + App.merchant.twitterHandle ;
		for (var i=0;i<App.selectedNames.length;i++) {
			finalMessage += " " + App.selectedNames[i].Handle;
		}
		
		finalMessage += " " + $('#txtMessage').val();
		$('#finalMessage').html(finalMessage);
	},
}