const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauces')
const auth = require('../middleware/auth'); // J'importe le middleware auth
const multer = require('../middleware/multer-config'); // J'importe le middleware multer

// Les routes
router.get('/', auth, sauceCtrl.displayAllSauce);
router.post('/', auth, multer, sauceCtrl.createSauce); // J'applique le middleware auth aux routes afin de les protéger
router.get('/:id', auth, sauceCtrl.displayOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce)
// Like
router.post('/:id/like', auth, sauceCtrl.sauceLike)

module.exports = router;