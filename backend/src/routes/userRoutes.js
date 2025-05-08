const express = require('express');
const axios = require('axios');

const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  deleteUserAccount,
  uploadVerificationDocs,
  uploadProfilePicture,
  softDeleteUserAccount,
  reactivateAccount,
  recoverAccount,
  getUserById,
  getUserPaymentHistory,
  getUserMaterialHistory,
  getUserServiceHistory,
} = require('../controllers/userController');
const uploadVerificationDocsMiddleware = require('../middleware/fileUpload');
const uploadProfilePictureMiddleware = require('../middleware/uploadProfilePicture');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.patch(
  '/me/upload-profile-picture',
  protect,
  uploadProfilePictureMiddleware,
  uploadProfilePicture
);
router.get('/me', protect, getUserProfile);
router.patch('/me/update', protect, updateUserProfile);
router.patch('/me/deactivate', protect, deactivateAccount);
router.patch('/me/reactivate', reactivateAccount);
router.delete('/me/soft-delete', protect, softDeleteUserAccount);
router.patch('/me/recover-account', recoverAccount);
router.delete('/me/delete', protect, deleteUserAccount);
router.patch(
  '/me/upload-verification-docs',
  protect,
  uploadVerificationDocsMiddleware,
  uploadVerificationDocs
);
router.get('/:id', protect, getUserById);

router.get('/payment/:userId', getUserPaymentHistory);
router.get('/material/:userId', getUserMaterialHistory);
router.get('/service/:userId', getUserServiceHistory);
router.get('/receipt/:receiptUrl', async (req, res) => {
  try {
    const encodedUrl = req.params.receiptUrl;
    const receiptUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
    console.lo('receipt url: ', receiptUrl);

    const response = await axios.get(receiptUrl, {
      headers: {
        Authorization: 'Bearer CHASECK_TEST-cLqzZzLeB34CvWJyfaYBqr8EvYlw2ztA',
      },
      responseType: 'stream',
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

module.exports = router;
