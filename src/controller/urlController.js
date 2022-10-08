const urlModel = require("../models/urlModel");
const shortId = require("shortid");
const redis = require("../utils/redis");
const axios = require("axios");


const createShortUrl = async function (req, res) {
  try {
    let data = {};
   
    longUrl = req.body.longUrl;
    
    // checking shortUrl in dataBase
    const existedUrl = await urlModel.findOne({ longUrl }).lean().select({ _id: 0, __v: 0 });

    if (existedUrl) {
      await redis.SETEX_ASYNC(longUrl, 60*60, JSON.stringify(existedUrl));
      return res.status(200).send({ status: true, message: "already shorted", data: existedUrl });
    }

    const options = {
      method: "get",
      url: longUrl
    };

    const isValidUrl = false
     await axios(options).catch(function (error) {
      if (error) {
        isValidUrl = true
      }
    });
    
    if (isValidUrl) { 
      return res.status(400).send({ status: false, message: "no such url found" });
      }
   // generating shortUrl
    const urlCode = shortId.generate(longUrl).toLowerCase();

    const shortUrl = `http://localhost:3000/${urlCode}`;
    data.longUrl = longUrl
    data.shortUrl = shortUrl;
    data.urlCode = urlCode;

    await redis.SETEX_ASYNC(longUrl, 60*60, JSON.stringify(data));
    await redis.SETEX_ASYNC(urlCode, 60*60, longUrl);

    // creating short url
    await urlModel.create(data);

    return res.status(201).send({status: true,message: "shorten url successfully created",data: data,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getUrl = async function (req, res) {
  try {
    const urlCode = req.params.urlCode;

    const shortUrl = await urlModel.findOne({ urlCode });
    if (!shortUrl) {
      return res.status(404).send({ status: false, message: "no longUrl found" });
    }

    await redis.SETEX_ASYNC(urlCode, 60*60, shortUrl.longUrl);

    return res.status(302).redirect(shortUrl.longUrl);
  
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createShortUrl, getUrl };
