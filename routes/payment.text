let express = require('express');
let router = express.Router();
// const request = require('request');
const moment = require('moment');
const paymentController = require('../mongo/controller.model');
const Payment = require('../mongo/payment.model');
const bodyParser = require('body-parser');
const qs = require('qs');
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');

let VNP_TMN_CODE = process.env.vnp_TmnCode || "5IVE3QI3";
let VNP_HASH_SECRET = process.env.vnp_HashSecret || "4E27C80SH223IRY4LDTGZN11I0AUP3M3";
let VNP_PAY_URL = process.env.vnp_Url || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
let VNP_API = process.env.vnp_Api || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
let VNP_RETURN_URL = process.env.vnp_ReturnUrl || "https://poly-reads.vercel.app/vnpay_return";

// Cấu hình ứng dụng (sandbox)
const config = {
  app_id: '2553', // Số app_id dạng chuỗi hoặc số (ở đây sẽ chuyển về số khi gửi payload)
  key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
  key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
};

router.use(bodyParser.json());

// --- Endpoint tạo đơn hàng (Payment) ---
router.post('/zalopay/payment', async (req, res) => {
  // Sử dụng giá trị FE truyền vào hoặc dùng mặc định nếu không có:
  const appUser = req.body.appUser || 'user123';
  const amount = req.body.amount || 50000;
  const orderInfo = req.body.orderInfo || `Test thanh toán đơn hàng tài Shop`;

  // Embed_data chứa cách chuyển hướng sau khi thanh toán thành công.
  // FE không cần biết các chi tiết này, backend xử lý theo cấu hình cho sẵn:
  const embed_data = {
    redirecturl: 'https://poly-reads.vercel.app/paymentResult?paymentMethod=zalopay', 
    blacklistedBins: [],
    whiteListedBins: []  
  };

  // Nếu có danh sách sản phẩm cụ thể FE có thể truyền, nếu không dùng mảng rỗng:
  const items = req.body.items || [];

  // Tạo mã giao dịch ngẫu nhiên theo định dạng "YYMMDD_XXXXXX"
  const transID = Math.floor(Math.random() * 1000000);
  const appTransId = `${moment().format('YYMMDD')}_${transID}`;

  // Sử dụng Date.now() để lấy thời gian giao dịch (mili giây)
  const appTime = Date.now();

  // Xây dựng payload cho đơn hàng
  const order = {
    app_id: config.app_id, // giữ nguyên giá trị từ cấu hình
    app_trans_id: appTransId,
    app_user: appUser,
    app_time: appTime,
    amount: amount,
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    callback_url: 'https://b074-1-53-37-194.ngrok-free.app/callback',
    description: orderInfo + ` - ${transID}`,
    bank_code: '',
    // version: "2.0.0" (nếu API yêu cầu, bạn có thể thêm ở đây)
  };

  // Tạo chuỗi dữ liệu theo thứ tự: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
  const data =
    config.app_id + '|' +
    order.app_trans_id + '|' +
    order.app_user + '|' +
    order.amount + '|' +
    order.app_time + '|' +
    order.embed_data + '|' +
    order.item;

  // Tính MAC với key1 sử dụng HMAC SHA256
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  console.log("Order Payload:", order);

  try {
    const result = await axios.post(config.endpoint, null, { params: order });
    // Trả kết quả từ ZaloPay về cho FE
    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// --- Endpoint callback (ZaloPay sẽ call đến sau khi giao dịch thành công) ---
router.post('/zalopay/callback', (req, res) => {
  // Log dữ liệu callback từ ZaloPay
  console.log("ZaloPay callback data received:", req.body);
  
  let result = {};
  try {
    const dataStr = req.body.data;
    const reqMac = req.body.mac;
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log('Calculated MAC:', mac);

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = 'MAC không khớp';
    } else {
      const dataJson = JSON.parse(dataStr);
      console.log("Cập nhật trạng thái thành công cho đơn hàng, app_trans_id:", dataJson.app_trans_id);
      result.return_code = 1;
      result.return_message = 'success';
    }
  } catch (ex) {
    console.error('Lỗi callback:', ex.message);
    result.return_code = 0;
    result.return_message = ex.message;
  }
  
  // In log kết quả trả về từ callback trước khi gửi đáp lại cho ZaloPay
  console.log("Response from callback endpoint:", result);
  res.json(result);
});

// --- Endpoint kiểm tra trạng thái đơn hàng ---
router.post('/zalopay/check-status-order', async (req, res) => {
  const { app_trans_id } = req.body;

  let postData = {
    app_id: config.app_id,
    app_trans_id: app_trans_id,
  };

  // Tạo chuỗi dữ liệu: app_id|app_trans_id|key1
  const data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1;
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  let postConfig = {
    method: 'post',
    url: 'https://sb-openapi.zalopay.vn/v2/query',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify(postData),
  };

  try {
    const result = await axios(postConfig);
    console.log("Query result:", result.data);
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Error in check-status-order:', error);
    return res.status(500).json({ error: error.message });
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
  let secretKey = VNP_HASH_SECRET;
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

  try {

  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');

  let ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress;

  let config = require('config');
  let tmnCode = VNP_TMN_CODE;
  let secretKey = VNP_HASH_SECRET;
  let vnpUrl = VNP_PAY_URL;
  let vnpApi = VNP_API;
  let returnUrl = VNP_RETURN_URL;

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
  console.log({ tmnCode, secretKey, vnpUrl, returnUrl });
  res.json({ paymentUrl: vnpUrl });
}
catch (error) {
  console.error("Error in VNPay route:", error);
  res.status(500).json({ message: "Error creating VNPay URL" }); // Trả về 
}
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
  let secretKey = VNP_HASH_SECRET;
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
  let vnp_TmnCode = VNP_TMN_CODE;
  let secretKey = VNP_HASH_SECRET;
  let vnp_Api = VNP_API;
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

  let vnp_TmnCode = VNP_TMN_CODE;
  let secretKey = VNP_HASH_SECRET;
  let vnp_Api = VNP_API;

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