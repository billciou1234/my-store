
import { getProducts, createProduct, postProduct, getProduct, editProduct, putProduct, deleteProduct, getUserslist, putUsersadmin } from '../controllers/adminController.js'
import { getProducts as _getProducts, getFeeds, getTopProducts, getProduct as _getProduct, getDashboard } from '../controllers/productController.js'
import { getCategories, postCategory, putCategory, deleteCategory } from '../controllers/categoryController.js'
import { getCart, postCart, addCartItem, subCartItem, deleteCartItem } from '../controllers/cartController.js'
import { signUpPage, signUp, signInPage, signIn, logout, addFavorite, removeFavorite, getUser, editUser, putUser } from '../controllers/userController.js'
import { getOrders, postOrder, cancelOrder, getOrder, getPayment, newebpayCallback } from '../controllers/orderController.js'
import { postComment, deleteComment } from '../controllers/commentController.js'

import multer from 'multer'
const upload = multer({ dest: 'temp/' })
import { authenticate } from '../config/passport'

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


export default app => {

  app.get('/signup', signUpPage)
  app.post('/signup', upload.single('image'), signUp)
  app.get('/signin', signInPage)
  app.post('/signin', authenticate('local', { failureRedirect: '/signin', failureFlash: true }), signIn)
  app.get('/logout', logout)

  //custom
  app.get('/', (req, res) => res.redirect('/products'))
  app.get('/products', _getProducts)
  app.get('/products/feeds', getFeeds)
  app.get('/products/top', getTopProducts)
  app.get('/products/:id', _getProduct)
  app.get('/products/:id/dashboard', getDashboard)
  // authenticated,

  // admin
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/products'))
  app.get('/admin/products', authenticatedAdmin, getProducts)
  app.get('/admin/products/create', authenticatedAdmin, createProduct)
  app.post('/admin/products', authenticatedAdmin, upload.single('image'), postProduct)
  app.get('/admin/products/:id', authenticatedAdmin, getProduct)
  app.get('/admin/products/:id/edit', authenticatedAdmin, editProduct)
  app.put('/admin/products/:id', authenticatedAdmin, upload.single('image'), putProduct)
  app.delete('/admin/products/:id', authenticatedAdmin, deleteProduct)



  app.get('/admin/categories', authenticatedAdmin, getCategories)
  app.post('/admin/categories', authenticatedAdmin, postCategory)
  app.get('/admin/categories/:id', authenticatedAdmin, getCategories)
  app.put('/admin/categories/:id', authenticatedAdmin, putCategory)
  app.delete('/admin/categories/:id', authenticatedAdmin, deleteCategory)


  app.get('/admin/users', authenticatedAdmin, getUserslist)
  app.put('/admin/users/:id', authenticatedAdmin, putUsersadmin)


  app.get('/cart', authenticated, getCart)
  app.post('/cart', authenticated, postCart)
  app.post('/cartItem/:id/add', authenticated, addCartItem)
  app.post('/cartItem/:id/sub', authenticated, subCartItem)
  app.delete('/cartItem/:id', authenticated, deleteCartItem)


  app.get('/orders', authenticated, getOrders)
  app.post('/order', authenticated, postOrder)
  app.post('/order/:id/cancel', authenticated, cancelOrder)
  app.get('/orders/:id', authenticated, getOrder)
  app.get('/order/:id/payment', getPayment)
  app.post('/newebpay/callback', newebpayCallback)

  app.post('/comments', authenticated, postComment)
  app.delete('/comments/:id', authenticatedAdmin, deleteComment)

  app.post('/favorite/:productId', authenticated, addFavorite)
  app.delete('/favorite/:productId', authenticated, removeFavorite)


  app.get('/users/:id', authenticated, getUser)
  app.get('/users/:id/edit', authenticated, editUser)
  app.put('/users/:id', authenticated, upload.single('image'), putUser)

} 