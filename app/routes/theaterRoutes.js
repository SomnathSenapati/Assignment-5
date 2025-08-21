const TheaterController=require('../controller/TheaterController')
const express = require("express")
const router = express.Router()

router.post('/addTheater',TheaterController.addTheater)
router.get('/getMovie/:movieId',TheaterController.getTheatersByMovie)
module.exports=router