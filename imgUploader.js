const {google} = require("googleapis")
const apikey =require("./drive_api.json")
const SCOPE= ["https://www.googleapis.com/auth/drive"]
const { Readable } =  require('stream')
const fs = require('fs');
function convertDriveLink(originalLink) {
  const start = originalLink.indexOf('/d/') + 3;
  const end = originalLink.indexOf('/view');
  const fileId = originalLink.substring(start, end);
  
  return `https://drive.google.com/uc?id=${fileId}&export=download`;}

// Inside your endpoint after receiving the file

const {profile}=require("./schems")
const{patientUser}=require('./patientschema')
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
const download =convertDriveLink(link)
profile.findByIdAndUpdate(id,{img:download})


.catch((err)=>{console.log(err)})

return link
}catch(err){console.log(err)
    console.log("img not uploaded")

  }

}


async function patientuploadfile(authclient,img,id){
  try{
   
const drive = google.drive({version:"v3",auth:authclient})
const filemetadata = {
   name:img.name,
   parents:["1XXA8L-vQ8llrkkmGdDuFgCgcKrZ_pptM"]
  }
  console.log(id)
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
const download =convertDriveLink(link)
patientUser.findByIdAndUpdate(id,{img:download})

.catch((err)=>{console.log(err)})

return link
}catch(err){console.log(err)
    console.log("img not uploaded")

  }

}



module.exports ={authorize,uploadfile,patientuploadfile}
