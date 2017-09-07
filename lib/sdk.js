const request = require('request'),
        assign = require('object-assign'),
        qs = require('querystring'),
        dotQs = require('dot-qs'),
        crypto = require('crypto'),
        config = require('../config');

var sdk={};
/**
 * @param {Object}data
 * @param {String} data.endpoint = 'https://cvm.api.qcloud.com' API服务地址
 * @param {String} data.uri = '/v2/index.php' API求路径
 * @param {String} data.method = 'POST' API请求方法
 * @param {String} data.serviceProvider = 'qcloud' API服务提供商名称,根据名称从本地配置文件获取secretId和secretKey
 * @param {String} data.serviceName = 'cvm' API服务名称
 * @param {String} data.timestampFormat = 'UNIX' 时间戳格式，目前只支持UNIX和ISO8601-UTC
 * @param {String} data.signatureMethod = 'sha1' API请求的加密算法，例如sha1，sha256
 */


/**
 * 生成 API 的请求地址
 * @param {Object} data
 * @returns {string}
 */
sdk.generateUrl = function(data) {
    data = data || {}

    return data.endpoint + data.uri;
}

/**
 * 生成请求参数.
 * @param {Object} data 该次请求的参数. 同 `request` 方法的 `data` 参数
 * @param {Object} [opts] 请求配置. 同 `request` 方法的 `opts` 参数,opts.brand,opts.signMethod
 * @returns {string} 包括签名的参数字符串
 */

sdk.generateQueryString = function(data) {
    data = data || {}

    //附上必要参数
    var  args = {};
    //计算timestamp
    if(data.timestampFormat.toUpperCase() === 'UNIX'){
        args[config[data.serviceProvider].apiParamsMapping.timestamp] = Math.round(Date.now() / 1000);
    }else if(data.timestampFormat.toUpperCase() === 'ISO8601-UTC'){
        var date = new Date();
        args[config[data.serviceProvider].apiParamsMapping.timestamp] = date.toISOString();
    }else {
        args[config[data.serviceProvider].apiParamsMapping.timestamp] = undefined;
    }
    //计算nonce
    args[config[data.serviceProvider].apiParamsMapping.nonce] = Math.round(Math.random() * 65535);
    //获取SecretKey
    args[config[data.serviceProvider].apiParamsMapping.secretId]=config[data.serviceProvider].key.secretId;
    //设置签名算法 <算法名称>-sha1/ <算法名称>-sha256
    args[config[data.serviceProvider].apiParamsMapping.signatureMethod]=data.signatureMethod.split('-')[0];

    if(process.env.NODE_ENV === 'debug')  console.log(args);
    var param = assign(args, data);

    //清除不需要发送到服务的参数
    delete param.serviceProvider;
    delete param.signatureMethod;
    delete param.timestampFormat;
    delete param.serviceName;
    delete param.endpoint;
    delete param.method;
    delete param.uri;


    param = dotQs.flatten(param);
    var keys = Object.keys(param);
    var qstr = '', signStr;
    var host = this._getHost(data);
    var method = (data.method || {}).toUpperCase()

    keys.sort()
    if(process.env.NODE_ENV === 'debug')   console.log(keys);
    //拼接 querystring, 注意这里拼接的参数要和下面 `qs.stringify` 里的参数一致
    //暂不支持纯数字键值及空字符串键值
    keys.forEach(function(key) {
      var val = param[key]
      // 排除上传文件的参数
      if(method === 'POST' && val && val[0] === '@'){
        return
      }
      if(key === '') {
        return
      }
      if(val === undefined || val === null || (typeof val === 'number' && isNaN(val))) {
        val = ''
      }
      //把参数中的 "_" (除开开头)替换成 "."
      qstr += '&' + (key.indexOf('_') ? key.replace(/_/g, '.') : key )+ '=' + val
    })

    qstr = qstr.slice(1)
    if(process.env.NODE_ENV === 'debug')  console.log(method + host + data.uri + '?' + qstr);
    signStr = this.sign(method + host + data.uri + '?' + qstr, data.signatureMethod.toLowerCase().split('-')[1], config[data.serviceProvider].key.secretKey);

    param[config[data.serviceProvider].apiParamsMapping.signature] = signStr;

    return qs.stringify(param)
}

/**
 * 请求 API
 * @param {Object} data 该次请求的参数.
 * @param {Object} [data.secretId] Api SecrectId, 通过 `data` 参数传入时将覆盖 `opt` 传入及默认的 `secretId`
 * @param {Object} [opts] 请求配置. 配置里的参数缺省使用默认配置 (`this.defaults`) 里的对应项
 * @param {String} opts.host 该次请求使用的 API host. 当传入该参数的时候, 将忽略 `serviceType` 及默认 `host`
 * @param {requestCallback} callback 请求回调
 * @param {Object} [extra] 传给 request 库的额外参数
 */
sdk.request = function(data,callback,extra) {

    var callback = callback;

    var url = this.generateUrl(data)
    var method = data.method.toUpperCase()
    var dataStr = this.generateQueryString(data)
    var option = {url: url, method: method, json: true, strictSSL: false}

    if(method === 'POST') {
        option.form = qs.parse(dataStr)
    }else{
        option.url += '?' + dataStr
    }

    assign(option, extra);

    request(option, function(error, response, body) {
      /**
       * `.request` 的请求回调
       * @callback requestCallback
       * @param {Error} error 请求错误
       * @param {Object} body API 请求结果
       **/
        callback(error, body)
    })
}


/**
 * 生成签名
 * @param {String} str 需签名的参数串
 * @param {String} signMethod sha1,sha256 默认是sha1
 * @param {String} secretKey
 * @returns {String} 签名
 */
sdk.sign = function(str, signMethod , secretKey) {
    var hmac = crypto.createHmac( signMethod ||'sha1', secretKey || '')
    return hmac.update(new Buffer(str, 'utf8')).digest('base64')
}

/**
 * 获取 API host
 * @param opts 请求配置
 * @param {String} [opts.host] 如果配置中直接传入 host, 则直接返回该 host
 * @returns {String}
 * @private
 */
sdk._getHost = function(data) {
    var host = data.host
    if(!host || data.endpoint) {
        host = data.endpoint.split('//').length > 1 ? data.endpoint.split('//')[1]:data.endpoint;
    }
    return host
}

module.exports = sdk
