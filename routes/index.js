const productController = require('../controllers/productController.js')
const adminController = require('../controllers/adminController.js')


module.exports = app => {



  app.get('/', (req, res) => res.redirect('/products'))
  app.get('/products', productController.getProducts)

  app.get('/admin', (req, res) => res.redirect('/admin/products'))
  app.get('/admin/products', adminController.getProducts)
} 