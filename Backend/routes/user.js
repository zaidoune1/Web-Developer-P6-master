const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user') // J'importe le controllers user afin de les associés aux routes
const passwordValidator = require('../middleware/password');

router.post('/signup', userCtrl.signup); // Je crée la route post d'inscription
router.post('/login', userCtrl.login) // Je crée la route post de connexion

module.exports = router; // J'exporte ce router
