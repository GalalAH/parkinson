const {google} = require("googleapis")
const apikey =require("./drive_api.json")
const SCOPE= ["https://www.googleapis.com/auth/drive"]


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
   name:`${img.originalname}`,
   parents:["1XXA8L-vQ8llrkkmGdDuFgCgcKrZ_pptM"]
  }
  const response = await drive.files.create({
    resource:filemetadata,
    media:{
    mimeType: img.mimetype,
    body: img.Buffer},
    fields: 'id, webViewLink'
  })
  

  console.log("response",response.data.webViewLink)
const link = response.data.webViewLink
profile.findByIdAndUpdate(id,{img:link})
.catch((err)=>{console.log(err)})


}catch{
    console.log("img not uploaded")

  }
}
module.exports ={authorize,uploadfile}