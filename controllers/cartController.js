const db = require('../models')
const Product = db.Product
const Category = db.Category
const User = db.User
const Cart = db.Cart
const CartItem = db.CartItem

const cartController = {
  getCart: async (req, res) => {

    return await Cart.findAll({ include: 'items', where: { UserId: req.user.id } })
      .then(cart => {

        let totalPrice = cart[0].items.length > 0 ? cart[0].items.map(d => d.price * d.CartItem.quantity).reduce((a, b) => a + b) : 0

        const data = cart[0].items.map(p => ({
          ...p.dataValues,
          name: p.dataValues.name,
          price: p.dataValues.price,
          image: p.dataValues.image,
          CartItemId: p.dataValues.CartItem.dataValues.id,
          quantity: p.dataValues.CartItem.dataValues.quantity
        }))

        return res.render('cart', {
          cart: data,
          totalPrice
        })

      })
  },
  postCart: async (req, res) => {
    const [cart, created] = await Cart.findOrCreate({
      where: {
        id: req.session.cartId || 0,
        UserId: req.user.id
      },
    })
    const [cartItem, itemCreated] = await CartItem.findOrCreate({
      where: {
        CartId: cart.id,
        ProductId: req.body.productId,
        // UserId: req.user.id
      },
      default: {
        CartId: cart.id,
        ProductId: req.body.productId,
        // UserId: req.user.id
      }
    })
    return cartItem.update({
      quantity: (cartItem.quantity || 0) + 1,
      UserId: req.user.id
    }).then((cartItem) => {
      req.session.cartId = cart.id
      return req.session.save(() => {
        return res.redirect('back')
      })
    })
  },
  addCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.update({
        quantity: cartItem.quantity + 1,
      })
        .then((cartItem) => {
          return res.redirect('back')
        })
    })
  },
  subCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.update({
        quantity: cartItem.quantity - 1 >= 1 ? cartItem.quantity - 1 : 1,
      })
        .then((cartItem) => {
          return res.redirect('back')
        })
    })
  },
  deleteCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.destroy()
        .then((cartItem) => {
          return res.redirect('back')
        })
    })
  }

}
module.exports = cartController 