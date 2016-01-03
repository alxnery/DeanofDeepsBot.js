
try{
	var Discord = require('discord.js');
} catch(e){
	console.log("npm install discord.js is required for basic function");
	process.exit();
}

var fs = require('fs');

var APIKEYSFOUND = false;

try{
	var apicredentials = require('./apiauth.json');
	var youtube_node = require('youtube-node');
	APIKEYSFOUND = true;
} catch(e){
	console.log("To use certain API features accounts and API keys must be found.");
	console.log("format is {\"serviceAPIKEY\" : \"key\"} where service is the service name.");
	APIKEYSFOUND = false;
}

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

/*var yt = function YoutubeLogin(){
	this.youtube = new youtube_node();
	this.youtube.setKey(apicredentials.youtubeAPIKEY);
	return this.youtube;		
}*/

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
			case "!ttsformat":
				ttsformat(message);
				break;
			case "!youtube":
				if(APIKEYSFOUND == true)
					searchservice_youtube(message);
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
	response.push("Current system functions are !youtube, and !ttsformat\nOther functions are ");
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

function searchservice_youtube(message){
	var yt = new youtube_node();
	yt.setKey(apicredentials.youtubeAPIKEY);
	var str = message.content;
	str = str.replace("!youtube","");
	console.log(str);
	yt.search(str, 1, function(err, result){
		if(!result || !result.items || result.items.length<1){
			thebot.sendMessage(message.channel, "TOOO OBSCURE FOR ME");
		}
		else{
			//console.log(JSON.stringify(result, null, 2));
			if(result.items[0].id.kind === "youtube#channel")
				thebot.sendMessage(message.channel, "http://www.youtube.com/channel/" + result.items[0].id.channelId);
			else
			thebot.sendMessage(message.channel, "http://www.youtube.com/watch?v=" + result.items[0].id.videoId);
		}
	});
}

function ttsformat(message){

	var args = message.content.split(" ");

	args.shift();

	function chopMessage(){
		setTimeout(function(){
		var removed = args.splice(0, 20);
		if(removed.length == 0)
			return
			else{
			thebot.sendTTSMessage(message.channel, removed.join(" "));
			chopMessage();	
			}
		}, 1000);	
	}

	chopMessage();
}
 
function invalidparams(message){
	thebot.sendMessage(message.channel, message.content.slice(1).concat(" is an invalid parameter, try !hhelp."));
};
