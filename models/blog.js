const mongoose = require("mongoose")

const blogSchema = mongoose.Schema({
    title:{
        type:String,
        require:true,
    },
    content:{
        type:String,
        require:true,
    },
    photoPath:{
        type:String,
        default:false,

    },
    author:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        require:true
    },
    
},
{timestamps:true}
) 


module.exports = mongoose.model("Blog", blogSchema, "blogs")