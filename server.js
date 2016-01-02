var Discord = require('discord.js');
var fs = require('fs');
var credentials = require('./auth.json');
var simpleres = require('./simpleResponses.json');
var thebot = new Discord.Client();
//var commands = require('./commands.js');

//add query methods for wolfram, google, yahoo

thebot.on("ready", function(){
	console.log("Serving Replies Now!");
});

thebot.login(credentials.email, credentials.password);

thebot.on("message", function(message){

	if( (message.author.id != thebot.user.id) && 
				message.content.startsWith("!") ){

		//possible command
		var args = message.content.split(" ")[0].toLowerCase();

		//check for oneliner Response real fast
		var keys = Object.keys(simpleres.items),
			len = keys.length,i=0,
			found = false, value;

		while(i<len && found == false){
			value = simpleres.items[keys[i]];
			if(value.Event === args){
				found = true;
					if(value.tts === "true")
						thebot.sendTTSMessage(message.channel, value.MessageContent); 
					else
						thebot.sendMessage(message.channel, value.MessageContent);
			}
			i+=1; 
		} //if found end loop
		//if not in the dynamic response, check system methods
		//later to be swapped for an import of a module with function list and
		//function pointers.
		if(!found){
			switch(args){
			case "!hhelp":
				hhelp(message);
				break;
			default:
				invalidparams(message);
			}
		}
	}

	//search for peen no matter what
	else{
		var argument = message.content.split(" "), rc = false;
		for(var i = 0; i< argument.length && rc == false; i++){
		 switch(argument[i].toLowerCase()){
		 	case "peen":
				thebot.sendMessage(message.channel, "poon!");
				rc = true
				break;
		 }
		}
	}
});

function hhelp(message){
	var response = [],keys = Object.keys(simpleres.items),
			len = keys.length,i=0,value;
	response.push("Current functions are !hhelp");
	while(i<len){
		value = simpleres.items[keys[i]];
		response.push(", ");
		response.push(value.Event);
		i+=1;
	}
	response.push(".");
	var sb = response.join("");
	thebot.sendMessage(message.channel, sb);
};

function invalidparams(message){
	thebot.sendMessage(message.channel, message.content.slice(1).concat(" is an invalid parameter, try !hhelp."));
};
