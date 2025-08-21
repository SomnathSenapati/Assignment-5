const express = require("express")
const MovieController = require("../controller/MovieController")
const {AuthCheck}=require('../middleware/auth')
const router = express.Router()

router.post('/create',MovieController.addMovie)
router.get("/list",MovieController.listMovie) 
router.put('/update/:id',MovieController.updateMovie)
router.delete('/delete/:id',MovieController.deleteMovie)


module.exports = router