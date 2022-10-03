const urlModel = require("../models/urlModel");
const shortId = require("shortid");
const redis = require("redis");
const { promisify } = require("util");
const validUrl = require("valid-url");
const validator = require("../utiles/validation");

const redisClient = redis.createClient(
  11134,
  "redis-11134.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("n27DqEhQe0CqXoEFhL6ILKyyIFJq0Z64", function (err) {
  if (err) throw (err);
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.set).bind(redisClient);
const SETEX_ASYNC = promisify(redisClient.setex).bind(redisClient)
const GET_ASYNC = promisify(redisClient.get).bind(redisClient);




const createShortUrl = async function (req, res) {
  try {
    if (!validator.isValidRequestBody(req.body)) {
      return res
        .status(400)
        .send({ status: false, message: "pls provide url" });
    }
    let data = {};
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
    data.longUrl = longUrl;


    const urlData = await GET_ASYNC(longUrl)
    // console.log(urlData)
    if(urlData){
        return res.status(200).send({status:true, message:"present in cach memory", data:JSON.parse(urlData) })
    }
    else{
        const existedUrl = await urlModel.findOne({ longUrl }).lean().select({ _id: 0, __v: 0 });
        if (existedUrl) {
            await SETEX_ASYNC(longUrl,60*60,existedUrl)
            return res
                .status(200)
                .send({ status: true, message: "already shorted", data: existedUrl });
        }
    }
    
        // generating shortUrl
        const urlCode = shortId.generate(longUrl).toLowerCase();

        const shortUrl = `http://localhost:3000/${urlCode}`;
        // console.log(shortUrl)
        data.shortUrl = shortUrl;
        data.urlCode = urlCode;

        await SETEX_ASYNC(longUrl,60*60, JSON.stringify(data) );
        await SETEX_ASYNC(urlCode,60*60, longUrl)

        // creating short url
        const newShortUrl = await urlModel.create(data);

        return res
        .status(201)
        .send({
            status: true,
            message: "shorten url successfully created",
            data: data,
        });

    
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


const getUrl = async function (req, res) {
  try {
    const urlCode = req.params.urlCode.toLowerCase().trim();
    const cachedUrl = await GET_ASYNC(urlCode);
    console.log(await GET_ASYNC());
    if (cachedUrl) {
        console.log(cachedUrl)
      return res.redirect(cachedUrl)
    }
    else {
      const shortUrl = await urlModel.findOne({ urlCode });
      if (!shortUrl) {
        return res
          .status(404)
          .send({ status: false, message: "no shortUrl found" });
      }
      await SETEX_ASYNC(urlCode,60*60,shortUrl.longUrl)

      return res.status(302).send(`Found. Redirecting to ${shortUrl.longUrl}`);
    }
  } 
  catch(err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createShortUrl, getUrl };
