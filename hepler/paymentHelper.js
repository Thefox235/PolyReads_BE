// paymentHelper.js

const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const querystring = require("querystring");
const qs = require('qs');
// Khai báo trực tiếp các hằng số của VNPay
const VNP_TMN_CODE = "5IVE3QI3";
const VNP_HASH_SECRET = "0MXMLPKKEZ9PV9ERLZEBZ25FGPF4OEEE";
const VNP_PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_API = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
const VNP_RETURN_URL = "https://poly-reads.vercel.app/paymentResult";

// Khai báo trực tiếp cấu hình của ZaloPay
const zalopayConfig = {
  app_id: '2553', // App ID của ZaloPay
  key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL', // Key 1 (nếu cần)
  key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',   // Hash secret cho việc tính MAC
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create'  // Endpoint sandbox của ZaloPay
};

// Hàm chuyển đổi Mongo ObjectId sang định dạng VNPay TxnRef (phải toàn số)
// Hàm tạo mã giao dịch cho ZaloPay (ví dụ: "230503_123456")
const generateAppTransId = () => {
  const datePart = moment().format('YYMMDD');
  const randomPart = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `${datePart}_${randomPart}`;
};

// Hàm tính MAC cho ZaloPay dựa trên payload
const generateZaloPayMac = (payload) => {
  // Sắp xếp các key của payload theo thứ tự alphabet
  const sortedKeys = Object.keys(payload).sort();
  // Tạo chuỗi query từ các key đã sort: key1=value1&key2=value2&...
  const data = sortedKeys.map(key => `${key}=${payload[key]}`).join('&');
  // Sử dụng key2 của ZaloPay làm secret key
  return crypto.createHmac('sha256', zalopayConfig.key2)
               .update(data)
               .digest('hex');
};

// Hàm gọi API của ZaloPay để tạo giao dịch thanh toán
const callZaloPayAPI = async (payload) => {
  try {
    const response = await axios.post(
      zalopayConfig.endpoint,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error calling ZaloPay API:", error);
    throw error;
  }
};

// Hàm gọi API của VNPay để tạo giao dịch thanh toán
const callVNPayAPI = async (payload) => {
  try {
    const response = await axios.post(
      VNP_API,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error calling VNPay API:", error);
    throw error;
  }
};

// Hàm sắp xếp các tham số theo thứ tự từ điển
function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

function fixIpAddress(ip) {
  // Nếu IP bắt đầu với "::ffff:" (IPv6 ánh xạ IPv4), hãy lấy phần sau "::ffff:"
  if (ip.startsWith("::ffff:")) {
    return ip.split("::ffff:")[1];
  }
  // Nếu IP là "::1" (IPv6 loopback), chuyển thành "127.0.0.1"
  if (ip === "::1") {
    return "127.0.0.1";
  }
  return ip;
}
// Hàm chuyển đổi ObjectId (có thể là đối tượng hoặc chuỗi) thành chuỗi số hợp lệ cho VNPay
function convertMongoIdToVnpTxnRef(mongoId) {
  const idStr = mongoId.toString();
  // Lấy 8 ký tự cuối và chuyển chúng từ hex sang số thập phân
  return parseInt(idStr.slice(-8), 16).toString();
}

// Hàm tạo URL thanh toán VNPay giống hệt như trong router '/create-vnpay'
function createVNPayPaymentURL(order, req) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');
  
  // Lấy địa chỉ IP từ request, giống như trong code router
  const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const ipAddr = fixIpAddress(rawIp);
  
  let tmnCode = VNP_TMN_CODE;
  let secretKey = VNP_HASH_SECRET;
  let vnpUrl = VNP_PAY_URL;
  let returnUrl = VNP_RETURN_URL;
  
  // Lấy các giá trị cần thiết từ đơn hàng và tiêu chí từ request
  let rawOrderId = order._id;
  let orderId = convertMongoIdToVnpTxnRef(rawOrderId);
  let orderInfo = `Thanh toan cho ma GD:${orderId}`;
  let amount = order.total;
  let bankCode = req.body.bankCode;
  let locale = req.body.language;
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  let currCode = 'VND';
  
  // Khởi tạo đối tượng vnp_Params theo mẫu của VNPay
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
  
  // Sắp xếp các tham số để đảm bảo thứ tự nhất quán
  vnp_Params = sortObject(vnp_Params);
  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
  console.log({ tmnCode, secretKey, vnpUrl, returnUrl });
  return vnpUrl;
}



module.exports = {
  generateAppTransId,
  generateZaloPayMac,
  callZaloPayAPI,
  callVNPayAPI,
  createVNPayPaymentURL
};