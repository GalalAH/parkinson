post /sinup
    Req:{
      password : string
      email : String
      name:string		
}
    Res:{
	Message:string
        Statues: int
}
get /login

Req: {email: sTring,
passwoerd: sTring,

Res:{
If (successfully and have profile) =>
       message:string
        Statues: int
        if (profilecheck){
            data:{
            img:String,
            userId :String,
            phone: { type: String},
            Name: { type: String, required: true },
            address: { type: String },
            workdays:{type:Array},
            startTime:String, endTime:String, step:String}},
        
        Profilecheck:bolean if false proceed to profile makeing
}






get /emailverification
req : {

 code: number,
email":String
}
res:{
message:string,
status:number
}
post /forget-password


req:{
email:String


}

res:{
     
    message: String
    status: number

}
post /Verify-code

req{
email:String,
code:number
}
res:{
     
    message: String
    status: number

}
post /reset-password
req{
email:String
newPassword:String

}


get PatientList
    req:nothing
    res:"result": [
        {
            "_id":string ,
            "userId":string ,
            "phone":int ,
            "Name":string ,
            "age": int,
            "gender": string ,
            "illness":bolean,
            "__v": 0
        }
    ],
    "status": 200
}
    }


    /addPateint
     req:   res:"result": [
        {
            "_id":string ,
            "userId":string ,
            "phone":int ,
            "Name":string ,
            "age": int,
            "gender": string ,
            "illness":bolean,
            
    ],
    "status": 200
}

    res:{message: string,status:int}

delete "/deletePateint"
req:{_id:string}


res:{message: string,status:int}

post /editPateint
req:{ "_id":string ,
            "userId":string ,
            "phone":int ,
            "Name":string ,
            "age": int,
            "gender": string ,
            "illness":bolean,
    score:{type: int}}
res:{message: string,status:int}

get "/findPatient"
req: param

res:{ "result": [
        {
            "_id":string ,
            "userId":string ,
            "phone":int ,
            "Name":string ,
            "age": int,
            "gender": string ,
            "illness":bolean,
            score:int
    ],
    "status": 200
}
    or
    {message: string,status:int}


    post /profile
    req:{

        name:String,
        address:String,
        phone:String, 
        startTime:String,
        endTime,:String
        step:String,
        workdays:array of String

    }
    res:{
    message: string
    ,status:int
    }
 post / view-profile
            req:{
                nothing
                }   
            res:{data:{
                    _id:String this is the id of the profile document
                    img:String,
                    userId :String,
                    phone: { type: String},
                    Name: { type: String, required: true },
                    address: { type: String },
                    workdays:{type: Array of Strings },
                    startTime:String, endTime:String, step:String
                    },
                    status:int

                            }    

post  /edit-profile
req:{               _id:_id (the id of the profile document)
                    if(there is new img) img: file
                    phone: { type: String},
                    Name: { type: String, required: true },
                    address: { type: String },
                    workdays:{type: Array of Strings },
                    startTime:String, endTime:String, step:String
                            }
res:        {
        message:String,
        status:int
            }