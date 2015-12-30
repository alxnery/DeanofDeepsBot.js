var Discord = require('discord.js');
var fs = require('fs');
var credentials = require('./auth.json');
var thebot = new Discord.Client();

thebot.on("ready", function(){
	console.log("Serving Replies Now!");
});

thebot.login(credentials.email, credentials.password);

thebot.on("message", function(message){
	if(message.content.charAt(0) === "!"){
		var params = new Object();
		params.tts = false;
		var argument = message.content.split(" ");
		switch(argument[0].toLowerCase()){
			case "!bot":
				defaultResponse(message, params);
				break;
			case "!hhelp":
				hhelp(message, params);
				break;
			case "!johnmadden":
				params.tts = true;
				johnmadden(message, params);
				break;
			case "!peen":
				params.tts = true;
				peenpoon(message, params);
				break;
			default:
				invalidparams(message, params);
		}
	}
	else if(message.content.charAt(0) === "p"){
		var params = new Object();
		params.tts = false;
		var argument = message.content.split(" ");
		 switch(argument[0].toLowerCase()){
		 	case "peen":
				peenpoon(message, params);
				break;
		 }
	}
});

function defaultResponse(message, params){
	thebot.sendTTSMessage(message.channel, "This bot barely works bro",params);
};

function hhelp(message, params){
	thebot.sendTTSMessage(message.channel,
		"Current functions are bot, hhelp, johnmadden, peen",params);
};

function invalidparams(message, params){
	thebot.sendTTSMessage(message.channel, "Parameters are invalid",params);
};

function johnmadden(message, params){
	thebot.sendTTSMessage(message.channel,
	 "johnmadden johnmadden johnmadden johnmadden",params);
};

function peenpoon(message, params){
	thebot.sendTTSMessage(message.channel, "poon!",params);
};

function sendTTSMessage(destination, message,params){
	if(params.tts == true)
	thebot.sendMessage(destination, message, {"tts": "true"});
	else
	thebot.sendMessage(destination, message);
};
