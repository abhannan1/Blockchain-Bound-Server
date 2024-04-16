const express =  require('express')
const axios = require('axios')
const { getArticals } = require('../controllers/externalApiController')


const router = express.Router()


router.get('/getArticals', getArticals)

module.exports = router