const JWT = require("jsonwebtoken")
const { SECRET_KEY,  } = require("../config")
const { ErrorHandler } = require("../middleWares/error")
const { signAccessToken, signRefreshToken, storeRefreshToken } = require("../services/JWTServices")
const UserDTO = require("../dto/userDTO")

const sendCookie = ( userDTO, res, message, status=200, accessToken, refreshToken) =>{


    return res.status(status).cookie("accessToken" , accessToken,{
        httpOnly:true,
        // expire:new Date(Date.now() + 60 * 1000), token for 1 mint
        maxAge:15*60*1000, // token for 15 mints
        sameSite:"lax",
        secure:false
    }).cookie("refreshToken" , refreshToken,{
        httpOnly:true,
        // expire:new Date(Date.now() + 60 * 1000), token for 1 mint
        maxAge:15*60*1000, // token for 15 mints
        sameSite:"lax",
        secure:false
        // sameSite:process.env.NODE_ENV.trim()==="Development" ? "lax" : "None",
        // secure:process.env.NODE_ENV.trim()==="Development" ? false : true
    }).json({
        success:true,
        message:message,
        user:userDTO,
        auth:true
    })
}


// const sendCookieLogin = (userDTO, res, message, status=200) =>{
//     // const token = JWT.sign({_id:userDTO._id, username:userDTO.username}, SECRET_KEY)

//     //JWT expiry time is different then cookie expiry time
//     const accessToken = signAccessToken({_id:userDTO._id}, '30m')

//     const refreshToken = signRefreshToken({_id:userDTO._id}, '60m')

//     RefreshToken.updateOne({
//         _id:userDTO._id
//     },
//     {token:refreshToken},
//     {upsert:true}
//     )

//     return res.status(status).cookie("AccessToken" , accessToken,{
//         httpOnly:true,
//         // expire:new Date(Date.now() + 60 * 1000), token for 1 mint
//         maxAge:15*60*1000, // token for 15 mints
//         sameSite:process.env.NODE_ENV.trim()==="Development" ? "lax" : "None",
//         secure:process.env.NODE_ENV.trim()==="Development" ? false : true
//     }).cookie("RefreshToken" , refreshToken,{
//         httpOnly:true,
//         // expire:new Date(Date.now() + 60 * 1000), token for 1 mint
//         maxAge:15*60*1000, // token for 15 mints
//         sameSite:process.env.NODE_ENV.trim()==="Development" ? "lax" : "None",
//         secure:process.env.NODE_ENV.trim()==="Development" ? false : true
//     }).json({
//         success:true,
//         message:message
//     })
// }


const routeError= (req, res, next)=>{
    return next (new ErrorHandler ("Route Not Found", 404))
}

module.exports = {
    sendCookie,
    routeError
}


