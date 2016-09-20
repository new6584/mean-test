var express = require('express'),  
    path = require('path'),
    fs = require('fs'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(),
    staticRoot = __dirname + '/',
    api = require('./app/routes/api.js'),
    mongoose = require('mongoose');

app.set('port', (process.env.PORT || 3000));

app.use(express.static(staticRoot));

// view engine setup
app.set('views', path.join(staticRoot, '\\app\\views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/')));
app.use('/', api);

app.listen(app.get('port'), function(req,res) {  
    console.log('app running on port', app.get('port'));
    mongoose.connect('mongodb://localhost/razTestDB');
    console.log('mongoose connected');
});

//should probaly seperate these to another file
var User = require('./app/models/models').User;
var sjcl = require('./library/sjcl/sjcl.js');//encription library
var encryptKey = "TEMP-KEY";

app.post('/login', function(request,response){
    var myUsername = request.body.username;
    var myEmail = request.body.email;
    //which name varification they wanna use
    var selectObj;
    if(myUsername){
        selectObj = {username: myUsername};
    }else if(myEmail){
        selectObj = {email: myEmail};
    }
    //didnt send either option
    if(!selectObj){
        response.send({error:'no name/email entered'});
        console.log("no user info from client")
        return;
    }
    //check the db
    User.find(selectObj,function(err,user){
        if(err) throw err;
        var myPass = saltyHash(request.body.password, user.salt);
        if(myPass === user.password){
            //start passport
            //send them to home page
            console.log("successful login");
        }else{
            //bad shit
            console.log("login failed")
            response.send({error:'bad pass'});
        }
    });
    response.send();
});

app.post('/register', function(request,response){
    var myUsername = request.body.username;
    var myEmail = request.body.email;
    var myDisplayname = request.body.displayname;
    //validate

    //make salt and encode 
    var mySalt = sjcl.codec.base64.fromBits(sjcl.random.randomWords(10));
    //hash password

    var myPassword = saltyHash(request.body.password, mySalt);
    //store it all
    var newUser= new User({
        username: myUsername,
        password: myPassword,
        displayname: myDisplayname,
        email: myEmail,
        salt: mySalt
    });
    newUser.save(function(err){
        if(err) throw err;
        console.log({error: "made user"});
    })

});

function saltyHash(pass, codedSalt){
    //decrpyt
    var plaintext = sjcl.decrypt(encryptKey, pass);
    //decode salt
    var mySalt = sjcl.codec.base64.toBits(codedSalt);
    //hash password
    var hKey =sjcl.misc.pbkdf2(plaintext, mySalt, 1000, 256);
    //encode
    return sjcl.codec.base64.fromBits(hKey);
}