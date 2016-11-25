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
var random = "123";

router.route('/music')

    .post(function(req, res) {
    	var messages = req.body.item.message.message;
        var err;
        var code = messages.split(' ');
        console.log(code);
        switch(code[1]) {
            case 'mute' :
                console.log('mute');
                childProcess.execFile('nircmd.exe', ['mutesysvolume', '1']);
                break;
            case 'unmute' :
                console.log('unmute');
                childProcess.execFile('nircmd.exe', ['mutesysvolume', '0']);
                break;
            case 'volume':
                console.log('volumeup');

                var levels = code[2].split('');
                levels.forEach(function(level) {
                    if(level === '+') {
                        childProcess.execFile('nircmd.exe', ['changesysvolume', '5000']);
                        console.log('volume up');
                    } else if(level === '-') {
                        childProcess.execFile('nircmd.exe', ['changesysvolume', '-5000']);
                        console.log('volume down');
                    }
                });
                break;
            case 'play':
                console.log('play');

                //TODO kill first until I find a way to put in a queue
                childProcess.exec('Taskkill /IM chrome.exe /F');
                var link = code[2];

                if(validUrl.isUri(link)) {
                    var browser = opener(link);
                } else {
                    err = "Invalid link";
                }

                break;
            case 'stop':
                console.log('stop');
                childProcess.exec('Taskkill /IM chrome.exe /F');
                break;


        }

//         var message = messages.split(' ');
//         console.log(message);

//         var link = message[1];

//         console.log(link);


//         // childProcess.exec('Taskkill /IM chrome.exe /F');
//     	random = "yeah";

//     	// var test = open(req.query.link, function (err, success) {
//     	//   if (err) throw err;
//     	//   // console.log(success);
//     	//   console.log('The user closed the browser');
//     	// });
//     	// console.log(test);
// // taskkill /F /IM iexplore.exe

//         childProcess.execFile('nircmd.exe', ['mutesysvolume', '0'], function (err, data){
//             console.log(err)
//             console.log(data.toString());    
//         });
    	

//     	// var browser = opener(link);
//     	// console.log(browser);

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