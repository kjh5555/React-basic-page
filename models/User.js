//User에 관한 데이터모델 생성 

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


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


//유저스키마를 모델에 담아서 index의 'save'를 실행하기전에 먼저실행 middleware개념?
userSchema.pre('save',function(next){
    var user = this; //this는 스키마를 가르킴
    //현재는 'save'가 동작할 때 작동하는데 password가 변할 때만 바꾼다고 조건 설정
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err,salt){
            if(err) return next(err)
            //에러체킹 후 에러나면 index의 'save'로 보냄
            bcrypt.hash(user.password, salt, function(err,hash){
                //user.password는 해시함수 적용전 비밀번호
                if(err) return next(err)
                //에러체킹 후 에러나면 index의 'save'로 보냄
                user.password = hash
                //에러가 없다면 user.password에 암호화된 비밀번호로 바꿔줌
                next()
                //미들웨어탈출해서 'save'로 돌아감
            })
        })
    }else{
        next()
        //비밀번호 변경이 아니면 그냥 미들웨어탈출
    }
})


userSchema.methods.comparePassword = function(planePassword , cb){
    //planePassword는 해시적용전 비밀번호
    //comparePassword라는 함수를 만들어 암호화 전의 비밀번호와 후의 비밀번호가 맞는지 판단
    bcrypt.compare(planePassword, this.password,function(err,isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })
}


userSchema.methods.generateToken = function(cb){
    var user = this;
    //jsonwebtoken을 이용해서 토큰생성
    var token = jwt.sign(user._id.toHexString(),'secretToken')
    //secretToken과 user_id를 합쳐서 토큰을 발급
    user.token = token
    // user내의 토큰값에 토큰 담기

    user.save(function(err,user){
        //유저정보를 저장
        if(err) return cb(err)
        //에러시 index에 에러를 콜백으로 넘김
        cb(null,user)
        //에러없으면 index에 err는 null, user정보 넘김
    })

}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    //토큰을 디코딩한다

    jwt.verify(token, 'secretToken', function(err,decoded){
        //유저아이디를 이용해서 유저를 찾은 다음
        // 클라이언트에서 가져온 토큰과 비교
        user.findOne({ "id" : decoded, "token" : token},function(err,user){
            if(err) return cb(err);
            cb(null,user)
        })
    })
}




//유저스키마를 User라는 이름의 모델로 감쌈
const User = mongoose.model('User',userSchema);

//User라는 모듈을 다른곳에서도 사용하게 export
module.exports = {User};