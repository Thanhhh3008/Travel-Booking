const express = require('express');
const passport = require('passport');
const router = express.Router();
const HomeController = require('../controllers/client/HomeController');
const AuthController = require('../controllers/client/AuthController')


router.get('/', HomeController.index);
router.get('/login.html', HomeController.login_view)
router.get('/register.html', HomeController.register_view)
router.get('/xac-thuc.html', AuthController.setActiveAccount);


router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.get('/logout.html', AuthController.logout)

module.exports = router;