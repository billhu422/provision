var config = {};
config.biz = {};
config.qcloud = {};
config.aliyun = {};


config.dbConnection = 'mysql://sequelize_test:sequelize_test@192.168.87.152:8999/sequelize_test';
//biz
config.biz.oauth = {
    account_server: 'http://124.251.62.217:8000',
    //account_server: 'http://192.168.87.152:8000',
    client_id: '9c9bca6d26234ff98fb93df3e3d065c5',
    client_secret: 'e1396a545ace426a941c0edfd3403d0f',
    grant_type : 'password',
    username : 'bbb',
    email:'laoguo.cn@gmail.com',
    password: '12345',
};

config.biz.api = {
    endpoint:'http://124.251.62.215:8000',
    productOrderURI:'/DSProductOrdering/api/productOrdering/v2/productOrder',
    productSpecURI:'/DSProductCatalog/api/catalogManagement/v2/productSpecification'
};

//cloud provider
//qcloud
config.qcloud.key = {
    secretId: 'AKID2sYy826AMHzTjoMHemobCcXHm47vLoul',
    secretKey: 'mLjxwgDVebNtEKEvPeePuBCxTjlopfGg',
};
config.qcloud.apiParamsMapping = {
    secretId: 'SecretId',
    signature: 'Signature',
    signatureMethod: 'SignatureMethod',
    timestamp: 'Timestamp',
    nonce:'Nonce',
};
//aliyun
config.aliyun.key = {
    SecretId: 'LTAIzgYvg0hVfNMK',
    SecretKey: '3ExrKEf611ODomcjdpWus8mX4JIsJ4',
};

config.aliyun.apiParamsMapping = {
    SecretId: 'AccessKeyId',
    signature: 'Signature',
    signatureMethod: 'SignatureMethod',
    timestamp: 'Timestamp',
    nonce:'SignatureNonce'
};

module.exports = config;
