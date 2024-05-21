const bycrypt =require("bcrypt")
const  {UserVerification,user}=require("./schems")
const {patientVerification,patientUser} =require("./patientschema")
const verifiy = async (_id,verificationCode,res)=>{
    console.log("id",_id)
  console.log("verificationCode",verificationCode)
   await UserVerification.findOne({userId : _id})
  .then((result)=>{
    console.log("result",result)  
if(result){
  const{expiresAT} = result.expiresAT
  const hashedverificationCode =result.verificationCode

  if(expiresAT<Date.now()){
    UserVerification.deleteOne({userId:_d})
    .then(result =>{
user.deleteOne({userId:_id}
  .then(res.send({message:'link expired',status:200}))
  .catch(err => console.log(err)))

    } )

  }else{
bycrypt.compare(verificationCode,hashedverificationCode)
.then(result=>{
  if(result){
  
    user.updateOne({_id:_id},{verified:true})
      .then(()=>{
        UserVerification.deleteMany({userId:_id})
          .then(()=>{
        res.send({message :"user verified ",status:200})})
        .catch(err=>{console.log(err)})
          })
      .catch(err=>{console.log('err updateing the  , thr err ' +err)})
 }else{
    console.log("invalid unigue string")
    res.send({message :"invalid code ",status:404})
  } 
})
  }
}else{console.log("account don't exist")
res.send({message:"account don't exist",staus:404})}
  })
  .catch((err)=>console.log(err)) }

///////////////////////////
//////////////////////////




  const patientverifiy = async (_id,verificationCode,res)=>{
    console.log("id",_id)
  console.log("verificationCode",verificationCode)
   await patientVerification.findOne({userId : _id})
  .then((result)=>{
    console.log("result",result)  
if(result){
  const{expiresAT} = result.expiresAT
  const hashedverificationCode =result.verificationCode

  if(expiresAT<Date.now()){
    patientVerification.deleteOne({userId:_d})
    .then(result =>{
      patientUser.deleteOne({userId:_id}
  .then(res.send({message:'link expired',status:200}))
  .catch(err => console.log(err)))

    } )

  }else{
bycrypt.compare(verificationCode,hashedverificationCode)
.then(result=>{
  if(result){
  
    patientUser.updateOne({_id:_id},{verified:true})
      .then(()=>{
        patientVerification.deleteMany({userId:_id})
          .then(()=>{
        res.send({message :"user verified ",status:200})})
        .catch(err=>{console.log(err)})
          })
      .catch(err=>{console.log('err updateing the  , thr err ' +err)})
 }else{
    console.log("invalid unigue string")
    res.send({message :"invalid code ",status:404})
  } 
})
  }
}else{console.log("account don't exist")
res.send({message:"account don't exist",staus:404})}
  })
  .catch((err)=>console.log(err)) }


  module.exports={verifiy,patientverifiy }


