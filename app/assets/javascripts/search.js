
$(document).ready(function(){
	$('form').submit(false); // prevent form from submitting

	// Initiate search -> return results
	$('#searchButton').click(function(){
		var query = $('#searchQuery').val();
		$('.results').html('');
		artistSearch(query);
		trackSearch(query);
		albumSearch(query);
		MbTrackSearch(query);
	});

	// Return YT search results for selected track, autoplay first result
	$(document).on('click', '.search_result', function(){
		$('.yt_results').html('');
	  var artist = $(this).data('artist');
	  var track = $(this).data('track');
	  listYtResults(artist, track);
	});

	// Play selected YT video from YT search results
	$(document).on('click', '.yt_search_result', function(){
	  var videoId = $(this).data('id');
	  playSong(videoId);
	});

});

function playSong(videoId) {
	$('#yt_player').remove();
	$player = $('<div id="yt_player">');
	$player.html('<iframe width="600" height="337" src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" frameborder="0" allowfullscreen></iframe>');
	$('#right').prepend($player);
}

//////////////////////////////////
// YouTube Search ////////////////
//////////////////////////////////

function listYtResults(artist, track) {
	var baseURL = "https://www.googleapis.com/youtube/v3/search?";
	var apiKey = "key=" + "AIzaSyBZwPgx_XPordiPUIxzetxwy5CLwFZTb40";
	var part = "&part=snippet,id"; // options: https://developers.google.com/youtube/v3/docs/videos
	var type = "&type=video";
	var searchQuery = "&q=" + artist + ' ' + track;
	var maxResults = "&maxResults=10"; // 0-50
	var videoEmbeddable = "true";

	//var videoCategoryId = '?';
	//var order = "&order="; // relevance(default), date, rating, title, videoCount, viewCount
	//var topicId = "&topicId=";
  //var publishedAfter = "&publishedAfter=" + "1970-01-01T00:00:00Z";


	// https://www.googleapis.com/youtube/v3/search?part=snippet&q=radiohead+kid+a&key={YOUR_API_KEY}

  $.ajax({
    url: baseURL + apiKey + part + type + searchQuery + maxResults, // + videoEmbeddable,
    async: false,
    success: function(data) {
    	results = data.items;
    	foundVideoIds = [];
    	for (var i = 0; i < results.length; i++) {
    		foundVideoIds.push(results[i].id.videoId);
    	}
    	playSong(results[0].id.videoId); // play first returned song
    	fetchVideoData(foundVideoIds); // get more data for each video
    }
  });
}

//////////////////////////////////
// YouTube Video Info ////////////
//////////////////////////////////

function fetchVideoData(foundVideoIds){
	var videoIds = "&id=" + foundVideoIds.join();
	var apiKey = "key=" + "AIzaSyBZwPgx_XPordiPUIxzetxwy5CLwFZTb40";
	var baseURL = "https://www.googleapis.com/youtube/v3/videos?";
	var part = "&part=snippet,id,statistics,contentDetails"; // options: https://developers.google.com/youtube/v3/docs/videos

	$.ajax({
	  url: baseURL + apiKey + part + videoIds,
	  async: false,
	  success: function(data) {
	  	results = data.items;
	  	for (var i = 0; i < results.length; i++) {
	  		var video = {
	  			title: results[i].snippet.title,
	  			id: results[i].id,
	  			datePublished: results[i].snippet.publishedAt,
	  			thumbnail: results[i].snippet.thumbnails.medium.url,
	  			duration: results[i].contentDetails.duration, // PT4M15S
	  			viewCount: results[i].statistics.viewCount,
	  			likeCount: results[i].statistics.likeCount,
	  		}
		   addYtResult(video);
	  	}
	  }
	});
}

function addYtResult(video) {
	$searchResult = $('<li class="yt_search_result">');
	$searchResult.data("id", video.id);
	$searchResult.append('<div class="thumbnail" style="background: url(' + video.thumbnail + ') no-repeat center center; background-size: cover;">');
	$videoInfo = $('<div class="info">');
	$videoInfo.append('<h2>' + video.title + '</h2><h3>Date Published: ' + video.datePublished + '</h3><h3>Duration: ' + video.duration + '</h3><h3>View Count: ' + video.viewCount + '</h3><h3>Like Count: ' + video.likeCount + '</h3>');
	$searchResult.append($videoInfo);
	$('.yt_results').append($searchResult);
}

// <div class="thumbnail" style="background: url(<%= feed_item.video.thumbnail_medium %>) no-repeat center center; background-size: cover;">

//////////////////////////////////
// ARTIST RESULTS (EchoNest) /////
//////////////////////////////////

function artistSearch(query) {
	var apiKey = "KIUBY9CGMLEUODRPI";
	var searchType = "artist/";
  var baseURL = "http://developer.echonest.com/api/v4/";
  var searchQuery = "&name=" + query;
  var numResults = 10; // 1-100, 15 default
  var sort = "&sort=familiarity-desc";

  // http://developer.echonest.com/api/v4/artist/search?api_key=FILDTEOIK2HBORODV&name=radiohead

  $.ajax({
    url: baseURL + searchType + "search?api_key=" + apiKey + sort + searchQuery,
    async: false,
    success: function(data) {
    	artists = data.response.artists;
    	for (var i = 0; i < artists.length; i++) {
  	    addArtistResult(artists[i].name);
  	    console.log(artists[i].name);
    	}
    }
  });
}

function addArtistResult(name) {
	$searchResult = '<li><h2>' + name + '</h2></li>'
	$('.artist_results').append($searchResult);
}

//////////////////////////////////
// TRACK RESULTS (EchoNest) //////
//////////////////////////////////

function trackSearch(query) {
	var apiKey = "search?api_key=" + "KIUBY9CGMLEUODRPI";
	var baseURL = "http://developer.echonest.com/api/v4/";
	var searchType = "song/";
	var sort = "&sort=artist_familiarity-desc"; //artist_hotttnesss-desc, song_hotttnesss-desc, 
  var numResults = "&results=10"; // 1-100, 15 default
  var bucket = "&bucket=id:musicbrainz&bucket=tracks&bucket=audio_summary";
  var song_type = "&song_type=studio";
  var searchQuery = "&title=" + query; // title, artist, combined

  $.ajax({
    url: baseURL + searchType + apiKey + sort + numResults + song_type + bucket + searchQuery,
    async: false,
    success: function(data) {
    	tracks = data.response.songs;
    	for (var i = 0; i < tracks.length; i++) {
    		track = {
    			title: tracks[i].title,
    			artist: tracks[i].artist_name,
    			releaseDate: '',
    			duration: tracks[i].audio_summary.duration, // in seconds
    			song_id: tracks[i].id,
    			artist_id: tracks[i].artist_id
    		}
  	    addTrackResult(track);
    	}
    }
  });
}

function addTrackResult(track) {
	$searchResult = $('<li class="search_result">');
	$searchResult.append('<h2>' + track.title + '</h2><h3>' + track.artist + '</h3>');

	$searchResult.data("artist", track.artist);
	$searchResult.data("track", track.title);
	$searchResult.data("duration", track.duration);

	$('.track_results').append($searchResult);
}

//////////////////////////////////
// TRACK RESULTS (MusicBrainz) ///
//////////////////////////////////

function MbTrackSearch(query) {
	var baseURL = "http://musicbrainz.org/ws/2/";
	var searchType = "recording/"; // artist, release, release-group, recording, work, label (track is supported but maps to recording)
  var searchQuery = '?query=' + query;
  var numResults = "&limit=10"; // 1-100, 15 default

  // http://musicbrainz.org/ws/2/recording/?query=Fred

  $.ajax({
    url: baseURL + searchType + searchQuery + numResults + '&fmt=json',
    async: false,
    success: function(data) {
    	brainz = data;
    }
  });
}

//////////////////////////////////
// ALBUM RESULTS (MusicBrainz) ///
//////////////////////////////////

function albumSearch(query) {
	var baseURL = "http://musicbrainz.org/ws/2/";
	var searchType = "release/";
  var searchQuery = '?query=release:' + query;
  var numResults = "&limit=10"; // 1-100, 15 default

  // http://musicbrainz.org/ws/2/release/?query=release:Schneider

  $.ajax({
    url: baseURL + searchType + searchQuery + numResults + '&fmt=json',
    async: false,
    success: function(data) {
    	albums = data.releases;
    	for (var i = 0; i < albums.length; i++) {
    		var album = albums[i].title;
    		var artist = albums[i]["artist-credit"][0].artist.name;
  	    addAlbumResult(artist, album);
    	}
    }
  });
}

function addAlbumResult(artist, album) {
	$searchResult = '<li><h2>' + album + '</h2><h3>' + artist + '</h3></li>'
	$('.album_results').append($searchResult);
}




////////////////////////////////////////
// NOTES ///////////////////////////////
////////////////////////////////////////


//////////////////////////////////
// EchoNest API //////////////////


// Your API Key: KIUBY9CGMLEUODRPI 
// Your Consumer Key: bd7cefd215b52724e06d68089e5cc57e 
// Your Shared Secret: oK7csPitT5aWVL+ssZWrlQ

// CONS
// - no album search


//////////////////////////////////
// Musicbrainz API ///////////////

// Cons
// - cant sort results?


//////////////////////////////////
// YouTube Advanced Search ///////

// this OR that
// this|that -these
// this AND that
// this, that
// this -that
// this +that //forced word
// "this that"
// title:this
// intitle:this
// intitle:("this that")
// -intitle:("this that")
// * wild card word

// lyrics, live, cover, acoustic, "full album"
// "how to play", tutorial, lesson
// vevo, partner, official, music
// category: music


// intitle:("jack johnson bubble toes", -intitle:(lyrics), -intitle:(live), -intitle:(cover), -"how to play", -tutorial, vevo|partner|official|music, video