if(process.env.NODE_ENV!=="production"){
  require('dotenv').config()
}

const {generateWeeklySchedules,AutdSchedule}=require("./apoinmment")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {authorize,uploadfile}=require('./imgUploader')
const nodemailer = require('nodemailer')
const flash =require('express-flash')
const express = require('express')

const {profile,user,UserVerification,patient,Schedule} =require("./schems")


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


const  sendverificationemail = ({_id,Email},res)=>{
const  currentUrl= process.env.URL
const verificationCode = Math.floor(1000 + Math.random() * 9000);
const mailOptions={
from:process.env.AUTH_EMAIL,

to:Email,
subject:"Verify Your email",
html:`<p>verify your eamil address to complete the singup and login into your account.</p><p>this is the verficationcode 
 ${verificationCode} <b> expires in 6 hours</b>.</p>`

}


const schedule = require('node-schedule');



// Define a schedule to run at midnight (beginning of a new day)
const midnightTask = schedule.scheduleJob('0 0 * * *', () => {
  AutdSchedule()
});


const newVerification = new UserVerification({
userId:_id,
VerificationCode:verificationCode,
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
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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
  let {password,email,phone} = req.body  
  try{
    const emailcheck =await user.exists({Email:email})
    
    if(emailcheck){
      return res.send({message : "this email is already used",status:404})
  }
   
 const hashedpass = await bycrypt.hash(password,10)
 const User = new user({   
  phone:phone,
  password:hashedpass,
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
    res.send({message : "somthing went wrong please try again later",status:404})
  }
})
app.get('/',async(req,res)=>{
 const name = await req.user
 console.log(name.Name)
  res.send( name._id)
})
app.post('/forget-password', async (req, res) => {
  console.log("sending code")
  let { email } = req.body;
    try {
        const User = await user.findOne({ Email: email });
        if (!User) {
            return res.status(400).json({ error: "User with this email does not exist. " });
        }
        // Generate random 4-digit code
        const verificationCode = Math.floor(1000 + Math.random() * 9000);
        // Store the code associated with the user's email
        User.resetPasswordCode = verificationCode;
        await User.save();

        // Send verification email
        const mailOptions = {
            to: User.Email,
            from: process.env.AUTH_EMAIL,
            subject: 'Password Reset Verification Code',
            text: `Your verification code is: ${verificationCode}. This code is valid for 10 minutes.`
        };
        transport.sendMail(mailOptions, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ error: 'Error sending verification email.' });
            }
            res.send({ message: 'Verification code sent to your email.' });
        });
    } catch (err) {
        console.log(err);
        res.send({ message: 'Server error. Please try again later.',status:404 });
    }
});

// Verify code and reset password
app.post('/Verify-code', async (req, res) => {
    let { email, code } = req.body;
    try {
        const User = await user.findOne({ Email: email });
        if (!User) {
            return res.json({ message: "User with this email does not exist. ",status:404 });
        }
        // Verify the code
        if (User.resetPasswordCode !== parseInt(code)) {
            return res.json({ message: "Invalid verification code.",status:404 });
        }
        // Clear the code after successful verification
        User.resetPasswordCode = null;
        // Reset password
        await User.save();
        res.send({ message: 'code Verify.' });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Server error. Please try again later.' });
  }
});
// Route to reset password
app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    
    try {
        // Find the user by email
        const User = await user.findOne({ Email:email });
        if (!User) {
            return res.status(400).json({ error: "User with this email does not exist." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        User.password = hashedPassword;

        // Save the updated user document
        await User.save();

        res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});
//email verify api
app.get('/user/verify/:_id/:verificationCode',async(req,res)=>{
  let {_id,verificationCode}=req.params
 await UserVerification.findOne({userId:_id})
  .then((result)=>{
    
if(result){
  const{expiresAT} = result.expiresAT
  const hasheduniqueString =result.resetPasswordCode 

  if(expiresAT<Date.now()){
    UserVerification.deleteOne({userId:_id})
    .then(result =>{
user.deleteOne({userId:_id}
  .then(res.send({message:'link expired',status:200}))
  .catch(err => console.log(err)))

    } )

  }else{
bycrypt.compare(verificationCode,hasheduniqueString)
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
  let{password,email}=req.body
 user.findOne({Email:email})
 .then(((data)=>{
  console.log(req.body)  
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

app.get('/emailverification',(req,res)=>{
  let {email,code}=req.body
  user.findOne({Email:email})
  .then(result=>{res.redirect(`/user/verify/:${result[0]._id}/:${verificationCode}`)
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


app.get('/verificationCode',(req,res)=>{
 let {verificationCode}=req.query
UserVerification.find({verificationCode:verificationCode})
.then(result=>{res.redirect()})

})

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
let {name,phone,gender,age,address}=req.body
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
 const patient_id = req.body.id
patient.deleteOne({_id:patient_id}).then(res.send({message:"deleted successfully",status:200}))
.catch((err)=>{console.log("err in deleteing the patient :"+ err)
res.send({message:"something went wrong try again later",status:404})
})
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

  const searchparam= req.body.param

  

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
app.post("/profile",upload.single('image'),async (req,res)=>{  
  const user = await req.user
  if(user._id){
  console.log("session started")
  }else{console.log("login first")
   res.send("login first")}
   const id = user._id
    if (!req.file) {
      return res.status(404).send('No file uploaded.');
    }
    //console.log(req.file)
    let {name,address,phone, startTime, endTime, step,workdays}=req.query
    const Profile = new profile({
      userId:id,
      Name:name, 
      address:address,
      phone:phone,
      img:"",
      workdays:workdays,
      startTime: startTime, endTime:endTime, step:step
    })
    Profile.save()
.catch(err=>{console.log(err)
  return res.send({message:"somthing went wrong",status:404})
})
     authorize().then(result =>{ uploadfile(result,req.file,Profile._id)
      res.send({message:"your profile id done",status:200})})
    .catch( error=>{  console.log('Error uploading file to Google Drive:', error);
      res.status(404).send('Internal Server Error')})
    
  
  //const daysArray = workdays.split(', ')

    

    const now = new Date();
    const currentDayOfWeek = now.getDay();
const weeklySchedules = await generateWeeklySchedules(id,currentDayOfWeek, startTime, endTime, step,workdays );

// Save the generated weekly schedules to MongoDB
Schedule.insertMany(weeklySchedules)
  .then(() => {
    console.log('Weekly schedules saved successfully');
  })
  .catch((err) => {
    console.error('Failed to save weekly schedules', err)
  });
  

})

app.get('/test',(req,res)=>{
  
  try{
  
  res.status(200).send("test successfully",AutdSchedule())
  }catch{
    res.status(404).send("test went wrong")

  }
})


})
