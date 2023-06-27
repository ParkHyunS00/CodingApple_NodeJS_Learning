// 서버를 띄우기 위한 기본 세팅
const express = require('express');
const app = express();

// 서버 띄울 포트번호, 띄운 후 실행할 코드
app.listen(8080, function(){
    console.log('listening on 8080')
});

// 간단한 GET 요청 만들어보기
app.get('/hello', function(req, res){
    res.send('Hello');
});

// 숙제 /beauty로 GET 요청시 안내문 띄워주기
app.get('/beauty', function(req, res){
    res.send('Beauty!');
});

/* ------------------ Part 1 간단한 GET 요청 처리해보기 ------------------ */

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html');
});