// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var opener = require('opener');
var childProcess = require("child_process");


var port = process.env.PORT || 8888;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
var random = "123";

router.route('/spotify')

    .get(function(req, res) {
    	console.log(req.query.link);
        childProcess.exec('Taskkill /IM chrome.exe /F');
    	random = "yeah";

    	// var test = open(req.query.link, function (err, success) {
    	//   if (err) throw err;
    	//   // console.log(success);
    	//   console.log('The user closed the browser');
    	// });
    	// console.log(test);
// taskkill /F /IM iexplore.exe
    	

    	var browser = opener('https://open.spotify.com/track/6fujklziTHa8uoM5OQSfIo');
    	// console.log(browser);

    	res.json({'test':'test'});

    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);