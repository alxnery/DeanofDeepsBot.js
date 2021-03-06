	var bsl = function(callback){

	var fs = fs || require('fs');
	//loadlist
	this.loadList = function (){

		try{
		this.sounds_list = require('./sounds_list.json');
		//console.log("sounds list imported");
		return this.sounds_list;
		} catch(e){
		this.temp = {};
		fs.writeFile("./sounds_list.json", 
			"{}", 
			function(err){
				console.log("sounds_list.json populated, rerun program");
				this.sounds_list = require('./sounds_list.json');
				process.exit();
			});
		}
	}

this.init = function(filepath, sounds_list){
	//variables
	this.sounds_list = sounds_list;
	this.mp3 = /.*mp3/i;
	this.base_dir = filepath;
	this.sounds = this.sounds_list;

	if(!this.isKeyPresent(this.sounds, "random")){
	this.random = this.sounds.random = {};
	}
	else{
	this.random = this.sounds.random;
	}

	}

	/*
		This wrapper function is only implemented to sort any loose files in the root path to 
		the random directory of the JSON.
	*/
	this.startScan = function (path, catchAll, curObject, curObject_list){
		
		var fs = fs || require('fs');
		var files = fs.readdirSync(path);
		for(i=0; i<files.length; i++){
			
			var stats = fs.statSync(path+files[i]);

			if(stats.isFile()){
				if(this.mp3.test(files[i])){
					var pretty_file = files[i].replace(".mp3","");
					
					if(!(this.isKeyPresent(catchAll, pretty_file)) ) {
						console.log("new file "+pretty_file+" added to "+this.base_dir);
						this.appendKeytoObject(catchAll, pretty_file, this.base_dir);
					}	
				}
			}
			else if(stats.isDirectory()){

				var pretty_path = files[i].replace("/","");

					if(this.isKeyPresent(curObject_list, pretty_path ) ){
						//console.log(pretty_path + " found");
						//console.log("current directory structure")
						var curobj_list = curObject_list[pretty_path];
						var curobj = curObject[pretty_path];

						this.readandADD(path + files[i]+ '/', curobj, curobj_list, true);
						
					}
				else{

					curObject[pretty_path] = {};
					var curobj = curObject_list[pretty_path];
					console.log("new path found "+pretty_path+" added to "+ this.base_dir);

					this.readandADD(path + files[i]+'/', curobj, curObject_list, false);
				}
			}
		}//end for

		return curObject;
		}

	/*
		@param
		path - current path for this function call,

		BOTH curObject and curObject_list REFER TO THE CURRENT KEY-VALUE BEING EVALUATED
		i.e first call curObject = curObject , second call curObject = curObject[directory], etc..

		curObject - the current JSON object sub-structure to be written to file
		curObject_list - the original JSON sub-structure being compared against

		withFlag - a boolean which indicates whether we have previously diverged from our original_json
				this is necessary so that duplicate folder names in different directories do not interfere
				Think all of the different /bin/ directories in your usr/local/
	*/
	this.readandADD = function (path, curObject, curObject_list, withFlag){

		var fs = fs || require('fs');
		console.log("beginning read and add on " + path);
		var files = fs.readdirSync(path);
		var i=0;

		for(i=0; i<files.length; i++){

			var stats = fs.statSync(path + files[i]);
			//if the file is a file
			if(stats.isFile()){
				//if the file is an mp3
				if(this.mp3.test(files[i])){

					var pretty_file = files[i].replace(".mp3","");

					//if we are in a brand new branch of the tree
					if(!withFlag){
						console.log("new file "+pretty_file+" added to "+path+files[i]);
						this.appendKeytoObject(curObject, pretty_file, path);	
					}
					//if we are still in a folder that corresponds with the old json data, AND
					//the key is unique, go ahead and add it
					else if( (withFlag) && (!(this.isKeyPresent(curObject_list, pretty_file))) ){
						console.log("new file "+pretty_file+" added to "+path+files[i]);
						this.appendKeytoObject(curObject, pretty_file, path);
					}
					//if neither of these are true we can safely ignore the file
				}
			} else if(stats.isDirectory()) {

				var pretty_path = files[i].replace("/","");
				curObject[pretty_path] = {};
				var curobj = curObject[pretty_path];

				//if we are still mapped to our list
				if(withFlag){

					//if the key is still present
					if(this.isKeyPresent(curObject_list, pretty_path))
						this.readandADD(path + files[i]+ '/', curobj, curObject_list, true);
				} else {
						console.log("new path found "+pretty_path+" added to " + path+files[i]);

						this.readandADD(path + files[i]+'/', curobj, curObject_list, false);
				}
			}//end isDirectory

		}//end for 

		}

	this.isKeyPresent = function(obj, str){
		var keys = Object.keys(obj), i;
		for(i=0; i<keys.length; i+=1){
			if(keys[i] === str)
				return true;
		}

		return false;
	}

	this.appendKeytoObject = function(curObject, pretty_file, newpath){
		var aliasArr = [];
		aliasArr.push(pretty_file);
		curObject[pretty_file] = {};
		curObject[pretty_file] = {
			aliases : aliasArr,
			path : newpath + pretty_file + '.mp3'
		};

	}

	this.buildList = function(filepath, callback){
			var fs = fs || require('fs');
			try{
					this.sounds_list = require('./sounds_list.json');
			} catch(e){
					fs.writeFile("./sounds_list.json", 
						"{}", 
						function(err){
							this.sounds_list = require('./sounds_list.json');
						});
			}
			var a = this.loadList();
			this.init(filepath, a);
			this.startScan(this.base_dir, this.random, this.sounds, this.sounds_list);
		//	console.log(JSON.stringify(this.sounds, null, 2));

			fs.writeFile("./sounds_list.json", 
			JSON.stringify(this.sounds,null,4), 
			function(err){
				console.log("sounds_list.json populated");
				if(typeof(callback)=="function")
					callback();
		});
	}
}

module.exports = new bsl();
