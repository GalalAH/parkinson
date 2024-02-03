/sinup
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
/login
Req: nothing
Res:{
If (successfully) =>UserId:string
Message:string
Statues:int
}

