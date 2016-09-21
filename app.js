var express = require('express'),  
    path = require('path'),
    fs = require('fs'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(),
    staticRoot = __dirname + '/',
    api = require('./app/routes/api.js'),
    schemas = require('./app/models/models'),
    mongoose = require('mongoose'),
    emailer = require('email-verification')(mongoose);

app.set('port', (process.env.PORT || 3000));
app.use(express.static(staticRoot));
mongoose.connect('mongodb://localhost/razTestDB');
console.log('mongoose connected');

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
});

//should probaly seperate these to another file
var User = schemas.User;
var sjcl = require('./library/sjcl/sjcl.js');//encription library

/**********************************temp*ssl*replacement***************************************************/
var encryptKey = makeRandomWord();
function makeRandomWord(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
/***********************************temp*ssl*replacement**************************************************/

/******************************verification**************************************/
emailer.configure({
    verificationURL: staticRoot+'email-verification?id=${URL}',
    persistentUserModel: User,
    tempUserCollection: 'razu_TempUser',

    transportOptions: {
        service: 'Gmail',
        auth: {
            user: 'Razu.Verifier@gmail.com',
            pass: '~RazuMusic~'
        }
    },
    verifyMailOptions: {
        from: 'Do Not Reply <Razu.Verifier_do_not_reply@gmail.com>',
        subject: 'Please confirm Razu account',
        html: 'Click the following link to confirm your account:</p><a href="'+staticRoot+'${URL}">${URL}</a></p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    }
}, function(error, options){
    if(error){
        console.log(error);
    }
});

var TempUser = schemas.TempUser;
emailer.configure({
    tempUserModel: TempUser
}, function(error, options){
    if(error){
        console.log(error);
    }
});

app.post('/register', function(request,response){
    var myUsername = request.body.username;
    var myEmail = request.body.email;
    var myDisplayname = request.body.displayName;
    var mySalt = sjcl.codec.base64.fromBits(sjcl.random.randomWords(10));
    //var mySalt = Buffer.alloc(rawSalt.length, rawSalt, 'base64');
    //hash password
    var myPassword = saltyHash(request.body.password, mySalt);
    var newUser= new User({
        username: myUsername,
        password: myPassword,
        displayName: myDisplayname,
        email: myEmail,
        salt: mySalt
    });
    emailer.createTempUser(newUser,function(err, existingPersistentUser, newTempUser){
         if (err){
             console.log(err);
         }
        // user already exists in persistent collection... 
        if (existingPersistentUser){
            sendToClient(response,{error:'taken'});
            console.log('register- info taken');
            return;
        }
        // a new user 
        if (newTempUser) {
            var URL = newTempUser[emailer.options.URLFieldName];
            emailer.sendVerificationEmail(myEmail, URL, function(err, info) {
                if (err){
                   console.log(err); 
                }
                console.log('sucess verification');
                sendToClient(response,{verified:true});
            });
        } else {
            console.log('temp user exists');
            sendToClient(response,{error:'taken'});
        }
    });
});//end /register

app.get("/email-verification*",function(request,response){
    var url = request.query.id;
    emailer.confirmTempUser(url,function(err,user){
        if(err){
            console.log(err);
        }
        if(user){
            emailer.sendConfirmationEmail(user['email'],function(err,info){
                //redirect
                console.log("got here");
                response.redirect(staticRoot+"working");
            });
        }else{
            //redirect 
            console.log('redir to signup');
        }

    });
});

/******************************verification**************************************/

app.post('/nossl',function(request,response){
    sendToClient(response,{userVal:encryptKey});
});
app.post('/login', function(request,response){
    login(request,response);
});

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

function saltyHash(pass, codedSalt){
    //var codedSalt = saltBuffer.toString('base64');
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