
var schemas = require('../models/models'),
    verifyEmailer = require('../models/verifyEmailConfig.js'),
    errorHandler = require('./Helpers/errorHandler.js'),
    secureHelper = require('./Helpers/encryptHelpers');

module.exports.verify = function(request,response){ //.get function
    var url = request.query.id;
    console.log('got here');
    if(!url || !secureHelper.validateDBStrings([url])){
        //response.render(rootDir+'app\\views\\404.html');
        response.send({success:false});
        return;
    }
    verifyEmailer.confirmTempUser(url,function(err,user){
        if(err){
            errorHandler.logError("Email-Verification: Migrating TempUser",err);
            //response.render(rootDir+'app\\views\\error');
            response.send({success:false});
            return;
        }
        if(user){
            verifyEmailer.sendConfirmationEmail(user['email'],function(err,info){
                if(err){errorHandler.logError("Sending confirmation email",err);}
                //response.render(rootDir+'app\\views\\');//user page
                response.send({success:true});
            });
        }else{
            //signup expired
            //response.render(rootDir+'app\\views\\expired.html');
            response.send({success:false});
        }

    });
}