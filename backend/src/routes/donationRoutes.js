const express=require('express')
const router=express.Router()
const routeProtect=require('../middleware/authMiddleware')
const paymentController=require('../controllers/donationManagement/paymentController')
const donateItems=require('../controllers/donationManagement/donateItems')
const authMiddleware=require('../middleware/authenticationMiddleware')
const needsController=require("../controllers/donationManagement/needController")

// Donor initiates payment
router.post(
  "/initiate",
  authMiddleware(["individual_donor", "organization_donor"]),
  paymentController.initiateDonation
);
router.post("/verify", paymentController.verifyPayment);
router.post('/postNgosNeed',authMiddleware("ngo"),needsController.postNgosNeed)

// Check payment status
router.get("/getAllNeeds", needsController.getAllNeeds);
router.get("/ngo/:ngoId", needsController.getNeedsByNgo);
router.get("/:id", needsController.getNeedById);
router.get("/:paymentId", authMiddleware(), paymentController.getPaymentStatus);
module.exports=router