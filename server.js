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
app.get("/offers", async (req, res) => {
  try {
    const offers = await db.collection("offers").find({}).toArray();
    res.render("offers.ejs", { offers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching offers from database');
  }
});
app.get("/orders",async (req,res)=>{
  try {
    const orders = await db.collection("login").find({user_name:name1},{orders:1}).toArray();
    res.render("orders.ejs", { orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching offers from database');
  }
});
app.get("/men",(req,res)=>{
    res.render("men.ejs",{name:name1});
});

app.get("/men_shirts", async (req, res) => {
  try {
    const product = await db.collection("men").find({"upper/lower": "shirt"}).toArray();
    res.render("men_shirts.ejs", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products from database');
  }
});
app.post("/filter", async (req, res) => {
  let { color, type, price } = req.body;
  let f = "No";

  // Set eco filter
  if (Array.isArray(type) && type.includes("eco-friendly")) {
    f = "Yes";
  } else if (type === "eco-friendly") {
    f = "Yes";
  }
  if (Array.isArray(type) && type.includes("normal")) {
    f = "No";
  } else if (type === "normal") {
    f = "No";
  }

  // Normalize checkbox values to arrays
  color = Array.isArray(color) ? color : (color ? [color] : []);
  type = Array.isArray(type) ? type : (type ? [type] : []);
  price = Array.isArray(price) ? price.map(p => parseFloat(p)) : (price ? [parseFloat(price)] : []);

  // Determine the maximum price if multiple price checkboxes are selected
  const maxPrice = price.length > 0 ? Math.max(...price) : null;

  // Build the query object dynamically
  let query = {
    "upper/lower": "shirt"
  };

  if (color.length > 0) {
    query.color = { $in: color }; // Include color filter if colors are selected
  }

  if (f === "Yes") {
    query.eco = f; // Include eco filter if eco-friendly is selected
  }else{
    query.eco="No";
  }

  if (maxPrice !== null) {
    query.price = { $lte: maxPrice }; // Include price filter if a valid price is provided
  }

  console.log("Query:", query); // Debugging output

  try {
    // Query the database
    const product = await db.collection("men").find(query).toArray();

    // Render the results
    res.render("men_shirts.ejs", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products from database');
  }
});
app.post("/compare", async (req, res) => {
  const { compare } = req.body;

  try {
      // Find all products with IDs in the compare array
      const products = await db.collection("men").find({ _id: { $in: compare.map(id => new ObjectId(id)) } }).toArray();

      res.render("compare_products.ejs", { products });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching products from the database');
  }
});

app.get("/men_jeans", async (req, res) => {
  try {
    const product = await db.collection("men").find({"upper/lower": "jeans"}).toArray();
    res.render("men_jeans.ejs", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products from database');
  }
});
app.post("/filter1", async (req, res) => {
  let { color, type, price } = req.body;
  let f = "No";

  // Set eco filter
  if (Array.isArray(type) && type.includes("eco-friendly")) {
    f = "Yes";
  } else if (type === "eco-friendly") {
    f = "Yes";
  }
  if (Array.isArray(type) && type.includes("normal")) {
    f = "No";
  } else if (type === "normal") {
    f = "No";
  }
  color = Array.isArray(color) ? color : (color ? [color] : []);
  type = Array.isArray(type) ? type : (type ? [type] : []);
  price = Array.isArray(price) ? price.map(p => parseFloat(p)) : (price ? [parseFloat(price)] : []);

  // Determine the maximum price if multiple price checkboxes are selected
  const maxPrice = price.length > 0 ? Math.max(...price) : null;

  // Build the query object dynamically
  let query = {
    "upper/lower": "jeans"
  };

  if (color.length > 0) {
    query.color = { $in: color }; // Include color filter if colors are selected
  }

  if (f === "Yes") {
    query.eco = f; // Include eco filter if eco-friendly is selected
  }else{
    query.eco="No";
  }

  if (maxPrice !== null) {
    query.price = { $lte: maxPrice }; // Include price filter if a valid price is provided
  }

  console.log("Query:", query); // Debugging output

  try {
    // Query the database
    const product = await db.collection("men").find(query).toArray();

    // Render the results
    res.render("men_shirts.ejs", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products from database');
  }
});
app.get("/cart", async(req, res) => {
  let cart = JSON.parse(req.headers.cookie) || []; // Adjust this according to how you manage cookies
  console.log("hhhhhh");
  res.render("cart.ejs"); // Just render the view, the client-side script will handle the rest
});
app.listen(3001, () => {
  console.log("Server started");
});
