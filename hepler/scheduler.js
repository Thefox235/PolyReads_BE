// scheduler.js
const cron = require('node-cron');
const moment = require('moment-timezone');

const Order = require('../mongo/order.model');
const Payment = require('../mongo/payment.model');
const Coupon = require('../mongo/coupon.model');

// Job tự động hủy đơn hàng đã hết hạn (với đơn hàng là pending)
cron.schedule('0 */10 * * * *', async () => {
  try {
    const oneDayAgo = moment.tz('Asia/Ho_Chi_Minh').subtract(1, 'day').toDate();
    console.log(`Kiểm tra đơn hàng pending từ lúc: ${oneDayAgo}`);

    const ordersToCancel = await Order.find({
      payment_status: 'pending',
      payment_method: { $ne: 'cash' },
      date: { $lte: oneDayAgo }
    });

    if (ordersToCancel.length > 0) {
      console.log(`Tìm thấy ${ordersToCancel.length} đơn hàng cần hủy.`);
      for (const order of ordersToCancel) {
        order.payment_status = 'failed';
        order.status = -1;
        await order.save();
        console.log(`Đã hủy đơn hàng ${order._id}: payment_status => 'failed', status => -1.`);
  
        if (order.paymentId) {
          await Payment.findByIdAndUpdate(order.paymentId, { status: 'failed' });
          console.log(`Đã cập nhật trạng thái Payment ${order.paymentId} thành 'failed'.`);
        }
      }
    } else {
      console.log('Không có đơn hàng cần hủy lúc này.');
    }
  } catch (err) {
    console.error('Lỗi khi tự động hủy đơn hàng:', err);
  }
});

// Job 1: Tự động hủy coupon khi hết hạn (vô hiệu hóa coupon)
cron.schedule('0 */10 * * * *', async () => {
  try {
    const now = moment.tz('Asia/Ho_Chi_Minh').toDate();
    console.log(`Kiểm tra coupon hết hạn tại lúc: ${now}`);

    // Tìm các coupon đang active mà đã hết hạn
    const expiredCoupons = await Coupon.find({
      isActive: true,
      validUntil: { $lt: now }
    });

    if (expiredCoupons.length > 0) {
      console.log(`Tìm thấy ${expiredCoupons.length} coupon hết hạn.`);
      for (const coupon of expiredCoupons) {
        coupon.isActive = false;
        await coupon.save();
        console.log(`Đã vô hiệu hóa coupon ${coupon.code}`);
      }
    } else {
      console.log("Không có coupon hết hạn tại thời điểm này.");
    }
  } catch (err) {
    console.error("Lỗi khi cập nhật coupon hết hạn:", err);
  }
});

// Job 2: Tự động kích hoạt coupon khi đến ngày kích hoạt
cron.schedule('0 */10 * * * *', async () => {
  try {
    const now = moment.tz('Asia/Ho_Chi_Minh').toDate();
    console.log(`Kiểm tra kích hoạt coupon tại lúc: ${now}`);

    // Tìm các coupon có validFrom đến rồi (<= now) nhưng vẫn đang inactive và chưa hết hạn (validUntil > now)
    const couponsToActivate = await Coupon.find({
      isActive: false,
      validFrom: { $lte: now },
      validUntil: { $gt: now }
    });

    if (couponsToActivate.length > 0) {
      console.log(`Tìm thấy ${couponsToActivate.length} coupon cần kích hoạt.`);
      for (const coupon of couponsToActivate) {
        coupon.isActive = true;
        await coupon.save();
        console.log(`Đã kích hoạt coupon ${coupon.code}`);
      }
    } else {
      console.log("Không có coupon nào cần kích hoạt tại thời điểm này.");
    }
  } catch (err) {
    console.error("Lỗi khi kích hoạt coupon:", err);
  }
});
