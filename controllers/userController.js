const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    if (!req.body.email) {
      req.flash('error_messages', "email didn't exist")
      return res.redirect('back')
    }
    if (!req.body.password) {
      req.flash('error_messages', "password didn't exist")
      return res.redirect('back')
    }
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同!')
      return res.redirect('back')
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash('error_messages', '信箱重複！')
            return res.redirect('back')
          } else {
            const { file } = req
            if (file) {
              imgur.setClientID(IMGUR_CLIENT_ID);
              imgur.upload(file.path, (err, img) => {
                return User.create({
                  name: req.body.name,
                  email: req.body.email,
                  password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
                  role: 'custom',
                  image: file ? img.data.link : null
                }).then(user => {
                  return res.redirect('/signin')
                })
              })
            } else {
              return User.create({
                name: req.body.name,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
                role: 'custom',
                image: null
              }).then((product) => {
                return res.redirect('/signin')
              })
            }
          }
        })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/products')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/products')
  },
}
module.exports = userController