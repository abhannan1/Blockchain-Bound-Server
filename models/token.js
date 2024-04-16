const mongoose = require("mongoose")

const refreshTokenSchema = mongoose.Schema({
    token:{
        type:String,
        require:true,
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        require:true
    },
    
},
{timestamps:true}
) 


module.exports = mongoose.model("RefreshToken", refreshTokenSchema, "tokens")