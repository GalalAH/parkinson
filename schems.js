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
const User = new schema({
password:{
        type: String,
        requird : true
},
Name:{ type: String,
    requird : true},

Email:{ type: String,
    requird : true}
})

const blog =mongoose.model("blog",blogschema)
const Doctors = mongoose.model("Doctorsinfo",doctors)
const user = mongoose.model("user",User)

module.exports ={blog,Doctors,user}
