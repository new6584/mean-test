
var errorHandler = require('./Helpers/errorHandler.js'),
    secureHelper = require('./Helpers/encryptHelpers'),
    sjcl = require('../../library/sjcl/sjcl.js'),
    User = require('../models/models').User,
    genericMailer = require('../models/genericMailer.js'),
    path = require('path'),
    rootDir = path.dirname(require.main.filename)+'\\',
    sjcl = require('../../library/sjcl/sjcl.js'),
    encryptKey = "my|5:7gZmb5XH688v2F4%eIn)5`DD9";

module.exports.passwordRecover = function(request,response){
    var selectObj = getCredentials(request);
    if(!selectObj){
        response.send({error:"no_username"});
        return;
    }
    User.find(selectObj,function(err,user){
        if(err){ errorHandler.logError("PassRecovery-Search Users: ",err); return; }
        if(user.length != 1){
            response.send({error:"username_dne"});
            return; 
        }
        //generate link
        var randomLink =  secureHelper.makeRandomWord(50);
        var toSave = secureHelper.saltyHash(sjcl.encrypt(encryptKey, randomLink), user[0].salt);
        //update
        user[0].resetToken = toSave;
        user[0].save(function(err){
            if(err){errorHandler.logError("Updating pass token", err);return;}
        });

        var email = user[0].email;
        var subject = "Razu Password Reset <do not reply>";
        var message = "Click the link below and follow the instructions to reset your password";
        var link = rootDir+"pass-reset?id="+randomLink+"&check="+user[0].username;
        //send email with password reset link
        genericMailer.send(request,response,email,subject,message,link,'');
    });
}

module.exports.reset= function(request,response){
    var userName = request.query.check;
    if(!secureHelper.validateDBStrings(userName) || !secureHelper.validateDBStrings(request.query.id)){
        //response.render(rootDir+'app\\views\\404.html');
        //they changed our string
        return;
    }
    User.find({username:userName},function(err,user){
        if(err){ errorHandler.logError("seraching reset token",err);return;}
        if(!user || !user[0]){
            console.log("password reset not requested (no user)");
            //response.render(rootDir+'app\\views\\404.html');
            return;
        }
        if(user[0].resetToken == '' || user[0].resetToken == null){
            console.log("not requested");
            return;
        }
        var sentToken = secureHelper.saltyHash( sjcl.encrypt(encryptKey,request.query.id), user[0].salt);
        if(sentToken == user[0].resetToken ){
            var tempPassword = secureHelper.makeRandomWord(9);
            var toSave =secureHelper.saltyHash(sjcl.encrypt(encryptKey,tempPassword),user[0].salt);
            user[0].resetToken = '';
            user[0].password = toSave;
            user[0].save(function(err){
                if(err){errorHandler.logError("Updating pass token", err);return;}
            });
            var email = user[0].email;
            var subject = "Your Razu Temporary Password <do not reply>";
            var message = "Your Temporary Password: "+tempPassword;
            var details = "Don't forget to change your password next time you log in!";
            genericMailer.send(request,response,email,subject,message,'',details);
            //response.render(rootDir+'app\\views\\' );
        }else{
            //response.render(rootDir+'app\\views\\404.html');
        }
    });
}

function getCredentials(request){
    var selectObj = null;
    if(request.body.username && validateDBStrings(request.body.username)){
        selectObj = {username: request.body.username};
    }else if(request.body.email && validateDBStrings(request.body.email)){
        selectObj = {email: request.body.email};
    }
    return selectObj;
}