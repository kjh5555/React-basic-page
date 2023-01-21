//백엔드 시작점

const express = require('express');
const app = express();
const port = 5000;
const { User } = require('./models/User');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/key');
const {auth} = require('./middleware/auth');
//key에서 개발환경에 따른 DB url 가져옴


//application/x-www-form-urlencoded를 분석해서 가져옴
app.use(bodyParser.urlencoded({extended:true}));

//application/json파일을 가져올 수 있게 사용
app.use(bodyParser.json());
app.use(cookieParser())




//몽구스 연결
mongoose.connect(config.mongoURI)
.then(()=>console.log('MongoDB Connected...'))
.catch(err=>console.log(err));



app.get('/',(req,res)=> res.send('Hello World 하이루'));


//회원가입을 위한 라우터

app.post('/api/users/register', (req,res)=> {
// 보내주는 값을 클라에서 가져오면 DB에 넣어줌     
    const user = new User(req.body)
                            //req.body에 회원가입 데이터 들어있음
    user.save((err,userInfo)=>{
        //mongodb저장
        if(err) return res.json({success:false, err}) //에러 리턴시 메세지 표기
        return res.status(200).json({
            success:true
        })
    })

})

//로그인을 위한 라우터

app.post('/api/users/login',(req,res)=>{

    //요청된 이메일을 DB에 있는지 확인한다.
    User.findOne({ email: req.body.email} , (err, user)=>{
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
   

    //이메일이 있다면 비밀번호와 맞는지 확인한다
    // 비밀번호 확인을 위해 user.js의 만든 함수호출
        user.comparePassword(req.body.password, (err, isMatch)=>{
            if(!isMatch)
            return res.json({ loginSuccess : false, message : "비밀번호가 틀렸습니다."})

    // 비밀번호가 맞다면 토큰생성
    
        user.generateToken((err,user)=>{
            if(err) return res.status(400).send(err);
            //에러가 나면 400을보내줌
            // 토큰을 저장한다. 쿠키에
                res.cookie("x_auth",user.token)
                .status(200)
                .json({
                    loginSuccess : true,
                    userId: user._id
                })
             })              
         }) 
    })
})


//인증 라우터


app.get('/api/users/auth',auth,(req,res)=>{
    //여기까지 온거면 미들웨어를 통과했음
    //인증이 True라는 소리

    res.status(200).json({
        _id : req.user._id,
        name: req.user.name,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth : true,
        email : req.user.email,
        lastname : req.user.lastName,
        role : req.user.role,
        image : req.user.image
    })


})

//로그아웃 라우터

app.get('/api/users/logout',auth,(req,res)=>{
    //auth 미들웨어에서 보내준 req사용
    User.findOneAndUpdate({ _id: req.user._id},
        {token : ""},
        (err,user)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success:true
            })
        })
})







app.listen(port,()=> console.log('Example app listening on port ${port}!'));
