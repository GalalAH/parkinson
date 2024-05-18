const mongoose = require("mongoose");
const schema = mongoose.Schema;
const blogschema =new schema({
title: {
    type: String,
    requird : true
},
body: {type: String,
    requird : true
}})

// user Verification 

const UserVerificationschema = new schema({
userId:{ type: String, required: true },
verificationCode:String,
createdAt:Date,
expiresAT:Date
})
///////////
const doctors =new schema({
img:{type: String,
requird : true}
,role:{type: String,
    requird : true}
,address:{type: String,
    requird : true}
,name:{type: String,
    requird : true}

})

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
  
  // Define schema for the 'blog' collection (if needed)
  const blogSchema = new mongoose.Schema({
    // Define fields for your blog schema as needed
  })


//pateints schema

const Patientschema = new schema({
    userId: { type: String, required: true },
    phone: { type: String },
    Name: { type: String, required: true },
    address: { type: String },
    age: { type: String, required: true },  // 
    gender: { type: String, required: true },

    illness: { type: String },
    score:{type: Number}

})

const profileschema= new schema({
    img:String,
    userId :String,
    phone: { type: String},
    Name: { type: String, required: true },
    address: { type: String },
    workdays:{type:Array},
    startTime:String, endTime:String, step:String
})
const weeklyScheduleSchema = new mongoose.Schema({
    userId :String,
    dayOfWeek: String,
    dayOfMonth: Number,
    timeSlots: [
      {
        time: String,
        available: Boolean
      }
    ],
    available: Boolean
  });
  
const Schedule = mongoose.model('WeeklySchedule', weeklyScheduleSchema);

const patient=mongoose.model("Pateints",Patientschema)
const blog =mongoose.model("blog",blogschema)
const Doctors = mongoose.model("Doctorsinfo",doctors)
const user = mongoose.model("user",User)
const UserVerification = mongoose.model("UserVerification",UserVerificationschema )

const profile = mongoose.model("profiles",profileschema)
module.exports ={blog,Doctors,user,UserVerification,patient,profile,Schedule}

  
