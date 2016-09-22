
var express = require('express');//response.render('a.html')
var router = express.Router();
var path = require('path');

var schemas = require('../models/models'),
    mongoose = require('mongoose'),
    emailer = require('../models/emailConfig.js')(mongoose);
    sjcl = require('../../library/sjcl/sjcl.js');

var User = schemas.User,
    encryptKey = makeRandomWord(),
    rootDir = path.dirname(require.main.filename)+'\\';

router.post('/register', function(request,response){
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
             handleError('Registering User: CreateTempUser', err);
             return;
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
                   handleError('Making TempUser', err)
                   return;
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

router.get("/email-verification*",function(request,response){
    var url = request.query.id;
    emailer.confirmTempUser(url,function(err,user){
        if(err){
            handleError("Email-Verification: Migrating TempUser",err);
            response.render(rootDir+'app\\views\\error');
            return;
        }
        if(user){
            emailer.sendConfirmationEmail(user['email'],function(err,info){
                response.render(rootDir+'app\\views\\');//user page
            });
        }else{
            //signup expired
            response.render(rootDir+'app\\views\\expired.html');
        }

    });
});

router.post('/nossl',function(request,response){
    sendToClient(response,{userVal:encryptKey});
});

router.post('/login', function(request,response){
    //which name varification they wanna use
    var selectObj;
    if(request.body.username){
        selectObj = {username: request.body.username};
    }else if(request.body.email){
        selectObj = {email: request.body.email};
    }else{
        sendToClient(response,{error:"no_username"});
    }

    //check the db
    User.find(selectObj,function(err,user){
        if(err){ handleError("Login-Search Users: ",err); return; }

        if(user.length != 1){
            sendToClient(response,{error:"username_dne"});
            return; 
        }
        var myPass = saltyHash(request.body.password, user[0].salt);

        if(myPass == user[0].password){
            //TODO: start passport, redirect user
            sendToClient(response,{success:true});
        }else{
            sendToClient(response,{error:"wrong_password"});
        }

    });
});

//HELPER FUNCTIONS//
function saltyHash(pass, codedSalt){
    var plaintext = sjcl.decrypt(encryptKey, pass);
    var mySalt = sjcl.codec.base64.toBits(codedSalt);
    var hKey =sjcl.misc.pbkdf2(plaintext, mySalt, 1000, 256);
    return sjcl.codec.base64.fromBits(hKey);
}
function makeRandomWord(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function sendToClient(response, obj){
    response.send(obj);
}
function handleError(where,error){
    console.log(where);
    console.log(error);
}

module.exports = router;