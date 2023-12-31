// 서버를 띄우기 위한 기본 세팅
const e = require('express');
const express = require('express');
const app = express();
app.use(express.urlencoded({extended : true})); // body-parser 라이브러리 기본 포함이라 따로 설치할 필요 X
app.set('view engine', 'ejs');
require('dotenv').config({path : '../.env'});

app.use('/public', express.static('public'));


// 어떤 폴더에 데이터를 저장할 것인가?
var db; 
// MongoDB 연결하기
const MongoClient =require('mongodb').MongoClient;
MongoClient.connect(process.env.DB_URL, function(error, client){
    if (error) {return console.log(error);}
    
    db = client.db('todoapp');

    // Object 형식으로 저장하기
    // db.collection('post').insertOne({이름 : 'John', 나이 : 20}, function(error, result){
    //     console.log('저장 완료');
    // });
    // _id 값 지정하지 않으면 데이터 구분하기 위한 임시 _id값 발급되어 같이 저장됨

    // DB 연결되면 할 일
    app.listen(process.env.PORT, function(){
        console.log('listening on ' + process.env.PORT)
    });
});

// 숙제 /add 라는 경로로 post요청시 데이터 2개를 보내주면, 'post' 경로에 그 데이터 저장해보기
// app.post('/add', function(req, res){
//     db.collection('post').insertOne({title : req.body.title, date : req.body.date}, function(){
//         console.log(req.body.title + '저장 완료');
//     })

//     res.send('저장 완료');
// });

app.get('/write', function(req, res){
    res.render('write.ejs');
}); 

// 저장한 데이터 보여주는 페이지 - /list로 GET 요청시 HTML 보여줌
app.get('/list', function(req, res){
    // DB에 저장된 post라는 collection안의 제목인 모든 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        res.render('list.ejs', {posts : result}); // DB에서 자료 찾은 것을 ejs파일에 집어넣기
    });
});

// 게시글 번호 달기 기능 추가
app.post('/add', function(req, res){
    // 총 게시물 갯수 가져오기 -> 별도 collection을 만들어서 관리, 가져옴
    db.collection('counter').findOne({name : '게시물갯수'}, function(error, result){
        console.log(result.totalPosts);
        var totalPosts = result.totalPosts;

        // auto increment 기능
        db.collection('post').insertOne({_id : totalPosts + 1, title : req.body.title, date : req.body.date}, function(){
            console.log(req.body.title + ' 저장 완료');

            // totalPosts 값도 같이 증가시킴, operator 사용 $set -> 값을 바꿀 때 사용, $inc -> 기존 값에 더해줄 값
            db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalPosts:1} }, function(error, result){
                if (error) {return console.log(error);}
            })
        })
    });

    res.send('저장 완료');
});

app.delete('/delete', function(req, res){
    console.log(req.body);

    // _id의 값은 정수값이므로 캐스팅 필요
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function(error, result){
        console.log('삭제 완료');
        res.status(200).send({message : '성공했다'}); // 응답코드 200을 보내라 -> 2XX는 요청성공, 4XX는 고객 잘못으로 요청 실패, 5XX 서버 문제로 요청 실패
        // 응답코드 XXX와 메세지도 같이 보내라
    });
})

// ':' (Parameter)를 사용 -> /detail/ 뒤에 어떤 문자열을 넣어도 다음 코드 실행
app.get('/detail/:id', function(req, res){
    // URL의 Parameter 중에 id라고 이름지은 Parameter
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
        // 혼자 해볼 것들 1. 없는 게시물 처리
        if (result == null) {res.status(404).send()}
        else{
            console.log(result);
            res.render('detail.ejs', { data : result }); // DB에서 찾은 게시물
        }

    })

})