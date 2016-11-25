// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var opener = require('opener');
var childProcess = require("child_process");
var validUrl = require('valid-url');
var https = require('https');
var moment = require('moment');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 8888;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
var queue = [];

router.route('/music')

    .post(function(req, res) {
    	var messages = req.body.item.message.message;
        var err;
        var response;
        var code = messages.split(' ');

        switch(code[1]) {
            case 'help' :
                message = "Commands available are : ";
                message += "<ul>"+
                                "<li>"+
                                    "/music play https://www.youtube.com/watch?v=L0MK7qz13bU : or any valid link (spotify / deezer / youtube ...)"+
                                "</li>"+
                                "<li>"+
                                    "/music volume ++++ : Increase the volume"+
                                "</li>"+
                                "<li>"+
                                    "/music volume ---- : Secrease the volume"+
                                "</li>"+
                                "<li>"+
                                    "/music stop : Stop the current music"+
                                "</li>"+
                                "<li>"+
                                    "/music next : Skip the current music"+
                                "</li>"+
                                "<li>"+
                                    "/music frozen : Niek speical command : Will add frozen in the queue"+
                                "</li>"+
                            "</ul>";
                res.json({message_format : 'html', message : message});

                break;
            case 'mute' :
                childProcess.execFile('nircmd.exe', ['mutesysvolume', '1']);
                response = "Volume muted";
                break;
            case 'unmute' :
                childProcess.execFile('nircmd.exe', ['mutesysvolume', '0']);
                response = "Volume unmuted";
                break;
            case 'frozen' :
                addYoutubeQueue('L0MK7qz13bU');
                break;

            case 'volume':
                console.log('volumeup');

                var levels = code[2].split('');
                levels.forEach(function(level) {
                    if(level === '+') {
                        childProcess.execFile('nircmd.exe', ['mutesysvolume', '0']);
                        childProcess.execFile('nircmd.exe', ['changesysvolume', '5000']);
                    } else if(level === '-') {
                        childProcess.execFile('nircmd.exe', ['changesysvolume', '-5000']);
                    }

                    response = "Volume changed";
                });
                break;
            case 'play':
                console.log('play');

                if(code.length < 3) {
                    err = "Missing link";
                    break;
                }

                //TODO kill first until I find a way to put in a queue
                // childProcess.exec('Taskkill /IM chrome.exe /F');
                var link = code[2];

                if(validUrl.isUri(link)) {

                    //Check if it's youtube
                    if(link.includes('youtube')) {
                        console.log("YOUTUBE !");
                        var youtubeId = youtubeParser(link);
                        addYoutubeQueue(youtubeId);
                    } else {
                        //Just put 5 min for now as we don't know the duration
                        queue.push({'link' : link, 'duration' : 'PT5M0S'});
                    }

                    response = "Music added to the queue";
                } else {
                    err = "Invalid link";
                }

                break;

            case 'queue':
                message = "Music in queues : ";
                message += "<ul>";

                queue.forEach(function(music) {
                    message += "<li>" + music.link + "</li>";
                });
                                
                message += "</ul>";

                res.json({message_format : 'html', message : message});
                break;

            case 'next':
                childProcess.exec('Taskkill /IM chrome.exe /F');
                queue.shift();
                break;


            case 'stop':
                childProcess.exec('Taskkill /IM chrome.exe /F');
                response = "Bye bye !";
                queue = [];
                break;



        }

        if(err) {
            res.json({message: err, color : 'red'});
        } else {
            res.json({message:response});    
        }
    	

    });

    // .get(function(req, res) {

    //     console.log(queue);

    //     message = "Music in queues : ";
    //     message += "<ul>";

    //     queue.forEach(function(music) {
    //         message += "<li>" + music.link + "</li>";
    //     });
                        
    //     message += "</ul>";

    //     res.json({message_format : 'html', message : message});


    //     https.get('https://www.googleapis.com/youtube/v3/videos?id=WsptdUFthWI&part=contentDetails&key=AIzaSyD1qXsbtAbP6zRjKnfbr395bxfeXoHqw0U', (res) => {
    //       // console.log('statusCode:', res.statusCode);
    //       // console.log('headers:', res.headers);
    //       body = "";
    //       // console.log(res.data);
    //       res.on('data', (d) => {
    //         // console.log(JSON.parse)
    //         // console.log(d);
    //         body += d;
    //       });

    //       res.on('end', function() {
    //         // console.log(body);
    //         parsed = JSON.parse(body);
    //         queue.push({'link' : 'https://www.youtube.com/watch?v=WsptdUFthWI', 'duration' : parsed.items[0].contentDetails.duration});

    //       });

    //     }).on('error', (e) => {
    //       console.error(e);
    //     });

    //     // res.json({'message' : 'ok'});
    // });

    function addYoutubeQueue(youtubeId) {
        https.get('https://www.googleapis.com/youtube/v3/videos?id=' + youtubeId + '&part=contentDetails&key=AIzaSyD1qXsbtAbP6zRjKnfbr395bxfeXoHqw0U', (res) => {
          body = "";

          res.on('data', (d) => {
            body += d;
          });

          res.on('end', function() {
            parsed = JSON.parse(body);
            queue.push({'link' : 'https://www.youtube.com/watch?v=' + youtubeId, 'duration' : parsed.items[0].contentDetails.duration});

          });

        }).on('error', (e) => {
          console.error(e);
        });
    }

  

    function convertISO8601ToSeconds(input) {

        var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
        var hours = 0, minutes = 0, seconds = 0, totalseconds;

        if (reptms.test(input)) {
            var matches = reptms.exec(input);
            if (matches[1]) hours = Number(matches[1]);
            if (matches[2]) minutes = Number(matches[2]);
            if (matches[3]) seconds = Number(matches[3]);
            totalseconds = hours * 3600  + minutes * 60 + seconds;
        }

        return (totalseconds);
    }

    function youtubeParser(url){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        return (match&&match[7].length==11)? match[7] : false;
    }

    //Set interval will check we have to play a music
    setInterval(function() {

        if(queue.length == 0) {
            console.log('no music');
            return;
        }

        if(queue[0].endDate !== 'undefined' && queue[0].endDate) {
            if(moment().isAfter(queue[0].endDate)){
                childProcess.exec('Taskkill /IM chrome.exe /F');
                queue.shift();
            }

        } else {
            console.log('first time to play music');
            var browser = opener(queue[0].link);
            queue[0].endDate = moment().add(convertISO8601ToSeconds(queue[0].duration), 'seconds')
        }


    }, 5000);


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);