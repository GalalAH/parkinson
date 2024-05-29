const express = require('express')
const router = express.Router()
const {patientverifiy} = require('./verification');
require('dotenv').config()
//const schedule = require('node-schedule');
const {authorize,patientuploadfile}=require('./imgUploader')
const nodemailer = require('nodemailer')
const {patientUser,patientVerification,reservation} =require("./patientschema")
const bycrypt =require("bcrypt")
const{Schedule,profile, user}=require("./schems")
const login = require('./config/login-config')
const passport = require('passport');
const { appendFile } = require('fs');



function convertDriveLink(originalLink) {
  const start = originalLink.indexOf('/d/') + 3;
  const end = originalLink.indexOf('/view');
  const fileId = originalLink.substring(start, end);
  
  return `https://drive.google.com/uc?id=${fileId}&export=download`;}

const transport =nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:process.env.AUTH_EMAIL,
    pass:process.env.AUTH_PASS
  }
  })
  transport.verify((err,success)=>{
  if(err) console.log(err)
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


const newVerification = new patientVerification({
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
  .catch(err=>{console.log("err in transporter : "+err)
  return res.json({message:"internal error",status:404})
})
})
  .catch(err=>{console.log("err in transporter 2 : "+err)
  return res.json({message:"internal error",status:404})})

.catch( ()=> { console.log("somthing wrong happend")
return res.json({message:"internal error",status:404})})
}
login(
passport,
async email => { 
  return  await patientUser.findOne({Email:email})
  },
  async id => { 
    return  await patientUser.findOne({_id:id})
    }

)

router.post('/signup',async (req,res)=>{
  
  let {password,email,name,phone,gender} = req.body
  
  try{
    if(!req.files){return res.json({message:"no image was uploaded",status:404})}
    const emailcheck =await patientUser.exists({Email:email})
    
    if(emailcheck){
      return res.json({message : "this email is already used",status:404})
  }
   console.log(password)
 const hashedpass = await bycrypt.hash(password,10)
 const User = new patientUser({  
  gender:gender,
  phone:phone,
  username:name,
  password:hashedpass,
  Email:email ,
  verified:false,
  img:""
})
console.log("frist user",User)

User.save()
.then((result)=>{
  console.log("result :",result)
  sendverificationemail(result,res)
  authorize().then(async result =>{const link = await patientuploadfile(result,req.files.image,User._id)
   User.img=link
   User.save() 
  console.log("secand user",User)                            
  return res.json({message:"img uploaded successfully",link:link,status:200})
  })

})
  }catch(e){
    console.log(e)
    return res.json({message : "somthing went wrong please try again later",status:404})
  }
})
   
   router.post('/login', (req, res,next) => {
    try{
    let { password, email } = req.body;
      console.log(password)
      console.log(email)
    patientUser.findOne({ Email: email })
      .then((data) => {
        if (!data) {
          return res.status(404).json({ message: "wrong email", status: 404 });
        }
        if (!data.verified) {
          return res.status(404).json({ message: "User isn't verified", status: 404 });
        }
        // Call passport.authenticate() to authenticate the user
        passport.authenticate('local', (err, user, info) => {
          console.log(info)
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
            const id = user._id
            link=convertDriveLink(data.img)
            return res.status(200).json({ message: 'Authentication successful', status: 200,userId:id, data:data,link:link});
                
          
              })
              
        })(req, res, next);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error', status: 500 });
      });
  }catch(err){console.log(err)
  res.send("err")}});
  
// router.get("/verify",passport.authenticate('local',{
//  successRedirect:'/logins',
//  failureRedirect:'/loginfailed',
//  failureMessage:true
// }))

router.get('/',(req,res)=>{
 
  res.json({message:"server on render started ",status:200})
})
router.post('/forget-password', async (req, res) => {
  console.log("sending code")
  let { email } = req.body;
    try {
        const User = await patientUser.findOne({ Email: email });
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
router.post('/Verify-code', async (req, res) => {
    let { email, code } = req.body;
    try {
        const User = await patientUser.findOne({ Email: email });
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
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    
    try {
        // Find the user by email
        const User = await patientUser.findOne({ Email:email });
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


router.post('/emailverification',(req,res)=>{
  let {email,code}=req.body
  patientUser.findOne({Email:email})
  .then(result=>{
    const _id=result._id
    patientverifiy(_id,code,res)
    }).catch(err=>{console.log(err)
    res.json({message:"cannot find the user",status:404})    
    })

  })
  router.post('/reserve',(req,res)=>{

    let {name,doctorId,dayOfWeek,patientId,TimeOfDay,dayOfMonth,month,Year,link}=req.body
    
    console.log(doctorId)
    const Reservation= new reservation({
    name:name,
    doctorId:doctorId,
    patientId:patientId,
    dayOfWeek:dayOfWeek,
    dayOfMonth:dayOfMonth,
    TimeOfDay:TimeOfDay,
    month:month,
    Year:Year,
    img:link
    })
    Reservation.save().then(result=>{
      console.log(dayOfMonth)
      Schedule.findOneAndUpdate( { 
          userId:doctorId,
          month:month,
          Year:Year,
          dayOfMonth:dayOfMonth

      },
      { 
        $set: { 'timeSlots.$[slot].available': false } 
      },
      {
        arrayFilters: [{ 'slot.time': TimeOfDay}]
      }).then(result=>{console.log(result)})
      return res.json({message:"reserved successfully",status:200})
    })
    .catch(err=>{console.log(err)
      return res.json({message:"reservetion faild",status:404})})
    
    })
    
    
    router.post("/doctors-list",async (req,res)=>{
      profile.find()
     .then(result=>{
     res.json({data:result,status:200})
     })
     .catch(err=>{console.log("err finding the profile",err)
       res.json({message:"something went wrong try again later",status:404})
     })
     })
      router.post("/apoinmments",async(req,res)=>{
      let {userId} =req.body
      console.log(userId)
      reservation.find({patientId:userId}).then( async result=>{
        
        if(result){res.json({result,status:200})}
      else{res.json({message:"wrong id",status:404})}
      })
      .catch(err=>{console.log("err viewing apoinment : ",err)
        res.json({message:"internal error",status:404})})
      })

      router.post("/avalible-apoinmments",(req,res)=>{
  
        let {userId} =req.body
        console.log(userId)
        Schedule.find({userId:userId,"timeSlots": { $elemMatch: { available: true } }})
        .then(result=>{if(result){res.json({result,status:200})}
        else{res.json({message:"wrong id",status:404})}
        })
        .catch(err=>{console.log("err viewing apoinment : ",err)
          res.json({message:"internal error",status:404})})
        })
        router.post("/find-apoinmment",async(req,res)=>{
          try{
        
          const id = req.body.userId
        
          const searchparam= req.body.param
          const regex = new RegExp(`^${searchparam}`, 'i')
          const query = {
            patientId:id,
            $or: [
              {
                dayOfWeek: { $regex: regex },
              },
              { dayOfMonth: { $regex: regex } },
              { TimeOfDay: { $regex: regex } },
              {
                Year: { $regex: regex }
              },
              { month: { $regex: regex } },
              { name: { $regex: regex } }
            ],
          };
          reservation.find(query
          ).then((result)=>{
        res.json({result,status:200})
        console.log(result)
        })
        .catch((err)=>{console.log(err)
         res.json({message:"something went wrong try again later",status:404})})
        
        
        }catch(err){console.log(err)
          res.json({message:"something went wrong try again later",status:404})}
        })
      
router.post("/linktest",(req,res)=>{


let {link}= req.body

newlink=convertDriveLink(link)
console.log(link)
res.send({link:newlink})
})








  module.exports = router


