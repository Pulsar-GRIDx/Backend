var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/swagger-ui', function(req, res, next) {
  res.render('swagger-ui', { title: 'Express' });
});






module.exports = router;
