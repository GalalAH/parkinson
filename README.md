post /sinup
=
    Req:{
      password : string
      email : String
      phone : number/int
      name:string		
}
    Res:{
	Message:string
        Statues: int
}
get /login
=
		Req: {email: sTring,
		passwoerd: sTring,
		UserId:id, the doctor id 
		Profilecheck:bolean if false proceed to profile makeing
		}
		
		Res:{
		If (successfully) =>UserId:string
		Message:string
		Statues:int
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
