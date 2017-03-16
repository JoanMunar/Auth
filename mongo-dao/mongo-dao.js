var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  name: String,
  surname: String,
  username: String,
  password: String,
  roles: []
});

var User = mongoose.model('User', userSchema);

module.exports = User;
