var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    username: { type: String,  unique: true, required: true},
    password: {type: String , required: true},
    displayName: {type: String, required: true},
    email:  {type: String, unique: true, required: true},
    salt: {type:String,required:true}
  }
);


userSchema.index({username: 1})

var User = mongoose.model('User', userSchema, 'User');

module.exports = {
  User: User
};