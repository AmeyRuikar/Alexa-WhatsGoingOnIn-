/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 * User: "what's going on in {usc|word} area"
 * Alexa: "Try Blaze on figeuroa, or catch NFL match at LA coliseum or try a sub at whichwhich"
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HelloWorld onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HelloWorld onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Alexa Skills Kit, you can say hello";
    var repromptText = "You can say hello";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    // register custom intent handlers
    "HelloWorldIntent": function (intent, session, response) {

        const https = require('https');
        var getUrl = 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyD3PRRjN1TXyhtE3M8nTf66NNWjGNrtIGA&new_forward_geocoder=false&address='+intent.slots.word.value+'%20area';

        https.get(getUrl, (res) => {
          //console.log('statusCode:', res.statusCode);
          //console.log('headers:', res.headers);

	data = '';
        res.on('data', function(chunk){
  		data += chunk.toString();
	});

	res.on('end', function(){

		var obj = JSON.parse(data);

		if(obj['status'].toString() == "ZERO_RESULTS"){
		    response.tell("Couldn't geocode the place, try again");
		}

		var lat = obj['results'][0]['geometry']['location']['lat'].toString();
		var lng = obj['results'][0]['geometry']['location']['lng'].toString();
		process.stdout.write(lat);
		process.stdout.write(lng);
		//response.tell(lat);

		var http = require('http');
        var url = "http://meetup-server-150406.appspot.com/adsense?x="+lat+"&y="+lng;

        http.get(url, function(res) {
                    console.log("Got response: " + res.statusCode);
        		    //res.setEncoding('utf8')
          		    //res.on('data', console.log)
          		    var eventsData = "";
          		    res.on('data', function(chunk){
          		        eventsData+=chunk;

          		    });
          		    res.on('end', function(){
          		        var event = JSON.parse(eventsData);
          		        if(event[0] == ''){
          		             response.tell("Couldn't find any events in this area");
          		        }
          		        say = '';
          		        for(var i = 0; i< event.length; i++){
          		            if(i==0){
          		                say+= event[0];
          		            }
          		            if(i==1){
          		                say += " or "+event[1];
          		            }
          		            if(i==2){
          		                say += " here's the last one "+event[2];
          		            }
          		        }
          		        response.tell(say);

          		    });

                   // requestCallback(null);
                   //response.tell("big wave");
        }).on('error', function (e) {
                    console.log("Got error: ", e);
        });


	});

    }).on('error', (e) => {
          console.error(e);
    });


        var sayThis = '';
        /*
        for(var i = intent.slots.word.value.length -1 ;i >=0 ;i--){
            sayThis += intent.slots.word.value[i];
        }
        */

        //http.request(options, callback).end();

        //response.tell(sayThis);

    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say hello to me!", "You can say hello to me!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    helloWorld.execute(event, context);
};
