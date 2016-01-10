
try{
	var Discord = require('discord.js');
} catch(e){
	console.log("npm install discord.js is required for basic function");
	process.exit();
}

var fs = require('fs');

var APIKEYSFOUND = {
		youtube : false,
		giphy : false
	}

try{
	var apicredentials = require('./apiauth.json');
	var youtube_node = require('youtube-node');
	APIKEYSFOUND.youtube = true;
} catch(e){
	console.log("To use certain API features accounts and API keys must be found.");
	console.log("format is {\"serviceAPIKEY\" : \"key\"} where service is the service name.");
	APIKEYSFOUND.youtube = false;
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
	var giphy = require('giphy-api')();
	APIKEYSFOUND.giphy = true;
} catch(e){
	console.log("giphy api not found");
	APIKEYSFOUND.giphy = false;
}

try{
	var simpleres = require('./simpleResponses.json');
} catch(e) {
	var example = {
		items : [{
			Event : "!bot",
			Usage : "<default simpleResponse>",
			MessageContent : "default simpleResponse",
			tts : false
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

		switch(args){
			case "!hhelp":
				hhelp(message);
				break;
			case "!ttsformat":
				ttsformat(message);
				break;
			case "!youtube":
				if(APIKEYSFOUND.youtube == true)
					searchservice_youtube(message);
				break;
			case "!gif":
				if(APIKEYSFOUND.giphy == true)
				searchservice_giphy(message);
				break;
			case "!sadboys":
				aestheticConvert(message);
				break;
			case "!define":
				newCommand(message);
				break;
			default:
				checkResponses(message);
			}
		}
});

thebot.on("message", function(message){
		var argument = message.content.split(" "), rc = false;
		for(var i = 0; i< argument.length && rc == false; i++){
		 switch(argument[i].toLowerCase()){
		 	case "peen":
				thebot.sendMessage(message.channel, "poon!");
				rc = true
				break;
		 }
		}
});

function checkResponses(message){

		//possible command
		var args = message.content.split(" ")[0];
	//check for oneliner Response real fast
		var keys = Object.keys(simpleres.items),
			len = keys.length,i=0,
			found = false, value;

		while(i<len && found == false){
			value = simpleres.items[keys[i]];
			if(value.Event === args){
				found = true;
				if(value.tts == true)
					thebot.sendTTSMessage(message.channel, value.MessageContent); 
				else
					thebot.sendMessage(message.channel, value.MessageContent);
			}
			i+=1; 
		} //if found end loop
}

function newCommand(message){
	//pick up the contents	
	var str = message.content;
	console.log(str);

	//split and drop the call
	str = str.split(" ");
	str.shift();
	str = str.join(" ");

	//split by token
	str = str.split("::");

		//if the string is acceptable
		if(str.length >=2 && str.length <= 4){

			//insert the flag to the beginning
			var EventVal = insertAtIndex(str[0], 0, "!");

			//set the fallthrough objects
			var ttsVal = false;
			var UsageVal = "<" + EventVal + ">";

			//set the messageContent
			var MessageContentVal = str[1];

			//if the command is strictly event::MessageContent::usage
			if(str.length===3){
				UsageVal = "<" + str[2] + ">";
			}
			//if the command is event::MessageContent::Usage::tts
			else if(str.length===4){
				UsageVal = "<" + str[2] + ">";
				if(str[3]==="true" || str[3]==="yes"){
					ttsVal = true;
				}
			}
			
			simpleres.items.push({
				Event : EventVal,
				Usage : UsageVal,
				MessageContent : MessageContentVal,
				tts : ttsVal,
				author : {
					id : message.author.id,
					username : message.author.username	
					}
			});

		fs.writeFile("./simpleResponses.json", JSON.stringify(simpleres,null,8), function(){
		thebot.sendMessage(message.channel, "Command created");
	});

		simpleres = require('./simpleResponses.json');

		}//end :: parse

	else{
		thebot.sendMessage(message.channel,
		"Proper usage of define is !define Event::EventMessage::Usage::tts");
		}

}


function hhelp(message){
	var response = [],keys = Object.keys(simpleres.items),
			len = keys.length,i=0,value;
	response.push("Current system functions are !youtube, !gif, and !ttsformat\nOther functions are ");
	while(i<len){ 
		value = simpleres.items[keys[i]];
		response.push("\n**");
		response.push(value.Event);
		response.push("**");
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
	str = str.replace("!youtube ","");
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

function searchservice_giphy(message){
	var giphy_parameters = {
		q:"anthony fantano",
		rating : 'r',
		limit : 20
	};
	
	var str = message.content;
	str = str.replace("!gif ", "");
	giphy_parameters.q = str;
	giphy.search(giphy_parameters, function(err, res){
		if(err)
		console.log(err);
		else if(res.data[0] == undefined)
		thebot.sendMessage(message.channel, "No results found");
		else{
		var randnum = Math.floor(Math.random() * (res.data.length));
		console.log(randnum + res.data[randnum].url + res.data[randnum].rating);
		thebot.sendMessage(message.channel, res.data[randnum].url);
		}
	});
}

function ttsformat(message){

	var args = message.content.split(" ");

	args.shift();

	function chopMessage(){
		setTimeout(function(){
		var removed = args.splice(0, 25);
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

function aestheticConvert(message){
	var inString = message.content;
	inString = inString.split(" ");
	inString.shift();
	inString = inString.join(" ");
	var outString = "";
	for(i=0; i<inString.length; i++){
		if(inString.charCodeAt(i) >= 33 && inString.charCodeAt(i) <= 270)
			outString += String.fromCharCode(inString.charCodeAt(i)+65248);
		else{
			outString += inString.charAt(i);
		}
	}
	thebot.sendMessage(message.channel, outString);
};

function invalidparams(message){
	thebot.sendMessage(message.channel, message.content.slice(1).concat(" is an invalid parameter, try !hhelp."));
};

function insertAtIndex(str, index, val){
	return str.substr(0, index) + val + str.substr(index);
};
