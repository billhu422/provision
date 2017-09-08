const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const morgan = require('koa-morgan')
const OAuth2 = require('./lib/oauth2').OAuth2
const util = require('util')
const config = require('./config')

const fetch = require('./routes/fetch')
const service = require('./routes/service')
const utils = require('./lib/utils')
const chalk = require('chalk')

var debug = (process.env.NODE_ENV == 'debug'? 'debug': undefined)
morgan.token('date', function(){
  return new Date().toLocaleString()
})

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(morgan(':date :method :url :status :res[content-length] - :response-time ms'));
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

//logger
if(debug) {
    app.use(async (ctx, next) => {
        const start = new Date();
        await next();
        const ms = new Date() - start
        util.log(util.format(chalk.red('%s: %s %s - %sms'), 'REQUEST ', ctx.method, ctx.url, ms));
        util.log(util.format(chalk.cyan('%s: %s'), 'BODY    ', util.inspect(ctx.request.body)));
    });
}

//init OauthSDK
var oauth_client = new OAuth2(config.client_id,
                    config.client_secret,
                    config.account_server,
                    '/oauth2/authorize',
                    '/oauth2/token',
                    config.callbackURL);

asyncOauthGet= async(url,accessToken)=>{
    let oauthGet = await new Promise(function(resolve,reject){
        oauth_client.get(url, accessToken,function(e,response){
            if (e) {
                e.status = e.statusCode;
                e.message = e.data;
               reject(e);
            }else{
                resolve(response.toString());
            }
        });
    });
    return oauthGet;
}
//init database


app.use(async(ctx, next) => {
    try{
            if(debug) console.log('Validating user authorization token' );
            var access_token = ctx.request.get('Authorization').split(" ")[1];
            var url = config.oauth.account_server + '/user';

            if(debug) var startOauth = new Date();
            let user = await asyncOauthGet(url, access_token);
            if(debug) var msOauth = new Date() - startOauth;
            if(debug) console.log(`Validate AccessToken - ${msOauth}ms`)

            //console.log(user);
            if(JSON.parse(user).id != config.biz.oauth.username) ctx.throw(400, {message:utils.buildResponse(-3, 'User\'s role is not seller(admin)')});
        }
        catch (ex){
            util.log(util.format(chalk.red('%s %s'),'EXCEPTION',JSON.stringify(ex)));
            ctx.status = parseInt(ex.status,10);
            switch (ctx.status) {
                case 404:
                    ctx.body = utils.buildResponse(-1,'Access Token not found');
                    break;
                case 401:
                    ctx.body = utils.buildResponse(-2,'Invalid Access Token');
                    break;
                default: {
                    ctx.body = ex.message;
                }
            }
            return;
        }
        await next();
});

// routes
app.use(service.routes(), service.allowedMethods())
app.use(fetch.routes(), fetch.allowedMethods())


module.exports = app