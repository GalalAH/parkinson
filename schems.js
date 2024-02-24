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
userId:String,
UniqueString:String,
createdAt:Date,
expiresAT:Date,

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


const User = new schema({
password:{
        type: String,
        requird : true
},
phone:{required:true,
type: Number },
Name:{ type: String,
    requird : true},

Email:{ type: String,    
    requird : true},
verified:Boolean
})

//pateints schema

const Patientschema = new schema({
    userId: { type: String, required: true },
    phone: { type: Number },
    Name: { type: String, required: true },
    address: { type: String },
    age: { type: Number, required: true },  // 
    gender: { type: String, required: true },
    illness: { type: Boolean },
    score:{type: Number}
})


const patient=mongoose.model("Pateints",Patientschema)
const blog =mongoose.model("blog",blogschema)
const Doctors = mongoose.model("Doctorsinfo",doctors)
const user = mongoose.model("user",User)
const UserVerification = mongoose.model("UserVerification",UserVerificationschema )

module.exports ={blog,Doctors,user,UserVerification,patient}
