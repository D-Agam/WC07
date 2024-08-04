const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const e = require("express");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
let db;
var name1="User";
var msg="Good to have you back!!";
connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
    db = getDb();
  } else {
    console.log("No connection");
  }
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs",{msg:msg});
});
app.post("/login",async (req,res)=>{
    const { name, password} = req.body;
    try{
        const check=await db
        .collection("login").findOne({user_name:name,password:password});
        if(check){
          name1=name;
            msg=("Login success");
            res.render("main.ejs",{name:name1});
        }
        msg=("Wrong password or name");
        res.render("login.ejs",{msg:msg});
    }catch(error){
        msg="Please, try again.";
        console.log("Error during login ",error);
        res.render("login.ejs",{msg:msg})
    }
})


app.get("/signup", (req, res) => {
  res.render("signup.ejs",{msg:msg});
});
app.post("/signup", async (req, res) => {
  const { name, password, contact } = req.body;
  if (contact.length !== 10) {
    msg="Invalid contact";
    return res.render("/signup",{msg:msg});
  }

  try {
    const existingUser = await db
      .collection("login")
      .findOne({ phonenumber: contact });

    if (existingUser) {
      msg=("User already exists. Please, login");
      return res.render("/signup.ejs",{msg:msg});
    }

    await db.collection("login").insertOne({
      user_name: name,
      phonenumber: contact,
      password: password,
    });
    name1=name;
    msg=("User login success");
    return res.render("/main.ejs",{name:name1});
  } catch (error) {
    msg="Error please signup again";
    console.error("Error during signup:", error);
    return res.render("/signup.ejs",{msg:msg});
  }
});

app.listen(3001, () => {
  console.log("Server started");
});
