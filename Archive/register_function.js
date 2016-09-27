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