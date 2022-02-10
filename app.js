//jshint esversion:6
require("dotenv").config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const md5 = require('md5');
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

secret = process.env.SECRET


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
    password: md5(req.body.password)
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
      if (found.password === md5(req.body.password)) {
        res.render("secrets")
      }
    }
  })
})
app.listen(3000, function() {
  console.log("Succesfully running on port 3000");
})
