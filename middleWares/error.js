// const {ValidationError} = require("joi")


class ErrorHandler extends Error{
    constructor(message,status){
        super(message),
        this.status = status
    }
}


const errorMiddleWare = (error, req, res, next) =>{

    const status = error.status || 500;
    const message = error.message || "Internal server error"
    let data = {
        success:false,
        message
    }
    return res.status(status).json(data)

    //let status = 500,
    //let data= {
    //     message:"Internal server error"
    // }

    // if (error instanceof ValidationError){
    //     status = 401;
    //     data.message = error.message;

    //     return res.status(status).json(data)
    // }

    // if(error.status){
    //     status = error.status
    // }

    // if(error.message){
    //     data.message = error.message
    // }

    // return res.status(status).json(data)

}

module.exports = {
    errorMiddleWare,
    ErrorHandler
}

