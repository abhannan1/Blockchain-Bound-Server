class BlogDetailsDTO {
    constructor(blog){
        this._id = blog._id;
        this.content = blog.content;
        this.title = blog.title;
        this.photo = blog.photoPath;
        this.author_id = blog.author._id
        this.authorName =  blog.author.name
        this.authorUsername =  blog.author.username
        this.createdAt = blog.createdAt
    }
}

module.exports = BlogDetailsDTO