const {google} = require("googleapis")
const apikey =require("./drive_api.json")
const SCOPE= ["https://www.googleapis.com/auth/drive"]
const { Readable } =  require('stream')
const fs = require('fs');

// Inside your endpoint after receiving the file

const {profile}=require("./schems")
async function authorize(){
const jwtClient = new google.auth.JWT(
apikey.client_email,
null,
apikey.private_key,
SCOPE
)
await jwtClient.authorize()

return jwtClient

}
async function uploadfile(authclient,img,id){
  try{
   
const drive = google.drive({version:"v3",auth:authclient})
const filemetadata = {

   name:img.name,

   parents:["1XXA8L-vQ8llrkkmGdDuFgCgcKrZ_pptM"]
  }
  console.log(img.data)
  console.log(img.mimetype)
  const response = await drive.files.create({
    resource:filemetadata,
    media:{
    mimeType: img.mimetype,
    body: Readable.from(img.data)} ,
    fields: 'id, webViewLink'
  })
  

console.log("response",response.data.webViewLink)
const link = await response.data.webViewLink
profile.findByIdAndUpdate(id,{img:link})

.catch((err)=>{console.log(err)})

return link
}catch(err){console.log(err)
    console.log("img not uploaded")

  }



}
module.exports ={authorize,uploadfile}
