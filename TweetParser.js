let Tweet = require('./Tweet');

let TweetParser = function(sTokenize, sParsedSymb){
	// The list of Tweet parsed from the input file.
	this.parsedTweet = [];
	this.symb = ["\r", "\n", ","];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// parse : analyze data by calling the first non-terminal rule of the grammar
TweetParser.prototype.parse = function(data){
	let tData = this.tokenize(data);
	if(this.showTokenize) console.log(tData);
	this.listTweet(tData);
}

// tokenize : transform the data input into a list
TweetParser.prototype.tokenize = function(data){
	let separator = /[\r\n,]/;
	data = data.split(separator);
	data = data.filter(val => !val.match(separator));
	return data;
}

// Parser operand

TweetParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on " + input + " -- msg : " + msg + "\n");
}

// Read and return a symbol from input
TweetParser.prototype.next = function(input){
	let curS = input.shift();
	if(this.showParsedSymbols) console.log(curS);
	return curS;
}

// accept : verify if the arg s is part of the language symbols.
TweetParser.prototype.accept = function(s){
	let idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+ s +" unknown\n", [" "]);
		return false;
	}
	return idx;
}

// check : check whether the arg elt is on the head of the list
TweetParser.prototype.check = function(s, input){
	return this.accept(input[0]) === this.accept(s);
}

// expect : expect the next symbol to be s.
TweetParser.prototype.expect = function(s, input){
	if(s === this.next(input)){
		//console.log("Recognized! " + s);
		return true;
	} else this.errMsg("symbol "+ s +" doesn't match", input);
	return false;
}

// Parser rules

// FichierTweet = Entete CRLF *(Tweet CRLF)
TweetParser.prototype.listTweet = function(input){
	this.header(input);
	this.tweet(input);
}

// Entete = 'coordinates,created_at,hashtags,media,urls,favourite_count,id,in_reply_to_screen_name,in_reply_to_status_id,in_reply_to_user_id,lang,place,possibly_sensitive,retweet_count,retweet_id,retweet_screen_name,source,text,tweet_url,user_created_at,user_screen_name,user_default_profile_image,user_description,user_favourites_count,user_followers_count,user_friends_count,user_listed_count,user_location,user_name,user_screen_name,user_statuses_count,user_time_zone,user_urls,user_verified'
TweetParser.prototype.header = function(input) {
	this.expect("coordinates", input);
	this.expect("created_at", input);
	this.expect("hashtags", input);
	this.expect("media", input);
	this.expect("urls", input);
	this.expect("favorite_count", input);
	this.expect("id", input);
	this.expect("in_reply_to_screen_name", input);
	this.expect("in_reply_to_status_id", input);
	this.expect("in_reply_to_user_id", input);
	this.expect("lang", input);
	this.expect("place", input);
	this.expect("possibly_sensitive", input);
	this.expect("retweet_count", input);
	this.expect("retweet_id", input);
	this.expect("retweet_screen_name", input);
	this.expect("source", input);
	this.expect("text", input);
	this.expect("tweet_url", input);
	this.expect("user_created_at", input);
	this.expect("user_screen_name", input);
	this.expect("user_default_profile_image", input);
	this.expect("user_description", input);
	this.expect("user_favourites_count", input);
	this.expect("user_followers_count", input);
	this.expect("user_friends_count", input);
	this.expect("user_listed_count", input);
	this.expect("user_location", input);
	this.expect("user_name", input);
	this.expect("user_screen_name", input);
	this.expect("user_statuses_count", input);
	this.expect("user_time_zone", input);
	this.expect("user_urls", input);
	this.expect("user_verified", input);
}

// Tweet = body CRLF
TweetParser.prototype.tweet = function(input){
	let arguments = this.body(input);
	let t = new Tweet(
		arguments.coords,
		arguments.crAt,
		arguments.htags,
		arguments.med,
		arguments.urls,
		arguments.favCount,
		arguments.iD,
		arguments.inRepToScreenName,
		arguments.inRepToStatusId,
		arguments.inRepToUserId,
		arguments.lan,
		arguments.place,
		arguments.posSensitive,
		arguments.rtCount,
		arguments.rtId,
		arguments.rtScreenName,
		arguments.src,
		arguments.txt,
		arguments.twtUrl,
		arguments.userCreatAt,
		arguments.userScreenName1,
		arguments.userDftProfileImage,
		arguments.userDesc,
		arguments.userFavsCount,
		arguments.userFollowCount,
		arguments.userFrCount,
		arguments.userLsCount,
		arguments.userLoc,
		arguments.userNm,
		arguments.userScreenName2,
		arguments.userStCount,
		arguments.userTZ,
		arguments.userUrl,
		arguments.userVerif,
	);
	this.parsedTweet.push(t);
	if(input.length > 0) this.tweet(input);
	return true;
}

// body = coordinates ‘,’ created_at ‘,’ hashtags ‘,’ media ‘,’ urls ‘,’ favourite_count ‘,’ id‘,’in_reply_to_screen_name‘,’in_reply_to_status_id‘,’in_reply_to_user_id‘,’lang‘,’place‘,’possibly_sensitive‘,’retweet_count‘,’retweet_id‘,’Version 2.3                                                                   13
// retweet_screen_name‘,’source‘,’text‘,’tweet_url‘,’user_created_at‘,’user_screen_name‘,’user_default_profile_image‘,’user_description‘,’user_favourites_count‘,’user_followers_count‘,’user_friends_count‘,’user_listed_count‘,’user_location‘,’user_name’,user_screen_name’user_statuses_count‘,’user_time_zone‘,’user_urls ‘,’ user_verified
TweetParser.prototype.body = function(input){
	return {
		coords: this.coordinates(input),
		crAt: this.createdAt(input),
		htags: this.hashtags(input),
		med: this.media(input),
		url: this.urls(input),
		favCount: this.favoriteCount(input),
		iD: this.id(input),
		inRepToScreenName: this.inReplyToScreenName(input),
		inRepToStatusId: this.inReplyToStatusId(input),
		inRepToUserId: this.inReplyToUserId(input),
		lan: this.lang(input),
		place: this.place(input),
		posSensitive: this.possiblySensitive(input),
		rtCount: this.retweetCount(input),
		rtId: this.retweetId(input),
		rtScreenName: this.retweetScreenName(input),
		src: this.source(input),
		txt: this.text(input),
		twtUrl: this.tweetUrl(input),
		userCreatAt: this.userCreatedAt(input),
		userScreenName1: this.userScreenName(input),
		userDftProfileImage: this.userDefaultProfileImage(input),
		userDesc: this.userDescription(input),
		userFavsCount: this.userFavouritesCount(input),
		userFollowCount: this.userFollowersCount(input),
		userFrCount: this.userFriendsCount(input),
		userLsCount: this.userListedCount(input),
		userLoc: this.userLocation(input),
		userNm: this.userName(input),
		userScreenName2: this.userScreenName(input),
		userStCount: this.userStatusesCount(input),
		userTZ: this.userTimeZone(input),
		userUrl: this.userUrls (input),
		userVerif: this.userVerified(input)
	}
}

let matched;

//coordinates = *1(coordinate ‘,’ coordinate), coordinate = 0*1’-’ 1*DIGIT.1*DIGIT
TweetParser.prototype.coordinates = function(input){
	let coordinates = "";
	let curS = this.next(input);
	if((matched = curS.match(/("-?\d+\.\d+)?/))){
		coordinates += matched[0];
		if (matched[0] !== "") {
			curS = this.next(input);
			if ((matched = curS.match(/(-?\d+\.\d+)"/))) coordinates += "," + matched[0];
			coordinates = coordinates.split(/"/);
			coordinates = coordinates[1];
		}
		return coordinates;
	} else this.errMsg("Invalid coordinates\n", input);
}

//created_at = timestamp
TweetParser.prototype.createdAt = function(input){
	return this.timestamp(input);
}

//hashtags = *(1*VCHAR WSP)
TweetParser.prototype.hashtags = function(input){
	let curS = this.next(input);
	if((matched = curS.match(/(\w+ ?)*/))){
		return matched[0];
	} else this.errMsg("Invalid hashtags\n", input);
}

//favourite_count = 1*DIGIT
TweetParser.prototype.favoriteCount = function(input){
	let curS = this.next(input);
	if((matched = curS.match(/\d+/))){
		return matched[0];
	} else this.errMsg("Invalid favouriteCount\n", input);
}

//id = 1*DIGIT
TweetParser.prototype.id = function(input){
	let curS = this.next(input);
	if((matched = curS.match(/\d+/))){
		return matched[0];
	} else this.errMsg("Invalid id\n", input);
}

//in_reply_to_screen_name = *1NomUtilisateur
TweetParser.prototype.inReplyToScreenName = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/(.+)?/))){
		return matched[0];
	} else this.errMsg("Invalid inReplyToScreenName\n");
}

//in_reply_to_status_id = *DIGIT
TweetParser.prototype.inReplyToStatusId = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\d*/))){
		return matched[0];
	} else this.errMsg("Invalid inReplyToStatusId\n", input);
}

//in_reply_to_user_id = *DIGIT
TweetParser.prototype.inReplyToUserId = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\d*/))){
		return matched[0];
	} else this.errMsg("Invalid inReplyToUserId\n", input);
}

//lang = 2[a-z] / ‘und’ ; und correspond à undefined
TweetParser.prototype.lang = function (input){
	let lang = "";
	let curS = this.next(input);
	if((matched = curS.match(/.*/))) lang += matched[0];
	return this.readText(input , lang);
}

//place = 1*ALPHA’,’ 1*ALPHA
TweetParser.prototype.place = function (input){
	let place = "";
	let curS = this.next(input);
	if((matched = curS.match(/"(RT @\w+)?.+/))) place += matched[0];
	return this.readText(input, place);
}

//possibly_sensitive = *1boolean
TweetParser.prototype.possiblySensitive = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/((true)|(false)|(TRUE)|(FALSE))?/))){
		return matched[0];
	} else this.errMsg("Invalid possiblySensitive\n", input);
}

//retweet_count = 1*DIGIT
TweetParser.prototype.retweetCount = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\w+/))){
		return matched[0];
	} else this.errMsg("Invalid retweetCount\n", input);
}

//retweet_id = *DIGIT
TweetParser.prototype.retweetId = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\w*/))){
		return matched[0];
	} else this.errMsg("Invalid retweetId\n", input);
}

//retweet_screen_name = *1NomUtilisateur
TweetParser.prototype.retweetScreenName = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/(\w+)?/))){
		return matched[0];
	} else this.errMsg("Invalid retweetScreenName\n", input);
}

//source = ‘<a href= “ ‘ urls ‘ “ rel="nofollow”>’ 1*VCHAR ‘</a>’
TweetParser.prototype.source = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/"<a href=""https?:\/\/.+"" rel=""nofollow"">.*<\/a>"/))){
		return matched[0];
	} else this.errMsg("Invalid source\n", input);
}

//Text = *1(‘RT @’ NomUtilisateur’) 1*VCHAR
TweetParser.prototype.text = function (input){
	let text = "";
	let curS = this.next(input);
	if((matched = curS.match(/.+/))) text += matched[0];
	return this.readText(input, text);
}

//tweet_url = media
TweetParser.prototype.tweetUrl = function (input){
	return this.media(input);
}

//media = *('https://twitter.com/' NomUtilisateur '/status/' 1*DIGIT ‘photo/’ DIGIT)
TweetParser.prototype.media = function(input){
	let curS = this.next(input);
	if((matched = curS.match(/(https:\/\/twitter\.com\/\w*\/status\/[0-9]*)*/))){
		return matched[0];
	} else this.errMsg("Invalid media\n", input);
}

//user_created_at = timestamp
TweetParser.prototype.userCreatedAt = function (input){
	return this.timestamp(input);
}

//user_screen_name = *1NomUtilisateur
TweetParser.prototype.userScreenName = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/(\w+)?/))){
		return matched[0];
	} else this.errMsg("Invalid userScreenName\n", input);
}

//user_default_profile_image = boolean
TweetParser.prototype.userDefaultProfileImage = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/(true)|(false)/))){
		return matched[0];
	} else this.errMsg("Invalid userDefaultProfileImage\n", input);
}

//user_description = *VCHAR
TweetParser.prototype.userDescription = function (input){
	let userDescription = "";
	let curS = this.next(input);
	if((matched = curS.match(/.*/))) userDescription += matched[0];
	return this.readText(input , userDescription);
}

//user_followers_count =1*DIGIT
TweetParser.prototype.userFollowersCount = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\d+/))){
		return matched[0];
	} else this.errMsg("Invalid userFollowersCount\n", input);
}

//user_friends_count = 1*DIGIT
TweetParser.prototype.userFriendsCount = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\d+/))){
		return matched[0];
	} else this.errMsg("Invalid userFriendsCount\n", input);
}

//user_favourites_count = 1*DIGIT
TweetParser.prototype.userFavouritesCount = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\d+/))){
		return matched[0];
	} else this.errMsg("Invalid userFavouritesCount\n", input);
}

//user_listed_count = 1*DIGIT
TweetParser.prototype.userListedCount = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\d+/))){
		return matched[0];
	} else this.errMsg("Invalid userListedCount\n", input);
}

// user_location = *VCHAR
TweetParser.prototype.userLocation = function (input){
	let userLocation = "";
	let curS = this.next(input);
	if((matched = curS.match(/.*/))) userLocation += matched[0];
	return this.readText(input , userLocation);
}

//user_name = *VCHAR
TweetParser.prototype.userName = function (input){
	let userName = "";
	let curS = this.next(input);
	if((matched = curS.match(/.*/))) userName += matched[0];
	return this.readText(input , userName);
}

//user_statuses_count = 1*DIGIT
TweetParser.prototype.userStatusesCount = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\d+/))){
		return matched[0];
	} else this.errMsg("Invalid userStatusesCount\n", input);
}

//user_time_zone = *DIGIT
TweetParser.prototype.userTimeZone = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/\d*/))){
		return matched[0];
	} else this.errMsg("Invalid userTimeZone\n", input);
}

//user_urls = urls
TweetParser.prototype.userUrls = function (input){
	return this.urls(input);
}

//urls = 'http' *1's' ':// 1*(VCHAR)
TweetParser.prototype.urls = function(input){
	let curS = this.next(input);
	if((matched = curS.match(/(https?:\/\/.+)*/))){
		return matched[0];
	} else this.errMsg("Invalid urls\n", input);
}

//user_verified = boolean
TweetParser.prototype.userVerified = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/(true)|(false)/))){
		return matched[0];
	} else this.errMsg("Invalid userVerified\n", input);
}

//timestamp = day WSP month WSP day_number WSP time WSP time_zone WSP year
TweetParser.prototype.timestamp = function (input){
	let curS = this.next(input);
	if((matched = curS.match(/((Mon)|(Tue)|(Wed)|(Thu)|(Fri)|(Sat)|(Sun)) ((Jan)|(Feb)|(Mar)|(Apr)|(May)|(Jun)|(Jul)|(Aug)|(Sep)|(Oct)|(Nov)|(Dec)) ([0-3][0-9]) (\d{0,2}(:\d{0,5}){2}) (((\+)|-)\d{4}) \d{4}/))){
		return matched[0];
	} else this.errMsg("Invalid timestamp\n", input);
}

//readText() can read any text, even segmented if it start and end by "
TweetParser.prototype.readText = function (input, text) {
	// console.log("text: " + text + "\n");
	while(text !== "" && text.match(/^".*/) && !text.match(/^".*(([^"]")|([^"]"""))$/)){
		let curS = this.next(input);
		if((matched = curS.match(/.+/))) text += "," + matched[0];
		// console.log("text: " + text + "\n");
	} return text;
}

module.exports = TweetParser;
