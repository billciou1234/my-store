const db = require('../models')
const Product = db.Product
const Category = db.Category
const User = db.User
const Cart = db.Cart
const CartItem = db.CartItem

const cartController = {
  getCart: async (req, res) => {
    // return await Cart.findByPk(req.session.cartId, { include: 'items' })
    //   .then(cart => {

    //     cart = cart || { items: [] }
    //     let totalPrice = cart.items.length > 0 ? cart.items.map(d => d.price * d.CartItem.quantity).reduce((a, b) => a + b) : 0

    //     const data = cart.items.map(p => ({
    //       ...p.dataValues,
    //       name: p.dataValues.name,
    //       price: p.dataValues.price,
    //       image: p.dataValues.image,
    //       CartItemId: p.CartItem.dataValues.id,
    //       CartItemquantity: p.CartItem.dataValues.quantity
    //     }))

    //     return res.render('cart', {
    //       cart: data,
    //       totalPrice
    //     })
    //   })
    return res.render('cart')
  },
  postCart: async (req, res) => {
    const [cart, created] = await Cart.findOrCreate({
      where: {
        id: req.session.cartId || 0,
      },
    })
    const [cartItem, itemCreated] = await CartItem.findOrCreate({
      where: {
        CartId: cart.id,
        ProductId: req.body.productId
      },
      default: {
        CartId: cart.id,
        ProductId: req.body.productId,
      }
    })
    return cartItem.update({
      quantity: (cartItem.quantity || 0) + 1,
    })
      .then((cartItem) => {
        req.session.cartId = cart.id
        return req.session.save(() => {
          return res.redirect('back')
        })
      })
  },


}
module.exports = cartController 