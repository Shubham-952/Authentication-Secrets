//jshint esversion:6
require("dotenv").config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const saltRounds = 10
const app = express()
url = "mongodb://localhost:27017/userDB"
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set("view engine", "ejs")
app.use(express.static("public"))

app.use(session({
  secret: "our little secret.",
  resave: false,
  saveUninitialized: false,

}))

app.use(passport.initialize())
app.use(passport.session())

userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId : String,
  secret: String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

secret = process.env.SECRET
mongoose.connect(url)


User = mongoose.model("user", userSchema)

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done){
  done(null, user.id)
})

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user)
  })
})


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res) {
  res.render("home")
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });

app.get("/login", function(req, res) {
  res.render("login")
})

app.get("/logout", function(req, res) {
  req.logout()
  res.redirect("/")
})

app.get("/submit", function(req, res) {
  if(req.isAuthenticated()){
    res.render("submit")
  }else{
    res.redirect("/login")
  }
})

app.get("/register", function(req, res) {
  res.render("register")
})

app.get("/secrets",function(req, res){
  User.find({"secret":{$ne: null}}, function(err, foundUsers){
    if(err){
      console.log(err);
    }else{
      if(foundUsers){
        res.render("secrets",{userWithSecrets: foundUsers})
      }
    }
  })
  // if(req.isAuthenticated()){
  //   res.render("secrets")
  // }else{
  //   res.redirect("/login")
  // }
})

app.post("/register", function(req, res) {
  User.register({username:req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register")
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  })


  // let myPlainTextPassword = req.body.password
  // bcrypt.hash(myPlainTextPassword, saltRounds, function(err, hash){
  //   user = new User({
  //     email: req.body.username,
  //     password: hash
  //   })
  //   user.save(function(err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.render("secrets")
  //     }
  //   })
  // })

})

app.post("/submit",function(req, res){
  submittedSecret = req.body.secret
  User.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        foundUser.secret = submittedSecret
        foundUser.save(function(err){
          if(err){
            console.log(err);
          }else{
            res.redirect("/secrets")
          }
        })
      }
    }
  })
})

app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      })
    }
  })



  // User.findOne({
  //   email: req.body.username
  // }, function(err, found) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     let myPlainTextPassword = req.body.password
  //
  //     bcrypt.compare(myPlainTextPassword, found.password, function(err, result){
  //       if (result) {
  //         res.render("secrets")
  //       }
  //     })
  //
  //
  //   }
  // })
})


app.listen(3000, function() {
  console.log("Succesfully running on port 3000");
})
