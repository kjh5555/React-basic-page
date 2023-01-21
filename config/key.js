// 개발환경에 따른 키값 설정

if(process.env.NODE_ENV === 'production'){
    module.exports = require('./prod');
}else{
    module.exports = require('./dev');
}

