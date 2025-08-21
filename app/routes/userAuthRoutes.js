
const express=require('express')
const UserAuthController = require('../controller/UsersAuthController')
const { AuthCheck } = require('../middleware/auth')
const userImageUpload=require('../helper/userImageUpload')
const router=express.Router()



router.post('/register',userImageUpload.single('profilePic'),UserAuthController.register)
router.post('/verify/email',UserAuthController.verifyEmail)
router.post('/resend/otp',UserAuthController.resendOtp)
router.post('/login',UserAuthController.login)
router.get('/profile/:userId',AuthCheck ,UserAuthController.getProfile)
router.put('/profile/:userId/update/', AuthCheck , userImageUpload.single('profilePic') ,UserAuthController.profileUpdate)


module.exports=router