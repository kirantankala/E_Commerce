const port=4000;
const express=require("express");
const app=express(); //for adding deleting fetching products
const mongoose = require("mongoose");
const jwt=require("jsonwebtoken");
const multer=require("multer");
const path=require("path");
const cors=require("cors"); 
const { type } = require("os");
const { log } = require("console");


 app.use(express.json());
 app.use(cors());

//database connection with mongodb
mongoose.connect("mongodb+srv://kirantankala2003:kirantankala2003@cluster0.rdsxeia.mongodb.net/e-commerce");
//we can see the changes in the mongodb of adding and deleting products due this 



//API keys (app.)creation


//type localhost:4000/ in chrome we will express is running
app.get("/",(req,res)=>{
  res.send("Express is Running")
})



//image storage engine creating and adding


//creating link of the image
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
      console.log(file);
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage: storage})
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:4000/images/${req.file.filename}`
    })
})
app.use('/images', express.static('upload/images'));




//schema for adding  products and signup
//two models Product(products) and Users(users) are created


//this will be stored in mongodb and this will be displayed in terminal after running the port
const Product = mongoose.model("Product", {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    new_price: {
      type: Number
    },
    old_price: {
      type: Number
    },
    date: {
      type: Date,
      default: Date.now,
    },
    avilable: {
      type: Boolean,
      default: true,
    },
  });

  //this is for adding products
app.post('/addproduct',async(req,res)=>{
  let products=await Product.find({});//for the newly added products to come in an array
  let id;
  if(products.length>0){ // to generate the id automatically without us giving it manually
    let last_product_array=products.slice(-1);
    let last_product=last_product_array[0];
    id=last_product.id+1;
   }
   else{
    id=1;
   }
    const product=new Product({//this we need to enter in thunder client
        id: id,
    name: req.body.name,//req means the client request us for a name 
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,//soma should not be there in json code 

    });
    console.log(product);
    await product.save(); //whatever product we save it will be saved in mongodb database
    console.log("Saved");
    res.json({//we get in thunder client 
        success:true, //when the product is saved we will get responce of true
         name:req.body.name,
    })
})


//for deleting products

app.post("/removeproduct", async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({success:true,name:req.body.name})
});



//for getting all products

app.get("/allproducts", async (req, res) => {
	let products = await Product.find({});
  console.log("All Products Fetched");
    res.send(products);
});



//schema creating for user model

const Users=mongoose.model('Users',{
  name:{
    type:String,
    required:true,
  },
  email:{
     type:String,
     unique:true,
     required:true,
  },
  password:{
    type:String,
    required:true,
  },
  cartData:{
    type:Object,
  },
  date:{
    type:Date,
    default:Date.now,
  }
})


//creating end point for registering the user

app.post('/signup',async(req,res)=>{
  let check = await Users.findOne({email:req.body.email});
  if(check){ //if the entered email is already in use we get a response of false with the "existing user"
    return res.status(400).json({success:false,errors:"existing user found with same email adress"})
  }
  let cart={};//cart object is created emptily when there is no user
  for (let i = 0; i <300; i++) {
    cart[i]=0; 
  }
  //creating user using user model
  const user=new Users({
    name:req.body.username,
    email:req.body.email,
    password:req.body.password,
    cartData:cart,
  })
  //saving user in database
  await user.save();

  const data={
    user:{
      id:user.id
    }
  }
  const token=jwt.sign(data,'secret_ecom');
  res.json({success:true,token})//this wil be displayed in thethunder terminal
})



//endpoint for userlogin(already existing user)

app.post('/login',async(req,res)=>{
    let user=await Users.findOne({email:req.body.email});// we will get particular user based on email adress and will be stored in user variable
     if(user){//if the user is really available
      const passCompare=req.body.password===user.password;//this compares the password that comes from user api and the user password stored in the db
    if(passCompare){//if comaparsion is true
      const data={
        user:{//if user is there and enetered password is true
          id:user.id,
        }
      }
      const token=jwt.sign(data,'secret_ecom');
      res.json({success:true,token});
    }
       else {//if comparsion is false
        res.json({success:false,error:"Wrong Password"});
       }//if user is there but entred password is false
    
    }
     else{//if the user is not found
       res.json({success:false,errors:"Wrong Email-id "})
     }

  })




//for new collection data
//recenetly added will be displayed irresepective of the category
app.get("/newcollections", async (req, res) => {
	let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("New Collections Fetched");
  res.send(newcollection);
});//linked NewCollections.jsx





//for popular in women category
app.get('/popularinwomen',async(req,res)=>{
  let products = await Product.find({category:"women"});
  let popular_in_women = products.slice(0,4);
  console.log("Popular in women Fetched");
  res.send(popular_in_women);
})



//creating middleware to fetch user
//by this when we add a object in cart we get the cart item with the user id as well
  const fetchUser=async(req,res,next)=>{
    const token=req.header('auth-token');
    if (!token) { //if the user is not found
      res.status(401).send({errors:"Please Authenticate using valid token"})
    }
     else{
       try {
        const data=jwt.verify(token,'secret_ecom');
        req.user=data.user;
        next();
       } catch (error) {
          res.status(401).send({errors:"Please Authenticate using valid token"});
       }
     }

  }


//save the cart data in mongodb database

app.post('/addtocart',fetchUser,async(req,res)=>{
  console.log("Added",req.body.itemId);
    let userData=await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
   res.send("ADDED")
    //it finds the user id and update the cartdata with the modified cartdata
    //we will get {itemID: number}
})



//remove products from cart data 
app.post('/removefromcart', fetchUser, async (req, res) => {
	console.log("Remove Cart",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    {
      userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData});
    res.send("Removed");
  })




//for retreving the cart data as soon as we login

app.post('/getcart', fetchUser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({_id:req.user.id});
  res.json(userData.cartData);

  })



//when node .\index.js we will get server is runnings
app.listen(port,(error)=>{
    if(!error){
        console.log("Server is Running on Port " +port)
    }
    else{
        console.log("Error :"+error)
    }
})