const express = require("express")
const router = express.Router()
const url = require("../controller/urlController")

router.get("/test-me", function(req,res){
    res.send("api running")
})

router.post("/url/shorten", url.createShortUrl)

router.get("/:urlCode", url.getUrl)

router.all("/**", function(req,res){
    res.status(400).send("Invlaid endPoint")
})

module.exports=router