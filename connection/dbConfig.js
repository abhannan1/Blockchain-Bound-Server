const mongoose = require("mongoose")
const { DB_URL } = require("../config")

const connection = async()=>{
    try{
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: truex,  dbName:"Crypto"  })
        console.log(`Connected Successfully to ${conn.connection.host}`)

    } catch(err){
        console.log("Connection failed:" + err.message)
    }
}

module.exports.connect = connection
