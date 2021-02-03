const express = require('express')
const router = express.Router()



const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const passport = require('../config/passport')


const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}







module.exports = router