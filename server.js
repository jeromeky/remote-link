// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var opener = require('opener');
var childProcess = require("child_process");


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

        var message = messages.split(' ');
        console.log(message);

        var link = message[1];

        console.log(link);


        // childProcess.exec('Taskkill /IM chrome.exe /F');
    	random = "yeah";

    	// var test = open(req.query.link, function (err, success) {
    	//   if (err) throw err;
    	//   // console.log(success);
    	//   console.log('The user closed the browser');
    	// });
    	// console.log(test);
// taskkill /F /IM iexplore.exe
    	

    	var browser = opener(link);
    	// console.log(browser);

    	res.json({'test':'test'});

    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);