const redis = require("../utils/redis")
const validator = require("../utils/validation");
const validUrl = require("valid-url");




const getShortUrl = async function (req, res,next) {
    try {
      if (!validator.isValidRequestBody(req.body)) {
        return res
          .status(400)
          .send({ status: false, message: "pls provide url" });
      }
      
      const longUrl = req.body.longUrl;
  
      if (!validator.isValid(longUrl)) {
        return res
          .status(400)
          .send({ status: false, message: "longurl is mandatory" });
      }
  
      // validating longurl
      if (!validator.validateUrl(longUrl)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid longUrl" });
      }
      if (!validUrl.isUri(longUrl)) {
        return res
          .status(400)
          .send({ status: false, message: "please enter a valid url" });
      }
  
    

      // Checking urlData in cached memory
      const urlData = await redis.GET_ASYNC(longUrl)
      
      if(urlData){
          return res.status(200).send({status:true, message:"already present in cach memory", data:JSON.parse(urlData) })
      }

      next()
       
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  
  
  const getLongUrl = async function (req, res, next) {
    try {
      const urlCode = req.params.urlCode.toLowerCase().trim();
      const cachedUrl = await redis.GET_ASYNC(urlCode);
      // console.log(await GET_ASYNC());
      if (cachedUrl) {
          // console.log(cachedUrl)
        return res.status(302).redirect(cachedUrl)
      }
      
        next()
        
    } 
    catch(err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  
  module.exports = { getShortUrl, getLongUrl};
  