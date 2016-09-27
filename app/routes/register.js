
var errorHandler = require('./Helpers/errorHandler.js'),
    secureHelper = require('./Helpers/encryptHelpers'),
    sjcl = require('../../library/sjcl/sjcl.js'),
    schemas = require('../models/models')
    User = schemas.User,
    mongoose = require('mongoose'),
    verifyEmailer = require('../models/verifyEmailConfig.js');

module.exports = function(request,response){
    var myUsername = request.body.username;
    var myEmail = request.body.email;
    var myDisplayname = request.body.displayName;
    if(!myUsername || !myEmail || !myDisplayname ||!request.body.password){
        response.send({error:"missing_info"});
        return;
    }
    //password isnt being saved as sent
    var allInfo = [myUsername,myEmail,myDisplayname];
    if(!secureHelper.validateDBStrings(allInfo)){
        response.send({error:"invalid_chars"});
        return;
    }
    var mySalt = sjcl.codec.base64.fromBits(sjcl.random.randomWords(10));
    var myPassword = secureHelper.saltyHash(request.body.password, mySalt);
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
             errorHandler.logError('Registering User: CreateTempUser', err);
             return;
         }
        // user already exists in persistent collection... 
        if (existingPersistentUser){
            response.send({error:'taken'});
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
                response.send({verified:true});
            });
        } else {
            response.send({error:'taken'});
        }
    });
}