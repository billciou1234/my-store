

const productController = {

  getProducts: (req, res) => {
    return res.render('products')
  },
  getProduct: (req, res) => {
    return res.render('product')
  },

}
module.exports = productController 