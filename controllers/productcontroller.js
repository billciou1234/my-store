const db = require('../models')
const Product = db.Product
const Category = db.Category
const User = db.User
const Comment = db.Comment
const pageLimit = 9

const productController = {
  getProducts: (req, res) => {
    let whereQuery = {}
    let categoryId = ''
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['categoryId'] = categoryId
    }
    Product.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1

      console.log('this==============', req.user)

      let data = {}
      if (req.user) {
        data = result.rows.map(r => ({
          ...r.dataValues,
          description: r.dataValues.description.substring(0, 50),
          categoryName: r.Category.name,
          isFavorited: req.user.FavoritedProducts.map(d => d.id).includes(r.id),
        }))
      } else {
        data = result.rows.map(r => ({
          ...r.dataValues,
          description: r.dataValues.description.substring(0, 50),
          categoryName: r.Category.name,
          // isFavorited: req.user.FavoritedProducts.map(d => d.id).includes(r.id),
        }))
      }






      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('products', {
          products: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next,

        })
      })
    })
  },
  getProduct: (req, res) => {
    if (req.user) {
      return Product.findByPk(req.params.id, {
        include: [
          Category,
          { model: User, as: 'FavoritedUsers' },
          // { model: Comment, include: [User] }
        ]
      }).then(product => {
        const isFavorited = product.FavoritedUsers.map(d => d.id).includes(req.user.id)
        return res.render('product', {
          product: product.toJSON(),
          isFavorited: isFavorited,
        })
      })
    } else {
      return Product.findByPk(req.params.id, {
        include: Category
      }).then(product => {
        return res.render('product', {
          product: product.toJSON(),
        })
      })
    }

  },

}
module.exports = productController 