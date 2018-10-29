$(document).ready(function () {
	$('#load-container').hide();
});

function handleAPILoaded() {
	requestUserUploadsPlaylistId();
}

function exportPlaylists(id) {
	$('#playlist-container').hide();
	$('#load-container').show();
	getVideosLinks(id, function (result) {
		$('#load-container').hide();
		var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result));
		var button = document.createElement('button');
		button.innerHTML = '<a class="downloadJSON" download="data.json" href="data:' + data + '">Download JSON</a>';
		var container = document.getElementById('download-container');
		container.appendChild(button);
	});
}

function requestUserUploadsPlaylistId() {
	$('#load-container').show();
	getPlaylists(function (result) {
		$('#load-container').hide();
		$.each(result, function (index, item) {
			$('#playlist-container').append('<p class="playlistContainer"><button type="button" class="playlist-button" id="' + item.id + '">' + item.title + '</button></p>');
			$('#' + item.id).click(function () {
				exportPlaylists($(this).attr('id'));
			})
		});
	});
}

function getPlaylists(callback, pageToken) {
	console.log("Getting playlist list");
	var requestOptions = {
		part: 'snippet',
		mine: true,
		maxResults: 50
	};
	if (pageToken) {
		requestOptions.pageToken = pageToken;
		console.log("Page token is " + pageToken);
	}
	var request = gapi.client.youtube.playlists.list(requestOptions);
	request.execute(function (response) {
		//console.log(response);
		if (response.statusCode === 200) {
			var nextPageToken = response.result.nextPageToken;
			var playlistItems = response.result.items;
			var playlists = [];
			if (playlistItems) {
				for (var i = 0; i < playlistItems.length; i += 1) {
					playlists.push({id: playlistItems[i].id, title: playlistItems[i].snippet.title});
				}
			}
			if (nextPageToken && nextPageToken !== pageToken) {
				getPlaylists(function (result) {
					playlists.push.apply(playlists, result);
					callback(playlists);
				}, nextPageToken);
			}
			else {
				playlists.sort(function (a, b) {
					return a.title.localeCompare(b.title);
				});
				callback(playlists);
			}
		} else {
			callback([]);
		}
	}, function (error) {
		console.log("Error:");
		console.log(error);
		callback([]);
	});
}

function getVideosLinks(playlistId, callback, pageToken) {
	console.log("Getting playlist info");
	var requestOptions = {
		playlistId: playlistId,
		part: 'snippet',
		maxResults: 50
	};
	if (pageToken) {
		requestOptions.pageToken = pageToken;
		console.log("Page token is " + pageToken);
	}
	var request = gapi.client.youtube.playlistItems.list(requestOptions);
	request.execute(function (response) {
		//console.log(response);
		var nextPageToken = response.result.nextPageToken;
		var playlistItems = response.result.items;
		var links = [];
		if (playlistItems) {
			for (var i = 0; i < playlistItems.length; i += 1) {
				links.push(playlistItems[i].snippet.resourceId.videoId);
			}
		}
		if (nextPageToken && nextPageToken !== pageToken) {
			getVideosLinks(playlistId, function (result) {
				links.push.apply(links, result);
				callback(links);
			}, nextPageToken);
		}
		else {
			callback(links);
		}
	}, function (error) {
		console.log("Error:");
		console.log(error);
		callback([]);
	});
}