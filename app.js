

require('dotenv').config()
const fileUpload = require('express-fileupload');

//const schedule = require('node-schedule');


require('dotenv').config()

const {generateWeeklySchedules,AutdSchedule}=require("./apoinmment")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {authorize,uploadfile}=require('./imgUploader')
const nodemailer = require('nodemailer')
const flash =require('express-flash')
const express = require('express')
const morgan =require("morgan")
const {profile,user,UserVerification,patient,Schedule} =require("./schems")

const verify =require("./verification")
const app = express()   
const bycrypt =require("bcrypt")
const mongoose = require("mongoose")
const dbURI= process.env.DB_URI
mongoose.connect(dbURI)
.then(app.listen(process.env.PORT||5050,()=>{
  console.log('server is running ')
}))
const login = require('./config/login-config')
const passport = require('passport')
const session = require('express-session');
const verifiy = require('./verification');
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


const  sendverificationemail = async ({_id,Email},res)=>{
const  currentUrl= process.env.URL
const Code = await Math.floor(1000 + Math.random() * 9000).toString();
const hashedverificationCode= await bycrypt.hash(Code,10)
const mailOptions={
from:process.env.AUTH_EMAIL,
to:Email,
subject:"Verify Your email",
html:`<p>verify your eamil address to complete the singup and login into your account.</p><p>this is the verficationcode 
 ${Code} <b> expires in 6 hours</b>.</p>`

}



//const schedule = require('node-schedule');



// Define a schedule to run at midnight (beginning of a new day)
// const midnightTask = schedule.scheduleJob('0 0 * * *', () => {
//   AutdSchedule()
// });



const newVerification = new UserVerification({
userId:_id,
verificationCode:hashedverificationCode,
createdAt:Date.now(),
expiresAT:Date.now()+ 21600000
})
newVerification.save()
.then((result)=>{
  console.log(result)
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
app.use(fileUpload());

  app.use(express.json());
  app.use(express.urlencoded({extended:false}))
  app.use(session({
secret:process.env.SESSION_SECRET,
resave: false,
saveUninitialized:false
}))
app.use(morgan('tiny'))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.post('/signup',async (req,res)=>{
  let {password,email,name} = req.body  
  try{
    const emailcheck =await user.exists({Email:email})
    
    if(emailcheck){
      return res.json({message : "this email is already used",status:404})
  }
   
 const hashedpass = await bycrypt.hash(password,10)
 const User = new user({   
  username:name,
  password:hashedpass,
  Email:email ,
  verified:false

}) 


User.save()
.then((result)=>{
  
sendverificationemail(result,res)
})
res.json({message:"singup successfully",
status: 200
           })
  }catch(e){
    console.log(e)
    res.json({message : "somthing went wrong please try again later",status:404})
  }
})

app.post('/login', (req, res, next) => {

    let { password, email } = req.body;
    user.findOne({ Email: email })
      .then((data) => {
        if (!data) {
          return res.status(404).json({ message: "wrong email", status: 404 });
        }
        if (!data.verified) {
          return res.status(404).json({ message: "User isn't verified", status: 404 });
        }
        // Call passport.authenticate() to authenticate the user
        passport.authenticate('local', (err, user, info) => {
          if (err) {
            return res.status(500).json({ message: 'Internal Server Error', status: 404 });
          }
          if (!user) {
            // Authentication failed
            return res.status(401).json({ message: 'Authentication failed : wrong password', status: 404 });
          }
          // Authentication successful, set req.user and continue
          req.logIn(user, (err) => {
            if (err) {
              return  res.status(401).json({ message: 'Authentication failed', status: 404 });
            }
            const id = user._id;
            profile.exists({ userId: id })
              .then(async (profilecheck) => {
                if (profilecheck) {
                  const Profile = await profile.findOne({ _id: profilecheck });
                  return res.status(200).json({ message: 'Authentication successful', status: 200, data: Profile, Profilecheck: true });
                } else {
                  return res.status(200).json({ message: 'Authentication successful', status: 200, Profilecheck: false });
                }
              })
              .catch((err) => {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error', status: 404 });
              });
          });
        })(req, res, next); // Pass req, res, and next to passport.authenticate()
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error', status: 500 });
      });
  });

// app.get("/verify",passport.authenticate('local',{
//  successRedirect:'/logins',
//  failureRedirect:'/loginfailed',
//  failureMessage:true
// }))

app.get('/',(req,res)=>{
 
  res.json({message:"server on render started ",status:200})
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
                return res.json({ error: 'Error sending verification email.', status:404 });
            }
            res.json({ message: 'Verification code sent to your email.',status:200 });
        });
    } catch (err) {
        console.log(err);
        res.json({ message: 'Server error. Please try again later.',status:404 });
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
        res.json({ message: 'code Verified.',status:200 });
    } catch (err) {
        console.log(err);
        res.json({ error: 'Server error. Please try again later.',status:404  });
  }
});
// Route to reset password
app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    
    try {
        // Find the user by email
        const User = await user.findOne({ Email:email });
        if (!User) {
            return res.json({ error: "User with this email does not exist." ,status:404 });
        }

        // Hash the new password
        const hashedPassword = await bycrypt.hash(newPassword, 10);
        User.password = hashedPassword;

        // Save the updated user document
        await User.save();

        res.json({ message: "Password reset successfully.",status:200 });
    } catch (error) {
        console.error(error);
        res.json({ error: "Server error. Please try again later.",status:404  });
    }
});
//email verify api
app.post('/emailverification',async(req,res)=>{
  let {email,code}=req.body
 await user.findOne({Email:email})

  .then(result=>{
    console.log(result)
    const _id=result._id
    verifiy(_id,code,res)
    }).catch(err=>{conole.log(err)
    res.json({message:"cannot find the user",status:404})    
    })

  })
//doctor dashborad

app.post("/PatientList",async(req,res)=>{
  const user = await req.user
 try{
  const id = user._id
   patient.find({userId: id}).then((result)=>{
    res.json({result,status:200})
 }).catch((err)=>{res.json({message:"something went wrong try again later in PatientList",status:404})
console.log(err)})}catch(err){console.log(err)
  res.json({message:"login first"})}
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
 res.json({message:"added successfully",status:200})
}
 )
  .catch((err)=>{console.log("err in adding the patient :"+ err)
  res.json({message:"something went wrong try again later",status:404})})
})

//doctor dashborad

app.post("/PatientList",async(req,res)=>{
  try{
  const user = await req.user
  const id = user._id
   patient.find({userId: id}).then((result)=>{
    res.json({result,status:200})
 }).catch((err)=>{res.json({message:"something went wrong try again later in PatientList",status:404})
console.log(err)})
}catch{res.json({message:"something went wrong try again later in PatientList",status:404})}})

app.post("/addPateint",async(req,res)=>{
 try{ const user = await req.user
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
 res.json({message:"added successfully",status:200})
}
 )
  .catch((err)=>{console.log("err in adding the patient :"+ err)
  res.json({message:"something went wrong try again later",status:404})})}
  catch{res.json({message:"something went wrong try again later in adding the patient",status:404})}
})

app.post("/deletePateint",async(req,res)=>{
  try{
  const user = await req.user
  const id = user._id
 const patient_id = req.body.id
patient.deleteOne({_id:patient_id}).then(res.json({message:"deleted successfully",status:200}))
.catch((err)=>{console.log("err in deleteing the patient :"+ err)
res.json({message:"something went wrong try again later",status:404})
})
}catch{res.json({message:"something went wrong deleting the patient try again later ",status:404})}
})

app.post("/editPateint",async(req,res)=>{
  let{name,phone,gender,age,address,id}=req.body 


  patient.findOneAndUpdate({_id,id},{
    userId:id,
    phone:phone,
    Name:name,
    gender:gender,
    age:age,
    address:address,
  
    }).then((result)=>{res.json({message:"edited successfully",status:200})})
    .catch((err)=>{console.log("err in editing the patient :"+ err)
       res.json({message:"something went wrong try again later",status:404})

})})
app.post("/findPatient",async(req,res)=>{
  try{
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
res.json({result,status:200})
console.log(result)
})
.catch((err)=>{console.log(err)
 res.json({message:"something went wrong try again later",status:404})})


}catch(err){console.log(err)
  res.json({message:"something went wrong try again later",status:404})}
})
app.delete('/deleteall',async(req,res)=>{
  const user = await req.user
  const id = user._id
patient.deleteMany({userId:id}).then(res.json("all deleted"))

})
app.post('/profile',async (req,res)=>{  

  try{
    if (!req.files ) {
      console.log(req.files)
      return res.status(400).json({ message: 'No files were uploaded' });
  }
  console.log(req.files)
  const File = req.files.image;
  const user = await req.user
    console.log(user)
  const file = await req.file 
  if(user._id){
  console.log("session started")
  }else{console.log("login first")
   res.json("login first")}
   const id = user._id



    //console.log(req.file)
    let {name,address,phone, startTime, endTime, step,workdays}=req.body
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
  return res.json({message:"somthing went wrong",status:404})
})
     authorize().then(result =>{ uploadfile(result,File,Profile._id)
     })
    .catch( error=>{ console.log('Error uploading file to Google Drive:', error);
      return res.json({message:'Internal Server Error',status:404})})

    const now = new Date();
    const currentDayOfWeek = now.getDay();
const weeklySchedules = await generateWeeklySchedules(id,currentDayOfWeek, startTime, endTime, step,workdays );

// Save the generated weekly schedules to MongoDB
Schedule.insertMany(weeklySchedules)
  .then(() => {
    console.log('Weekly schedules saved successfully');
    res.json({message:"your profile id done",status:200})
  })
  .catch((err) => {
    console.error('Failed to save weekly schedules', err)
  });
  
  }catch(err){console.log(err)
    res.json({message:'Internal Server Error',status:404})
  }
})

// app.post('/test',(req,res)=>{
  
//   try{
  
//   res.status(200).json("test successfully",AutdSchedule())
//   }catch{
//     res.status(404).json("test went wrong")

//   }
// })


  
  
app.post("/view-profile",async (req,res)=>{
const user = await req.user
const id = user._id
 profile.findOne({userId:id})
.then(result=>{
res.json({data:result,status:200})
})
.catch(err=>{console.log("err finding the profile",err)
  res.json({message:"something went wrong try again later, ",status:404})
})
})
app.post("/edit-profile",upload.single('image'),async(req,res)=>{
  let {name,address,phone, startTime, endTime, step,workdays,_id}=req.body 
 
   await profile.findOneAndUpdate({_id:_id},{
    phone: phone,
    Name: name,
    address: address,
    workdays:workdays,
    startTime:startTime,
    endTime:endTime,
    step:step
    }).then(result=>{ if(req.file)
     {authorize().then(result =>{ uploadfile(result,req.file,_id)})
      .catch( error=>{  console.log('Error uploading file to Google Drive:', error);
        res.json({message:'Internal Server Error',status:404})})}
      console.log("profile has been edited ")
      res.json({message:"profile edited successfully",status:200})})
    .catch((err)=>{console.log("err in editing the patient :"+ err)
    return res.json({message:"something went wrong try again later",status:404})
})

  })
  app.post("/doctors-list",async (req,res)=>{
    profile.find()
   .then(result=>{
   res.json({data:result,status:200})
   })
   .catch(err=>{console.log("err finding the profile",err)
     res.json({message:"something went wrong try again later, ",status:404})
   })
   })
  app.post("/logout",(req,res)=>{
    try{
        req.logOut(()=>{return res.json({message:"loged out successfully",status:200})})
        }
        catch(err){
          res.json({message:"internal error try again later",status:404})
          console.log("err loging out",err)
        }
    })

