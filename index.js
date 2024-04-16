const express = require("express")
const bodyParser = require("body-parser")
const database = require("./connection/dbConfig.js")
const cookieParser = require("cookie-parser")
const multer = require("multer")
const helmet = require("helmet") 
const cors = require("cors")
const morgan = require("morgan") 
//these two will help us properly set path when we config directories 
const path = require("path") 
const {PORT, NODE_ENV} = require("./config/index.js") 
const { errorMiddleWare } = require("./middleWares/error.js")
const  userRouter = require("./routes/userRoutes.js")
const  blogRouter = require("./routes/blogRoutes.js")
const  commentRouter = require("./routes/commentRoutes.js")
const isAuthenticated = require("./middleWares/auth.js")
const externalRouter = require("./routes/externalRoute.js")

const app = express()
database.connect()

app.use(express.json({limit:"100mb"}))
app.use(cookieParser())
// app.use(cors({
//     origin:[process.env.FRONTEND_URL, "https://b-chain-bound.vercel.app","*"],
//     methods:["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials:true // if not used then no credentials will reach frontend like in header or cookies
// }))

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "https://b-chain-bound.vercel.app"],
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.options('*', cors()); // Allow preflight requests for all routes

app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.send('Hello from Express.js with CORS!');
});

app.use(bodyParser.urlencoded({limit:"30mb", extended:true}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

/* CONFIGURATION */

// app.use('/storage', express.static('storage'))
app.use('/storage',express.static(path.join(path.resolve(), "storage")));


// app.use(["/blog"], isAuthenticated)

app.use("/", userRouter)
app.use("/comment", commentRouter)
app.use("/blog", blogRouter)
app.use("/articals", externalRouter)

app.get('/home',(req, res)=>{
    // console.log(__dirname)
    // const pathLocation = path.resolve();
    // res.sendFile(path.join(pathLocation, './index.html'))
    res.render("login")
    // res.sendFile("index.html")
})

app.use(errorMiddleWare)




app.listen(PORT, ()=>{
    console.log(`server is listening to the port ${PORT}`)
    // console.log(`server is listening to the port ${PORT} in ${NODE_ENV} Mode`)
})
