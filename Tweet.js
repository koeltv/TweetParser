const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

let Tweet = function(
	coordinates, created_at, hashtags, media,
	urls, favourite_count, id, in_reply_to_screen_name, in_reply_to_status_id,
	in_reply_to_user_id, lang, place, possibly_sensitive, retweet_count, retweet_id,
	retweet_screen_name, source, text, tweet_url, user_created_at, user_screen_name1,
	user_default_profile_image, user_description, user_favourites_count,
	user_followers_count, user_friends_count, user_listed_count, user_location,
	user_name, user_screen_name2, user_statuses_count, user_time_zone, user_urls,
	user_verified
){
	this.coordinates = coordinates.split(/,/);
	this.created_at = created_at;
	this.hashtags = hashtags.toLowerCase().split(/ /);
	this.media = media;
	this.urls = urls;
	this.favourite_count = favourite_count;
	this.id = id;
	this.in_reply_to_screen_name = in_reply_to_screen_name;
	this.in_reply_to_status_id = in_reply_to_status_id;
	this.in_reply_to_user_id = in_reply_to_user_id;
	this.lang = lang;
	this.place = place;
	this.possibly_sensitive = possibly_sensitive;
	this.retweet_count = retweet_count;
	this.retweet_id = retweet_id;
	this.retweet_screen_name = retweet_screen_name;
	this.source = source;
	this.text = text;
	this.tweet_url = tweet_url;
	this.user_created_at = user_created_at;
	this.user_screen_name = user_screen_name1;
	this.user_default_profile_image = user_default_profile_image;
	this.user_description = user_description;
	this.user_favourites_count = user_favourites_count;
	this.user_followers_count = user_followers_count;
	this.user_friends_count = user_friends_count;
	this.user_listed_count = user_listed_count;
	this.user_location = user_location;
	this.user_name = user_name;
	this.user_screen_name2 = user_screen_name2;
	this.user_statuses_count = user_statuses_count;
	this.user_time_zone = user_time_zone;
	this.user_urls = user_urls;
	this.user_verified = user_verified;

}

Tweet.prototype.getTop10RTInfo = function(){
	return {"author" : this.user_name+"                                               "+this.id, "RT":parseInt(this.retweet_count), "content": entities.decode(this.text.substring(0,120)) +"..."};
}

Tweet.prototype.informationsAuteur = function(){
	return (this.user_location !== '' && this.user_urls !== '' && this.user_description !== '')
}

Tweet.prototype.getAuthorDescriptionLength = function(){
	return this.user_description.length;
}

Tweet.prototype.getAuthorInfos = function(){
	return {"text": (this.user_location+","+this.user_urls+":"+this.user_description).substring(0,130)+"...", "author": this.user_name +"                                                 "+this.id, "desc": this.getAuthorDescriptionLength()}
}

Tweet.prototype.correspondanceTweetAuteur  = function(nomAuteur){
	return (nomAuteur === this.user_name);
}

Tweet.prototype.correspondanceTweetHashtag = function(hashtag){
	return (this.hashtags.includes(hashtag));
}

Tweet.prototype.correspondanceTweetDate = function(date){
	return (this.created_at === date);
}

Tweet.prototype.correspondanceTweetPeriode = function(dateMin, dateMax){
	return (this.getDate() >= dateMin && this.getDate() <= dateMax);
}

Tweet.prototype.correspondanceTweetNbRT = function(nbRT){
	return nbRT === this.retweet_count;
}

Tweet.prototype.correspondanceTweetPays = function(pays){
	return pays === this.user_location;
}

Tweet.prototype.getTweetNbRT =function(){
	return this.retweet_count;
}

Tweet.prototype.getTweetLocalisation =function(){
	return this.coordinates;
}

Tweet.prototype.getDate =function(){
	return new Date(this.created_at);
}

Tweet.prototype.getTweetText = function (){
	return this.text;
}

Tweet.prototype.getAuteurLocalisation = function (){
	return this.user_location;
}

Tweet.prototype.getAuteurNom = function(){
	return this.user_name;
}

Tweet.prototype.getAuteurSiteWeb = function(){
	return this.user_urls;
}

Tweet.prototype.getAuteurDescription = function(){
	return this.user_description;
}

Tweet.prototype.getHashtags = function(){
	return this.hashtags;
}

module.exports = Tweet;
