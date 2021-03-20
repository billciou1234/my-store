//require
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport')



// view engine setup

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', handlebars({
  extname: 'hbs',
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
// view engine setup
// app.engine('handlebars', handlebars({ defaultLayout: 'main', helpers: require('./config/handlebars-helpers') })) // Handlebars 註冊樣板引擎
// app.set('view engine', 'handlebars') // 設定使用 Handlebars 做為樣板引擎

app.use(logger('dev'))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }))
app.use(session({
  secret: 'secret',
  name: 'ms',
  cookie: { maxAge: 10 * 60 * 1000 }, //10min
  store: new RedisStore(),
  resave: false,
  saveUninitialized: true,
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use('/upload', express.static(__dirname + '/upload'))
// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
require('./routes')(app, passport)


app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})




module.exports = app