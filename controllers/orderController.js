const db = require('../models')
const crypto = require("crypto")
const nodemailer = require('nodemailer')
const Order = db.Order
const OrderItem = db.OrderItem
const CartItem = db.CartItem
const Product = db.Product

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'huntekbill',
    pass: process.env.MAILPASSWORD,
  },
})


const URL = 'https://2702fbb721a3.ngrok.io'
const MerchantID = 'MS318742689'
const HashKey = 'BuRQTj5dtVo6ZEr0MC93qYRnwo5n6vDn'
const HashIV = 'CqriRJryrnbexPoP'
const PayGateWay = "https://ccore.newebpay.com/MPG/mpg_gateway"
const ReturnURL = URL + "/newebpay/callback?from=ReturnURL"
const NotifyURL = URL + "/newebpay/callback?from=NotifyURL"
const ClientBackURL = URL + "/orders"

function genDataChain(TradeInfo) {
  let results = [];
  for (let kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`);
  }
  return results.join("&");
}

function create_mpg_aes_encrypt(TradeInfo) {
  let encrypt = crypto.createCipheriv("aes256", HashKey, HashIV);
  let enc = encrypt.update(genDataChain(TradeInfo), "utf8", "hex");
  return enc + encrypt.final("hex");
}

function create_mpg_aes_decrypt(TradeInfo) {
  let decrypt = crypto.createDecipheriv("aes256", HashKey, HashIV);
  decrypt.setAutoPadding(false);
  let text = decrypt.update(TradeInfo, "hex", "utf8");
  let plainText = text + decrypt.final("utf8");
  let result = plainText.replace(/[\x00-\x20]+/g, "");
  return result;
}

function create_mpg_sha_encrypt(TradeInfo) {

  let sha = crypto.createHash("sha256");
  let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`

  return sha.update(plainText).digest("hex").toUpperCase();
}

function getTradeInfo(Amt, Desc, email) {

  console.log('===== getTradeInfo =====')
  console.log(Amt, Desc, email)
  console.log('==========')

  data = {
    'MerchantID': MerchantID, // 商店代號
    'RespondType': 'JSON', // 回傳格式
    'TimeStamp': Date.now(), // 時間戳記
    'Version': 1.5, // 串接程式版本
    'MerchantOrderNo': Date.now(), // 商店訂單編號
    'LoginType': 0, // 智付通會員
    'OrderComment': 'OrderComment', // 商店備註
    'Amt': Amt, // 訂單金額
    'ItemDesc': Desc, // 產品名稱
    'Email': email, // 付款人電子信箱
    'ReturnURL': ReturnURL, // 支付完成返回商店網址
    'NotifyURL': NotifyURL, // 支付通知網址/每期授權結果通知
    'ClientBackURL': ClientBackURL, // 支付取消返回商店網址
  }

  console.log('===== getTradeInfo: data =====')
  console.log(data)


  mpg_aes_encrypt = create_mpg_aes_encrypt(data)
  mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

  console.log('===== getTradeInfo: mpg_aes_encrypt, mpg_sha_encrypt =====')
  console.log(mpg_aes_encrypt)
  console.log(mpg_sha_encrypt)

  tradeInfo = {
    'MerchantID': MerchantID, // 商店代號
    'TradeInfo': mpg_aes_encrypt, // 加密後參數
    'TradeSha': mpg_sha_encrypt,
    'Version': 1.5, // 串接程式版本
    'PayGateWay': PayGateWay,
    'MerchantOrderNo': data.MerchantOrderNo,
  }

  console.log('===== getTradeInfo: tradeInfo =====')
  console.log(tradeInfo)

  return tradeInfo
}





let orderController = {
  getOrders: (req, res) => {
    Order.findAll({ order: [['createdAt', 'DESC']], where: { UserId: req.user.id } })
      .then(orders => {


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

      })
  },
  getOrder: (req, res) => {
    OrderItem.findAll({ include: Product, where: { OrderId: req.params.id } })
      .then(orderItem => {

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

      })
  },
  postOrder: async (req, res) => {
    return await CartItem.findAll({ include: Product, where: { UserId: req.user.id } })
      .then(cartitem => {
        let date = new Date().toISOString().replace(/T/, '').replace(/:/, '').replace(/-/, '').replace(/-/, '').substr(0, 12)

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

          let results = [];
          for (var i = 0; i < cartitem.length; i++) {

            results.push(
              OrderItem.create({
                OrderId: order.id,
                ProductId: cartitem[i].dataValues.Product.dataValues.id,
                price: cartitem[i].dataValues.Product.dataValues.price,
                quantity: cartitem[i].dataValues.quantity,
              })
            )
          }

          let mailOptions = {
            from: 'huntekbill@gmail.com',
            to: req.user.email,
            subject: `${order.sn} 訂單成立`,
            text: `${order.sn} 訂單成立`,
          }

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          })

          return Promise.all(results).then(() =>
            res.redirect('/orders')
          )

        })

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

  getPayment: (req, res) => {
    console.log('===== getPayment =====')
    console.log(req.params.id)
    console.log('==========')

    return Order.findByPk(req.params.id, {}).then(order => {
      const tradeInfo = getTradeInfo(order.amount, '產品名稱', 'huntekbill@gmail.com')
      order.update({
        ...req.body,
        paysn: tradeInfo.MerchantOrderNo,
      }).then(order => {
        res.render('payment', { order, tradeInfo })
      })

    })
  },
  newebpayCallback: (req, res) => {
    console.log('===== newebpayCallback =====')
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    console.log('==========')
    console.log('===== newebpayCallback: TradeInfo =====')
    console.log(req.body.TradeInfo)


    const data = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo))

    console.log('===== newebpayCallback: create_mpg_aes_decrypt、data =====')
    console.log(data)

    return Order.findAll({ where: { paysn: data['Result']['MerchantOrderNo'] } }).then(orders => {
      orders[0].update({
        ...req.body,
        payment_status: 1,
      }).then(order => {
        return res.redirect('/orders')
      })
    })
  }
}

module.exports = orderController 