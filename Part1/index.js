// 서버를 띄우기 위한 기본 세팅
const express = require('express');
const app = express();
app.use(express.urlencoded({extended : true})); // body-parser 라이브러리 기본 포함이라 따로 설치할 필요 X

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
// get()함수 파라미터에 함수가 들어간다 => 콜백함수
// 순차적으로 실행하려고할 때 사용 ex) /write URL로 들어가면 sendFile함수 실행해라
// 또는 function키워드 대신 (req, res) => {} 사용 가능 ES6 문법

/* ------------------ Part 1 폼에 입력한 데이터를 서버에 전송하는 법 (POST 요청) ------------------ */
app.post('/add', (req, res) => {
    res.send(req.body);
});

/* ------------------ Part 1 REST API란 ------------------ */
// API? 서버 - 클라이언트 간 통신 방법, 이 API들을 어떤 식으로 만들어야 좋은 API인가?
// REST 원칙 1. Uniform interface - 하나의 자료는 하나의 URL로, 간결하고 예측가능하도록, URL 이름짓기 관습, 가장 중요
// 2. Client - Server 관계 구분, Client는 요청만, Server는 응답만
// 3. Stateless - 요청1, 요청2는 의존성이 없어야함
// 4. Cacheable - 서버에서 보내주는 정보들은 캐싱 가능해야함 -> 브라우저가 잘 해줌
// 5. Layered System
// 6. Code on Demand

// 좋은 REST API 예시 - www.example.com/products/66432 -> URL보고 무엇인지 예측 가능
// 이름짓기 원칙 - URL을 명사로 작성, 하위문서 나타낼 때 '/', 파일 확장자 사용X, 띄어쓰기는 대시(-)이용, 자료 하나당 하나의 URL