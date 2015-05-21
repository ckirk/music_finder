// interact.js
// all user interaction

$(document).ready(function(){

	// prevent search form from submitting
	$('.no_submit').submit(false);

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
	  var originalDuration = $(this).data('duration');
	  query = { artist: artist,
	  					track: track,
	  					duration: originalDuration
	  };
	  searchYouTube(artist, track, originalDuration);
	});

	// Play selected YT video from YT search results
	$(document).on('click', '.yt_search_result', function(){
	  var videoId = $(this).data('id');
    //$('.yt_search_result').removeClass('bestMatch');
    //$(this).addClass('bestMatch');

    // toggle between 3 states (match, notMatch, blank)
    // if not tagged
    if (!$(this).hasClass('match') && !$(this).hasClass('notMatch')) {
    	playSong(videoId);
    	$(this).addClass('match');

    	// store match in YouTubeResults
    	var resultOrder = $(this).data('object').resultOrder;
    	YouTubeResults[resultOrder - 1].match = true;

    // if tagged match
    } else if ($(this).hasClass('match')) {
    	$(this).removeClass('match');
    	$(this).addClass('notMatch');

    	// store notMatch in YouTubeResults
    	var resultOrder = $(this).data('object').resultOrder;
    	YouTubeResults[resultOrder - 1].match = false;

    // if tagged not match
    } else if ($(this).hasClass('notMatch')) {
    	$(this).removeClass('notMatch');

    	// store notMatch in YouTubeResults
    	var resultOrder = $(this).data('object').resultOrder;
    	YouTubeResults[resultOrder - 1].match = undefined;
    }
	});

	// Submit training set to backend
	$(document).on('click', '#submitButton', function(){
		// send ajax request to rails backend
		var trainingSet = [query, YouTubeResults];
		$.ajax({
	    url: "/queries",
	    type: "POST",
	    //dataType: 'json',
	    //contentType: 'application/json',
	    data: {'trainingSet': JSON.stringify(trainingSet)},
	    //{ query: { query: "Chris", duration: 666 } },
	    success: function(data) {
	    	//alert(data);
	    	alert("success!");
	    	console.log(data);
	    	console.log(JSON.stringify(trainingSet));
	    },
	    error: function( jqXhr, textStatus, errorThrown ) {
	      //console.log( errorThrown );
	      alert("error");
	    }
		});
	});

});

// Play a song (video)
function playSong(videoId) {
	$('#yt_player').remove();
	$player = $('<div id="yt_player">');
	$player.html('<iframe width="600" height="337" src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" frameborder="0" allowfullscreen></iframe>');
	$('#right').prepend($player);
}

// Add a YouTube Search Result
function addYtResult(video) {
	$searchResult = $('<li class="yt_search_result no_select">');
	$searchResult.data("id", video.id);
	$searchResult.data("object", video);
	$searchResult.append('<div class="thumbnail" style="background: url(' + video.thumbnail + ') no-repeat center center; background-size: cover;">');
	$videoInfo = $('<div class="info">');
	$videoInfo.append('<h2>' + video.title + '</h2><h3>Date Published: ' + video.datePublished + '</h3><h3>Duration: ' + video.duration + '</h3><h3>View Count: ' + video.viewCount + '</h3><h3>Like Count: ' + video.likeCount + '</h3><h3>Category ID: ' + video.categoryId + '</h3>');
	$searchResult.append($videoInfo);
	//$searchResult.prepend('<div class="match">BEST MATCH!!!</div>');
	$('.yt_results').append($searchResult);
}

// <div class="thumbnail" style="background: url(<%= feed_item.video.thumbnail_medium %>) no-repeat center center; background-size: cover;">

