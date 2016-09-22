var path = require('path');
var staticRoot = path.dirname(require.main.filename)+'\\';
var schemas = require('./models');
console.log(staticRoot);
module.exports = function(mongoose){//needs an instance of 
    var emailer = require('email-verification')(mongoose);

    emailer.configure({
        verificationURL: staticRoot+'email-verification?id=${URL}',
        persistentUserModel: schemas.User,
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

    return emailer;
};