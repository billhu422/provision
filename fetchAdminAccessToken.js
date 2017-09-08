/**
 * Created by billh on 2017/7/25.
 */
var request = require("request");
var config = require("./config");

  var key = config.oauth.client_id + ':' + config.oauth.client_secret;
  var base64 = (new Buffer(key)).toString('base64');

var options = {
  url: 'http://124.251.62.217:8000/oauth2/token',
  headers: {
    'Host' : '124.251.62.217:8000',
    'Authorization' : 'Basic ' + base64,
    'Content-Type' : 'application/x-www-form-urlencoded'
  },
  form: {'grant_type':config.biz.oauth.grant_type,'username':config.biz.oauth.email,'password':config.biz.oauth.password}
};
console.log(options);
request.post(options, function(err,httpResponse,body){
	console.log(body);
        console.log(JSON.parse(body).access_token);

});
