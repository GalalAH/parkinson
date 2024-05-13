const bycrypt =require("bcrypt")
const Localstrategy =require("passport-local").Strategy 


 function initilaize(passport,getUserByEmail,getUserById){
    const authenticateuser =async (email,password,done)=>{
    const user = await getUserByEmail(email)
    
    
    if(user==null){
return done(null,false,{message:'no user with that email'})
    }
    
   
     try{if (await bycrypt.compare(password,user.password)){
        return done(null,user)
        
     }else{
        return done(null,false,{message :'incorrect password'})
     }
     
    }
    catch(e){
    
        return done(e)
    }
    }
passport.use(new Localstrategy({usernameField:"email"},authenticateuser))
passport.serializeUser((user,done)=>{done(null,user._id)})
passport.deserializeUser((_id,done)=> { return done(null,getUserById(_id))})
}







    
 




module.exports = initilaize
 




