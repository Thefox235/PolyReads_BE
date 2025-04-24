var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require ('mongoose');
const cors = require ('cors');
require('dotenv').config(); 

require('./mongo/category.model');
require('./mongo/product.model');
require('./mongo/user.model');
require('./mongo/author.model');
require('./mongo/order.model');
require('./mongo/payment.model');
require('./mongo/address.model');
require('./mongo/post.model');
require('./mongo/images.model');
require('./mongo/discount.model');
require('./mongo/banner.model');
require('./mongo/order_detail.model');
require('./mongo/comment.model');
require('./mongo/publisher.model');
require('./mongo/favorite.model');
require('./mongo/coupon.model');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// const {log}= require('')
var productRouter = require('./routes/product');
var categoryRouter = require('./routes/category');
var authorRouter = require('./routes/author');
var orderRouter = require('./routes/order');
var paymentRouter = require('./routes/payment');
var addressRouter = require('./routes/address');
var postRouter = require('./routes/post');
var imagesRouter = require('./routes/images');
var discountRouter = require('./routes/discount');
var bannerRouter = require('./routes/banner');
var order_detailRouter = require('./routes/order_detail');
var commentRouter = require('./routes/comment');
var publisherRouter = require('./routes/publisher');
var discountApplyRoutes = require('./routes/discountApplyRoutes');
var favoriteRouter = require('./routes/favorite');
var shippingRouter = require('./routes/shipping');
var couponRouter = require('./routes/coupon');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(cors())
app.use(cors({
  origin: ['https://poly-reads.vercel.app', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// ket noi database mongodb
mongoose.connect('mongodb+srv://thanhduyhf2:kirixasu16.5@cluster0.k13gf.mongodb.net/PolyReads?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>console.log('kết nối thành công '))
.catch((err)=>console.log('Thất bại',err))
// định nghĩ routing

app.use ('/',indexRouter);
app.use ('/users',usersRouter);
app.use ('/product',productRouter);
app.use ('/category',categoryRouter);
app.use ('/author',authorRouter);
app.use ('/order',orderRouter);
app.use ('/payment',paymentRouter);
app.use ('/address',addressRouter);
app.use ('/post',postRouter);
app.use ('/images',imagesRouter);
app.use ('/discount',discountRouter);
app.use ('/banner',bannerRouter);
app.use ('/order-detail',order_detailRouter);
app.use ('/comment',commentRouter);
app.use ('/publisher',publisherRouter);
app.use ('/favorite',favoriteRouter);
app.use ('/shipping',shippingRouter);
app.use('/coupon',couponRouter);

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/product',productRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
