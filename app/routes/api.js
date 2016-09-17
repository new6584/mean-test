var express = require('express'); //server side paths
var router = express.Router();
var path = require('path');
/* GET home page. */
router.get('/', function(req, res, next) {
   console.log("received");
   console.log(res); 
   res.render('index.html');
});
// router.get('/okay',function(req,res,next){
//    console.log("received");
//    console.log(res); 
// });

module.exports = router;