match.js

//////////////////////////////////
// YouTube Search ////////////////
//////////////////////////////////

function searchYouTube(artist, track, originalDuration) {
	var include = "intitle:("+artist+' '+track+")";
	//var exclude = " -intitle:live -intitle:cover -intitle:acoustic -intitle:remix";
	//var lesson =  " -intitle:tutorial -intitle:lesson -intitle:learn -intitle:'how to play' ";

	// lyrics, live, cover, acoustic, "full album", remix
	// "how to play", tutorial, lesson, learn

	var baseURL = "https://www.googleapis.com/youtube/v3/search?";
	var apiKey = "key=" + "AIzaSyBZwPgx_XPordiPUIxzetxwy5CLwFZTb40";
	var part = "&part=snippet,id"; // options: https://developers.google.com/youtube/v3/docs/videos
	var type = "&type=video";
	var videoEmbeddable = "&videoEmbeddable=true";
	var category = '&videoCategoryId=10';
	var searchQuery = "&q=" + include; //+ exclude + lesson;
	var order = "&order=relevance"; // relevance(default), date, rating, title, videoCount, viewCount
	var maxResults = "&maxResults=10"; // 0-50

	//var topicId = "&topicId=";
  //var publishedAfter = "&publishedAfter=" + "1970-01-01T00:00:00Z";


	// https://www.googleapis.com/youtube/v3/search?part=snippet&q=radiohead+kid+a&key={YOUR_API_KEY}

  $.ajax({
    url: baseURL + apiKey + part + type + category + videoEmbeddable + searchQuery + order + maxResults,
    async: false,
    success: function(data) {
    	results = data.items;
    	foundVideoIds = [];
    	for (var i = 0; i < results.length; i++) {
    		foundVideoIds.push(results[i].id.videoId);
    	}
    	fetchYouTubeData(foundVideoIds, originalDuration); // get more data for each video
    }
  });
}


//////////////////////////////////
// YouTube Video Info ////////////
//////////////////////////////////

// grab more information about each video for each yt search result

function fetchYouTubeData(foundVideoIds, originalDuration){
	var durationTolerance = 30; // secs
	YouTubeResults = [];

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
	  		var duration = results[i].contentDetails.duration; // PT4M15S
	  		var video = {
	  			title: results[i].snippet.title,
	  			id: results[i].id,
	  			datePublished: results[i].snippet.publishedAt,
	  			thumbnail: results[i].snippet.thumbnails.medium.url,
	  			categoryId: results[i].snippet.categoryId, // 10 = music
	  			duration: convertDuration(duration), 
	  			viewCount: results[i].statistics.viewCount,
	  			likeCount: results[i].statistics.likeCount,
	  			matchScore: 0
	  		}
	  		if ( isBetween(originalDuration, video.duration, durationTolerance) ) {
	  		}
	  		YouTubeResults.push(video);
	  		addYtResult(video);
	  	}
	  	playSong(YouTubeResults[0].id); // play first returned song
	  	matchScore(YouTubeResults, originalDuration);
	  }
	});
}

function matchScore(YouTubeResults, originalDuration) {
	// get max/min values
	maxViewCount = getMax(YouTubeResults, "viewCount");
	maxLikeCount = getMax(YouTubeResults, "likeCount");
	maxDuration  = getMax(YouTubeResults, "duration");

	// Set multiplier weights
	w_resultsOrder           = 10; // gives weight to the original order of YouTube search results (1=first result, 0=last result)
	w_views    		           = 10; // View Count (1=highest num views, 0=lowest)
	w_likes    		           = 10; // Like Count (1=highest num likes, 0=lowest)
	w_duration 		           = 10; // durations close to target get rewarded more (1=exact match, 0=highest over)
	durationPenaltyThreshold = 10; // durations under target still count positively toward score until this ammount under (seconds)
	w_durationPenalty        = 10; // score is affected negatively by being too far under target (1= 0 duration,  0=same as target)
	
	w_badWord = 10;
	w_goodWord = 10;


	// formula: decimal (0-1) * weight

	console.log("///////////////////");
	console.log("begin YT SEARCH Analysis");
	console.log(" ");

	// Iterate over videos found
	for (var i = 0; i < YouTubeResults.length; i++) {
		console.log("Result #" + (i+1));
		console.log(YouTubeResults[i].title);

		YouTubeResults[i].matchScore = 0;
		// order
		YouTubeResults[i].matchScore += ((YouTubeResults.length-i)/YouTubeResults.length) * w_resultsOrder;
		console.log("Result Order: +" + ((YouTubeResults.length-i)/YouTubeResults.length) * w_resultsOrder);
		// views
		YouTubeResults[i].matchScore += YouTubeResults[i].viewCount/maxViewCount * w_views;
		console.log("Views: +" + YouTubeResults[i].viewCount/maxViewCount * w_views);
		// likes
		YouTubeResults[i].matchScore += YouTubeResults[i].likeCount/maxLikeCount * w_likes;
		console.log("Likes: +" + YouTubeResults[i].likeCount/maxLikeCount * w_likes);
		// duration
		var timeDifference = YouTubeResults[i].duration-originalDuration;
		console.log("Original Duration: " + originalDuration);
		console.log("Video Duration: " + YouTubeResults[i].duration);
		console.log("Difference: " + timeDifference);
		if (timeDifference > 0 || Math.abs(timeDifference) < durationPenaltyThreshold) {
			// reward for being close to original duration
			YouTubeResults[i].matchScore += (1-( timeDifference / (maxDuration - originalDuration) ) ) * w_duration;
			console.log("Longer: +" + (1-( timeDifference / (maxDuration - originalDuration) ) ) * w_duration);
		} else {
			// penalty for being under original duration
			YouTubeResults[i].matchScore -= (1-(YouTubeResults[i].duration/originalDuration)) * w_durationPenalty;
			console.log("Shorter: -" + (1-(YouTubeResults[i].duration/originalDuration)) * w_durationPenalty);
		}

		// Title Rewards
		var title = YouTubeResults[i].title;
		regex_good = /vevo|official|high quality|HQ/ig;
		regex_bad = /live|acoustic|cover|remix|full album|tutorial|how to play/ig;

		if (regex_bad.test(title)) {
			YouTubeResults[i].matchScore -= w_badWord;
			console.log("bad word detected -10");
		}

		if (regex_good.test(title)) {
			YouTubeResults[i].matchScore += w_goodWord;
			console.log("bad word detected +10");
		}

		// console output
		console.log("matchScore: " + YouTubeResults[i].matchScore);
		console.log(" ");
	}
}

function getMax(array, attribute) {
	var max = 0;
	var tmp;
	for (var i = 0; i < array.length; i++) {
		tmp = Number(array[i][attribute]);
		if (tmp > max) {
			max = tmp;
		}
	}
	return max;
}

// tests if video duration is close to a target value +- a tolerance (in secs)
function isBetween(duration, target, tolerance) {  // tolerance in secs
	var min = target - tolerance;
	var max = target + tolerance;
	if ( duration >= min && duration <= max ) {
		return true;
	} else {
		return false;
	}
}

// * //
function addYtResult(video) {
	$searchResult = $('<li class="yt_search_result">');
	$searchResult.data("id", video.id);
	$searchResult.append('<div class="thumbnail" style="background: url(' + video.thumbnail + ') no-repeat center center; background-size: cover;">');
	$videoInfo = $('<div class="info">');
	$videoInfo.append('<h2>' + video.title + '</h2><h3>Date Published: ' + video.datePublished + '</h3><h3>Duration: ' + video.duration + '</h3><h3>View Count: ' + video.viewCount + '</h3><h3>Like Count: ' + video.likeCount + '</h3><h3>Category ID: ' + video.categoryId + '</h3>');
	$searchResult.append($videoInfo);
	$searchResult.prepend('<div class="match">BEST MATCH!!!</div>');
	$('.yt_results').append($searchResult);
}

// <div class="thumbnail" style="background: url(<%= feed_item.video.thumbnail_medium %>) no-repeat center center; background-size: cover;">


// convert duration from PTMS -> seconds

function convertDuration(input) {
	var regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
	var hours = 0, minutes = 0, seconds = 0, totalseconds;
	if (regex.test(input)) {
	  var matches = regex.exec(input);
	  if (matches[1]) hours = Number(matches[1]);
	  if (matches[2]) minutes = Number(matches[2]);
	  if (matches[3]) seconds = Number(matches[3]);
	  totalseconds = hours * 3600  + minutes * 60 + seconds;
	}
	return totalseconds;
}
