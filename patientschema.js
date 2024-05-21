const mongoose = require("mongoose");
const schema = mongoose.Schema;

// user Verification 

const patientVerificationschema = new schema({
userId:{ type: String, required: true },
verificationCode:String,
createdAt:Date,
expiresAT:Date
})
///////////
 // reseerved apoinmments
 const reservedApoinmentschema= new mongoose.Schema({
  doctorId :{type:String,required:true},
  patientId:{type:String,required:true},
  dayOfWeek:{type:String,required:true},
  dayOfMonth:{type:String,required:true},
  TimeOfDay:{type:String,required:true},
  month:{type:String,required:true},
  Year:{type:String,required:true}

});
  





//  user shema


const User = new mongoose.Schema({
    password: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    Email: {
      type: String,
      required: true,
      unique: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
    
    },
    forgetpassword: {
      type: String  // Assuming this is a string field
    },
    resetPasswordCode: {
      type: Number  // Assuming this is a numeric field
    }
  });
  

 

//pateints schema


const profileschema= new schema({
    img:String,
    userId :String,
    phone: { type: String},
    Name: { type: String, required: true },
    address: { type: String },
    workdays:{type:Array},
    startTime:String, endTime:String, step:String
})

const patientUser = mongoose.model("patientUser",User)
const patientVerification = mongoose.model("patientVerification",patientVerificationschema )
const reservation = mongoose.model("reserved",reservedApoinmentschema )
const profile = mongoose.model("patientprofile",profileschema)
module.exports ={patientUser,patientVerification,profile,reservation}

  
