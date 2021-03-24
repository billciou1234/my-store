
const adminController = require('../controllers/adminController.js')
const productController = require('../controllers/productController.js')
const categoryController = require('../controllers/categoryController.js')
const cartController = require('../controllers/cartController.js')
const userController = require('../controllers/userController.js')
const orderController = require('../controllers/orderController.js')
const commentController = require('../controllers/commentController.js')

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
    if (req.user.role === 'admin') { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}


module.exports = app => {

  app.get('/signup', userController.signUpPage)
  app.post('/signup', upload.single('image'), userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)

  //custom
  app.get('/', (req, res) => res.redirect('/products'))
  app.get('/products', productController.getProducts)
  app.get('/products/feeds', productController.getFeeds)
  app.get('/products/top', productController.getTopProducts)
  app.get('/products/:id', productController.getProduct)
  app.get('/products/:id/dashboard', productController.getDashboard)
  // authenticated,

  // admin
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/products'))
  app.get('/admin/products', authenticatedAdmin, adminController.getProducts)
  app.get('/admin/products/create', authenticatedAdmin, adminController.createProduct)
  app.post('/admin/products', authenticatedAdmin, upload.single('image'), adminController.postProduct)
  app.get('/admin/products/:id', authenticatedAdmin, adminController.getProduct)
  app.get('/admin/products/:id/edit', authenticatedAdmin, adminController.editProduct)
  app.put('/admin/products/:id', authenticatedAdmin, upload.single('image'), adminController.putProduct)
  app.delete('/admin/products/:id', authenticatedAdmin, adminController.deleteProduct)



  app.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
  app.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
  app.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
  app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
  app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)


  app.get('/admin/users', authenticatedAdmin, adminController.getUserslist)
  app.put('/admin/users/:id', authenticatedAdmin, adminController.putUsersadmin)


  app.get('/cart', authenticated, cartController.getCart)
  app.post('/cart', authenticated, cartController.postCart)
  app.post('/cartItem/:id/add', authenticated, cartController.addCartItem)
  app.post('/cartItem/:id/sub', authenticated, cartController.subCartItem)
  app.delete('/cartItem/:id', authenticated, cartController.deleteCartItem)


  app.get('/orders', authenticated, orderController.getOrders)
  app.post('/order', authenticated, orderController.postOrder)
  app.post('/order/:id/cancel', authenticated, orderController.cancelOrder)
  app.get('/orders/:id', authenticated, orderController.getOrder)
  app.get('/order/:id/payment', orderController.getPayment)
  app.post('/newebpay/callback', orderController.newebpayCallback)

  app.post('/comments', authenticated, commentController.postComment)
  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

  app.post('/favorite/:productId', authenticated, userController.addFavorite)
  app.delete('/favorite/:productId', authenticated, userController.removeFavorite)


  app.get('/users/:id', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

} 