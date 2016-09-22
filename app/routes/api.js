
var express = require('express');
var router = express.Router();
var path = require('path');

var schemas = require('../models/models'),
    mongoose = require('mongoose'),
    verifyEmailer = require('../models/verifyEmailConfig.js')(mongoose),
    genericMailer = require('../models/genericMailer.js'),
    sjcl = require('../../library/sjcl/sjcl.js');

var User = schemas.User,
    encryptKey = makeRandomWord(10),
    rootDir = path.dirname(require.main.filename)+'\\',
    passResetKey = "my|5:7gZmb5XH688v2F4%eIn)5`DD9";

router.post('/register', function(request,response){
    var myUsername = request.body.username;
    var myEmail = request.body.email;
    var myDisplayname = request.body.displayName;
    if(!myUsername || !myEmail || !myDisplayname ||!request.body.password){
        sendToClient(response,{error:"missing_info"});
        return;
    }
    var mySalt = sjcl.codec.base64.fromBits(sjcl.random.randomWords(10));
    var myPassword = saltyHash(request.body.password, mySalt);
    var newUser= new User({
        username: myUsername,
        password: myPassword,
        displayName: myDisplayname,
        email: myEmail,
        salt: mySalt,
        resetToken: ""
    });
    verifyEmailer.createTempUser(newUser,function(err, existingPersistentUser, newTempUser){
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
            var URL = newTempUser[verifyEmailer.options.URLFieldName];
            verifyEmailer.sendVerificationEmail(myEmail, URL, function(err, info) {
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
    if(!url){
        //response.render(rootDir+'app\\views\\404.html');
    }
    verifyEmailer.confirmTempUser(url,function(err,user){
        if(err){
            handleError("Email-Verification: Migrating TempUser",err);
            //response.render(rootDir+'app\\views\\error');
            return;
        }
        if(user){
            verifyEmailer.sendConfirmationEmail(user['email'],function(err,info){
                //response.render(rootDir+'app\\views\\');//user page
            });
        }else{
            //signup expired
            //response.render(rootDir+'app\\views\\expired.html');
        }

    });
});

router.post('/nossl',function(request,response){
    sendToClient(response,{userVal:encryptKey});
});

router.post('/login', function(request,response){
    //which name varification they wanna use
    var selectObj = getCredentials(request);
    if(!selectObj){
        sendToClient(response,{error:"no_username"});
        return;
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

router.post('/passwordRecover',function(request,response){
    var selectObj = getCredentials(request);
    if(!selectObj){
        sendToClient(response,{error:"no_username"});
        return;
    }
    User.find(selectObj,function(err,user){
        if(err){ handleError("PassRecovery-Search Users: ",err); return; }
        if(user.length != 1){
            sendToClient(response,{error:"username_dne"});
            return; 
        }
        //generate link
        var encryptedLink =  sjcl.encrypt(passResetKey, makeRandomWord(30));
        user.resetToken ='fuck';
        
        var email = user[0].email;
        var subject = "Razu Password Reset <do not reply>";
        var message = "Click the link below and follow the instructions to reset your password";
        var link = rootDir+"?id="+encryptedLink;
        //send email with password reset link
        genericMailer.send(request,response,email,subject,message,link);
    });
});
//HELPER FUNCTIONS//
function saltyHash(pass, codedSalt){
    var plaintext;
    try{
        plaintext = sjcl.decrypt(encryptKey, pass);
    }catch(err){
        console.log('non matching keys');
        return null;
    }
    var mySalt = sjcl.codec.base64.toBits(codedSalt);
    var hKey =sjcl.misc.pbkdf2(plaintext, mySalt, 1000, 256);
    return sjcl.codec.base64.fromBits(hKey);
}
function makeRandomWord(size){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < size; i++ )
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
function getCredentials(request){
    var selectObj = null;
    if(request.body.username){
        selectObj = {username: request.body.username};
    }else if(request.body.email){
        selectObj = {email: request.body.email};
    }
    return selectObj;
}

module.exports = router;