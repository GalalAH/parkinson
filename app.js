if(process.env.NODE_ENV!=="production"){
  require('dotenv').config()
}
const nodemailer = require('nodemailer')
const flash =require('express-flash')
const express = require('express')
const {blog,Doctors,user,UserVerification,patient} =require("./schems")
const app = express()
const bycrypt =require("bcrypt")
const mongoose = require("mongoose")
const dbURI= process.env.DB_URI
mongoose.connect(dbURI)
.then(app.listen(process.env.PORT,()=>{
  console.log('server is running ')
}))
const login = require('./config/login-config')
const passport = require('passport')
const session = require('express-session')
const transport =nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:process.env.AUTH_EMAIL,
    pass:process.env.AUTH_PASS
  }
  })
  transport.verify((err,success)=>{
  if(err) console.log(err)
  else{console.log("ready for messages")
  console.log(success)}
  
  
  }) 
//email sender details  n                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
const{v4:uuidv4}=require('uuid')
const e = require('express')
const  sendverificationemail = ({_id,Email},res)=>{
const  currentUrl= process.env.URL
const uniqueString = uuidv4()+ _id
const mailOptions={from:process.env.AUTH_EMAIL,
to:Email,
subject:"Verify Your email",
html:`<p>verify your eamil address to complete the singup and login into your account.</p><p>this link
<b> expires in 6 hours</b>.</p><p>Press <a href=${currentUrl + 'user/verify/'+_id+"/"+uniqueString}>here</a>
 to proceed.</p>`,

 
}
bycrypt
.hash(uniqueString,10)
.then((hasheduniqueString)=>{
const newVerification = new UserVerification({
userId:_id,
UniqueString:hasheduniqueString,
createdAt:Date.now(),
expiresAT:Date.now()+ 21600000
})
newVerification.save()
.then((result)=>{
  //console.log(result)
  transport.sendMail(mailOptions)
  .then(()=>{

console.log("pending")

  })
  .catch(err=>console.log("err in transporter : "+err))
})
  .catch(err=>console.log("err in transporter 2 : "+err))


})
.catch( ()=>  console.log("somthing wrong happend"))

}


login(
passport,
async email => { 
  return  await user.findOne({Email:email})
  },
  async id => { 
    return  await user.findOne({_id:id})
    }

)

  app.use(express.urlencoded({extended:false}))
  app.use(session({
secret:process.env.SESSION_SECRET,
resave: false,
saveUninitialized:false

}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.post('/signup',async (req,res)=>{
  let {password,email,name} = req.query  
  try{
    const emailcheck =await user.exists({Email:email})
    
    if(emailcheck){
      return res.send({message : "this email is already used",statues:404})
  }
   
 const hashedpass = await bycrypt.hash(password,10)
 const User = new user({   
  password:hashedpass,
  Name:name,
  Email:email ,
  verified:false

}) 


User.save()
.then((result)=>{
  
sendverificationemail(result,res)
})
res.send({message:"singup successfully",
status: 200
           })
  }catch(e){
    console.log(e)
    res.send({message : "somthing went wrong please try again later",statues:404})
  }
})
app.get('/',async(req,res)=>{
 const name = await req.user
 console.log(name.Name)
  res.send( name._id)
})

//email verify api
app.get('/user/verify/:_id/:uniqueString',async(req,res)=>{
  let {_id,uniqueString}=req.params
 await UserVerification.findOne({userId:_id})
  .then((result)=>{
    
if(result){
  const{expiresAT} = result.expiresAT
  const hasheduniqueString =result.UniqueString

  if(expiresAT<Date.now()){
    UserVerification.deleteOne({userId:_id})
    .then(result =>{
user.deleteOne({userId:_id}
  .then(res.send({message:'ling expired',status:200}))
  .catch(err => console.log(err)))

    } )

  }else{
bycrypt.compare(uniqueString,hasheduniqueString)
.then(result=>{
  if(result){
    console.log(_id)
    user.updateOne({_id:_id},{verified:true})
      .then(()=>{
        UserVerification.deleteOne({_id})
          .then(()=>{
        res.json({message :"user verified "})})
        .catch(err=>{console.log(err)})
          })
      .catch(err=>{console.log('err updateing the  , thr err ' +err)})
 }else{
    console.log("invalid unigue string")
  }
})


  }


}else{console.log("account don't exist")}


  })
  .catch((err)=>console.log(err))
  
}

)
  app.get('/logins',async(req,res)=>{
   const user = await req.user
  res.send({message:"verified",status:200,UserId:user._id}
  ) })
  app.get('/loginfailed',(req,res)=>{
    res.send({message:req.session.messages,
    status:404})
    })

app.get('/login',(req,res)=>{
  let{password,email}=req.query
 user.findOne({Email:email})
 .then(((data)=>{
  if(!data.verified){
 res.send({message:"user isn't verified",
status: 404})
  }else{res.redirect(`/verify?password=${password}&email=${email}`)}
 }))}
)
app.get("/verify",passport.authenticate('local',{
  successRedirect:'/logins',
  failureRedirect:'/loginfailed',
  failureMessage:true
}))
app.get('/blog',(req,res)=>{
  const Blog = new schems.blog({   
 title:req.query.title ,
 body:req.query.body
  })
  Blog.save()
  res.send('data accepted'+ Blog)
})
app.get('/doctorsinfo',(req,res)=>{
  
  const doctoresinfo = new Doctors({   
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

//doctor dashborad

app.get("/PatientList",async(req,res)=>{
  const user = await req.user
  const id = user._id
   patient.find({userId: id}).then((result)=>{
    res.send({result,status:200})
 }).catch((err)=>{res.send({message:"something went wrong try again later in PatientList",status:404})
console.log(err)})
})

app.post("/addPateint",async(req,res)=>{
  const user = await req.user
  const id = user._id
let {name,phone,gender,age,address}=req.query
const Patient = new patient({
userId:id,
phone:phone,
Name:name,
gender:gender,
age:age,
address:address,
illness:false
})
Patient.save()
.then((result)=>{console.log(result)
 res.send({message:"added successfully",status:200})
}
 )
  .catch((err)=>{console.log("err in adding the patient :"+ err)
  res.send({message:"something went wrong try again later",status:404})})
})


app.get("/deletePateint",async(req,res)=>{
  const user = await req.user
  const id = user._id
 const patient_id = req.query.id
patient.deleteOne({_id:patient_id}).then(res.send({message:"deleted successfully",status:200}))
.catch((err)=>{console.log("err in deleteing the patient :"+ err)
res.send({message:"something went wrong try again later",status:404})
})
})

app.post("/editPateint",async(req,res)=>{
  let{name,phone,gender,age,address,id}=req.query

  patient.findByIdAndUpdate(id,{
    userId:id,
    phone:phone,
    Name:name,
    gender:gender,
    age:age,
    address:address,
  
    }).then((result)=>{res.send({result,status:200})})
    .catch((err)=>{console.log("err in deleteing the patient :"+ err)
       res.send({message:"something went wrong try again later",status:404})

})})
app.get("/findPatient",async(req,res)=>{
  const user = await req.user
  const id = user._id
  const searchparam= req.query.param
  const regex = new RegExp(`^${searchparam}`, 'i')
  const query = {
    userId:id,
    $or: [
      {
        $expr: {
          $regexMatch: {
            input: { $toString: '$phone' },
            regex,
          },
        },
      },
      { Name: { $regex: regex } },
      { address: { $regex: regex } },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: '$age' },
            regex,
          },
        },
      },
      { gender: { $regex: regex } },
    ],
  };
  patient.find(query
  ).then((result)=>{
res.send({result,status:200})
console.log(result)
})
.catch((err)=>{console.log(err)
 res.send({message:"something went wrong try again later",status:404})})


})
app.delete('/deleteall',async(req,res)=>{
  const user = await req.user
  const id = user._id
patient.deleteMany({userId:id}).then(res.send("all deleted"))

})
