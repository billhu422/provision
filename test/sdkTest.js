var sdk = require('../lib/sdk');

var data={
    serviceProvider:'qcloud',
    endpoint:'https://cvm.api.qcloud.com',
    method:'POST',
    uri:'/v2/index.php',
    timestampFormat:'UNIX',
    signatureMethod:'HmacSHA1-sha1',
    serviceName:'cvm',
    Region: 'bj',
    Action: 'DescribeInstances'
}
//console.log(sdk.generateQueryString(data));
sdk.request(data,function (error, data) {
    if(error){
        console.log(error);
    }else{
        console.log(data);
    }
})