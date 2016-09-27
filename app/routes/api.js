
var express = require('express');
var router = express.Router();
var path = require('path');

var schemas = require('../models/models'),
    mongoose = require('mongoose'),
    sjcl = require('../../library/sjcl/sjcl.js');
var User = schemas.User,
    encryptKey = "my|5:7gZmb5XH688v2F4%eIn)5`DD9",
    rootDir = path.dirname(require.main.filename)+'\\';

var recovery = require('./passwordRecovery');

router.post('/register', require("./register") );

router.get("/email-verification*", require('./email-verification').verify );

router.post('/passwordRecover',recovery.passwordRecover);

router.get('/pass-reset*', recovery.reset);








//login junk below, already done


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

function validateDBStrings(inputArray){ //returns true if acceptable
    //what is NOT acceptable chars
    var validChars = /^[^{}<>$'"`=&?;:]+$/;
    if(!Array.isArray(inputArray)){
        if(typeof inputArray === 'string'){
            var temp = inputArray;
            inputArray = [temp];
        }else{
            return false;
        }
    }
    for(var i =0 ;i<inputArray.length;i++){
        if(!validChars.test(inputArray[i])){
            return false;
        }
    }
    return true;
}
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
    if(request.body.username && validateDBStrings(request.body.username)){
        selectObj = {username: request.body.username};
    }else if(request.body.email && validateDBStrings(request.body.email)){
        selectObj = {email: request.body.email};
    }
    return selectObj;
}

module.exports = router;