/*
****************************************************************************************
	BEGIN WITH BASIC HEADER GUARDS AND REQUIRES
	Managing my json files manually without persistdb so try catch guards are required
****************************************************************************************
*/

var fs = require('fs');

//discord.io tempflag
var IOEnable = true;

//temp flag for checking API AVAILABILITY
var APIKEYSFOUND = {
		youtube : false,
		giphy : false
	}

//static private string SOUND_ROOT
var sound_root = "./sounds/";

//check for discord.js
try{
	var Discord = require('discord.js');
} catch(e){
	console.log("npm install discord.js is required for basic function");
	process.exit();
}

//check for discord.io
try{
	var IODiscord = require('discord.io');
} catch(e){
	IOEnable = false;
	console.log("Install discord.io required for voice function");
}

//require for the auth information
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

//require for simple_responses.json, if not generate one
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

//check for sounds_list, if not generate one
try{
	var sound_list = require('./sounds_list.json');
	//console.log(JSON.stringify(sound_list, null, 4));
} catch(e){
	console.log("To add and play mp3's, install ffmpeg or avconv "+
		"then drop files in the sounds folder, and edit the sounds_list.json file");
	console.log("this format is group.sound.(aliases && path) " + 
		"where aliases are an array of names you would like to use for the clip in question");
	var example_sound = {
		group1 : {
			sound1 : {
				aliases : ["sound1", "s1"],
				path : "sound1.mp3"
			}
		}
	}
	fs.writeFile("./sounds_list.json", JSON.stringify(example_sound,null,8), function(){ 
		console.log("It is clunky for now but allows a fun lookup scheme, don't worry, I just created a template");
	});

}

//require for the youtube_section
try{
	var apicredentials = require('./apiauth.json');
	var youtube_node = require('youtube-node');
	APIKEYSFOUND.youtube = true;
} catch(e){
	console.log("To use certain API features accounts and API keys must be found.");
	console.log("format is {\"serviceAPIKEY\" : \"key\"} where service is the service name.");
	APIKEYSFOUND.youtube = false;
}

//required for the giphy module
try{
	var giphy = require('giphy-api')();
	APIKEYSFOUND.giphy = true;
} catch(e){
	console.log("giphy api not found");
	APIKEYSFOUND.giphy = false;
}

//login to the bots
if(credentials){
	var thebot = new Discord.Client();
	thebot.login(credentials.email, credentials.password);
	if(IOEnable == true){
		var iobot = new IODiscord({
		autorun: true,
		email : credentials.email,
		password : credentials.password
		});
	}
}

/*
****************************************************************************************
	LISTENERS AND EVENTS
		Listeners for the IOBOT for audio, and the jsBot for message replies
****************************************************************************************
*/
thebot.on("ready", function(){
	console.log("MessageBot Serving Replies Now!");
});

iobot.on("ready", function(){
	console.log("IOBot Waiting for audio response");
	console.log(JSON.stringify(iobot.id, null, 4));
});

iobot.on("message", function(user,userID,channelID,message,rawEvent){

	if( (userID != iobot.id) && message.charAt(0) === "!"){

		var args = message.split(" ")[0];

		switch(args){
			case "!happyfeast":
				happyfeast(message,channelID,userID);
				deletefromChannel(iobot, rawEvent);
				break;
			case "!helicopter":
				playAudioFromUserID(channelID, userID, "./sounds/helicopter.mp3");
				deletefromChannel(iobot, rawEvent);
				break;
			case "!sound":
				processSoundRequest(message,channelID,userID);
				deletefromChannel(iobot, rawEvent);
				break;
		}

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

/*
****************************************************************************************
	FUNCTIONS FOR CALL-later to be loaded into an obect
		Calls coming directly from the main listeners
****************************************************************************************
*/

function playAudioFromUserID(channelID, userID, path){
	var server = iobot.serverFromChannel(channelID);
	try{
	var voice_channel = findVoiceChannel(server, userID);
	ifReadyToJoinVoice(server, voice_channel, path, playAudioClip);
	}
	catch(e){
		console.log("channel not found");
	}
}

function processSoundRequest(message, channelID, userID){

	var args = message.split(" ");

	if(args.length > 1 && args[1].startsWith("--")){
		args = args[1];
		args = args.slice(2);
		console.log(args);
		switch(args){
			case "list":
				listSounds(channelID);
				break;
			case "help":
				var msg = "!sound will default to a random sound from a random group, or a specific group"
				+ "additional specificities can be acheived by using !sound group clip, " +
				"where group is the group name, and clip is the alias for the clip " +
				"i.e !sound happyfeast rag which will query happyfeast for a rag clip\n" +
				"also try !sound --list for a list"; 
				thebot.sendMessage(channelID, msg);
				break;
			default :
				thebot.sendMessage(channelID, "try --list or --help");
			}
		}
	else{
		findSoundAndPlay(message, channelID, userID);
	}
}

function happyfeast(message, channelID, userID){
	var keys = Object.keys(sound_list.happyfeast),
	i=0, found = false, sound_path = sound_root, cur, names;

	var requestMessage = message;
	requestMessage = requestMessage.split(" ");
	requestMessage.shift();

	if(requestMessage.length > 0){

		for(i=0; i<keys.length && (!found); i+=1){

			cur = sound_list.happyfeast[keys[i]];
			names = cur.aliases;

			for(j=0; j<names.length && (!found); j+=1){
				if(requestMessage[0].toLowerCase() === names[j]){
					sound_path += cur.path;
					found = true;
				}

			}
		}
	}

	if(!found){
		var randnum = Math.floor(Math.random() * (keys.length));
		sound_path += sound_list.happyfeast[keys[randnum]].path;
	}
	console.log(sound_path);
	playAudioFromUserID(channelID, userID, sound_path);

}

function playAudioClip(voice_channel, path){
	iobot.joinVoiceChannel(voice_channel, function(){
		iobot.getAudioContext({ channel : voice_channel, stereo:true}, function(stream){
			stream.playAudioFile(path); //start playing
			stream.once('fileEnd', function(){

			setTimeout(function(){
			iobot.leaveVoiceChannel(voice_channel);
			},600);

			});
		});
	});
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
	//console.log(str);
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


function findVoiceChannel(server, userID){
	//console.log(JSON.stringify(server,null,4) + " " + userID);
	//console.log("about to loop i");
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
	throw "not found";
}

function listSounds(channelID){
	var base_group = sound_list,
	cur, names,
	groupkeys, name;

	var outputString = "\n";

	var i, j, k;
	//loop through groups
	groupkeys = Object.keys(base_group);
	for(i=0; i<groupkeys.length; i+=1){
		
		//add groupname -
		outputString += "**" + groupkeys[i] + "**" + "--\n";
		//get keys for clip list
		namekeys = Object.keys(base_group[groupkeys[i]]);
		//cur is the reference point of the group were in 
		cur = base_group[groupkeys[i]];

		//loop through clip list
		for(k=0; k<namekeys.length; k+= 1){
			//add clip name
			outputString += namekeys[k] + "- ";
			names = cur[namekeys[k]].aliases;
			//loop through aliases
			for(j=0; j<names.length; j+=1){
				//add the alias + " "
				outputString += names[j] + " ";
			}
			//add new line after the aliases
			outputString += "\n";
		}
	}
	thebot.sendMessage(channelID, outputString);
}

//attempt to find a !sound request using the sounds_list.json
//each element is part of group.clip.(path || aliases);
//Hard loops used for speed, stop when things are found, no foreach
function findSoundAndPlay(message, channelID, userID){
	var group_found = false,
	found = false,
	sound_found = false,
	sound_path = sound_root, 
	base_group = sound_list, 
	sounds_group, sounds_final,
	cur, names;

	var requestMessage = message;
	requestMessage = requestMessage.split(" ");
	requestMessage.shift();

	//request a group folder
	if(requestMessage.length > 0){
		//if the request is invalid
		if(isKeyPresent(base_group, requestMessage[0])){
			//requested key is present, go go
			group_found = true;
			sounds_group = base_group[requestMessage[0]];

			//check if the second param is here
			//if not we skip down and pick at random
			if(requestMessage.length > 1){
			//console.log("Trying " + requestMessage[1]);
			var keys = Object.keys(sounds_group);
			var i, j;
			//loop through keys
			for(i=0; i<keys.length && (!found); i+=1){
				cur = sounds_group[keys[i]];
				names = cur.aliases;
				//loop through aliases
				for(j=0; j<names.length && (!found); j+=1){
					if(requestMessage[1] === names[j]){
						sound_path += cur.path;
						found = true;
						sound_found = true;
						}
					}
				}
			}

		}
	}

	//If the lookup failed at the group level, or sound level, we catch and remediate here

	//if we failed to match the group get one at random
	//this will be fed to establishing the sound clip
	if(group_found == false){
			//pick a random group and random folder
			//get a random group from sounds
			sounds_group = base_group[pickRandomKey(base_group)];
			group_found = true;
	}

	//if we failed to match the sound we get one here at random...
	//sounds_group is guaranteed to be established by now either at random or by choice.
	if(sound_found == false){
			//get a random sounds from group
			sounds_final = sounds_group[pickRandomKey(sounds_group)];
			//append to the static sound_root
			sound_path +=  sounds_final.path;
			sound_found = true;
	}

	playAudioFromUserID(channelID, userID, sound_path);
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
		//console.log(path);
		callback(voice_channel, path);
	}
}

function isKeyPresent(obj, str){
	var keys = Object.keys(obj), i;
	for(i=0; i<keys.length; i+=1){
		if(keys[i] === str)
			return true;
	}

	return false;
}

function pickRandomKey(obj){
	var keys = Object.keys(obj), i;
	var randnum = Math.floor(Math.random() * keys.length);
	return keys[randnum];	
}

function sendMessageCheck(channel, message){

}

function deletefromChannel(bot, rawEvent){
	bot.deleteMessage(	{
					channel:rawEvent.d.channel_id,
					messageID:rawEvent.d.id
				});
}

function insertAtIndex(str, index, val){
	return str.substr(0, index) + val + str.substr(index);
};
