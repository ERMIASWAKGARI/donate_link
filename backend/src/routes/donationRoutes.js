const express=require('express')
const router=express.Router()
const {protect}=require('../middleware/authMiddleware')
const  {postANeed}  = require('../controllers/donationManagement/postANeed')
const {getAllNeeds}=require('../controllers/donationManagement/getAllNeeds')
const {getNeedById}=require('../controllers/donationManagement/getNeedById')
const {getNeedsByNGO}=require('../controllers/donationManagement/getNeedsByNGO')
const {
  initiatePayment,verifyPayment
} = require("../controllers/donationManagement/paymentController");
router.post('/postANeed',protect,postANeed)
router.post("/initiatePayment",protect,initiatePayment);
router.get('/verifyPayment',verifyPayment)
router.get('/getAllNeeds',getAllNeeds)
router.get('/getNeedsByNGO',getNeedsByNGO)
router.get('/getNeedsById',getNeedById)

module.exports=router