const JWT = require("jsonwebtoken");
const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } = require("../config");
const RefreshToken = require("../models/token") 

class JWTServices {

    //sign access token
    static signAccessToken(payload, expiryTime){
        return JWT.sign(payload, ACCESS_SECRET_KEY, {expiresIn:expiryTime})
    }

    //sign refresh token
    static signRefreshToken(payload, expiryTime){
        return JWT.sign(payload, REFRESH_SECRET_KEY, {expiresIn:expiryTime})
    }
    
    //verify access token
    static verifyAccessToken(token, req, res){
        return JWT.verify(token, ACCESS_SECRET_KEY, (error, user)=>{
            if(error){
                return res.status(401).json({
                    success:false,
                    message:"Unauthorized"
                })
            }
    
            req.user = user;
        })
    }


    //verify refresh token 
    static verifyRefreshToken(token){
        return JWT.verify(token, REFRESH_SECRET_KEY)
    }


    //store refresh token
    static async storeRefreshToken(token, userId){
        try{
          const newToken = await RefreshToken.create({
                token,
                userId
            })

            // const newToken = new RefreshToken({
            //     token:token,
            //     userId:userId
            // })

            // await newToken.save()}
    }catch(error){
        console.log(error.message)
        }
    }
}

module.exports = JWTServices