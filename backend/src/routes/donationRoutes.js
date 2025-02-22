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


module.exports=router