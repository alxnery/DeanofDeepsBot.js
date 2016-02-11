//steam api request
function IDfromhandle(apikey){
	
	if(!(this instanceof IDfromhandle)){
		return new IDfromhandle(apikey);
	}
	this.steamkey = apikey;
}

IDfromhandle.prototype.getID = function(name, callback){
		var http = require('http');
		var qs = require('querystring');
		return http.get({
			host: 'api.steampowered.com',
			path: '/ISteamUser/ResolveVanityURL/v0001/' + '?key=' +
			qs.escape(this.steamkey) + '&vanityurl=' + qs.escape(name)
		},
		function(response){
			var body = '';
			response.on('data',function(d){
				body+=d;
			});
			response.on('end', function(){
				var parsed = '';
				var err = null;
				try{
					parsed = JSON.parse(body)
				}catch(e){
					err += "ERROR: NOT VALID JSON ";
					console.log("Response not valid JSON");
				}
				if(parsed.success == 42){
					err += "ERROR: NO USER FOUND";
				}
				if(typeof callback === "function"){
					console.log(parsed);
					console.log(parsed.response.steamid);
					callback(err, parsed.response.steamid);
				}
			});
		}
	);
}

IDfromhandle.prototype.getLastMatchID = function(account_id, callback){
		var http = require('http');
		var qs = require('querystring');
		var expath = '/IDOTA2Match_570/GetMatchHistory/V001/' +
			'?key=' +
			qs.escape(this.steamkey)
			+ '&matches_requested='
			+ qs.escape(1)
			+ '&account_id=' + qs.escape(account_id) 

			console.log("http://" + 'api.steampowered.com' + expath);
		return http.get({
			host: 'api.steampowered.com',
			path: '/IDOTA2Match_570/GetMatchHistory/V001/' +
			'?key=' +
			qs.escape(this.steamkey)
			+ '&matches_requested='
			+ qs.escape(1)
			+ '&account_id=' + qs.escape(account_id) 
			
		},function(response){
			var body = '';
			response.on('data',function(d){
				body+=d;
			});
			response.on('end', function(){
				var parsed = '';
				var err = null;
				try{
					console.log(body);
					parsed = JSON.parse(body)
				}catch(e){
					err += "ERROR: NOT VALID JSON ";
					console.log("Response not valid JSON");
				}

				if(parsed.result.status === 15){
					err += "ERROR: USER HAS NOT ALLOWED INFORMATION";
					if(typeof callback === "function"){
					return callback(err, {
						matchid : "undefined"
					});
					}
				}
				if(typeof callback === "function"){
					callback(err, {
						matchid : parsed.result.matches[0].match_id
					});
				}
			});
		}
	);
}

module.exports = IDfromhandle;