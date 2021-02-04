const db = require('../models')
const Product = db.Product
const Category = db.Category
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getProducts: (req, res) => {
    return res.render('admin/products')
  },
  getProduct: (req, res) => {
    return res.render('admin/product')
  },

}




module.exports = adminController