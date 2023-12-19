const express = require('express')
const bodyParser = require("body-parser")
const app = express()

app.use(express.json());
app.get('/',(req,res)=>{res.send(data)})


app.get('/login',(req,res)=>{  
  var username =req.body.username
  var id =req.body.id
    res.send(req.body) 
    //console.log(req.body)
    console.log(req.query)
})
app.get('/signup',(req,res)=>{
  if(req.query.password!=req.query.passwordcheck){
    res.send({err:"password don't match"}) 
  }
  if(req.query.username!=req.query.usernamecheck){
    res.send({err:"username alredy chosen"}) 
  }
  res.status(202).send("signd successfully")
    res.send(req.body)
    
    //console.log(req.body)
    console.log(req.query)
})
app.get('/signup',(req,res)=>{})





app.listen(5000,()=>{
console.log('server is running')




})
