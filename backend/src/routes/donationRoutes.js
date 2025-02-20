const express=require('express')
const router=express.Router()
const {protect}=require('../middleware/authMiddleware')
const  {postANeed}  = require('../controllers/donationManagement/postANeed')
router.post('/postANeed',protect,postANeed)
module.exports=router