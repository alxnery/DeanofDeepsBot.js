
try{
	var Discord = require('discord.js');
} catch(e){
	console.log("npm install discord.js is required for basic function");
	process.exit();
}

var fs = require('fs');

try{
		var credentials = require('./auth.json');
} catch(e){
		console.log("auth.json in the form of {\"email\" : \"\", \"password\": \"\" is required}");
		console.log("AUTO-GENERATING EXAMPLE NOW");
		var authority = {
		email : "foobar@example.com",
		password: "foobaz",
		};
		fs.writeFile("./auth.json", JSON.stringify(authority,null,8), function(){ 
						console.log("Default auth.json created, please fill in info");
						process.exit();
			});		
}

try{
			var simpleres = require('./simpleResponses.json');
} catch(e) {
			var example = {
			items : [{
				Event : "!bot",
				Usage : "<default simpleResponse>",
			  MessageContent : "default simpleResponse",
				tts : "false"
				}]
			};
			fs.writeFile("./simpleResponses.json", JSON.stringify(example,null,8), function(){ 
						console.log("Default simpleResponses.json created");
			});
}

var thebot = new Discord.Client();
//var commands = require('./commands.js');

//add querymethods for wolfram, google, yahoo
//add !ttsreformat to split by characters<=85 for tts paragraphs

if(credentials){
	thebot.login(credentials.email, credentials.password);
}

thebot.on("ready", function(){
	console.log("Serving Replies Now!");
});



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
	response.push("Current functions are 	");
	while(i<len){
		value = simpleres.items[keys[i]];
		response.push("\n");
		response.push(value.Event);
		response.push(" -> ");
		response.push(value.Usage);
		i+=1;
	}
	response.push(".");
	var sb = response.join("");
	thebot.sendMessage(message.channel, sb);
};

function invalidparams(message){
	thebot.sendMessage(message.channel, message.content.slice(1).concat(" is an invalid parameter, try !hhelp."));
};
