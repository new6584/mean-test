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
    login(request,response);
});

app.post('/register', function(request,response){
    var myUsername = request.body.username;
    var myEmail = request.body.email;
    var myDisplayname = request.body.displayName;

    //validate ... TODO: got to be a better way to do this
    var available;
    var conflicts ={};
    User.find({username: myUsername},function(err,user){
        if(user.length != 0){//username available
            conflicts.username= true;
        }
        User.find({email:myEmail},function(req,aUser){
            if(aUser.length!=0){
                conflicts.email = true;
            }
            User.find({displayName: myDisplayname},function(r,u){
                if(u.length!=0){
                    conflicts.displayName = true;
                }
                if(!conflicts.username && !conflicts.email && !conflicts.username){
                    //make salt and encode 
                    var mySalt = new Buffer(sjcl.codec.base64.fromBits(sjcl.random.randomWords(10)),'base64');
                    //hash password

                    var myPassword = saltyHash(request.body.password, mySalt);
                    //store it all
                    var newUser= new User({
                        username: myUsername,
                        password: myPassword,
                        displayName: myDisplayname,
                        email: myEmail,
                        salt: mySalt
                    });
                    newUser.save(function(err){//TODO: pre make sure types 
                        if(err){ 
                            console.log(err);
                            sendToClient(response,{error:"failed_to_register"});
                            return;
                            //error page?
                        }
                        //log them in using newly registered account info
                        console.log("logging in from register");
                        login(request,response);
                    });

                }else{
                    conflicts.error = "taken";
                    sendToClient(response,conflicts);
                }//end reg check
            });
        });
    });
});//end /register

function login(request,response){
    //which name varification they wanna use
    var selectObj;
    if(request.body.username){
        selectObj = {username: request.body.username};
    }else if(request.body.email){
        selectObj = {email: request.body.email};
    }

    //didnt send either option
    if(!selectObj){
        sendToClient(response,{error:"no_username"});
        console.log("no credentials")
        return;
    }

    //check the db
    User.find(selectObj,function(err,user){
        if(err){ console.log(err); }
        if(user.length != 1){
            console.log('no user of with info: '+selectObj[1]);
            sendToClient(response,{error:"username_dne"});
            return; 
        }
        var myPass = saltyHash(request.body.password, user[0].salt);

        if(myPass == user[0].password){
            //TODO: start passport, redirect user
            console.log("logged in");
        }else{
            console.log("bad pass");
            sendToClient(response,{error:"wrong_password"});
        }

    });
}

function saltyHash(pass, saltBuffer){
    var codedSalt = saltBuffer.toString('base64');
    //decrpyt
    var plaintext = sjcl.decrypt(encryptKey, pass);
    //decode salt
    var mySalt = sjcl.codec.base64.toBits(codedSalt);
    //hash password
    var hKey =sjcl.misc.pbkdf2(plaintext, mySalt, 1000, 256);
    //encode
    return sjcl.codec.base64.fromBits(hKey);
}

function sendToClient(response, obj){
    response.send(obj);
}