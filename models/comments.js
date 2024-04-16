const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    content:{
        type:String,
        require:true,
    },
    
    blog:{
        type:mongoose.Types.ObjectId,
        ref:"Blog",
        require:true,
    },

    author:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        require:true
    },
    
},
{timestamps:true}
) 


module.exports = mongoose.model("Comment", commentSchema, "comments")