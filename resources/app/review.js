const request = require("request");
var server = server || {};

server.add = function(data) {
  const keys = ["dir", "author", "text", "star", "time"];
  for (var key of keys) {
    if(data[key] === undefined) {
      return console.log("ERROR", "can't push, invalid data");
    }
  }

  //追加する場合
  request.post(
  	{
  		url:"http://ec2-54-64-76-155.ap-northeast-1.compute.amazonaws.com/sugi/action.php",
  		form:{
  			function:"add",
        dir:data.dir,
  			author:data.author,
        text:data.text,
        star:data.star,
        time:data.time
  		}
  	},
  	(err,response,body) => {
  		if(err) console.log("ERROR",err);
  		else console.log("SUCCESS",body);
  	}
  );
}

server.get = function(directory) {
  return new Promise(function(resolve, reject) {
    //取得する場合
    request.post(
    	{
    		url:"http://ec2-54-64-76-155.ap-northeast-1.compute.amazonaws.com/sugi/action.php",
    		form:{
    			function:"get",
          dir:directory
    		}
    	},
    	(err,response,body) => {
    		if(err) console.log("ERROR",err);
    		else {
          //console.log("SUCCESS", body);
          resolve(body);
        }
    	}
    );
  }).then(data => {
    return JSON.parse(data);
  });
}

module.exports = server;
