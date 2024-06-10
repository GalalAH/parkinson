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
  Year:{type:String,required:true},
  doctorName:{type:String,required:true},
  patientName:{type:String,required:true},
  status:{type:String},
  apoinmmentId:String,
  img:String,
  doctorimg:String
});
  





//  user shema


const UserPatient = new mongoose.Schema({
    img:String,
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
    gender:String,
    forgetpassword: {
      type: String  // Assuming this is a string field
    },
    resetPasswordCode: {
      type: Number  // Assuming this is a numeric field
    }
  });
  

  const rateschema= new schema({
    userId:String,
    ratecount:{type:Number,
      default: 0},
    totalrate:{type:Number,
      default: 0}
    })

//pateints schema


const rate= mongoose.model("rate",rateschema)
const patientUser = mongoose.model("patientUser",UserPatient)
const patientVerification = mongoose.model("patientVerification",patientVerificationschema )
const reservation = mongoose.model("reserved",reservedApoinmentschema )
module.exports ={patientUser,patientVerification,reservation,rate}

  
