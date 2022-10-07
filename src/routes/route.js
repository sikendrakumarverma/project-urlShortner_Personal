const express = require("express")
const router = express.Router()
const url = require("../controller/urlController")
const mid = require("../middleware/cacheMid")

router.get("/test-me", function(req,res){
    res.send("api running")
})

router.post("/url/shorten",mid.getShortUrl, url.createShortUrl)

router.get("/:urlCode",mid.getLongUrl, url.getUrl)

// router.put("/new", url.update)

// router.all("/**", function(req,res){
//     res.status(400).send("Invlaid endPoint")
// })

module.exports=router