const express = require("express");
const { addComment, deleteComment, editComment, getCommentById, getCommentsByBlogId} = require("../controllers/commentControllers");
const { routeError } = require("../utils/features");
const isAuthenticated = require("../middleWares/auth");

const router = express.Router();

router.post("/addComment/:id",isAuthenticated , addComment)
router.delete("/:id", isAuthenticated, deleteComment)
router.put("/:id", isAuthenticated, editComment)
router.get("/all/:id", getCommentsByBlogId)
router.get("/:id", getCommentById)

module.exports = router;