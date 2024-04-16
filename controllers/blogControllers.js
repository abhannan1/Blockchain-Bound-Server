const Joi = require("joi");
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const { ErrorHandler } = require("../middleWares/error");
const { default: mongoose } = require("mongoose");
const fs = require('fs');
const { BACKEND_SERVER_PATH } = require("../config");
const BlogDTO = require("../dto/blogDTO");
const BlogDetailsDTO = require("../dto/blogDetailsDTO");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const createBlog = async (req, res, next) =>{

    //client side -> base64 encoded string -> decode -> store -> save photo's path in db
    
    const blogCreateSchema = Joi.object({
        //if sending author id from req
        //author:Joi.string().regex(mongodbIdPattern).required
        author:Joi.ref('User'), 
        title:Joi.string().required(),
        content:Joi.string().required(),
        photo:Joi.string().required(),
    })
    
    //getting author id from authentication
    const author = req?.user?._id;
    
    if (!author){
        return next(new ErrorHandler("Unauthorized", 401))
    }
    const {error} = blogCreateSchema.validate(req.body)

    if (error){
        return next(error)
    }

    const {title, content, photo} = req.body;

    //reading photo in buffer, 
    //cleaning image string using replace  , /meta data\/types of photos; encoding base64 replaced by empty string , encoding base64   
    const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64')

    //allot a random name
    const imagePath = `${Date.now()}-${author}.png`;

    try{
        
        // save locally, store in storage folder /name of file
        fs.writeFileSync(`storage/${imagePath}`, buffer)

        const newBlog = await Blog.create({
            title,
            author,
            content,
            photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
        })

        if (!newBlog){
            return next( new ErrorHandler("Not created",400))
        }

        const blogDTO = new BlogDTO(newBlog)
        
        return res.status(201).json({
            success:true,
            message:"Blog added successfully",
            blog:blogDTO
        })


    }catch(error){
        next (error)
    }
    
}

const deleteBlog = async (req, res, next ) =>{
    
    const _id = req.params.id
    console.log(_id)
    
    try{
        
    
        if(!mongoose.Types.ObjectId.isValid(_id)){
            return next (new ErrorHandler ("Invalid Id or request", 400))
        }
        
        const blog = await Blog.findByIdAndDelete({_id})

        await Comment.deleteMany({blog:_id})

        if(!blog){
            return next (new ErrorHandler ("Bog not found", 404))
        }
        
        res.status(200).json({
            success:true,
            message:"Blog deleted",
            blog
        })
    }catch(error){
        return next (error)
    }

}

const updateBlog = async (req, res, next) => {
    const blogUpdateSchema = Joi.object({
      author: Joi.ref("User"),
      title: Joi.string(),
      content: Joi.string(),
      photo: Joi.string(),
    });
  
    const { error } = blogUpdateSchema.validate(req.body);
  
    if (error) {
      return next(error);
    }
  
    const blogId = req.params.id;
    const { title, content, photo } = req.body;
    const author = req?.user?._id;

    if (!author) {
        return next( new ErrorHandler("Unauthorized", 401));
      }

    try {
      if (
        !mongoose.Types.ObjectId.isValid(blogId) ||
        !mongoose.Types.ObjectId.isValid(author)
      ) {
        return next(new ErrorHandler("Invalid Id or request", 400));
      }
  
      const blog = await Blog.findById({ _id: blogId });
  
      if (!blog) {
        return next(new ErrorHandler("Blog not found", 404));
      }
  
      let updatedBlog; // declare the updatedBlog variable here
  
      if (photo) {
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64')
        imagePath = `${Date.now()}-${author}.png`
        fs.writeFileSync(`storage/${imagePath}`, buffer)
        // code for updating blog with photo
        // ...
        updatedBlog = await Blog.findByIdAndUpdate(
          { _id: blogId },
          {
            ...req.body,
            content,
            title,
            photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
          },
          { new: true }
        );
      } else {
        // code for updating blog without photo
        // ...
        updatedBlog = await Blog.findByIdAndUpdate(
          { _id: blogId },
          { ...req.body },
          { new: true }
        );
      }
  
      if (!updatedBlog) {
        return next(new ErrorHandler("Error occurred while updating", 304));
      }
      
      //status code 204 wont send any content in response if you want response use 200
      return res.status(204).json({
        success: true,
        message: "Blog updated",
        // updatedBlog, // include updatedBlog as a property of the response object
      });
    } catch (error) {
      return next(error);
    }
};

const getBlogById = async (req, res, next) =>{    
    // const getByIdSchema = Joi.object({
    //     _id:Joi.string().regex(mongodbIdPattern).required()
    // })

    // const {error} = getByIdSchema.validate(req.params.id)

    // if(error){
    //     return next(error)
    // }
    
    const _id = req.params.id;
    try{
        if(!mongoose.Types.ObjectId.isValid(_id)){
            return next (new ErrorHandler ("Invalid Id or request", 400))
        }

        const blog = await Blog.findById(_id).populate("author")
        
        if(!blog){
            return next (new ErrorHandler ("Bog not found", 404))
        }
        
        const blogDetailsDTO = new BlogDetailsDTO(blog)
        res.status(200).json({
            success:true,
            blogDetailsDTO
        })

        if(!blogDetailsDTO){
            return next (new ErrorHandler ("Specific error", 444))
        }

    }catch(error){
        return next (error)
    }

}


const getAllBlogsById = async(req,res, next) =>{
    const userId = req.user._id;
    console.log(userId)
    try{

        if(!mongoose.Types.ObjectId.isValid(userId)){
            return next (new ErrorHandler ("Invalid Id or request", 400))
        }

        const allBlogs = await Blog.find({ author:userId })
        // const allBlogs = await Blog.find({ author:userId }).sort({createdAt:-1})
        // console.log(allBlogs)
        
        if(!allBlogs || allBlogs.length===0){
            return next (new ErrorHandler ("No blogs to show", 404))
        }

        allBlogs.sort( (e1, e2)=>{
            return e1.createdAt > e2.createdAt ? -1 : e1.createdAt < e2.createdAt ? 1 : 0
        })

        // simple implicit return
        // allBlogs.sort( (e1, e2)=>
        //     e1.createdAt > e2.createdAt ? -1 : e1.createdAt < e2.createdAt ? 1 : 0
        //  )

        const blogsDTO = [];
         
        for (let i=0; i<allBlogs.length; i++ ){
            const dto = new BlogDTO(allBlogs[i])
            blogsDTO.push(dto);
        }
        

        res.status(200).json({
            success:true,
            blogsDTO
        })

    }catch(error){
        return next(error)
    }


}

const getALLBlogs = async (req, res, next) =>{


    try{

        const allBlogs = await Blog.find({})
        // const allBlogs = await Blog.find({}).sort((a,b)=>b-a)

        // console.log(allBlogs)
        
        if(!allBlogs || allBlogs.length===0){
            return next (new ErrorHandler ("No blogs to show", 404))
        }
        allBlogs.sort( (e1, e2)=>{
            return e1.createdAt > e2.createdAt ? -1 : e1.createdAt < e2.createdAt ? 1 : 0
         })
        const blogsDTO = [];
         
        for (let i=0; i<allBlogs.length; i++ ){
            const dto = new BlogDTO(allBlogs[i])
            blogsDTO.push(dto);
        }

        

        res.status(200).json({
            success:true,
            blogsDTO
        })

    }catch(error){
        return next(error)
    }


}



module.exports = {
    createBlog,
    deleteBlog,
    updateBlog,
    getBlogById,
    getALLBlogs,
    getAllBlogsById
}