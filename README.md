post /sinup
=
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
=
	req : {
		
		 code: number,
		email":String
		}
		res:{
			message:string,
			status:number
		}
post /forget-password
=

	req:{
	email:String
	

	}

res:{
     
    message: String
    status: number

     }
post /Verify-code
=
	req{
	email:String,
	code:number
	}
	res:{
	     
	    message: String
	    status: number
	
	    }
post /reset-password
=
	req{
	email:String
	newPassword:String
	
	}


get PatientList
    req:userId
    res:"result": [
        {
            "_id":string ,
            "userId":string ,
            "phone":STring ,
            "Name":string ,
            "age": int,
            "gender": string ,
            "illness":string but empty  untill the ai finishs,
            "__v": 0
        }
    ],
    "status": 200
}
    }


    /addPateint
     req:   
        {
            "userId":string ,
            "phone":int ,
            "Name":string ,
            "age": int,
            "gender": string ,

}

    res:{message: string,status:int}

delete "/deletePateint"
req:{_id:string}


res:{message: string,status:int}

post /editPateint
req:{ 
            "userId":string ,
            "phone":string ,
            "Name":string ,
            "age": String,
            "gender": string ,
            }
res:{message: string,status:int}

get "/findPatient"
req: param

res:{ "result": [
        {
            "userId":string ,
            "phone":String ,
            "Name":string ,
            "age": String,
            "gender": string ,
            score:string
    ],
    "status": 200
}
    or if error happend
    {message: string,status:int}


    post /profile
    req:{
        
        image: type: file(any img type)
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
    _id:string
    }



post  /edit-profile
req:{               _id:_id (the id of the profile document)
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

        post    /new-profileImage
        _id : String( the id of the profile)
        image : the new image




  post  /edit-profile
    req:{
        userId:String
        phone: String,
        Name: String,
        address: String,
        workdays:array of String,
        startTime:String,
        endTime:String,
        step:String

       }
       res:{
        message:String
        status: int
       }


    post  /apoinmments
    req:{
        userId:String
        
       }
       res:{
        reserve:{
            doctorId :String,
            patientId:String,
            dayOfWeek:String,
            dayOfMonth:String,
            TimeOfDay:String,
            month:String,
            Year:String
            img:String
            name:string
                }
        status: int
       }



       /new-profileImage
       res:{
        image:file
        _id:string(id of profile)

       }
res:{
        message:string
        link:string
        status:int
        }





       post /reserve
        req:{
            name:string,
            doctorIdstring,
            dayOfWeek:string,
            patientId:string
            ,TimeOfDay:string,
            dayOfMonth:string,
            month:string,
            Year:string
        }
        res:{
        message:string
        status:int
        }



     post   /doctors-list

     req: nothing


        res:{
            data:[
                img:String,
                userId :String,
                phone:  String,
                Name:  String,,
                address: String }
                workdays:{type:Array},
                startTime:String
                endTime:String,
                step:String
                ]
                ,status:int
        }

    post /apoinmments
    req:{
        //patientId
        userId:string
    }
    res:{
        result={
                doctorId :String,
                patientId:String,,
                dayOfWeek:String,,
                dayOfMonth:String,,
                TimeOfDay:String,,
                month:String,,
                Year:String
        },
        status:int
        }
        post /avalible-apoinmments
        req:{
        //doctorId
        userId:string
                }
        res:{
                userId :String,
                dayOfWeek: String,
                dayOfMonth: String,
                month:String,
                Year:String,
                timeSlots: [
                {
                    time: String,
                    available: Boolean// you don't have to access it
                }
                ],
                available: Boolean // you don't have to access it
            }




      post   /cancel-apoinmment
      req:{

        userId:string
        ,dayOfMonth:string,
        month:string,
        year:string,
        TimeOfDay:string,
        doctorId:string
      }
      res:{
        message :string
        status:int

            }

    post/edit-profile
    req:{

        gender:string,
         phone:string,
         name:string,
          email:string ,
          userId:string
    }        
    res:{

        message :string
        status:int



    }

    post /new-profileImage
    req:{image:file
    
        
    
        }

