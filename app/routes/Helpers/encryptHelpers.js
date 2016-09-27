var sjcl = require('../../../library/sjcl/sjcl.js');
var encryptKey = "my|5:7gZmb5XH688v2F4%eIn)5`DD9";
module.exports.validateDBStrings=function(inputArray){ //returns true if acceptable
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

module.exports.saltyHash=function(pass, codedSalt){
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

module.exports.makeRandomWord=function(size){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < size; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}