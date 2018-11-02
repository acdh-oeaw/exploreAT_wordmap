var express = require('express')
  , router = express.Router()
  , fs = require('fs');

// middleware for all requests -> if needed to preallocate
// responses to consecutive time periods
router.use(function(req, res, next){
    console.log('Api called from ');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

// routes
router.use('/api', require('./controller_example'))

router.get('/', function(req, res) {
	fs.readFile('./src/index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
})

module.exports = router
