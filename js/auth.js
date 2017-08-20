var OAUTH2_CLIENT_ID = '850390026134-6u673fslj5c3de9b7oqaouiuj3qg3ina.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
	'https://www.googleapis.com/auth/youtube'
];

$(document).ready(function () {
	$('#logoff').click(logout);
});

function logout() {
	var token = gapi.auth.getToken();
	if (token) {
		var accessToken = gapi.auth.getToken().access_token;
		if (accessToken) {
			$.ajax({
				'url': 'https://accounts.google.com/o/oauth2/revoke?token=' + accessToken,
				'async': true,
				'method': 'GET',
				'success': function () {
					$('.pre-auth').show();
					$('.post-auth').hide();
				}
			});
		}
	}
	gapi.auth.setToken(null);
	gapi.auth.signOut();
	console.log("signing off");
}

googleApiClientReady = function () {
	gapi.auth.init(function () {
		window.setTimeout(checkAuth, 1);
	});
};

function checkAuth() {
	gapi.auth.authorize({
		client_id: OAUTH2_CLIENT_ID,
		scope: OAUTH2_SCOPES,
		immediate: true
	}, handleAuthResult);
}

function handleAuthResult(authResult) {
	if (authResult && !authResult.error) {
		$('.pre-auth').hide();
		$('.post-auth').show();
		loadAPIClientInterfaces();
	} else {
		$('#login-link').click(function () {
			gapi.auth.authorize({
				client_id: OAUTH2_CLIENT_ID,
				scope: OAUTH2_SCOPES,
				immediate: false
			}, handleAuthResult);
		});
	}
}

function loadAPIClientInterfaces() {
	gapi.client.load('youtube', 'v3', function () {
		handleAPILoaded();
	});
}