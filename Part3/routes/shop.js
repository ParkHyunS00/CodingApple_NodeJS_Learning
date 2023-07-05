var router = require('express').Router(); // 라우터 파일에서 필수

// 로그인 했는지 검사하는 미들웨어
function isLogin(req, res, next){
    if (req.user){
        next();
    } else{
        console.log(req.user);
        res.send('로그인 하지 않았습니다.');
    }
}

// 모든 라우터에 미들웨어 적용
router.use(isLogin);
// 특정 URL에만 적용하는 미들웨어
router.use('/shirts', isLogin);

// 특정 라우터파일에 미들웨어 적용
router.get('/shirts', isLogin, function(req, res){
    res.send('Shirts Page');
});

router.get('/pants', isLogin, function(req, res){
    res.send('Pants Page');
});


module.exports = router; // js파일을 다른 파일에서 갖다 쓰려고 할 때 사용
// module.exports = 내보낼 변수명
// require() 다른 파일이나 라이브러리를 여기에 첨부하겠다.