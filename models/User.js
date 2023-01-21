const mongoose = require('mongoose');

//유저 스키마 정의
const userSchema = mongoose.Schema({
    name : {
        type: String,
        maxlength : 50,
    },
    email : {
        type : String,
        trim:true,
        unique:1
    },
    password : {
        type:String,
        minlength:5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type:Number,
        default:0
    },
    image: String,
    token:{
        type:String
    },
    tokenExp:{
        type:Number
    }

})


//유저스키마를 User라는 이름의 모델로 감쌈
const User = mongoose.model('User',userSchema);

//User라는 모듈을 다른곳에서도 사용하게 export
module.exports = {User};