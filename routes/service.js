const router = require('koa-router')()
const config = require('../config')
const  Capi = require('../../qcloudapi-sdk');
const assign = require('object-assign');
const request = require('request')
const  rp = require('request-promise');
const randomstring = require("randomstring");
const vreq = require('../lib/validateReq');
const qs = require('querystring');
const util = require('util');
const utils = require('../lib/utils');
const sdk = require('../lib/sdk');

router.prefix('/v1/hybrid/service')


asyncRequest= async (opts)=>{
    let bd = await new Promise(function(resolve, reject) {
        request(opts, function(err,r, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
    return bd;
}

asyncQcloudReq= async (param)=>{
    let bd = await new Promise(function(resolve, reject) {
        sdk.request(param, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
    return bd;
}

//fetch order -> productOffering.href -> productSpecification.href
router.use(async (ctx, next) => {
     try {
        if(debug) console.log('Fetching order info');
        var orderId = ctx.request.body.orderId;
        if(orderId  === undefined) ctx.throw(400,{message:utils.buildResponse(-4,'Need orderId.')});
        var adminAccessToken = ctx.get('Authorization');

        var options = {
                method : 'GET',
                url: config.eco.baseUrl + config.eco.orderPath + "/?id=" + orderId  + "&relatedParty.role=Seller",
                headers: {
                        'Authorization': adminAccessToken
                }
        };

        if(debug) console.log("header:" + JSON.stringify(options,4,4));
        //send request
        if(debug) var startOder = new Date();
        let bd  = await asyncRequest(options);
        if(debug) console.log(bd);
        var msOder = new Date() - startOder;
        if(debug) console.log(`fetchOrder - ${msOder}ms`)

        //fetch order from return array
        var order = JSON.parse(bd)[0];
        if(order === undefined) ctx.throw(400,{message:utils.buildResponse(-5,'Not found order.')});
        if(debug) console.log(JSON.stringify(order,4,4));

        //Validating Paid status
        if(debug) console.log('Validating Paid status');
        var textObj = order.note.filter(function(x){return x.text === "Paid"})[0];
        if( textObj === undefined ) ctx.throw(400, {message:utils.buildResponse(-6,'The order is not paied, cannot  delivery an instance by the order')});

        //save adminAccessToken and order in ctx for next operation
        ctx.adminAccessToken = adminAccessToken;
        ctx.order = order;
    }
    catch (ex){
        util.log(util.format(chalk.red('%s %s'),'EXCEPTION',JSON.stringify(ex)));
        ctx.status = parseInt(ex.status,10);
        ctx.body = ex.message;
        return;
    }
    await next();
});


var checkRelatedPartyMandatory = function (ctx,charArray,charname) {
        var len = charArray.filter(function(x){return x.role === charname}).length;
        if(len === 0){
            ctx.throw(400,{message:{code:-9,description:'Characteristic ' + charname + " is empty"}});
        }else if(len > 1){
            ctx.throw(400,{message:{code:-10,description:'Characteristic ' + charname + " is repeated"}});
        }

        return charArray.filter(function(x){return x.role === charname})[0].id;
}


var checkCharacteristicMandatory = function (ctx,charArray,charname) {
        var len = charArray.filter(function(x){return x.name === charname}).length;
        if(len === 0){
            ctx.throw(400,{message:{code:-9,description:'Characteristic ' + charname + " is empty"}});
        }else if(len > 1){
            ctx.throw(400,{message:{code:-10,description:'Characteristic ' + charname + " is repeated"}});
        }

        return charArray.filter(function(x){return x.name === charname})[0].value;
}

var checkCharacteristicOptional =function (charArray,charname) {
        var len = charArray.filter(function(x){return x.name === charname}).length;
        if(len > 1){
            ctx.throw(400,{message:{code:-10,description:'Characteristic ' + charname + " is repeated"}});
        }else if(len === 0){
            return undefined;
        }else if(len === 1){
            return charArray.filter(function(x){return x.name === charname})[0].value;
        }
}

router.post('/cvm',async (ctx, next) => {
    //Handle OrderItem
    try {
        console.log('Fetching orderItem info');
        var instanceIds = [];
        var order = ctx.order;
        var orderId = order.id;
        var adminAccessToken = ctx.adminAccessToken;

        for(itemIndex in order.orderItem){
            var item = order.orderItem[itemIndex];
            //order.orderItem.forEach(function(item){ //await 只能直接写在async函数内，也就是说，不能写在forEach中。
            //Check orderItem's state must be Acknowledged or InProgess
            console.log('Validate orderItem state');
            if(item.state != 'Acknowledged' && item.state != "InProgress")
                ctx.throw(400,{message:utils.buildResponse(-7,'Only Acknowledged or InProgess can be manually modified')});

            //fetch product Specification

            //validate product characteristic use

            //write service into database

            //provision service

            //update service status
            //update orderItem status


            //fetch product characteristicValue
            var userId = checkRelatedPartyMandatory(ctx,item.product.relatedParty,'Customer');
            var provider = checkCharacteristicMandatory(ctx,item.product.productCharacteristic,'provider').toLowerCase();
            var productName = checkCharacteristicMandatory(ctx,item.product.productCharacteristic,'productname').toLowerCase();
            //cvm parameters/////////////////////////////////////////////
            createInsJson.ImageId = checkCharacteristicMandatory(ctx,item.product.productCharacteristic,'操作系统');
            createInsJson.InstanceCount = 1;
            createInsJson.InstanceType = checkCharacteristicOptional(item.product.productCharacteristic,'机型');
            createInsJson.Placement.Zone = checkCharacteristicMandatory(ctx,item.product.productCharacteristic,'地域');
            //createInsJson.Placement.ProjectId = undefined;
            createInsJson.Region = 'ap-' + createInsJson.Placement.Zone.split('-')[1];
            createInsJson.InternetAccessible.InternetMaxBandwidthOut = parseInt(checkCharacteristicOptional(item.product.productCharacteristic,'带宽').split(' ')[0],10);
            createInsJson.InstanceChargeType = CHARGETYPE[checkCharacteristicOptional(item.product.productCharacteristic,'付费方式')];
            createInsJson.InstanceChargePrepaid.Period = parseInt(checkCharacteristicMandatory(ctx,item.product.productCharacteristic,'购买时长').split(' ')[0],10);
            createInsJson.InstanceChargePrepaid.RenewFlag = RENEWFLAG[checkCharacteristicOptional(item.product.productCharacteristic,'自动续费')];
            createInsJson.ClientToken = randomstring.generate(64);
            console.log(JSON.stringify(createInsJson,4,4));
            console.log(provider + ':'+ productName);

            ///////////////////////////////////////////////////////////////////////////////////////////////
            //Deliver item
            console.log('Delivering item');

/*            var params = assign(createInsJson);
            var startDelivery = new Date();
            var qcloudbd = await asyncQcloudReq(JSON.parse(JSON.stringify(params)), {serviceType: 'cvm'});
            var msQcloud = new Date() - startDelivery;
            console.log(`Delivery - ${msQcloud}ms`);
            if (qcloudbd.Response.Error != undefined) {
                    ctx.throw(400,{message:{code:-8,description:qcloudbd.Response.Error}});
            }*/

            //write instance info into inventory database

            console.log("Write product info into database");
            var instanceId = 'ins-000000z1';
            //var instanceId = qcloudbd.Response.InstanceIdSet[0];
            var dboptions = {
                       method: "POST",
                       headers: {'content-type' : 'application/x-www-form-urlencoded'},
                       url:     config.dbRest.baseUrl + '/inventory/instance',
                       form:    {'orderId':orderId,'orderItemId':item.id,'userId':userId,'provider':provider,'productName':productName,'instanceId':instanceId,'region':createInsJson.Region}
                        }

            var startDb = new Date();
            var dbbody = await asyncRequest(dboptions);
//            console.log(JSON.stringify(dbbody,4,4));
            var msDB = new Date() - startDb;
            console.log(`Write ins info - ${msDB}ms`);

            instanceIds.push({"id": instanceId });

            //update item state
            item.state = "Completed";
 //           console.log(JSON.stringify(item));
			var itemOptions = {
			        method: 'PATCH',
                    headers: {'content-type' : 'application/json','Authorization': adminAccessToken},
                    url: config.eco.baseUrl + config.eco.orderPath + "/" + orderId,
                    body:    '{ "orderItem":[' + JSON.stringify(item) + ']}'
                    }

            var startPatch = new Date();
            var itembody = await asyncRequest(itemOptions);
            console.log(adminAccessToken);
            console.log(itembody);
            var msPatch = new Date() - startPatch;
            console.log(`Patch Order - ${msPatch}ms`);
        }//for items

        ctx.status = 201;
        ctx.body ='{"code":0,"instances":'+ JSON.stringify(instanceIds) + '}';
        console.log(ctx.body);
        }catch (ex){
        //item state change to Held
            if(ex.code == 'ECONNREFUSED')  {
                ex.status = 500;
                ex.message = {code:-11,description:"inventory DB:" + ex.errno}
            }
            console.log(ex);
            console.log(ex.message);
            ctx.status = parseInt(ex.status,10);
            ctx.body = ex.message;
        }
});

module.exports = router