
var nodemailer = require('nodemailer'),
    _jade = require('jade'),
    fs = require('fs'),
    fromAddress = 'Razu.Verifier@gmail.com',
    path = require('path'),
    appRoot = path.dirname(require.main.filename)+'\\';;

var transporter = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: fromAddress,
        pass: '~RazuMusic~'
    }
});

var sendMail = function(toAddress, subject, content, next){
  var mailOptions = {
    from: "Do Not Reply <Razu.Verifier_do_not_reply@gmail.com>",
    to: toAddress,
    replyTo: fromAddress,
    subject: subject,
    html: content
  };

  transporter.sendMail(mailOptions, next);
}; 

module.exports.send = function(req,res,toAddress,subject,message, link, details){
  // specify jade template to load
  var template = appRoot + 'app\\views\\genericEmail.jade';

  // get template from file system
  fs.readFile(template, 'utf8', function(err, file){
    if(err){
      //handle errors
      console.log('GenericEmail Read File ERROR!');
      console.log(err);
      return res.send({error:'no_template'});
    }
    else {
      //compile jade template into function
      var compiledTmpl = _jade.compile(file, {filename: template});
      // set context to be used in template
      var context = {
          title: subject,
          message: message,
          details: details,
          link: link 
      };
      // get html back as a string with the context applied;
      var html = compiledTmpl(context);

      sendMail(toAddress, subject, html, function(err, response){
        if(err){
          console.log('genericEmail send mail ERROR!');
          console.log(err);
          return res.send({error:'failed to send'});
        }
        res.send({success:true});
      });
    }
  });
};