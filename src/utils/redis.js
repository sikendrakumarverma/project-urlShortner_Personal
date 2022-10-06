const redis = require("redis");
const { promisify } = require("util");

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

module.exports={
    SET_ASYNC,
    SETEX_ASYNC,
    GET_ASYNC
}