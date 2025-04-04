let express = require('express');
let router = express.Router();
const request = require('request');
const moment = require('moment');
const paymentController = require('../mongo/controller.model');
const Payment = require('../mongo/payment.model');
const CryptoJS = require("crypto-js");
const axios = require('axios');

const zalopayConfig = {
  appid: process.env.ZALOPAY_APP_ID || "553",
  key1: process.env.ZALOPAY_KEY1 || "9phuAOYhan4urywHTh0ndEXiV3pKHr5Q",
  key2: process.env.ZALOPAY_KEY2 || "Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3",
  // Ví dụ endpoint demo của ZaloPay
  endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};
/* 
  Endpoint: POST /api/payment/create-zalopay 
  Xử lý giao dịch thanh toán ZaloPay
*/

router.post("/create-zalopay", async (req, res) => {
  try {
    const { amount, orderInfo, redirectUrl, appUser, items } = req.body;
    
    // embeddata theo ví dụ tài liệu
    const embeddata = { redirecturl: redirectUrl };
    const orderItems = items || []; // Nếu không có, dùng mảng rỗng

    // Tạo apptransid theo mẫu, ví dụ: "YYMMDD_random" hoặc theo mẫu của tài liệu
    const transID = Math.floor(Math.random() * 1000000);
    // Nếu tài liệu mẫu sử dụng dấu gạch nối, hãy dùng dấu gạch nối thay vì dấu gạch dưới
    const apptransid = `${moment().format('YYMMDD')}-${transID}`;
    const apptime = Date.now();

    // Xây dựng payload theo đúng key của tài liệu API
    const order = {
      appid: zalopayConfig.appid,
      apptransid: apptransid,
      appuser: appUser || "user123",
      apptime: apptime,
      amount: amount,
      item: JSON.stringify(orderItems),
      embeddata: JSON.stringify(embeddata),
      description: orderInfo
      // Nếu API yêu cầu fields khác, bạn bổ sung ở đây
    };

    // Tạo chuỗi rawData theo định dạng theo tài liệu:
    // rawData = appid + "|" + apptransid + "|" + appuser + "|" + amount + "|" + apptime + "|" + embeddata + "|" + item
    const rawData = order.appid + "|" +
                    order.apptransid + "|" +
                    order.appuser + "|" +
                    order.amount + "|" +
                    order.apptime + "|" +
                    order.embeddata + "|" +
                    order.item;
    const mac = CryptoJS.HmacSHA256(rawData, zalopayConfig.key1).toString();
    order.mac = mac;

    console.log("Order payload:", order);
    console.log("RawData:", rawData);

    // Gửi request đến API v2 của ZaloPay với JSON body
    const response = await axios.post(zalopayConfig.endpoint, order, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error creating ZaloPay payment:", error.response ? error.response.data : error.message);
    res.status(500).json({
      error: "Error creating ZaloPay payment",
      details: error.response ? error.response.data : error.message
    });
  }
});




/*
  Endpoint callback (có thể dùng chung cho cả VNPay và ZaloPay nếu cần)
  Ví dụ: POST /api/payment/callback
*/
router.post("/callback", (req, res) => {
  const callbackData = req.body;
  // Xác thực và cập nhật trạng thái đơn hàng...
  res.status(200).end();
});

// Định nghĩa route cho việc cập nhật thanh toán.
router.post('/create', async (req, res) => {
  try {
    // Lấy các trường cần thiết từ request body
    const { amount, currency, status, method } = req.body;

    // Tạo Payment record với các thông tin nhận được (nếu không có status, mặc định là "pending")
    const paymentRecord = await Payment.create({
      amount,
      currency: currency || 'vnd', // Ví dụ, nếu bạn làm việc với VND
      status: status || 'pending',
      method,
    });

    // Trả về Payment record vừa tạo và thông báo thành công
    res.status(200).json({
      message: "Payment record created successfully",
      payment: paymentRecord
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      message: "Error creating payment",
      error: error.message
    });
  }
});


// Ví dụ: POST /payment/confirm
router.post('/confirm', paymentController.confirmPayment);

router.get('/', function (req, res, next) {
  res.render('orderlist', { title: 'Danh sách đơn hàng' })
});

// Giả sử hàm sortObject đã được định nghĩa
function sortObject(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

router.post('/verify', (req, res, next) => {
  // Lấy các tham số được gửi từ VNPay (FE có thể chuyển các tham số từ window.location.search)
  let vnp_Params = req.body; // hoặc req.query nếu gửi qua GET
  
  // Lấy secureHash được gửi về từ VNPay
  let secureHash = vnp_Params.vnp_SecureHash;
  // Xóa đi secure hash để tính lại chữ ký
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;
  
  // Sắp xếp các tham số theo thứ tự tăng dần của key
  vnp_Params = sortObject(vnp_Params);
  
  // Tạo chuỗi ký (string to sign)
  let signData = qs.stringify(vnp_Params, { encode: false });
  
  // Tính chữ ký HMAC SHA512 với secretKey
  let secretKey = config.get('vnp_HashSecret');
  let computedHash = crypto.createHmac("sha512", secretKey)
                           .update(Buffer.from(signData, 'utf-8'))
                           .digest('hex');
  
  // So sánh chữ ký nhận được và chữ ký tự tính
  let result = {};
  if (secureHash === computedHash) {
    if (vnp_Params.vnp_ResponseCode === "00") {
      result = { 
        code: vnp_Params.vnp_ResponseCode, 
        message: "Thanh toán thành công",
        data: vnp_Params
      };
    } else {
      result = {
        code: vnp_Params.vnp_ResponseCode,
        message: "Thanh toán không thành công",
        data: vnp_Params
      };
    }
  } else {
    result = {
      code: "97",
      message: "Checksum không hợp lệ",
      data: vnp_Params
    };
  }
  res.json(result);
});

router.get('/vnpay_return', (req, res, next) => {
  // Lấy các tham số từ query string của VNPay
  let vnp_Params = req.query;

  // Lấy secure hash do VNPay gửi kèm
  let secureHash = vnp_Params.vnp_SecureHash;

  // Loại bỏ hai tham số này để dùng trong việc kiểm tra chữ ký
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  // Sắp xếp lại các tham số theo thứ tự để tạo chuỗi ký
  vnp_Params = sortObject(vnp_Params);

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });

  let crypto = require("crypto");
  let secretKey = require('config').get('vnp_HashSecret');
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // So sánh chữ ký do VNPay gửi kèm với chữ ký do hệ thống bạn tính toán
  if (secureHash === signed) {
    // Giao dịch hợp lệ
    // Ví dụ: Nếu vnp_ResponseCode === "00" là giao dịch thành công
    if (vnp_Params.vnp_ResponseCode === "00") {
      // Cập nhật trạng thái đơn hàng hay hiển thị giao diện thành công
      res.render('success', { code: vnp_Params.vnp_ResponseCode, message: "Thanh toán thành công" });
    } else {
      res.render('success', { code: vnp_Params.vnp_ResponseCode, message: "Thanh toán không thành công" });
    }
  } else {
    // Nếu chữ ký không khớp, coi như giao dịch thất bại
    res.render('success', { code: '97', message: "Checksum không hợp lệ" });
  }
});

router.get('/create_payment_url', function (req, res, next) {
  res.render('order', { title: 'Tạo mới đơn hàng', amount: 10000 })
});

router.get('/querydr', function (req, res, next) {

  let desc = 'truy van ket qua thanh toan';
  res.render('querydr', { title: 'Truy vấn kết quả thanh toán' })
});

router.get('/refund', function (req, res, next) {

  let desc = 'Hoan tien GD thanh toan';
  res.render('refund', { title: 'Hoàn tiền giao dịch thanh toán' })
});

function convertMongoIdToVnpTxnRef(mongoId) {
  // Ví dụ: lấy 8 ký tự cuối của ObjectId và chuyển đổi sang số (lưu ý, đây chỉ là ví dụ minh họa và không đảm bảo tính duy nhất tuyệt đối)
  return parseInt(mongoId.slice(-8), 16).toString();
}

router.post('/create-vnpay', function (req, res, next) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');

  let ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress;

  let config = require('config');
  let tmnCode = config.get('vnp_TmnCode');
  let secretKey = config.get('vnp_HashSecret');
  let vnpUrl = config.get('vnp_Url');
  let returnUrl = config.get('vnp_ReturnUrl');

  // Lấy các giá trị cần thiết từ FE
  let rawOrderId = req.body.orderId;
  let orderId = convertMongoIdToVnpTxnRef(rawOrderId);
  let orderInfo = req.body.orderInfo || ('Thanh toan cho ma GD:' + orderId);
  let amount = req.body.amount;
  let bankCode = req.body.bankCode;
  let locale = req.body.language;
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  let currCode = 'VND';

  // Khai báo và khởi tạo đối tượng vnp_Params trước khi sử dụng
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode && bankCode.trim() !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  // Xử lý sắp xếp và tính chữ ký
  vnp_Params = sortObject(vnp_Params);
  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  // Trả về JSON với key "paymentUrl"
  res.json({ paymentUrl: vnpUrl });
});

router.get('/vnpay_ipn', function (req, res, next) {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];
  let orderId = vnp_Params['vnp_TxnRef'];
  let rspCode = vnp_Params['vnp_ResponseCode'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];
  vnp_Params = sortObject(vnp_Params);
  let config = require('config');
  let secretKey = config.get('vnp_HashSecret');
  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
  let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
  //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
  //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó
  let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
  let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
  if (secureHash === signed) { //kiểm tra checksum
    if (checkOrderId) {
      if (checkAmount) {
        if (paymentStatus == "0") { //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
          if (rspCode == "00") {
            //thanh cong
            //paymentStatus = '1'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
            res.status(200).json({ RspCode: '00', Message: 'Success' })
          }
          else {
            //that bai
            //paymentStatus = '2'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
            res.status(200).json({ RspCode: '00', Message: 'Success' })
          }
        }
        else {
          res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' })
        }
      }
      else {
        res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
      }
    }
    else {
      res.status(200).json({ RspCode: '01', Message: 'Order not found' })
    }
  }
  else {
    res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
  }
});
router.post('/querydr', function (req, res, next) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();
  let config = require('config');
  let crypto = require("crypto");
  let vnp_TmnCode = config.get('vnp_TmnCode');
  let secretKey = config.get('vnp_HashSecret');
  let vnp_Api = config.get('vnp_Api');
  let vnp_TxnRef = req.body.orderId;
  let vnp_TransactionDate = req.body.transDate;
  let vnp_RequestId = moment(date).format('HHmmss');
  let vnp_Version = '2.1.0';
  let vnp_Command = 'querydr';
  let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;
  let vnp_IpAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  let currCode = 'VND';
  let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

  let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;

  let hmac = crypto.createHmac("sha512", secretKey);
  let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");

  let dataObj = {
    'vnp_RequestId': vnp_RequestId,
    'vnp_Version': vnp_Version,
    'vnp_Command': vnp_Command,
    'vnp_TmnCode': vnp_TmnCode,
    'vnp_TxnRef': vnp_TxnRef,
    'vnp_OrderInfo': vnp_OrderInfo,
    'vnp_TransactionDate': vnp_TransactionDate,
    'vnp_CreateDate': vnp_CreateDate,
    'vnp_IpAddr': vnp_IpAddr,
    'vnp_SecureHash': vnp_SecureHash
  };
  // /merchant_webapi/api/transaction
  request({
    url: vnp_Api,
    method: "POST",
    json: true,
    body: dataObj
  }, function (error, response, body) {
    console.log(response);
  });

});

router.post('/refund', function (req, res, next) {

  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();

  let config = require('config');
  let crypto = require("crypto");

  let vnp_TmnCode = config.get('vnp_TmnCode');
  let secretKey = config.get('vnp_HashSecret');
  let vnp_Api = config.get('vnp_Api');

  let vnp_TxnRef = req.body.orderId;
  let vnp_TransactionDate = req.body.transDate;
  let vnp_Amount = req.body.amount * 100;
  let vnp_TransactionType = req.body.transType;
  let vnp_CreateBy = req.body.user;

  let currCode = 'VND';

  let vnp_RequestId = moment(date).format('HHmmss');
  let vnp_Version = '2.1.0';
  let vnp_Command = 'refund';
  let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

  let vnp_IpAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;


  let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

  let vnp_TransactionNo = '0';

  let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
  let hmac = crypto.createHmac("sha512", secretKey);
  let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");

  let dataObj = {
    'vnp_RequestId': vnp_RequestId,
    'vnp_Version': vnp_Version,
    'vnp_Command': vnp_Command,
    'vnp_TmnCode': vnp_TmnCode,
    'vnp_TransactionType': vnp_TransactionType,
    'vnp_TxnRef': vnp_TxnRef,
    'vnp_Amount': vnp_Amount,
    'vnp_TransactionNo': vnp_TransactionNo,
    'vnp_CreateBy': vnp_CreateBy,
    'vnp_OrderInfo': vnp_OrderInfo,
    'vnp_TransactionDate': vnp_TransactionDate,
    'vnp_CreateDate': vnp_CreateDate,
    'vnp_IpAddr': vnp_IpAddr,
    'vnp_SecureHash': vnp_SecureHash
  };

  request({
    url: vnp_Api,
    method: "POST",
    json: true,
    body: dataObj
  }, function (error, response, body) {
    console.log(response);
  });

});

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = router;