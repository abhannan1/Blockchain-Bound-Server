const { verifyAccessToken } = require("../services/JWTServices");

const isAuthenticated = (req, res, next) =>{

    const {refreshToken, accessToken} = req.cookies;

    if(!refreshToken || !accessToken){
        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        })
    }

    verifyAccessToken(accessToken, req, res)

    next()

}

module.exports = isAuthenticated