const { NEWS_API_KEY } = require( '../config/index.js')
const { NEWS_API_KEY_1 } = require( '../config/index.js')

const axios = require('axios');
const { ErrorHandler } = require('../middleWares/error');

const NEWS_API_ENDPOINT = `https://newsapi.org/v2/everything?q=bussiness OR (crypto)&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY_1}`

const getArticals = async(req, res, next) =>{
    try {
        // const {url} = req.body;
        // console.log(url)
        const response = await axios.get(NEWS_API_ENDPOINT)
        console.log(response.data)
        res.json(response.data)
    } catch (error) {
        // console.log(error)
        res.status(401).json(error)
    }

    // const options = {
    //     "action": "getArticles",
    //     "keyword": "Barack Obama",
    //     "articlesPage": 1,
    //     "articlesCount": 50,
    //     "articlesSortBy": "date",
    //     "articlesSortByAsc": false,
    //     "articlesArticleBodyLen": -1,
    //     "resultType": "articles",
    //     "dataType": [
    //       "news",
    //       "pr"
    //     ],
    //     "keyword": [
    //         "Business",
    //         "Cryptography"
    //       ],
    //     "apiKey": "9dd90818-7ae7-4be9-8393-3d84960b95c6",
    //     "forceMaxDataTimeWindow": 31
    //   };
      
    //   try {
    //       const response = await axios.post('https://eventregistry.org/api/v1/article/getArticles',options);
    //       console.log(response)
    //       if (response.status == 200){
        //          res.status(200).json(response.data)
    //      }
    //   } catch (error) {
    //     // console.log(error)
    //     return next (new ErrorHandler(500,"Internal API error" ))
    // }
}

module.exports = {getArticals}