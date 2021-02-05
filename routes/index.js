const productController = require('../controllers/productController.js')
const adminController = require('../controllers/adminController.js')
const categoryController = require('../controllers/categoryController.js')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = app => {


  //custom
  app.get('/', (req, res) => res.redirect('/products'))
  app.get('/products', productController.getProducts)




  // admin
  app.get('/admin', (req, res) => res.redirect('/admin/products'))
  app.get('/admin/products', adminController.getProducts)
  app.get('/admin/products/create', adminController.createProduct)
  app.post('/admin/products', upload.single('image'), adminController.postProduct)
  app.get('/admin/products/:id', adminController.getProduct)
  app.get('/admin/products/:id/edit', adminController.editProduct)
  app.put('/admin/products/:id', upload.single('image'), adminController.putProduct)
  app.delete('/admin/products/:id', adminController.deleteProduct)



  app.get('/admin/categories', categoryController.getCategories)
  app.post('/admin/categories', categoryController.postCategory)
  app.get('/admin/categories/:id', categoryController.getCategories)
  app.put('/admin/categories/:id', categoryController.putCategory)
  app.delete('/admin/categories/:id', categoryController.deleteCategory)


  app.get('/admin/users', adminController.getUserslist)
  app.put('/admin/users/:id', adminController.putUsersadmin)


} 