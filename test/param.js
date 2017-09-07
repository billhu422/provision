var assign = require('object-assign')
//var qs = require('querystring')
var dotQs = require('dot-qs')
var config = require('../config');

var opts = {
    serviceName:'qcloud',
    signatureMethod:'sha1',
    timestampFormat:'UNIX',
}

var x = {}
x[config[opts.serviceName].apiParamsMapping.timestamp] =  Math.round(Date.now() / 1000);
x[config[opts.serviceName].apiParamsMapping.nonce] = Math.round(Math.random() * 65535);

console.log(x);
var param = assign(x);
console.log(param);
delete opts.timestampFormat;
var xx = dotQs.flatten(opts)
console.log(xx);

//ISO8601-UTC
var date = new Date();
date.toISOString(); //"2011-12-19T15:28:46.493Z"
console.log(date);