const db = require('../models')
const Product = db.Product
const Category = db.Category
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getProducts: (req, res) => {
    return Product.findAll({
      raw: true,
      nest: true,
      include: [Category]
    }).then(products => {

      // console.log(products) // 加入 console 觀察資料的變化
      return res.render('admin/products', { products: products })
    })
  },
  getProduct: (req, res) => {
    return Product.findByPk(req.params.id, {
      include: [Category]
    }).then(product => {
      // console.log(products)// 加入 console 觀察資料的變化
      return res.render('admin/product', {
        product: product.toJSON()
      })
    })
  },
  createProduct: (req, res) => {
    //GET createPage
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return res.render('admin/createproducts', { categories: categories })
    })
  },
  postProduct: (req, res) => {
    //POST createNew
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req // equal to const file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Product.create({
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
          // image: file ? `/upload/${file.originalname}` : null
        }).then((product) => {
          req.flash('success_messages', 'product was successfully created')
          return res.redirect('/admin/products')
        })
      })
    } else {
      return Product.create({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((product) => {
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/products')
      })
    }
  },
  editProduct: (req, res) => {
    //GET
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return Product.findByPk(req.params.id).then(product => {
        return res.render('admin/createproducts', {
          categories: categories,
          product: product.toJSON()
        })
      })
    })
  },
  putProduct: (req, res, callback) => {
    //PUT
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Product.findByPk(req.params.id)
          .then((product) => {
            product.update({
              name: req.body.name,
              price: req.body.price,
              description: req.body.description,
              image: file ? img.data.link : product.image,
              CategoryId: req.body.CategoryId
            })
              .then((product) => {
                req.flash('success_messages', 'product was successfully to update')
                res.redirect('/admin/products')
              })
          })
      })
    }
    else {
      return Product.findByPk(req.params.id)
        .then((product) => {
          product.update({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: product.image,
            CategoryId: req.body.CategoryId
          })
            .then((product) => {
              req.flash('success_messages', 'product was successfully to update')
              res.redirect('/admin/products')
            })
        })
    }

  },
  deleteProduct: (req, res) => {
    return Product.findByPk(req.params.id)
      .then((product) => {
        product.destroy()
          .then((product) => {
            // res.json({ status: 'success', message: '' })
            req.flash('success_messages', 'product was successfully to delete')
            res.redirect('/admin/products')
          })
      })
  },


}


module.exports = adminController