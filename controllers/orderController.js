const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const CartItem = db.CartItem
const Product = db.Product

let orderController = {
  getOrders: (req, res) => {
    Order.findAll({ where: { UserId: req.user.id } })
      .then(orders => {

        // console.log('orders', orders)
        const data = orders.map(p => ({
          ...p.dataValues,
          id: p.dataValues.id,
          name: p.dataValues.name,
          phone: p.dataValues.phone,
          address: p.dataValues.address,
          shipping_status: p.dataValues.shipping_status,
          payment_status: p.dataValues.payment_status,
          sn: p.dataValues.sn
        }))

        return res.render('orders', {
          orders: data
        })
        // return res.render('orders')
      })
  },
  getOrder: (req, res) => {
    OrderItem.findAll({ include: Product, where: { OrderId: req.params.id } })
      .then(orderItem => {

        // console.log('orderItem', orderItem)
        // console.log('orderItem Product', orderItem[0].dataValues.Product)
        // console.log('orderItem Product name', orderItem[0].dataValues.Product.dataValues.name)
        const data = orderItem.map(p => ({
          ...p.dataValues,
          id: p.dataValues.id,
          name: p.dataValues.Product.dataValues.name,
          image: p.dataValues.Product.dataValues.image,
          price: p.dataValues.price,
          quantity: p.dataValues.quantity,
        }))

        return res.render('order', {
          order: data
        })
        // return res.render('order')
      })
  },
  postOrder: async (req, res) => {
    return await CartItem.findAll({ include: Product, where: { UserId: req.user.id } })
      .then(cartitem => {
        let date = new Date().toISOString().replace(/T/, '').replace(/:/, '').replace(/-/, '').replace(/-/, '').substr(0, 12)
        // console.log('this is date ->', date)
        return Order.create({
          name: req.body.name,
          address: req.body.address,
          phone: req.body.phone,
          sn: date,
          shipping_status: req.body.shipping_status,
          payment_status: req.body.payment_status,
          amount: req.body.amount,
          UserId: req.user.id,
        }).then(order => {

          var results = [];
          for (var i = 0; i < cartitem.length; i++) {
            // console.log(order.id, cartitem[i].id)
            results.push(
              OrderItem.create({
                OrderId: order.id,
                ProductId: cartitem[i].dataValues.Product.dataValues.id,
                price: cartitem[i].dataValues.Product.dataValues.price,
                quantity: cartitem[i].dataValues.quantity,
              })
            );
          }

          return Promise.all(results).then(() =>
            res.redirect('/orders')
          );

        })
        // return res.redirect('/orders')
      })
  },
  cancelOrder: (req, res) => {
    return Order.findByPk(req.params.id, {}).then(order => {
      order.update({
        ...req.body,
        shipping_status: '-1',
        payment_status: '-1',
      }).then(order => {
        return res.redirect('back')
      })
    })
  },
}

module.exports = orderController 