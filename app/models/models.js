var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    username: { type: String,  unique: true, required: true},
    password: {type: String , required: true},
    displayName: {type: String, unique:true, required: true},
    email:  {type: String, unique: true, required: true},
    salt: {type: String,required:true},
    resetToken :{type: String, unique:true}
  }
);
userSchema.index({username: 1})
var User = mongoose.model('User', userSchema, 'User');

var tempUserSchema = new Schema(
  {
    username: { type: String,  unique: true, required: true},
    password: {type: String , required: true},
    displayName: {type: String, unique:true, required: true},
    email:  {type: String, unique: true, required: true},
    salt: {type: String,required:true},
    resetToken :{type: String, unique:true},
    GENERATED_VERIFYING_URL: {type:String}
  }
);
tempUserSchema.index({username:1})
var TempUser = mongoose.model('TempUser',tempUserSchema,'TempUser');

module.exports = {
  User: User,
  TempUser: TempUser
};