const db = require('../models')
const Product = db.Product
const Category = db.Category
const User = db.User
const CartItem = db.CartItem

const cartController = {
  getCart: async (req, res) => {

    return await CartItem.findAll({ include: Product, where: { UserId: req.user.id } })
      .then(cartitem => {

        let totalPrice = cartitem.length > 0 ? cartitem.map(d => d.dataValues.Product.dataValues.price * d.dataValues.quantity).reduce((a, b) => a + b) : 0

        // console.log('this is cartitem', cartitem)
        // console.log('this is cartitem[1].Product', cartitem[1].Product)
        // console.log('this is  cartitem[0].dataValues.Product', cartitem[0].dataValues.Product)
        // console.log('this is  cartitem[0].dataValues.Product.dataValues.id', cartitem[0].dataValues.Product.dataValues.id)
        const data = cartitem.map(p => ({
          ...p.dataValues,
          name: p.dataValues.Product.dataValues.name,
          price: p.dataValues.Product.dataValues.price,
          image: p.dataValues.Product.dataValues.image,
          CartItemId: p.dataValues.id,
          quantity: p.dataValues.quantity
        }))
        // console.log('this is data', data)
        return res.render('cart', {
          cart: data,
          totalPrice
        })
        // return res.render('cart')
      })
  },
  postCart: async (req, res) => {
    //     const [cart, created] = await Cart.findOrCreate({
    //   where: {
    //     id: req.session.cartId || 0,
    //     UserId: req.user.id,
    //   },
    // })
    const [cartItem, itemCreated] = await CartItem.findOrCreate({
      where: {
        // CartId: cart.id,
        ProductId: req.body.productId,
        UserId: req.user.id
      },
      default: {
        // CartId: cart.id,
        ProductId: req.body.productId,
        UserId: req.user.id
      }
    })
    return cartItem.update({
      quantity: (cartItem.quantity || 0) + 1,
      UserId: req.user.id
    }).then((cartItem) => {
      // req.session.cartId = cart.id
      // return req.session.save(() => {
      //   return res.redirect('back')
      // })

      return res.redirect('back')
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