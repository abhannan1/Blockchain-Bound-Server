const dotenv = require("dotenv")

//dotenv
dotenv.config({path:"./config.env"})


const PORT = process.env.PORT || 3000;
const DB_URL = process.env.URL 
const SECRET_KEY = process.env.SECRET_KEY;
const NODE_ENV = process.env.NODE_ENV;
const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY
const NEWS_API_KEY_1 = process.env.REACT_APP_NEWS_API_KEY_2


module.exports = {
    PORT,
    DB_URL,
    SECRET_KEY,
    NODE_ENV,
    REFRESH_SECRET_KEY,
    ACCESS_SECRET_KEY,
    BACKEND_SERVER_PATH,
    NEWS_API_KEY,
    NEWS_API_KEY_1
}