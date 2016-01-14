
try{
	var Discord = require('discord.js');
} catch(e){
	console.log("npm install discord.js is required for basic function");
	process.exit();
}

//check for discord.io
var IOEnable = true;

try{
	var IODiscord = require('discord.io');
} catch(e){
	IOEnable = false;
	console.log("Install discord.io required for voice function");
}

var fs = require('fs');

var APIKEYSFOUND = {
		youtube : false,
		giphy : false
	}

var sound_list = require('./sounds_list.json');

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

var thebot = new Discord.Client();

//var commands = require('./commands.js');

//add querymethods for wolfram, google, yahoo

if(credentials){
	thebot.login(credentials.email, credentials.password);
	if(IOEnable == true){
		var iobot = new IODiscord({
		autorun: true,
		email : credentials.email,
		password : credentials.password
		});
	}
}

thebot.on("ready", function(){
	console.log("MessageBot Serving Replies Now!");
});

iobot.on("ready", function(){
	console.log("IOBot Waiting for audio response");
	console.log(JSON.stringify(iobot.id, null, 4));
});

iobot.on("message", function(user,userID,channelID,message,rawEvent){
	if(message.charAt(0) === "!")
		if(message.startsWith("!happyfeast")){
			console.log(message);
			happyfeast(message,channelID,userID);
		}
		else if(message.startsWith("!helicopter")){
			playAudioFromUserID(channelID, userID, "./sounds/helicopter.mp3");
		}
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

function playAudioFromUserID(channelID, userID, path){
	var server = iobot.serverFromChannel(channelID);
	var voice_channel = findVoiceChannel(server, userID);
	ifReadyToJoinVoice(server, voice_channel, path, playAudioClip);
}

function happyfeast(message, channelID, userID){
	var keys = Object.keys(sound_list.Hearthstone_HappyFeast),
	i=0, found = false, sound_path, cur, names;

	var requestMessage = message;
	requestMessage = requestMessage.split(" ");
	requestMessage.shift();

	if(requestMessage.length > 0){

		for(i=0; i<keys.length && (!found); i+=1){

			cur = sound_list.Hearthstone_HappyFeast[keys[i]];
			names = cur.aliases;

			for(j=0; j<names.length && (!found); j+=1){
				if(requestMessage[0].toLowerCase() === names[j]){
					sound_path = cur.path;
					found = true;
				}

			}
		}
	}

	if(!found){
		var randnum = Math.floor(Math.random() * (keys.length));
		sound_path = sound_list.Hearthstone_HappyFeast[keys[randnum]].path;
	}
	console.log(sound_path);
	playAudioFromUserID(channelID, userID, sound_path);

}

function findVoiceChannel(server, userID){
	console.log(JSON.stringify(server,null,4) + " " + userID);
	console.log("about to loop i");
	for(i in iobot.servers[server].channels){
		if(iobot.servers[server].channels[i].type === "voice")
			for(j in iobot.servers[server].channels[i].members){
				//console.log("member found");
				if(iobot.servers[server].channels[i].members[j].user_id === userID){
					console.log(iobot.servers[server].channels[i].members[j].channel_id);
					return iobot.servers[server].channels[i].members[j].channel_id;
				}
			}
	}
}

function playAudioClip(voice_channel, path){
	iobot.joinVoiceChannel(voice_channel, function(){
		iobot.getAudioContext({ channel : voice_channel, stereo:true}, function(stream){
			stream.playAudioFile(path); //start playing
			stream.once('fileEnd', function(){

			setTimeout(function(){
			iobot.leaveVoiceChannel(voice_channel);
			},1000);

			});
		});
	});
}

function ifReadyToJoinVoice(server, voice_channel, path, callback){
	for(i in iobot.servers[server].channels){
		for(j in iobot.servers[server].channels[i].members){
			if(iobot.servers[server].channels[i].members[j].user_id === iobot.id){
				//if we find OURSELVES already in the channel return false
				console.log("found self in server " + server + " channel " + voice_channel + "playback failed for " + path);
				return false;
			}
		}
	}

	//if not, then we're ready.
	if(typeof callback === "function"){
		console.log(path);
		callback(voice_channel, path);
	}
}

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
	if(args.length != 0){
	chopMessage();
	}
	else{
	thebot.sendMessage(message.channel, "This command formats tts to fit all those dank memes.");
	}
};

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
