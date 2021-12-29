const fs = require('fs');
require('colors');
const TweetParser = require('./TweetParser.js');

const vega = require('vega');
const vegaLite = require('vega-lite');
require('canvas');
const cli = require("@caporal/core").default;

cli
	.version('tweet-parser-cli')
	.version('1.0')
	//Check command
	.command('check', 'Check if <file> is a valid tweet csv file')
	.argument('<file>', 'The file to check with Tweet parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		readDirectory(args.file, 0, analyzer => {
			logger.info("Ce fichier de tweet .csv est valide".green);
			logger.debug(analyzer.parsedTweet);
		},() => {}, options.showTokenize, options.showSymbols)
	})
	//Readme command
	.command('readme', 'Display the README.md file')
	.action(({logger}) => {
		fs.readFile("./README.md", 'utf8', function(error, data){
			if(error) return logger.warn(error);
			logger.info(data);
		});
	})

	// TOP 10 retweet
	.command('mostRetweeted', 'Displays the top 10 tweet that has been most retweeted for a hashtag')
	.alias('mr')
	.argument('<file>', 'The csv file to use')
	.argument('<hashtag>', 'The chosen hashtag')
	.option('-p, --png', 'Output the map in png rather than svg', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		let vegaData = [], result;
		logger.info("Création du graphique...".green);
		readDirectory(args.file, 0, analyzer => {
			//Parsing et filtrage du hashtag
			result = analyzer.parsedTweet.filter(function(tweet){
				return tweet.hashtags.includes(args.hashtag.toLowerCase());
			});
			//Tri des plus retweetés
			result.sort((a, b) => {
				return (a.retweet_count < b.retweet_count) ? 1 :((b.retweet_count < a.retweet_count) ? -1 : 0 );
			});
		}, () => {
			//Préparation des données à envoyer à vega-lite
			let listLength = (result.length > 10) ? 10 : result.length;

			for(let i = 0 ; i < listLength ; i++) vegaData.push(result[i].getTop10RTInfo());

			makeGraph("10PlusRetweete", options.png, {
				title: "Top 10 plus retweetés avec le hashtag " + args.hashtag,
				width: 720,
				height: {step: 40},
				data: {values: vegaData},
				encoding: {
					y: {
						field: "author",
						type: "nominal",
						sort: {field: "RT"},
						title: "Auteurs"
					}
				},
				layer: [
					{
						mark: {type: "bar", color: "#ddd"},
						encoding: {
							x: {
								field: "RT",
								title: "Nombre de RT",
								aggregate: "average"
							}
						}
					}, {
						mark: {type: "text", align: "left", x: 5},
						encoding: {text: {field: "content"}}
					}
				]
			})
		});
	})

	// TOP 10 Auteurs de tweet
	.command('mostCompleteAuthors', 'Displays the top 10 author with the most information about them')
	.alias('mca')
	.argument('<file>', 'The csv file to use')
	.option('-p, --png', 'Output the map in png rather than svg', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		let vegaData = [], result;
		logger.info("Création du graphique...".green);
		readDirectory(args.file, 0, analyzer => {
			//Parsing et filtrage des auteurs qui ont tout remplis
			result = analyzer.parsedTweet.filter(function(tweet){
				return tweet.informationsAuteur();
			});
			//Tri en fonction de la longueur de la description
			result.sort((a, b) => {
				return (a.getAuthorDescriptionLength() < b.getAuthorDescriptionLength()) ? 1 :((b.getAuthorDescriptionLength() < a.getAuthorDescriptionLength()) ? -1 : 0 );
			});
		}, () => {
			//Préparation des données à envoyer à vega-lite
			let listLength = (result.length > 10) ? 10 : result.length;

			for(let i = 0 ; i < listLength ; i++) vegaData.push(result[i].getAuthorInfos());

			makeGraph("10AuteursLesPlusComplets", options.png, {
				title: "Top 10 des auteurs ",
				width: 720,
				height: {step: 40},
				data: {values: vegaData},
				encoding: {
					y: {
						field: "author",
						type: "nominal",
						sort: {field: "-desc"},
						title: "Auteurs"
					}
				},
				layer: [
					{
						mark: {type: "bar", color: "#ddd"},
						encoding: {
							x: {
								field: "desc",
								title: "Longueur de la description",
								aggregate: "average"
							}
						}
					}, {
						mark: {type: "text", align: "left", x: 5},
						encoding: {text: {field: "text"}}
					}
				]
			})
		});

	})

	.command('associatedHashtags', 'List hashtags associated to a reference hashtag')
	.alias('assohashs')
	.argument('<file>', 'The file to scan for associated hashtags')
	.argument('<hashtag>', 'The reference hashtag')
	.option('-p, --png', 'Output the map in png rather than svg', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		if (typeof args.hashtag !== "string") return logger.warn("hashtag non valide, veuillez recommencer");
		logger.info("Création du graphique...".green);
		let vegaLiteData = [], count = 0;
		readDirectory(args.file, 0, (analyzer) =>{
			analyzer.parsedTweet.forEach(tweet => {
				if (tweet.hashtags.includes(args.hashtag)){
					tweet.hashtags.forEach(hashtag => {
						if (hashtag !== args.hashtag){
							let index = vegaLiteData.findIndex(element => {
								return element.hashtag === "#" + hashtag;
							});
							if (index === -1) vegaLiteData.push({hashtag: "#" + hashtag, quantite: 1});
							else vegaLiteData[index].quantite++;
							count++;
						}
					});
				}
			});
		}, () => {
			vegaLiteData.forEach(value => value.quantite = Math.round((value.quantite / count) * 10000) / 100);
			makeGraph("listeDesHashtags", options.png, {
				title: "Hashtags associées à #" + args.hashtag,
				data: {values: vegaLiteData},
				encoding: {
					y: {field: "hashtag", type: "nominal", title: "", sort: "-x"},
					x: {field: "quantite", aggregate: "sum", title: "Pourcentage"}
				},
				layer: [{
					mark: "bar",
				}, {
					mark: {
						type: "text",
						align: "left",
						baseline: "middle",
						dx: 3
					},
					encoding: {text: {field: "quantite", type: "quantitative"}}
				}]
			});
		});
	})

	.command('tweetInWorld', 'Visualize proportion of tweets per region of the world')
	.alias('tiw')
	.argument('<file>', 'The file to scan for tweets')
	.option('-p, --png', 'Output the map in png rather than svg', { validator: cli.BOOLEAN, default: false })
	.option('-u, --albersUsa', 'Change the projection to albersUsa', { validator: cli.BOOLEAN, default: false })
	.option('-r, --roundedMap', 'Change the projection to equalEarth', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		let vegaLiteData = [];
		logger.info("Création du graphique...".green);
		readDirectory(args.file, 0, analyzer => {
			analyzer.parsedTweet.forEach(tweet => {
				if (tweet.coordinates[0] !== "") {
					let index = vegaLiteData.findIndex(element => {
						//Si distance = sqrt((x1-x2)²+(y1-y2)²) <= 1
						return Math.sqrt(Math.pow(+tweet.coordinates[0] - element.longitude, 2) + Math.pow(+tweet.coordinates[1] - element.latitude, 2)) <= 1;
					});
					if (index === -1) vegaLiteData.push({longitude: +tweet.coordinates[0], latitude: +tweet.coordinates[1], size: 1});
					else vegaLiteData[index].size++;
				}
			});
		}, () => {
			let projection = "mercator";
			if (options.albersUsa) projection = "albersUsa";
			else if (options.roundedMap) projection = "equalEarth";
			makeGraph("carteDesTweets", options.png, {
				width: 1000,
				height: 600,
				layer: [{
					data: {
						url: "data/countries-110m.json",
						format: {type: "topojson", feature: "countries"}
					},
					projection: {type: projection},
					mark: {
						type: "geoshape",
						fill: "mintcream",
						stroke: "black",
						strokeWidth: 0.35
					}
				}, {
					data: {values: vegaLiteData},
					projection: {type: projection},
					mark: "circle",
					encoding: {
						longitude: {field: "longitude", type: "quantitative"},
						latitude: {field: "latitude", type: "quantitative"},
						size: {field: "size", type: "quantitative", title: "Nombre de tweets"},
						color: {value: "red"}
					}
				}
				]
			})
		})
	})

	//filtre en fonction des entrées de l'utilisateur
	.command('filter', 'liste des tweets contenants les mots-clés entrés')
	.argument('<file>','The file to scan to associate keyword')
	.option('-n,--name <name>', 'filter data by username', {  default: "don't exist"})
	.option('-a,--hashtags <hashtags>','filter data by the hashtag references', {  default: "don't exist"})
	.option('-d,--date <date>','filter data by the date', { default: "don't exist" })
	.option('-r,--nbrt <nbrt>','filter data by the number of retweet', {  default: "don't exist" })
	.option('-s,--superieur','filter data if data is superior to the reference', { validator: cli.BOOLEAN, default: false })
	.option('-i,--inferieur','filter data if data is inferior to the reference', { validator: cli.BOOLEAN, default: false })
	.option('-e,--equal','filter data if data is inferior to the reference', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		let listTweet = [];
		if(options.date !== "don't exist"){
			let regexDate = "^(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(\\/|-|\\.)(?:0?[13-9]|1[0-2])\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)0?2\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$";
			if(!options.date.toString().match(regexDate)) return logger.error("Veuillez modifier la date, elle n'est pas conforme");
		}
		logger.info("Application du filtre...".green);
		readDirectory(args.file, 0, analyzer => {
			if (options.name !== "don't exist") {
				analyzer.parsedTweet.forEach(tweet => {
					if (options.name === tweet.user_screen_name) listTweet.push(tweet);
				})
			}
			else if (options.hashtags !== "don't exist") {
				let filtered = analyzer.parsedTweet.filter(tweet => {
					return tweet.correspondanceTweetHashtag(options.hashtags.toString().toLowerCase());
				});
				listTweet.push.apply(listTweet, filtered);
			}

			//compare with number of retweet
			else if (options.nbrt !== "don't exist") {
				if (options.superieur) {
					let filtered = analyzer.parsedTweet.filter(tweet => {
						return tweet.retweet_count > options.nbrt;
					});
					listTweet.push.apply(listTweet, filtered);
				}
				if (options.inferieur) {
					let filtered = analyzer.parsedTweet.filter(tweet => {
						return tweet.retweet_count<options.nbrt;
					});
					listTweet.push.apply(listTweet, filtered);
				}
				if (options.equal) {
					let filtered = analyzer.parsedTweet.filter(tweet => {
						return tweet.retweet_count===options.nbrt
					});
					listTweet.push.apply(listTweet, filtered);
				}
			}

			//compare date
			else if (options.date !== "don't exist") {
				let date = new Date(convertFrDateToEn(options.date));
				if (options.equal){
					let filtered = analyzer.parsedTweet.filter(tweet => {return (tweet.getDate().getFullYear() === date.getFullYear()) && tweet.getDate().getMonth() === date.getMonth() && tweet.getDate().getDate() === date.getDate()});
					listTweet.push.apply(listTweet, filtered);
				}
				if (options.superieur){
					let filtered = analyzer.parsedTweet.filter(tweet => {
						if (tweet.getDate().getFullYear() > date.getFullYear()) return true;
						else if (tweet.getDate().getFullYear() < date.getFullYear()) return false;
						//else it means that the years are equal
						else {
							if (tweet.getDate().getMonth() > date.getMonth()) return true;
							else if	(tweet.getDate().getMonth() < date.getMonth()) return false;
							//else it means that the months are equals
							else {
								if (tweet.getDate().getDate() > date.getDate()) return true;
								return tweet.getDate().getDate() >= date.getDate();
							}
						}
					})
					listTweet.push.apply(listTweet, filtered);
				}
				if (options.inferieur) {
					let filtered = analyzer.parsedTweet.filter(tweet => {
						if (tweet.getDate().getFullYear() < date.getFullYear()) return true;
						else if (tweet.getDate().getFullYear() > date.getFullYear()) return false;
						//else it means that the years are equal
						else {
							if (tweet.getDate().getMonth() < date.getMonth()) return true;
							else if	(tweet.getDate().getMonth() > date.getMonth()) return false;
							//else it means that the months are equals
							else{
								if (tweet.getDate().getDate() < date.getDate()) return true;
								else return tweet.getDate().getDate() <= date.getDate();
							}
						}
					})
					listTweet.push.apply(listTweet, filtered);}}
		}, () => {
			if(listTweet.length !== 0){
				listTweet.forEach(tweet => console.log(
					"ID: " + tweet.id + "\n" +
					"URI: " + tweet.url + "\n" +
					"Auteur: " + tweet.user_name + "\n" +
					"Description: " + tweet.user_description + "\n" +
					"Date: " + convertFrDateToEn(dateToString(tweet.getDate())) + "\n" +
					"Texte: " + tweet.text + "\n" +
					"Nombre de retweet: " + tweet.retweet_count + "\n" +
					"Hashtags: " + tweet.hashtags + "\n")
				)
			} else logger.info("Aucun résultat ne correspond au critère".red);
		})
	})

	.command('numberOfHashtags', 'View the number of tweets for a given hashtag over a period of time')
	.alias('noh')
	.argument('<file>', 'The file to scan for tweets')
	.argument('<hashtag>', 'The hashtag used')
	.argument('<periodBegin>', 'The beginning of the period')
	.argument('<periodEnd>', 'The end of the period')
	.option('-p, --png', 'Output the graph in png rather than svg', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		let regexDate = "^(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(\\/|-|\\.)(?:0?[13-9]|1[0-2])\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)0?2\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$";
		if(!args.periodBegin.toString().match(regexDate) || !args.periodEnd.toString().match(regexDate)) logger.error("Veuillez modifier vos dates, elles ne sont pas conformes");
		else {
			logger.info("Création du graphique...".green);
			let nbTweets = new Map();
			let dateMin = new Date(convertFrDateToEn(args.periodBegin));
			let dateMax = new Date(convertFrDateToEn(args.periodEnd));
			readDirectory(args.file, 0, analyzer => {
				analyzer.parsedTweet.forEach(tweet => {
					if (tweet.correspondanceTweetPeriode(dateMin, dateMax)){
						if(tweet.correspondanceTweetHashtag(args.hashtag.toLowerCase())){
							if(nbTweets.get(convertFrDateToEn(dateToString(tweet.getDate()))) === undefined){
								nbTweets.set(convertFrDateToEn(dateToString(tweet.getDate())), 1);
							} else {
								nbTweets.set(convertFrDateToEn(dateToString(tweet.getDate())), nbTweets.get(convertFrDateToEn(dateToString(tweet.getDate()))) + 1);
							}
						}
					}
				});
			}, () => {
				let vegaData = getNumberOfHashtagsInfo(nbTweets);
				makeGraph("nombreDeHashtagsDansPeriode", options.png, {
					title: "Nombre de hashtags " + args.hashtag + " entre " + args.periodBegin + " - " + args.periodEnd,
					width: 500,
					height: 300,
					data: {values: vegaData},
					mark: "bar",
					encoding: {
						x: {field: "date", axis: {labelAngle: 0}, title: "Date"},
						y: {field: "numberHashtags", aggregate: "average", title: "Nombre de hashtags"}
					},
				})
			})
		}
	})

cli.run(process.argv.slice(2));

let count = 0;

/**
 * Read a complete directory of "csv" files
 * Applying "toUseThroughFile" on each file and "toUseAfter" when finished
 * @param directory
 * @param depth
 * @param toUseThroughFile
 * @param toUseAfter
 * @param showTokenize
 * @param showSymbols
 */
function readDirectory(directory, depth, toUseThroughFile, toUseAfter, showTokenize, showSymbols) {
	if (directory.match(/(.*\/)*.+\.csv/)) {
		count++;
		fs.readFile(directory, 'utf8', (err, data) => {
			if (err) console.log(`${err}`.red);
			else {
				let analyzer = new TweetParser(showTokenize, showSymbols);
				analyzer.parse(data);
				if (analyzer.errorCount === 0) toUseThroughFile(analyzer);
				else console.log("Le fichier de tweet .csv contient des erreurs".red);
			} count--;
		});
	} else fs.readdirSync(directory).forEach(file => readDirectory(directory + '/' + file, depth+1, toUseThroughFile, toUseAfter, showTokenize, showSymbols));
	if (depth === 0) waitForCompletion(toUseAfter);
}

/**
 * Wait for every instance of fs.readFile() to finish
 * @param useWhenComplete
 */
function waitForCompletion(useWhenComplete){
	if (count !== 0) {
		setTimeout(() => waitForCompletion(useWhenComplete), 50);
		return;
	} useWhenComplete();
}

/**
 * Generate a Vega Lite graph named "filename"
 * @param filename
 * @param mode
 * @param graph
 */
function makeGraph(filename, mode, graph){
	const myChart = vegaLite.compile(graph).spec;
	let runtime = vega.parse(myChart);
	if (!mode) {
		let view = new vega.View(runtime).renderer('svg').run();
		view.toSVG().then(image => {
			fs.writeFileSync("./output/" + filename + ".svg", image)
			view.finalize();
			console.log("Emplacement du graphique : ".green + ("./" + filename + ".svg").red);
		});
	} else {
		let view = new vega.View(runtime).renderer('canvas').run();
		view.toCanvas().then(image => {
			fs.writeFileSync("./output/" + filename + ".png", image.toBuffer());
			view.finalize();
			console.log("Emplacement du graphique : ".green + ("./" + filename + ".png").red);
		})
	}
}

/**
 * Convert a French date to an English date
 * This function can also convert an english date to a French date
 * @param date
 * @returns {string}, the new date
 */
function convertFrDateToEn(date){
	return date.split("/").reverse().join("/");
}

function dateToString (date) {
	let mm = date.getMonth() + 1; // getMonth() is zero-based
	let dd = date.getDate();

	return [date.getFullYear(),
		'/',
		(mm>9 ? '' : '0') + mm,
		'/',
		(dd>9 ? '' : '0') + dd
	].join('');
}

/**
 * Convert a map into an array of object
 * The array of object will be used for the graphic generation
 * @param map
 * @returns {[]}, the array which contains our objects ready for the graph
 */
function getNumberOfHashtagsInfo (map){
	let tab = [];
	map.forEach((value, key) => tab.push({"date": key, "numberHashtags": value}));
	return tab;
}
