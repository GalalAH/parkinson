const express = require('express')
const router = express.Router()
const {patientverifiy} = require('./verification');
require('dotenv').config()
//const schedule = require('node-schedule');

const {authorize,uploadfile}=require('./imgUploader')
const nodemailer = require('nodemailer')
const {profile,patientUser,patientVerification,reservation} =require("./patientschema")
const bycrypt =require("bcrypt")
const{Schedule}=require("./schems")
const login = require('./config/login-config')
const passport = require('passport')

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
  transport.jsonMail(mailOptions)
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

router.post('/signup',async (req,res)=>{
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
   
   router.post('/login', (req, res,next) => {
    try{
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
                  return res.status(200).json({ message: 'Authentication successful', status: 200,userId:id, data: Profile, Profilecheck: true });
                } else {
                  return res.status(200).json({ message: 'Authentication successful', status: 200, userId:id,Profilecheck: false });
                }
              })
              .catch((err) => {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error', status: 404 });
              });
          });
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
        transport.jsonMail(mailOptions, (err) => {
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
router.post('/reset-password', async (req, res) => {
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


router.post('/emailverification',(req,res)=>{
  let {email,code}=req.body
  user.findOne({Email:email})
  .then(result=>{
    const _id=result._id
    patientverifiy(_id,code,res)
    }).catch(err=>{conole.log(err)
    res.json({message:"cannot find the user",status:404})    
    })

  })
  router.post('/reserve',(req,res)=>{

    let {doctorId,dayOfWeek,patientId,TimeOfDay,dayOfMonth,month,Year}=req.body
    
    console.log(doctorId)
    const Reservation= new reservation({
    doctorId:doctorId,
    patientId:patientId,
    dayOfWeek:dayOfWeek,
    dayOfMonth:dayOfMonth,
    TimeOfDay:TimeOfDay,
    month:month,
    Year:Year
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

















    
  module.exports = router