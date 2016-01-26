var fs = require('fs');

var mp3 = /.mp3/i;
var base_dir = "./sounds/";
var sounds_list = {};
var random = sounds_list.random = {};

function startScan(path, catchAll, curObject){
	var files = fs.readdirSync(path);
	var i=0;
	for(i=0; i<files.length; i++){
		var stats = fs.statSync(path+files[i]);
		if(stats.isFile()){
			var pretty_file = files[i].replace(".mp3","");
			var aliasArr = [];
			aliasArr.push(pretty_file);
			catchAll[pretty_file]={};
			catchAll[pretty_file]={
				aliases : aliasArr,
				path : base_dir + files[i]
			};
		}
		else if(stats.isDirectory()){
			var pretty_path = files[i].replace("/","");
			curObject[pretty_path] = {};
			var curobj = curObject[pretty_path];
			readandADD(path + files[i]+ '/', curobj);
		}
	}
}

function readandADD(path, curObject){
	var files = fs.readdirSync(path);
	var i=0;
	for(i=0; i<files.length; i++){
		var stats = fs.statSync(path + files[i]);
		if(stats.isFile()){
			//console.log(files[i]);
			var pretty_file = files[i].replace(".mp3","");
			var aliasArr = [];
			aliasArr.push(pretty_file);
			curObject[pretty_file] = {};
			curObject[pretty_file] = {
				aliases : aliasArr,
				path : path + files[i]
			};
		}
		else if(stats.isDirectory())
			{
			//console.log("dir found");
			var pretty_path = files[i].replace("/","");
			//console.log(pretty_path);
			curObject[pretty_path] = {};
			var curobj = curObject[pretty_path];
			//console.log("current obj is ");
			//console.log("moving into dir " + path + files[i] + '/');
			readandADD(path + files[i]+ '/', curobj);
			}
		}
	}

startScan(base_dir, random, sounds_list);

console.log(JSON.stringify(sounds_list, null, 2));

fs.writeFile("./sounds_list.json", 
	JSON.stringify(sounds_list,null,4), 
	function(err){
		console.log("sounds_list.json populated");
});