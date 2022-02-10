//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const app = express()
url = "mongodb://localhost:27017/userDB"
mongoose.connect(url)
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set("view engine", "ejs")
app.use(express.static("public"))
userSchema = new mongoose.Schema({
  email: String,
  password: String
})

secret = "Thisisourlittlesecret."

userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ["password"]
})

User = mongoose.model("user", userSchema)

app.get("/", function(req, res) {
  res.render("home")
})

app.get("/login", function(req, res) {
  res.render("login")
})

app.get("/logout", function(req, res) {
  res.redirect("/")
})

app.get("/submit", function(req, res) {
  res.render("submit")
})

app.get("/register", function(req, res) {
  res.render("register")
})

app.post("/register", function(req, res) {
  user = new User({
    email: req.body.username,
    password: req.body.password
  })
  user.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets")
    }
  })
})

app.post("/login", function(req, res) {
  User.findOne({
    email: req.body.username
  }, function(err, found) {
    if (err) {
      console.log(err);
    } else {
      if (found.password === req.body.password) {
        res.render("secrets")
      }
    }
  })
})
app.listen(3000, function() {
  console.log("Succesfully running on port 3000");
})
