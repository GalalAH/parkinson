if(process.env.NNODE_ENV!=="production"){
  require('dotenv').config()
}
const flash =require('express-flash')
const express = require('express')
const {blog,Doctors,user} =require("./schems")
const app = express()
const bycrypt =require("bcrypt")
const mongoose = require("mongoose")
const dbURI= "mongodb+srv://Galal:3493476g@parkinson.hbqgvlv.mongodb.net/tesr?retryWrites=true&w=majority"
const login = require('./config/login-config')
const passport = require('passport')
const session = require('express-session')
login(
passport,
async email => { 
  return  await user.findOne({Email:email})
  },
  async id => { 
    return  await user.findOne({_id:id})
    }

)


mongoose.connect(dbURI)
.then(app.listen(5000,()=>{
  console.log('server is running')}))
  app.use(express.urlencoded({extended:false}))
  app.use(session({
secret:process.env.SESSION_SECRET,
resave: false,
saveUninitialized:false

}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.get('/',async(req,res)=>{
 const name = await req.user
 console.log(name.Name)
  res.send( name.Name)
})

  app.get('/logins',async(req,res)=>{
  res.redirect('/') })
  app.get('/loginfailed',(req,res)=>{
    res.send("error : "+req.session.messages)
    })

app.get('/login', (req,res,next)=>{
  
  next()
},passport.authenticate('local',{
  successRedirect:'/logins',
  failureRedirect:'/loginfailed',
  failureMessage:true

})
  )


app.get('/signup',async (req,res)=>{
  try{
  
    const emailcheck =await user.exists({Eamil:req.query.email})
    if(emailcheck){
      return res.status(404).send({message : "this eamil is already used"})
  }
      
 const hashedpass = await bycrypt.hash(req.query.password,10)
 const User = new user({   
  password:hashedpass,
  Name:req.query.name,
  Email:req.query.email 
}) 


User.save()
res.status(200).send({userid : User._id})
  }catch(e){
    console.log(e)
    res.status(404).send({message : "somthing went wrong please try again later"})
  }
})
app.get('/blog',(req,res)=>{
  const Blog = new schems.blog({   
 title:req.query.title ,
 body:req.query.body
  })
  Blog.save()
  res.send('data accepted'+ Blog)
})
app.get('/doctorsinfo',(req,res)=>{
  
  const doctoresinfo = new schems.Doctors({   
 img:req.query.img ,
 name:req.query.name,
 role:req.query.role, 
 address:req.query.address
  })
  try{
    doctoresinfo.save()}
 catch(e){console.log(e)}
  res.send('data accepted'+ doctoresinfo )
})
function checkauthenticated(req,res,next){
if(req.isAuthenticated())
{return next()}
res.status(404).send("log in first")

}


