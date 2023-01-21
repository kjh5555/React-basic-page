//백엔드 시작점

const express = require('express');
const app = express();
const port = 5000;
const { User } = require('./models/User');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/key');

//application/x-www-form-urlencoded를 분석해서 가져옴
app.use(bodyParser.urlencoded({extended:true}));

//application/json파일을 가져올 수 있게 사용
app.use(bodyParser.json());





//몽구스 연결
mongoose.connect(config.mongoURI)
.then(()=>console.log('MongoDB Connected...'))
.catch(err=>console.log(err));



app.get('/',(req,res)=> res.send('Hello World 하이루'));


//회원가입을 위한 라우터

app.post('/register', (req,res)=> {
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













app.listen(port,()=> console.log('Example app listening on port ${port}!'));
