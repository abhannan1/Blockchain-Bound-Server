const Joi = require("joi");
const bcrypt = require("bcrypt")
const User = require("../models/user");
const { ErrorHandler } = require("../middleWares/error");
const { sendCookieLogin, sendCookie } = require("../utils/features");
const UserDTO = require("../dto/userDTO");
const { signAccessToken, signRefreshToken, storeRefreshToken, verifyRefreshToken } = require("../services/JWTServices");
const RefreshToken = require("../models/token");
const JWTServices = require("../services/JWTServices");


// const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const registerUser = async (req ,res ,next) =>{
    
    //validate user input
    const userRegisterSchema = Joi.object({
        name:Joi.string().max(30).required(),
        username:Joi.string().min(5).max(30).required(),
        email:Joi.string().email().required(),
        // password:Joi.string().pattern(passwordPattern).required(),
        password:Joi.string().required(),
        confirmPassword:Joi.ref('password')
    })
    
    const {error} = userRegisterSchema.validate(req.body)

    if(error){
        return next (new ErrorHandler (error.message, 403))
    }

    
    const {username ,name , email, password} = req.body;
    try{
        const emailMatch = await User.exists({email})

        if(emailMatch){
            return next (new ErrorHandler ("This email already registered", 409))
        }

        const usernameMatch = await User.exists({username})

        if(usernameMatch){
            return next (new ErrorHandler ("Username not available, choose another username", 409))
        }

        const hashedPassword = await bcrypt.hash(password, 10) 

        const user = await User.create({
            name,
            username,
            email,
            password:hashedPassword
        })

        if(!user){
            return next (new ErrorHandler(error.message, error.status))
        }

        const userDTO = new UserDTO(user)


        const accessToken = signAccessToken({_id:userDTO._id, username:userDTO.username}, '30m')

        const refreshToken = signRefreshToken({_id:userDTO._id, username:userDTO.username}, '60m')

        await storeRefreshToken(refreshToken,userDTO._id)

        sendCookie(userDTO, res, `welcome ${user.name}`, 201 , accessToken, refreshToken)


    }catch(error){
        return next (error)
    }
}

const loginUser = async (req, res, next)=>{

    const userLogin = Joi.object({
        username:Joi.string().min(5).max(30).required(),
        // password:Joi.string().pattern(passwordPattern).required(),
        password:Joi.string().required(),
    })

    const {error} = userLogin.validate(req.body);

    if (error){
        return next( new ErrorHandler(error.message, 403))
    }

    const {username, password} =  req.body;
    
    try{

        const user = await User.findOne({username}).select("+password");

        if(!user){
            return next (new ErrorHandler("Invalid username", 401))
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return next (new ErrorHandler("Invalid Password", 401))
        }

        const userDTO = new UserDTO(user)

        const accessToken = signAccessToken({_id:userDTO._id, username:userDTO.username}, '30m')

        const refreshToken = signRefreshToken({_id:userDTO._id, username:userDTO.username}, '60m')


        await RefreshToken.updateOne({
            _id:userDTO._id
        },
        {token:refreshToken},
        {upsert:true}
        )

        sendCookie(userDTO, res, `welcome ${user.name}`, 200 , accessToken, refreshToken)

    } catch(error){
        return next(error)
    }
}


const logoutUser = async(req, res, next) =>{
    const {refreshToken} = req.cookies;
    console.log(req.user)

    try{
        await RefreshToken.deleteOne({token:refreshToken})

    } catch(error){
        return next(error)
    }

    res
    .clearCookie("refreshToken", {
        sameSite:process.env.NODE_ENV.trim()==="Development" ? "lax" : "None",
        secure:process.env.NODE_ENV.trim()==="Development" ? false : true
    })
    .clearCookie("accessToken", {
        sameSite:process.env.NODE_ENV.trim()==="Development" ? "lax" : "None",
        secure:process.env.NODE_ENV.trim()==="Development" ? false : true
    })
    .json({
        success:true,
        user:null,
        auth:false
    })
}


const refresh = async (req, res, next) =>{
    const originalRefreshToken = req.cookies.refreshToken;
    let id
    try {
        id = JWTServices.verifyRefreshToken(originalRefreshToken)._id;
      } catch (e) {
        const error = {
          status: 401,
          message: "Unauthorized id",
        };
  
        return next(error);
      }

    try{
        
        const match =  RefreshToken.findOne({_id:id, token:originalRefreshToken})
        // const match1 = RefreshToken.findOne({_id: id,token: originalRefreshToken});
    
        if(!match){
            return   res.status(401).json({
                success:false,
                message:"Unauthorized token"
            })
        }

        
        const user = await User.findById(id)

        if(!user){
            return   res.status(401).json({
                success:false,
                message:"Unauthorized user"
            })
        }
        
        const userDTO = new UserDTO(user)

        const accessToken = signAccessToken({_id:id, username:userDTO.username}, "30m")
        
        const refreshToken = signRefreshToken({_id:id, username:userDTO.username}, "60m")
        
        await RefreshToken.updateOne({
            _id:userDTO._id
        },
        {token:refreshToken},
        {upsert:true}
        )
        
        sendCookie(userDTO, res, "Tokens refreshed", 200, accessToken, refreshToken)


    }catch(error){
        return next (error)
    }

}


const getUserProfile = (req, res ,next) =>{
    const user = req?.user
    if(user){
        return res.status(200).json(user)
    }else{
        return   res.status(401).json({
            success:false,
            message:"Unauthorized"
        })    
    }


}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refresh,
    getUserProfile
}