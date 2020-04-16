var request = require('request');
var Twit = require('twit');
var fs = require('fs');
var path = require('path');
var configs = require('./configs');

var TwitterApi = new Twit(configs);
var currentTemp;
var minimumTemp;
var maximumTemp;
var weatherDescription;
var windSpeed;
var url = configs.apiLink + configs.city + configs.appID[0] + configs.appID[1] + configs.units[0] + configs.units[1];

function GetData(){
request({ url:url, json:true }, function (error, response, body){
if(!error && response.statusCode === 200){
currentTemp = body.main.temp;
    minimumTemp = body.main.temp_min;
    maximumTemp = body.main.temp_max;
    humidity = body.main.humidity;
    windSpeed = body.wind.speed;
    weatherDescription = body.weather[0].description;
    	
    	CleanData();

} else {
console.log("Error triggered inside of the GetData function.");
    console.log(error);
  }
})
}
function CleanData(){
currentTemp = currentTemp.toFixed(0);
minimumTemp = minimumTemp.toFixed(0);
maximumTemp = maximumTemp.toFixed(0);
windSpeed   = ConvertMetersPerSecondToKmPerHour(windSpeed);
	TweetWeather()
}

function ConvertMetersPerSecondToKmPerHour(speed){
return (speed * 3.6).toFixed(0);
}

function TweetWeather(){
var weatherUpdate = "Right now "+ configs.city +" is experiencing " + weatherDescription + " at " + currentTemp + "°C." + "\n" +"Minimum temperature of the day is at " + minimumTemp + "°C " + "while maximum at " + maximumTemp + "°C with " + humidity + "% Humidity" + " & " + ConvertMetersPerSecondToKmPerHour(windSpeed) + "Km/h Wind. \n#"+configs.city
var tweet = {
    status: weatherUpdate
  }
TwitterApi.post('statuses/update',tweet, callback);
function callback(error){
    if(error){
      console.log(error);
    } else {
      console.log("Tweeted successfully: \n" + weatherUpdate);
    }
  }
}

function automatedPictureTweet(){
	var tweet={
		status:'This is a new  automated tweet'+'with a furry love ball!Enjoy <3 ...'
	}
	TwitterApi.post('statuses/update',tweet,tweeted);
	function tweeted(err,data,response){
		if (err) {
			console.log("Something went wrong!");
		}else{
			console.log("It works fine !");
		}
	}
}
function random_from_array(images){
  return images[Math.floor(Math.random() * images.length)];
}

function upload_random_image(images){
  console.log('Opening an image...');
  var image_path = path.join(__dirname, '/images/' + random_from_array(images)),
      b64content = fs.readFileSync(image_path, { encoding: 'base64' });

  console.log('Uploading an image...');

  TwitterApi.post('media/upload', { media_data: b64content }, function (err, data, response) {
    if (err){
      console.log('ERROR:');
      console.log(err);
    }
    else{
      console.log('Image uploaded!');
      console.log('Now tweeting it...');

      TwitterApi.post('statuses/update', {
        media_ids: new Array(data.media_id_string)
      },
        function(err, data, response) {
          if (err){
            console.log('ERROR:');
            console.log(err);
          }
          else{
            console.log('Posted an image!');
          }
        }
      );
    }
  });
}

fs.readdir(__dirname + '/images', function(err, files) {
  if (err){
    console.log(err);
  }
  else{
    var images = [];
    files.forEach(function(f) {
      images.push(f);
    });

    setInterval(function(){
      upload_random_image(images);
    }, 1000*60*60);
  }
});



//automatedPictureTweet();

setInterval(GetData,1000*60*60*24);