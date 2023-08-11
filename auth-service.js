const bcrypt = require('bcryptjs');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": String,
    "password": String,
    "email": String,
    "loginHistory" : [{"dateTime": Date, "userAgent": String}]
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://Monil:Monil0812@web322.j3jvj6u.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); 
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
  return new Promise(async (resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject(new Error("Passwords do not match"));
    } else {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const newUser = new User({
          userName: userData.userName,
          password: hashedPassword,
          email: userData.email,
        });

        newUser.save()
          .then(() => {
            resolve(); 
          })
          .catch((err) => {
            if (err.code === 11000) {
              reject(new Error("User Name already taken"));
            } else {
              reject(new Error("There was an error creating the user: " + err.message));
            }
          });
      } catch (hashError) {
        reject(new Error("There was an error encrypting the password"));
      }
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .then(async (users) => {
        if (users == false) {
          reject(new Error("Unable to find user: " + userData.userName));
          return;
        } 
        bcrypt.compare(userData.password, users.password)
        .then((result) => {
          if (result === false) {
            reject(new Error("Incorrect Password for user: " + userData.userName));
          } else {
          users.loginHistory.push({
            dateTime: new Date().toString(),
            userAgent: userData.userAgent
          });

          User.updateOne(
            { userName: users.userName },
            { $set: { loginHistory: users.loginHistory } }
          )
          .then(() => {
            resolve(users);
          })
          .catch((err) => {
            reject(new Error("There was an error verifying the user: " + err));
          });
        }
      })
      .catch(() => {
        reject(new Error("Unable to find user: " + userData.userName));
      });
  });
});
}