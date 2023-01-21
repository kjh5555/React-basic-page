const {User} = require('../models/User');

let auth = (req,res, next)=>{
    //인증처리를 하는곳

    //클라이언트 쿠키에서 토큰 가져옴
    let token =req.cookies.x_auth;



    //토큰을 복호화하여 유저권한 확인
    User.findByToken(token, (err,user)=>{
        if(err) throw err;
        if(!user) return res.json({ isAuth : false, error : true})
        req.token = token;
        req.user = user;
        next();
    })


    //유저가 있으면 인증 ok 없으면 NO

}




module.exports={auth};