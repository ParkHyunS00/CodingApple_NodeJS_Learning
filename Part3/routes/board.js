var router = require('express').Router();

router.get('/sports', function(req, res){
    res.send('Sports Board');
});

router.get('/game', function(req, res){
    res.send('Game Board');
});

module.exports = router;