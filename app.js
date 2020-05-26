//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");

const app = express();

mongoose.connect("mongodb://localhost:27017/secretsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// defining the schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

//encrypting the password
userSchema.plugin(encrypt, {secret: process.env.DB_SECRET, encryptedFields: ["password"]});

// defining the models
const User = mongoose.model("User", userSchema);



app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set('view-engine', 'ejs');

app.get("/",(req,res)=>{
  res.render("home.ejs");
});

app.get("/login",(req,res)=>{
  res.render("login.ejs");
});

app.get("/register",(req,res)=>{
  res.render("register.ejs");
});


app.post("/register",(req,res)=>{
  const newUsername=req.body.username;
  const newPassword=req.body.password;
  //console.log(newUsername+" "+newPassword);
  const newUser = new User({
      username:newUsername,
      password:newPassword
  });
  newUser.save((err)=>{
      if(!err){
        console.log("User Added Successfully");
        res.render("secrets.ejs");
      }
      else{
        console.log(err);
      }
  });
});

app.post("/login",function(req,res){
  User.findOne({username: req.body.username
},
function(err,user){
  if(user){
    console.log(user.password);
    console.log(req.body.password);
    if(user.password===req.body.password){
      console.log("Password Matched");
      res.render("secrets.ejs");
    }
    else{
      console.log("Password Incorrect");
      res.redirect("/");
    }
  }
  else{
    console.log("User doesnt exist");
    res.redirect("/");
  }
});
});

app.listen(process.env.PORT || 3000, function() {
  var sToday = new Date();
  const sOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  };
  console.log("Initializing server at port 3000 on " + sToday.toLocaleDateString("en-us", sOptions));
});
