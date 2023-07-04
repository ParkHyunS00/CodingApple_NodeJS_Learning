// 서버를 띄우기 위한 기본 세팅
const e = require('express');
const express = require('express');
const app = express();
app.use(express.urlencoded({extended : true})); // body-parser 라이브러리 기본 포함이라 따로 설치할 필요 X
app.set('view engine', 'ejs');
require('dotenv').config({path : '../.env'});

app.use('/public', express.static('public'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

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

app.get('/search', function(req, res){
    // Query String이 담겨있는 곳 = req.query
    console.log(req.query);

    // 검색 조건
    var searchCondition = [
        {
            $search : {
                index : 'titleSearch',
                text : {
                    query : req.query.value,
                    path : "title" // 제목, 날짜 둘다 찾고싶으면 ['title', 'date']
                }
            }
        },
        { $sort : {_id : 1}}, // 검색조건 더 주기 (결과 정렬하기)
        { $limit : 10 } // 검색 결과 제한주기
    ]

    // 정확히 일치하는 것만 찾아줌 -> 해결: 정규식 사용 (/여기에 포함된 제목 모두 찾아줌/)
    // 하지만 게시물이 매우 많을 때 find 수행 매우 오래걸림 -> Binary Search사용
    // Binary Search 사용하는 Indexing 사용
    // 1. 빠른 검색, 2. or 검색 가능, 3. - 제외가능, 4. "정확히 일치하는 것" 검색 가능
    // Search Index 활용 -> aggregate()
    db.collection('post').aggregate(searchCondition).toArray(function(error, result){
        console.log(result);
        
        // 숙제
        if (result.length == 0) res.send('검색 결과가 존재하지 않습니다.');
        else{
            res.render('search.ejs', {posts : result});
        }
    })
});



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

});



const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// app.use = 미들웨어를 쓰겠다. 미들웨어란? 요청-응답 사이에 실행되는 코드
app.use(session({secret : 'aaaaaa', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
    res.render('index.ejs');
});


app.get('/login', function(req, res){
    res.render('login.ejs');
});

// autenticate() : 로그인 인증해줌, 지금 local이라는 방식으로 인증해줌
app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(req, res){

    // 성공시 여기로 페이지 이동, 실패시 '/fail' 페이지로 이동
    res.redirect('/');
});


// 로그인 한 사람만 볼 수 있는 페이지 -> 미들웨어 쓰는법, mypage로 접속시 isLogin()실행
app.get('/mypage', isLogin, function(req, res){
    console.log(req.user);
    res.render('mypage.ejs', {myClient : req.user});
});
// 로그인 했는지 검사하는 미들웨어
function isLogin(req, res, next){
    if (req.user){
        next();
    } else{
        console.log(req.user);
        res.send('로그인 하지 않았습니다.');
    }
}


// 인증하는 방법 Strategy라고 칭함
passport.use(new LocalStrategy({
    usernameField : 'id', // html 폼의 id, pwd 이름을 가진 것
    passwordField : 'pwd',
    session : true, // session 정보를 저장할것인지
    passReqToCallback : false, // 사용자가 입력한 아이디/비번 말고도 다른 정보도 검증시 true
    }, function(inputId, inputPwd, done){// 다른 정보도 검증한다면 파라미터 req 맨 앞에 추가 (req.body)

    console.log(inputId, inputPwd);
    
    db.collection('login').findOne({id : inputId}, function(error, result){ // DB에 사용자가 입력한 ID가 있는지 찾기
        if (error) return done(error);

        if (!result) return done(null, false, {message : '존재하지 않는 ID'}); // DB에서 찾은 결과가 없다면

        if (inputPwd == result.pwd){ // DB에서 찾은 결과가 있다면
            return done(null, result); // DB에서 찾은 비밀번호까지 비교, done()이란 3개의 파라미터 가짐 1. 서버에러, 2. 성공시 사용자 DB데이터
            // 3. 에러메세지
        } else {
            return done(null, false, {message : '비밀번호가 틀렸습니다.'});
        }
    })
}));

// 세션 만들기
// ID를 이용해 세션을 저장
passport.serializeUser(function(user, done){
    done(null, user.id); // 세션 데이터 만들고 세션의 ID 정보를 쿠키로 보냄
});
// 이 세션 데이터를 가진 사람을 찾아주는 것
// 로그인한 유저의 세션아이디를 바탕으로 개인정보를 DB에서 찾는 역할
passport.deserializeUser(function(id, done){
    db.collection('login').findOne({id : id}, function(error, result){
        done(null, result);
    });
});



// 회원기능 필요하면 passport 세팅한 부분이 위에 있어야 함
app.post('/register', function(req, res){
    const regex = /^[|a-z|A-Z|0-9|]+$/; // 사용자가 아이디를 알파벳, 숫자만 입력했는지 검증하기위한 정규식

    // 이미 존재하는 유저인지 찾고, 아이디 알파벳, 숫자만 입력했는지 검증
    db.collection('login').findOne({id : req.body.id}, function(error, result){
        if (result == null && regex.test(req.body.id)){
            db.collection('login').insertOne({id : req.body.id, pwd : req.body.pwd}, function(error, result){
                res.redirect('/');
            });
        } else{
            res.send('중복되거나 잘못된 아이디입니다.');
        }
    });
});

// 게시글 번호 달기 기능 추가
app.post('/add', function(req, res){
    // 총 게시물 갯수 가져오기 -> 별도 collection을 만들어서 관리, 가져옴
    db.collection('counter').findOne({name : '게시물갯수'}, function(error, result){
        var totalPosts = result.totalPosts;
        var saveData = {_id : totalPosts + 1, writer : req.user._id, title : req.body.title, date : req.body.date}

        // auto increment 기능
        db.collection('post').insertOne(saveData, function(){
            console.log(req.body.title + ' 저장 완료');

            // totalPosts 값도 같이 증가시킴, operator 사용 $set -> 값을 바꿀 때 사용, $inc -> 기존 값에 더해줄 값
            db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalPosts:1} }, function(error, result){
                if (error) {return console.log(error);}
            })
        })
    });

    res.redirect('/list')
});

app.delete('/delete', function(req, res){
    console.log(req.body);

    var deleteData = {_id : req.body._id, writer : req.user._id};

    // _id의 값은 정수값이므로 캐스팅 필요
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(deleteData, function(error, result){
        if (error) {console.log(error)}

        res.status(200).send({message : '성공했다'}); // 응답코드 200을 보내라 -> 2XX는 요청성공, 4XX는 고객 잘못으로 요청 실패, 5XX 서버 문제로 요청 실패
        // 응답코드 XXX와 메세지도 같이 보내라
    });
});

// 응용 1 - 작성자와 로그인한 사람이 일치하면 수정페이지로 이동가능하게 하도록 함
app.get('/edit/:id', function(req, res){
    var editData = {_id : parseInt(req.params.id), writer : req.user._id};

    // 수정할 게시물 찾고 넘기기
    db.collection('post').findOne(editData, function(error, result){
        if (result == null) {res.status(404).send()}
        else{
            console.log(result);
            res.render('edit.ejs', { data : result }); // DB에서 찾은 게시물
        }
    })
});

app.put('/edit', function(req, res){
    // {} 왼쪽엔 어떤 데이터를 바꿀지, 오른쪽엔 뭘로 바꿀지
    db.collection('post').updateOne({_id : parseInt(req.body.id)}, {$set : { title : req.body.title, date : req.body.date}}, function(error, result){
        res.redirect('/list'); // 수정해주고 list페이지로 이동

        // 서버에선 응답이 꼭 필요. 하지 않는다면 페이지 멈춤
    });
});