var keys = require('./keys');
var twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');
var trackname = '';
var movieTitle = '';
var command; 
var filename='';
var commandText ='';
var cmdList= ['my-tweets', 'spotify-this-song', 'movie-this','do-what-it-says'];

//BONUS: 
logCmd();
console.log(`
Check log.txt for more example commands. 
Commands: 'my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'.`);

if (process.argv[2]){
    command = process.argv[2];
} else {
    //console.log(`You can type in commands such as: 'my-tweets', 'spotify-this-song', 'movie-this', or 'do-what-it-says'`);
}
checkCmd();

function checkCmd(){
    if (command === "my-tweets"){
        myTweets();
    } else if (command === 'spotify-this-song'){
        spotifySong();
    } else if (command === 'movie-this'){
        movie();
    } else if (command === 'do-what-it-says'){
        doWhatItSays();
    }
}

function myTweets(){
    var params = {screen_name: 'mellyn23p'};
    var client = new twitter({
        consumer_key: keys.twitterKeys.consumer_key,
        consumer_secret: keys.twitterKeys.consumer_secret,
        access_token_key: keys.twitterKeys.access_token_key,
        access_token_secret: keys.twitterKeys.access_token_secret,
    });
    //console.log(client);
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
            for (var i = 0; i < tweets.length; i++){
            console.log(`
            Tweet ${i+1}: ${tweets[i].text}
            ==========================================================`);}
        } else{console.log(error);}
    });   
}

function spotifySong(){
    if (process.argv[3]){
        trackname = '';
        for (var i = 3; i < process.argv.length; i++){
            trackname += (process.argv[i] + ' ');      
        } 
        songSearch();
    } else {
        inquirer.prompt({
            name: 'song', 
            message: 'Do you want to pick a song? (y/n)'
        }).then(function(ans){
            if (ans.song === 'y'){
                inquirer.prompt({
                    name: 'trackname', 
                    message: 'Enter the name of the song:'
                }).then(function(ans){
                    trackname = ans.trackname;
                    songSearch();
                });
            } else if (ans.song === 'n'){
                aceofbase();
            }
            
        });
    }
    
}

function songSearch(){
    spotifyPara = {type : 'track', query : trackname};
    spotify.search(spotifyPara, function(error, data){
        if(!error){
            //console.log("Artists: " + JSON.stringify(mostRelevantResult.artists.map(function(currentItem) {return currentItem.name;})));
            var mostRelevantResult = data.tracks.items.find(function(item) {
                return item.name.toLowerCase() == trackname.toLowerCase();
            });
            if(!mostRelevantResult) {
                mostRelevantResult = data.tracks.items[0];
            }
            console.log(`
            Song name: ${mostRelevantResult.name}
            Artists: ${mostRelevantResult.artists[0].name}
            Album: ${mostRelevantResult.album.name}
            Preview link: ${mostRelevantResult.external_urls.spotify}`);
        } else if (error){
            console.log(error);
            return;
        }
    });
}

function aceofbase(){
    trackname = "The Sign";
    var artist = "Ace of Base";
    spotifyPara = {type : 'track', query : trackname};
    spotify.search(spotifyPara, function(error, data){
        if(!error){
            var mostRelevantResult = data.tracks.items.find(function(item) {
                return item.name.toLowerCase() == trackname.toLowerCase();
            });

            if(!mostRelevantResult) {
                 mostRelevantResult = data.tracks.items[0];
            }
            console.log(`
            Song name: ${mostRelevantResult.name}
            Artists: ${mostRelevantResult.artists[0].name}
            Album: ${mostRelevantResult.album.name}
            Preview link: ${mostRelevantResult.external_urls.spotify}`);
        } else if (error){
            console.log(error);
            return;
        }
    });
}

function movie(){
    if (process.argv[3]){
        movieTitle = '';
        for (var i = 3; i < process.argv.length; i++){
            movieTitle += (process.argv[i] + ' ');      
        } 
        OMDBrequest();
    } else {
        if (movieTitle !== ''){
            OMDBrequest();
        } else{
            inquirer.prompt({
                name: 'search',
                message: 'Do you want to search for a specific movie?(y/n)'
            }).then(function(ans){
                if (ans.search === 'y'){
                    inquirer.prompt({
                        name: 'title',
                        message: 'What is the title of the movie you are searching for?'
                    }).then(function(ans){
                        movieTitle = ans.title;
                        OMDBrequest();
                    });
                } else if (ans.search === 'n'){
                    movieTitle = "Mr. Nobody";
                    OMDBrequest();
                }
            });
        }
    }
}

function OMDBrequest(){
   request(`http://www.omdbapi.com/?t=${movieTitle}`, function (error, response, body) {
        if (error){
            console.log('error:', error); 
        } else if (!error){
            var searchResult = JSON.parse(body);
            var RTRating, website;
            if (!searchResult.Ratings){
                RTRating = "none";
            } else {
                RTRating = searchResult.Ratings[1].Value;
            }
            if (!searchResult.Website){
                website = "none";
            } else {
                website = searchResult.Website;
            }
            console.log(`
            Movie title: ${searchResult.Title}
            Year: ${searchResult.Year}
            IMDB Rating: ${searchResult.imdbRating}
            Country: ${searchResult.Country}
            Language: ${searchResult.Language}
            Plot: ${searchResult.Plot}
            Actors: ${searchResult.Actors}
            Rotten Tomatoes Rating: ${RTRating}
            URL: ${website}`);
        }
    });
}

function doWhatItSays(){
    inquirer.prompt({
        name: 'filename',
        message: 'Please enter the file name (randomMovie.txt/randomSong.txt):'
    }).then(function(ans){
        filename = ans.filename;
        fs.readFile(filename, "utf8", function(error, data) {
            //console.log(data);
            var dataArr = data.split(",");
            cmd = dataArr[0];
            name = dataArr[1];
            for (var i=0; i<cmdList.length; i++){
                if (cmd === cmdList[i]){
                    command = '';
                    command = cmd;
                }
            }
            if (command === 'spotify-this-song'){
                    trackname = name;
                    songSearch();
            } else if (command === 'movie-this'){
                    movieTitle = name;
                    OMDBrequest();
            }
        });
    });
}

function logCmd(){
    if (process.argv[2]){
        commandText = '';
        for (var i = 2; i < process.argv.length; i++){
            commandText += (process.argv[i] + ' ');       
        }
        commandText += ", ";
        fs.appendFile('log.txt', commandText, function(err){
            if (!err){
                //console.log(`Command added: ${commandText}`);
            } else {
                console.log(err);
            }
        });
    }
}