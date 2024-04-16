const Joi = require("joi");
const Comment = require("../models/comments");
const { ErrorHandler } = require("../middleWares/error");
const { default: mongoose } = require("mongoose");
const CommentDTO = require("../dto/commentDTO");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const addComment = async (req, res, next) => {
  const addCommentSchema = Joi.object({
    content: Joi.string().required(),
    // author:Joi.string().regex(mongodbIdPattern).required(),
    // blog:Joi.string().regex(mongodbIdPattern).required(),
    author: Joi.ref("User"),
    blog: Joi.ref("Blog"),
  });

  
  console.log(req.body)
  const { error } = addCommentSchema.validate({content:req.body.content});

  if (error) {
    console.log(error)
    return next(error);
  }

  const authorIdSchema = Joi.object({
    id: Joi.string().regex(mongodbIdPattern).required(),
  });

  const { err } = authorIdSchema.validate(req.params.id);

  if (err) {
    return next(error);
  }

  const blogID = req?.params?.id;

  const author = req?.user?._id;
  
  if (!author) {
    return next( new ErrorHandler("Unauthorized", 401));
  }
  if (!blogID) {
    return next(error);
  }

  // const {content, author, blog} = req.body;
  const { content } = req.body; 

  try {
    const newComment = await Comment.create({
      content,
      author,
      blog: blogID,
    });

    if (!newComment) {
      return next(new ErrorHandler("Comment Not added", 400));
    }

    return res.status(201).json({
      success: true,
      message: "Commented",
      comment: newComment,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteComment = async (req, res, next) => {
  const _id = req.params.id;
  // console.log(_id)

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return next(new ErrorHandler("Invalid Id or request", 400));
    }

    const comment = await Comment.findByIdAndDelete({ _id });

    await Comment.deleteOne({ _id });

    if (!blog) {
      return next(new ErrorHandler("Bog not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted",
      comment,
    });
  } catch (error) {
    return next(error);
  }
};

const editComment = async (req, res, next) => {
  const editCommentSchema = Joi.object({
    content: Joi.string().required(),
  });

  const { error } = editCommentSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  const commentId = req.params.id;
  const { content } = req.body;

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      { _id: commentId },
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return next(new ErrorHandler("Comment not edited", 400));
    }

    return res.status(200).json({
      success: true,
      message: "Comment edited",
      updatedComment,
    });
  } catch (error) {
    return next(error);
  }
};

const getCommentById = async (req, res, next) => {
  // const getCommentSchema = Joi.object({
  //     id:Joi.string().regex(mongodbIdPattern).required(),
  // })

  // const {error} = getCommentSchema.validate(req.params);

  // if(error){
  //     return next(error)
  // }

  const _id = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return next(new ErrorHandler("Invalid Id or request", 400));
    }

    const comment = await Comment.findById(_id);
    // .populate("author")
    // .populate('blog')

    if (!comment) {
      return next(new ErrorHandler("Comment not found", 404));
    }

    res.status(200).json({
      success: true,
      comment,
    });
  } catch (error) {
    return next(error);
  }
};

const getCommentsByBlogId = async (req, res, next) => {
  // const getCommentSchema = Joi.object({
  //     id:Joi.string().regex(mongodbIdPattern).required(),
  // })

  // const {error} = getCommentSchema.validate(req.params);

  // if(error){
  //     return next(error)
  // }

  const _id = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return next(new ErrorHandler("Invalid Id or request", 400));
    }

    const comments = await Comment.find({ blog: _id }).populate("author");
    // .populate('blog')

    if (!comments) {
      return next(new ErrorHandler("Comment not found", 404));
    }

    comments.sort((e1, e2) =>
      e1.createdAt > e2.createdAt ? 1 : e1.createdAt < e2.createdAt ? -1 : 0
    );

    let commentsDTO = [];

    for (let i = 0; i < comments.length; i++) {
      const comment = new CommentDTO(comments[i]);
      commentsDTO.push(comment);
    }

    res.status(200).json({
      success: true,
      comments: commentsDTO,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addComment,
  deleteComment,
  editComment,
  getCommentById,
  getCommentsByBlogId,
};
