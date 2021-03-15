const db = require('../models')
const Comment = db.Comment

let commentService = {
  postComment: (req, res) => {
    return Comment.create({
      text: req.body.text,
      ProductId: req.body.productId,
      UserId: req.user.id
    })
      .then((comment) => {
        console.log('comment', comment)
        return res.redirect(`/products/${req.body.productId}`)
      })
  },
  deleteComment: (req, res) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then((comment) => {
            return res.redirect(`/products/${comment.ProductId}`)
          })
      })
  }
}

module.exports = commentService