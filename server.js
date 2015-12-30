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
	if(params.tts == false)
	thebot.sendMessage(message.channel, "This bot barely works bro");
	else
	thebot.sendTTSMessage(message.channel, "This bot barely works bro");
};

function hhelp(message, params){
	if(params.tts == false)
	thebot.sendMessage(message.channel, 
		"Current functions are bot, hhelp, johnmadden, peen");
	else
	thebot.sendTTSMessage(message.channel,
		"Current functions are bot, hhelp, johnmadden, peen");
};

function invalidparams(message, params){
	if(params.tts == false)
	thebot.sendMessage(message.channel, "Parameters are invalid");
	else
	thebot.sendTTSMessage(message.channel, "Parameters are invalid");
};

function johnmadden(message, params){
	if(params.tts == false)
	thebot.sendMessage(message.channel,
	 "johnmadden johnmadden johnmadden johnmadden");
	else
	thebot.sendTTSMessage(message.channel,
	 "johnmadden johnmadden johnmadden johnmadden");
};

function peenpoon(message, params){
	if(params.tts == false)
	thebot.sendMessage(message.channel,
		"poon!");
	else
	thebot.sendTTSMessage(message.channel, "poon!");
};

function sendTTSMessage(destination, message){
	thebot.sendMessage(destination, message, {"tts": "true"});
};
