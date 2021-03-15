const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Favorite = db.Favorite
const Comment = db.Comment
const Product = db.Product
const Category = db.Category
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

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      ProductId: req.params.productId
    }).then((product) => {
      req.flash('success_messages', 'success add like')
      return res.redirect('back')
    })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        ProductId: req.params.productId
      }
    }).then((favorite) => {
      favorite.destroy()
        .then((product) => {
          req.flash('success_messages', 'success remove！')
          return res.redirect('back')
        })
    })
  },
  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Product },
        { model: Product, as: 'FavoritedProducts' },
      ]
    })
      .then(user => {
        console.log('user----------', user)
        return res.render('users/profile', {
          user: user.toJSON()
        })
      })
  },
  editUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return res.render('users/editprofile', { user: user.toJSON() })
    })
  },
  putUser: (req, res) => {
    if (Number(req.params.id) !== Number(req.user.id)) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: img.data.link
            }).then((user) => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${req.params.id}`)
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name
          }).then((user) => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect(`/users/${req.params.id}`)
          })
        })
    }
  },
}
module.exports = userController