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


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 8888;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
var queue = "123";

router.route('/music')

    .post(function(req, res) {
    	var messages = req.body.item.message.message;
        var err;
        var response;
        var code = messages.split(' ');
        console.log(code);
        switch(code[1]) {
            case 'help' :
                message = "Commands available are : ";
                message += "<ul>"+
                                "<li>"+
                                    "/music play https://www.youtube.com/watch?v=L0MK7qz13bU : or any link with music on it (spotify / deezer / youtube ...)"+
                                "</li>"+
                                "<li>"+
                                    "/music volume ++++ : Will increase volume"+
                                "</li>"+
                                "<li>"+
                                    "/music volume ---- : Will decrease volume"+
                                "</li>"+
                                "<li>"+
                                    "/music stop : Will stop the current music"+
                                "</li>"+
                            "</ul>";
                res.json({message_format : 'html', message : message});

                break;
            case 'mute' :
                childProcess.execFile('nircmd.exe', ['mutesysvolume', '1']);
                message = "Volume muted";
                break;
            case 'unmute' :
                childProcess.execFile('nircmd.exe', ['mutesysvolume', '0']);
                message = "Volume unmuted";
                break;
            case 'volume':
                console.log('volumeup');

                var levels = code[2].split('');
                levels.forEach(function(level) {
                    if(level === '+') {
                        childProcess.execFile('nircmd.exe', ['changesysvolume', '5000']);
                    } else if(level === '-') {
                        childProcess.execFile('nircmd.exe', ['changesysvolume', '-5000']);
                    }

                    message = "Volume changed";
                });
                break;
            case 'play':
                console.log('play');

                if(code.length < 3) {
                    err = "Missing link";
                    break;
                }

                //TODO kill first until I find a way to put in a queue
                childProcess.exec('Taskkill /IM chrome.exe /F');
                var link = code[2];

                if(validUrl.isUri(link)) {
                    var browser = opener(link);
                    message = "Music played";
                } else {
                    err = "Invalid link";
                }

                break;
            case 'stop':
                childProcess.exec('Taskkill /IM chrome.exe /F');
                message = "Bye bye !";
                break;


        }

        if(err) {
            res.json({message: err, color : 'red'});
        } else {
            res.json({message:'test'});    
        }
    	

    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);